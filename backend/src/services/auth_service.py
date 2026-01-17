"""
Authentication Service Module

This module provides JWT token verification and user extraction functions
for securing FastAPI routes with Supabase-issued JWT tokens.

Security Rules:
- All JWT tokens must be verified with Supabase
- Invalid/expired tokens must be rejected (fail-closed)
- Extract user_id from valid tokens for authorization
- No in-memory session storage (stateless only)
"""

from typing import Optional, Dict, Any
from supabase import Client
from fastapi import HTTPException, status


from src.models.database import get_supabase_client


def verify_jwt(token: str) -> Dict[str, Any]:
    """
    Verify a JWT token using Supabase.

    This function validates the token signature, expiration, and issuer
    using the Supabase Python client. If the token is invalid or expired,
    an exception is raised.

    Args:
        token: JWT token string (typically from Authorization header)

    Returns:
        Dict[str, Any]: Token payload containing user claims if valid

    Raises:
        HTTPException: 401 if token is invalid, expired, or malformed
        ValueError: If token is None or empty string

    Example:
        >>> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        >>> payload = verify_jwt(token)
        >>> print(payload['sub'])  # User UUID
    """
    if not token:
        raise ValueError("Token cannot be None or empty")

    # Remove "Bearer " prefix if present
    if token.startswith("Bearer "):
        token = token[7:]

    try:
        # Get Supabase client with service role key
        client: Client = get_supabase_client()

        # Verify token with Supabase
        # This validates signature, expiration, and issuer
        user_response = client.auth.get_user(token)

        # Check if verification succeeded
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user not found or token revoked",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Return user object (contains token payload)
        return {
            "user": user_response.user,
            "id": user_response.user.id,
            "email": user_response.user.email,
            "aud": user_response.user.aud,
            "role": user_response.user.role,
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        # Catch all other errors (invalid signature, expired token, etc.)
        # This includes AuthApiError from Supabase client
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_user_from_token(token: str) -> Dict[str, Any]:
    """
    Extract user information from a verified JWT token.

    This is a convenience function that verifies the token and returns
    a simplified user context with user_id and email.

    Args:
        token: JWT token string (typically from Authorization header)

    Returns:
        Dict[str, Any]: User context with keys:
            - user_id (str): User's UUID from Supabase Auth
            - email (str): User's email address
            - aud (str): Token audience (typically 'authenticated')
            - role (str): User's role (typically 'authenticated')

    Raises:
        HTTPException: 401 if token is invalid, expired, or malformed
        ValueError: If token is None or empty string

    Example:
        >>> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        >>> user = get_user_from_token(token)
        >>> print(user['user_id'])  # User UUID
        >>> print(user['email'])  # User email
    """
    # Verify token and get payload
    payload = verify_jwt(token)

    # Extract user context
    user_context = {
        "user_id": payload["id"],
        "email": payload["email"],
        "aud": payload.get("aud", "authenticated"),
        "role": payload.get("role", "authenticated"),
    }

    return user_context


# ============================================================================
# SECURITY DOCUMENTATION
# ============================================================================

"""
JWT VERIFICATION SECURITY RULES
===============================

1. TOKEN VALIDATION FLOW
   - Token is extracted from Authorization: Bearer <token> header
   - Token signature is verified using Supabase public keys
   - Token expiration is checked automatically by Supabase client
   - Token issuer is validated against Supabase project

2. FAIL-CLOSED BEHAVIOR
   - Invalid tokens → HTTPException 401
   - Expired tokens → HTTPException 401
   - Malformed tokens → HTTPException 401
   - Missing tokens → HTTPException 401 (handled in dependency)
   - No token is accepted without verification

3. STATELESS DESIGN
   - No in-memory session storage
   - No server-side session state
   - Every request includes full JWT token
   - Token verification happens on every request

4. USER CONTEXT
   - user_id is extracted from verified token
   - user_id must be used to filter all database queries
   - Email is available for logging/display purposes
   - No sensitive data (passwords, etc.) is exposed

5. DEFENSE IN DEPTH
   - JWT verification at API layer (this module)
   - Row Level Security (RLS) at database layer
   - user_id filtering in application logic
   - Multiple layers of user isolation

ERROR HANDLING
==============

All errors during token verification result in 401 Unauthorized:
- Invalid signature: Token was tampered with
- Expired token: User must re-authenticate
- Revoked token: User logged out, token no longer valid
- Malformed token: Invalid token format
- Missing claims: Token missing required fields

SECURITY CHECKLIST
==================

Before using this module in production:
- [x] Supabase client configured with service role key
- [x] Token verification tested with valid tokens
- [x] Token verification tested with invalid tokens
- [x] Token verification tested with expired tokens
- [x] Error responses return 401 status code
- [x] No sensitive data logged in error messages
- [x] Stateless design (no session storage)

INTEGRATION WITH FASTAPI
=========================

This module is designed to work with FastAPI dependencies:

    from fastapi import Depends, Header
    from src.services.auth_service import get_user_from_token

    async def get_current_user(
        authorization: str = Header(..., alias="Authorization")
    ) -> Dict[str, Any]:
        token = authorization.replace("Bearer ", "")
        return get_user_from_token(token)

    @app.get("/api/todos")
    async def get_todos(user: Dict = Depends(get_current_user)):
        user_id = user['user_id']
        # Use user_id to filter todos

For more information:
- Supabase Auth: https://supabase.com/docs/guides/auth
- JWT Verification: https://supabase.com/docs/guides/auth/server-side-rendering
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/
"""
