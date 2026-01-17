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

from typing import Dict, Any, Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials


from src.services.auth_service import get_user_from_token


# HTTPBearer security scheme for OpenAPI documentation
security = HTTPBearer(auto_error=False)


async def get_current_user(
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Dict[str, Any]:
    """
    FastAPI dependency to extract and validate JWT from Authorization header.

    This dependency extracts the JWT token from the Authorization header,
    verifies it with Supabase, and returns the user context. It must be
    used in all protected routes.

    Args:
        authorization: HTTPAuthorizationCredentials object containing the bearer token
                      (automatically extracted from Authorization header by FastAPI)

    Returns:
        Dict[str, Any]: User context with keys:
            - user_id (str): User's UUID from Supabase Auth
            - email (str): User's email address
            - aud (str): Token audience (typically 'authenticated')
            - role (str): User's role (typically 'authenticated')

    Raises:
        HTTPException: 401 if token is missing, invalid, or expired

    Example:
        >>> from fastapi import APIRouter, Depends
        >>> from src.api.deps import get_current_user
        >>>
        >>> router = APIRouter()
        >>>
        >>> @router.get("/api/todos")
        >>> async def get_todos(user: Dict = Depends(get_current_user)):
        >>>     user_id = user['user_id']
        >>>     # Use user_id to filter todos
    """
    # Check if Authorization header is present
    if authorization is None or not authorization.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header. Format: Authorization: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract token from credentials
    token = authorization.credentials

    try:
        # Verify token and extract user context
        user_context = get_user_from_token(token)

        return user_context

    except HTTPException:
        # Re-raise HTTP exceptions from auth_service
        raise

    except Exception as e:
        # Catch any unexpected errors
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(
    authorization: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> Optional[Dict[str, Any]]:
    """
    Optional version of get_current_user that returns None if no token provided.

    This dependency allows routes to work with or without authentication.
    Use this for endpoints that have different behavior for authenticated
    vs anonymous users.

    Args:
        authorization: HTTPAuthorizationCredentials object containing the bearer token
                      (automatically extracted from Authorization header by FastAPI)

    Returns:
        Optional[Dict[str, Any]]: User context if token is valid, None if missing/invalid

    Example:
        >>> from fastapi import APIRouter, Depends
        >>> from src.api.deps import get_current_user_optional
        >>>
        >>> router = APIRouter()
        >>>
        >>> @router.get("/api/public-data")
        >>> async def get_public_data(user: Optional[Dict] = Depends(get_current_user_optional)):
        >>>     if user:
        >>>         # Authenticated user - return personalized data
        >>>         user_id = user['user_id']
        >>>     else:
        >>>         # Anonymous user - return generic data
    """
    # Check if Authorization header is present
    if authorization is None or not authorization.credentials:
        return None

    # Extract token from credentials
    token = authorization.credentials

    try:
        # Try to verify token and extract user context
        user_context = get_user_from_token(token)
        return user_context

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

    router = APIRouter()

    @router.get("/api/todos")
    async def get_todos(user: Dict = Depends(get_current_user)):
        user_id = user['user_id']
        email = user['email']
        # Use user_id to filter data
        return {"user_id": user_id, "email": email}

    Result: Returns 401 if no token or invalid token provided

2. OPTIONAL AUTHENTICATION (Allow Anonymous Access)
   Use get_current_user_optional() for routes that work with or without auth:

    from fastapi import APIRouter, Depends
    from src.api.deps import get_current_user_optional

    router = APIRouter()

    @router.get("/api/public-data")
    async def get_public_data(user: Optional[Dict] = Depends(get_current_user_optional)):
        if user:
            user_id = user['user_id']
            # Return personalized data
        else:
            # Return generic data

    Result: Returns user data if authenticated, None if anonymous

3. MULTIPLE DEPENDENCIES
   You can combine with other dependencies:

    from fastapi import APIRouter, Depends, Query
    from src.api.deps import get_current_user

    router = APIRouter()

    @router.get("/api/todos/{todo_id}")
    async def get_todo(
        todo_id: str,
        user: Dict = Depends(get_current_user),
        include_deleted: bool = Query(False)
    ):
        user_id = user['user_id']
        # Get specific todo for user

4. OPENAPI DOCUMENTATION
   These dependencies automatically add security schemes to your API docs:
   - /docs endpoint will show "Authorize" button
   - Request format is documented as "Bearer <token>"
   - 401 responses are documented in schema

AUTHENTICATION FLOW
===================

1. User logs in via Supabase Auth (frontend)
2. Frontend receives JWT token from Supabase
3. Frontend stores token (handled by Supabase client)
4. Frontend makes API request with header:
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
5. FastAPI extracts token via get_current_user dependency
6. Token is verified with Supabase (auth_service.py)
7. User context is injected into route handler
8. Route uses user_id to filter data

ERROR RESPONSES
===============

All authentication errors return 401 Unauthorized:

    {
        "detail": "Missing authorization header. Format: Authorization: Bearer <token>"
    }

    {
        "detail": "Invalid token: signature verification failed"
    }

    {
        "detail": "Invalid token: token expired"
    }

SECURITY BEST PRACTICES
========================

✅ DO:
- Use get_current_user() on all protected routes
- Filter all database queries by user_id
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

    from fastapi import APIRouter, Depends, HTTPException, status
    from src.api.deps import get_current_user
    from src.models.schemas import TodoResponse

    router = APIRouter(prefix="/api/todos", tags=["todos"])

    @router.get("", response_model=list[TodoResponse])
    async def get_todos(
        user: Dict = Depends(get_current_user)
    ):
        user_id = user['user_id']

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
