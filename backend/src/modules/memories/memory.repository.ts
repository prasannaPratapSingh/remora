import prisma from "../../lib/prisma";
import type { Memory, MemoryStatus, MemoryType, Prisma } from "@prisma/client";

export interface CreateMemoryParams {
    id: string;
    organizationId: string;
    projectId: string;
    externalUserId: string;
    namespace?: string;
    content: string;
    embedding: number[];
    type?: MemoryType;
    status?: MemoryStatus;
    importance?: number;
    confidence?: number;
    sourceType?: string;
    sourceId?: string;
    metadata?: Record<string, unknown>;
    expiresAt?: Date | null;
}

export interface VectorSearchResult {
    id: string;
    organizationId: string;
    projectId: string;
    externalUserId: string;
    namespace: string;
    content: string;
    type: MemoryType;
    status: MemoryStatus;
    importance: number;
    confidence: number;
    sourceType: string | null;
    sourceId: string | null;
    metadata: Record<string, unknown> | null;
    lastAccessedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    similarity: number;
}

const VALID_MEMORY_TYPES = new Set([
    "FACT", "PREFERENCE", "GOAL", "INSTRUCTION", "DECISION",
    "PROFILE", "PROJECT_CONTEXT", "OTHER", "RELATIONSHIP", "BEHAVIOR", "TEMPORARY"
]);

export function normalizeMemoryType(type?: any): MemoryType {
    if (!type) return "FACT";
    const upper = String(type).toUpperCase().trim();
    if (VALID_MEMORY_TYPES.has(upper)) return upper as MemoryType;
    if (upper === "SEMANTIC") return "PREFERENCE";
    if (upper === "EPISODIC") return "PROJECT_CONTEXT";
    if (upper === "PROCEDURAL") return "INSTRUCTION";
    return "FACT";
}

export class MemoryRepository {
    /**
     * Create memory with pgvector embedding
     */
    async create(data: CreateMemoryParams): Promise<Memory> {
        const namespace = data.namespace || "default";
        const type = normalizeMemoryType(data.type);
        const status = data.status || "ACTIVE";
        const importance = data.importance ?? 0.5;
        const confidence = data.confidence ?? 1.0;
        const vectorString = `[${data.embedding.join(",")}]`;
        const metadataJson = data.metadata ? JSON.stringify(data.metadata) : null;
        const now = new Date();

        await prisma.$executeRaw`
            INSERT INTO "memories" (
                "id",
                "organizationId",
                "projectId",
                "externalUserId",
                "namespace",
                "content",
                "embedding",
                "type",
                "status",
                "importance",
                "confidence",
                "sourceType",
                "sourceId",
                "metadata",
                "expiresAt",
                "lastAccessedAt",
                "createdAt",
                "updatedAt"
            ) VALUES (
                ${data.id},
                ${data.organizationId},
                ${data.projectId},
                ${data.externalUserId},
                ${namespace},
                ${data.content},
                ${vectorString}::vector,
                ${type}::"MemoryType",
                ${status}::"MemoryStatus",
                ${importance},
                ${confidence},
                ${data.sourceType ?? null},
                ${data.sourceId ?? null},
                ${metadataJson}::jsonb,
                ${data.expiresAt ?? null},
                ${now},
                ${now},
                ${now}
            )
        `;

        return (await prisma.memory.findUniqueOrThrow({
            where: { id: data.id }
        }));
    }

    /**
     * Vector search with strict tenant scoping (PRD Section 25)
     */
    async searchSimilar(params: {
        organizationId: string;
        projectId: string;
        externalUserId: string;
        embedding: number[];
        namespace?: string;
        limit?: number;
    }): Promise<VectorSearchResult[]> {
        const vectorString = `[${params.embedding.join(",")}]`;
        const limit = params.limit || 10;
        const namespace = params.namespace || null;

        const results = await prisma.$queryRaw<VectorSearchResult[]>`
            SELECT 
                "id",
                "organizationId",
                "projectId",
                "externalUserId",
                "namespace",
                "content",
                "type",
                "status",
                "importance",
                "confidence",
                "sourceType",
                "sourceId",
                "metadata",
                "lastAccessedAt",
                "createdAt",
                "updatedAt",
                (1 - ("embedding" <=> ${vectorString}::vector)) AS "similarity"
            FROM "memories"
            WHERE "organizationId" = ${params.organizationId}
              AND "projectId" = ${params.projectId}
              AND "externalUserId" = ${params.externalUserId}
              AND "status" = 'ACTIVE'
              AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
              AND (${namespace}::text IS NULL OR "namespace" = ${namespace})
            ORDER BY "embedding" <=> ${vectorString}::vector ASC
            LIMIT ${limit};
        `;

        return results;
    }

