---
id: 001
title: api-contracts-schemas
stage: implement
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5
feature: phase2-backend
branch: 001-phase2-web
user: User
command: Execute TASK-P2-002: API Contracts & Schemas
labels: ["backend", "schemas", "validation", "pydantic"]
links:
  spec: null
  ticket: TASK-P2-002
  adr: null
  pr: null
files:
  - backend/src/models/schemas.py (created)
  - backend/src/api/routes/__init__.py (created)
  - backend/src/models/__init__.py (updated)
  - backend/tests/test_schemas.py (created)
  - backend/docs/API_CONTRACTS.md (created)
  - backend/docs/TASK-P2-002-SUMMARY.md (created)
tests:
  - backend/tests/test_schemas.py (24 tests, all passing)
---

## Prompt

🔹 IMPLEMENT CONTEXT
Active Task ID: TASK-P2-002
Task Name: API Contracts & Schemas
Goal: Clear, strict request/response rules for Todo APIs

🔹 TASK DETAILS (from tasks.md)
Define Pydantic schemas in `backend/src/models/schemas.py`: `TodoCreate` (title, description?, priority, due_date?, category?), `TodoUpdate` (all optional fields), `TodoResponse` (all fields with id, user_id, timestamps), `UserResponse` (id, email, created_at, updated_at), `ErrorResponse` (code, message, details[]), define status code constants in `backend/src/api/routes/__init__.py` (401, 403, 404, 422, 500), implement standardized error response format

🔹 Backend Agent — Allowed Scope (READ CAREFULLY)

✅ Allowed:
- Pydantic schemas define karna:
  - TodoCreate
  - TodoUpdate
  - TodoResponse
  - Standard API response format
  - Error response schema
  - HTTP status code rules
  - Field validation (lengths, optional/required)

❌ NOT Allowed:
- ❌ Database models
- ❌ Supabase references
- ❌ JWT / auth logic
- ❌ API route implementation
- ❌ Business logic

Schemas = contract only.
Execution = later tasks.

🔹 Required Schema Rules
- id → UUID
- title → required, non-empty
- description → optional
- status → enum (pending, completed)
- priority → enum (low, medium, high)
- due_date → optional
- created_at, updated_at → read-only
- Error response must be consistent across APIs

🔹 Expected Output (Validation Checklist)
Agent output is valid only if:
- Schemas are reusable
- Validation rules are explicit
- No assumptions about DB
- No auth leakage
- Clean separation of input vs output schemas

If anything is unclear → agent must STOP.

🔒 Authority Reminder
Constitution > Specify > Plan > Tasks > Implement

🛑 EXECUTE THIS TASK NOW
Do NOT continue automatically. Do NOT start next task. Execute TASK-P2-002 completely and STOP.

## Response snapshot

Successfully implemented comprehensive Pydantic schema definitions for the Todo API backend with strict validation rules and standardized error handling.

**Files Created:**

1. **backend/src/models/schemas.py** (290 lines)
   - TodoStatus enum (pending, completed)
   - TodoPriority enum (low, medium, high)
   - TodoCreate schema with validation
   - TodoUpdate schema (all optional)
   - TodoResponse schema (all fields)
   - UserResponse schema
   - ErrorResponse schema
   - PaginatedResponse schema
   - MessageResponse and DeleteResponse schemas

2. **backend/src/api/routes/__init__.py** (78 lines)
   - HTTP status code constants (200, 201, 204, 400, 401, 403, 404, 409, 422, 429, 500, 502, 503)
   - Error code constants (VALIDATION_ERROR, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, etc.)
   - Error message templates

3. **backend/src/models/__init__.py** (updated)
   - Exports all schemas and enums
   - Comprehensive docstrings

4. **backend/tests/test_schemas.py** (220 lines)
   - 24 comprehensive tests
   - All validation scenarios covered
   - 100% pass rate

5. **backend/docs/API_CONTRACTS.md**
   - Complete API contracts documentation
   - Usage examples
   - Validation rules
   - Error handling patterns

6. **backend/docs/TASK-P2-002-SUMMARY.md**
   - Implementation summary
   - Technical decisions
   - Acceptance criteria checklist

**Key Features Implemented:**

✅ Strict field validation (lengths, required/optional, enums)
✅ Custom validators (title trimming, non-empty checks)
✅ Pydantic V2 compatible (ConfigDict, from_attributes)
✅ Clean separation of input vs output schemas
✅ Standardized error response format
✅ No database assumptions
✅ No auth logic leakage
✅ Fully tested and documented

**Test Results:**
```
24 tests passed in 0.88s
- TodoCreate validation (9 tests)
- TodoUpdate validation (5 tests)
- TodoResponse validation (2 tests)
- UserResponse validation (1 test)
- ErrorResponse validation (2 tests)
- PaginatedResponse validation (3 tests)
- Enum validation (2 tests)
```

## Outcome

- ✅ Impact: Complete API contract foundation with strict Pydantic validation. All 24 tests passing. Ready for route implementation in next task.
- 🧪 Tests: 24 tests created, all passing, covering all validation scenarios
- 📁 Files: 6 files created/updated (schemas.py, routes/__init__.py, tests/test_schemas.py, 2 docs, 1 updated __init__.py)
- 🔁 Next prompts: Proceed to TASK-P2-003 (API Route Implementation) when ready
- 🧠 Reflection: Clean schema-only implementation without DB/auth assumptions as required. Pydantic V2 patterns used correctly.

## Evaluation notes (flywheel)

- Failure modes observed: Initial deprecation warnings from json_encoders (Pydantic V1 pattern), fixed by migrating to ConfigDict
- Graders run and results (PASS/FAIL): PASS - All 24 validation tests passing, all requirements met
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): None - task completed successfully. Schema validation working as expected.
