# Remora (RecallLayer) — Product & Engineering Journey

> **Product Vision:** Make persistent, evolving memory an infrastructure primitive for every AI application, agent, and copilot.

---

## 1. Executive Overview

Most LLM applications are stateless at the application layer. Developers repeatedly build ad-hoc `user_memories` tables, fragile similarity search scripts, and naive prompt dumps. 

**Remora** is an AI memory infrastructure platform designed to solve this once and for all:
- It is **not** just a vector database.
- It is **not** a chatbot framework.
- It is an **intelligent memory engine** that manages memory formation, evolution (deduplication & conflict resolution), time decay, multi-tenant isolation, and compact context synthesis.

---

## 2. Architectural Blueprint

```
Conversation Messages
        ↓
Candidate Detection (Filter trivial messages like "ok", "hi")
        ↓
LLM Extraction (Structured JSON: content, type, importance, confidence)
        ↓
Embedding Generation (1536-dim vector via text-embedding-3-small)
        ↓
Vector Similarity Search (Find existing candidates)
        ↓
Deduplication & Conflict Resolution
        ├─ High similarity (>0.90) & same intent → Merge / Update
        ├─ Direct contradiction → Supersede old (SUPERSEDED) + create ACTIVE + log Version
        └─ New fact → Create new ACTIVE memory
        ↓
Storage in PostgreSQL + pgvector (HNSW Index)
        ↓
Retrieval Pipeline (Hybrid scoring: 0.55*sim + 0.20*imp + 0.15*conf + 0.10*recency)
        ↓
Compact Context Formatter → Injected into Application LLM
```

---

## 3. Engineering Decisions & Changelog

### Phase 0: Schema Evolution & Zero-Drift Database Migration

#### What Was Changed
1. **Multi-Tenant Scoping (`organizationId` on `Memory`)**:
   - Added direct foreign key relation to `Organization` on `Memory`.
   - **Why**: Security failure #1 in AI SaaS is cross-tenant leakage. Having `organizationId` directly on the `Memory` table enables strict tenant filtering in raw vector queries (`WHERE organization_id = $1 AND project_id = $2 AND external_user_id = $3`) and fast composite indexing without requiring multi-table joins during high-throughput vector scans.
2. **Namespaces (`namespace`)**:
   - Added `namespace String @default("default")`.
   - **Why**: Enables agent developers to partition memories by lifecycle or domain (e.g. `personal`, `work`, `project-alpha`, `support`).
3. **Recency Tracking (`lastAccessedAt`)**:
   - Added `lastAccessedAt DateTime?`.
   - **Why**: Recency decay ($e^{-\lambda \cdot \Delta t}$) needs to know when a memory was last relevant or accessed, preventing old stale memories from overwhelming newer context unless their importance score is very high.
4. **Memory Evolution Audit Log (`MemoryVersion` model)**:
   - Added `MemoryVersion` table tracking `memoryId`, `content`, `previousContent`, `changeReason`, and timestamp.
   - **Why**: When a user's preference changes (e.g., from "I use React" to "I now use Next.js"), the old memory is marked `SUPERSEDED` and the transition is preserved in `MemoryVersion`. AI memory must be explainable and auditable.
5. **Enum Expansions**:
   - `MemoryType`: Added `RELATIONSHIP`, `BEHAVIOR`, `TEMPORARY`.
   - `MemoryStatus`: Added `DELETED` (for soft deletion/GDPR compliance) and `EXPIRED` (for TTL-based memories).
6. **HNSW Vector Cosine Index**:
   - Added `CREATE INDEX IF NOT EXISTS "memories_embedding_hnsw_idx" ON "memories" USING hnsw ("embedding" vector_cosine_ops);` in migration SQL.
   - **Why**: HNSW (Hierarchical Navigable Small World) provides superior search speed and recall compared to IVFFlat, especially as memory collections scale.
7. **Applied Migration**:
   - Migration `20261020111857_enhance_memory_schema_and_versioning` created and applied cleanly against Neon PostgreSQL.
   - Generated up-to-date Prisma Client.

### Phase 1: API Key Authentication & Multi-Tenant Infrastructure

#### What Was Built
- **API Key Utilities (`src/modules/apiKeys/apiKey.utils.ts`)**:
  - Secure random token generation with distinct live (`rl_live_...`) and test (`rl_test_...`) prefixes.
  - One-way SHA-256 key hashing (`crypto.createHash("sha256")`). Raw keys are returned exactly once to the client upon creation and never stored in the database.
- **Tenant Context Extraction (`src/middlewares/apiKeyAuth.ts`)**:
  - Validates `Authorization: Bearer <key>` or `X-API-Key: <key>`.
  - Performs constant-time hash lookup in `api_keys` joined with `Project`.
  - Enforces expiration (`expiresAt`) and revocation (`revokedAt`).
  - Asynchronously touches `lastUsedAt` without adding latency to the client request.
  - Injects strongly-typed `req.tenant = { organizationId, projectId, apiKeyId }`.

### Phase 2: Core Memory Engine, Vector Search & Hybrid Ranking

#### What Was Built
- **Pluggable Embedding Provider (`src/modules/embeddings/embedding.provider.ts`)**:
  - Standardized `IEmbeddingProvider` interface (1536-dim standard, e.g. OpenAI `text-embedding-3-small`).
  - Offline/development deterministic fallback to allow seamless local testing and unit tests without incurring API costs or failing when offline.
