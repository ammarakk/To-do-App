---
id: 002
title: Schema Builder and CRUD Pattern Skills
stage: misc
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-phase2-web
user: User
command: create skills
labels: ["schema", "crud", "supabase", "fastapi", "skills", "rls"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/skills/supabase-schema-builder-skill.md
  - .specify/skills/crud-pattern-skill.md
tests:
  - N/A (skill definitions only, no tests run)
---

## Prompt

create skills

Skill — Supabase Schema Builder Skill
Purpose:
Reusable database schema & RLS setup.

Rules:
- Every table must have user ownership
- RLS enabled by default
- No public access

🔹 Skill — CRUD Pattern Skill
Copy code

Purpose:
Reusable CRUD logic for FastAPI services.

Rules:
- Input validation required
- Output schema enforced
- Errors standardized

## Response snapshot

Created two reusable skills for Phase 2 backend implementation:

**1. Supabase Schema Builder Skill** (`.specify/skills/supabase-schema-builder-skill.md`)

Database schema creation with Row Level Security:
- SQL migration templates for user-owned tables
- RLS policy patterns (user ownership, status-based, shared items)
- Generic `SchemaBuilder` service class for programmatic schema management
- Pre-built migrations for: todos, user_profiles, categories tables
- RLS testing patterns and security checklist
- Anti-patterns to avoid

**Key Features:**
- User ownership enforced via `user_id` foreign key
- RLS enabled on ALL tables
- No public access - only authenticated users
- Defense in depth (API + database protection)

**2. CRUD Pattern Skill** (`.specify/skills/crud-pattern-skill.md`)

Generic CRUD service layer for FastAPI:
- `CRUDService` base class with generic Create, Read, Update, Delete
- Type-safe Pydantic schemas for validation
- Standardized exception handling
- Complete TodoService implementation
- FastAPI route handlers with error mapping
- Testing patterns and best practices

**Key Features:**
- Input validation via Pydantic schemas
- Output schema enforcement
- Standardized error responses (404, 422, 409, 500)
- User isolation enforced at service layer
- Pagination support on list endpoints
- Idempotent operations (GET, PUT)

## Outcome

- ✅ Impact: Created two foundational skills for secure, scalable backend development
- 🧪 Tests: Skill definitions only - tests to be implemented during `/sp.implement` phase
- 📁 Files: 2 skill documentation files created with complete code examples
- 🔁 Next prompts: Run `/sp.implement` to execute Phase 2 backend tasks using these skills
- 🧠 Reflection: Skills follow constitution principles - user isolation, type safety, fail-closed design

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (skill creation phase)
- Prompt variant (if applicable): N/A
- Next experiment: Integrate these skills when executing Phase 2 backend tasks via `/sp.implement`

---

## Created Resources

### Supabase Schema Builder Skill Contents:
- SQL migration templates with RLS policies
- `SchemaBuilder` service class for Python
- Pre-built migrations for todos, profiles, categories
- RLS security checklist
- Testing patterns for user isolation

### CRUD Pattern Skill Contents:
- Generic `CRUDService` base class
- Pydantic schema patterns (Create, Update, Response)
- Complete TodoService implementation
- FastAPI route handlers with error handling
- Testing patterns and best practices checklist
