"""
Todo Routes Module

This module defines FastAPI routes for Todo CRUD operations.
All routes require JWT authentication and enforce user isolation.

Security Rules:
- All routes require valid JWT token via get_current_user dependency
- user_id extracted from JWT, never from request body
- All operations filtered by user_id in service layer
- Proper HTTP status codes for all scenarios
"""

from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials

from src.api.deps import get_current_user
from src.services.todo_service import get_todo_service
from src.models.schemas import (
    TodoCreate,
    TodoUpdate,
    TodoResponse,
    PaginatedResponse,
    DeleteResponse,
)
from src.models.schemas import TodoStatus, TodoPriority


# Create router with prefix and tags
router = APIRouter(
    prefix="/api/todos",
    tags=["todos"]
)


@router.post(
    "",
    response_model=TodoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new todo",
    description="Create a new todo for the authenticated user. All fields except title are optional."
)
async def create_todo(
    todo_data: TodoCreate,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> TodoResponse:
    """
    Create a new todo for the authenticated user.

    Args:
        todo_data: Todo creation data validated by TodoCreate schema
        current_user: Authenticated user context (injected from JWT)

    Returns:
        TodoResponse: Created todo with all fields including generated id

    Raises:
        401: If JWT token is missing or invalid
        422: If request validation fails
        500: If database operation fails

    Security:
        - Requires valid JWT token
        - Todo automatically assigned to authenticated user
        - User cannot override user_id
    """
    # Extract user_id from JWT
    user_id = current_user["user_id"]

    # Create todo via service layer
    service = get_todo_service()
    todo = service.create_todo(user_id=user_id, todo_data=todo_data)

    return TodoResponse(**todo)


@router.get(
    "",
    response_model=PaginatedResponse,
    status_code=status.HTTP_200_OK,
    summary="Get todos with pagination and filters",
    description="Retrieve todos for the authenticated user with optional pagination, search, and filtering."
)
async def get_todos(
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=100, description="Number of items per page (max 100)"),
    search: Optional[str] = Query(None, description="Search in title and description"),
    status_filter: Optional[TodoStatus] = Query(None, alias="status", description="Filter by status"),
    priority_filter: Optional[TodoPriority] = Query(None, alias="priority", description="Filter by priority"),
    category_filter: Optional[str] = Query(None, alias="category", description="Filter by category"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> PaginatedResponse:
    """
    Get todos for the authenticated user with pagination and filtering.

    Args:
        page: Page number (default: 1, min: 1)
        page_size: Items per page (default: 20, min: 1, max: 100)
        search: Search string for title/description (optional)
        status_filter: Filter by status (optional)
        priority_filter: Filter by priority (optional)
        category_filter: Filter by category (optional)
        current_user: Authenticated user context (injected from JWT)

    Returns:
        PaginatedResponse: Paginated list of todos with metadata

    Raises:
        401: If JWT token is missing or invalid
        500: If database operation fails

    Security:
        - Requires valid JWT token
        - Only returns todos belonging to authenticated user
        - RLS policies + service layer filtering ensure user isolation
    """
    # Extract user_id from JWT
    user_id = current_user["user_id"]

    # Convert enums to strings if provided
    status_str = status_filter.value if status_filter else None
    priority_str = priority_filter.value if priority_filter else None

    # Get todos via service layer
    service = get_todo_service()
    todos, total = service.get_todos(
        user_id=user_id,
        page=page,
        page_size=page_size,
        search=search,
        status=status_str,
        priority=priority_str,
        category=category_filter
    )

    # Calculate total pages
    total_pages = (total + page_size - 1) // page_size if total > 0 else 0

    # Convert todos to response models
    items = [TodoResponse(**todo) for todo in todos]

    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get(
    "/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific todo",
    description="Retrieve a specific todo by ID for the authenticated user."
)
async def get_todo_by_id(
    todo_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> TodoResponse:
    """
    Get a specific todo by ID for the authenticated user.

    Args:
        todo_id: Todo's UUID
        current_user: Authenticated user context (injected from JWT)

    Returns:
        TodoResponse: Todo with all fields

    Raises:
        401: If JWT token is missing or invalid
        404: If todo not found or doesn't belong to user
        500: If database operation fails

    Security:
        - Requires valid JWT token
        - Only returns todo if it belongs to authenticated user
        - Service layer filters by user_id
    """
    # Extract user_id from JWT
    user_id = current_user["user_id"]

    # Get todo via service layer
    service = get_todo_service()
    todo = service.get_todo_by_id(user_id=user_id, todo_id=todo_id)

    return TodoResponse(**todo)


@router.put(
    "/{todo_id}",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
    summary="Update a todo",
    description="Update a todo by ID for the authenticated user. All fields are optional."
)
async def update_todo(
    todo_id: str,
    todo_data: TodoUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> TodoResponse:
    """
    Update a todo by ID for the authenticated user.

    Args:
        todo_id: Todo's UUID
        todo_data: Todo update data (all fields optional)
        current_user: Authenticated user context (injected from JWT)

    Returns:
        TodoResponse: Updated todo with all fields

    Raises:
        401: If JWT token is missing or invalid
        404: If todo not found or doesn't belong to user
        422: If request validation fails
        500: If database operation fails

    Security:
        - Requires valid JWT token
        - Only updates todos belonging to authenticated user
        - User cannot modify user_id field
    """
    # Extract user_id from JWT
    user_id = current_user["user_id"]

    # Update todo via service layer
    service = get_todo_service()
    todo = service.update_todo(user_id=user_id, todo_id=todo_id, todo_data=todo_data)

    return TodoResponse(**todo)


@router.delete(
    "/{todo_id}",
    response_model=DeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete a todo",
    description="Delete a todo by ID for the authenticated user."
)
async def delete_todo(
    todo_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> DeleteResponse:
    """
    Delete a todo by ID for the authenticated user.

    Args:
        todo_id: Todo's UUID
        current_user: Authenticated user context (injected from JWT)

    Returns:
        DeleteResponse: Confirmation message with deleted todo id

    Raises:
        401: If JWT token is missing or invalid
        404: If todo not found or doesn't belong to user
        500: If database operation fails

    Security:
        - Requires valid JWT token
        - Only deletes todos belonging to authenticated user
        - Service layer filters by user_id
    """
    # Extract user_id from JWT
    user_id = current_user["user_id"]

    # Delete todo via service layer
    service = get_todo_service()
    deleted_todo = service.delete_todo(user_id=user_id, todo_id=todo_id)

    return DeleteResponse(
        message="Todo deleted successfully",
        id=deleted_todo["id"]
    )


@router.patch(
    "/{todo_id}/complete",
    response_model=TodoResponse,
    status_code=status.HTTP_200_OK,
    summary="Mark a todo as completed",
    description="Mark a specific todo as completed for the authenticated user."
)
async def mark_todo_completed(
    todo_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> TodoResponse:
    """
    Mark a todo as completed for the authenticated user.

    Args:
        todo_id: Todo's UUID
        current_user: Authenticated user context (injected from JWT)

    Returns:
        TodoResponse: Updated todo with status="completed"

    Raises:
        401: If JWT token is missing or invalid
        404: If todo not found or doesn't belong to user
        500: If database operation fails

    Security:
        - Requires valid JWT token
        - Only updates todos belonging to authenticated user
        - Service layer filters by user_id
    """
    # Extract user_id from JWT
    user_id = current_user["user_id"]

    # Mark as completed via service layer
    service = get_todo_service()
    todo = service.mark_completed(user_id=user_id, todo_id=todo_id)

    return TodoResponse(**todo)
