import OpenAI from "openai";
import envConfig from "../../config/envConfig";

export interface IEmbeddingProvider {
    generateEmbedding(text: string): Promise<number[]>;
    generateEmbeddings(texts: string[]): Promise<number[][]>;
    readonly dimension: number;
}

export class OpenAIEmbeddingProvider implements IEmbeddingProvider {
    private client: OpenAI;
    private model: string;
    public readonly dimension = 1536;

    constructor() {
        this.client = new OpenAI({
            apiKey: envConfig.OPENAI_API_KEY || "dummy-key",
            baseURL: envConfig.OPENAI_BASE_URL || undefined,
        });
        this.model = envConfig.DEFAULT_EMBEDDING_MODEL || "text-embedding-3-small";
    }

    async generateEmbedding(text: string): Promise<number[]> {
        const embeddings = await this.generateEmbeddings([text]);
        return embeddings[0] || [];
    }

    async generateEmbeddings(texts: string[]): Promise<number[][]> {
        if (!texts.length) return [];

        // If no OpenAI key is configured, fallback to deterministic pseudo-embeddings for testing
        if (!envConfig.OPENAI_API_KEY || envConfig.OPENAI_API_KEY.startsWith("dummy")) {
            return texts.map(text => this.mockEmbedding(text));
        }

        const response = await this.client.embeddings.create({
            model: this.model,
            input: texts.map(t => t.replace(/\n/g, " ")),
            encoding_format: "float",
        });

        return response.data.map(item => item.embedding);
    }

    // Deterministic fallback embedding for dev/testing without active OpenAI key
    private mockEmbedding(text: string): number[] {
        const vector = new Array(this.dimension).fill(0);
        let hash = 0;
        for (let i = 0; i < text.length; i++) {
            hash = (hash << 5) - hash + text.charCodeAt(i);
            hash |= 0;
        }
        for (let i = 0; i < this.dimension; i++) {
            const seed = hash + i * 31;
            vector[i] = (Math.sin(seed) * 10000) % 1;
        }
        // Normalize vector to unit length
        const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0)) || 1;
        return vector.map(v => v / norm);
    }
}

let providerInstance: IEmbeddingProvider | null = null;

export function getEmbeddingProvider(): IEmbeddingProvider {
    if (!providerInstance) {
        providerInstance = new OpenAIEmbeddingProvider();
    }
    return providerInstance;
}
