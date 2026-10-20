export type MemoryType =
    | "FACT"
    | "PREFERENCE"
    | "GOAL"
    | "INSTRUCTION"
    | "DECISION"
    | "PROFILE"
    | "RELATIONSHIP"
    | "PROJECT_CONTEXT"
    | "BEHAVIOR"
    | "TEMPORARY"
    | "OTHER";

export type MemoryStatus =
    | "ACTIVE"
    | "SUPERSEDED"
    | "ARCHIVED"
    | "DELETED"
    | "EXPIRED";

export interface Memory {
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
    lastAccessedAt: string | null;
    createdAt: string;
    updatedAt: string;
    metadata?: Record<string, unknown>;
}

export interface RankedMemory extends Memory {
    finalScore: number;
    scoreBreakdown: {
        semanticSimilarity: number;
        importance: number;
        confidence: number;
        recency: number;
    };
}

export interface AddMemoryOptions {
    userId: string;
    content: string;
    namespace?: string;
    type?: MemoryType;
    importance?: number;
    confidence?: number;
    metadata?: Record<string, unknown>;
}

export interface SearchOptions {
    userId: string;
    query: string;
    namespace?: string;
    limit?: number;
}

export interface ContextOptions {
    userId: string;
    query: string;
    namespace?: string;
    limit?: number;
}

export interface ContextResult {
    contextText: string;
    memories: RankedMemory[];
}

export interface ChatMessage {
    role: "user" | "assistant" | "system" | string;
    content: string;
}

export interface IngestOptions {
    userId: string;
    messages: ChatMessage[];
    namespace?: string;
    sync?: boolean;
}

export interface IngestSyncResult {
    ingested: number;
    memories: Memory[];
}

export interface IngestAsyncResult {
    jobId: string;
    status: "queued";
}

export interface RemoraClientConfig {
    apiKey: string;
    baseUrl?: string;
}
