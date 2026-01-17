# CRUD Pattern Skill

**Skill Type**: Service Layer Pattern
**Purpose**: Reusable CRUD logic for FastAPI services with Supabase

---

## Skill Definition

### Purpose

Provide a consistent, type-safe pattern for implementing CRUD (Create, Read, Update, Delete) operations in FastAPI services. This skill ensures:
- Input validation via Pydantic schemas
- Output schema enforcement
- Standardized error responses
- User isolation enforcement
- Consistent service patterns across all resources

### Rules

1. **Input Validation Required**: All inputs validated via Pydantic schemas
2. **Output Schema Enforced**: All responses conform to Pydantic models
3. **Errors Standardized**: Consistent error response format
4. **User Isolation**: All operations scoped to authenticated user
5. **Idempotent Operations**: GET and PUT operations are idempotent

---

## Core Patterns

### Pattern 1: Service Layer with Repository

```python
"""
CRUD Service Base Pattern

Provides reusable CRUD operations with validation and error handling.
"""

from typing import Generic, TypeVar, List, Optional, Dict, Any
from pydantic import BaseModel, ValidationError
from supabase import Client
from supabase.lib.client_options import ClientOptions
import httpx


# Type variables for generic CRUD
ModelType = TypeVar("ModelType", bound=BaseModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDException(Exception):
    """Base exception for CRUD operations."""

    def __init__(self, message: str, code: str = "CRUD_ERROR"):
        self.message = message
        self.code = code
        super().__init__(message)


class NotFoundError(CRUDException):
    """Raised when resource is not found."""

    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            f"{resource_type} with id '{resource_id}' not found",
            "NOT_FOUND"
        )


class ValidationError(CRUDException):
    """Raised when input validation fails."""

    def __init__(self, detail: str):
        super().__init__(f"Validation error: {detail}", "VALIDATION_ERROR")


class ConflictError(CRUDException):
    """Raised when resource conflicts with existing data."""

    def __init__(self, detail: str):
        super().__init__(f"Conflict: {detail}", "CONFLICT")


class CRUDService(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Generic CRUD service base class.

    Provides standard Create, Read, Update, Delete operations
    with validation, error handling, and user isolation.

    Usage:
        class TodoService(CRUDService[TodoResponse, TodoCreate, TodoUpdate]):
            def __init__(self, supabase: Client):
                super().__init__(supabase, "todos", TodoResponse)
    """

    def __init__(
        self,
        supabase: Client,
        table_name: str,
        response_model: type[ModelType],
    ):
        """
        Initialize CRUD service.

        Args:
            supabase: Supabase client instance
            table_name: Database table name
            response_model: Pydantic model for responses
        """
        self.supabase = supabase
        self.table_name = table_name
        self.response_model = response_model

    def _execute_query(self, query) -> List[ModelType]:
        """
        Execute Supabase query and validate response.

        Args:
            query: Supabase query object

        Returns:
            List of validated response models

        Raises:
            CRUDException: If query fails or validation fails
        """
        try:
            response = query.execute()
            if not response.data:
                return []
            # Validate and parse response
            return [self.response_model.model_validate(item) for item in response.data]
        except httpx.HTTPError as e:
            raise CRUDException(f"Database query failed: {e}")
        except ValidationError as e:
            raise ValidationError(f"Response validation failed: {e}")

    def get(
        self,
        resource_id: str,
        user_id: str,
    ) -> ModelType:
        """
        Get a single resource by ID.

        Args:
            resource_id: Resource UUID
            user_id: Authenticated user ID (for ownership check)

        Returns:
            Validated response model

        Raises:
            NotFoundError: If resource not found or doesn't belong to user
        """
        query = (
            self.supabase.table(self.table_name)
            .select("*")
            .eq("id", resource_id)
            .eq("user_id", user_id)
        )
        results = self._execute_query(query)

        if not results:
            raise NotFoundError(self.table_name, resource_id)

        return results[0]

    def list(
        self,
        user_id: str,
        filters: Optional[Dict[str, Any]] = None,
        order_by: str = "created_at",
        ascending: bool = False,
        limit: int = 100,
        offset: int = 0,
    ) -> List[ModelType]:
        """
        List resources for authenticated user.

        Args:
            user_id: Authenticated user ID
            filters: Optional field filters (e.g., {"status": "completed"})
            order_by: Field to order by
            ascending: Sort order (False = desc, True = asc)
            limit: Max results to return
            offset: Pagination offset

        Returns:
            List of validated response models
        """
        query = (
            self.supabase.table(self.table_name)
            .select("*")
            .eq("user_id", user_id)
            .order(order_by, ascending=ascending)
            .limit(limit)
            .offset(offset)
        )

        # Apply additional filters
        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)

        return self._execute_query(query)

    def create(
        self,
        data: CreateSchemaType,
        user_id: str,
    ) -> ModelType:
        """
        Create a new resource.

        Args:
            data: Create schema with validated input
            user_id: Authenticated user ID

        Returns:
            Created resource as validated response model

        Raises:
            ValidationError: If validation fails
            ConflictError: If resource conflicts with existing data
        """
        # Prepare data with user ownership
        resource_data = data.model_dump()
        resource_data["user_id"] = user_id

        try:
            query = self.supabase.table(self.table_name).insert(resource_data).select()
            results = self._execute_query(query)

            if not results:
                raise CRUDException("Failed to create resource")

            return results[0]

        except httpx.HTTPStatusError as e:
            if e.response.status_code == 409:
                raise ConflictError("Resource already exists")
            raise CRUDException(f"Create failed: {e}")

    def update(
        self,
        resource_id: str,
        data: UpdateSchemaType,
        user_id: str,
    ) -> ModelType:
        """
        Update an existing resource.

        Args:
            resource_id: Resource UUID
            data: Update schema with validated fields
            user_id: Authenticated user ID (for ownership check)

        Returns:
            Updated resource as validated response model

        Raises:
            NotFoundError: If resource not found or doesn't belong to user
            ValidationError: If validation fails
        """
        # Filter out None values (partial update)
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}

        if not update_data:
            raise ValidationError("No fields to update")

        query = (
            self.supabase.table(self.table_name)
            .update(update_data)
            .eq("id", resource_id)
            .eq("user_id", user_id)
            .select()
        )
        results = self._execute_query(query)

        if not results:
            raise NotFoundError(self.table_name, resource_id)

        return results[0]

    def delete(
        self,
        resource_id: str,
        user_id: str,
    ) -> None:
        """
        Delete a resource.

        Args:
            resource_id: Resource UUID
            user_id: Authenticated user ID (for ownership check)

        Raises:
            NotFoundError: If resource not found or doesn't belong to user
        """
        query = (
            self.supabase.table(self.table_name)
            .delete()
            .eq("id", resource_id)
            .eq("user_id", user_id)
        )

        try:
            response = query.execute()
            if not response.data:
                raise NotFoundError(self.table_name, resource_id)
        except httpx.HTTPError as e:
            raise CRUDException(f"Delete failed: {e}")

    def count(
        self,
        user_id: str,
        filters: Optional[Dict[str, Any]] = None,
    ) -> int:
        """
        Count resources for authenticated user.

        Args:
            user_id: Authenticated user ID
            filters: Optional field filters

        Returns:
            Count of matching resources
        """
        query = self.supabase.table(self.table_name).select("*", count="exact").eq("user_id", user_id)

        if filters:
            for key, value in filters.items():
                query = query.eq(key, value)

        try:
            response = query.execute()
            return response.count if hasattr(response, 'count') else len(response.data)
        except httpx.HTTPError as e:
            raise CRUDException(f"Count failed: {e}")
```

