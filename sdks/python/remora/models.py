from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Literal

MemoryType = Literal[
    "FACT",
    "PREFERENCE",
    "GOAL",
    "INSTRUCTION",
    "DECISION",
    "PROFILE",
    "RELATIONSHIP",
    "PROJECT_CONTEXT",
    "BEHAVIOR",
    "TEMPORARY",
    "OTHER"
]

MemoryStatus = Literal[
    "ACTIVE",
    "SUPERSEDED",
    "ARCHIVED",
    "DELETED",
    "EXPIRED"
]

@dataclass
class ScoreBreakdown:
    semantic_similarity: float
    importance: float
    confidence: float
    recency: float

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ScoreBreakdown":
        return cls(
            semantic_similarity=data.get("semanticSimilarity", 0.0),
            importance=data.get("importance", 0.0),
            confidence=data.get("confidence", 0.0),
            recency=data.get("recency", 0.0),
        )

@dataclass
class Memory:
    id: str
    organization_id: str
    project_id: str
    external_user_id: str
    namespace: str
    content: str
    type: str
    status: str
    importance: float
    confidence: float
    created_at: str
    updated_at: str
    last_accessed_at: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    versions: Optional[List[Dict[str, Any]]] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Memory":
        return cls(
            id=data.get("id", ""),
            organization_id=data.get("organizationId", ""),
            project_id=data.get("projectId", ""),
            external_user_id=data.get("externalUserId", ""),
            namespace=data.get("namespace", "default"),
            content=data.get("content", ""),
            type=data.get("type", "FACT"),
            status=data.get("status", "ACTIVE"),
            importance=float(data.get("importance", 0.5)),
            confidence=float(data.get("confidence", 1.0)),
            last_accessed_at=data.get("lastAccessedAt"),
            created_at=data.get("createdAt", ""),
            updated_at=data.get("updatedAt", ""),
            metadata=data.get("metadata"),
            versions=data.get("versions"),
        )

@dataclass
class RankedMemory(Memory):
    final_score: float = 0.0
    score_breakdown: Optional[ScoreBreakdown] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "RankedMemory":
        base = super().from_dict(data)
        breakdown = None
        if "scoreBreakdown" in data and isinstance(data["scoreBreakdown"], dict):
            breakdown = ScoreBreakdown.from_dict(data["scoreBreakdown"])

        return cls(
            id=base.id,
            organization_id=base.organization_id,
            project_id=base.project_id,
            external_user_id=base.external_user_id,
            namespace=base.namespace,
            content=base.content,
            type=base.type,
            status=base.status,
            importance=base.importance,
            confidence=base.confidence,
            last_accessed_at=base.last_accessed_at,
            created_at=base.created_at,
            updated_at=base.updated_at,
            metadata=base.metadata,
            versions=base.versions,
            final_score=float(data.get("finalScore", 0.0)),
            score_breakdown=breakdown
        )

@dataclass
class ContextResult:
    context_text: str
    memories: List[RankedMemory] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ContextResult":
        memories_raw = data.get("memories", [])
        memories = [RankedMemory.from_dict(m) for m in memories_raw]
        return cls(
            context_text=data.get("contextText", ""),
            memories=memories
        )

@dataclass
class IngestResult:
    ingested: Optional[int] = None
    job_id: Optional[str] = None
    status: Optional[str] = None
    memories: List[Memory] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "IngestResult":
        memories_raw = data.get("memories", [])
        memories = [Memory.from_dict(m) for m in memories_raw]
        return cls(
            ingested=data.get("ingested"),
            job_id=data.get("jobId"),
            status=data.get("status"),
            memories=memories
        )
