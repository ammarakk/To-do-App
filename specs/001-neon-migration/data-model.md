# Data Model: Phase II-N - Supabase Removal & Modern Backend Migration

**Feature**: 001-neon-migration
**Date**: 2026-01-18
**Database**: Neon PostgreSQL (PostgreSQL 15+)
**ORM**: SQLAlchemy (async with asyncpg)

---

## Entity Relationship Diagram

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    User     │    1    │   Session   │   1     │   Todo      │
│             │────...──│             │────...──│             │
│             │         │             │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
     │                                                      │
     │ 1:N                                                 │ N:1
     └──────────────────────────────────────────────────────┘
                              │
                         has many
```

---

## 1. Users Table

**Purpose**: Store user account information and authentication credentials

### Table Definition

```sql
CREATE TYPE user_role AS ENUM ('user', 'admin');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'user' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### SQLAlchemy Model

```python
# backend/src/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    todos = relationship("Todo", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"
```

### Validation Rules

| Field         | Type          | Constraints                    | Validation                              |
|---------------|---------------|--------------------------------|-----------------------------------------|
| id            | UUID          | PRIMARY KEY, auto-generated    | Must be valid UUID v4                   |
| email         | VARCHAR(255)  | UNIQUE, NOT NULL               | Valid email format, lowercase           |
| password_hash | VARCHAR(255)  | NOT NULL                       | bcrypt hash (cost factor 12)            |
| role          | ENUM          | NOT NULL, default 'user'       | Must be 'user' or 'admin'               |
| is_verified   | BOOLEAN       | NOT NULL, default FALSE        | True if email verified                  |
| created_at    | TIMESTAMPTZ   | NOT NULL, default NOW()        | Auto-generated, immutable               |
| updated_at    | TIMESTAMPTZ   | NOT NULL, default NOW()        | Auto-updated on record modification     |

### Business Rules

1. **Email Uniqueness**: Two users cannot have the same email (enforced at DB level)
2. **Password Security**: Passwords are NEVER stored in plaintext, only bcrypt hashes
3. **Case Sensitivity**: Emails are stored in lowercase for consistency
4. **Verification**: Users start as unverified, verification flow can be added later
5. **Role-Based Access**: Only 'admin' users can access admin endpoints (future feature)

---

## 2. Todos Table

**Purpose**: Store user todo items with soft delete support

### Table Definition

```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE NOT NULL,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for performance and user isolation
CREATE INDEX idx_todos_user_id ON todos(user_id);
CREATE INDEX idx_todos_completed ON todos(completed);
CREATE INDEX idx_todos_deleted_at ON todos(deleted_at);
CREATE INDEX idx_todos_user_completed ON todos(user_id, completed) WHERE deleted_at IS NULL;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON todos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### SQLAlchemy Model

```python
# backend/src/models/todo.py
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

class Todo(Base):
    __tablename__ = "todos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), nullable=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="todos")

    def __repr__(self):
        return f"<Todo(id={self.id}, title={self.title}, user_id={self.user_id})>"
```

### Validation Rules

| Field        | Type          | Constraints                           | Validation                              |
|--------------|---------------|---------------------------------------|-----------------------------------------|
| id           | UUID          | PRIMARY KEY, auto-generated           | Must be valid UUID v4                   |
| user_id      | UUID          | NOT NULL, FOREIGN KEY → users.id      | Must reference valid user               |
| title        | VARCHAR(500)  | NOT NULL                              | 1-500 chars, trimmed whitespace         |
| description  | TEXT          | nullable                              | Max 5000 chars (optional)               |
| completed    | BOOLEAN       | NOT NULL, default FALSE               | true or false                           |
| deleted_at   | TIMESTAMPTZ   | nullable                              | NULL if active, timestamp if deleted    |
| created_at   | TIMESTAMPTZ   | NOT NULL, default NOW()               | Auto-generated, immutable               |
| updated_at   | TIMESTAMPTZ   | NOT NULL, default NOW()               | Auto-updated on record modification     |

### Business Rules

1. **User Isolation**: Every todo MUST belong to a user (enforced by NOT NULL constraint)
2. **Cascade Delete**: When a user is deleted, all their todos are automatically deleted
3. **Soft Delete**: Todos are marked deleted via `deleted_at` timestamp, not physically removed
4. **Title Required**: Title cannot be empty or NULL (enforced at DB level)
5. **Description Optional**: Description can be NULL or empty string
6. **Uniqueness**: Multiple todos can have the same title (no uniqueness constraint on title)
7. **Query Optimization**: Composite index on (user_id, completed) for active todo queries

---

## 3. Sessions Table

**Purpose**: Store refresh tokens for JWT authentication

### Table Definition

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    revoked_at TIMESTAMPTZ
);

-- Indexes for performance and security
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token_hash ON sessions(refresh_token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
CREATE INDEX idx_sessions_active ON sessions(user_id) WHERE revoked_at IS NULL;
```

