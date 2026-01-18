# PostgreSQL Schema Skill

**Skill Type**: Database Schema Design
**Reusability**: Phase II-N, Phase III, Phase IV+

## Purpose

Design and implement PostgreSQL database schemas with proper constraints, indexes, and relationships following best practices.

## Capabilities

1. **Table Design**
   - Define tables with UUID primary keys
   - Set up foreign key relationships with CASCADE rules
   - Add NOT NULL, UNIQUE, and CHECK constraints
   - Implement soft delete patterns (deleted_at timestamp)

2. **Index Optimization**
   - Create indexes on frequently queried columns (user_id, created_at)
   - Use composite indexes for multi-column queries
   - Add partial indexes for filtered queries (WHERE deleted_at IS NULL)

3. **Data Types**
   - Use UUID for primary keys (uuid_generate_v4())
   - Use TIMESTAMPTZ for timestamps (timezone-aware)
   - Use TEXT for long-form content (descriptions)
   - Use VARCHAR with length limits for constrained fields

4. **Migrations**
   - Generate Alembic migrations automatically
   - Review migration SQL before applying
   - Support rollback for schema changes

## Usage Pattern

```python
# SQLAlchemy model example
class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

## Best Practices

- Always use UUID for primary keys (distributed system friendly)
- Always use TIMESTAMPTZ for timestamps (timezone awareness)
- Always add indexes on foreign keys (query performance)
- Always use soft deletes for user data (audit trail)
- Always set up CASCADE rules for data integrity

## Exit Criteria

Schema is implemented, constraints are enforced, indexes are created, migration is tested and working.
