---
id: 003
title: neon-migration-spec
stage: spec
date: 2026-01-18
surface: agent
model: claude-sonnet-4-5-20250929
feature: 001-neon-migration
branch: 001-neon-migration
user: User
command: /sp.specify
labels: ["specification","backend-migration","authentication","ui-modernization"]
links:
  spec: specs/001-neon-migration/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-neon-migration/spec.md
  - specs/001-neon-migration/checklists/requirements.md
tests: []
---

## Prompt

/sp.specify
Phase II-N — Supabase Removal, Neon DB Migration, BetterAuth Integration & Modern UI Upgrade
1️⃣ Objective (Clear & Final)
This phase completely removes Supabase and replaces it with a real-world backend stack:
Neon PostgreSQL as the database
BetterAuth for authentication
FastAPI as backend
JWT-based auth system
Modern, premium SaaS-grade UI
The goal is to transform the current Todo app into a production-quality product, both in functionality and visual design, suitable for hackathons and real startups.
2️⃣ Mandatory Process (Must Follow)
Development must strictly follow:
Copy code

Specify → Plan → Tasks → Implement → Verify
Rules:
❌ No skipping steps
❌ No manual coding
✅ Only System Prompts + Agent Prompts
❌ Supabase must not exist anywhere (code, env, docs)
If anything is unclear → agent must STOP.
3️⃣ Final Technology Stack
Backend
FastAPI (Python 3.13+)
Neon PostgreSQL
SQLAlchemy (async)
JWT (Access + Refresh tokens)
Authentication
BetterAuth
Email + password
Secure password hashing
Session handling
Token refresh flow
Frontend
Next.js (App Router)
TypeScript
Tailwind CSS
Modern SaaS UI system
Explicitly Removed
Supabase DB
Supabase Auth
Supabase SDK
Supabase middleware
4️⃣ Database Architecture (Neon PostgreSQL)
Tables (Minimum)
users
id (UUID, PK)
email (unique)
password_hash
created_at
updated_at
todos
id (UUID, PK)
user_id (FK → users)
title
description
completed
created_at
updated_at
deleted_at (soft delete)
sessions
id
user_id
refresh_token
expires_at
Rules
UUID everywhere
Foreign key constraints
Indexes on user_id
Strict user isolation
5️⃣ Authentication System (BetterAuth)
Required Features
Signup
Login
Logout
Refresh token
Confirm password validation
Password visibility toggle
Proper error messages
Input sanitization
Security Rules
JWT validated on every request
Backend enforces ownership
No frontend trust
6️⃣ UI / UX Modernization (Critical)
Design Direction
Modern
Robotic
Neon-inspired
Premium SaaS feel
Custom look (not template)
Mandatory Screens
Landing / Title page
Login page
Signup page
Dashboard
Todo management UI
UI Requirements
Professional typography
Feature cards with icons
Clean spacing & layout
Responsive design
Smooth transitions
No cheap default styles
7️⃣ Agent Architecture
System Agent
Role
Enforce spec
Block scope creep
Validate each step
Sub-Agents
Database Migration Agent
Auth Integration Agent
Backend API Agent
Frontend UI Agent
QA & Audit Agent
Each agent:
Stateless
Task-based
Reusable for next phases
8️⃣ Validation & Audit
Before phase completion:
Supabase completely removed
Neon DB working
BetterAuth fully functional
UI visually upgraded
No auth or input bugs
All CRUD operations verified
9️⃣ Completion Criteria
Phase II-N is considered complete only when:
App runs locally
App deploys cleanly
Auth flow feels real-world
UI feels premium
No regression from Phase II-F

## Response snapshot

Created comprehensive specification for Phase II-N feature with the following components:

**Branch & Setup:**
- Branch: 001-neon-migration
- Feature directory: specs/001-neon-migration/
- Spec file: specs/001-neon-migration/spec.md

**User Stories (5 prioritized):**
1. P1: Seamless Authentication Experience (signup, login, logout)
2. P1: Personal Todo Management (CRUD operations with data isolation)
3. P2: Session Persistence & Security (automatic token refresh)
4. P2: Modern, Professional UI Experience (visual polish, responsive design)
5. P1: Secure Data Isolation (backend-enforced user separation)

**Requirements:**
- 20 functional requirements (FR-001 through FR-020)
- All requirements are testable and unambiguous
- No [NEEDS CLARIFICATION] markers needed
- 3 key entities defined: User, Todo, Session

**Success Criteria:**
- 12 measurable, technology-agnostic outcomes (SC-001 through SC-012)
- Metrics include: signup time (<90s), login time (<30s), CRUD speed (<500ms)
- Security validations: zero data leakage, zero OWASP Top 10 vulnerabilities
- Deployment criteria: zero Supabase references, clean deployment

**Quality Validation:**
✅ All checklist items passed
- No implementation details in spec
- Requirements are testable and measurable
- Success criteria are user-focused and technology-agnostic
- All mandatory sections completed

**Edge Cases Identified:**
- Duplicate email signup
- Network timeouts
- Token expiration during form submission
- Database connection failures
- Empty/invalid input handling
- Concurrent edits
- Weak password handling
- Rate limiting for failed logins
- Compromised refresh tokens
- Offline todo creation

## Outcome

- ✅ Impact: Complete feature specification created for Phase II-N migration, ready for planning phase
- 🧪 Tests: No tests run (specification phase only)
- 📁 Files: Created specs/001-neon-migration/spec.md and specs/001-neon-migration/checklists/requirements.md
- 🔁 Next prompts: Ready for `/sp.clarify` (optional) or `/sp.plan` (recommended)
- 🧠 Reflection: Successfully translated detailed technical requirements into business-focused, testable user stories without leaking implementation details. All requirements are measurable and technology-agnostic as required by SDD methodology.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All validation checks PASSED
- Prompt variant (if applicable): Standard /sp.specify workflow
- Next experiment (smallest change to try): None needed - specification is complete and ready for planning
