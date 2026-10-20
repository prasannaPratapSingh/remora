/*
  Warnings:

  - Added the required column `organizationId` to the `memories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MemoryStatus" ADD VALUE 'DELETED';
ALTER TYPE "MemoryStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MemoryType" ADD VALUE 'RELATIONSHIP';
ALTER TYPE "MemoryType" ADD VALUE 'BEHAVIOR';
ALTER TYPE "MemoryType" ADD VALUE 'TEMPORARY';

-- DropIndex
DROP INDEX "memories_projectId_externalUserId_status_createdAt_idx";

-- AlterTable
ALTER TABLE "memories" ADD COLUMN     "lastAccessedAt" TIMESTAMP(3),
ADD COLUMN     "namespace" TEXT NOT NULL DEFAULT 'default',
ADD COLUMN     "organizationId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "memory_versions" (
    "id" TEXT NOT NULL,
    "memoryId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "previousContent" TEXT,
    "changeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memory_versions_memoryId_idx" ON "memory_versions"("memoryId");

-- CreateIndex
CREATE INDEX "memories_organizationId_projectId_externalUserId_status_idx" ON "memories"("organizationId", "projectId", "externalUserId", "status");

-- CreateIndex
CREATE INDEX "memories_projectId_externalUserId_namespace_status_idx" ON "memories"("projectId", "externalUserId", "namespace", "status");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_versions" ADD CONSTRAINT "memory_versions_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "memories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex: HNSW index on embedding for vector cosine similarity search
CREATE INDEX IF NOT EXISTS "memories_embedding_hnsw_idx" ON "memories" USING hnsw ("embedding" vector_cosine_ops);
