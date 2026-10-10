import dotenv from "dotenv";
dotenv.config();

interface EnvConfig {
    PORT: number;
    DATABASE_URL: string;
    DIRECT_URL: string;
}

const envConfig: EnvConfig = {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL || "",
    DIRECT_URL: process.env.DIRECT_URL || "",
};

export default envConfig;