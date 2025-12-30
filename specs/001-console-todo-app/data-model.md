# Data Model: Phase I Console Todo Application

**Feature**: 001-console-todo-app
**Created**: 2025-12-31
**Source**: Feature Specification (spec.md)

## Overview

This document defines the data model for Phase I console todo application. Per constitutional constraints, all data exists in memory only with no persistence.

## Entities

### Task

Represents a single todo item in the user's task list.

**Attributes:**

| Field | Type | Required | Default | Constraints | Description |
|-------|------|----------|---------|-------------|-------------|
| id | int | Yes | Auto-assigned | Unique, immutable, auto-increment starting from 1 | Unique identifier for the task |
| title | str | Yes | None | Non-empty string | Primary description of the task |
| description | str | No | Empty string ("") | Any string | Optional additional details about the task |
| completed | bool | Yes | False | True or False | Indicates whether the task has been completed |

**Validation Rules:**

- `id`: Generated automatically, never null, never duplicated within a session
- `title`: MUST NOT be empty or whitespace-only when creating or updating
- `description`: May be empty, no length restrictions
- `completed`: Defaults to False on creation, can only be changed to True (no toggle back to incomplete in Phase I)

**State Transitions:**

```
[New] --create--> [Incomplete: completed=False]
[Incomplete] --mark_complete--> [Complete: completed=True]
[Incomplete] --update--> [Incomplete: modified title/description]
[Complete] --update--> [Complete: modified title/description]
[Any State] --delete--> [Removed from memory]
```

**Business Rules:**

1. Task IDs are assigned sequentially starting from 1
2. Once assigned, a task ID never changes
3. Deleted task IDs are not reused within the same session
4. Tasks marked complete cannot be unmarked (Phase I constraint)
5. Empty titles are rejected before task creation

## Data Storage

### In-Memory Structure

**Storage Mechanism**: Python dictionary

```python
# Conceptual structure (not implementation)
task_storage = {
    1: Task(id=1, title="...", description="...", completed=False),
    2: Task(id=2, title="...", description="...", completed=True),
    ...
}
```

**ID Generator**: Simple integer counter

```python
# Conceptual structure (not implementation)
next_task_id = 1  # Increments after each task creation
```

**Storage Characteristics:**

- Volatile: Data exists only during application runtime
- Single-threaded access: No concurrency concerns
- Session-scoped: All data lost on application exit
- No persistence: No file I/O, no database, no serialization

## Relationships

Phase I has only one entity (Task) with no relationships to other entities.

**Future Phases** (Out of Scope for Phase I):
- Phase II+ may introduce User, Category, Tag entities
- Phase II+ may add relationships (Task belongs to User, Task has many Tags)

## Data Access Patterns

### Create
- Generate next available ID
- Validate title is non-empty
- Create task with default completed=False
- Store in memory

### Read (View All)
- Retrieve all tasks from storage
- Return ordered by ID (insertion order)
- Display with all attributes

### Read (By ID)
- Look up task by ID
- Return task if exists
- Return error if not found

### Update
- Look up task by ID
- Validate new title if provided (non-empty)
- Update title and/or description
- Preserve ID and completed status
- Store modified task

### Delete
- Look up task by ID
- Remove from storage
- ID is not reused

### Mark Complete
- Look up task by ID
- Set completed=True
- Store modified task

## Constraints and Assumptions

**Constitutional Constraints (Phase I):**
- No file-based persistence
- No database connections
- No serialization/deserialization
- In-memory only

**Technical Assumptions:**
- Maximum ~1000 tasks per session (practical memory limit)
- Task IDs will not overflow integer limits
- Single user, single session usage
- No concurrent access requirements

## Validation Summary

All data validation enforced at application layer before storage:

1. **Title Validation**: Non-empty, non-whitespace
2. **ID Validation**: Exists in storage (for update/delete/complete operations)
3. **Type Validation**: Correct Python types for all fields

No database-level constraints (no database in Phase I).
