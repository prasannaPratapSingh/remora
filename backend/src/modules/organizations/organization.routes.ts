import { Router } from "express";
import {
    createOrganizationHandler,
    listOrganizationsHandler,
    getOrganizationHandler
} from "./organization.controller";
import { requireOrganizationAccess, requireOrganizationParamAccess } from "../../middlewares/dashboardAuth";

const router = Router();

router.post("/", requireOrganizationAccess, createOrganizationHandler);
router.get("/", requireOrganizationAccess, listOrganizationsHandler);
router.get("/:orgId", requireOrganizationParamAccess, getOrganizationHandler);

export default router;
