import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import prisma from "../../lib/prisma";
import { generateApiKey } from "./apiKey.utils";

export const createApiKeyHandler = asyncHandler(async (req: Request, res: Response) => {
    const { projectId, name, isLive } = req.body;

    if (!projectId || !name) {
        throw new ApiError(400, "projectId and name are required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    const { rawKey, keyHash, prefix } = generateApiKey(isLive !== false);

    const apiKey = await prisma.apiKey.create({
        data: {
            projectId,
            name,
            prefix,
            keyHash,
        }
    });

    // Return the secret key ONLY once upon creation
    return res.status(201).json(
        new ApiResponse(201, "API key generated successfully. Store it safely as it cannot be retrieved again.", {
            id: apiKey.id,
            name: apiKey.name,
            prefix: apiKey.prefix,
            apiKey: rawKey,
            createdAt: apiKey.createdAt
        })
    );
});

export const listApiKeysHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

    if (!projectId) {
        throw new ApiError(400, "projectId parameter is required.");
    }

    const keys = await prisma.apiKey.findMany({
        where: {
            projectId,
            revokedAt: null
        },
        select: {
            id: true,
            name: true,
            prefix: true,
            lastUsedAt: true,
            createdAt: true,
            expiresAt: true
        },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json(new ApiResponse(200, "API keys fetched successfully", keys));
});

export const revokeApiKeyHandler = asyncHandler(async (req: Request, res: Response) => {
    const keyId = Array.isArray(req.params.keyId) ? req.params.keyId[0] : req.params.keyId;

    if (!keyId) {
        throw new ApiError(400, "keyId parameter is required.");
    }

    const apiKey = await prisma.apiKey.update({
        where: { id: keyId },
        data: { revokedAt: new Date() }
    });

    return res.status(200).json(new ApiResponse(200, "API key revoked successfully", apiKey));
});
