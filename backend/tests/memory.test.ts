import { describe, expect, test, beforeAll, afterAll } from "bun:test";
import prisma from "../src/lib/prisma";
import app from "../src/server";
import { generateApiKey } from "../src/modules/apiKeys/apiKey.utils";

describe("Remora Memory Engine End-to-End API Integration", () => {
    let testOrgId: string;
    let testProjectId: string;
    let rawApiKey: string;
    let server: any;
    let baseUrl: string;

    beforeAll(async () => {
        // Start server on an ephemeral port
        server = app.listen(0);
        const address = server.address();
        const port = typeof address === "object" && address ? address.port : 4001;
        baseUrl = `http://localhost:${port}`;

        // Ensure a test user, organization, project, and API key exist in DB
        const testUser = await prisma.user.upsert({
            where: { email: "test-dev@remora.ai" },
            update: {},
            create: {
                email: "test-dev@remora.ai",
                clerkId: "clerk_test_dev_123",
                name: "Test Developer"
            }
        });

        const testOrg = await prisma.organization.upsert({
            where: { slug: "test-org" },
            update: {},
            create: {
                name: "Test Org",
                slug: "test-org",
                ownerId: testUser.id
            }
        });
        testOrgId = testOrg.id;

        const testProject = await prisma.project.upsert({
            where: {
                organizationId_slug: {
                    organizationId: testOrg.id,
                    slug: "default-project"
                }
            },
            update: {},
            create: {
                organizationId: testOrg.id,
                name: "Default Project",
                slug: "default-project"
            }
        });
        testProjectId = testProject.id;

        const key = generateApiKey(false);
        rawApiKey = key.rawKey;

        await prisma.apiKey.create({
            data: {
                projectId: testProjectId,
                name: "Test Integration Key",
                prefix: key.prefix,
                keyHash: key.keyHash
            }
        });
    });

    afterAll(async () => {
        // Clean up memories and API keys created during test
        await prisma.memory.deleteMany({
            where: { projectId: testProjectId }
        });
        await prisma.apiKey.deleteMany({
            where: { projectId: testProjectId }
        });
        if (server) {
            server.close();
        }
    });

    test("GET /health should return 200 ok", async () => {
        const res = await fetch(`${baseUrl}/health`);
        const data = await res.json() as any;
        expect(res.status).toBe(200);
        expect(data.status).toBe("ok");
    });

    test("POST /v1/memories without API key should return 401 Unauthorized", async () => {
        const res = await fetch(`${baseUrl}/v1/memories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: "usr_alice",
                content: "I like dark mode."
            })
        });
        expect(res.status).toBe(401);
    });

    test("POST /v1/memories should create a memory with pgvector embedding", async () => {
        const res = await fetch(`${baseUrl}/v1/memories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${rawApiKey}`
            },
            body: JSON.stringify({
                user_id: "usr_alice",
                content: "User strongly prefers TypeScript over JavaScript.",
                type: "PREFERENCE",
                namespace: "personal",
                importance: 0.85,
                confidence: 0.95
            })
        });

        const json = await res.json() as any;
        expect(res.status).toBe(201);
        expect(json.success).toBe(true);
        expect(json.data.content).toBe("User strongly prefers TypeScript over JavaScript.");
        expect(json.data.namespace).toBe("personal");
        expect(json.data.type).toBe("PREFERENCE");
    });

    test("POST /v1/memories/search should retrieve relevant memories via vector similarity & hybrid scoring", async () => {
        const res = await fetch(`${baseUrl}/v1/memories/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${rawApiKey}`
            },
            body: JSON.stringify({
                user_id: "usr_alice",
                query: "What programming language does the user prefer?",
                namespace: "personal",
                limit: 3
            })
        });

        const json = await res.json() as any;
        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(Array.isArray(json.data)).toBe(true);
        expect(json.data.length).toBeGreaterThan(0);
        expect(json.data[0].content).toContain("TypeScript");
        expect(json.data[0].finalScore).toBeGreaterThan(0);
        expect(json.data[0].scoreBreakdown.semanticSimilarity).toBeDefined();
    });

    test("POST /v1/memories/context should generate prompt-ready formatted text", async () => {
        const res = await fetch(`${baseUrl}/v1/memories/context`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${rawApiKey}`
            },
            body: JSON.stringify({
                user_id: "usr_alice",
                query: "Help me choose a stack",
                namespace: "personal"
            })
        });

        const json = await res.json() as any;
        expect(res.status).toBe(200);
        expect(json.data.contextText).toContain("Relevant user memories:");
        expect(json.data.contextText).toContain("TypeScript");
    });

    test("PATCH /v1/memories/:memoryId should update memory and log a MemoryVersion", async () => {
        // First list memories
        const listRes = await fetch(`${baseUrl}/v1/memories?user_id=usr_alice`, {
            headers: { "Authorization": `Bearer ${rawApiKey}` }
        });
        const listJson = await listRes.json() as any;
        const memoryId = listJson.data.memories[0].id;

        // Update content
        const updateRes = await fetch(`${baseUrl}/v1/memories/${memoryId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${rawApiKey}`
            },
            body: JSON.stringify({
                content: "User prefers Rust and TypeScript."
            })
        });

        expect(updateRes.status).toBe(200);

        // Fetch single memory with versions
        const getRes = await fetch(`${baseUrl}/v1/memories/${memoryId}`, {
            headers: { "Authorization": `Bearer ${rawApiKey}` }
        });
        const getJson = await getRes.json() as any;
        expect(getJson.data.content).toBe("User prefers Rust and TypeScript.");
        expect(getJson.data.versions.length).toBeGreaterThan(0);
        expect(getJson.data.versions[0].previousContent).toBe("User strongly prefers TypeScript over JavaScript.");
    });

    test("GET /api/projects/:projectId/metrics should return aggregated project stats", async () => {
        const res = await fetch(`${baseUrl}/api/projects/${testProjectId}/metrics`);
        const json = await res.json() as any;

        expect(res.status).toBe(200);
        expect(json.success).toBe(true);
        expect(json.data.totalMemories).toBeGreaterThan(0);
        expect(json.data.projectName).toBe("Default Project");
    });
});