---

## Implementation: Todo Service

### File: `backend/src/services/todo_service.py`

```python
"""
Todo CRUD Service

Implements CRUD operations for todos with validation and error handling.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from enum import Enum

from .crud_service import CRUDService, NotFoundError, ValidationError
from ..models.database import supabase


# ============================================================
# SCHEMAS
# ============================================================

class Priority(str, Enum):
    """Todo priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Status(str, Enum):
    """Todo status values."""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# Input schemas
class TodoBase(BaseModel):
    """Base todo fields."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    priority: Priority = Field(default=Priority.MEDIUM)
    due_date: Optional[datetime] = None

    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('title cannot be empty or whitespace')
        return v.strip()


class TodoCreate(TodoBase):
    """Schema for creating a todo."""
    pass


class TodoUpdate(BaseModel):
    """Schema for updating a todo (all fields optional)."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=5000)
    priority: Optional[Priority] = None
    status: Optional[Status] = None
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError('title cannot be empty or whitespace')
        return v.strip() if v else v


# Output schema
class TodoResponse(BaseModel):
    """Schema for todo responses."""
    id: str
    user_id: str
    title: str
    description: Optional[str] = None
    priority: Priority
    status: Status
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# List response with metadata
class TodoListResponse(BaseModel):
    """Schema for paginated todo list response."""
    items: List[TodoResponse]
    total: int
    page: int
    page_size: int
    has_more: bool


# ============================================================
# SERVICE
# ============================================================

class TodoService(CRUDService[TodoResponse, TodoCreate, TodoUpdate]):
    """
    Todo CRUD service with business logic.

    Extends generic CRUD service with todo-specific operations.
    """

    def __init__(self):
        """Initialize todo service."""
        super().__init__(supabase, "todos", TodoResponse)

    def search(
        self,
        user_id: str,
        query: str,
        limit: int = 20,
    ) -> List[TodoResponse]:
        """
        Search todos by title or description.

        Args:
            user_id: Authenticated user ID
            query: Search query string
            limit: Max results

        Returns:
            List of matching todos
        """
        # Note: Supabase full-text search requires tsvector setup
        # Using ILIKE for simple case-insensitive search
        try:
            response = (
                self.supabase.table(self.table_name)
                .select("*")
                .eq("user_id", user_id)
                .or_(f"title.ilike.%{query}%,description.ilike.%{query}%")
                .limit(limit)
                .execute()
            )

            return [TodoResponse.model_validate(item) for item in response.data]

        except Exception as e:
            raise ValidationError(f"Search failed: {e}")

    def list_by_status(
        self,
        user_id: str,
        status: Status,
        limit: int = 100,
    ) -> List[TodoResponse]:
        """
        List todos filtered by status.

        Args:
            user_id: Authenticated user ID
            status: Status to filter by
            limit: Max results

        Returns:
            List of todos with specified status
        """
        return self.list(
            user_id=user_id,
            filters={"status": status.value},
            limit=limit,
        )

    def mark_completed(
        self,
        todo_id: str,
        user_id: str,
    ) -> TodoResponse:
        """
        Mark a todo as completed.

        Args:
            todo_id: Todo UUID
            user_id: Authenticated user ID

        Returns:
            Updated todo
        """
        update_data = TodoUpdate(
            status=Status.COMPLETED,
            completed_at=datetime.utcnow(),
        )
        return self.update(todo_id, update_data, user_id)

    def get_overdue(
        self,
        user_id: str,
        limit: int = 50,
    ) -> List[TodoResponse]:
        """
        Get overdue todos (past due date and not completed).

        Args:
            user_id: Authenticated user ID
            limit: Max results

        Returns:
            List of overdue todos
        """
        try:
            response = (
                self.supabase.table(self.table_name)
                .select("*")
                .eq("user_id", user_id)
                .lt("due_date", datetime.utcnow().isoformat())
                .neq("status", "completed")
                .limit(limit)
                .execute()
            )

            return [TodoResponse.model_validate(item) for item in response.data]

        except Exception as e:
            raise ValidationError(f"Failed to fetch overdue todos: {e}")

    def get_stats(self, user_id: str) -> Dict[str, int]:
        """
        Get todo statistics for user.

        Args:
            user_id: Authenticated user ID

        Returns:
            Dictionary with counts by status
        """
        stats = {}

        for status in Status:
            count = self.count(
                user_id=user_id,
                filters={"status": status.value},
            )
            stats[status.value] = count

        stats["total"] = self.count(user_id=user_id)
        stats["overdue"] = len(self.get_overdue(user_id, limit=1000))

        return stats


# Singleton instance
todo_service = TodoService()
```

