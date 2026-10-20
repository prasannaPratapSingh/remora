import benchmarkCases from "./benchmark.json";
import { MemoryService } from "../memories/memory.service";
import prisma from "../../lib/prisma";

export interface EvaluationReport {
    totalCases: number;
    extractionAccuracy: number;
    retrievalPrecision: number;
    results: Array<{
        caseId: string;
        name: string;
        extractionPassed: boolean;
        retrievalPassed: boolean;
    }>;
}

export async function runEvaluation(): Promise<EvaluationReport> {
    const memoryService = new MemoryService();
    
    // Ensure test user, organization, and project exist for foreign key integrity
    const evalUser = await prisma.user.upsert({
        where: { email: "eval-runner@remora.ai" },
        update: {},
        create: {
            email: "eval-runner@remora.ai",
            clerkId: "clerk_eval_runner_01",
            name: "Evaluation Runner"
        }
    });

    const evalOrg = await prisma.organization.upsert({
        where: { slug: "eval-org-benchmark" },
        update: {},
        create: {
            name: "Eval Org Benchmark",
            slug: "eval-org-benchmark",
            ownerId: evalUser.id
        }
    });

    const evalProj = await prisma.project.upsert({
        where: {
            organizationId_slug: {
                organizationId: evalOrg.id,
                slug: "eval-proj-benchmark"
            }
        },
        update: {},
        create: {
            organizationId: evalOrg.id,
            name: "Eval Project",
            slug: "eval-proj-benchmark"
        }
    });

    const evalOrgId = evalOrg.id;
    const evalProjectId = evalProj.id;
    const evalUserId = `eval_usr_${Date.now()}`;

    // Clean up any previous benchmark artifacts
    await prisma.memory.deleteMany({
        where: { projectId: evalProjectId }
    });

    let extractionPasses = 0;
    let retrievalPasses = 0;
    const results = [];

    for (const testCase of benchmarkCases) {
        // 1. Ingest conversation
        const ingestRes = await memoryService.ingestConversation({
            organizationId: evalOrgId,
            projectId: evalProjectId,
            externalUserId: evalUserId,
            messages: testCase.conversation
        });

        // Check if expected memory content was extracted
        let extractionPassed = false;
        for (const expected of testCase.expectedMemories) {
            const matched = ingestRes.memories.some(m =>
                m.content.toLowerCase().includes(expected.contentContains.toLowerCase())
            );
            if (matched) extractionPassed = true;
        }

        if (extractionPassed) extractionPasses++;

        // 2. Test semantic search retrieval
        let retrievalPassed = false;
        for (const queryObj of testCase.testQueries) {
            const searchRes = await memoryService.searchMemories({
                organizationId: evalOrgId,
                projectId: evalProjectId,
                externalUserId: evalUserId,
                query: queryObj.query,
                limit: 3
            });

            const found = searchRes.some(r =>
                r.content.toLowerCase().includes(queryObj.expectedMatch.toLowerCase())
            );
            if (found) retrievalPassed = true;
        }

        if (retrievalPassed) retrievalPasses++;

        results.push({
            caseId: testCase.id,
            name: testCase.name,
            extractionPassed,
            retrievalPassed
        });
    }

    // Clean up benchmark memories
    await prisma.memory.deleteMany({
        where: { projectId: evalProjectId }
    });

    const report: EvaluationReport = {
        totalCases: benchmarkCases.length,
        extractionAccuracy: Math.round((extractionPasses / benchmarkCases.length) * 100),
        retrievalPrecision: Math.round((retrievalPasses / benchmarkCases.length) * 100),
        results
    };

    return report;
}

if (import.meta.main) {
    console.log("\n==========================================");
    console.log(" Running Remora Memory Quality Benchmark  ");
    console.log("==========================================\n");

    runEvaluation()
        .then((report) => {
            console.log(`Total Cases: ${report.totalCases}`);
            console.log(`Extraction Accuracy: ${report.extractionAccuracy}%`);
            console.log(`Retrieval Precision: ${report.retrievalPrecision}%\n`);
            console.table(report.results);
            console.log("\nBenchmark complete!\n");
            process.exit(0);
        })
        .catch((err) => {
            console.error("Benchmark failed:", err);
            process.exit(1);
        });
}
