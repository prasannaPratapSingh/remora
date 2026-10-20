"""
Remora Python SDK
~~~~~~~~~~~~~~~~~
Official Python client library for Remora AI Memory Infrastructure.
"""

from .client import RemoraClient
from .models import (
    Memory,
    RankedMemory,
    ContextResult,
    IngestResult,
    ScoreBreakdown,
    MemoryType,
    MemoryStatus
)
from .exceptions import (
    RemoraError,
    AuthenticationError,
    NotFoundError,
    RateLimitError
)

__version__ = "0.1.0"
__all__ = [
    "RemoraClient",
    "Memory",
    "RankedMemory",
    "ContextResult",
    "IngestResult",
    "ScoreBreakdown",
    "MemoryType",
    "MemoryStatus",
    "RemoraError",
    "AuthenticationError",
    "NotFoundError",
    "RateLimitError"
]
