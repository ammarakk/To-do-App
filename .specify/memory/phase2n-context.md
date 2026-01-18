# Phase II-N Context

**Phase**: Phase II-N - Neon PostgreSQL + BetterAuth Migration
**Status**: In Progress
**Branch**: 001-neon-migration
**Started**: 2026-01-18

## Phase Objective

Complete removal of Supabase and migration to Neon PostgreSQL + custom JWT authentication + modern UI.

## Technology Stack Changes

### Previous (Phase II-F)
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth
- **ORM**: Supabase Python Client
- **UI**: Basic Next.js with Tailwind

### Current (Phase II-N)
- **Database**: Neon PostgreSQL (serverless, managed)
- **Auth**: Custom JWT-based authentication (BetterAuth patterns)
- **ORM**: SQLAlchemy (async) with asyncpg
- **UI**: Modern SaaS-grade design with neon theme

## Migration Status

### ✅ Completed
- Constitution Amendment 1.1.0 ratified
- Agent documentation created (5 agents)
- Skill documentation created (5 skills)

### 🔄 In Progress
- Supabase removal (Task Group 2)
- Neon database setup (Task Group 3)

### ⏳ Pending
- JWT authentication implementation (Task Group 4)
- Frontend auth integration (Task Group 5)
- Todo CRUD with user isolation (Task Group 6)
- Session management (Task Group 7)
- UI modernization (Task Groups 8-9)
- Regression audit (Task Group 10)
- Phase closure (Task Group 11)

## Key Constraints

1. **Zero Supabase References**: Must completely remove all Supabase code, env vars, dependencies
2. **User Data Isolation**: Must enforce strict user separation at database and API levels
3. **JWT Security**: Must use bcrypt for passwords, JWT for tokens, proper token expiry
4. **UI Modernization**: Must transform to SaaS-grade design with neon theme
5. **No Regressions**: Phase II-F features must continue working

## Success Criteria

- ✅ Supabase completely removed
- ✅ Neon PostgreSQL live and integrated
- ✅ BetterAuth fully functional (JWT working)
- ✅ FastAPI routes protected and validated
- ✅ Modern UI deployed with neon theme
- ✅ Zero critical bugs
- ✅ All user stories working end-to-end

## Notes

- This is an optional migration path from Phase II
- Phase II (Supabase) remains valid and supported
- Migration is irreversible once completed
- All skills and patterns are reusable for Phase III+

## Last Updated

2026-01-18: Task Group 1 (Agent Context & Skills) completed