### SQLAlchemy Model

```python
# backend/src/models/session.py
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

class Session(Base):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    refresh_token_hash = Column(String(255), nullable=False, unique=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<Session(id={self.id}, user_id={self.user_id}, expires_at={self.expires_at})>"

    @property
    def is_active(self) -> bool:
        """Check if session is active (not expired and not revoked)"""
        return self.revoked_at is None and self.expires_at > func.now()

    @property
    def is_expired(self) -> bool:
        """Check if session is expired"""
        return self.expires_at <= func.now()

    @property
    def is_revoked(self) -> bool:
        """Check if session is revoked"""
        return self.revoked_at is not None
```

### Validation Rules

| Field               | Type          | Constraints                           | Validation                              |
|---------------------|---------------|---------------------------------------|-----------------------------------------|
| id                  | UUID          | PRIMARY KEY, auto-generated           | Must be valid UUID v4                   |
| user_id             | UUID          | NOT NULL, FOREIGN KEY → users.id      | Must reference valid user               |
| refresh_token_hash  | VARCHAR(255)  | UNIQUE, NOT NULL                      | SHA-256 hash of refresh token           |
| expires_at          | TIMESTAMPTZ   | NOT NULL                              | Must be in future (typically +7 days)   |
| created_at          | TIMESTAMPTZ   | NOT NULL, default NOW()               | Auto-generated, immutable               |
| revoked_at          | TIMESTAMPTZ   | nullable                              | NULL if active, timestamp if revoked    |

### Business Rules

1. **One User, Many Sessions**: A user can have multiple active sessions (multiple devices)
2. **Token Hashing**: Refresh tokens are stored as SHA-256 hashes, not plaintext
3. **Token Expiry**: Sessions expire after 7 days (configurable)
4. **Revocation**: Logout sets `revoked_at` timestamp, invalidating the session
5. **Cascade Delete**: When a user is deleted, all sessions are automatically deleted
6. **Uniqueness**: Each refresh token hash is unique (prevents token reuse)
7. **Cleanup**: Background job should delete expired sessions older than 30 days

---

## 4. Pydantic Schemas

**Purpose**: Request/response validation with FastAPI

### Auth Schemas

```python
# backend/src/schemas/auth.py
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
import uuid

class UserSignup(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    confirm_password: str

    def validate_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True
```

### Todo Schemas

```python
# backend/src/schemas/todo.py
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class TodoCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: str = Field("", max_length=5000)

class TodoUpdate(BaseModel):
    title: str = Field(None, min_length=1, max_length=500)
    description: str = Field(None, max_length=5000)
    completed: bool = None

class TodoResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: str | None
    completed: bool
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TodoListResponse(BaseModel):
    todos: list[TodoResponse]
    total: int
    page: int
    page_size: int
```

---

## 5. Migration Strategy

### Phase 1: Create Neon Database

```bash
# Using Neon CLI
npm install -g neonctl
neonctl projects create --name "todo-app-neon"
neonctl databases create --name "tododb"

# Get connection string
neonctl connection-string
```

### Phase 2: Run Alembic Migrations

```bash
# Install Alembic
pip install alembic

# Initialize Alembic
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial schema"

# Run migration
alembic upgrade head
```

### Phase 3: Seed Data (Optional)

