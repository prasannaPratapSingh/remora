import type { MemoryType } from "@prisma/client";

export interface RankableMemory {
    id: string;
    content: string;
    type: MemoryType;
    similarity: number; // 0.0 to 1.0 (from 1 - cosine_distance)
    importance: number; // 0.0 to 1.0
    confidence: number; // 0.0 to 1.0
    createdAt: Date;
    lastAccessedAt?: Date | null;
}

export interface RankedMemoryResult extends RankableMemory {
    finalScore: number;
    scoreBreakdown: {
        semanticSimilarity: number;
        importance: number;
        confidence: number;
        recency: number;
    };
}

export class HybridRanker {
    private static readonly WEIGHT_SIMILARITY = 0.55;
    private static readonly WEIGHT_IMPORTANCE = 0.20;
    private static readonly WEIGHT_CONFIDENCE = 0.15;
    private static readonly WEIGHT_RECENCY = 0.10;

    /**
     * Compute exponential recency decay based on days elapsed.
     * Different memory types decay at different rates.
     */
    public static computeRecencyScore(createdAt: Date, lastAccessedAt: Date | null | undefined, type: MemoryType): number {
        const referenceTime = lastAccessedAt ? lastAccessedAt.getTime() : createdAt.getTime();
        const ageInDays = Math.max(0, (Date.now() - referenceTime) / (1000 * 60 * 60 * 24));

        let lambda = 0.05; // Standard decay

        switch (type) {
            case "FACT":
            case "PROFILE":
                lambda = 0.005; // Very slow decay for permanent facts
                break;
            case "PREFERENCE":
            case "GOAL":
                lambda = 0.02; // Moderate decay
                break;
            case "TEMPORARY":
                lambda = 0.20; // Fast decay for temporary items
                break;
            default:
                lambda = 0.05;
        }

        return Math.exp(-lambda * ageInDays);
    }

    /**
     * Calculate hybrid score and sort memories descending by score.
     */
    public static rank(memories: RankableMemory[]): RankedMemoryResult[] {
        return memories
            .map(mem => {
                const recency = this.computeRecencyScore(mem.createdAt, mem.lastAccessedAt, mem.type);
                const similarity = Math.max(0, Math.min(1, mem.similarity));
                const importance = Math.max(0, Math.min(1, mem.importance));
                const confidence = Math.max(0, Math.min(1, mem.confidence));

                const finalScore =
                    this.WEIGHT_SIMILARITY * similarity +
                    this.WEIGHT_IMPORTANCE * importance +
                    this.WEIGHT_CONFIDENCE * confidence +
                    this.WEIGHT_RECENCY * recency;

                return {
                    ...mem,
                    finalScore: Math.round(finalScore * 10000) / 10000,
                    scoreBreakdown: {
                        semanticSimilarity: Math.round(similarity * 10000) / 10000,
                        importance: Math.round(importance * 10000) / 10000,
                        confidence: Math.round(confidence * 10000) / 10000,
                        recency: Math.round(recency * 10000) / 10000,
                    }
                };
            })
            .sort((a, b) => b.finalScore - a.finalScore);
    }
}
