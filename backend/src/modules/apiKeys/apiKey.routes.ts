import { Router } from "express";
import {
    createApiKeyHandler,
    listApiKeysHandler,
    revokeApiKeyHandler
} from "./apiKey.controller";
import { requireApiKeyProjectAccess } from "../../middlewares/dashboardAuth";

const router = Router();

router.post("/", requireApiKeyProjectAccess, createApiKeyHandler);
router.get("/project/:projectId", requireApiKeyProjectAccess, listApiKeysHandler);
router.post("/:keyId/revoke", requireApiKeyProjectAccess, revokeApiKeyHandler);

export default router;
