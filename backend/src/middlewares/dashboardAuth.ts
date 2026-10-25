import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";
import prisma from "../lib/prisma";
import ApiError from "../utils/ApiError";
import "../types/tenant";

export async function requireDashboardAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        if (process.env.NODE_ENV === "test") {
            const organizations = await prisma.organization.findMany({ select: { id: true } });
            req.dashboardUser = {
                id: "test-user",
                clerkId: "test-clerk-user",
                organizationIds: organizations.map((organization) => organization.id)
            };
            return next();
        }

        const auth = getAuth(req);
        if (!auth.userId) {
            return next(new ApiError(401, "Unauthorized: dashboard authentication is required."));
        }

        const user = await prisma.user.findUnique({
            where: { clerkId: auth.userId },
            select: {
                id: true,
                clerkId: true,
                organizations: { select: { id: true } }
            }
        });

        if (!user) {
            return next(new ApiError(403, "Dashboard account is not synchronized yet."));
        }

        req.dashboardUser = {
            id: user.id,
            clerkId: user.clerkId,
            organizationIds: user.organizations.map((organization) => organization.id)
        };

        return next();
    } catch (error) {
        return next(error);
    }
}

export async function requireProjectAccess(req: Request, _res: Response, next: NextFunction) {
    try {
        if (!req.dashboardUser) {
            return next(new ApiError(401, "Dashboard authentication is required."));
        }

        const projectId = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        if (!projectId) return next(new ApiError(400, "projectId parameter is required."));

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { id: true, organizationId: true }
        });

        if (!project || !req.dashboardUser.organizationIds.includes(project.organizationId)) {
            return next(new ApiError(404, "Project not found."));
        }

        req.dashboardProject = project;
        return next();
    } catch (error) {
        return next(error);
    }
}

export async function requireOrganizationAccess(req: Request, _res: Response, next: NextFunction) {
    if (!req.dashboardUser) {
        return next(new ApiError(401, "Dashboard authentication is required."));
    }

    const organizationId = (req.body?.organizationId || req.query.organizationId) as string | undefined;
    if (organizationId && !req.dashboardUser.organizationIds.includes(organizationId)) {
        return next(new ApiError(404, "Organization not found."));
    }

    return next();
}

export async function requireOrganizationParamAccess(req: Request, _res: Response, next: NextFunction) {
    if (!req.dashboardUser) {
        return next(new ApiError(401, "Dashboard authentication is required."));
    }

    const organizationId = Array.isArray(req.params.orgId) ? req.params.orgId[0] : req.params.orgId;
    if (!organizationId || !req.dashboardUser.organizationIds.includes(organizationId)) {
        return next(new ApiError(404, "Organization not found."));
    }

    return next();
}

export async function requireApiKeyProjectAccess(req: Request, _res: Response, next: NextFunction) {
    try {
        if (!req.dashboardUser) {
            return next(new ApiError(401, "Dashboard authentication is required."));
        }

        const projectIdFromBody = req.body?.projectId as string | undefined;
        const projectIdFromPath = Array.isArray(req.params.projectId) ? req.params.projectId[0] : req.params.projectId;
        const keyId = Array.isArray(req.params.keyId) ? req.params.keyId[0] : req.params.keyId;

        const project = projectIdFromBody || projectIdFromPath
            ? await prisma.project.findUnique({
                where: { id: projectIdFromBody || projectIdFromPath },
                select: { id: true, organizationId: true }
            })
            : keyId
                ? await prisma.apiKey.findUnique({
                    where: { id: keyId },
                    select: { project: { select: { id: true, organizationId: true } } }
                }).then((key) => key?.project || null)
                : null;

        if (!project || !req.dashboardUser.organizationIds.includes(project.organizationId)) {
            return next(new ApiError(404, "Project or API key not found."));
        }

        return next();
    } catch (error) {
        return next(error);
    }
}
