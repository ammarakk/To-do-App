"""
Pydantic Schemas for Todo API

This module defines all request and response schemas for the Todo API.
These schemas enforce strict validation rules and serve as the single source of truth
for API contracts.

Schema Separation:
- Input schemas (Create/Update): Define what clients can send
- Output schemas (Response): Define what clients will receive
- No database assumptions: Schemas are pure contracts
"""

from datetime import datetime
from typing import Optional
from uuid import UUID
from enum import Enum
from pydantic import BaseModel, Field, field_validator, ConfigDict


# ============================================================================
# Enums
# ============================================================================

class TodoStatus(str, Enum):
    """Todo status enumeration"""
    PENDING = "pending"
    COMPLETED = "completed"


class TodoPriority(str, Enum):
    """Todo priority levels"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# ============================================================================
# Todo Schemas
# ============================================================================

class TodoBase(BaseModel):
    """Base fields shared across Todo schemas"""
    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Todo title (required, 1-200 characters)"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional detailed description (max 1000 characters)"
    )
    priority: TodoPriority = Field(
        default=TodoPriority.MEDIUM,
        description="Priority level: low, medium, or high"
    )
    due_date: Optional[datetime] = Field(
        None,
        description="Optional due date/time for the todo"
    )
    category: Optional[str] = Field(
        None,
        max_length=50,
        description="Optional category label (max 50 characters)"
    )

    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        """Validate title is not just whitespace"""
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip()


class TodoCreate(TodoBase):
    """
    Schema for creating a new Todo.

    All fields from TodoBase are available.
    Only 'title' is strictly required; others are optional with defaults.
    """
    status: TodoStatus = Field(
        default=TodoStatus.PENDING,
        description="Initial status (defaults to pending)"
    )


class TodoUpdate(BaseModel):
    """
    Schema for updating an existing Todo.

    All fields are optional to support partial updates.
    Only include fields that should be updated.
    """
    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Updated title"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Updated description"
    )
    status: Optional[TodoStatus] = Field(
        None,
        description="Updated status"
    )
    priority: Optional[TodoPriority] = Field(
        None,
        description="Updated priority"
    )
    due_date: Optional[datetime] = Field(
        None,
        description="Updated due date (set to null to remove)"
    )
    category: Optional[str] = Field(
        None,
        max_length=50,
        description="Updated category"
    )

    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        """Validate title is not empty if provided"""
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty or whitespace only')
        return v.strip() if v else None


class TodoResponse(BaseModel):
    """
    Schema for Todo API responses.

    This schema defines the complete Todo object returned to clients.
    All fields are read-only from the client's perspective.
    """
    id: UUID = Field(
        ...,
        description="Unique identifier for the todo"
    )
    user_id: UUID = Field(
        ...,
        description="ID of the user who owns this todo"
    )
    title: str = Field(
        ...,
        description="Todo title"
    )
    description: Optional[str] = Field(
        None,
        description="Todo description"
    )
    status: TodoStatus = Field(
        ...,
        description="Current status"
    )
    priority: TodoPriority = Field(
        ...,
        description="Priority level"
    )
    due_date: Optional[datetime] = Field(
        None,
        description="Due date if set"
    )
    category: Optional[str] = Field(
        None,
        description="Category label if set"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when todo was created"
    )
    updated_at: datetime = Field(
        ...,
        description="Timestamp when todo was last updated"
    )

    model_config = ConfigDict(
        from_attributes=True,  # Allows creating from ORM models
    )


# ============================================================================
# User Schemas
# ============================================================================

class UserRole(str, Enum):
    """User role enumeration"""
    USER = "user"
    ADMIN = "admin"


class UserResponse(BaseModel):
    """
    Schema for User API responses.

    Returns only safe, non-sensitive user information.
    """
    id: UUID = Field(
        ...,
        description="Unique user identifier"
    )
    email: str = Field(
        ...,
        description="User email address"
    )
    role: UserRole = Field(
        default=UserRole.USER,
        description="User role"
    )
    is_verified: bool = Field(
        default=False,
        description="Whether the user's email has been verified"
    )
    created_at: datetime = Field(
        ...,
        description="Account creation timestamp"
    )
    updated_at: datetime = Field(
        ...,
        description="Last update timestamp"
    )

    model_config = ConfigDict(
        from_attributes=True,
    )


class UserCreate(BaseModel):
    """Schema for user registration"""
    email: str = Field(
        ...,
        pattern=r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        description="User email address"
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="Password (min 8 characters)"
    )


class UserLogin(BaseModel):
    """Schema for user login"""
    email: str = Field(
        ...,
        description="User email address"
    )
    password: str = Field(
        ...,
        description="User password"
    )


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh"""
    refresh_token: str = Field(
        ...,
        description="Valid refresh token"
    )


class TokenResponse(BaseModel):
    """Schema for token response"""
    access_token: str = Field(
        ...,
        description="JWT access token"
    )
    refresh_token: str = Field(
        ...,
        description="JWT refresh token"
    )
    token_type: str = Field(
        default="bearer",
        description="Token type (always 'bearer')"
    )
    expires_in: int = Field(
        ...,
        description="Access token expiry in seconds"
    )
    user: UserResponse = Field(
        ...,
        description="User information"
    )


# ============================================================================
# Standard API Response Schemas
# ============================================================================

class ErrorDetail(BaseModel):
    """Individual error detail"""
    field: Optional[str] = Field(
        None,
        description="Field name that caused the error (null for general errors)"
    )
    message: str = Field(
        ...,
        description="Human-readable error message"
    )


class ErrorResponse(BaseModel):
    """
    Standardized error response schema.

    All API errors must return responses matching this structure.
    """
    code: str = Field(
        ...,
        description="Application-specific error code"
    )
    message: str = Field(
        ...,
        description="Human-readable error description"
    )
    details: list[ErrorDetail] = Field(
        default_factory=list,
        description="Additional error details for validation errors"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "code": "VALIDATION_ERROR",
                    "message": "Request validation failed",
                    "details": [
                        {
                            "field": "title",
                            "message": "Title is required"
                        }
                    ]
                }
            ]
        }
    }


# ============================================================================
# Pagination Schemas
# ============================================================================

class PaginatedResponse(BaseModel):
    """
    Standard paginated response wrapper.

    Use for any endpoint that returns a list of items.
    """
    items: list = Field(
        ...,
        description="List of items for the current page"
    )
    total: int = Field(
        ...,
        ge=0,
        description="Total number of items across all pages"
    )
    page: int = Field(
        ...,
        ge=1,
        description="Current page number (1-indexed)"
    )
    page_size: int = Field(
        ...,
        ge=1,
        description="Number of items per page"
    )
    total_pages: int = Field(
        ...,
        ge=0,
        description="Total number of pages"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "items": [],
                    "total": 100,
                    "page": 1,
                    "page_size": 20,
                    "total_pages": 5
                }
            ]
        }
    }


# ============================================================================
# Success Response Schemas
# ============================================================================

class MessageResponse(BaseModel):
    """Simple success message response"""
    message: str = Field(
        ...,
        description="Success message"
    )


class DeleteResponse(BaseModel):
    """Response for successful delete operations"""
    message: str = Field(
        default="Resource deleted successfully",
        description="Confirmation message"
    )
    id: UUID = Field(
        ...,
        description="ID of the deleted resource"
    )
