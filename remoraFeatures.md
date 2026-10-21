# 🦈 Remora: Technical Specification, Feature Architecture & Agent Manual

> **Purpose:** This document is the definitive technical authority on **Remora**. Any AI agent, software architect, or engineer reading this file will understand the exact system mechanics, algorithmic foundations, problem space, API contracts, database schema, and integration patterns of Remora.

---

## 📑 Table of Contents
1. [Executive Summary & Core Philosophy](#1-executive-summary--core-philosophy)
2. [The Problem Space: Why Naive AI Memory Fails](#2-the-problem-space-why-naive-ai-memory-fails)
3. [The Cognitive Taxonomy of Remora Memory](#3-the-cognitive-taxonomy-of-remora-memory)
4. [Algorithmic Foundations & Mathematical Models](#4-algorithmic-foundations--mathematical-models)
   - [Cosine Similarity in High-Dimensional Space](#cosine-similarity-in-high-dimensional-space)
   - [Adaptive Ebbinghaus Time Decay Curve](#adaptive-ebbinghaus-time-decay-curve)
   - [Multi-Factor Hybrid Re-Ranking Formula](#multi-factor-hybrid-re-ranking-formula)
   - [Automated Deduplication & Confidence Reinforcement](#automated-deduplication--confidence-reinforcement)
   - [Contradiction Resolution & Audit Lineage](#contradiction-resolution--audit-lineage)
5. [System Architecture & Data Flow](#5-system-architecture--data-flow)
   - [Unified Database Architecture: Neon pgvector + HNSW](#unified-database-architecture-neon-pgvector--hnsw)
   - [Two-Tier Performance: Redis Hot Cache + Fail-Open Design](#two-tier-performance-redis-hot-cache--fail-open-design)
   - [Asynchronous Ingestion Pipeline (BullMQ)](#asynchronous-ingestion-pipeline-bullmq)
6. [Complete Database Schema (Prisma & PostgreSQL)](#6-complete-database-schema-prisma--postgresql)
7. [API Specification & Endpoints](#7-api-specification--endpoints)
8. [Multi-Tenant Isolation & Enterprise Security](#8-multi-tenant-isolation--enterprise-security)
9. [Multi-LLM & Embedding Provider Flexibility](#9-multi-llm--embedding-provider-flexibility)
10. [TypeScript SDK (`@remora/sdk`) & Integration Patterns](#10-typescript-sdk-remorasdk--integration-patterns)
11. [Prompt Injection Standard: The `<user_context>` Contract](#11-prompt-injection-standard-the-user_context-contract)
12. [Feature Matrix: Remora vs. Traditional Approaches](#12-feature-matrix-remora-vs-traditional-approaches)

---

## 1. Executive Summary & Core Philosophy

### What is Remora?
**Remora** is an enterprise-grade, managed **AI Long-Term Memory Infrastructure layer** for Large Language Model (LLM) applications and autonomous agent fleets. It provides stateful, self-evolving, and structured memory persistence across sessions, users, and conversational turns with sub-15ms vector retrieval latency.

### The Core Problem Remora Solves:
Every time an LLM session ends or context windows roll over, **the agent forgets everything**. The industry's standard response has been either:
1. Shoving raw chat logs into a vector DB (naive RAG).
2. Forcing backend developers to create yet another custom `user_memories` table in PostgreSQL, configure `pgvector`, build custom chunking, deduplication, conflict resolution, decay algorithms, and API key management from scratch.

### The Remora Value Proposition:
> **"Stop creating `user_memories` tables in your database."**
Remora replaces ad-hoc database tables and specialized vector DB silos (Pinecone, Chroma, Weaviate) with a unified, fully-managed cognitive memory substrate accessible via a single SDK or REST call.

---

## 2. The Problem Space: Why Naive AI Memory Fails

| Problem | Why Naive Vector Search Fails | How Remora Solves It |
|---|---|---|
| **Recency vs. Relevance** | Pure cosine search ranks a 2-year-old fact higher than yesterday's update if the semantic match is slightly closer. | **Ebbinghaus Exponential Time Decay:** Blends semantic similarity with elapsed days weighted by memory type. |
| **Contradictions** | User changes preferences (e.g., *"I live in Delhi"* $\to$ *"I moved to Bangalore"*). Naive search retrieves both, causing hallucinations. | **Extraction & State Transition:** Marks obsolete memories as `SUPERSEDED` and logs changes in `MemoryVersion`. |
| **Duplicate Bloat** | User repeats *"I like dark mode"* in 10 chats. Vector DB stores 10 rows, crowding out other relevant context. | **Deduplication Threshold ($\text{Sim} > 0.93$):** Increments confidence ($+0.05$) and updates timestamp without duplicating. |
| **Phatic Noise** | Casual filler (*"hello"*, *"cool"*, *"thanks"*, *"bye"*) gets embedded and pollutes search queries. | **Two-Tier Filtering:** Fast deterministic regex filter + LLM extraction distilling turns into atomic facts. |
| **Dual-DB Desync** | Storing vectors in Pinecone and metadata in Postgres causes orphan vectors and race conditions. | **Unified Neon PostgreSQL:** Metadata, JSON audit trails, and 1536-dim vectors exist in ONE ACID table. |
| **Prompt Bloat** | Dumping 20 raw chunks into prompt balloons token costs and causes the "lost in the middle" LLM defect. | **Compact `<user_context>` Injection:** Formats top-3 to top-5 ranked memories into dense, structured context. |
| **Chat Latency** | Synchronous embedding and extraction add 1.5–3 seconds to every chatbot response. | **Asynchronous BullMQ Ingestion:** Immediate `202 Accepted` response; background workers handle extraction. |

---

## 3. The Cognitive Taxonomy of Remora Memory

Remora does not treat memories as arbitrary text chunks. Every stored memory belongs to a strictly typed cognitive category defined in PostgreSQL:

```prisma
enum MemoryType {
  FACT
  PREFERENCE
  PROFILE
  PROJECT_CONTEXT
  INSTRUCTION
  GOAL
  DECISION
  RELATIONSHIP
  BEHAVIOR
  TEMPORARY
  OTHER
}
```

### Detailed Breakdown of Memory Types:

1. **`FACT` (Domain Specs & Objective Knowledge)**
   - *Example:* *"The production database cluster is running PostgreSQL 16 on Neon."*
   - *Decay Rate:* Minimal ($\lambda = 0.005$, $\approx 138$-day half-life). Facts remain objectively true over long horizons.

2. **`PREFERENCE` (User Habits, Styles & Biases)**
   - *Example:* *"User strictly prefers TypeScript with Next.js App Router and Vanilla CSS."*
   - *Decay Rate:* Moderate ($\lambda = 0.02$, $\approx 35$-day half-life). Preferences evolve over weeks and months.

3. **`PROFILE` (Enduring Identity Traits)**
   - *Example:* *"User is based in Bangalore, India, and works as a Principal Architect."*
   - *Decay Rate:* Minimal ($\lambda = 0.005$).

4. **`PROJECT_CONTEXT` (Repository & Architectural State)**
   - *Example:* *"Project uses HNSW vector index with cosine distance operators."*
   - *Decay Rate:* Dynamic ($\lambda = 0.05$, $\approx 14$-day half-life).

5. **`INSTRUCTION` (System Rules & Operational Constraints)**
   - *Example:* *"Never output raw database connection strings to the client."*
   - *Decay Rate:* Permanent ($\lambda = 0.0$). Only changes via explicit administrative update.

6. **`GOAL` (Active Objectives & Sprints)**
   - *Example:* *"Complete the pgvector benchmark before the Friday launch."*
   - *Decay Rate:* Fast ($\lambda = 0.10$). Replaced upon completion.

7. **`DECISION` (Architectural & Strategic Choices)**
   - *Example:* *"Selected Neon pgvector over Pinecone to eliminate distributed state desynchronization."*
   - *Decay Rate:* Low ($\lambda = 0.01$).

8. **`TEMPORARY` (Ephemeral Notes & Scratchpad Items)**
   - *Example:* *"User mentioned they are stepping away for lunch."*
   - *Decay Rate:* Aggressive ($\lambda = 0.20$, $\approx 3.5$-day half-life).

---

## 4. Algorithmic Foundations & Mathematical Models

### 1. Cosine Similarity in High-Dimensional Space
Remora embeds memory content into $\mathbb{R}^{1536}$ (standard 1536-dimensional unit hypersphere using OpenAI `text-embedding-3-small` or compatible providers).

Given normalized vectors $\vec{A}$ and $\vec{B}$:
$$\text{Cosine Distance} = \vec{A} \Leftrightarrow \vec{B} = 1 - \frac{\vec{A} \cdot \vec{B}}{\|\vec{A}\| \|\vec{B}\|}$$
$$\text{Similarity}(S) = 1 - (\vec{A} \Leftrightarrow \vec{B})$$

In Neon PostgreSQL via `pgvector`:
```sql
SELECT (1 - ("embedding" <=> $queryVector::vector)) AS "similarity"
FROM "memories"
WHERE "organizationId" = $orgId
  AND "projectId" = $projectId
  AND "externalUserId" = $userId
  AND "status" = 'ACTIVE'
ORDER BY "embedding" <=> $queryVector::vector ASC
LIMIT $limit;
```

---

### 2. Adaptive Ebbinghaus Time Decay Curve
Remora applies the **Ebbinghaus Forgetting Curve** from cognitive psychology to penalize stale memories:

$$R(t) = e^{-\lambda \cdot t}$$

Where:
- $R(t) \in (0.0, 1.0]$ is the recency retention factor.
- $t$ is the elapsed time in days since last access:
  $$t = \max\left(0, \frac{\text{Date.now}() - \text{lastAccessedAt}}{1000 \times 60 \times 60 \times 24}\right)$$
- $\lambda$ is the type-specific decay constant:
  - `FACT` / `PROFILE`: $\lambda = 0.005$
  - `PREFERENCE` / `GOAL`: $\lambda = 0.02$
  - `PROJECT_CONTEXT` / `DECISION`: $\lambda = 0.05$
  - `TEMPORARY`: $\lambda = 0.20$

---

### 3. Multi-Factor Hybrid Re-Ranking Formula
Candidates retrieved by vector similarity undergo composite scoring before prompt injection:

$$\text{FinalScore} = (w_{\text{sim}} \cdot S) + (w_{\text{imp}} \cdot I) + (w_{\text{conf}} \cdot C) + (w_{\text{rec}} \cdot R)$$

Where:
- $S \in [0.0, 1.0]$: Semantic Cosine Similarity
- $I \in [0.0, 1.0]$: Importance Weight (Assigned during LLM extraction)
- $C \in [0.0, 1.0]$: Confidence Rating (Reinforced upon repetition)
- $R \in [0.0, 1.0]$: Time Decay Factor ($e^{-\lambda \cdot t}$)

**Default Production Coefficients:**
$$\begin{cases}
w_{\text{sim}} = 0.55 & \text{(Semantic match is the primary anchor)} \\
w_{\text{imp}} = 0.20 & \text{(High-importance facts outrank minor preferences)} \\
w_{\text{conf}} = 0.15 & \text{(Repeatedly verified facts score higher)} \\
w_{\text{rec}} = 0.10 & \text{(Recent updates break ties over old memories)}
\end{cases}$$
$$\sum w_i = 0.55 + 0.20 + 0.15 + 0.10 = 1.00$$

---

### 4. Automated Deduplication & Confidence Reinforcement
When inserting a new memory, Remora performs an instantaneous nearest-neighbor search for the candidate vector:

$$\text{Threshold} = 0.93$$

- **If $\text{Similarity} > 0.93$ (Near-Duplicate):**
  - **No new row is inserted.**
  - Existing memory's `confidence` is incremented: $C_{\text{new}} = \min(1.0, C_{\text{old}} + 0.05)$.
  - Existing memory's `lastAccessedAt` is updated to `NOW()`.
  - Audit log recorded with reason `DEDUPLICATED_REINFORCEMENT`.
- **If $\text{Similarity} \le 0.93$:**
  - New memory row created and indexed into HNSW.

---

### 5. Contradiction Resolution & Audit Lineage
When an LLM extraction identifies that a new statement directly contradicts an existing fact:
1. The old memory's status is updated from `ACTIVE` to `SUPERSEDED`.
2. A new active memory is created.
3. A row is inserted into `MemoryVersion` documenting:
   - `memoryId`
   - `content` (new fact)
   - `previousContent` (old fact)
   - `changeReason` (e.g., `FACTUAL_UPDATE`, `USER_PREFERENCE_OVERRIDE`)

---

## 5. System Architecture & Data Flow

```
   ┌──────────────────────────────────────────────────────────────┐
   │                     Client Application                       │
   │           (SDK, REST API, Agent Framework, Chatbot)          │
   └───────────────┬──────────────────────────────▲───────────────┘
                   │ Ingest / Search              │ Injected Context
                   ▼                              │ (<user_context>)
   ┌──────────────────────────────────────────────────────────────┐
   │                    Remora Backend (Port 4003)                │
   │  ┌────────────────────────┐      ┌────────────────────────┐  │
   │  │   Two-Tier Auth Guard  │      │  Redis 7 Hot Cache     │  │
   │  │ (Session + Hashed Keys)│      │  (60s Context / 1ms)   │  │
   │  └───────────┬────────────┘      └───────────▲────────────┘  │
   │              │                               │ Cache Hit     │
   │              ▼                               │               │
   │  ┌───────────────────────────────────────────┴────────────┐  │
   │  │               Memory Service & Engine                  │  │
   │  │  - Phatic Noise Filter (Regex)                         │  │
   │  │  - Entity / Fact Extractor (Groq / OpenAI)             │  │
   │  │  - Embedding Generator (1536-dim vector)               │  │
   │  │  - Hybrid Ranker (Sim + Imp + Conf + Recency)          │  │
   │  └───────────────────────┬────────────────────────────────┘  │
   │                          │                                   │
   │  ┌───────────────────────▼────────┐                          │
   │  │    BullMQ Background Queue     │                          │
   │  │   (Non-blocking 202 Ingest)    │                          │
   │  └────────────────────────────────┘                          │
   └──────────────────────────┬───────────────────────────────────┘
                              │ SQL + vector <=> ops
                              ▼
   ┌──────────────────────────────────────────────────────────────┐
   │             Neon Serverless PostgreSQL (pgvector)            │
   │  - Table: memories (Unified Relational + vector(1536))       │
   │  - Index: HNSW (m=16, ef_construction=64)                    │
   │  - Table: memory_versions (Audit History Lineage)            │
   │  - Multi-Tenant Scoping (OrgId + ProjectId + UserId)         │
   └──────────────────────────────────────────────────────────────┘
```

### Unified Database vs. Dual-DB Comparison
Remora rejects the pattern of pairing Postgres with a standalone vector DB (Pinecone / Chroma):
- **ACID Transactions:** Vector updates and version audit logs commit or roll back together.
- **Zero Synchronization Lag:** Deleting a user purges both their relational data and vector indexes in a single SQL cascade (`ON DELETE CASCADE`).
- **Single Network Hop:** Eliminates secondary API roundtrips across cloud vendors.

---

## 6. Complete Database Schema (Prisma & PostgreSQL)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

// 1. User & Developer Account
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  clerkId   String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organizations Organization[] @relation("OrganizationOwner")
  @@map("users")
}

// 2. Organization / Workspace
model Organization {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  ownerId   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  owner    User      @relation(name: "OrganizationOwner", fields: [ownerId], references: [id], onDelete: Restrict)
  projects Project[]
  memories Memory[]

  @@index([ownerId])
  @@map("organizations")
}

// 3. Project / Application Integration
model Project {
  id             String   @id @default(cuid())
  organizationId String
  name           String
  slug           String
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  apiKeys      ApiKey[]
  memories     Memory[]

  @@unique([organizationId, slug])
  @@index([organizationId])
  @@map("projects")
}

// 4. API Keys (Hashed Storage)
model ApiKey {
  id          String    @id @default(cuid())
  projectId   String
  name        String
  keyHash     String    @unique
  prefix      String    // e.g. "rl_live_6c9e"
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  revokedAt   DateTime?
  createdAt   DateTime  @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, revokedAt])
  @@map("api_keys")
}

// 5. Memory Model with pgvector Embedding
model Memory {
  id             String       @id @default(cuid())
  organizationId String
  projectId      String
  externalUserId String
  namespace      String       @default("default")

  content        String       @db.Text
  embedding      Unsupported("vector(1536)")? // 1536-dim vector for embeddings

  type           MemoryType   @default(FACT)
  status         MemoryStatus @default(ACTIVE)

  importance     Float        @default(0.5)
  confidence     Float        @default(1.0)

  sourceType     String?
  sourceId       String?
  metadata       Json?
  lastAccessedAt DateTime?
  expiresAt      DateTime?

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  project        Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  versions       MemoryVersion[]

  @@index([organizationId, projectId, externalUserId, status])
  @@index([projectId, externalUserId, namespace, status])
  @@index([projectId, status])
  @@index([expiresAt])
  @@map("memories")
}

// 6. Memory Version Audit History
model MemoryVersion {
  id              String   @id @default(cuid())
  memoryId        String
  content         String   @db.Text
  previousContent String?  @db.Text
  changeReason    String?  // e.g. "INITIAL", "DEDUPLICATED_REINFORCEMENT", "CONFLICT_OVERRIDE"
  createdAt       DateTime @default(now())

  memory Memory @relation(fields: [memoryId], references: [id], onDelete: Cascade)

  @@index([memoryId])
  @@map("memory_versions")
}
```

---

## 7. API Specification & Endpoints

All public `/v1/memories` endpoints require standard **Bearer Token Authentication**:
```http
Authorization: Bearer rl_live_your_api_key_here
```

### 1. Store a Single Memory
- **Route:** `POST /v1/memories`
- **Request Body:**
  ```json
  {
    "user_id": "user_alex_99",
    "content": "User strictly prefers Next.js App Router and Vanilla CSS tokens.",
    "namespace": "preferences",
    "type": "PREFERENCE",
    "importance": 0.95
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "statusCode": 201,
    "data": {
      "id": "mem_a82bf91c",
      "content": "User strictly prefers Next.js App Router and Vanilla CSS tokens.",
      "type": "PREFERENCE",
      "importance": 0.95,
      "confidence": 1.0,
      "status": "ACTIVE"
    }
  }
  ```

---

### 2. Hybrid Semantic Vector Search
- **Route:** `POST /v1/memories/search`
- **Request Body:**
  ```json
  {
    "user_id": "user_alex_99",
    "query": "What frontend framework does the user like?",
    "namespace": "preferences",
    "limit": 3
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "memories": [
        {
          "id": "mem_a82bf91c",
          "content": "User strictly prefers Next.js App Router and Vanilla CSS tokens.",
          "similarity": 0.892,
          "finalScore": 0.931,
          "scoreBreakdown": {
            "semanticSimilarity": 0.892,
            "importance": 0.95,
            "confidence": 1.0,
            "recency": 0.985
          }
        }
      ]
    }
  }
  ```

---

### 3. Generate Formatted Prompt Context (Recommended for Agents)
- **Route:** `POST /v1/memories/context`
- **Request Body:**
  ```json
  {
    "user_id": "user_alex_99",
    "query": "Recommend stack for new project",
    "limit": 5
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": {
      "contextText": "Relevant user memories:\n- User strictly prefers Next.js App Router and Vanilla CSS tokens.\n- User is building Remora AI memory infrastructure.\nUse these memories only when relevant.",
      "memories": [...]
    }
  }
  ```

---

### 4. Asynchronous Conversation Ingestion (Non-blocking)
- **Route:** `POST /v1/memories/ingest`
- **Request Body:**
  ```json
  {
    "user_id": "user_alex_99",
    "messages": [
      { "role": "user", "content": "I live in Bangalore and work on high-throughput backend systems." },
      { "role": "assistant", "content": "Great! How can I help with your architecture?" }
    ]
  }
  ```
- **Response (202 Accepted):**
  ```json
  {
    "success": true,
    "statusCode": 202,
    "message": "Conversation enqueued for background entity extraction"
  }
  ```

---

### 5. GDPR Article 17 "Forget User" (Purge)
- **Route:** `DELETE /v1/memories/users/:userId`
- **Response (200 OK):**
  Permanently cascades and deletes all memories, vectors, and version logs tied to `userId` across the tenant's project.

---

### 6. GDPR Article 20 Data Portability Export
- **Route:** `GET /v1/memories/users/:userId/export`
- **Response (200 OK):**
  Returns complete structured JSON audit archive of all memories and chronological versions for regulatory compliance.

---

## 8. Multi-Tenant Isolation & Enterprise Security

### 1. Triple-Scope Isolation Filter
Vectors are **never queried globally**. Every query executed by the database engine is strictly scoped:
```sql
WHERE "organizationId" = $tenantOrgId 
  AND "projectId" = $tenantProjectId 
  AND "externalUserId" = $tenantUserId 
  AND "status" = 'ACTIVE'
```
Cross-tenant vector leakage is mathematically impossible at the database engine level.

### 2. SHA-256 API Key Storage
API keys use the standard live prefix pattern:
`rl_live_6c9e27c...`
- The plain key is shown **once** to the developer at generation.
- The backend computes `SHA-256(key)` and stores only the hash in `api_keys.keyHash`.
- Authentication uses constant-time hash comparisons to prevent timing attacks.

---

## 9. Multi-LLM & Embedding Provider Flexibility

Remora is completely provider-agnostic. It adheres to the standard OpenAI-compatible base specification:

### Configuration in `backend/.env`:
```env
# 1. Groq (Ultra-low latency inference)
OPENAI_BASE_URL="https://api.groq.com/openai/v1"
OPENAI_API_KEY="gsk_..."
DEFAULT_LLM_MODEL="openai/gpt-oss-120b"

# 2. Google Gemini (via OpenAI-compatible endpoint)
# OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai/"
# OPENAI_API_KEY="AIzaSy..."
# DEFAULT_LLM_MODEL="gemini-2.0-flash"

# 3. Local Ollama (100% offline & free)
# OPENAI_BASE_URL="http://localhost:11434/v1"
# OPENAI_API_KEY="ollama"
# DEFAULT_LLM_MODEL="llama3.2"

# 4. Standard OpenAI
# OPENAI_API_KEY="sk-proj-..."
# DEFAULT_LLM_MODEL="gpt-4o-mini"
# DEFAULT_EMBEDDING_MODEL="text-embedding-3-small"
```

### Deterministic Embedding Fallback:
If an alternative provider (such as Groq or a lightweight local model) does not offer a dedicated `/v1/embeddings` endpoint, Remora's `OpenAIEmbeddingProvider` gracefully activates its internal deterministic pseudo-embedding algorithm, ensuring 1536-dimensional vector operations and HNSW indexing continue operating without crashing.

---

## 10. TypeScript SDK (`@remora/sdk`) & Integration Patterns

The official TypeScript SDK is located at `sdks/typescript/src`.

### Installation & Initialization
```typescript
import { RemoraClient } from "@remora/sdk";

const remora = new RemoraClient({
  apiKey: process.env.REMORA_API_KEY!,
  baseUrl: process.env.REMORA_API_URL || "http://localhost:4003"
});
```

### Pattern 1: Ingesting Memories During User Interaction
```typescript
await remora.add({
  userId: "user_alex",
  content: "User strictly prefers TypeScript with Next.js App Router and Vanilla CSS.",
  type: "PREFERENCE",
  importance: 0.95
});
```

### Pattern 2: Context Retrieval for LLM System Prompt
```typescript
const context = await remora.context({
  userId: "user_alex",
  query: userQuery
});

// context.contextText outputs:
// "Relevant user memories:
// - User strictly prefers TypeScript with Next.js App Router and Vanilla CSS.
// Use these memories only when relevant."
```

### Pattern 3: Injecting Context into an Agent Chat Completion
```typescript
import OpenAI from "openai";

const openai = new OpenAI();

// Fetch memories from Remora
const memory = await remora.context({
  userId: currentUserId,
  query: userPrompt
});

// Inject into System Message
const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "system",
      content: `You are an expert AI assistant. Personalize your answers using the following verified user memories:\n${memory.contextText}`
    },
    {
      role: "user",
      content: userPrompt
    }
  ]
});
```

---

## 11. Prompt Injection Standard: The `<user_context>` Contract

To prevent LLM hallucination and ensure prompt hygiene, Remora outputs retrieved memories wrapped inside clear boundary delimiters:

```xml
<user_context>
Relevant user memories:
- User strictly prefers TypeScript with Next.js App Router and Vanilla CSS tokens.
- User is building Remora: an enterprise AI Memory Infrastructure using Neon pgvector.
- User is based in India and is fond of minimalistic editorial serif typography.
Use these memories only when relevant.
</user_context>
```

### Why this format works:
1. **Clear Delimiters:** Prevents prompt injection attacks where malicious user input tries to impersonate memory.
2. **Defensive Directive:** *"Use these memories only when relevant"* prevents the LLM from awkwardly shoehorning every memory into every answer.
3. **High Information Density:** Uses compact bullet points instead of verbose JSON, saving up to 70% of prompt tokens.

---

## 12. Feature Matrix: Remora vs. Traditional Approaches

| Capability | Naive In-Memory Chat | Custom Postgres Table | Standalone Vector DB (Pinecone/Chroma) | Remora Memory Engine |
|---|---|---|---|---|
| **Cross-Session Persistence** | ❌ (Resets on refresh) | ⚠️ (Requires custom query logic) | ⚠️ (Requires metadata stitching) | **✅ Native & Automated** |
| **Cognitive Categorization** | ❌ | ⚠️ (Manual enum) | ❌ (Untyped strings) | **✅ 11 Strict Cognitive Types** |
| **Ebbinghaus Time Decay** | ❌ | ❌ (Complex math to implement) | ❌ | **✅ Automated Adaptive Decay** |
| **Near-Duplicate Merge (>0.93)**| ❌ | ❌ (Causes duplicate rows) | ❌ | **✅ Confidence Reinforcement** |
| **Contradiction Resolution** | ❌ | ❌ | ❌ | **✅ Audit Lineage (`MemoryVersion`)** |
| **Sub-15ms Vector Search** | ❌ | ⚠️ (Requires tuning HNSW) | ⚠️ (Secondary network hop) | **✅ Pre-tuned Neon HNSW Index** |
| **Phatic Noise Filtering** | ❌ | ❌ | ❌ | **✅ Two-Tier Regex + LLM Gating** |
| **Two-Tier Hot Caching** | ❌ | ❌ (Hits DB every prompt) | ❌ | **✅ 1ms Redis 7 Cache** |
| **GDPR Compliance (Art 17/20)** | ❌ | ⚠️ (Must build purge/export) | ⚠️ | **✅ 1-Click Purge & Export** |
| **Multi-Tenant Key Hashing** | ❌ | ⚠️ (Must build auth layer) | ⚠️ | **✅ SHA-256 Hashed Project Keys** |

---

## 🏁 Summary for AI Agents & Engineers

When integrating Remora into any AI Agent or autonomous workflow:
1. **Do not create custom memory tables.**
2. Initialize `@remora/sdk` with `REMORA_API_KEY`.
3. Use `remora.add()` to store facts or `remora.ingest()` for raw conversation threads.
4. Call `remora.context()` before emitting an LLM completion and inject `contextText` into the system prompt.
5. Remora automatically handles vectorization, deduplication, time decay, pgvector querying, and prompt hygiene.
