import crypto from "crypto";

export interface GeneratedApiKey {
    rawKey: string;
    keyHash: string;
    prefix: string;
}

export function generateApiKey(isLive = true): GeneratedApiKey {
    const prefixType = isLive ? "rl_live" : "rl_test";
    const randomHex = crypto.randomBytes(24).toString("hex");
    const rawKey = `${prefixType}_${randomHex}`;
    const prefix = rawKey.slice(0, 15);
    const keyHash = hashApiKey(rawKey);

    return {
        rawKey,
        keyHash,
        prefix
    };
}

export function hashApiKey(rawKey: string): string {
    return crypto.createHash("sha256").update(rawKey.trim()).digest("hex");
}
