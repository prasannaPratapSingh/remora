# @ai-remora/sdk

> **Developer-first AI Memory Infrastructure Client** for persistent, evolving agent memory.

---

## 📦 Installation

```bash
npm install @ai-remora/sdk
# or
bun add @ai-remora/sdk
```

---

## 🚀 Quickstart

```typescript
import { RemoraClient } from "@ai-remora/sdk";

const remora = new RemoraClient({
    apiKey: process.env.REMORA_API_KEY || "rl_live_your_key_here",
    baseUrl: "http://localhost:3000" // optional, defaults to http://localhost:3000
});

// 1. Ingest a conversation (async background extraction)
await remora.ingest({
    userId: "usr_alice",
    messages: [
        { role: "user", content: "I love coding in TypeScript and using Neon Postgres." }
    ]
});

// 2. Fetch compact prompt-ready context before replying
const context = await remora.context({
    userId: "usr_alice",
    query: "What tech stack should I recommend?"
});

console.log(context.contextText);
/*
Relevant user memories:
- User loves coding in TypeScript and using Neon Postgres.
Use these memories only when relevant.
*/

// 3. Inject context into your LLM prompt
const prompt = `${context.contextText}\n\nUser: Recommend a database for my next project.`;
```

---

## 📚 API Reference

### `remora.add(options)`
Directly store an individual memory:
```typescript
await remora.add({
    userId: "usr_alice",
    content: "User prefers concise technical responses.",
    type: "PREFERENCE",
    importance: 0.85
});
```

### `remora.search(options)`
Perform semantic vector search with hybrid scoring (similarity + importance + confidence + recency):
```typescript
const memories = await remora.search({
    userId: "usr_alice",
    query: "communication style preferences",
    limit: 5
});
```

### `remora.context(options)`
Retrieve top relevant memories and format them into a compact text block for LLM prompt injection.

### `remora.ingest(options)`
Extract memories automatically from raw conversation turns:
- `sync: false` (default) $\rightarrow$ returns `202 Accepted` + `jobId` immediately (zero chatbot latency).
- `sync: true` $\rightarrow$ blocks until memories are extracted and saved.

### `remora.list(options)`
Paginated list of all stored memories for a user.

### `remora.delete(memoryId)`
Soft-deletes a memory.
