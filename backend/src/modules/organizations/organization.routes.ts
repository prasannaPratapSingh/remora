import { Router } from "express";
import {
    createOrganizationHandler,
    listOrganizationsHandler,
    getOrganizationHandler
} from "./organization.controller";

const router = Router();

router.post("/", createOrganizationHandler);
router.get("/", listOrganizationsHandler);
router.get("/:orgId", getOrganizationHandler);

export default router;
