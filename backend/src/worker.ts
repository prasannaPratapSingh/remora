import { startMemoryWorker } from "./modules/queue/memory.worker";
import { getRedisClient } from "./lib/redis";

console.log("Starting Remora Background Ingestion Worker...");

// Ensure redis connection
getRedisClient();

// Start the worker
const worker = startMemoryWorker();

console.log("Remora Background Worker is running and listening for jobs on 'memory-ingestion' queue.");

const shutdown = async () => {
    console.log("Shutting down worker gracefully...");
    await worker.close();
    process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
