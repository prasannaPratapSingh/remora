import type { Request, Response } from "express";
import asyncHandler from "../../utils/asyncHandler";
import prisma from "../../lib/prisma";

export const clerkWebhookHandler = asyncHandler(async (req: Request, res: Response) => {
    const event = req.body;
    const eventType = event?.type;

    if (!eventType) {
        return res.status(400).json({ error: "Missing event type" });
    }

    if (eventType === "user.created") {
        const clerkUser = event.data;
        const email = clerkUser.email_addresses?.[0]?.email_address;
        const name = `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || null;

        if (email) {
            // Upsert User
            const user = await prisma.user.upsert({
                where: { email },
                update: {
                    clerkId: clerkUser.id,
                    name
                },
                create: {
                    email,
                    clerkId: clerkUser.id,
                    name
                }
            });

            // Automatically provision a default organization and project
            const existingOrg = await prisma.organization.findFirst({
                where: { ownerId: user.id }
            });

            if (!existingOrg) {
                const org = await prisma.organization.create({
                    data: {
                        name: "Personal Workspace",
                        slug: `org-${user.id.slice(-6)}`,
                        ownerId: user.id
                    }
                });

                await prisma.project.create({
                    data: {
                        organizationId: org.id,
                        name: "Default Project",
                        slug: "default"
                    }
                });
            }
        }
    } else if (eventType === "user.updated") {
        const clerkUser = event.data;
        const email = clerkUser.email_addresses?.[0]?.email_address;
        const name = `${clerkUser.first_name || ""} ${clerkUser.last_name || ""}`.trim() || null;

        if (email) {
            await prisma.user.updateMany({
                where: { clerkId: clerkUser.id },
                data: { email, name }
            });
        }
    }

    return res.status(200).json({ received: true });
});
