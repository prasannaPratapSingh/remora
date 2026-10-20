import express, { type Express, type Request, type Response, type NextFunction } from "express";
import memoryRoutes from "./modules/memories/memory.routes";
import apiKeyRoutes from "./modules/apiKeys/apiKey.routes";
import projectRoutes from "./modules/projects/project.routes";
import errorHandler from "./middlewares/errorHandler";
import ApiError from "./utils/ApiError";

const app: Express = express();

// Core middlewares
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Liveness / Readiness health check
app.get("/health", (_: Request, res: Response) => {
    return res.status(200).json({
        status: "ok",
        service: "remora-memory-engine",
        timestamp: new Date().toISOString()
    });
});

// Developer platform routes
app.use("/api/keys", apiKeyRoutes);
app.use("/api/projects", projectRoutes);

// Core memory engine v1 routes
app.use("/v1/memories", memoryRoutes);

// 404 handler
app.use((req: Request, _: Response, next: NextFunction) => {
    next(new ApiError(404, `Route '${req.method} ${req.originalUrl}' not found.`));
});

// Centralized error handler
app.use(errorHandler);

export default app;