---

## Implementation: FastAPI Routes

### File: `backend/src/api/routes/todos.py`

```python
"""
Todo API Routes

CRUD endpoints for todo management with JWT authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional

from ...api.deps import AuthenticatedUser, get_current_user
from ...models.schemas import (
    TodoCreate,
    TodoUpdate,
    TodoResponse,
    TodoListResponse,
)
from ...services.todo_service import (
    todo_service,
    NotFoundError,
    ValidationError,
    CRUDException,
)
from ...services.todo_service import Status


router = APIRouter()


# Error handler mapping
def map_crud_exception(exc: CRUDException) -> HTTPException:
    """Map CRUD exceptions to HTTP exceptions."""
    status_codes = {
        "NOT_FOUND": status.HTTP_404_NOT_FOUND,
        "VALIDATION_ERROR": status.HTTP_422_UNPROCESSABLE_ENTITY,
        "CONFLICT": status.HTTP_409_CONFLICT,
    }
    code = exc.code if exc.code in status_codes else "CRUD_ERROR"
    http_status = status_codes.get(code, status.HTTP_500_INTERNAL_SERVER_ERROR)
    return HTTPException(status_code=http_status, detail=exc.message)


# ============================================================
# CRUD ENDPOINTS
# ============================================================

@router.get("/", response_model=TodoListResponse)
async def list_todos(
    current_user: AuthenticatedUser = Depends(get_current_user),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[Status] = None,
) -> TodoListResponse:
    """
    List all todos for the authenticated user.

    Supports pagination and status filtering.
    """
    try:
        filters = {"status": status_filter.value} if status_filter else None
        offset = (page - 1) * page_size

        items = todo_service.list(
            user_id=current_user.user_id,
            filters=filters,
            limit=page_size,
            offset=offset,
        )

        # Get total count
        total = todo_service.count(
            user_id=current_user.user_id,
            filters=filters,
        )

        return TodoListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_more=offset + page_size < total,
        )

    except CRUDException as e:
        raise map_crud_exception(e)


@router.post("/", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: TodoCreate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> TodoResponse:
    """
    Create a new todo for the authenticated user.

    Validates input and enforces user ownership.
    """
    try:
        return todo_service.create(todo, current_user.user_id)
    except CRUDException as e:
        raise map_crud_exception(e)


@router.get("/{todo_id}", response_model=TodoResponse)
async def get_todo(
    todo_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> TodoResponse:
    """
    Get a specific todo by ID.

    Returns 404 if todo doesn't exist or doesn't belong to user.
    """
    try:
        return todo_service.get(todo_id, current_user.user_id)
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id '{todo_id}' not found",
        )
    except CRUDException as e:
        raise map_crud_exception(e)


@router.put("/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: str,
    todo: TodoUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> TodoResponse:
    """
    Update a specific todo.

    Only updates provided fields (partial update).
    Returns 404 if todo doesn't exist or doesn't belong to user.
    """
    try:
        return todo_service.update(todo_id, todo, current_user.user_id)
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id '{todo_id}' not found",
        )
    except CRUDException as e:
        raise map_crud_exception(e)


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> None:
    """
    Delete a specific todo.

    Returns 404 if todo doesn't exist or doesn't belong to user.
    Returns 204 No Content on success.
    """
    try:
        todo_service.delete(todo_id, current_user.user_id)
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id '{todo_id}' not found",
        )
    except CRUDException as e:
        raise map_crud_exception(e)


# ============================================================
# ADDITIONAL ENDPOINTS
# ============================================================

@router.get("/search/results", response_model=List[TodoResponse])
async def search_todos(
    q: str = Query(..., min_length=1),
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> List[TodoResponse]:
    """
    Search todos by title or description.

    Returns todos matching the search query.
    """
    try:
        return todo_service.search(current_user.user_id, q)
    except CRUDException as e:
        raise map_crud_exception(e)


@router.post("/{todo_id}/complete", response_model=TodoResponse)
async def mark_todo_completed(
    todo_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> TodoResponse:
    """
    Mark a todo as completed.

    Shortcut endpoint to mark todo as completed with current timestamp.
    """
    try:
        return todo_service.mark_completed(todo_id, current_user.user_id)
    except NotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Todo with id '{todo_id}' not found",
        )
    except CRUDException as e:
        raise map_crud_exception(e)


@router.get("/stats/summary", response_model=Dict[str, int])
async def get_todo_stats(
    current_user: AuthenticatedUser = Depends(get_current_user),
) -> Dict[str, int]:
    """
    Get todo statistics for the authenticated user.

    Returns counts by status and total.
    """
    try:
        return todo_service.get_stats(current_user.user_id)
    except CRUDException as e:
        raise map_crud_exception(e)
```

