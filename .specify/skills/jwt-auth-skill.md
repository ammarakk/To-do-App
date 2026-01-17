# JWT Verification Skill for FastAPI

**Skill Type**: Authentication & Security
**Stateless**: Yes
**Purpose**: Reusable JWT verification for FastAPI APIs using Supabase Auth

---

## Skill Definition

### Purpose

Validate Supabase JWT tokens in FastAPI endpoints and extract authenticated user context. This skill provides stateless JWT verification that:
- Uses Supabase public keys for token validation
- Extracts `user_id` safely from verified tokens
- Fails closed (denies access on any error)
- Provides typed FastAPI dependencies for easy use

### Rules

1. **Stateless**: No session storage, no in-memory state
2. **Supabase Public Keys**: Use JWKS endpoint for token verification
3. **Safe Extraction**: Parse and validate all token claims
4. **Fail Closed**: Any validation error returns 401 Unauthorized
5. **Type Safety**: Full Python type hints for all functions

---

## Implementation

### File: `backend/src/services/auth_service.py`

```python
"""
JWT Verification Service for Supabase Auth

This module provides stateless JWT verification using Supabase's public keys.
All functions follow the "fail closed" principle - any error results in denial.

Dependencies:
    - PyJWT: JWT decoding and verification
    - cryptography: RSA public key verification
    - httpx: Async HTTP client for fetching JWKS
"""

import jwt
from jwt import PyJWKClient, PyJWKClientError
from jwt.exceptions import InvalidTokenError, DecodeError
from typing import Optional, Dict, Any
from pydantic import BaseModel, ValidationError
import httpx
from functools import lru_cache


class TokenPayload(BaseModel):
    """Validated JWT token payload with essential claims."""

    sub: str  # Subject (user_id)
    email: Optional[str] = None
    exp: int  # Expiration time
    aud: str  # Audience (authenticated)
    role: str = "authenticated"
    metadata: Optional[Dict[str, Any]] = None


class JWTError(Exception):
    """Base exception for JWT verification errors."""

    def __init__(self, message: str, code: str = "INVALID_TOKEN"):
        self.message = message
        self.code = code
        super().__init__(message)


class TokenExpiredError(JWTError):
    """Raised when JWT token has expired."""

    def __init__(self):
        super().__init__("Token has expired", "TOKEN_EXPIRED")


class TokenInvalidError(JWTError):
    """Raised when JWT token is invalid or malformed."""

    def __init__(self, detail: str = "Invalid token"):
        super().__init__(detail, "INVALID_TOKEN")


class JWKSFetchError(JWTError):
    """Raised when unable to fetch JWKS from Supabase."""

    def __init__(self):
        super().__init__("Failed to fetch public keys from Supabase", "JWKS_FETCH_ERROR")


class JWTVerifier:
    """
    Stateless JWT verifier using Supabase's JWKS endpoint.

    This verifier fetches and caches Supabase's public keys (JWKS) and
    validates JWT tokens against them. All verification is stateless.
    """

    def __init__(self, supabase_url: str):
        """
        Initialize the JWT verifier.

        Args:
            supabase_url: Supabase project URL (e.g., https://xxx.supabase.co)
        """
        self.jwks_url = f"{supabase_url}/.well-known/jwks.json"
        self._jwks_client: Optional[PyJWKClient] = None

    async def _get_jwks_client(self) -> PyJWKClient:
        """
        Get or initialize the JWKS client.

        Returns:
            PyJWKClient: Cached JWKS client for key verification

        Raises:
            JWKSFetchError: If unable to fetch JWKS from Supabase
        """
        if self._jwks_client is None:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.get(self.jwks_url)
                    response.raise_for_status()
                    self._jwks_client = PyJWKClient(self.jwks_url)
            except httpx.HTTPError as e:
                raise JWKSFetchError() from e
        return self._jwks_client

    async def verify(self, token: str) -> TokenPayload:
        """
        Verify a JWT token and extract its payload.

        Args:
            token: JWT token string (Bearer token without "Bearer " prefix)

        Returns:
            TokenPayload: Validated token payload with user claims

        Raises:
            TokenExpiredError: If token has expired
            TokenInvalidError: If token is invalid or malformed
            JWKSFetchError: If unable to fetch Supabase public keys
        """
        try:
            jwks_client = await self._get_jwks_client()

            # Decode and verify token using JWKS
            decoded = jwt.decode(
                token,
                key=jwks_client.get_signing_key_from_jwt(token).key,
                algorithms=["RS256"],
                options={
                    "verify_signature": True,
                    "require": ["sub", "exp", "aud"],
                },
            )

            # Validate payload structure
            try:
                payload = TokenPayload(**decoded)
            except ValidationError as e:
                raise TokenInvalidError(f"Invalid token payload: {e}")

            return payload

        except jwt.ExpiredSignatureError:
            raise TokenExpiredError()
        except (InvalidTokenError, DecodeError, PyJWKClientError) as e:
            raise TokenInvalidError(str(e))


# Global verifier instance (created at application startup)
_verifier: Optional[JWTVerifier] = None


def get_verifier() -> JWTVerifier:
    """
    Get the global JWT verifier instance.

    Returns:
        JWTVerifier: The verifier instance

    Raises:
        RuntimeError: If verifier has not been initialized
    """
    if _verifier is None:
        raise RuntimeError("JWT verifier not initialized. Call init_jwt_verifier() first.")
    return _verifier


def init_jwt_verifier(supabase_url: str) -> None:
    """
    Initialize the global JWT verifier.

    Should be called once during application startup.

    Args:
        supabase_url: Supabase project URL
    """
    global _verifier
    _verifier = JWTVerifier(supabase_url)


async def verify_jwt_token(token: str) -> TokenPayload:
    """
    Convenience function to verify a JWT token.

    Args:
        token: JWT token string

    Returns:
        TokenPayload: Validated token payload

    Raises:
        JWTError: If token verification fails
    """
    verifier = get_verifier()
    return await verifier.verify(token)
```

