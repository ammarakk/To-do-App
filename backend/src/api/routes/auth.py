"""
Auth Routes Module

This module defines FastAPI routes for JWT-based authentication operations.
All authentication is handled by the backend with custom JWT tokens.

Security Features:
- JWT access tokens (15 minutes expiry)
- JWT refresh tokens (7 days expiry)
- Token rotation on refresh
- Password hashing with bcrypt (cost factor 12)
- Token revocation on logout
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from models.database import get_db
from models.schemas import (
    UserCreate,
    UserLogin,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse,
    MessageResponse
)
from services.auth_service import (
    register_user,
    login_user,
    refresh_tokens,
    logout_user
)
from api.deps import get_current_user
from models.models import User


# Create router with prefix and tags
router = APIRouter(
    prefix="/api/auth",
    tags=["auth"]
)


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Create a new user account with email and password. Returns JWT tokens."
)
async def signup(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Register a new user and create JWT tokens.

    This endpoint creates a new user account with the provided email and password.
    The password is hashed using bcrypt before storage. Returns both access and
    refresh tokens for immediate login.

    Args:
        user_data: User registration data (email, password)
        db: Database session

    Returns:
        TokenResponse: Contains access_token, refresh_token, token_type, expires_in, and user info

    Raises:
        400: If email already exists
        422: If validation fails (email format, password length)

    Security:
        - Password hashed with bcrypt (cost factor 12)
        - Email validated with regex pattern
        - Password minimum 8 characters
        - User created as unverified (is_verified=False)

    Example:
        POST /api/auth/signup
        {
            "email": "user@example.com",
            "password": "securepassword123"
        }

        Response:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "expires_in": 900,
            "user": {
                "id": "uuid",
                "email": "user@example.com",
                "role": "user",
                "is_verified": false
            }
        }
    """
    # Register user (hashes password, creates user in DB)
    user = await register_user(
        db,
        email=user_data.email,
        password=user_data.password
    )

    # Login user (create JWT tokens and session)
    tokens = await login_user(
        db,
        email=user_data.email,
        password=user_data.password
    )

    return tokens


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Login with email and password",
    description="Authenticate with credentials and receive JWT tokens."
)
async def login(
    user_data: UserLogin,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Login a user and create JWT tokens.

    This endpoint authenticates a user with email and password.
    If credentials are valid, it creates new access and refresh tokens.

    Args:
        user_data: User login data (email, password)
        db: Database session

    Returns:
        TokenResponse: Contains access_token, refresh_token, token_type, expires_in, and user info

    Raises:
        401: If email or password is incorrect

    Security:
        - Password verified against bcrypt hash
        - Timing attack protection (bcrypt is slow)
        - Generic error message (prevents user enumeration)
        - Old refresh tokens invalidated on new login

    Example:
        POST /api/auth/login
        {
            "email": "user@example.com",
            "password": "securepassword123"
        }

        Response:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "expires_in": 900,
            "user": {
                "id": "uuid",
                "email": "user@example.com",
                "role": "user",
                "is_verified": false
            }
        }
    """
    # Login user (verifies password, creates JWT tokens)
    tokens = await login_user(
        db,
        email=user_data.email,
        password=user_data.password
    )

    return tokens


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description="Get a new access token using a valid refresh token."
)
async def refresh(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """
    Refresh access token using refresh token.

    This endpoint validates the refresh token and issues a new access token
    and refresh token. The old refresh token is revoked (token rotation).

    Args:
        refresh_data: Refresh token request
        db: Database session

    Returns:
        TokenResponse: Contains new access_token, new refresh_token, token_type, expires_in, and user info

    Raises:
        401: If refresh token is invalid, expired, or revoked

    Security:
        - Refresh token validated against database
        - Old refresh token immediately revoked
        - New refresh token generated (token rotation)
        - Prevents token reuse attacks
        - All old tokens invalidated on new login

    Example:
        POST /api/auth/refresh
        {
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }

        Response:
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "expires_in": 900,
            "user": {
                "id": "uuid",
                "email": "user@example.com",
                "role": "user",
                "is_verified": false
            }
        }
    """
    # Refresh tokens (validates refresh token, creates new tokens, revokes old token)
    tokens = await refresh_tokens(
        db,
        refresh_token=refresh_data.refresh_token
    )

    return tokens


@router.post(
    "/logout",
    response_model=MessageResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout current user",
    description="Revoke the refresh token and logout the user."
)
async def logout(
    refresh_data: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db)
) -> MessageResponse:
    """
    Logout a user by revoking their refresh token.

    This endpoint revokes the provided refresh token in the database.
    The access token will expire naturally (15 minutes). Frontend should
    delete both tokens from storage.

    Args:
        refresh_data: Refresh token to revoke
        db: Database session

    Returns:
        MessageResponse: Success message

    Security:
        - Refresh token revoked in database
        - All user sessions revoked (not just this token)
        - Access token expires naturally (cannot be revoked instantly)
        - Generic success response (prevents token enumeration)

    Example:
        POST /api/auth/logout
        {
            "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }

        Response:
        {
            "message": "Successfully logged out"
        }
    """
    # Logout user (revokes all refresh tokens)
    await logout_user(
        db,
        refresh_token=refresh_data.refresh_token
    )

    return MessageResponse(
        message="Successfully logged out"
    )


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Get information about the currently authenticated user."
)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
) -> UserResponse:
    """
    Get information about the currently authenticated user.

    This endpoint validates the JWT access token and returns user information
    from the database.

    Args:
        current_user: Authenticated user object (injected from JWT)

    Returns:
        UserResponse: Current user information (id, email, role, timestamps)

    Raises:
        401: If JWT access token is missing or invalid

    Security:
        - JWT access token validated
        - User fetched from database (fresh data)
        - No password_hash returned
        - Token must be valid (not expired)

    Example:
        GET /api/auth/me
        Headers: Authorization: Bearer <access_token>

        Response:
        {
            "id": "uuid",
            "email": "user@example.com",
            "role": "user",
            "is_verified": false,
            "created_at": "2024-01-18T10:30:00Z",
            "updated_at": "2024-01-18T10:30:00Z"
        }
    """
    return UserResponse.model_validate(current_user)