---

## Standard Error Responses

### File: `backend/src/api/exceptions.py`

```python
"""
Standardized error response models.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel


class ErrorDetail(BaseModel):
    """Detailed error information."""
    field: Optional[str] = None
    message: str


class ErrorResponse(BaseModel):
    """Standard error response format."""
    error: str
    message: str
    code: str
    details: Optional[list[ErrorDetail]] = None


# Exception to error mapping
ERROR_CODE_MAP = {
    "NOT_FOUND": 404,
    "VALIDATION_ERROR": 422,
    "CONFLICT": 409,
    "UNAUTHORIZED": 401,
    "FORBIDDEN": 403,
    "CRUD_ERROR": 500,
}
```

---

## Usage Example: Complete CRUD Flow

```python
# 1. CREATE
POST /api/todos
Authorization: Bearer <jwt-token>
{
    "title": "Learn FastAPI",
    "description": "Complete the tutorial",
    "priority": "high",
    "due_date": "2026-01-20T10:00:00Z"
}

# Response: 201 Created
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "user-123",
    "title": "Learn FastAPI",
    "description": "Complete the tutorial",
    "priority": "high",
    "status": "pending",
    "due_date": "2026-01-20T10:00:00Z",
    "created_at": "2026-01-17T10:00:00Z",
    "updated_at": "2026-01-17T10:00:00Z"
}

# 2. READ (List)
GET /api/todos?page=1&page_size=20

# 3. READ (Single)
GET /api/todos/550e8400-e29b-41d4-a716-446655440000

# 4. UPDATE
PUT /api/todos/550e8400-e29b-41d4-a716-446655440000
{
    "status": "completed"
}

# 5. DELETE
DELETE /api/todos/550e8400-e29b-41d4-a716-446655440000
# Response: 204 No Content
```

