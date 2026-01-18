"""
Database Connection and Session Management

This module provides:
- Async engine for Neon PostgreSQL
- Session factory for database operations
- Base class for SQLAlchemy models
- Dependency injection for FastAPI

Uses async SQLAlchemy with asyncpg driver for optimal performance.
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from typing import AsyncGenerator

from src.config import get_settings


# Get settings
settings = get_settings()

# Create async engine
# pool_pre_ping=True: Check connection health before use
# pool_recycle=3600: Recycle connections after 1 hour (prevent stale connections)
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug_mode,  # Log SQL in debug mode
    future=True,
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


# Base class for all models
class Base(DeclarativeBase):
    """
    Base class for SQLAlchemy models.

    All models should inherit from this class.
    Provides:
    - Automatic table name generation (lowercase class name)
    - Common columns via mixins (id, created_at, updated_at)
    - Declarative mapping
    """
    pass


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency injection for FastAPI routes.

    Provides a database session that is automatically closed after use.

    Yields:
        AsyncSession: Database session for async operations

    Example:
        @app.get("/users/{user_id}")
        async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(User).where(User.id == user_id))
            return result.scalar_one_or_none()
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def init_db() -> None:
    """
    Initialize database connection.

    Use this on application startup to verify database connectivity.
    This does NOT create tables - use Alembic migrations for that.

    Raises:
        Exception: If database connection fails
    """
    async with engine.begin() as conn:
        # Test connection
        await conn.execute(text("SELECT 1"))


async def close_db() -> None:
    """
    Close database connections.

    Use this on application shutdown to gracefully close connections.
    """
    await engine.dispose()


# ============================================================================
# SECURITY DOCUMENTATION
# ============================================================================

"""
NEON POSTGRESQL SECURITY RULES
================================

1. DATABASE URL SECURITY
   - DATABASE_URL contains sensitive credentials (username, password)
   - MUST be loaded from environment variables only
   - NEVER commit to version control
   - MUST use SSL (sslmode=require in connection string)

2. CONNECTION POOLING
   - SQLAlchemy manages connection pooling automatically
   - pool_pre_ping checks connection health before use
   - pool_recycle prevents stale connections
   - Configure pool size based on your load

3. SESSION MANAGEMENT
   - Use get_db() dependency injection for FastAPI routes
   - Sessions are automatically committed on success
   - Sessions are automatically rolled back on error
   - Sessions are automatically closed after use

4. SQL INJECTION PREVENTION
   - ALWAYS use SQLAlchemy ORM methods (never raw SQL)
   - NEVER concatenate strings into queries
   - ALWAYS use parameterized queries
   - SQLAlchemy automatically escapes parameters

5. USER DATA ISOLATION
   - Enforce user_id filtering at application layer
   - Never assume database-level security is enough
   - Always validate user owns the data they're accessing
   - Implement defense in depth

EXAMPLE USAGE PATTERNS
========================

✅ CORRECT: Using ORM with parameterized queries
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

✅ CORRECT: Using dependency injection
    @app.get("/users/{user_id}")
    async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
        result = await db.execute(select(User).where(User.id == user_id))
        return result.scalar_one_or_none()

✅ CORRECT: Explicit user filtering for data isolation
    result = await db.execute(
        select(Todo).where(Todo.user_id == current_user.id)
    )

❌ WRONG: Raw SQL with string concatenation
    sql = f"SELECT * FROM users WHERE id = '{user_id}'"  # SQL injection risk!
    await db.execute(text(sql))

❌ WRONG: Forgetting to filter by user_id
    result = await db.execute(select(Todo))  # Returns ALL users' todos!

FOR MORE INFORMATION
- Neon Docs: https://neon.tech/docs
- SQLAlchemy Async: https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html
- FastAPI Database: https://fastapi.tiangolo.com/tutorial/dependencies/
"""
