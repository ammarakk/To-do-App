"""
Models Module

This module contains Pydantic schemas for request/response validation.
Separates data validation logic from business logic.

Exported Schemas:
- TodoCreate: Input schema for creating todos
- TodoUpdate: Input schema for updating todos (all optional)
- TodoResponse: Output schema for todo objects
- UserResponse: Output schema for user objects
- ErrorResponse: Standardized error response schema
- PaginatedResponse: Standard wrapper for paginated lists
- MessageResponse: Simple success message
- DeleteResponse: Confirmation for delete operations
- TodoStatus: Enum for todo status (pending/completed)
- TodoPriority: Enum for priority levels (low/medium/high)
"""

from .schemas import (
    # Enums
    TodoStatus,
    TodoPriority,
    # Todo Schemas
    TodoCreate,
    TodoUpdate,
    TodoResponse,
    # User Schemas
    UserResponse,
    # Standard Response Schemas
    ErrorResponse,
    PaginatedResponse,
    MessageResponse,
    DeleteResponse,
)

__all__ = [
    # Enums
    "TodoStatus",
    "TodoPriority",
    # Todo Schemas
    "TodoCreate",
    "TodoUpdate",
    "TodoResponse",
    # User Schemas
    "UserResponse",
    # Standard Response Schemas
    "ErrorResponse",
    "PaginatedResponse",
    "MessageResponse",
    "DeleteResponse",
]
