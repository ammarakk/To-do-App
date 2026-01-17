"""
Todo Service Module

This module contains business logic for Todo CRUD operations.
All methods filter by user_id to enforce user isolation (defense in depth).
This service layer sits between FastAPI routes and the Supabase database.

Security Rules:
- Every database query MUST filter by user_id
- Never return todos belonging to other users
- Never accept user_id from client (extract from JWT)
- Handle all database errors gracefully
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from fastapi import HTTPException, status

from src.models.database import get_supabase_client
from src.models.schemas import TodoCreate, TodoUpdate


class TodoService:
    """
    Service layer for Todo CRUD operations.

    All methods enforce user isolation by filtering queries with user_id.
    This provides defense in depth alongside database RLS policies.
    """

    def __init__(self):
        """Initialize TodoService with Supabase client."""
        self.client = get_supabase_client()

    def create_todo(
        self,
        user_id: str,
        todo_data: TodoCreate
    ) -> Dict[str, Any]:
        """
        Create a new todo for the specified user.

        Args:
            user_id: User's UUID (extracted from JWT token)
            todo_data: Todo creation data validated by TodoCreate schema

        Returns:
            Dict[str, Any]: Created todo record with all fields

        Raises:
            HTTPException: 500 if database operation fails

        Example:
            >>> service = TodoService()
            >>> todo_data = TodoCreate(title="Buy groceries")
            >>> todo = service.create_todo(user_id="uuid-123", todo_data=todo_data)
        """
        try:
            # Prepare todo data with user_id
            todo_dict = {
                "user_id": user_id,
                "title": todo_data.title,
                "description": todo_data.description,
                "status": todo_data.status.value,
                "priority": todo_data.priority.value,
                "due_date": todo_data.due_date.isoformat() if todo_data.due_date else None,
                "category": todo_data.category,
            }

            # Insert into database
            response = self.client.table("todos").insert(todo_dict).execute()

            # Check if insert succeeded
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to create todo: no data returned from database"
                )

            # Return created todo
            return response.data[0]

        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise

        except Exception as e:
            # Log unexpected error (in production, use proper logging)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to create todo: {str(e)}"
            )

    def get_todos(
        self,
        user_id: str,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        status: Optional[str] = None,
        priority: Optional[str] = None,
        category: Optional[str] = None
    ) -> tuple[List[Dict[str, Any]], int]:
        """
        Get todos for the specified user with pagination and filtering.

        Args:
            user_id: User's UUID (extracted from JWT token)
            page: Page number (1-indexed, default: 1)
            page_size: Number of items per page (default: 20, max: 100)
            search: Search string to filter titles/descriptions (optional)
            status: Filter by status (pending/completed, optional)
            priority: Filter by priority (low/medium/high, optional)
            category: Filter by category (optional)

        Returns:
            tuple[List[Dict[str, Any]], int]: (todos list, total count)

        Raises:
            HTTPException: 500 if database operation fails

        Example:
            >>> service = TodoService()
            >>> todos, total = service.get_todos(user_id="uuid-123", page=1, page_size=20)
        """
        try:
            # Enforce page_size limit
            page_size = min(page_size, 100)
            offset = (page - 1) * page_size

            # Build query
            query = self.client.table("todos").select("*", count="exact")

            # ALWAYS filter by user_id (defense in depth)
            query = query.eq("user_id", user_id)

            # Apply optional filters
            if search:
                # Search in title and description
                query = query.or_(f"title.ilike.%{search}%,description.ilike.%{search}%")

            if status:
                query = query.eq("status", status)

            if priority:
                query = query.eq("priority", priority)

            if category:
                query = query.eq("category", category)

            # Get total count before pagination
            count_response = query.execute()
            total = count_response.count if count_response.count is not None else 0

            # Apply pagination
            query = query.range(offset, offset + page_size - 1)

            # Order by created_at descending (newest first)
            query = query.order("created_at", desc=True)

            # Execute query
            response = query.execute()

            return response.data, total

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch todos: {str(e)}"
            )

    def get_todo_by_id(
        self,
        user_id: str,
        todo_id: str
    ) -> Dict[str, Any]:
        """
        Get a specific todo by ID for the specified user.

        Args:
            user_id: User's UUID (extracted from JWT token)
            todo_id: Todo's UUID

        Returns:
            Dict[str, Any]: Todo record with all fields

        Raises:
            HTTPException: 404 if todo not found or doesn't belong to user
            HTTPException: 500 if database operation fails

        Example:
            >>> service = TodoService()
            >>> todo = service.get_todo_by_id(user_id="uuid-123", todo_id="todo-uuid")
        """
        try:
            # Query with user_id filter (defense in depth)
            response = self.client.table("todos").select("*").eq("id", todo_id).eq("user_id", user_id).execute()

            # Check if todo exists and belongs to user
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Todo with id '{todo_id}' not found"
                )

            return response.data[0]

        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch todo: {str(e)}"
            )

    def update_todo(
        self,
        user_id: str,
        todo_id: str,
        todo_data: TodoUpdate
    ) -> Dict[str, Any]:
        """
        Update an existing todo for the specified user.

        Args:
            user_id: User's UUID (extracted from JWT token)
            todo_id: Todo's UUID
            todo_data: Todo update data validated by TodoUpdate schema

        Returns:
            Dict[str, Any]: Updated todo record with all fields

        Raises:
            HTTPException: 404 if todo not found or doesn't belong to user
            HTTPException: 500 if database operation fails

        Example:
            >>> service = TodoService()
            >>> todo_data = TodoUpdate(title="Updated title")
            >>> todo = service.update_todo(user_id="uuid-123", todo_id="todo-uuid", todo_data=todo_data)
        """
        try:
            # Build update dictionary (only include non-None fields)
            update_dict = {}

            if todo_data.title is not None:
                update_dict["title"] = todo_data.title

            if todo_data.description is not None:
                update_dict["description"] = todo_data.description

            if todo_data.status is not None:
                update_dict["status"] = todo_data.status.value

            if todo_data.priority is not None:
                update_dict["priority"] = todo_data.priority.value

            if todo_data.due_date is not None:
                update_dict["due_date"] = todo_data.due_date.isoformat()

            if todo_data.category is not None:
                update_dict["category"] = todo_data.category

            # Update with user_id filter (defense in depth)
            response = self.client.table("todos").update(update_dict).eq("id", todo_id).eq("user_id", user_id).execute()

            # Check if update succeeded
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Todo with id '{todo_id}' not found"
                )

            return response.data[0]

        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to update todo: {str(e)}"
            )

    def delete_todo(
        self,
        user_id: str,
        todo_id: str
    ) -> Dict[str, Any]:
        """
        Delete a todo by ID for the specified user.

        Args:
            user_id: User's UUID (extracted from JWT token)
            todo_id: Todo's UUID

        Returns:
            Dict[str, Any]: Deleted todo record (for confirmation)

        Raises:
            HTTPException: 404 if todo not found or doesn't belong to user
            HTTPException: 500 if database operation fails

        Example:
            >>> service = TodoService()
            >>> deleted = service.delete_todo(user_id="uuid-123", todo_id="todo-uuid")
        """
        try:
            # Delete with user_id filter (defense in depth)
            response = self.client.table("todos").delete().eq("id", todo_id).eq("user_id", user_id).execute()

            # Check if delete succeeded
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Todo with id '{todo_id}' not found"
                )

            return response.data[0]

        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to delete todo: {str(e)}"
            )

    def mark_completed(
        self,
        user_id: str,
        todo_id: str
    ) -> Dict[str, Any]:
        """
        Mark a todo as completed for the specified user.

        Args:
            user_id: User's UUID (extracted from JWT token)
            todo_id: Todo's UUID

        Returns:
            Dict[str, Any]: Updated todo record with status="completed"

        Raises:
            HTTPException: 404 if todo not found or doesn't belong to user
            HTTPException: 500 if database operation fails

        Example:
            >>> service = TodoService()
            >>> todo = service.mark_completed(user_id="uuid-123", todo_id="todo-uuid")
        """
        try:
            # Update status to completed with user_id filter (defense in depth)
            response = self.client.table("todos").update({"status": "completed"}).eq("id", todo_id).eq("user_id", user_id).execute()

            # Check if update succeeded
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Todo with id '{todo_id}' not found"
                )

            return response.data[0]

        except HTTPException:
            # Re-raise HTTP exceptions as-is
            raise

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to mark todo as completed: {str(e)}"
            )


# Global service instance (can be replaced with dependency injection if needed)
_todo_service: Optional[TodoService] = None


def get_todo_service() -> TodoService:
    """
    Get the global TodoService instance (singleton pattern).

    Returns:
        TodoService: Global todo service instance

    Example:
        >>> service = get_todo_service()
        >>> todos, total = service.get_todos(user_id="uuid-123")
    """
    global _todo_service
    if _todo_service is None:
        _todo_service = TodoService()
    return _todo_service
