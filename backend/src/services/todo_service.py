"""
Todo Service Module

This module provides CRUD operations for Todo items using SQLAlchemy.
All operations enforce user data isolation via user_id filtering.

Security Features:
- All queries filtered by user_id
- Soft delete support (deleted_at timestamp)
- User data isolation enforced at service layer
- Proper error handling for not found cases
"""

import uuid
from datetime import datetime
from typing import Optional, Dict, Any, Tuple, List

from fastapi import HTTPException, status
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession

from models.models import Todo, TodoStatus, TodoPriority
from models.schemas import TodoCreate, TodoUpdate


async def create_todo(
    db: AsyncSession,
    user_id: uuid.UUID,
    todo_data: TodoCreate
) -> Dict[str, Any]:
    """
    Create a new todo for the specified user.

    Args:
        db: Database session
        user_id: User's UUID (from JWT token)
        todo_data: Todo creation data

    Returns:
        dict: Created todo data

    Raises:
        HTTPException: 500 if database operation fails

    Security:
        - Todo automatically assigned to user_id from JWT
        - User cannot override user_id
    """
    try:
        # Create new todo
        new_todo = Todo(
            id=uuid.uuid4(),
            user_id=user_id,
            title=todo_data.title,
            description=todo_data.description,
            status=TodoStatus(todo_data.status) if todo_data.status else TodoStatus.PENDING,
            priority=todo_data.priority or TodoPriority.MEDIUM,
            due_date=todo_data.due_date,
            category=todo_data.category
        )

        db.add(new_todo)
        await db.commit()
        await db.refresh(new_todo)

        return {
            "id": str(new_todo.id),
            "user_id": str(new_todo.user_id),
            "title": new_todo.title,
            "description": new_todo.description,
            "status": new_todo.status.value,
            "priority": new_todo.priority.value,
            "due_date": new_todo.due_date.isoformat() if new_todo.due_date else None,
            "category": new_todo.category,
            "created_at": new_todo.created_at.isoformat(),
            "updated_at": new_todo.updated_at.isoformat()
        }
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DATABASE_ERROR",
                "message": "Failed to create todo",
                "details": []
            }
        )


async def get_todos(
    db: AsyncSession,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None
) -> Tuple[List[Dict[str, Any]], int]:
    """
    Get todos for the specified user with pagination and filtering.

    Args:
        db: Database session
        user_id: User's UUID (from JWT token)
        page: Page number (1-indexed)
        page_size: Items per page
        search: Search string for title/description
        status: Filter by status
        priority: Filter by priority
        category: Filter by category

    Returns:
        tuple: (list of todos, total count)

    Raises:
        HTTPException: 500 if database operation fails

    Security:
        - Only returns todos belonging to user_id
        - Soft deleted todos excluded from results
    """
    try:
        # Build base query with user isolation and soft delete filter
        base_query = select(Todo).where(
            and_(
                Todo.user_id == user_id,
                Todo.deleted_at.is_(None)
            )
        )

        # Apply filters
        if search:
            search_pattern = f"%{search}%"
            base_query = base_query.where(
                or_(
                    Todo.title.ilike(search_pattern),
                    Todo.description.ilike(search_pattern)
                )
            )

        if status:
            base_query = base_query.where(Todo.status == TodoStatus(status))

        if priority:
            base_query = base_query.where(Todo.priority == TodoPriority(priority))

        if category:
            base_query = base_query.where(Todo.category == category)

        # Get total count
        count_query = select(func.count()).select_from(base_query.subquery())
        total_result = await db.execute(count_query)
        total = total_result.scalar() or 0

        # Apply pagination and ordering
        query = base_query.order_by(Todo.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        # Execute query
        result = await db.execute(query)
        todos = result.scalars().all()

        # Convert to dict
        todos_list = [
            {
                "id": str(todo.id),
                "user_id": str(todo.user_id),
                "title": todo.title,
                "description": todo.description,
                "status": todo.status.value,
                "priority": todo.priority.value,
                "due_date": todo.due_date.isoformat() if todo.due_date else None,
                "category": todo.category,
                "created_at": todo.created_at.isoformat(),
                "updated_at": todo.updated_at.isoformat()
            }
            for todo in todos
        ]

        return todos_list, total
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DATABASE_ERROR",
                "message": "Failed to retrieve todos",
                "details": []
            }
        )


async def get_todo_by_id(
    db: AsyncSession,
    user_id: uuid.UUID,
    todo_id: str
) -> Dict[str, Any]:
    """
    Get a specific todo by ID for the specified user.

    Args:
        db: Database session
        user_id: User's UUID (from JWT token)
        todo_id: Todo's UUID

    Returns:
        dict: Todo data

    Raises:
        HTTPException: 404 if todo not found or doesn't belong to user
        HTTPException: 500 if database operation fails

    Security:
        - Only returns todo if it belongs to user_id
        - Soft deleted todos not returned
    """
    try:
        todo_uuid = uuid.UUID(todo_id)

        result = await db.execute(
            select(Todo).where(
                and_(
                    Todo.id == todo_uuid,
                    Todo.user_id == user_id,
                    Todo.deleted_at.is_(None)
                )
            )
        )
        todo = result.scalar_one_or_none()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "TODO_NOT_FOUND",
                    "message": "Todo not found",
                    "details": []
                }
            )

        return {
            "id": str(todo.id),
            "user_id": str(todo.user_id),
            "title": todo.title,
            "description": todo.description,
            "status": todo.status.value,
            "priority": todo.priority.value,
            "due_date": todo.due_date.isoformat() if todo.due_date else None,
            "category": todo.category,
            "created_at": todo.created_at.isoformat(),
            "updated_at": todo.updated_at.isoformat()
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_UUID",
                "message": "Invalid todo ID format",
                "details": []
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DATABASE_ERROR",
                "message": "Failed to retrieve todo",
                "details": []
            }
        )


