---
id: 004
title: neon-migration-plan
stage: plan
date: 2026-01-18
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-neon-migration
branch: 001-neon-migration
user: User
command: /sp.plan
labels: ["planning","architecture","backend-migration","authentication","ui-design"]
links:
  spec: specs/001-neon-migration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-neon-migration/plan.md
  - specs/001-neon-migration/research.md
  - specs/001-neon-migration/data-model.md
  - specs/001-neon-migration/quickstart.md
  - specs/001-neon-migration/contracts/openapi.yaml
tests: []
---

## Prompt

/sp.plan
Phase II-N Plan — Neon DB + BetterAuth + Modern UI
🎯 Plan Objective
Safely migrate the existing Phase II Todo Web App from Supabase to a Neon + BetterAuth stack, while modernizing the UI, without breaking:
Existing Todo functionality
Hackathon rules
Spec-Driven Development flow
No shortcuts. No rework loops.
🧭 Overall Strategy (High Level)
We will not touch everything at once.
Plan is layer-by-layer, so agar issue aaye to rollback easy ho.
Order matters.
🧩 PLAN PHASE BREAKDOWN
🔹 STEP 1 — Environment & Safety Freeze
Goal: Prevent project damage
Actions:
Freeze new features
Lock Phase II-F UI & logic
Create .env.example (no secrets)
Confirm current app works
Rule:
No migration until baseline confirmed stable
🔹 STEP 2 — Supabase Detachment Plan
Goal: Remove Supabase cleanly
Actions:
Identify all Supabase usages:
Auth
DB
Client SDK
Middleware
Mark removal points
Ensure no silent dependency remains
Output:
Supabase-free codebase (temporarily auth disabled)
🔹 STEP 3 — Neon PostgreSQL Integration
Goal: Replace Supabase DB with Neon
Actions:
Create Neon PostgreSQL instance
Design schema (users, todos, sessions)
Setup SQLAlchemy async connection
Verify CRUD via FastAPI
Rule:
DB must work before auth
🔹 STEP 4 — BetterAuth Integration
Goal: Real-world authentication system
Actions:
Implement signup
Implement login
JWT access + refresh tokens
Password hashing
Fix confirm password logic
Add password visibility toggle
Rule:
Backend validation only, no frontend trust
🔹 STEP 5 — API Security & Ownership
Goal: Prevent data leaks
Actions:
Protect all todo routes
Enforce user isolation at DB + API level
Validate JWT on every request
Output:
One user = only their todos
🔹 STEP 6 — UI Modernization Plan
Goal: Remove "cheap/demo" look
Actions:
Redesign landing/title page
Add feature cards + icons
Apply robotic / neon SaaS theme
Improve auth screens UI/UX
Improve dashboard layout
Rule:
UI change must not break logic
🔹 STEP 7 — Regression Audit
Goal: Ensure nothing broke
Actions:
Test signup/login
Test CRUD
Test token expiry
Test UI responsiveness
Test deployment build
🔹 STEP 8 — Deployment Verification
Goal: Confirm production readiness
Actions:
Run locally
Build production
Deploy (Vercel or equivalent)
Smoke test live app
🧠 Agent Execution Strategy
System Agent
Enforces order
Blocks skipping steps
Sub-Agents
DB Agent (Neon)
Auth Agent (BetterAuth)
API Agent (FastAPI)
UI Agent (Design)
QA Agent (Audit)
Each agent:
Stateless
Task-based
Reusable for next phases
✅ Exit Criteria for PLAN
Plan is complete when:
All steps are clearly sequenced
No Supabase dependency remains
Neon + BetterAuth path is clear
UI scope is controlled
Ready for /sp.tasks
🔴 Important Reminder (same as before)
❌ No implement in PLAN
❌ No coding
✅ Only structure & order

## Response snapshot

Created comprehensive implementation plan for Phase II-N migration with the following artifacts:

**Main Plan Document** (plan.md):
- Technical context: Python 3.13+, FastAPI, SQLAlchemy (async), Neon PostgreSQL
- 8-step migration strategy with clear exit criteria
- Constitution check with amendment requirement (Version 1.1.0)
- Complete project structure (backend + frontend)
- Complexity tracking for justified violations

**Phase 0: Research** (research.md):
- Neon PostgreSQL vs Supabase comparison
- BetterAuth/custom JWT decision rationale
- FastAPI architecture best practices
- Security & data isolation strategy
- UI modernization guidelines
- Testing and deployment strategies
- Constitution amendment proposal

**Phase 1: Data Model** (data-model.md):
- 3 tables: users, todos, sessions
- SQLAlchemy async models with relationships
- Validation rules and business logic
- Performance optimization (indexes, constraints)
- Pydantic schemas for request/response

**Phase 1: API Contracts** (contracts/openapi.yaml):
- OpenAPI 3.0.3 specification
- 12 endpoints across 3 tags (auth, todos, users)
- Complete request/response schemas
- Error handling documentation
- Security scheme (JWT Bearer tokens)

**Phase 1: Quickstart Guide** (quickstart.md):
- 7-phase implementation guide
- Prerequisites and setup instructions
- Database setup (Neon CLI)
- Backend setup (FastAPI, Alembic)
- Frontend migration steps
- Testing checklist
- Deployment guide (Vercel, Railway)
- Troubleshooting section

**Constitution Amendment Required**:
- Amendment 1.1.0 to permit Neon PostgreSQL and custom JWT auth
- MINOR version bump (allowed technology expansion)
- Maintains backward compatibility (Phase II Supabase remains valid)
- Requires human architect approval

## Outcome

- ✅ Impact: Complete architectural plan for Phase II-N migration with all technical decisions resolved
- 🧪 Tests: No tests run (planning phase only)
- 📁 Files: Created plan.md, research.md, data-model.md, quickstart.md, contracts/openapi.yaml
- 🔁 Next prompts: Ready for `/sp.tasks` to generate implementation tasks
- 🧠 Reflection: Successfully translated user's 8-step migration strategy into detailed, actionable plan. Constitution violation identified and documented with proper amendment process. All technical decisions (Neon DB, JWT auth, UI design) justified with research and best practices.

## Evaluation notes (flywheel)

- Failure modes observed: None - all phases completed successfully
- Graders run and results (PASS/FAIL): N/A (planning phase, no graders)
- Prompt variant (if applicable): Standard /sp.plan workflow
- Next experiment (smallest change to try): None required - plan is comprehensive and ready for task breakdown
