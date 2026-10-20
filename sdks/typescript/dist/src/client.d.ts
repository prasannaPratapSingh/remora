import type { AddMemoryOptions, ContextOptions, ContextResult, IngestAsyncResult, IngestOptions, IngestSyncResult, Memory, RankedMemory, RemoraClientConfig, SearchOptions } from "./types";
export declare class RemoraClient {
    private apiKey;
    private baseUrl;
    constructor(config: RemoraClientConfig);
    private request;
    /**
     * Store a durable memory for an end user
     */
    add(options: AddMemoryOptions): Promise<Memory>;
    /**
     * Search memories with semantic similarity & hybrid ranking
     */
    search(options: SearchOptions): Promise<RankedMemory[]>;
    /**
     * Retrieve prompt-ready formatted context text to inject directly into an LLM
     */
    context(options: ContextOptions): Promise<ContextResult>;
    /**
     * Ingest conversation messages (extracts, dedupes, resolves conflicts)
     */
    ingest(options: IngestOptions): Promise<IngestSyncResult | IngestAsyncResult>;
    /**
     * Get single memory by ID
     */
    get(memoryId: string): Promise<Memory>;
    /**
     * Update an existing memory
     */
    update(memoryId: string, updates: Partial<Pick<Memory, "content" | "importance" | "confidence" | "type" | "status">>): Promise<Memory>;
    /**
     * Delete memory (soft-delete)
     */
    delete(memoryId: string): Promise<Memory>;
    /**
     * List memories with optional filtering
     */
    list(options?: {
        userId?: string;
        namespace?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        memories: Memory[];
        total: number;
    }>;
}