- **pgvector Raw SQL Repository (`src/modules/memories/memory.repository.ts`)**:
  - Native pgvector vector operations via Prisma `$executeRaw` and `$queryRaw`.
  - Vector cosine distance calculation: `1 - (embedding <=> $1::vector) AS similarity`.
  - Enforces tenant isolation in every query: `WHERE organizationId = $1 AND projectId = $2 AND externalUserId = $3 AND status = 'ACTIVE'`.
- **Hybrid Ranker (`src/modules/ranking/hybridRanker.ts`)**:
  - Production formula (§15):
    $$\text{Final Score} = 0.55 \cdot \text{sim} + 0.20 \cdot \text{imp} + 0.15 \cdot \text{conf} + 0.10 \cdot \text{rec}$$
  - Exponential recency decay ($e^{-\lambda \cdot \text{age}}$) with adaptive lambda based on memory type (`FACT` and `PROFILE` decay very slowly; `TEMPORARY` decays quickly).
  - Returns explainable score breakdown (`scoreBreakdown: { semanticSimilarity, importance, confidence, recency }`) for observability and debugging (§35).
- **Audit Logging & Memory Evolution (`src/modules/memories/memory.service.ts`)**:
  - Every update logs a `MemoryVersion` record capturing before/after content and change reasons.
  - Automatic near-duplicate detection (>0.93 similarity) reinforces existing confidence rather than polluting the vector space.
- **Compact Context Formatter (`POST /v1/memories/context`)**:
  - Formats retrieved memories into token-efficient prompt context blocks for direct injection into any LLM.
- **Automated End-to-End Test Suite (`tests/memory.test.ts`)**:
  - 7 passing integration tests covering:
    - Server health check
    - API key authentication rejection
    - Memory creation with pgvector storage
    - Vector search with hybrid ranking
    - Context generation
    - Memory updates with automated version tracking
    - Project metrics and memory breakdown

### Phase 3: Redis Hot Context Caching & BullMQ Asynchronous Processing

#### What Was Built
- **Local Docker Compose (`docker-compose.yml`)**:
  - Clean `redis:7-alpine` container configuration with volume persistence and healthchecks for instant local setup (`docker compose up -d`).
- **Resilient Redis Client (`src/lib/redis.ts`)**:
  - Connection management with exponential backoff and non-crashing offline tolerance.
  - Safe caching helper primitives (`cacheGet`, `cacheSet`, `cacheDel`).
- **Hot Context Caching (§28)**:
  - Cache key structure: `remora:context:{projectId}:{userId}:{namespace}:{queryHash}`.
  - Generates sub-millisecond responses on repeated queries during active conversations with a 60-second TTL.
- **Asynchronous Ingestion Pipeline with BullMQ (§27)**:
  - `memory.queue.ts`: Enqueues conversation payloads with exponential backoff retries.
  - `memory.worker.ts`: Background worker performing LLM extraction, embedding generation, deduplication, and database writes without blocking chatbot UI responses.
  - `POST /v1/memories/ingest` returns `202 Accepted` + `{ jobId, status: "queued" }` by default, with automatic fallback to synchronous execution when Redis is offline.
- **Project Metrics & Dashboard API (`src/modules/projects/`)**:
  - `POST /api/projects`: Project creation under an organization.
  - `GET /api/projects`: Listing projects with active memory and API key counts.
  - `GET /api/projects/:projectId/metrics`: Aggregated analytics (total memories, active vs superseded count, breakdown by `MemoryType`).

---

## 4. Key Learnings for Developers

### Learning 1: Memory != Chat History
Chat history is ephemeral, verbose, and raw. If you stuff 50 past turns into an LLM context, you waste tokens, dilute attention, and hit context limits. Memory is **distilled, structured knowledge** extracted from those turns.

### Learning 2: Vector Search Alone Is Not Enough
Cosine similarity only measures semantic proximity to the current prompt. If a user asks "What should I eat?", a memory like "I had sushi yesterday" might have high semantic similarity, but low utility compared to "I am severely allergic to peanuts (importance: 0.95)".
Production memory layers require **Hybrid Scoring**:
$$\text{Score} = w_{\text{sim}} \cdot \text{sim} + w_{\text{imp}} \cdot \text{imp} + w_{\text{conf}} \cdot \text{conf} + w_{\text{rec}} \cdot \text{rec}$$

### Learning 3: Guarding Against Database Drift with Vector Extensions
Prisma provides schema-level abstractions, but advanced database features like PostgreSQL extensions (`pgvector`) and custom index operators (`vector_cosine_ops`, `hnsw`) require declarative migration files. Never use `db push` in a production-oriented product; always inspect and check in version-controlled migration scripts (`prisma migrate dev`).

### Learning 4: Defense-in-Depth Multi-Tenancy
Never rely solely on application-level filtering. Every retrieval query must be scoped by `organization_id`, `project_id`, and `external_user_id` at the SQL query level, backed by composite indexes.

### Learning 5: Asynchronous Ingestion for Zero-Latency Chatbots
LLM extraction and embedding generation can take 1.5 to 3 seconds. Forcing an AI chatbot to wait for memory extraction before answering frustrates users. Returning `202 Accepted` and offloading extraction to background workers (BullMQ) gives developers zero added chat latency.

### Learning 6: Two-Tier Auth Design
A developer platform has two distinct auth requirements:
1. **Browser / Human Developers:** Session-based or JWT authentication (e.g. Clerk) via cookies.
2. **AI Agents / External Code:** Bearer token headers with cryptographically hashed API keys (`rl_live_...`), completely stateless and machine-friendly.

---

*This document will continuously track every architectural decision, schema migration, pipeline implementation, and product milestone as Remora evolves.*


