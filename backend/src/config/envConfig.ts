import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    PORT: number;
    DATABASE_URL: string;
    DIRECT_URL: string;
    OPENAI_API_KEY?: string;
    OPENAI_BASE_URL?: string;
    DEFAULT_EMBEDDING_MODEL: string;
    DEFAULT_LLM_MODEL: string;
    REDIS_URL: string;
}

const envConfig: EnvConfig = {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL || "",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL,
    DEFAULT_EMBEDDING_MODEL: process.env.DEFAULT_EMBEDDING_MODEL || "text-embedding-3-small",
    DEFAULT_LLM_MODEL: process.env.DEFAULT_LLM_MODEL || "gpt-4o-mini",
    REDIS_URL: process.env.REDIS_URL || "redis://127.0.0.1:6379",
};

export default envConfig;