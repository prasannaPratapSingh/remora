import { Router } from "express";
import {
    createApiKeyHandler,
    listApiKeysHandler,
    revokeApiKeyHandler
} from "./apiKey.controller";

const router = Router();

router.post("/", createApiKeyHandler);
router.get("/project/:projectId", listApiKeysHandler);
router.post("/:keyId/revoke", revokeApiKeyHandler);

export default router;
