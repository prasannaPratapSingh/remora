import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    DIRECT_URL: string;
    OPENAI_API_KEY?: string;
    OPENAI_BASE_URL?: string;
    DEFAULT_EMBEDDING_MODEL: string;
    DEFAULT_LLM_MODEL: string;
    REDIS_URL: string;
    CORS_ORIGINS: string[];
    CLERK_SECRET_KEY?: string;
    REQUIRE_REDIS_FOR_RATE_LIMITS: boolean;
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
}

function computeRedisUrl(): string {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        try {
            const host = new URL(process.env.UPSTASH_REDIS_REST_URL).hostname;
            return `rediss://default:${process.env.UPSTASH_REDIS_REST_TOKEN}@${host}:6379`;
        } catch {
            // fallback
        }
    }
    return "redis://127.0.0.1:6379";
}

const envConfig: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    DEFAULT_EMBEDDING_MODEL: process.env.DEFAULT_EMBEDDING_MODEL || "text-embedding-3-small",
    DEFAULT_LLM_MODEL: process.env.DEFAULT_LLM_MODEL || "gpt-4o-mini",
    REDIS_URL: computeRedisUrl(),
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000")
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean),
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    REQUIRE_REDIS_FOR_RATE_LIMITS: process.env.REQUIRE_REDIS_FOR_RATE_LIMITS === "true" || process.env.NODE_ENV === "production",
};

export function validateProductionConfig() {
    if (envConfig.NODE_ENV !== "production") return;

    const missing: string[] = [];
    if (!envConfig.DATABASE_URL) missing.push("DATABASE_URL");
    if (!envConfig.DIRECT_URL) missing.push("DIRECT_URL");
    if (!envConfig.REDIS_URL) missing.push("REDIS_URL");
    if (!envConfig.CLERK_SECRET_KEY) missing.push("CLERK_SECRET_KEY");

    if (missing.length > 0) {
        throw new Error(`Production configuration is incomplete: ${missing.join(", ")}`);
    }
}

export default envConfig;
