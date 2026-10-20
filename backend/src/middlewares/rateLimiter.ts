import type { Request, Response, NextFunction } from "express";
import { getRedisClient, isRedisConnected } from "../lib/redis";
import ApiError from "../utils/ApiError";

export interface RateLimitOptions {
    windowSeconds?: number;
    maxRequests?: number;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
    const windowSeconds = options.windowSeconds || 60;
    const maxRequests = options.maxRequests || 120; // Default 120 req/min

    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Identifier is apiKeyId if authenticated, or client IP
            const identifier = req.tenant?.apiKeyId || req.ip || "global";
            const now = Math.floor(Date.now() / 1000);
            const currentWindow = Math.floor(now / windowSeconds);
            const redisKey = `remora:ratelimit:${identifier}:${currentWindow}`;

            // If Redis is offline, fail-open to prevent breaking legitimate traffic
            if (!isRedisConnected()) {
                res.setHeader("X-RateLimit-Limit", maxRequests);
                res.setHeader("X-RateLimit-Remaining", maxRequests);
                return next();
            }

            const client = getRedisClient();
            const currentCount = await client.incr(redisKey);

            if (currentCount === 1) {
                // Set expiry on first request in window
                await client.expire(redisKey, windowSeconds);
            }

            const remaining = Math.max(0, maxRequests - currentCount);
            const resetTime = (currentWindow + 1) * windowSeconds;

            res.setHeader("X-RateLimit-Limit", maxRequests);
            res.setHeader("X-RateLimit-Remaining", remaining);
            res.setHeader("X-RateLimit-Reset", resetTime);

            if (currentCount > maxRequests) {
                const retryAfter = resetTime - now;
                res.setHeader("Retry-After", retryAfter);
                return next(new ApiError(429, `Rate limit exceeded. Try again in ${retryAfter} seconds.`));
            }

            next();
        } catch (err) {
            // Soft fail on rate limiting error (fail-open)
            console.warn("Rate limiter error, proceeding:", err);
            next();
        }
    };
}
