import { Router } from "express";
import { apiKeyAuth } from "../../middlewares/apiKeyAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import {
    createMemorySchema,
    searchMemoriesSchema,
    getContextSchema,
    ingestConversationSchema,
    getMemorySchema,
    updateMemorySchema,
    listMemoriesSchema
} from "./memory.validation";
import {
    createMemoryHandler,
    searchMemoriesHandler,
    getContextHandler,
    ingestConversationHandler,
    getMemoryHandler,
    updateMemoryHandler,
    deleteMemoryHandler,
    listMemoriesHandler
} from "./memory.controller";

const router = Router();

// All /v1/memories routes require valid API key authentication
router.use(apiKeyAuth);

router.post("/", validateRequest(createMemorySchema), createMemoryHandler);
router.post("/search", validateRequest(searchMemoriesSchema), searchMemoriesHandler);
router.post("/context", validateRequest(getContextSchema), getContextHandler);
router.post("/ingest", validateRequest(ingestConversationSchema), ingestConversationHandler);
router.get("/:memoryId", validateRequest(getMemorySchema), getMemoryHandler);
router.patch("/:memoryId", validateRequest(updateMemorySchema), updateMemoryHandler);
router.delete("/:memoryId", validateRequest(getMemorySchema), deleteMemoryHandler);
router.get("/", validateRequest(listMemoriesSchema), listMemoriesHandler);

export default router;
