import { Router } from "express";
import {
    createProjectHandler,
    listProjectsHandler,
    getProjectDashboardSummaryHandler,
    getProjectUsageHandler,
    getProjectMetricsHandler,
    listProjectMemoriesHandler,
    createProjectMemoryHandler,
    searchProjectMemoriesHandler,
    deleteProjectMemoryHandler,
    exportProjectUserMemoriesHandler,
    deleteProjectUserMemoriesHandler
} from "./project.controller";
import { requireOrganizationAccess, requireProjectAccess } from "../../middlewares/dashboardAuth";

const router = Router();

router.post("/", requireOrganizationAccess, createProjectHandler);
router.get("/", requireOrganizationAccess, listProjectsHandler);
router.use("/:projectId", requireProjectAccess);
router.get("/:projectId/dashboard-summary", getProjectDashboardSummaryHandler);
router.get("/:projectId/usage", getProjectUsageHandler);
router.get("/:projectId/metrics", getProjectMetricsHandler);
router.get("/:projectId/memories", listProjectMemoriesHandler);
router.post("/:projectId/memories", createProjectMemoryHandler);
router.delete("/:projectId/memories/:memoryId", deleteProjectMemoryHandler);
router.post("/:projectId/search", searchProjectMemoriesHandler);
router.get("/:projectId/users/:userId/export", exportProjectUserMemoriesHandler);
router.delete("/:projectId/users/:userId", deleteProjectUserMemoriesHandler);

export default router;
