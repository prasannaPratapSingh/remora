import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import prisma from "../../lib/prisma";
import { MemoryService } from "../memories/memory.service";

const memoryService = new MemoryService();

export const createProjectHandler = asyncHandler(async (req: Request, res: Response) => {
    const { organizationId, name, slug } = req.body;

    if (!organizationId || !name || !slug) {
        throw new ApiError(400, "organizationId, name, and slug are required.");
    }

    const org = await prisma.organization.findUnique({
        where: { id: organizationId }
    });

    if (!org) {
        throw new ApiError(404, `Organization with ID '${organizationId}' not found.`);
    }

    const project = await prisma.project.create({
        data: {
            organizationId,
            name,
            slug: slug.toLowerCase().trim()
        }
    });

    return res.status(201).json(new ApiResponse(201, "Project created successfully", project));
});

export const listProjectsHandler = asyncHandler(async (req: Request, res: Response) => {
    const organizationId = req.query.organizationId as string;
    const where = organizationId ? { organizationId } : {};

    const projects = await prisma.project.findMany({
        where,
        include: {
            _count: {
                select: {
                    memories: true,
                    apiKeys: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json(new ApiResponse(200, "Projects fetched successfully", projects));
});

export const getProjectMetricsHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

    if (!projectId) {
        throw new ApiError(400, "projectId parameter is required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    const [
        totalMemories,
        activeMemories,
        supersededMemories,
        archivedMemories,
        typeBreakdown,
        totalApiKeys
    ] = await Promise.all([
        prisma.memory.count({ where: { projectId } }),
        prisma.memory.count({ where: { projectId, status: "ACTIVE" } }),
        prisma.memory.count({ where: { projectId, status: "SUPERSEDED" } }),
        prisma.memory.count({ where: { projectId, status: "ARCHIVED" } }),
        prisma.memory.groupBy({
            by: ["type"],
            where: { projectId },
            _count: { id: true }
        }),
        prisma.apiKey.count({ where: { projectId, revokedAt: null } })
    ]);

    const metrics = {
        projectId,
        projectName: project.name,
        totalMemories,
        activeMemories,
        supersededMemories,
        archivedMemories,
        totalActiveApiKeys: totalApiKeys,
        memoriesByType: typeBreakdown.map(t => ({
            type: t.type,
            count: t._count.id
        }))
    };

    return res.status(200).json(new ApiResponse(200, "Project metrics fetched successfully", metrics));
});

export const listProjectMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

    if (!projectId) {
        throw new ApiError(400, "projectId parameter is required.");
    }

    const memories = await prisma.memory.findMany({
        where: { projectId, status: "ACTIVE" },
        include: {
            versions: {
                orderBy: { createdAt: "desc" }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 100
    });

    return res.status(200).json(new ApiResponse(200, "Memories fetched successfully", memories));
});

export const createProjectMemoryHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const { externalUserId, namespace, content, type, importance, confidence } = req.body;

    if (!projectId || !externalUserId || !content) {
        throw new ApiError(400, "projectId, externalUserId, and content are required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    const memory = await memoryService.createMemory({
        organizationId: project.organizationId,
        projectId,
        externalUserId,
        content,
        namespace: namespace || "default",
        type: type || "FACT",
        importance: importance ?? 0.85,
        confidence: confidence ?? 0.95,
    });

    try {
        await prisma.memoryVersion.create({
            data: {
                memoryId: memory.id,
                content: memory.content,
                changeReason: "Initial memory creation"
            }
        });
    } catch {
        // Non-critical audit version
    }

    return res.status(201).json(new ApiResponse(201, "Memory created successfully in DB", memory));
});

export const searchProjectMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const { query, externalUserId, namespace, limit } = req.body;

    if (!projectId || !query || !externalUserId) {
        throw new ApiError(400, "projectId, query, and externalUserId are required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    const start = performance.now();
    const results = await memoryService.searchMemories({
        organizationId: project.organizationId,
        projectId,
        externalUserId,
        query,
        namespace,
        limit: limit || 10
    });
    const latencyMs = Math.round(performance.now() - start);

    return res.status(200).json(new ApiResponse(200, "Search completed successfully", {
        results,
        latencyMs,
        totalFound: results.length
    }));
});

