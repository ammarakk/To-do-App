# API Contracts & Schemas Documentation

This document describes the API contracts and Pydantic schemas for the Todo backend API.

## Overview

All API request and validation is handled through Pydantic schemas defined in `src/models/schemas.py`. These schemas serve as the single source of truth for API contracts.

### Schema Categories

1. **Input Schemas** - Validate data sent by clients
   - `TodoCreate` - Create a new todo
   - `TodoUpdate` - Update an existing todo

2. **Output Schemas** - Define data returned to clients
   - `TodoResponse` - Complete todo object
   - `UserResponse` - User information
   - `ErrorResponse` - Standardized error format
   - `PaginatedResponse` - Paginated list wrapper

3. **Enums** - Define valid field values
   - `TodoStatus` - pending, completed
   - `TodoPriority` - low, medium, high

---

## Todo Schemas

### TodoCreate

Used when creating a new todo item.

**Fields:**

| Field | Type | Required | Constraints | Default |
|-------|------|----------|-------------|---------|
| title | string | Yes | 1-200 chars, non-empty | - |
| description | string | No | Max 1000 chars | null |
| status | TodoStatus | No | "pending" or "completed" | "pending" |
| priority | TodoPriority | No | "low", "medium", or "high" | "medium" |
| due_date | datetime | No | ISO 8601 format | null |
| category | string | No | Max 50 chars | null |

**Validation Rules:**
- Title cannot be empty or whitespace only
- Leading/trailing whitespace in title is stripped automatically
- All string fields have maximum length constraints

**Example:**

```json
{
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-01-20T10:00:00Z",
  "category": "work"
}
```

### TodoUpdate

Used when updating an existing todo. All fields are optional to support partial updates.

**Fields:** Same as TodoCreate, but all fields are optional.

**Validation Rules:**
- Only include fields that should be updated
- Null values can be used to clear optional fields (except title)
- Title validation still applies (non-empty if provided)

**Example (Partial Update):**

```json
{
  "status": "completed",
  "priority": "low"
}
```

**Example (Clear Fields):**

```json
{
  "description": null,
  "due_date": null
}
```

### TodoResponse

Returned by the API for successful todo operations.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique todo identifier |
| user_id | UUID | Owner's user ID |
| title | string | Todo title |
| description | string | Todo description or null |
| status | TodoStatus | Current status |
| priority | TodoPriority | Priority level |
| due_date | datetime | Due date or null |
| category | string | Category or null |
| created_at | datetime | Creation timestamp |
| updated_at | datetime | Last update timestamp |

**Example:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Complete project documentation",
  "description": "Write comprehensive API docs",
  "status": "pending",
  "priority": "high",
  "due_date": "2026-01-20T10:00:00Z",
  "category": "work",
  "created_at": "2026-01-17T10:00:00Z",
  "updated_at": "2026-01-17T10:00:00Z"
}
```

---

## User Schemas

### UserResponse

Returned by the API for user-related operations. Does not include sensitive data.

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | User identifier |
| email | string | User email |
| created_at | datetime | Account creation timestamp |
| updated_at | datetime | Last update timestamp |

**Example:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "user@example.com",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-17T10:00:00Z"
}
```

---

## Error Response Schema

All API errors follow a consistent format defined by the `ErrorResponse` schema.

### ErrorResponse

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| code | string | Application-specific error code |
| message | string | Human-readable error description |
| details | ErrorDetail[] | Array of error details |

### ErrorDetail

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| field | string or null | Field name causing the error |
| message | string | Specific error message |

**Example (Validation Error):**

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Example (Not Found):**

```json
{
  "code": "NOT_FOUND",
  "message": "The requested resource was not found",
  "details": []
}
```

### Standard Error Codes

Defined in `src/api/routes/__init__.py`:

| Code | Usage |
|------|-------|
| VALIDATION_ERROR | Request validation failed |
| INVALID_INPUT | Invalid input data |
| MISSING_FIELD | Required field is missing |
| INVALID_FORMAT | Data format is invalid |
| UNAUTHORIZED | Authentication required |
| INVALID_TOKEN | Invalid or expired token |
| TOKEN_EXPIRED | Token has expired |
| MISSING_TOKEN | No authentication token provided |
| FORBIDDEN | Insufficient permissions |
| INSUFFICIENT_PERMISSIONS | User lacks required permissions |
| NOT_FOUND | Resource not found |
| ALREADY_EXISTS | Resource already exists |
| CONFLICT | Resource conflict |
| INTERNAL_ERROR | Unexpected server error |
| DATABASE_ERROR | Database operation failed |
| EXTERNAL_SERVICE_ERROR | External service failure |

