"""
SQLAlchemy Models for Todo Application

This module defines the database schema for:
- User accounts with password hashing
- Todo items with soft delete support
- Session management for JWT refresh tokens

All models use UUID primary keys and timestamp tracking.
"""

import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, String, Text, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from enum import Enum

from src.models.database import Base


# Enums for Todo fields
class TodoStatus(str, Enum):
    """Todo status enumeration"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class TodoPriority(str, Enum):
    """Todo priority enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class UserRole(str, Enum):
    """User role enumeration"""
    USER = "user"
    ADMIN = "admin"


# Model Mixins
class TimestampMixin:
    """Mixin for adding created_at and updated_at timestamps"""
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.utcnow(),
        onupdate=lambda: datetime.utcnow(),
        nullable=False
    )


# User Model
class User(Base, TimestampMixin):
    """
    User account model

    Fields:
        id: UUID primary key
        email: Unique email address (used for login)
        password_hash: Bcrypt hashed password
        role: User role (user or admin)
        is_verified: Email verification status
        created_at: Account creation timestamp
        updated_at: Last update timestamp

    Relationships:
        todos: User's todo items
        sessions: User's active sessions
    """
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole),
        default=UserRole.USER,
        nullable=False
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # Relationships
    todos = relationship("Todo", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")


# Todo Model
class Todo(Base, TimestampMixin):
    """
    Todo item model with soft delete support

    Fields:
        id: UUID primary key
        user_id: Foreign key to users table
        title: Todo title
        description: Detailed description (optional)
        status: Current status (pending, in_progress, completed)
        priority: Priority level (low, medium, high)
        due_date: Due date for completion (optional)
        category: Category label (optional)
        created_at: Creation timestamp
        updated_at: Last update timestamp
        deleted_at: Soft delete timestamp (null if not deleted)

    Relationships:
        user: Owner of the todo
    """
    __tablename__ = "todos"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    status: Mapped[TodoStatus] = mapped_column(
        SQLEnum(TodoStatus),
        default=TodoStatus.PENDING,
        nullable=False
    )
    priority: Mapped[TodoPriority] = mapped_column(
        SQLEnum(TodoPriority),
        default=TodoPriority.MEDIUM,
        nullable=False
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    category: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True
    )
    deleted_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    user = relationship("User", back_populates="todos")


# Session Model
class Session(Base, TimestampMixin):
    """
    Session model for JWT refresh token management

    Fields:
        id: UUID primary key
        user_id: Foreign key to users table
        refresh_token: Hashed refresh token
        expires_at: Token expiration timestamp
        created_at: Session creation timestamp
        revoked_at: Token revocation timestamp (null if active)

    Relationships:
        user: Owner of the session
    """
    __tablename__ = "sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    refresh_token: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    revoked_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    user = relationship("User", back_populates="sessions")
