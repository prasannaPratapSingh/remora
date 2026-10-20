export const openApiSpec = {
    openapi: "3.0.3",
    info: {
        title: "Remora (RecallLayer) Memory Infrastructure API",
        version: "0.1.0",
        description: "Developer-first, API-based long-term memory infrastructure layer for AI applications, agents, and copilots.",
        contact: {
            name: "Remora Team",
            url: "https://remora.ai"
        }
    },
    servers: [
        {
            url: "/",
            description: "Current Server"
        }
    ],
    components: {
        securitySchemes: {
            BearerAuth: {
                type: "http",
                scheme: "bearer",
                bearerFormat: "rl_live_...",
                description: "Enter your Remora API key (e.g. rl_live_... or rl_test_...)"
            },
            ApiKeyAuth: {
                type: "apiKey",
                in: "header",
                name: "x-api-key",
                description: "Custom header alternative for Remora API key"
            }
        },
        schemas: {
            MemoryType: {
                type: "string",
                enum: [
                    "FACT",
                    "PREFERENCE",
                    "GOAL",
                    "INSTRUCTION",
                    "DECISION",
                    "PROFILE",
                    "RELATIONSHIP",
                    "PROJECT_CONTEXT",
                    "BEHAVIOR",
                    "TEMPORARY",
                    "OTHER"
                ]
            },
            MemoryStatus: {
                type: "string",
                enum: ["ACTIVE", "SUPERSEDED", "ARCHIVED", "DELETED", "EXPIRED"]
            },
            Memory: {
                type: "object",
                properties: {
                    id: { type: "string", example: "mem_abc123" },
                    organizationId: { type: "string" },
                    projectId: { type: "string" },
                    externalUserId: { type: "string", example: "usr_alice" },
                    namespace: { type: "string", example: "default" },
                    content: { type: "string", example: "User strongly prefers TypeScript over JavaScript." },
                    type: { $ref: "#/components/schemas/MemoryType" },
                    status: { $ref: "#/components/schemas/MemoryStatus" },
                    importance: { type: "number", example: 0.85 },
                    confidence: { type: "number", example: 0.95 },
                    lastAccessedAt: { type: "string", format: "date-time" },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time" }
                }
            },
            RankedMemory: {
                allOf: [
                    { $ref: "#/components/schemas/Memory" },
                    {
                        type: "object",
                        properties: {
                            finalScore: { type: "number", example: 0.8842 },
                            scoreBreakdown: {
                                type: "object",
                                properties: {
                                    semanticSimilarity: { type: "number", example: 0.912 },
                                    importance: { type: "number", example: 0.85 },
                                    confidence: { type: "number", example: 0.95 },
                                    recency: { type: "number", example: 0.98 }
                                }
                            }
                        }
                    }
                ]
            }
        }
    },
    security: [
        { BearerAuth: [] },
        { ApiKeyAuth: [] }
    ],
    paths: {
        "/v1/memories": {
            post: {
                summary: "Create a Memory",
                description: "Manually create and embed a durable memory for an end user.",
                tags: ["Memories"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["user_id", "content"],
                                properties: {
                                    user_id: { type: "string", example: "usr_alice" },
                                    content: { type: "string", example: "User prefers dark mode and TypeScript." },
                                    namespace: { type: "string", default: "default" },
                                    type: { $ref: "#/components/schemas/MemoryType" },
                                    importance: { type: "number", minimum: 0, maximum: 1, default: 0.5 },
                                    confidence: { type: "number", minimum: 0, maximum: 1, default: 1.0 },
                                    metadata: { type: "object" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": {
                        description: "Memory created successfully"
                    }
                }
            },
            get: {
                summary: "List Memories",
                description: "Paginated list of memories filtered by user, namespace, or type.",
                tags: ["Memories"],
                parameters: [
                    { name: "user_id", in: "query", schema: { type: "string" } },
                    { name: "namespace", in: "query", schema: { type: "string" } },
                    { name: "type", in: "query", schema: { $ref: "#/components/schemas/MemoryType" } },
                    { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
                    { name: "offset", in: "query", schema: { type: "integer", default: 0 } }
                ],
                responses: {
                    "200": { description: "Memories fetched successfully" }
                }
            }
        },
        "/v1/memories/search": {
            post: {
                summary: "Search Memories",
                description: "Semantic vector search with hybrid ranking (similarity + importance + confidence + recency).",
                tags: ["Memories"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["user_id", "query"],
                                properties: {
                                    user_id: { type: "string", example: "usr_alice" },
                                    query: { type: "string", example: "What tech stack does the user prefer?" },
                                    namespace: { type: "string" },
                                    limit: { type: "integer", default: 5 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Ranked memories with explainable score breakdown",
                        content: {
                            "application/json": {
                                schema: {
                                    type: "object",
                                    properties: {
                                        success: { type: "boolean" },
                                        data: {
                                            type: "array",
                                            items: { $ref: "#/components/schemas/RankedMemory" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        "/v1/memories/context": {
            post: {
                summary: "Get Formatted Prompt Context",
                description: "Retrieves top relevant memories and formats compact context ready for direct injection into any LLM.",
                tags: ["Memories"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["user_id", "query"],
                                properties: {
                                    user_id: { type: "string", example: "usr_alice" },
                                    query: { type: "string", example: "Suggest an architecture for my project" },
                                    namespace: { type: "string" },
                                    limit: { type: "integer", default: 5 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": {
                        description: "Prompt-ready context text and memory array"
                    }
                }
            }
        },
        "/v1/memories/ingest": {
            post: {
                summary: "Ingest Conversation Messages",
                description: "Automatically extracts facts, preferences, goals, and decisions from raw chat turns, performing deduplication and conflict resolution.",
                tags: ["Memories"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["user_id", "messages"],
                                properties: {
                                    user_id: { type: "string", example: "usr_alice" },
                                    messages: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            required: ["role", "content"],
                                            properties: {
                                                role: { type: "string", example: "user" },
                                                content: { type: "string", example: "I am building a SaaS using Bun and Postgres." }
                                            }
                                        }
                                    },
                                    namespace: { type: "string", default: "default" },
                                    sync: { type: "boolean", default: false, description: "Set true to block until memories are saved; default false enqueues job asynchronously." }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "200": { description: "Synchronously processed memories" },
                    "202": { description: "Enqueued for asynchronous background extraction" }
                }
            }
        },
        "/api/keys": {
            post: {
                summary: "Create API Key",
                description: "Generates a new API key. Secret is returned ONCE.",
                tags: ["API Keys"],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                required: ["projectId", "name"],
                                properties: {
                                    projectId: { type: "string" },
                                    name: { type: "string", example: "Production Backend Key" },
                                    isLive: { type: "boolean", default: true }
                                }
                            }
                        }
                    }
                },
                responses: {
                    "201": { description: "API key generated" }
                }
            }
        },
        "/api/projects/{projectId}/metrics": {
            get: {
                summary: "Get Project Metrics",
                description: "Aggregated stats of memory counts, active vs superseded ratio, and type breakdown.",
                tags: ["Projects"],
                security: [],
                parameters: [
                    { name: "projectId", in: "path", required: true, schema: { type: "string" } }
                ],
                responses: {
                    "200": { description: "Project metrics" }
                }
            }
        }
    }
};
