import crypto from "crypto";
import { MemoryRepository, type CreateMemoryParams } from "./memory.repository";
import { getEmbeddingProvider, type IEmbeddingProvider } from "../embeddings/embedding.provider";
import { getMemoryExtractor, type MemoryExtractor } from "../llm/extractor";
import { HybridRanker, type RankedMemoryResult } from "../ranking/hybridRanker";
import type { Memory, MemoryStatus, MemoryType } from "@prisma/client";
import ApiError from "../../utils/ApiError";
import { cacheGet, cacheSet } from "../../lib/redis";

export class MemoryService {
    private repo: MemoryRepository;
    private embeddingProvider: IEmbeddingProvider;
    private extractor: MemoryExtractor;

    constructor() {
        this.repo = new MemoryRepository();
        this.embeddingProvider = getEmbeddingProvider();
        this.extractor = getMemoryExtractor();
    }

    /**
     * Create a single memory with embedding and deduplication check
     */
    async createMemory(params: {
        organizationId: string;
        projectId: string;
        externalUserId: string;
        content: string;
        namespace?: string;
        type?: MemoryType;
        importance?: number;
        confidence?: number;
        metadata?: Record<string, unknown>;
    }): Promise<Memory> {
        const namespace = params.namespace || "default";
        const embedding = await this.embeddingProvider.generateEmbedding(params.content);

        // Check for near-identical duplicate (> 0.93 similarity)
        const candidates = await this.repo.searchSimilar({
            organizationId: params.organizationId,
            projectId: params.projectId,
            externalUserId: params.externalUserId,
            embedding,
            namespace,
            limit: 1
        });

        const topCandidate = candidates[0];
        if (topCandidate && topCandidate.similarity > 0.93) {
            // Deduplicate: update existing memory's confidence and recency instead of duplicating
            const updated = await this.repo.update({
                id: topCandidate.id,
                organizationId: params.organizationId,
                projectId: params.projectId,
                confidence: Math.min(1.0, topCandidate.confidence + 0.05),
                changeReason: "DEDUPLICATED_REINFORCEMENT"
            });
            if (updated) return updated;
        }

        const id = `mem_${crypto.randomUUID().replace(/-/g, "")}`;
        return this.repo.create({
            id,
            organizationId: params.organizationId,
            projectId: params.projectId,
            externalUserId: params.externalUserId,
            namespace,
            content: params.content,
            embedding,
            type: params.type || "FACT",
            importance: params.importance ?? 0.5,
            confidence: params.confidence ?? 1.0,
            metadata: params.metadata,
        });
    }

    /**
     * Search memories with semantic similarity + hybrid ranking (PRD Section 14, 15, 35)
     */
    async searchMemories(params: {
        organizationId: string;
        projectId: string;
        externalUserId: string;
        query: string;
        namespace?: string;
        limit?: number;
    }): Promise<RankedMemoryResult[]> {
        const limit = params.limit || 5;
        const queryEmbedding = await this.embeddingProvider.generateEmbedding(params.query);

        // Retrieve top candidates via vector search
        const rawResults = await this.repo.searchSimilar({
            organizationId: params.organizationId,
            projectId: params.projectId,
            externalUserId: params.externalUserId,
            embedding: queryEmbedding,
            namespace: params.namespace,
            limit: Math.max(limit * 2, 10), // Over-fetch for hybrid re-ranking
        });

        if (!rawResults.length) {
            return [];
        }

        // Apply hybrid scoring: 0.55*sim + 0.20*imp + 0.15*conf + 0.10*recency
        const ranked = HybridRanker.rank(rawResults);
        const topResults = ranked.slice(0, limit);

        // Update last accessed time for retrieved memories
        this.repo.updateLastAccessed(topResults.map(r => r.id)).catch(err => {
            console.error("Failed to update lastAccessedAt:", err);
        });

        return topResults;
    }

    /**
     * Generate compact prompt context for application LLMs (PRD Section 22, 28, 40)
     */
    async getContext(params: {
        organizationId: string;
        projectId: string;
        externalUserId: string;
        query: string;
        namespace?: string;
        limit?: number;
    }): Promise<{ contextText: string; memories: RankedMemoryResult[] }> {
        const queryHash = crypto.createHash("md5").update(params.query.trim().toLowerCase()).digest("hex");
        const cacheKey = `remora:context:${params.projectId}:${params.externalUserId}:${params.namespace || "default"}:${queryHash}`;

        const cached = await cacheGet<{ contextText: string; memories: RankedMemoryResult[] }>(cacheKey);
        if (cached) {
            return cached;
        }

        const memories = await this.searchMemories({
            ...params,
            limit: params.limit || 5
        });

        if (!memories.length) {
            return {
                contextText: "",
                memories: []
            };
        }

        const lines = memories.map(m => `- ${m.content}`);
        const contextText = `Relevant user memories:\n${lines.join("\n")}\nUse these memories only when relevant.`;
        const result = { contextText, memories };

        // Cache hot context for 60 seconds (PRD §28)
        cacheSet(cacheKey, result, 60).catch(() => {});

        return result;
    }

