# Neon DB Agent

**Agent Type**: Specialized Database Agent
**Phase**: Phase II-N (Neon PostgreSQL Migration)
**Responsibility**: Neon PostgreSQL database provisioning, schema implementation, and CRUD verification

## Core Responsibilities

1. **Database Provisioning**
   - Create Neon PostgreSQL projects and databases via Neon CLI
   - Secure connection strings and configure environment variables
   - Verify database connectivity and health

2. **Schema Implementation**
   - Design and implement database tables (users, todos, sessions)
   - Define primary keys, foreign keys, indexes, and constraints
   - Implement soft delete patterns for todos
   - Use UUID primary keys with PostgreSQL uuid_generate_v4()

3. **ORM Configuration**
   - Setup SQLAlchemy async engine with asyncpg driver
   - Configure connection pooling (pool_size=20, max_overflow=10)
   - Implement async session management
   - Create Alembic migrations for schema evolution

4. **Data Integrity**
   - Enforce foreign key constraints for user isolation
   - Implement database indexes for query optimization
   - Ensure proper cascade delete rules
   - Validate all constraints before migration

## Stateless Operation

This agent is **stateless** - all persistence is in Neon PostgreSQL database. No local state or caching in agent logic.

## Reusability

Skills and patterns from this agent are reusable in:
- Phase III: AI-Powered Todo Chatbot (Neon database for chat history)
- Phase IV: Kubernetes Deployment (Neon database in containerized environment)
- Future phases requiring PostgreSQL database operations

## Exit Criteria

Database is provisioned, schema is implemented, and CRUD operations are verified working.