---

### File: `backend/src/api/deps.py`

```python
"""
FastAPI Dependencies for JWT Authentication

Provides reusable dependencies for extracting authenticated users from JWT tokens.
All dependencies follow the "fail closed" principle - invalid tokens result in 401.
"""

from fastapi import Header, HTTPException, status, Depends
from typing import Optional
from pydantic import BaseModel, EmailStr

from ..services.auth_service import (
    verify_jwt_token,
    TokenPayload,
    JWTError,
    TokenExpiredError,
    TokenInvalidError,
)


class AuthenticatedUser(BaseModel):
    """Authenticated user context extracted from JWT."""

    user_id: str
    email: Optional[str] = None
    token_payload: TokenPayload


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> AuthenticatedUser:
    """
    FastAPI dependency to extract authenticated user from JWT token.

    This dependency should be used in protected endpoints to ensure
    only authenticated users can access them.

    Args:
        authorization: Authorization header value (Bearer token)

    Returns:
        AuthenticatedUser: User context with user_id and email

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired
    """
    if authorization is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization[7:]  # Remove "Bearer " prefix

    try:
        payload = await verify_jwt_token(token)
        return AuthenticatedUser(
            user_id=payload.sub,
            email=payload.email,
            token_payload=payload,
        )
    except TokenExpiredError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except TokenInvalidError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {e.message}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {e.message}",
            headers={"WWW-Authenticate": "Bearer"},
        )


# Optional: Alias for better readability
RequireAuth = Depends(get_current_user)
```

---

### File: `backend/src/config.py`

```python
"""
Application configuration with environment variable loading.

Uses pydantic-settings for type-safe configuration management.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Supabase Configuration
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str  # ⚠️ Keep secret, never expose to frontend

    # Backend Configuration
    API_HOST: str = "localhost"
    API_PORT: int = 8000
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]

    # Environment
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Global settings instance
settings = Settings()
```

---

### File: `backend/src/main.py` (Updated to initialize JWT verifier)

```python
"""
FastAPI Application Entry Point

Initializes the FastAPI app with JWT verification and middleware.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .config import settings
from .services.auth_service import init_jwt_verifier
from .api.routes import todos, health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Initializes JWT verifier on startup and cleanup on shutdown.
    """
    # Startup
    init_jwt_verifier(settings.SUPABASE_URL)
    yield
    # Shutdown (if needed)
    pass


app = FastAPI(
    title="Todo API",
    description="Multi-user todo application with Supabase Auth",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/health", tags=["health"])
app.include_router(todos.router, prefix="/api/todos", tags=["todos"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {"status": "ok", "version": "1.0.0"}
```

---

### File: `backend/src/api/routes/todos.py` (Example usage)

