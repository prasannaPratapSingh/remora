import type {
    AddMemoryOptions,
    ContextOptions,
    ContextResult,
    IngestAsyncResult,
    IngestOptions,
    IngestSyncResult,
    Memory,
    RankedMemory,
    RemoraClientConfig,
    SearchOptions
} from "./types";

export class RemoraClient {
    private apiKey: string;
    private baseUrl: string;

    constructor(config: RemoraClientConfig) {
        if (!config.apiKey) {
            throw new Error("RemoraClient: apiKey is required.");
        }
        this.apiKey = config.apiKey;
        this.baseUrl = (config.baseUrl || "http://localhost:3000").replace(/\/$/, "");
    }

    private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${this.apiKey}`,
            ...(options.headers as Record<string, string> || {})
        };

        const res = await fetch(url, {
            ...options,
            headers
        });

        const json = await res.json() as any;

        if (!res.ok || json.success === false) {
            const message = json.message || `Remora API Error: HTTP ${res.status}`;
            throw new Error(message);
        }

        return json.data as T;
    }

    /**
     * Store a durable memory for an end user
     */
    async add(options: AddMemoryOptions): Promise<Memory> {
        return this.request<Memory>("/v1/memories", {
            method: "POST",
            body: JSON.stringify({
                user_id: options.userId,
                content: options.content,
                namespace: options.namespace,
                type: options.type,
                importance: options.importance,
                confidence: options.confidence,
                metadata: options.metadata
            })
        });
    }

    /**
     * Search memories with semantic similarity & hybrid ranking
     */
    async search(options: SearchOptions): Promise<RankedMemory[]> {
        return this.request<RankedMemory[]>("/v1/memories/search", {
            method: "POST",
            body: JSON.stringify({
                user_id: options.userId,
                query: options.query,
                namespace: options.namespace,
                limit: options.limit
            })
        });
    }

    /**
     * Retrieve prompt-ready formatted context text to inject directly into an LLM
     */
    async context(options: ContextOptions): Promise<ContextResult> {
        return this.request<ContextResult>("/v1/memories/context", {
            method: "POST",
            body: JSON.stringify({
                user_id: options.userId,
                query: options.query,
                namespace: options.namespace,
                limit: options.limit
            })
        });
    }

    /**
     * Ingest conversation messages (extracts, dedupes, resolves conflicts)
     */
    async ingest(options: IngestOptions): Promise<IngestSyncResult | IngestAsyncResult> {
        return this.request<IngestSyncResult | IngestAsyncResult>("/v1/memories/ingest", {
            method: "POST",
            body: JSON.stringify({
                user_id: options.userId,
                messages: options.messages,
                namespace: options.namespace,
                sync: options.sync ?? false
            })
        });
    }

    /**
     * Get single memory by ID
     */
    async get(memoryId: string): Promise<Memory> {
        return this.request<Memory>(`/v1/memories/${encodeURIComponent(memoryId)}`);
    }

    /**
     * Update an existing memory
     */
    async update(memoryId: string, updates: Partial<Pick<Memory, "content" | "importance" | "confidence" | "type" | "status">>): Promise<Memory> {
        return this.request<Memory>(`/v1/memories/${encodeURIComponent(memoryId)}`, {
            method: "PATCH",
            body: JSON.stringify(updates)
        });
    }

    /**
     * Delete memory (soft-delete)
     */
    async delete(memoryId: string): Promise<Memory> {
        return this.request<Memory>(`/v1/memories/${encodeURIComponent(memoryId)}`, {
            method: "DELETE"
        });
    }

    /**
     * List memories with optional filtering
     */
    async list(options: { userId?: string; namespace?: string; limit?: number; offset?: number } = {}): Promise<{ memories: Memory[]; total: number }> {
        const queryParams = new URLSearchParams();
        if (options.userId) queryParams.set("user_id", options.userId);
        if (options.namespace) queryParams.set("namespace", options.namespace);
        if (options.limit) queryParams.set("limit", String(options.limit));
        if (options.offset) queryParams.set("offset", String(options.offset));

        const query = queryParams.toString() ? `?${queryParams.toString()}` : "";
        return this.request<{ memories: Memory[]; total: number }>(`/v1/memories${query}`);
    }
}