```python
# backend/seed.py
async def seed_database():
    """Seed database with test data"""
    # Create test user
    test_user = User(
        email="test@example.com",
        password_hash=hash_password("Test1234"),
        is_verified=True
    )
    session.add(test_user)
    await session.commit()

    # Create sample todos
    todo1 = Todo(
        user_id=test_user.id,
        title="Buy groceries",
        description="Milk, eggs, bread"
    )
    session.add(todo1)
    await session.commit()
```

---

## 6. Data Integrity Constraints

### Foreign Key Constraints

| Constraint              | Source Table | Source Column | Target Table | Target Column | On Delete |
|-------------------------|--------------|---------------|--------------|---------------|-----------|
| fk_todos_user_id        | todos        | user_id       | users        | id            | CASCADE   |
| fk_sessions_user_id     | sessions     | user_id       | users        | id            | CASCADE   |

### Unique Constraints

| Constraint              | Table  | Column(s)               | Purpose                   |
|-------------------------|--------|-------------------------|---------------------------|
| uq_users_email          | users  | email                   | Prevent duplicate emails  |
| uq_sessions_refresh_hash| sessions| refresh_token_hash      | Prevent token reuse       |

### Check Constraints (Future Enhancement)

```sql
-- Email format check (application-level validation preferred)
ALTER TABLE users ADD CONSTRAINT chk_users_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Password hash format check
ALTER TABLE users ADD CONSTRAINT chk_users_password_hash
    CHECK (password_hash ~ '^\$2[aby]\$');

-- Title not empty check
ALTER TABLE todos ADD CONSTRAINT chk_todos_title_not_empty
    CHECK (TRIM(title) != '');
```

---

## 7. Performance Optimization

### Indexes Summary

| Index Name                      | Table  | Column(s)             | Type          | Purpose                              |
|---------------------------------|--------|-----------------------|---------------|--------------------------------------|
| idx_users_email                 | users  | email                 | B-tree        | Fast login queries                   |
| idx_users_created_at            | users  | created_at            | B-tree        | User analytics/sorting               |
| idx_todos_user_id               | todos  | user_id               | B-tree        | User isolation queries               |
| idx_todos_completed             | todos  | completed             | B-tree        | Filter by status                     |
| idx_todos_deleted_at            | todos  | deleted_at            | B-tree        | Soft delete filtering                |
| idx_todos_user_completed        | todos  | user_id, completed    | Composite     | Active todo queries (WHERE deleted_at IS NULL) |
| idx_sessions_user_id            | sessions| user_id              | B-tree        | User session lookups                 |
| idx_sessions_refresh_token_hash  | sessions| refresh_token_hash   | B-tree        | Token validation                     |
| idx_sessions_expires_at          | sessions| expires_at           | B-tree        | Expired session cleanup              |
| idx_sessions_active              | sessions| user_id (partial)    | Partial       | Active session queries               |

### Query Optimization Tips

1. **Always filter by user_id**: Every query MUST include `WHERE user_id = ?` for user isolation
2. **Use soft delete filter**: Always add `WHERE deleted_at IS NULL` for active todos
3. **Limit result sets**: Use pagination for todo lists (default: 20 items per page)
4. **Avoid N+1 queries**: Use SQLAlchemy `selectinload()` for relationships
5. **Connection pooling**: Configure SQLAlchemy with pool_size=20, max_overflow=10

---

## 8. Security Considerations

### SQL Injection Prevention

- ✅ **SQLAlchemy**: Uses parameterized queries by default
- ✅ **Pydantic**: Validates input types and formats before DB operations
- ✅ **No raw SQL**: Avoid using `text()` with user input

### Data Exposure Prevention

- ✅ **Password Hashing**: Never return `password_hash` in API responses
- ✅ **Soft Delete**: Don't expose deleted todos in normal queries
- ✅ **User Isolation**: Always filter by `user_id` in queries
- ✅ **Error Messages**: Don't expose internal DB errors to clients

### Access Control

- ✅ **JWT Validation**: Every protected route validates JWT token
- ✅ **Ownership Check**: Verify user owns resource before UPDATE/DELETE
- ✅ **Rate Limiting**: Limit API calls per user (5 req/sec for mutations)

---

**Data Model Completed**: 2026-01-18
**Status**: Ready for API contract definition
