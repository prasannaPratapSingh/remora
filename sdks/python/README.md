# Remora Python SDK (`remora-ai`)

> **Developer-first AI Memory Infrastructure Client** for persistent, evolving agent memory.

---

## 📦 Installation

```bash
pip install remora-ai
```

*(Note: The client uses Python standard library `urllib` internally, requiring zero extra dependencies!)*

---

## 🚀 Quickstart

```python
from remora import RemoraClient

remora = RemoraClient(
    api_key="rl_live_your_key_here",
    base_url="http://localhost:4001"  # Defaults to http://localhost:4001
)

# 1. Ingest a conversation (async extraction with zero chatbot latency)
remora.ingest(
    user_id="usr_alice",
    messages=[
        {"role": "user", "content": "I am building a SaaS using Python and PostgreSQL."}
    ]
)

# 2. Retrieve compact prompt-ready context before replying
ctx = remora.context(
    user_id="usr_alice",
    query="What tech stack should I recommend?"
)

print(ctx.context_text)
# Output:
# Relevant user memories:
# - User is building a SaaS using Python and PostgreSQL.
# Use these memories only when relevant.

# 3. Direct memory search with hybrid ranking scores
memories = remora.search(
    user_id="usr_alice",
    query="programming language and database"
)

for m in memories:
    print(f"- {m.content} (Score: {m.final_score})")
    print(f"  Similarity: {m.score_breakdown.semantic_similarity}")
```

---

## 🤖 Integration with OpenAI / LangChain

```python
from openai import OpenAI
from remora import RemoraClient

remora = RemoraClient(api_key="rl_live_...")
openai = OpenAI()

user_id = "usr_alice"
user_message = "What database should I choose?"

# 1. Fetch relevant persistent memories
ctx = remora.context(user_id=user_id, query=user_message)

# 2. Inject context into system prompt
system_prompt = f"You are a helpful coding copilot.\n\n{ctx.context_text}"

response = openai.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_message}
    ]
)

print(response.choices[0].message.content)

# 3. Asynchronously ingest the turn for future memory formation
remora.ingest(
    user_id=user_id,
    messages=[
        {"role": "user", "content": user_message},
        {"role": "assistant", "content": response.choices[0].message.content}
    ]
)
```

---

## 📚 API Reference

- `remora.add(user_id, content, namespace="default", type="FACT", importance=0.5)`
- `remora.search(user_id, query, limit=5)`
- `remora.context(user_id, query, limit=5)`
- `remora.ingest(user_id, messages, sync=False)`
- `remora.get(memory_id)`
- `remora.update(memory_id, content="...")`
- `remora.delete(memory_id)`
- `remora.delete_user_memories(user_id)`: GDPR / Privacy wipe
- `remora.export_user_memories(user_id)`: Data portability export