    /**
     * Update access timestamp on multiple memories
     */
    async updateLastAccessed(ids: string[]): Promise<void> {
        if (!ids.length) return;
        await prisma.memory.updateMany({
            where: { id: { in: ids } },
            data: { lastAccessedAt: new Date() }
        });
    }

    /**
     * Get memory by ID strictly scoped to tenant
     */
    async findById(id: string, organizationId: string, projectId: string) {
        return prisma.memory.findFirst({
            where: {
                id,
                organizationId,
                projectId
            },
            include: {
                versions: {
                    orderBy: { createdAt: "desc" }
                }
            }
        });
    }

    /**
     * Update memory content or status with version logging
     */
    async update(params: {
        id: string;
        organizationId: string;
        projectId: string;
        content?: string;
        embedding?: number[];
        importance?: number;
        confidence?: number;
        type?: MemoryType;
        status?: MemoryStatus;
        changeReason?: string;
    }) {
        const existing = await this.findById(params.id, params.organizationId, params.projectId);
        if (!existing) return null;

        return prisma.$transaction(async (tx) => {
            // Log version if content changed
            if (params.content && params.content !== existing.content) {
                await tx.memoryVersion.create({
                    data: {
                        memoryId: existing.id,
                        content: params.content,
                        previousContent: existing.content,
                        changeReason: params.changeReason || "UPDATED"
                    }
                });
            }

            // Update memory record
            const updated = await tx.memory.update({
                where: { id: existing.id },
                data: {
                    content: params.content ?? existing.content,
                    importance: params.importance ?? existing.importance,
                    confidence: params.confidence ?? existing.confidence,
                    type: params.type ? normalizeMemoryType(params.type) : existing.type,
                    status: params.status ?? existing.status,
                    updatedAt: new Date()
                }
            });

            // Update embedding if provided
            if (params.embedding) {
                const vectorString = `[${params.embedding.join(",")}]`;
                await tx.$executeRaw`
                    UPDATE "memories"
                    SET "embedding" = ${vectorString}::vector
                    WHERE "id" = ${existing.id}
                `;
            }

            return updated;
        });
    }

    /**
     * Soft delete memory (mark as DELETED)
     */
    async softDelete(id: string, organizationId: string, projectId: string) {
        const existing = await this.findById(id, organizationId, projectId);
        if (!existing) return null;

        return prisma.memory.update({
            where: { id },
            data: {
                status: "DELETED",
                updatedAt: new Date()
            }
        });
    }

    /**
     * List memories with tenant scoping, pagination, and optional filters
     */
    async list(params: {
        organizationId: string;
        projectId: string;
        externalUserId?: string;
        namespace?: string;
        type?: MemoryType;
        status?: MemoryStatus;
        limit?: number;
        offset?: number;
    }) {
        const where: Prisma.MemoryWhereInput = {
            organizationId: params.organizationId,
            projectId: params.projectId,
            ...(params.externalUserId && { externalUserId: params.externalUserId }),
            ...(params.namespace && { namespace: params.namespace }),
            ...(params.type && { type: params.type }),
            status: params.status || "ACTIVE"
        };

        const [memories, total] = await Promise.all([
            prisma.memory.findMany({
                where,
                take: params.limit || 20,
                skip: params.offset || 0,
                orderBy: { createdAt: "desc" }
            }),
            prisma.memory.count({ where })
        ]);

        return { memories, total };
    }

    /**
     * GDPR / Privacy: Delete all memories belonging to an external user (PRD §4.4, §36)
     */
    async deleteAllForUser(organizationId: string, projectId: string, externalUserId: string) {
        const memories = await prisma.memory.findMany({
            where: { organizationId, projectId, externalUserId },
            select: { id: true }
        });

        if (memories.length === 0) return { count: 0 };

        return prisma.$transaction(async (tx) => {
            await tx.memoryVersion.deleteMany({
                where: { memoryId: { in: memories.map((memory) => memory.id) } }
            });

            return tx.memory.deleteMany({
                where: {
                    organizationId,
                    projectId,
                    externalUserId
                }
            });
        });
    }

    /**
     * Export all memories for an external user (PRD §36)
     */
    async exportAllForUser(organizationId: string, projectId: string, externalUserId: string) {
        return prisma.memory.findMany({
            where: {
                organizationId,
                projectId,
                externalUserId,
                status: { not: "DELETED" }
            },
            include: {
                versions: {
                    orderBy: { createdAt: "desc" }
                }
            },
            orderBy: { createdAt: "desc" }
        });
    }
}
