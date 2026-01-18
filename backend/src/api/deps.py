"""
FastAPI Dependencies Module

This module provides reusable dependency functions for FastAPI routes.
The primary dependency is `get_current_user()` which extracts and validates
JWT tokens from the Authorization header.

Security Rules:
- All protected routes must use get_current_user() dependency
- JWT must be in Authorization: Bearer <token> format
- Invalid/missing tokens result in 401 Unauthorized
- User context is injected into route handlers
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from models.database import get_db
from services.auth_service import get_current_user as get_current_user_service
from models.models import User


# HTTPBearer security scheme for OpenAPI documentation
security = HTTPBearer(auto_error=False)


async def get_current_user(
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    FastAPI dependency to extract and validate JWT from Authorization header.

    This dependency extracts the JWT token from the Authorization header,
    verifies it, and returns the user object. It must be used in all
    protected routes.

    Args:
        authorization: HTTPAuthorizationCredentials object containing the bearer token
                      (automatically extracted from Authorization header by FastAPI)
        db: Database session (automatically injected by FastAPI)

    Returns:
        User: Authenticated user object

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired

    Example:
        >>> from fastapi import APIRouter, Depends
        >>> from src.api.deps import get_current_user
        >>>
        >>> router = APIRouter()
        >>>
        >>> @router.get("/api/todos")
        >>> async def get_todos(user: User = Depends(get_current_user)):
        >>>     user_id = user.id
        >>>     # Use user_id to filter todos
    """
    # Check if Authorization header is present
    if authorization is None or not authorization.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "MISSING_AUTH_HEADER",
                "message": "Missing authorization header. Format: Authorization: Bearer <token>",
                "details": []
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract token from credentials
    token = authorization.credentials

    try:
        # Verify token and get user from database
        user = await get_current_user_service(db, token)
        return user

    except HTTPException:
        # Re-raise HTTP exceptions from auth_service
        raise

    except Exception as e:
        # Catch any unexpected errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_FAILED",
                "message": f"Authentication failed: {str(e)}",
                "details": []
            },
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Optional version of get_current_user that returns None if no token provided.

    This dependency allows routes to work with or without authentication.
    Use this for endpoints that have different behavior for authenticated
    vs anonymous users.

    Args:
        authorization: HTTPAuthorizationCredentials object containing the bearer token
                      (automatically extracted from Authorization header by FastAPI)
        db: Database session (automatically injected by FastAPI)

    Returns:
        Optional[User]: User object if token is valid, None if missing/invalid

    Example:
        >>> from fastapi import APIRouter, Depends
        >>> from src.api.deps import get_current_user_optional
        >>>
        >>> router = APIRouter()
        >>>
        >>> @router.get("/api/public-data")
        >>> async def get_public_data(user: Optional[User] = Depends(get_current_user_optional)):
        >>>     if user:
        >>>         # Authenticated user - return personalized data
        >>>         user_id = user.id
        >>>     else:
        >>>         # Anonymous user - return generic data
    """
    # Check if Authorization header is present
    if authorization is None or not authorization.credentials:
        return None

    # Extract token from credentials
    token = authorization.credentials

    try:
        # Try to verify token and get user
        user = await get_current_user_service(db, token)
        return user

    except HTTPException:
        # If token is invalid, return None instead of raising
        return None

    except Exception:
        # If any other error occurs, return None instead of raising
        return None


# ============================================================================
# USAGE DOCUMENTATION
# ============================================================================

"""
HOW TO USE THESE DEPENDENCIES
==============================

1. PROTECTED ROUTES (Require Authentication)
   Use get_current_user() to enforce authentication:

    from fastapi import APIRouter, Depends
    from src.api.deps import get_current_user
    from models.models import User

    router = APIRouter()

    @router.get("/api/todos")
    async def get_todos(user: User = Depends(get_current_user)):
        user_id = user.id
        email = user.email
        # Use user_id to filter data
        return {"user_id": str(user_id), "email": email}

    Result: Returns 401 if no token or invalid token provided

2. OPTIONAL AUTHENTICATION (Allow Anonymous Access)
   Use get_current_user_optional() for routes that work with or without auth:

    from fastapi import APIRouter, Depends
    from src.api.deps import get_current_user_optional
    from models.models import User

    router = APIRouter()

    @router.get("/api/public-data")
    async def get_public_data(user: Optional[User] = Depends(get_current_user_optional)):
        if user:
            user_id = user.id
            # Return personalized data
        else:
            # Return generic data

    Result: Returns user data if authenticated, None if anonymous

3. MULTIPLE DEPENDENCIES
   You can combine with other dependencies:

    from fastapi import APIRouter, Depends, Query
    from src.api.deps import get_current_user
    from models.models import User

    router = APIRouter()

    @router.get("/api/todos/{todo_id}")
    async def get_todo(
        todo_id: str,
        user: User = Depends(get_current_user),
        include_deleted: bool = Query(False)
    ):
        user_id = user.id
        # Get specific todo for user

4. OPENAPI DOCUMENTATION
   These dependencies automatically add security schemes to your API docs:
   - /docs endpoint will show "Authorize" button
   - Request format is documented as "Bearer <token>"
   - 401 responses are documented in schema

AUTHENTICATION FLOW
===================

1. User logs in via /api/auth/login
2. Frontend receives JWT access token and refresh token
3. Frontend stores tokens in localStorage
4. Frontend makes API request with header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
5. FastAPI extracts token via get_current_user dependency
6. Token is verified with JWT (auth_service.py)
7. User object is injected into route handler
8. Route uses user.id to filter data

ERROR RESPONSES
===============

All authentication errors return 401 Unauthorized:

    {
        "code": "MISSING_AUTH_HEADER",
        "message": "Missing authorization header. Format: Authorization: Bearer <token>",
        "details": []
    }

    {
        "code": "INVALID_TOKEN",
        "message": "Invalid token: signature verification failed",
        "details": []
    }

    {
        "code": "TOKEN_EXPIRED",
        "message": "Invalid token: token expired",
        "details": []
    }

SECURITY BEST PRACTICES
========================

✅ DO:
- Use get_current_user() on all protected routes
- Filter all database queries by user_id (user.id)
- Return 401 for authentication failures
- Document protected routes in OpenAPI
- Use HTTPS in production (required for JWT security)

❌ DON'T:
- Skip authentication on user-specific endpoints
- Trust client-provided user_id (always extract from JWT)
- Store tokens in server-side sessions
- Expose sensitive data in error messages
- Use JWT without HTTPS (token can be intercepted)

EXAMPLE PROTECTED ROUTE
========================

Complete example of a protected endpoint:

    from fastapi import APIRouter, Depends
    from src.api.deps import get_current_user
    from src.models.schemas import TodoResponse
    from models.models import User

    router = APIRouter(prefix="/api/todos", tags=["todos"])

    @router.get("", response_model=list[TodoResponse])
    async def get_todos(
        user: User = Depends(get_current_user)
    ):
        user_id = user.id

        # Get todos for this user only (defense in depth)
        todos = await todo_service.get_todos(user_id=user_id)

        return todos

This route:
- ✅ Requires valid JWT token
- ✅ Extracts user_id from token
- ✅ Filters todos by user_id
- ✅ Returns 401 if authentication fails
- ✅ Documents security in OpenAPI

For more information:
- FastAPI Dependencies: https://fastapi.tiangolo.com/tutorial/dependencies/
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
- OAuth2 with Bearer: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
"""
