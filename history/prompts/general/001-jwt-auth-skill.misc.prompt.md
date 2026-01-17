---
id: 001
title: JWT Auth Skill Creation
stage: misc
date: 2026-01-17
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: 001-phase2-web
user: User
command: create skills
labels: ["jwt", "auth", "fastapi", "supabase", "skills"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/skills/jwt-auth-skill.md
  - .specify/skills/backend-env-example.md
tests:
  - N/A (skill definition only, no tests run)
---

## Prompt

create skills Purpose:
Reusable JWT verification for FastAPI APIs.

Rules:
- Stateless
- Uses Supabase public keys
- Extracts user_id safely
- Fails closed (deny on error)

## Response snapshot

Created a reusable JWT verification skill for FastAPI with Supabase Auth integration:

**Files Created:**

1. `.specify/skills/jwt-auth-skill.md` - Complete JWT verification skill with:
   - `auth_service.py` - Stateless JWT verifier using Supabase JWKS endpoint
   - `deps.py` - FastAPI dependencies for extracting authenticated users
   - `config.py` - Environment configuration with pydantic-settings
   - `main.py` - Application initialization with lifespan context
   - `todos.py` - Example usage of JWT-protected endpoints
   - Testing guide and security considerations

2. `.specify/skills/backend-env-example.md` - Environment configuration template

**Key Features:**
- **Stateless**: No session storage, uses Supabase JWKS for key verification
- **Safe Extraction**: Validates all token claims via Pydantic models
- **Fail Closed**: Any validation error returns 401 Unauthorized
- **Type Safety**: Full Python type hints throughout
- **Reusable**: Ready for Phase 2 backend implementation via `/sp.implement`

**Dependencies:** pyjwt, cryptography, httpx, pydantic-settings

## Outcome

- ✅ Impact: Created reusable JWT auth skill for Phase 2 backend implementation
- 🧪 Tests: Skill definition only - tests to be implemented during `/sp.implement` phase
- 📁 Files: 2 skill documentation files created
- 🔁 Next prompts: Run `/sp.implement` to execute Phase 2 tasks using this skill
- 🧠 Reflection: Skill follows constitution principles - stateless, secure, fail-closed design

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A (skill creation phase)
- Prompt variant (if applicable): N/A
- Next experiment: Integrate this skill when executing Phase 2 backend tasks via `/sp.implement`
