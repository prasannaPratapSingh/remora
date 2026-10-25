import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import prisma from "../../lib/prisma";

export const createOrganizationHandler = asyncHandler(async (req: Request, res: Response) => {
    const { name, slug } = req.body;
    const ownerId = req.dashboardUser?.id;

    if (!name || !ownerId) {
        throw new ApiError(400, "name is required.");
    }

    const user = await prisma.user.findUnique({
        where: { id: ownerId }
    });

    if (!user) {
        throw new ApiError(404, `User with ID '${ownerId}' not found.`);
    }

    const orgSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]/g, "-")).trim();

    const existing = await prisma.organization.findUnique({
        where: { slug: orgSlug }
    });

    if (existing) {
        throw new ApiError(409, `Organization with slug '${orgSlug}' already exists.`);
    }

    const org = await prisma.organization.create({
        data: {
            name,
            slug: orgSlug,
            ownerId
        }
    });

    return res.status(201).json(new ApiResponse(201, "Organization created successfully", org));
});

export const listOrganizationsHandler = asyncHandler(async (req: Request, res: Response) => {
    const requestedOwnerId = req.query.ownerId as string | undefined;
    const ownerId = req.dashboardUser?.id;

    const where = {
        ownerId: requestedOwnerId && requestedOwnerId === ownerId ? ownerId : ownerId || "__unauthorized__"
    };

    const organizations = await prisma.organization.findMany({
        where,
        include: {
            _count: {
                select: {
                    projects: true,
                    memories: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json(new ApiResponse(200, "Organizations fetched successfully", organizations));
});

export const getOrganizationHandler = asyncHandler(async (req: Request, res: Response) => {
    const orgId = Array.isArray(req.params.orgId) ? req.params.orgId[0] : req.params.orgId;

    if (!orgId) throw new ApiError(400, "orgId is required");

    const org = await prisma.organization.findFirst({
        where: { id: orgId, ownerId: req.dashboardUser?.id },
        include: {
            projects: {
                include: {
                    _count: {
                        select: {
                            memories: true,
                            apiKeys: true
                        }
                    }
                }
            }
        }
    });

    if (!org) {
        throw new ApiError(404, `Organization with ID '${orgId}' not found.`);
    }

    return res.status(200).json(new ApiResponse(200, "Organization fetched successfully", org));
});
