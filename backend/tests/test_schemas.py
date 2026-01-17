"""
Comprehensive tests for Pydantic schema definitions.

Validates that all schemas:
- Enforce proper validation rules
- Accept valid inputs
- Reject invalid inputs
- Have correct field types and constraints
"""

import pytest
from datetime import datetime
from uuid import uuid4

from src.models.schemas import (
    TodoCreate,
    TodoUpdate,
    TodoResponse,
    UserResponse,
    ErrorResponse,
    PaginatedResponse,
    TodoStatus,
    TodoPriority,
)


class TestTodoCreate:
    """Test TodoCreate schema validation"""

    def test_valid_todo_create_with_required_fields(self):
        """Test creating todo with only required field"""
        todo = TodoCreate(title="Test Todo")
        assert todo.title == "Test Todo"
        assert todo.status == TodoStatus.PENDING
        assert todo.priority == TodoPriority.MEDIUM

    def test_valid_todo_create_with_all_fields(self):
        """Test creating todo with all fields"""
        due_date = datetime.now()
        todo = TodoCreate(
            title="Complete project",
            description="Finish the backend API",
            status=TodoStatus.PENDING,
            priority=TodoPriority.HIGH,
            due_date=due_date,
            category="work"
        )
        assert todo.title == "Complete project"
        assert todo.description == "Finish the backend API"
        assert todo.status == TodoStatus.PENDING
        assert todo.priority == TodoPriority.HIGH
        assert todo.due_date == due_date
        assert todo.category == "work"

    def test_title_required(self):
        """Test that title is required"""
        with pytest.raises(ValueError):
            TodoCreate()

    def test_title_min_length(self):
        """Test title minimum length validation"""
        with pytest.raises(ValueError):
            TodoCreate(title="")

    def test_title_whitespace_only(self):
        """Test that whitespace-only title is rejected"""
        with pytest.raises(ValueError):
            TodoCreate(title="   ")

    def test_title_max_length(self):
        """Test title maximum length validation"""
        with pytest.raises(ValueError):
            TodoCreate(title="a" * 201)

    def test_description_max_length(self):
        """Test description maximum length validation"""
        with pytest.raises(ValueError):
            TodoCreate(
                title="Valid Title",
                description="a" * 1001
            )

    def test_category_max_length(self):
        """Test category maximum length validation"""
        with pytest.raises(ValueError):
            TodoCreate(
                title="Valid Title",
                category="a" * 51
            )

    def test_title_strips_whitespace(self):
        """Test that leading/trailing whitespace is stripped from title"""
        todo = TodoCreate(title="  Test Todo  ")
        assert todo.title == "Test Todo"


class TestTodoUpdate:
    """Test TodoUpdate schema validation"""

    def test_valid_empty_update(self):
        """Test update with no fields (all optional)"""
        update = TodoUpdate()
        assert update.title is None
        assert update.description is None
        assert update.status is None
        assert update.priority is None

    def test_valid_partial_update(self):
        """Test update with only some fields"""
        update = TodoUpdate(title="Updated Title", priority=TodoPriority.LOW)
        assert update.title == "Updated Title"
        assert update.priority == TodoPriority.LOW
        assert update.status is None

    def test_valid_full_update(self):
        """Test update with all fields"""
        due_date = datetime.now()
        update = TodoUpdate(
            title="Updated Title",
            description="Updated description",
            status=TodoStatus.COMPLETED,
            priority=TodoPriority.HIGH,
            due_date=due_date,
            category="personal"
        )
        assert update.title == "Updated Title"
        assert update.status == TodoStatus.COMPLETED
        assert update.priority == TodoPriority.HIGH

    def test_title_validation_on_update(self):
        """Test that title validation still applies on updates"""
        with pytest.raises(ValueError):
            TodoUpdate(title="")

    def test_title_strips_whitespace_on_update(self):
        """Test that whitespace is stripped from title on update"""
        update = TodoUpdate(title="  Updated Title  ")
        assert update.title == "Updated Title"


class TestTodoResponse:
    """Test TodoResponse schema structure"""

    def test_valid_todo_response(self):
        """Test creating valid todo response"""
        now = datetime.now()
        todo = TodoResponse(
            id=uuid4(),
            user_id=uuid4(),
            title="Test Todo",
            description="Test description",
            status=TodoStatus.PENDING,
            priority=TodoPriority.MEDIUM,
            due_date=now,
            category="work",
            created_at=now,
            updated_at=now
        )
        assert isinstance(todo.id, type(uuid4()))
        assert todo.title == "Test Todo"
        assert todo.status == TodoStatus.PENDING

    def test_required_fields_in_response(self):
        """Test that all required fields are present"""
        with pytest.raises(ValueError):
            TodoResponse(
                id=uuid4(),
                user_id=uuid4(),
                title="Test",
                status=TodoStatus.PENDING,
                priority=TodoPriority.MEDIUM,
                # Missing created_at and updated_at
            )


class TestUserResponse:
    """Test UserResponse schema structure"""

    def test_valid_user_response(self):
        """Test creating valid user response"""
        now = datetime.now()
        user = UserResponse(
            id=uuid4(),
            email="user@example.com",
            created_at=now,
            updated_at=now
        )
        assert user.email == "user@example.com"
        assert isinstance(user.id, type(uuid4()))


class TestErrorResponse:
    """Test ErrorResponse schema structure"""

    def test_valid_error_response_without_details(self):
        """Test error response without details"""
        error = ErrorResponse(
            code="VALIDATION_ERROR",
            message="Validation failed"
        )
        assert error.code == "VALIDATION_ERROR"
        assert error.message == "Validation failed"
        assert error.details == []

    def test_valid_error_response_with_details(self):
        """Test error response with details"""
        from src.models.schemas import ErrorDetail

        error = ErrorResponse(
            code="VALIDATION_ERROR",
            message="Validation failed",
            details=[
                ErrorDetail(field="title", message="Title is required"),
                ErrorDetail(field="email", message="Invalid email format")
            ]
        )
        assert len(error.details) == 2
        assert error.details[0].field == "title"


class TestPaginatedResponse:
    """Test PaginatedResponse schema structure"""

    def test_valid_paginated_response(self):
        """Test paginated response structure"""
        response = PaginatedResponse(
            items=[{"id": 1}, {"id": 2}],
            total=100,
            page=1,
            page_size=20,
            total_pages=5
        )
        assert len(response.items) == 2
        assert response.total == 100
        assert response.page == 1
        assert response.total_pages == 5

    def test_page_validation(self):
        """Test that page must be >= 1"""
        with pytest.raises(ValueError):
            PaginatedResponse(
                items=[],
                total=0,
                page=0,
                page_size=20,
                total_pages=0
            )

    def test_total_pages_validation(self):
        """Test that total_pages must be >= 0"""
        with pytest.raises(ValueError):
            PaginatedResponse(
                items=[],
                total=0,
                page=1,
                page_size=20,
                total_pages=-1
            )


class TestEnums:
    """Test enum definitions"""

    def test_todo_status_values(self):
        """Test TodoStatus enum values"""
        assert TodoStatus.PENDING == "pending"
        assert TodoStatus.COMPLETED == "completed"

    def test_todo_priority_values(self):
        """Test TodoPriority enum values"""
        assert TodoPriority.LOW == "low"
        assert TodoPriority.MEDIUM == "medium"
        assert TodoPriority.HIGH == "high"
