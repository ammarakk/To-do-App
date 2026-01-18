# Secure CRUD Skill

**Skill Type**: API Security & Data Isolation
**Reusability**: Phase II-N, Phase III, all future phases

## Purpose

Implement secure CRUD operations with user data isolation, ensuring users can only access their own data.

## Capabilities

1. **Create Operations**
   - Associate new records with authenticated user (user_id from JWT)
   - Validate input data with Pydantic schemas
   - Return created resource with generated ID
   - Log all creation events

2. **Read Operations**
   - Filter all queries by user_id (WHERE user_id = current_user.id)
   - Implement pagination for large result sets
   - Return 404 for resources belonging to other users
   - Never expose other users' data

3. **Update Operations**
   - Verify ownership before updating (user_id must match)
   - Validate update data with Pydantic schemas
   - Return 404 if resource doesn't exist or belongs to other user
   - Support partial updates (PATCH)

4. **Delete Operations**
   - Verify ownership before deleting
   - Implement soft delete (set deleted_at timestamp)
   - Return 404 if resource doesn't exist or belongs to other user
   - Log all deletion events

## Usage Pattern

```python
# Secure read example
@app.get("/api/v1/todos/{todo_id}")
async def get_todo(todo_id: UUID, current_user: User = Depends(get_current_user)):
    todo = await db.get(Todo, todo_id)
    if not todo or todo.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo

# Secure list example
@app.get("/api/v1/todos")
async def list_todos(current_user: User = Depends(get_current_user)):
    stmt = select(Todo).where(Todo.user_id == current_user.id)
    stmt = stmt.where(Todo.deleted_at.is_(None))
    result = await db.execute(stmt)
    return result.scalars().all()
```

## Best Practices

- Always filter by user_id in queries (never trust client-side)
- Always verify ownership before UPDATE/DELETE
- Always return 404 instead of 403 (prevent data enumeration)
- Always use soft deletes (audit trail, recovery possible)
- Always validate input with Pydantic schemas

## Security Layers

1. **Database Layer**: Foreign keys and constraints (last line of defense)
2. **ORM Layer**: Filter by user_id in queries
3. **API Layer**: Verify ownership before operations
4. **Validation Layer**: Pydantic schema validation

## Data Isolation Rules

- Users can only read their own data
- Users can only modify their own data
- Users can only delete their own data
- No cross-user data leakage possible
- No data enumeration via 403/404 patterns

## Exit Criteria

All CRUD operations secured, user isolation enforced at all layers, ownership checks working correctly.
