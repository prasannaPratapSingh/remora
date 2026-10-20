import { z } from "zod";

const memoryTypeEnum = z.enum([
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
]);

const memoryStatusEnum = z.enum([
    "ACTIVE",
    "SUPERSEDED",
    "ARCHIVED",
    "DELETED",
    "EXPIRED"
]);

export const createMemorySchema = z.object({
    body: z.object({
        user_id: z.string().min(1, "user_id is required"),
        content: z.string().min(1, "content is required"),
        namespace: z.string().optional().default("default"),
        type: memoryTypeEnum.optional().default("FACT"),
        importance: z.number().min(0).max(1).optional().default(0.5),
        confidence: z.number().min(0).max(1).optional().default(1.0),
        metadata: z.record(z.string(), z.unknown()).optional(),
    })
});

export const searchMemoriesSchema = z.object({
    body: z.object({
        user_id: z.string().min(1, "user_id is required"),
        query: z.string().min(1, "query is required"),
        namespace: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional().default(5),
    })
});

export const getContextSchema = z.object({
    body: z.object({
        user_id: z.string().min(1, "user_id is required"),
        query: z.string().min(1, "query is required"),
        namespace: z.string().optional(),
        limit: z.number().int().min(1).max(20).optional().default(5),
    })
});

export const ingestConversationSchema = z.object({
    body: z.object({
        user_id: z.string().min(1, "user_id is required"),
        messages: z.array(z.object({
            role: z.string().min(1),
            content: z.string().min(1),
        })).min(1, "messages array must contain at least 1 message"),
        namespace: z.string().optional().default("default"),
        sync: z.boolean().optional().default(false),
    })
});

export const updateMemorySchema = z.object({
    params: z.object({
        memoryId: z.string().min(1, "memoryId is required"),
    }),
    body: z.object({
        content: z.string().min(1).optional(),
        importance: z.number().min(0).max(1).optional(),
        confidence: z.number().min(0).max(1).optional(),
        type: memoryTypeEnum.optional(),
        status: memoryStatusEnum.optional(),
    })
});

export const getMemorySchema = z.object({
    params: z.object({
        memoryId: z.string().min(1, "memoryId is required"),
    })
});

export const listMemoriesSchema = z.object({
    query: z.object({
        user_id: z.string().optional(),
        namespace: z.string().optional(),
        type: memoryTypeEnum.optional(),
        status: memoryStatusEnum.optional(),
        limit: z.coerce.number().int().min(1).max(100).optional().default(20),
        offset: z.coerce.number().int().min(0).optional().default(0),
    })
});
