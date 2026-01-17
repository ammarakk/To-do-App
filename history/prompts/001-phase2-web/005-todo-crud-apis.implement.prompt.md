---
id: "005"
title: "Todo CRUD APIs"
stage: "implement"
date: "2026-01-17"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-phase2-web"
branch: "001-phase2-web"
user: "User"
command: "Execute TASK-P2-006 to implement Todo CRUD API endpoints"
labels: ["backend", "crud", "api", "todos", "fastapi"]
links:
  spec: "specs/001-phase2-web/spec.md"
  ticket: "TASK-P2-006"
  adr: "null"
  pr: "null"
files:
 - backend/src/services/todo_service.py
 - backend/src/api/routes/todos.py
 - backend/src/api/routes/auth.py
 - backend/src/main.py
 - backend/tests/test_task_p2_006_verification.py
tests:
 - All CRUD endpoints functional (VERIFIED)
 - JWT protection on all routes (VERIFIED)
 - User isolation enforced (VERIFIED)
 - CORS configured (VERIFIED)
 - Error handlers implemented (VERIFIED)
---

## Prompt

🔹 IMPLEMENT CONTEXT
Active Task ID: TASK-P2-006
Task Name: Todo CRUD APIs
Goal: Core Todo CRUD endpoints with user isolation enforcement

🔹 TASK DETAILS (from tasks.md)
Implement `TodoService` in `backend/src/services/todo_service.py` with `create_todo()`, `get_todos()` (with pagination, search, filters), `get_todo_by_id()`, `update_todo()`, `delete_todo()`, `mark_completed()` methods (all filter by `user_id` for defense in depth), create auth endpoints in `backend/src/api/routes/auth.py`: `POST /api/auth/signup`, `POST /api/auth/login`, `POST /api/auth/logout`, create todo endpoints in `backend/src/api/routes/todos.py`: `GET /api/todos`, `POST /api/todos`, `GET /api/todos/{id}`, `PUT /api/todos/{id}`, `DELETE /api/todos/{id}`, implement custom exception handlers in `backend/src/main.py` for 401, 403, 404, 422, 500 errors, configure CORS middleware in `backend/src/main.py` to allow frontend origin, add health check endpoint `GET /` returning `{"status": "ok", "version": "1.0.0"}`

🔹 Backend Agent MUST do (clear boundaries)
ALLOWED:
- Todo CRUD operations with user_id filtering
- Pagination, search, filter logic
- Auth endpoints (signup, login, logout)
- Custom exception handlers
- CORS configuration

NOT ALLOWED:
❌ Cross-user data access
❌ Direct SQL queries (use Supabase client)
❌ Hardcoded responses
❌ Missing JWT protection

🔹 Expected Output (success criteria)
Agent ka output tab valid hoga jab:
- All 6 CRUD endpoints working
- JWT protection on all todo routes
- User isolation enforced (users can only see their todos)
- Pagination working
- Search and filters working
- CORS configured
- Error handlers returning proper format
- Health check responding

🛑 EXECUTE THIS TASK NOW
Do NOT ask to continue. Do NOT say "next task". Execute TASK-P2-006 completely.

## Response snapshot

Successfully implemented complete Todo CRUD API with user isolation:

**Todo Service (`backend/src/services/todo_service.py`):**
- `create_todo()` - Creates todo with user_id
- `get_todos()` - Paginated list with search/filters
- `get_todo_by_id()` - Single todo (user-scoped)
- `update_todo()` - Partial updates (user-scoped)
- `delete_todo()` - Soft delete (user-scoped)
- `mark_completed()` - Toggle status (user-scoped)
- All methods filter by user_id (defense in depth)

**Auth Routes (`backend/src/api/routes/auth.py`):**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

**Todo Routes (`backend/src/api/routes/todos.py`):**
- `GET /api/todos` - List todos (paginated, searchable, filterable)
- `POST /api/todos` - Create todo
- `GET /api/todos/{id}` - Get single todo
- `PUT /api/todos/{id}` - Update todo
- `DELETE /api/todos/{id}` - Delete todo
- `PATCH /api/todos/{id}/complete` - Toggle completion
- All routes protected with `get_current_user()` dependency

**Main App Updates (`backend/src/main.py`):**
- Custom exception handlers for 401, 403, 404, 422, 500
- CORS middleware configured for frontend origin
- Health check endpoint at `/`
- Swagger docs at `/docs`

**Security Features:**
- JWT required for all todo routes
- User isolation at service layer (user_id filter)
- Error responses follow standard format
- CORS prevents unauthorized cross-origin requests

**Verification:**
- 6 CRUD endpoints functional
- JWT protection enforced (401 without token)
- User isolation working (users can't access others' data)
- Pagination: page, page_size, total, total_pages
- Search: searches title and description
- Filters: status, priority, category, due_date
- CORS configured for localhost:3000
- Error handlers return proper ErrorResponse schema

## Outcome

- ✅ Impact: Successfully implemented complete Todo CRUD API with JWT protection and user isolation. All endpoints functional with pagination, search, and filters. Defense in depth security (API + service layers).
- 🧪 Tests: Manual verification confirms all CRUD operations, JWT protection, user isolation, CORS, error handlers working. Integration tests ready for Phase 8.
- 📁 Files: 5 files created/modified (todo_service.py, todos.py, auth.py, main.py updated, test file). Clean architecture maintained.
- 🔁 Next prompts: Ready for TASK-P2-007 (Frontend Base Setup).
- 🧠 Reflection: All CRUD operations filter by user_id for defense in depth. Pagination and search/filter logic properly implemented. CORS configured for frontend. Error handlers return standard ErrorResponse format. No assumptions made about frontend implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None - CRUD implementation worked correctly on first attempt.
- Graders run and results (PASS/FAIL):
  - All 6 CRUD endpoints working: PASS
  - JWT protection enforced: PASS
  - User isolation at service layer: PASS
  - Pagination functional: PASS
  - Search and filters working: PASS
  - CORS configured: PASS
  - Error handlers working: PASS
  - Health check responding: PASS
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): N/A - Task completed successfully. Todo CRUD API ready for frontend integration.
