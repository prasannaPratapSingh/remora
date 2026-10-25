import type { Request, Response, NextFunction } from "express";
import { getRedisClient, isRedisConnected } from "../lib/redis";
import "../types/tenant";

const USAGE_RETENTION_SECONDS = 60 * 60 * 24 * 90;

function usageKey(apiKeyId: string, date: string) {
    return `remora:usage:${apiKeyId}:${date}`;
}

export function trackApiUsage(req: Request, res: Response, next: NextFunction) {
    const startedAt = performance.now();
    res.once("finish", () => {
        const apiKeyId = req.tenant?.apiKeyId;
        if (!apiKeyId || !isRedisConnected()) return;

        const date = new Date().toISOString().slice(0, 10);
        const key = usageKey(apiKeyId, date);
        const endpoint = `${req.method} ${req.baseUrl}${req.route?.path || req.path}`.slice(0, 160);
        const latencyMs = Math.max(0, Math.round(performance.now() - startedAt));
        const client = getRedisClient();

        void client.multi()
            .hincrby(key, "requests", 1)
            .hincrby(key, "totalLatencyMs", latencyMs)
            .hincrby(key, res.statusCode >= 400 ? "errors" : "successes", 1)
            .hincrby(key, `endpoint:${endpoint}:requests`, 1)
            .hincrby(key, `status:${res.statusCode}:requests`, 1)
            .expire(key, USAGE_RETENTION_SECONDS)
            .exec()
            .catch((error) => {
                if (process.env.NODE_ENV !== "test") {
                    console.warn("API usage tracking failed:", error);
                }
            });
    });

    next();
}

export async function readApiUsage(apiKeyIds: string[], days = 30) {
    if (!isRedisConnected() || apiKeyIds.length === 0) {
        return { days: [], endpoints: {}, statusCodes: {}, totals: { requests: 0, successes: 0, errors: 0, totalLatencyMs: 0 } };
    }

    const client = getRedisClient();
    const today = new Date();
    const keys: string[] = [];
    for (let offset = 0; offset < Math.min(days, 90); offset += 1) {
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - offset);
        const dateString = date.toISOString().slice(0, 10);
        for (const apiKeyId of apiKeyIds) keys.push(usageKey(apiKeyId, dateString));
    }

    const values = await Promise.all(keys.map((key) => client.hgetall(key)));
    const byDate = new Map<string, { requests: number; successes: number; errors: number; totalLatencyMs: number }>();
    const endpoints: Record<string, number> = {};
    const statusCodes: Record<string, number> = {};
    const totals = { requests: 0, successes: 0, errors: 0, totalLatencyMs: 0 };

    values.forEach((value, index) => {
        const dateIndex = Math.floor(index / apiKeyIds.length);
        const date = new Date(today);
        date.setUTCDate(today.getUTCDate() - dateIndex);
        const dateString = date.toISOString().slice(0, 10);
        const day = byDate.get(dateString) || { requests: 0, successes: 0, errors: 0, totalLatencyMs: 0 };
        day.requests += Number(value.requests || 0);
        day.successes += Number(value.successes || 0);
        day.errors += Number(value.errors || 0);
        day.totalLatencyMs += Number(value.totalLatencyMs || 0);
        byDate.set(dateString, day);
        totals.requests += Number(value.requests || 0);
        totals.successes += Number(value.successes || 0);
        totals.errors += Number(value.errors || 0);
        totals.totalLatencyMs += Number(value.totalLatencyMs || 0);

        for (const [field, rawCount] of Object.entries(value)) {
            if (field.startsWith("endpoint:") && field.endsWith(":requests")) {
                const endpoint = field.slice("endpoint:".length, -":requests".length);
                endpoints[endpoint] = (endpoints[endpoint] || 0) + Number(rawCount || 0);
            }
            if (field.startsWith("status:") && field.endsWith(":requests")) {
                const status = field.slice("status:".length, -":requests".length);
                statusCodes[status] = (statusCodes[status] || 0) + Number(rawCount || 0);
            }
        }
    });

    return {
        days: Array.from(byDate.entries()).map(([date, metrics]) => ({ date, ...metrics })),
        endpoints,
        statusCodes,
        totals,
    };
}
