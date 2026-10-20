import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import prisma from "../src/lib/prisma";
import app from "../src/server";
import { generateApiKey } from "../src/modules/apiKeys/apiKey.utils";
import { RemoraClient } from "../../sdks/typescript/src/index";

describe("Remora TypeScript SDK Integration", () => {
    let testProjectId: string;
    let server: any;
    let remora: RemoraClient;

    beforeAll(async () => {
        server = app.listen(0);
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : 4001;
        const baseUrl = `http://localhost:${port}`;

        const testUser = await prisma.user.upsert({
            where: { email: "sdk-dev@remora.ai" },
            update: {},
            create: {
                email: "sdk-dev@remora.ai",
                clerkId: "clerk_sdk_dev_99",
                name: "SDK Developer"
            }
        });

        const testOrg = await prisma.organization.upsert({
            where: { slug: "sdk-org" },
            update: {},
            create: {
                name: "SDK Org",
                slug: "sdk-org",
                ownerId: testUser.id
            }
        });

        const testProject = await prisma.project.upsert({
            where: {
                organizationId_slug: {
                    organizationId: testOrg.id,
                    slug: "sdk-project"
                }
            },
            update: {},
            create: {
                organizationId: testOrg.id,
                name: "SDK Project",
                slug: "sdk-project"
            }
        });
        testProjectId = testProject.id;

        const key = generateApiKey(false);
        await prisma.apiKey.create({
            data: {
                projectId: testProjectId,
                name: "SDK Test Key",
                prefix: key.prefix,
                keyHash: key.keyHash
            }
        });

        // Initialize Remora SDK client
        remora = new RemoraClient({
            apiKey: key.rawKey,
            baseUrl
        });
    }, 30000);

    afterAll(async () => {
        await prisma.memory.deleteMany({ where: { projectId: testProjectId } });
        await prisma.apiKey.deleteMany({ where: { projectId: testProjectId } });
        if (server) server.close();
    }, 30000);

    test("remora.add() should persist a memory", async () => {
        const mem = await remora.add({
            userId: "usr_bob",
            content: "User loves dark mode and concise code snippets.",
            type: "PREFERENCE",
            importance: 0.9
        });

        expect(mem.id).toBeDefined();
        expect(mem.content).toContain("dark mode");
    });

    test("remora.search() should perform semantic hybrid search", async () => {
        const results = await remora.search({
            userId: "usr_bob",
            query: "What UI theme does Bob like?"
        });

        expect(results.length).toBeGreaterThan(0);
        expect(results[0]?.content).toContain("dark mode");
        expect(results[0]?.finalScore).toBeGreaterThan(0);
    });

    test("remora.context() should return compact prompt injection context", async () => {
        const ctx = await remora.context({
            userId: "usr_bob",
            query: "Settings recommendation"
        });

        expect(ctx.contextText).toContain("Relevant user memories:");
        expect(ctx.contextText).toContain("dark mode");
    });

    test("remora.list() should return paginated memories", async () => {
        const list = await remora.list({ userId: "usr_bob" });
        expect(list.memories.length).toBeGreaterThan(0);
        expect(list.total).toBeGreaterThan(0);
    });
});
