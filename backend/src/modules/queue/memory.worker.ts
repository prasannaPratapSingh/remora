import { Worker, type Job } from "bullmq";
import envConfig from "../../config/envConfig";
import { MemoryService } from "../memories/memory.service";
import type { IngestionJobData } from "./memory.queue";

let memoryWorker: Worker<IngestionJobData> | null = null;

export function startMemoryWorker(): Worker<IngestionJobData> {
    if (!memoryWorker) {
        const redisUrl = new URL(envConfig.REDIS_URL);
        const memoryService = new MemoryService();

        memoryWorker = new Worker<IngestionJobData>(
            "memory-ingestion",
            async (job: Job<IngestionJobData>) => {
                console.log(`[Worker] Processing ingestion job ${job.id} for user ${job.data.externalUserId}...`);
                const result = await memoryService.ingestConversation({
                    organizationId: job.data.organizationId,
                    projectId: job.data.projectId,
                    externalUserId: job.data.externalUserId,
                    messages: job.data.messages,
                    namespace: job.data.namespace,
                });
                console.log(`[Worker] Job ${job.id} completed. Ingested ${result.ingested} memories.`);
                return result;
            },
            {
                connection: {
                    host: redisUrl.hostname,
                    port: Number(redisUrl.port) || 6379,
                    password: redisUrl.password || undefined,
                    tls: redisUrl.protocol === "rediss:" ? { rejectUnauthorized: false } : undefined,
                    maxRetriesPerRequest: null,
                },
                concurrency: 5,
            }
        );

        memoryWorker.on("completed", (job) => {
            console.log(`[Worker] Ingestion job ${job.id} finished successfully.`);
        });

        memoryWorker.on("failed", (job, err) => {
            console.error(`[Worker] Ingestion job ${job?.id} failed with error:`, err.message);
        });
    }

    return memoryWorker;
}
