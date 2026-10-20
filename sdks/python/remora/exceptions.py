class RemoraError(Exception):
    """Base exception for all Remora errors."""
    def __init__(self, message: str, status_code: int = 500, raw_response: dict = None):
        super().__init__(message)
        self.status_code = status_code
        self.raw_response = raw_response or {}

class AuthenticationError(RemoraError):
    """Raised when the API key is missing, invalid, expired, or revoked."""
    def __init__(self, message: str = "Unauthorized: Invalid or missing API key.", raw_response: dict = None):
        super().__init__(message, status_code=401, raw_response=raw_response)

class NotFoundError(RemoraError):
    """Raised when a requested resource (e.g. memory ID) does not exist."""
    def __init__(self, message: str = "Resource not found.", raw_response: dict = None):
        super().__init__(message, status_code=404, raw_response=raw_response)

class RateLimitError(RemoraError):
    """Raised when the API key exceeds its sliding window rate limit."""
    def __init__(self, message: str = "Rate limit exceeded.", retry_after: int = None, raw_response: dict = None):
        super().__init__(message, status_code=429, raw_response=raw_response)
        self.retry_after = retry_after