    /**
     * Automatically extract, deduplicate, and resolve conflicts from conversation (PRD Section 11, 12, 19)
     */
    async ingestConversation(params: {
        organizationId: string;
        projectId: string;
        externalUserId: string;
        messages: Array<{ role: string; content: string }>;
        namespace?: string;
    }): Promise<{ ingested: number; memories: Memory[] }> {
        const namespace = params.namespace || "default";
        const candidates = await this.extractor.extract(params.messages);

        if (!candidates.length) {
            return { ingested: 0, memories: [] };
        }

        const results: Memory[] = [];

        for (const candidate of candidates) {
            const embedding = await this.embeddingProvider.generateEmbedding(candidate.content);

            // Find top similar existing memory
            const matches = await this.repo.searchSimilar({
                organizationId: params.organizationId,
                projectId: params.projectId,
                externalUserId: params.externalUserId,
                embedding,
                namespace,
                limit: 1
            });

            const topMatch = matches[0];

            if (topMatch && topMatch.similarity > 0.70) {
                // Check conflict / update resolution
                const decision = await this.extractor.resolveConflict(topMatch.content, candidate.content);

                if (decision.action === "IDENTICAL") {
                    // Reinforce confidence
                    const reinforced = await this.repo.update({
                        id: topMatch.id,
                        organizationId: params.organizationId,
                        projectId: params.projectId,
                        confidence: Math.min(1.0, topMatch.confidence + 0.05),
                        changeReason: "IDENTICAL_REINFORCEMENT"
                    });
                    if (reinforced) results.push(reinforced);
                    continue;
                }

                if (decision.action === "CONFLICT" || decision.action === "UPDATE") {
                    // Mark old as SUPERSEDED and create new ACTIVE with link
                    await this.repo.update({
                        id: topMatch.id,
                        organizationId: params.organizationId,
                        projectId: params.projectId,
                        status: "SUPERSEDED",
                        changeReason: `SUPERSEDED_BY_NEW: ${decision.reason}`
                    });
                }
            }

            // Create new memory
            const id = `mem_${crypto.randomUUID().replace(/-/g, "")}`;
            const created = await this.repo.create({
                id,
                organizationId: params.organizationId,
                projectId: params.projectId,
                externalUserId: params.externalUserId,
                namespace,
                content: candidate.content,
                embedding,
                type: candidate.type,
                importance: candidate.importance,
                confidence: candidate.confidence,
                sourceType: "conversation"
            });

            results.push(created);
        }

        return {
            ingested: results.length,
            memories: results
        };
    }

    async getMemory(id: string, organizationId: string, projectId: string): Promise<Memory> {
        const memory = await this.repo.findById(id, organizationId, projectId);
        if (!memory) {
            throw new ApiError(404, `Memory with ID '${id}' not found.`);
        }
        return memory;
    }

    async updateMemory(params: {
        id: string;
        organizationId: string;
        projectId: string;
        content?: string;
        importance?: number;
        confidence?: number;
        type?: MemoryType;
        status?: MemoryStatus;
    }): Promise<Memory> {
        let embedding: number[] | undefined;
        if (params.content) {
            embedding = await this.embeddingProvider.generateEmbedding(params.content);
        }

        const updated = await this.repo.update({
            ...params,
            embedding,
            changeReason: "MANUAL_UPDATE"
        });

        if (!updated) {
            throw new ApiError(404, `Memory with ID '${params.id}' not found.`);
        }

        return updated;
    }

    async deleteMemory(id: string, organizationId: string, projectId: string): Promise<Memory> {
        const deleted = await this.repo.softDelete(id, organizationId, projectId);
        if (!deleted) {
            throw new ApiError(404, `Memory with ID '${id}' not found.`);
        }
        return deleted;
    }

    async listMemories(params: {
        organizationId: string;
        projectId: string;
        externalUserId?: string;
        namespace?: string;
        type?: MemoryType;
        status?: MemoryStatus;
        limit?: number;
        offset?: number;
    }) {
        return this.repo.list(params);
    }

    async deleteUserMemories(organizationId: string, projectId: string, externalUserId: string) {
        return this.repo.deleteAllForUser(organizationId, projectId, externalUserId);
    }

    async exportUserMemories(organizationId: string, projectId: string, externalUserId: string) {
        return this.repo.exportAllForUser(organizationId, projectId, externalUserId);
    }
}
