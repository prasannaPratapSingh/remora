import { Router } from "express";
import {
    createProjectHandler,
    listProjectsHandler,
    getProjectMetricsHandler
} from "./project.controller";

const router = Router();

router.post("/", createProjectHandler);
router.get("/", listProjectsHandler);
router.get("/:projectId/metrics", getProjectMetricsHandler);

export default router;
