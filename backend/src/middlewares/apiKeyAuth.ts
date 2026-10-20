import type { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import ApiError from "../utils/ApiError";
import { hashApiKey } from "../modules/apiKeys/apiKey.utils";
import "../types/tenant";

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;
        const xApiKeyHeader = req.headers["x-api-key"];

        let rawKey: string | undefined;

        if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
            rawKey = authHeader.slice(7).trim();
        } else if (typeof xApiKeyHeader === "string") {
            rawKey = xApiKeyHeader.trim();
        }

        if (!rawKey) {
            return next(new ApiError(401, "Unauthorized: Missing API key. Provide via 'Authorization: Bearer <key>' or 'x-api-key' header."));
        }

        const keyHash = hashApiKey(rawKey);

        const apiKey = await prisma.apiKey.findUnique({
            where: { keyHash },
            include: {
                project: {
                    select: {
                        id: true,
                        organizationId: true
                    }
                }
            }
        });

        if (!apiKey) {
            return next(new ApiError(401, "Unauthorized: Invalid API key."));
        }

        if (apiKey.revokedAt) {
            return next(new ApiError(401, "Unauthorized: API key has been revoked."));
        }

        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            return next(new ApiError(401, "Unauthorized: API key has expired."));
        }

        req.tenant = {
            organizationId: apiKey.project.organizationId,
            projectId: apiKey.projectId,
            apiKeyId: apiKey.id
        };

        // Asynchronously update lastUsedAt without slowing down request
        prisma.apiKey.update({
            where: { id: apiKey.id },
            data: { lastUsedAt: new Date() }
        }).catch((err) => {
            console.error("Failed to update apiKey lastUsedAt:", err);
        });

        next();
    } catch (error) {
        next(error);
    }
}
