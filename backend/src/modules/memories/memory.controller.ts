import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import { MemoryService } from "./memory.service";
import { enqueueIngestionJob } from "../queue/memory.queue";
import { isRedisConnected } from "../../lib/redis";

const memoryService = new MemoryService();

export const createMemoryHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const memory = await memoryService.createMemory({
        organizationId: req.tenant.organizationId,
        projectId: req.tenant.projectId,
        externalUserId: req.body.user_id,
        content: req.body.content,
        namespace: req.body.namespace,
        type: req.body.type,
        importance: req.body.importance,
        confidence: req.body.confidence,
        metadata: req.body.metadata,
    });

    return res.status(201).json(new ApiResponse(201, "Memory created successfully", memory));
});

export const searchMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const results = await memoryService.searchMemories({
        organizationId: req.tenant.organizationId,
        projectId: req.tenant.projectId,
        externalUserId: req.body.user_id,
        query: req.body.query,
        namespace: req.body.namespace,
        limit: req.body.limit,
    });

    return res.status(200).json(new ApiResponse(200, "Search completed successfully", results));
});

export const getContextHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const result = await memoryService.getContext({
        organizationId: req.tenant.organizationId,
        projectId: req.tenant.projectId,
        externalUserId: req.body.user_id,
        query: req.body.query,
        namespace: req.body.namespace,
        limit: req.body.limit,
    });

    return res.status(200).json(new ApiResponse(200, "Context generated successfully", result));
});

export const ingestConversationHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const isSync = req.body.sync === true;

    if (!isSync && isRedisConnected()) {
        try {
            const jobId = await enqueueIngestionJob({
                organizationId: req.tenant.organizationId,
                projectId: req.tenant.projectId,
                externalUserId: req.body.user_id,
                messages: req.body.messages,
                namespace: req.body.namespace,
            });

            return res.status(202).json(
                new ApiResponse(202, "Conversation accepted and queued for memory extraction", {
                    jobId,
                    status: "queued"
                })
            );
        } catch (queueErr) {
            console.warn("Queue unavailable, falling back to synchronous execution:", queueErr);
        }
    }

    // Synchronous execution fallback or when sync: true requested
    const result = await memoryService.ingestConversation({
        organizationId: req.tenant.organizationId,
        projectId: req.tenant.projectId,
        externalUserId: req.body.user_id,
        messages: req.body.messages,
        namespace: req.body.namespace,
    });

    return res.status(200).json(new ApiResponse(200, "Ingestion processed successfully", result));
});

export const getMemoryHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const memoryId = Array.isArray(req.params.memoryId) ? req.params.memoryId[0] : req.params.memoryId;
    if (!memoryId) throw new ApiError(400, "memoryId is required");

    const memory = await memoryService.getMemory(
        memoryId,
        req.tenant.organizationId,
        req.tenant.projectId
    );

    return res.status(200).json(new ApiResponse(200, "Memory retrieved successfully", memory));
});

export const updateMemoryHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const memoryId = Array.isArray(req.params.memoryId) ? req.params.memoryId[0] : req.params.memoryId;
    if (!memoryId) throw new ApiError(400, "memoryId is required");

    const updated = await memoryService.updateMemory({
        id: memoryId,
        organizationId: req.tenant.organizationId,
        projectId: req.tenant.projectId,
        content: req.body.content,
        importance: req.body.importance,
        confidence: req.body.confidence,
        type: req.body.type,
        status: req.body.status,
    });

    return res.status(200).json(new ApiResponse(200, "Memory updated successfully", updated));
});

export const deleteMemoryHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const memoryId = Array.isArray(req.params.memoryId) ? req.params.memoryId[0] : req.params.memoryId;
    if (!memoryId) throw new ApiError(400, "memoryId is required");

    const deleted = await memoryService.deleteMemory(
        memoryId,
        req.tenant.organizationId,
        req.tenant.projectId
    );

    return res.status(200).json(new ApiResponse(200, "Memory deleted successfully", deleted));
});

export const listMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const result = await memoryService.listMemories({
        organizationId: req.tenant.organizationId,
        projectId: req.tenant.projectId,
        externalUserId: req.query.user_id as string | undefined,
        namespace: req.query.namespace as string | undefined,
        type: req.query.type as any,
        status: req.query.status as any,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
    });

    return res.status(200).json(new ApiResponse(200, "Memories fetched successfully", result));
});

export const deleteUserMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    if (!userId) throw new ApiError(400, "userId parameter is required");

    const result = await memoryService.deleteUserMemories(
        req.tenant.organizationId,
        req.tenant.projectId,
        userId
    );

    return res.status(200).json(new ApiResponse(200, `Deleted memories for user ${userId}`, result));
});

export const exportUserMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    if (!req.tenant) throw new ApiError(401, "Tenant context missing");

    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;
    if (!userId) throw new ApiError(400, "userId parameter is required");

    const memories = await memoryService.exportUserMemories(
        req.tenant.organizationId,
        req.tenant.projectId,
        userId
    );

    return res.status(200).json(new ApiResponse(200, "User memories exported successfully", {
        userId,
        count: memories.length,
        memories
    }));
});
