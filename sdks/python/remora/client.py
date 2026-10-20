import json
import urllib.request
import urllib.error
from typing import Optional, List, Dict, Any, Union

from .models import Memory, RankedMemory, ContextResult, IngestResult, MemoryType, MemoryStatus
from .exceptions import RemoraError, AuthenticationError, NotFoundError, RateLimitError

class RemoraClient:
    """
    Synchronous Python Client for Remora AI Memory Infrastructure.
    Zero external dependencies required (uses standard library urllib).
    """

    def __init__(self, api_key: str, base_url: str = "http://localhost:4001", timeout: float = 30.0):
        if not api_key:
            raise AuthenticationError("RemoraClient: api_key is required.")
        self.api_key = api_key.strip()
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    def _request(self, method: str, path: str, payload: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "remora-python-sdk/0.1.0"
        }

        data_bytes = None
        if payload is not None:
            data_bytes = json.dumps(payload).encode("utf-8")

        req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)

        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as response:
                status_code = response.getcode()
                body = response.read().decode("utf-8")
                parsed = json.loads(body) if body else {}
                return parsed.get("data", {})
        except urllib.error.HTTPError as e:
            raw_body = e.read().decode("utf-8") if e.fp else ""
            error_json = {}
            try:
                error_json = json.loads(raw_body)
            except Exception:
                pass

            message = error_json.get("message", f"HTTP Error {e.code}: {e.reason}")

            if e.code == 401:
                raise AuthenticationError(message, raw_response=error_json)
            elif e.code == 404:
                raise NotFoundError(message, raw_response=error_json)
            elif e.code == 429:
                retry_after = e.headers.get("Retry-After")
                retry_sec = int(retry_after) if retry_after and retry_after.isdigit() else None
                raise RateLimitError(message, retry_after=retry_sec, raw_response=error_json)
            else:
                raise RemoraError(message, status_code=e.code, raw_response=error_json)
        except urllib.error.URLError as e:
            raise RemoraError(f"Connection error to Remora at {url}: {e.reason}")

    def add(
        self,
        user_id: str,
        content: str,
        namespace: str = "default",
        type: MemoryType = "FACT",
        importance: float = 0.5,
        confidence: float = 1.0,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Memory:
        """Store a durable memory for an end-user."""
        payload = {
            "user_id": user_id,
            "content": content,
            "namespace": namespace,
            "type": type,
            "importance": importance,
            "confidence": confidence,
            "metadata": metadata or {}
        }
        res = self._request("POST", "/v1/memories", payload)
        return Memory.from_dict(res)

    def search(
        self,
        user_id: str,
        query: str,
        namespace: Optional[str] = None,
        limit: int = 5
    ) -> List[RankedMemory]:
        """Search memories with semantic vector similarity and hybrid ranking."""
        payload: Dict[str, Any] = {
            "user_id": user_id,
            "query": query,
            "limit": limit
        }
        if namespace:
            payload["namespace"] = namespace

        res = self._request("POST", "/v1/memories/search", payload)
        if isinstance(res, list):
            return [RankedMemory.from_dict(m) for m in res]
        return []

    def context(
        self,
        user_id: str,
        query: str,
        namespace: Optional[str] = None,
        limit: int = 5
    ) -> ContextResult:
        """Retrieve prompt-ready formatted context text to inject directly into an LLM."""
        payload: Dict[str, Any] = {
            "user_id": user_id,
            "query": query,
            "limit": limit
        }
        if namespace:
            payload["namespace"] = namespace

        res = self._request("POST", "/v1/memories/context", payload)
        return ContextResult.from_dict(res)

    def ingest(
        self,
        user_id: str,
        messages: List[Dict[str, str]],
        namespace: str = "default",
        sync: bool = False
    ) -> IngestResult:
        """
        Extract memories automatically from raw conversation turns.
        Defaults to sync=False (returns 202 Accepted + jobId with zero chatbot latency).
        """
        payload = {
            "user_id": user_id,
            "messages": messages,
            "namespace": namespace,
            "sync": sync
        }
        res = self._request("POST", "/v1/memories/ingest", payload)
        return IngestResult.from_dict(res)

    def get(self, memory_id: str) -> Memory:
        """Get single memory by ID along with its evolution versions."""
        res = self._request("GET", f"/v1/memories/{memory_id}")
        return Memory.from_dict(res)

    def update(
        self,
        memory_id: str,
        content: Optional[str] = None,
        importance: Optional[float] = None,
        confidence: Optional[float] = None,
        type: Optional[MemoryType] = None,
        status: Optional[MemoryStatus] = None
    ) -> Memory:
        """Update a memory (automatically logs a MemoryVersion audit entry)."""
        payload: Dict[str, Any] = {}
        if content is not None:
            payload["content"] = content
        if importance is not None:
            payload["importance"] = importance
        if confidence is not None:
            payload["confidence"] = confidence
        if type is not None:
            payload["type"] = type
        if status is not None:
            payload["status"] = status

        res = self._request("PATCH", f"/v1/memories/{memory_id}", payload)
        return Memory.from_dict(res)

    def delete(self, memory_id: str) -> Memory:
        """Soft-delete a memory."""
        res = self._request("DELETE", f"/v1/memories/{memory_id}")
        return Memory.from_dict(res)

    def delete_user_memories(self, user_id: str) -> Dict[str, Any]:
        """GDPR / Privacy: Delete all memories for an external user."""
        return self._request("DELETE", f"/v1/memories/users/{user_id}")

    def export_user_memories(self, user_id: str) -> Dict[str, Any]:
        """Data Portability: Export all memories and version history for a user."""
        return self._request("GET", f"/v1/memories/users/{user_id}/export")

    def list(
        self,
        user_id: Optional[str] = None,
        namespace: Optional[str] = None,
        limit: int = 20,
        offset: int = 0
    ) -> Dict[str, Any]:
        """List memories with optional pagination and filters."""
        params = []
        if user_id:
            params.append(f"user_id={user_id}")
        if namespace:
            params.append(f"namespace={namespace}")
        params.append(f"limit={limit}")
        params.append(f"offset={offset}")

        query = f"?{'&'.join(params)}" if params else ""
        res = self._request("GET", f"/v1/memories{query}")
        memories = [Memory.from_dict(m) for m in res.get("memories", [])]
        return {
            "total": res.get("total", 0),
            "memories": memories
        }
