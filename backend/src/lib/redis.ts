import Redis from "ioredis";
import envConfig from "../config/envConfig";

let redisClient: Redis | null = null;
let isRedisAvailable = false;

export function getRedisClient(): Redis {
    if (!redisClient) {
        const isTls = envConfig.REDIS_URL.startsWith("rediss://");
        redisClient = new Redis(envConfig.REDIS_URL, {
            maxRetriesPerRequest: null,
            enableReadyCheck: false,
            lazyConnect: true,
            tls: isTls ? { rejectUnauthorized: false } : undefined,
            retryStrategy(times) {
                // Exponential backoff, max 5s
                return Math.min(times * 200, 5000);
            }
        });

        redisClient.on("connect", () => {
            isRedisAvailable = true;
            console.log("Redis connected successfully.");
        });

        redisClient.on("ready", () => {
            isRedisAvailable = true;
        });

        redisClient.on("error", (err) => {
            isRedisAvailable = false;
            // Silent warn rather than crashing if Redis is offline
            if (process.env.NODE_ENV !== "test") {
                console.warn("[Redis Warn]:", err.message);
            }
        });

        redisClient.on("close", () => {
            isRedisAvailable = false;
        });

        // Try initial connection in background
        redisClient.connect().catch(() => {
            isRedisAvailable = false;
        });
    }

    return redisClient;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
    try {
        if (!isRedisAvailable && redisClient?.status !== "ready") return null;
        const client = getRedisClient();
        const data = await client.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
    } catch {
        return null;
    }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    try {
        if (!isRedisAvailable && redisClient?.status !== "ready") return;
        const client = getRedisClient();
        const serialized = JSON.stringify(value);
        if (ttlSeconds > 0) {
            await client.set(key, serialized, "EX", ttlSeconds);
        } else {
            await client.set(key, serialized);
        }
    } catch {
        // Soft fail
    }
}

export async function cacheDel(key: string): Promise<void> {
    try {
        if (!isRedisAvailable && redisClient?.status !== "ready") return;
        const client = getRedisClient();
        await client.del(key);
    } catch {
        // Soft fail
    }
}

export function isRedisConnected(): boolean {
    return isRedisAvailable;
}
