import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import prisma from "../../lib/prisma";
import { MemoryService } from "../memories/memory.service";
import { readApiUsage } from "../../middlewares/usageTracker";

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
    const allowedOrganizations = req.dashboardUser?.organizationIds || [];
    const where = organizationId
        ? { organizationId: { in: allowedOrganizations.filter((id) => id === organizationId) } }
        : { organizationId: { in: allowedOrganizations } };

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

export const getProjectDashboardSummaryHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;

    if (!projectId) {
        throw new ApiError(400, "projectId parameter is required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { id: true, name: true }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    // The dashboard used to make four independent requests every few seconds.
    // Keep this aggregation in one round-trip and run the independent database
    // reads concurrently so the UI can refresh without creating request bursts.
    const [memoryStats, typeBreakdown, activeUsers, tokenEstimate, apiKeys, memories] = await Promise.all([
        prisma.memory.groupBy({
            by: ["status"],
            where: { projectId },
            _count: { id: true }
        }),
        prisma.memory.groupBy({
            by: ["type"],
            where: { projectId, status: "ACTIVE" },
            _count: { id: true }
        }),
        prisma.memory.findMany({
            where: { projectId, status: "ACTIVE" },
            select: { externalUserId: true },
            distinct: ["externalUserId"]
        }),
        prisma.$queryRaw<Array<{ tokens: number | null }>>`
            SELECT COALESCE(SUM(CEIL(char_length("content") / 4.0)), 0)::int AS "tokens"
            FROM "memories"
            WHERE "projectId" = ${projectId} AND "status" = 'ACTIVE'
        `,
        prisma.apiKey.findMany({
            where: { projectId, revokedAt: null },
            select: {
                id: true,
                name: true,
                prefix: true,
                lastUsedAt: true,
                createdAt: true,
                expiresAt: true
            },
            orderBy: { createdAt: "desc" }
        }),
        prisma.memory.findMany({
            where: { projectId, status: "ACTIVE" },
            include: { versions: { orderBy: { createdAt: "desc" } } },
            orderBy: { createdAt: "desc" },
            take: 100
        })
    ]);

    const countForStatus = (status: string) => memoryStats.find((entry) => entry.status === status)?._count.id ?? 0;

    return res.status(200).json(new ApiResponse(200, "Dashboard summary fetched successfully", {
        project,
        metrics: {
            projectId,
            projectName: project.name,
            totalMemories: countForStatus("ACTIVE"),
            activeMemories: countForStatus("ACTIVE"),
            supersededMemories: countForStatus("SUPERSEDED"),
            archivedMemories: countForStatus("ARCHIVED"),
            activeUsers: activeUsers.length,
            ingestedTokens: tokenEstimate[0]?.tokens ?? 0,
            // Search latency and cache telemetry are not persisted yet. Returning
            // null makes the UI show an honest "not instrumented" state.
            p95LatencyMs: null,
            cacheHitRatePercent: null,
            totalActiveApiKeys: apiKeys.length,
            memoriesByType: typeBreakdown.map((entry) => ({ type: entry.type, count: entry._count.id }))
        },
        apiKeys,
        memories
    }));
});

export const getProjectUsageHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const requestedDays = Number(req.query.days || 30);
    const days = Number.isFinite(requestedDays) ? Math.min(Math.max(Math.floor(requestedDays), 1), 90) : 30;

    if (!projectId) throw new ApiError(400, "projectId parameter is required.");

    const apiKeys = await prisma.apiKey.findMany({
        where: { projectId, revokedAt: null },
        select: { id: true }
    });

    const usage = await readApiUsage(apiKeys.map((key) => key.id), days);
    return res.status(200).json(new ApiResponse(200, "API usage fetched successfully", {
        projectId,
        days,
        ...usage
    }));
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

export const deleteProjectMemoryHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const memoryId = Array.isArray(req.params.memoryId) ? req.params.memoryId[0] : req.params.memoryId;

    if (!projectId || !memoryId) {
        throw new ApiError(400, "projectId and memoryId are required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    const deleted = await memoryService.deleteMemory(memoryId, project.organizationId, projectId);
    return res.status(200).json(new ApiResponse(200, "Memory deleted successfully", deleted));
});

export const exportProjectUserMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (!projectId || !userId) {
        throw new ApiError(400, "projectId and userId are required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    const memories = await memoryService.exportUserMemories(project.organizationId, projectId, userId);
    return res.status(200).json(new ApiResponse(200, "User memories exported successfully", {
        userId,
        count: memories.length,
        memories
    }));
});

export const deleteProjectUserMemoriesHandler = asyncHandler(async (req: Request, res: Response) => {
    const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
    const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId;

    if (!projectId || !userId) {
        throw new ApiError(400, "projectId and userId are required.");
    }

    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { organizationId: true }
    });

    if (!project) {
        throw new ApiError(404, `Project with ID '${projectId}' not found.`);
    }

    const result = await memoryService.deleteUserMemories(project.organizationId, projectId, userId);
    return res.status(200).json(new ApiResponse(200, "User memories deleted successfully", {
        userId,
        deletedCount: result.count
    }));
});