```python
"""
Todo CRUD endpoints with JWT authentication.

All endpoints require valid JWT token via get_current_user dependency.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from ..deps import AuthenticatedUser, get_current_user
from ...models.schemas import TodoCreate, TodoUpdate, TodoResponse


router = APIRouter()


@router.get("/", response_model=List[TodoResponse])
async def list_todos(
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    List all todos for the authenticated user.

    Requires valid JWT token.
    """
    # Use current_user.user_id for user-isolated queries
    pass


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoCreate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Create a new todo for the authenticated user.

    Requires valid JWT token.
    """
    # Use current_user.user_id for user-isolated insertion
    pass


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Get a specific todo by ID.

    Requires valid JWT token and user ownership verification.
    """
    # Verify todo belongs to current_user.user_id
    pass


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    todo: TodoUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Update a specific todo.

    Requires valid JWT token and user ownership verification.
    """
    # Verify todo belongs to current_user.user_id
    pass


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Delete a specific todo.

    Requires valid JWT token and user ownership verification.
    """
    # Verify todo belongs to current_user.user_id
    pass
```

---

## Usage Examples

### Example 1: Protected Endpoint

```python
from fastapi import Depends
from ..api.deps import AuthenticatedUser, get_current_user

@router.get("/api/protected")
async def protected_endpoint(user: AuthenticatedUser = Depends(get_current_user)):
    return {"message": f"Hello {user.email}", "user_id": user.user_id}
```

### Example 2: Using RequireAuth Alias

```python
from fastapi import Depends
from ..api.deps import AuthenticatedUser, RequireAuth

@router.post("/api/todos")
async def create_todo(
    todo: TodoCreate,
    user: AuthenticatedUser = RequireAuth  # Cleaner syntax
):
    # user.user_id is guaranteed to be valid here
    pass
```

---

## Dependencies (pyproject.toml)

```toml
[project]
dependencies = [
    "fastapi>=0.109.0",
    "uvicorn[standard]>=0.27.0",
    "pydantic>=2.5.0",
    "pydantic-settings>=2.1.0",
    "pyjwt>=2.8.0",
    "cryptography>=41.0.0",
    "httpx>=0.26.0",
    "python-dotenv>=1.0.0",
    "supabase>=2.3.0",
]
```

---

## Environment Variables (.env)

```bash
# Required
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Optional
API_HOST=localhost
API_PORT=8000
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
ENVIRONMENT=development
```

---

## Testing

### Test File: `backend/tests/unit/test_auth_service.py`

```python
"""
Unit tests for JWT verification service.
"""

import pytest
from datetime import datetime, timedelta
import jwt

from src.services.auth_service import (
    JWTVerifier,
    TokenPayload,
    TokenExpiredError,
    TokenInvalidError,
)


@pytest.fixture
def mock_supabase_url():
    return "https://test-project.supabase.co"


@pytest.fixture
def verifier(mock_supabase_url):
    return JWTVerifier(mock_supabase_url)


@pytest.mark.asyncio
async def test_verify_valid_token(verifier):
    """Test successful token verification."""
    # Create a mock valid token
    payload = {
        "sub": "user-123",
        "email": "test@example.com",
        "exp": (datetime.utcnow() + timedelta(hours=1)).timestamp(),
        "aud": "authenticated",
        "role": "authenticated",
    }
    token = jwt.encode(payload, "secret", algorithm="HS256")

    # This test would need mocking of the JWKS client
    # or integration test with real Supabase
    pass


@pytest.mark.asyncio
async def test_verify_expired_token(verifier):
    """Test that expired tokens raise TokenExpiredError."""
    expired_payload = {
        "sub": "user-123",
        "exp": (datetime.utcnow() - timedelta(hours=1)).timestamp(),
    }
    token = jwt.encode(expired_payload, "secret", algorithm="HS256")

    with pytest.raises(TokenExpiredError):
        await verifier.verify(token)
```

---

## Security Considerations

1. **Never expose service_role key**: Keep in backend `.env` only
2. **Always validate tokens**: Use `get_current_user` on protected endpoints
3. **HTTPS only**: Never send tokens over unencrypted connections
4. **Token expiry**: Supabase tokens expire in 1 hour by default
5. **User isolation**: Always use `user_id` from token, not from request body

---

## References

- [Supabase Auth Overview](https://supabase.com/docs/guides/auth)
- [PyJWT Documentation](https://pyjwt.readthedocs.io/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [JWKS Specification](https://datatracker.ietf.org/doc/html/rfc7517)
