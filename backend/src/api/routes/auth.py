"""
Auth Routes Module

This module defines FastAPI routes for authentication operations.
Note: User authentication is handled by Supabase Auth on the frontend.
These routes provide minimal auth-related endpoints for API consistency.

Security Rules:
- Auth operations primarily handled by Supabase client on frontend
- Backend only validates JWTs issued by Supabase
- No password storage or authentication logic in backend
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from src.api.deps import get_current_user
from src.models.schemas import UserResponse, MessageResponse


# Create router with prefix and tags
router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)


@router.post(
    "/signup",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="User signup (placeholder)",
    description="Placeholder endpoint for signup. Actual signup handled by Supabase Auth on frontend."
)
async def signup() -> MessageResponse:
    """
    Placeholder endpoint for user signup.

    Note: Actual user signup is handled by Supabase Auth on the frontend.
    This endpoint exists for API consistency but returns a message directing
    to Supabase Auth.

    Returns:
        MessageResponse: Message explaining Supabase Auth usage

    Example:
        POST /api/auth/signup
        Response: {"message": "Use Supabase Auth for user signup on frontend"}
    """
    return MessageResponse(
        message="Use Supabase Auth for user signup. See frontend integration documentation."
    )


@router.post(
    "/login",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="User login (placeholder)",
    description="Placeholder endpoint for login. Actual login handled by Supabase Auth on frontend."
)
async def login() -> MessageResponse:
    """
    Placeholder endpoint for user login.

    Note: Actual user login is handled by Supabase Auth on the frontend.
    This endpoint exists for API consistency but returns a message directing
    to Supabase Auth.

    Returns:
        MessageResponse: Message explaining Supabase Auth usage

    Example:
        POST /api/auth/login
        Response: {"message": "Use Supabase Auth for user login on frontend"}
    """
    return MessageResponse(
        message="Use Supabase Auth for user login. See frontend integration documentation."
    )


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="User logout (placeholder)",
    description="Placeholder endpoint for logout. Actual logout handled by Supabase Auth on frontend."
)
async def logout() -> MessageResponse:
    """
    Placeholder endpoint for user logout.

    Note: Actual user logout is handled by Supabase Auth on the frontend.
    This endpoint exists for API consistency but returns a message directing
    to Supabase Auth.

    Returns:
        MessageResponse: Message explaining Supabase Auth usage

    Example:
        POST /api/auth/logout
        Response: {"message": "Use Supabase Auth for user logout on frontend"}
    """
    return MessageResponse(
        message="Use Supabase Auth for user logout. See frontend integration documentation."
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Get information about the currently authenticated user."
)
async def get_current_user_info(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserResponse:
    """
    Get information about the currently authenticated user.

    This endpoint validates the JWT token and returns user information.

    Args:
        current_user: Authenticated user context (injected from JWT)

    Returns:
        UserResponse: Current user information (id, email, timestamps)

    Raises:
        401: If JWT token is missing or invalid

    Example:
        GET /api/auth/me
        Headers: Authorization: Bearer <jwt_token>
        Response: {"id": "uuid", "email": "user@example.com", ...}
    """
    # Return user info from JWT
    return UserResponse(
        id=current_user["user_id"],
        email=current_user["email"],
        created_at=__import__("datetime").datetime.now(),  # Placeholder - would come from DB
        updated_at=__import__("datetime").datetime.now()   # Placeholder - would come from DB
    )
