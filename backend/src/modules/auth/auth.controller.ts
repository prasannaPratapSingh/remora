import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import ApiResponse from "../../utils/ApiResponse";
import ApiError from "../../utils/ApiError";
import prisma from "../../lib/prisma";
import { clerkClient, getAuth } from "@clerk/express";

export const syncUserHandler = asyncHandler(async (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (!auth.userId) {
        throw new ApiError(401, "Authenticated Clerk session is required.");
    }

    const clerkUser = await clerkClient.users.getUser(auth.userId);
    const clerkId = clerkUser.id;
    const email = clerkUser.primaryEmailAddress?.emailAddress;
    const name = clerkUser.fullName || clerkUser.firstName || clerkUser.username || undefined;

    if (!email) {
        throw new ApiError(400, "email is required to sync user.");
    }

    // 1. Upsert User in PostgreSQL
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            clerkId: clerkId || undefined,
            name: name || undefined
        },
        create: {
            email,
            clerkId: clerkId || `clerk_${Date.now()}`,
            name: name || email.split("@")[0] || "Developer"
        }
    });

    // 2. Find or create Organization
    let org = await prisma.organization.findFirst({
        where: { ownerId: user.id }
    });

    if (!org) {
        const orgSlug = `org-${user.id.slice(-6)}-${Math.random().toString(36).substring(2, 6)}`;
        org = await prisma.organization.create({
            data: {
                name: name ? `${name}'s Workspace` : "Personal Workspace",
                slug: orgSlug,
                ownerId: user.id
            }
        });
    }

    // 3. Find or create default Project
    let project = await prisma.project.findFirst({
        where: { organizationId: org.id }
    });

    if (!project) {
        project = await prisma.project.create({
            data: {
                organizationId: org.id,
                name: "Default Project",
                slug: "default"
            }
        });
    }

    // Fetch all projects for this organization
    const projects = await prisma.project.findMany({
        where: { organizationId: org.id },
        orderBy: { createdAt: "desc" }
    });

    return res.status(200).json(
        new ApiResponse(200, "User synced successfully", {
            user,
            organization: org,
            project,
            projects
        })
    );
});
