import unittest
from remora.models import Memory, RankedMemory, ContextResult, ScoreBreakdown
from remora.client import RemoraClient
from remora.exceptions import AuthenticationError

class TestRemoraSDK(unittest.TestCase):
    def test_client_init_requires_key(self):
        with self.assertRaises(AuthenticationError):
            RemoraClient(api_key="")

    def test_memory_model_deserialization(self):
        raw = {
            "id": "mem_123",
            "organizationId": "org_abc",
            "projectId": "proj_xyz",
            "externalUserId": "usr_alice",
            "namespace": "personal",
            "content": "User prefers dark mode.",
            "type": "PREFERENCE",
            "status": "ACTIVE",
            "importance": 0.8,
            "confidence": 0.95,
            "createdAt": "2026-10-20T12:00:00Z",
            "updatedAt": "2026-10-20T12:00:00Z"
        }

        memory = Memory.from_dict(raw)
        self.assertEqual(memory.id, "mem_123")
        self.assertEqual(memory.content, "User prefers dark mode.")
        self.assertEqual(memory.importance, 0.8)
        self.assertEqual(memory.confidence, 0.95)

    def test_ranked_memory_deserialization(self):
        raw = {
            "id": "mem_123",
            "organizationId": "org_abc",
            "projectId": "proj_xyz",
            "externalUserId": "usr_alice",
            "namespace": "default",
            "content": "User prefers Python.",
            "type": "PREFERENCE",
            "status": "ACTIVE",
            "importance": 0.8,
            "confidence": 0.9,
            "finalScore": 0.895,
            "scoreBreakdown": {
                "semanticSimilarity": 0.92,
                "importance": 0.8,
                "confidence": 0.9,
                "recency": 0.95
            },
            "createdAt": "2026-10-20T12:00:00Z",
            "updatedAt": "2026-10-20T12:00:00Z"
        }

        ranked = RankedMemory.from_dict(raw)
        self.assertEqual(ranked.final_score, 0.895)
        self.assertIsNotNone(ranked.score_breakdown)
        self.assertEqual(ranked.score_breakdown.semantic_similarity, 0.92)

    def test_context_result_deserialization(self):
        raw = {
            "contextText": "Relevant user memories:\n- User likes Python.",
            "memories": [
                {
                    "id": "mem_1",
                    "content": "User likes Python.",
                    "finalScore": 0.9
                }
            ]
        }

        ctx = ContextResult.from_dict(raw)
        self.assertIn("Relevant user memories:", ctx.context_text)
        self.assertEqual(len(ctx.memories), 1)

if __name__ == "__main__":
    unittest.main()
