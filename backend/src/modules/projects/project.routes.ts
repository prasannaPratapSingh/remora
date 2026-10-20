import { Router } from "express";
import {
    createProjectHandler,
    listProjectsHandler,
    getProjectMetricsHandler,
    listProjectMemoriesHandler,
    createProjectMemoryHandler,
    searchProjectMemoriesHandler
} from "./project.controller";

const router = Router();

router.post("/", createProjectHandler);
router.get("/", listProjectsHandler);
router.get("/:projectId/metrics", getProjectMetricsHandler);
router.get("/:projectId/memories", listProjectMemoriesHandler);
router.post("/:projectId/memories", createProjectMemoryHandler);
router.post("/:projectId/search", searchProjectMemoriesHandler);

export default router;
