import { Router } from "express";
import { syncUserHandler } from "./auth.controller";

const router = Router();

router.post("/sync", syncUserHandler);

export default router;
