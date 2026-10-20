import prisma from "../lib/prisma";

export async function cleanupExpiredMemories(): Promise<number> {
    const result = await prisma.memory.updateMany({
        where: {
            status: "ACTIVE",
            expiresAt: {
                not: null,
                lt: new Date()
            }
        },
        data: {
            status: "EXPIRED",
            updatedAt: new Date()
        }
    });

    if (result.count > 0) {
        console.log(`[TTL Cleanup] Marked ${result.count} memories as EXPIRED.`);
    }

    return result.count;
}

// If executed directly via CLI/Cron
if (import.meta.main) {
    cleanupExpiredMemories()
        .then((count) => {
            console.log(`Cleanup complete. Expired ${count} memories.`);
            process.exit(0);
        })
        .catch((err) => {
            console.error("Cleanup failed:", err);
            process.exit(1);
        });
}
