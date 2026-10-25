import express, { type Express, type Request, type Response, type NextFunction } from "express";
import memoryRoutes from "./modules/memories/memory.routes";
import apiKeyRoutes from "./modules/apiKeys/apiKey.routes";
import projectRoutes from "./modules/projects/project.routes";
import organizationRoutes from "./modules/organizations/organization.routes";
import authRoutes from "./modules/auth/auth.routes";
import { clerkWebhookHandler } from "./modules/webhooks/clerk.webhook";
import errorHandler from "./middlewares/errorHandler";
import ApiError from "./utils/ApiError";
import { openApiSpec } from "./docs/openapi";

import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import envConfig from "./config/envConfig";
import prisma from "./lib/prisma";
import { getRedisClient, isRedisConnected } from "./lib/redis";
import { requireAuth } from "./middlewares/authMiddelware";
import { requireDashboardAuth } from "./middlewares/dashboardAuth";

const app: Express = express();

// Core middlewares
app.use(cors({
    origin: envConfig.CORS_ORIGINS,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Clerk attaches the authenticated session to the request. Keep this
// middleware conditional so API-key-only tests and local SDK usage continue
// to work without Clerk credentials, while production dashboard routes are
// protected by requireAuth/requireDashboardAuth below.
if (envConfig.CLERK_SECRET_KEY) {
    app.use(clerkMiddleware());
}

// Liveness / Readiness health check
app.get("/health", (_: Request, res: Response) => {
    return res.status(200).json({
        status: "ok",
        service: "remora-memory-engine",
        timestamp: new Date().toISOString()
    });
});

app.get("/ready", async (_: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        const redisReady = isRedisConnected() || getRedisClient().status === "ready";

        if (!redisReady) {
            return res.status(503).json({
                status: "not_ready",
                service: "remora-memory-engine",
                checks: { database: "ok", redis: "unavailable" },
                timestamp: new Date().toISOString()
            });
        }

        return res.status(200).json({
            status: "ready",
            service: "remora-memory-engine",
            checks: { database: "ok", redis: "ok" },
            timestamp: new Date().toISOString()
        });
    } catch {
        return res.status(503).json({
            status: "not_ready",
            service: "remora-memory-engine",
            checks: { database: "unavailable", redis: isRedisConnected() ? "ok" : "unavailable" },
            timestamp: new Date().toISOString()
        });
    }
});

// Interactive API Documentation (OpenAPI 3.0 + Scalar)
app.get("/openapi.json", (_: Request, res: Response) => {
    return res.status(200).json(openApiSpec);
});

app.get("/docs", (_: Request, res: Response) => {
    res.setHeader("Content-Type", "text/html");
    return res.send(`
        <!doctype html>
        <html>
        <head>
            <title>Remora Memory API Reference</title>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <link rel="icon" type="image/svg+xml" href="https://scalar.com/favicon.svg" />
        </head>
        <body>
            <script id="api-reference" data-url="/openapi.json"></script>
            <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
        </body>
        </html>
    `);
});

// Developer platform routes
app.use("/api/auth", requireAuth, authRoutes);
app.use("/api/keys", requireAuth, requireDashboardAuth, apiKeyRoutes);
app.use("/api/projects", requireAuth, requireDashboardAuth, projectRoutes);
app.use("/api/organizations", requireAuth, requireDashboardAuth, organizationRoutes);
app.post("/api/webhooks/clerk", clerkWebhookHandler);

// Core memory engine v1 routes
app.use("/v1/memories", memoryRoutes);

// 404 handler
app.use((req: Request, _: Response, next: NextFunction) => {
    next(new ApiError(404, `Route '${req.method} ${req.originalUrl}' not found.`));
});

// Centralized error handler
app.use(errorHandler);

export default app;