---

## Testing CRUD Operations

### File: `backend/tests/unit/test_crud_service.py`

```python
"""
Unit tests for CRUD service operations.
"""

import pytest
from unittest.mock import Mock, MagicMock

from backend.src.services.crud_service import CRUDService
from backend.src.models.schemas import TodoCreate, TodoUpdate, TodoResponse


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    return Mock()


@pytest.fixture
def todo_service(mock_supabase):
    """Todo service with mocked Supabase."""
    return CRUDService(mock_supabase, "todos", TodoResponse)


def test_create_todo(todo_service, mock_supabase):
    """Test creating a todo."""
    # Arrange
    todo_data = TodoCreate(title="Test Todo", priority="medium")
    mock_response = MagicMock()
    mock_response.data = [{
        "id": "123",
        "user_id": "user-1",
        "title": "Test Todo",
        "priority": "medium",
        "status": "pending",
        "created_at": "2026-01-17T10:00:00Z",
        "updated_at": "2026-01-17T10:00:00Z",
    }]
    mock_supabase.table.return_value.insert.return_value.select.return_value.execute.return_value = mock_response

    # Act
    result = todo_service.create(todo_data, "user-1")

    # Assert
    assert isinstance(result, TodoResponse)
    assert result.title == "Test Todo"
    assert result.user_id == "user-1"


def test_get_not_found(todo_service, mock_supabase):
    """Test getting non-existent todo raises NotFoundError."""
    # Arrange
    mock_response = MagicMock()
    mock_response.data = []
    mock_supabase.table.return_value.select.return_value.execute.return_value = mock_response

    # Act & Assert
    with pytest.raises(NotFoundError):
        todo_service.get("nonexistent-id", "user-1")


def test_update_todo(todo_service, mock_supabase):
    """Test updating a todo."""
    # Arrange
    update_data = TodoUpdate(status="completed")
    mock_response = MagicMock()
    mock_response.data = [{
        "id": "123",
        "user_id": "user-1",
        "title": "Test Todo",
        "status": "completed",
        "created_at": "2026-01-17T10:00:00Z",
        "updated_at": "2026-01-17T11:00:00Z",
    }]
    mock_supabase.table.return_value.update.return_value.select.return_value.execute.return_value = mock_response

    # Act
    result = todo_service.update("123", update_data, "user-1")

    # Assert
    assert result.status == "completed"


def test_delete_todo(todo_service, mock_supabase):
    """Test deleting a todo."""
    # Arrange
    mock_response = MagicMock()
    mock_response.data = [{"id": "123"}]
    mock_supabase.table.return_value.delete.return_value.execute.return_value = mock_response

    # Act - should not raise exception
    todo_service.delete("123", "user-1")
```

---

## Best Practices Checklist

Use this checklist when implementing CRUD services:

- [ ] All inputs use Pydantic schemas with validation
- [ ] All outputs use Pydantic response models
- [ ] User ID is injected from JWT, not from request body
- [ ] All queries filter by `user_id` for isolation
- [ ] Errors are mapped to appropriate HTTP status codes
- [ ] Pagination is supported on list endpoints
- [ ] Partial updates are supported (omit None values)
- [ ] Idempotent operations: GET, PUT
- [ ] Non-idempotent operations: POST, DELETE
- [ ] Service layer is separate from route handlers
- [ ] Database exceptions are caught and re-raised as domain exceptions
- [ ] Response models match OpenAPI specification

---

## References

- [FastAPI CRUD Best Practices](https://fastapi.tiangolo.com/tutorial/sql-databases/)
- [Pydantic Validation](https://docs.pydantic.dev/latest/concepts/validators/)
- [Supabase Python Client](https://supabase.com/docs/reference/python)
- [RESTful API Design](https://restfulapi.net/)
