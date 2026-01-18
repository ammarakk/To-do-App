"""
Models Module

This module contains:
- SQLAlchemy ORM models for database tables
- Pydantic schemas for request/response validation
- Database connection management

SQLAlchemy Models:
- User: User accounts with password hashing
- Todo: Todo items with soft delete support
- Session: JWT refresh token management

Pydantic Schemas:
- TodoCreate: Input schema for creating todos
- TodoUpdate: Input schema for updating todos (all optional)
- TodoResponse: Output schema for todo objects
- UserResponse: Output schema for user objects
- ErrorResponse: Standardized error response schema
- PaginatedResponse: Standard wrapper for paginated lists
- MessageResponse: Simple success message
- DeleteResponse: Confirmation for delete operations
"""

# SQLAlchemy Models
from .models import (
    User,
    Todo,
    Session,
    TodoStatus,
    TodoPriority,
    UserRole,
)

# Database Connection
from .database import (
    Base,
    get_db,
    init_db,
    close_db,
)

# Pydantic Schemas (TODO: Update schemas.py for new schema)
from .schemas import (
    TodoStatus as SchemaTodoStatus,
    TodoPriority as SchemaTodoPriority,
    TodoCreate,
    TodoUpdate,
    TodoResponse,
    UserResponse,
    ErrorResponse,
    PaginatedResponse,
    MessageResponse,
    DeleteResponse,
)

__all__ = [
    # SQLAlchemy Models
    "User",
    "Todo",
    "Session",
    "TodoStatus",
    "TodoPriority",
    "UserRole",
    # Database
    "Base",
    "get_db",
    "init_db",
    "close_db",
    # Pydantic Schemas
    "TodoCreate",
    "TodoUpdate",
    "TodoResponse",
    "UserResponse",
    "ErrorResponse",
    "PaginatedResponse",
    "MessageResponse",
    "DeleteResponse",
]