async def update_todo(
    db: AsyncSession,
    user_id: uuid.UUID,
    todo_id: str,
    todo_data: TodoUpdate
) -> Dict[str, Any]:
    """
    Update a todo for the specified user.

    Args:
        db: Database session
        user_id: User's UUID (from JWT token)
        todo_id: Todo's UUID
        todo_data: Todo update data (all fields optional)

    Returns:
        dict: Updated todo data

    Raises:
        HTTPException: 404 if todo not found or doesn't belong to user
        HTTPException: 500 if database operation fails

    Security:
        - Only updates todos belonging to user_id
        - User cannot modify user_id field
    """
    try:
        todo_uuid = uuid.UUID(todo_id)

        result = await db.execute(
            select(Todo).where(
                and_(
                    Todo.id == todo_uuid,
                    Todo.user_id == user_id,
                    Todo.deleted_at.is_(None)
                )
            )
        )
        todo = result.scalar_one_or_none()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "TODO_NOT_FOUND",
                    "message": "Todo not found",
                    "details": []
                }
            )

        # Update fields if provided
        if todo_data.title is not None:
            todo.title = todo_data.title
        if todo_data.description is not None:
            todo.description = todo_data.description
        if todo_data.status is not None:
            todo.status = TodoStatus(todo_data.status)
        if todo_data.priority is not None:
            todo.priority = TodoPriority(todo_data.priority)
        if todo_data.due_date is not None:
            todo.due_date = todo_data.due_date
        if todo_data.category is not None:
            todo.category = todo_data.category

        todo.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(todo)

        return {
            "id": str(todo.id),
            "user_id": str(todo.user_id),
            "title": todo.title,
            "description": todo.description,
            "status": todo.status.value,
            "priority": todo.priority.value,
            "due_date": todo.due_date.isoformat() if todo.due_date else None,
            "category": todo.category,
            "created_at": todo.created_at.isoformat(),
            "updated_at": todo.updated_at.isoformat()
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_UUID",
                "message": "Invalid todo ID format",
                "details": []
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DATABASE_ERROR",
                "message": "Failed to update todo",
                "details": []
            }
        )


async def delete_todo(
    db: AsyncSession,
    user_id: uuid.UUID,
    todo_id: str
) -> Dict[str, Any]:
    """
    Soft delete a todo for the specified user.

    Args:
        db: Database session
        user_id: User's UUID (from JWT token)
        todo_id: Todo's UUID

    Returns:
        dict: Deleted todo data (with deleted_at timestamp)

    Raises:
        HTTPException: 404 if todo not found or doesn't belong to user
        HTTPException: 500 if database operation fails

    Security:
        - Only deletes todos belonging to user_id
        - Uses soft delete (sets deleted_at timestamp)
    """
    try:
        todo_uuid = uuid.UUID(todo_id)

        result = await db.execute(
            select(Todo).where(
                and_(
                    Todo.id == todo_uuid,
                    Todo.user_id == user_id,
                    Todo.deleted_at.is_(None)
                )
            )
        )
        todo = result.scalar_one_or_none()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "TODO_NOT_FOUND",
                    "message": "Todo not found",
                    "details": []
                }
            )

        # Soft delete
        todo.deleted_at = datetime.utcnow()
        await db.commit()

        return {
            "id": str(todo.id),
            "user_id": str(todo.user_id),
            "title": todo.title,
            "description": todo.description,
            "status": todo.status.value,
            "priority": todo.priority.value,
            "due_date": todo.due_date.isoformat() if todo.due_date else None,
            "category": todo.category,
            "created_at": todo.created_at.isoformat(),
            "updated_at": todo.updated_at.isoformat()
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_UUID",
                "message": "Invalid todo ID format",
                "details": []
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DATABASE_ERROR",
                "message": "Failed to delete todo",
                "details": []
            }
        )


async def mark_completed(
    db: AsyncSession,
    user_id: uuid.UUID,
    todo_id: str
) -> Dict[str, Any]:
    """
    Mark a todo as completed for the specified user.

    Args:
        db: Database session
        user_id: User's UUID (from JWT token)
        todo_id: Todo's UUID

    Returns:
        dict: Updated todo data with status="completed"

    Raises:
        HTTPException: 404 if todo not found or doesn't belong to user
        HTTPException: 500 if database operation fails

    Security:
        - Only updates todos belonging to user_id
    """
    try:
        todo_uuid = uuid.UUID(todo_id)

        result = await db.execute(
            select(Todo).where(
                and_(
                    Todo.id == todo_uuid,
                    Todo.user_id == user_id,
                    Todo.deleted_at.is_(None)
                )
            )
        )
        todo = result.scalar_one_or_none()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "code": "TODO_NOT_FOUND",
                    "message": "Todo not found",
                    "details": []
                }
            )

        # Mark as completed
        todo.status = TodoStatus.COMPLETED
        todo.updated_at = datetime.utcnow()

        await db.commit()
        await db.refresh(todo)

        return {
            "id": str(todo.id),
            "user_id": str(todo.user_id),
            "title": todo.title,
            "description": todo.description,
            "status": todo.status.value,
            "priority": todo.priority.value,
            "due_date": todo.due_date.isoformat() if todo.due_date else None,
            "category": todo.category,
            "created_at": todo.created_at.isoformat(),
            "updated_at": todo.updated_at.isoformat()
        }
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "INVALID_UUID",
                "message": "Invalid todo ID format",
                "details": []
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "code": "DATABASE_ERROR",
                "message": "Failed to mark todo as completed",
                "details": []
            }
        )
