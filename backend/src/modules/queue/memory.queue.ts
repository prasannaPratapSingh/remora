import { Queue } from "bullmq";
import envConfig from "../../config/envConfig";

export interface IngestionJobData {
    organizationId: string;
    projectId: string;
    externalUserId: string;
    messages: Array<{ role: string; content: string }>;
    namespace?: string;
}

let ingestionQueue: Queue<IngestionJobData> | null = null;

export function getIngestionQueue(): Queue<IngestionJobData> {
    if (!ingestionQueue) {
        const redisUrl = new URL(envConfig.REDIS_URL);
        ingestionQueue = new Queue<IngestionJobData>("memory-ingestion", {
            connection: {
                host: redisUrl.hostname,
                port: Number(redisUrl.port) || 6379,
                password: redisUrl.password || undefined,
                maxRetriesPerRequest: null,
            },
            defaultJobOptions: {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 1000,
                },
                removeOnComplete: {
                    age: 3600, // keep completed jobs for 1 hour
                    count: 1000
                },
                removeOnFail: {
                    age: 24 * 3600 // keep failed jobs for 24 hours
                }
            }
        });
    }

    return ingestionQueue;
}

export async function enqueueIngestionJob(data: IngestionJobData): Promise<string> {
    const queue = getIngestionQueue();
    const job = await queue.add("ingest-conversation", data);
    return job.id || "job_unknown";
}