---

## HTTP Status Codes

Standard status codes used across all API endpoints.

### Success Codes

| Code | Constant | Usage |
|------|----------|-------|
| 200 | HTTP_200_OK | Successful GET, PATCH, DELETE |
| 201 | HTTP_201_CREATED | Successful POST (resource created) |
| 204 | HTTP_204_NO_CONTENT | Successful DELETE (no response body) |

### Client Error Codes

| Code | Constant | Usage |
|------|----------|-------|
| 400 | HTTP_400_BAD_REQUEST | Malformed request |
| 401 | HTTP_401_UNAUTHORIZED | Missing or invalid authentication |
| 403 | HTTP_403_FORBIDDEN | Authenticated but insufficient permissions |
| 404 | HTTP_404_NOT_FOUND | Resource not found |
| 409 | HTTP_409_CONFLICT | Resource conflict (duplicate) |
| 422 | HTTP_422_UNPROCESSABLE_ENTITY | Validation failed |
| 429 | HTTP_429_TOO_MANY_REQUESTS | Rate limit exceeded |

### Server Error Codes

| Code | Constant | Usage |
|------|----------|-------|
| 500 | HTTP_500_INTERNAL_SERVER_ERROR | Unexpected server error |
| 502 | HTTP_502_BAD_GATEWAY | Upstream service error |
| 503 | HTTP_503_SERVICE_UNAVAILABLE | Service temporarily unavailable |

---

## Pagination Schema

List endpoints use the `PaginatedResponse` wrapper.

### PaginatedResponse

**Fields:**

| Field | Type | Description |
|-------|------|-------------|
| items | array | Items for the current page |
| total | integer | Total items across all pages |
| page | integer | Current page number (1-indexed) |
| page_size | integer | Number of items per page |
| total_pages | integer | Total number of pages |

**Example:**

```json
{
  "items": [
    { "id": "...", "title": "Todo 1" },
    { "id": "...", "title": "Todo 2" }
  ],
  "total": 100,
  "page": 1,
  "page_size": 20,
  "total_pages": 5
}
```

---

## Schema Validation

All schemas automatically validate:
- **Data Types** - Ensures correct field types
- **Required Fields** - Enforces mandatory fields
- **Field Constraints** - Checks length, ranges, formats
- **Enum Values** - Validates against allowed values
- **Custom Rules** - Business logic validation

Validation errors return HTTP 422 with detailed field-level information.

### Custom Validators

The schemas include custom validation logic:
- Title cannot be empty or whitespace only
- String fields are trimmed of excess whitespace
- Field length limits are enforced

---

## Usage Examples

### Creating a Todo

```python
from src.models import TodoCreate, TodoStatus, TodoPriority

todo_data = TodoCreate(
    title="Complete project",
    description="Finish all tasks",
    status=TodoStatus.PENDING,
    priority=TodoPriority.HIGH
)
```

### Updating a Todo

```python
from src.models import TodoUpdate, TodoStatus

update_data = TodoUpdate(
    status=TodoStatus.COMPLETED
)
```

### Handling Error Responses

```python
from src.models import ErrorResponse

error = ErrorResponse(
    code="NOT_FOUND",
    message="Todo not found",
    details=[]
)
```

---

## Best Practices

1. **Use Schemas Consistently** - Always use Pydantic schemas for API input/output
2. **Separate Input/Output** - Use different schemas for requests vs responses
3. **Validate Early** - Let Pydantic validate at the API boundary
4. **Document Constraints** - Field descriptions explain validation rules
5. **Handle Errors** - Always return ErrorResponse for errors
6. **Version Carefully** - Schema changes are API changes

---

## Migration Notes

- Pydantic V2 is used (no deprecated `json_encoders`)
- Schemas use `ConfigDict` instead of `model_config`
- Custom serializers can be added as needed
- All schemas support `from_attributes` for ORM integration
