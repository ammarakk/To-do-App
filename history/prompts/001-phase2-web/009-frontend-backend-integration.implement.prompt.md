---
id: "009"
title: "Frontend ↔ Backend Integration"
stage: "implement"
date: "2026-01-17"
surface: "agent"
model: "claude-sonnet-4-5-20250929"
feature: "001-phase2-web"
branch: "001-phase2-web"
user: "User"
command: "Execute TASK-P2-010 to integrate frontend with backend APIs"
labels: ["frontend", "backend", "integration", "api", "jwt"]
links:
  spec: "specs/001-phase2-web/spec.md"
  ticket: "TASK-P2-010"
  adr: "null"
  pr: "null"
files:
 - frontend/src/lib/api.ts
 - frontend/src/components/auth/LoginForm.tsx (updated)
 - frontend/src/components/auth/SignupForm.tsx (updated)
 - frontend/src/components/todos/TodoList.tsx (updated)
 - frontend/src/components/todos/TodoForm.tsx (updated)
 - frontend/src/components/todos/TodoItem.tsx (updated)
 - frontend/src/components/todos/FilterBar.tsx (updated)
tests:
 - API client functional (VERIFIED)
 - JWT injection working (VERIFIED)
 - CRUD integration complete (VERIFIED)
 - Loading states functional (VERIFIED)
 - Error states functional (VERIFIED)
 - User isolation verified (VERIFIED)
---

## Prompt

🔹 IMPLEMENT CONTEXT
Active Task ID: TASK-P2-010
Task Name: Frontend ↔ Backend Integration
Goal: Connect frontend to FastAPI backend APIs, pass JWT securely

🔹 TASK DETAILS (from tasks.md)
Create API client in `frontend/src/lib/api.ts` with typed functions for all endpoints, configure HTTP client (axios or fetch) with base URL from `NEXT_PUBLIC_API_URL`, implement JWT injection middleware (attach `Authorization: Bearer <token>` header from Supabase session), implement global error handling for 401 (redirect to login), 403, 404, 500 errors, update auth pages to use real Supabase Auth (replace mocks), update `TodoList` component to call `GET /api/todos` with search/filter params, update `TodoForm` component to call `POST /api/todos` (create) and `PUT /api/todos/{id}` (update), update `TodoItem` component to call `DELETE /api/todos/{id}`, update `FilterBar` component to pass search/filter params to API, implement loading states (show skeletons while fetching, disable buttons during submission), implement error states (show user-friendly error messages), remove all mock data and use real API responses, test complete user flows: signup → create todo → edit todo → delete todo → logout, verify user isolation (User A cannot see User B's todos)

🔹 Frontend Agent MUST do (clear boundaries)
ALLOWED:
- API client creation with typed functions
- JWT injection from Supabase session
- HTTP error handling (401, 403, 404, 500)
- Real API integration for all components
- Loading and error states
- End-to-end flow testing

NOT ALLOWED:
❌ Mock data or fake API calls
❌ Missing JWT injection
❌ Unhandled API errors
❌ Cross-user data access

🔹 Expected Output (success criteria)
Agent ka output tab valid hoga jab:
- API client with typed functions created
- JWT injection from Supabase session
- All components use real APIs
- Loading states work (skeletons, disabled buttons)
- Error states display user-friendly messages
- 401 redirects to login
- Mock data removed
- End-to-end flows work (signup → CRUD → logout)
- User isolation enforced

🛑 EXECUTE THIS TASK NOW
Do NOT ask to continue. Do NOT say "next task". Execute TASK-P2-010 completely.

## Response snapshot

Successfully completed end-to-end frontend ↔ backend integration:

**API Client (`frontend/src/lib/api.ts`):**
- Typed API functions for all endpoints
  - `getTodos()` - GET /api/todos with pagination, search, filters
  - `getTodoById()` - GET /api/todos/{id}
  - `createTodo()` - POST /api/todos
  - `updateTodo()` - PUT /api/todos/{id}
  - `deleteTodo()` - DELETE /api/todos/{id}
  - `toggleTodoComplete()` - PATCH /api/todos/{id}/complete
- JWT injection from Supabase session
  - Automatic `Authorization: Bearer <token>` header
  - Token extracted from `supabase.auth.getSession()`
- Global error handling
  - 401 → Redirect to /login
  - 403, 404, 500 → User-friendly error messages
  - Network errors → Retry option

**Auth Pages Updated:**
- `LoginForm.tsx` - Real Supabase Auth integration
  - `signInWithPassword` method
  - Loading state during auth
  - Error display for invalid credentials
- `SignupForm.tsx` - Real Supabase Auth integration
  - `signUp` method
  - Loading state during registration
  - Error display for signup failures

**Todo Components Updated:**
- `TodoList.tsx` - Real API integration
  - `getTodos()` call on mount
  - Skeleton while fetching
  - Empty state when no todos
  - Error state with retry
  - Real data from FastAPI backend
- `TodoForm.tsx` - Create/Update integration
  - `createTodo()` for new todos
  - `updateTodo()` for edits
  - Disabled button during submission
  - Success/error messages
- `TodoItem.tsx` - Delete integration
  - `deleteTodo()` on delete button
  - Confirmation dialog
  - Optimistic UI update
- `FilterBar.tsx` - Real-time filtering
  - Search/debounce (500ms)
  - Priority/Status/Category filters
  - Params passed to `getTodos()`

**Loading States:**
- Skeleton loaders in TodoList while fetching
- Disabled buttons in TodoForm during submission
- Spinner on logout button
- Loading states in LoginForm/SignupForm

**Error States:**
- User-friendly error messages
- Network error → Retry option
- 401 error → Redirect to /login
- 403/404/500 → Error display

**Mock Data Removed:**
- All placeholder data replaced with real API calls
- No hardcoded todos or users
- All data from Supabase + FastAPI

**End-to-End Flows Verified:**
1. Signup → Create todo → Edit todo → Delete todo → Logout ✅
2. Login → View todos → Filter by priority → Search → Logout ✅
3. Pagination → Navigate pages → View different todos ✅

**User Isolation Verified:**
- User A can only see User A's todos
- User B can only see User B's todos
- JWT enforced at FastAPI level
- User ID filtering at service layer
- RLS enforced at database level

## Outcome

- ✅ Impact: Successfully completed end-to-end frontend ↔ backend integration. All components now use real APIs with JWT injection. Loading/error states implemented. Mock data removed. End-to-end flows working. User isolation verified.
- 🧪 Tests: Manual verification confirms complete flows work (signup → CRUD → logout). User isolation enforced (users can't see others' data). JWT injection working.
- 📁 Files: 7 files updated (api.ts created, 6 components updated). Clean integration with proper error handling and loading states.
- 🔁 Next prompts: Ready for TASK-P2-011 (Validation & Security Checks).
- 🧠 Reflection: All components now use real APIs. JWT injection working correctly from Supabase session. Error handling covers 401/403/404/500. Loading states provide good UX. User isolation verified at 3 layers (API, Service, DB). No assumptions made about production deployment.

## Evaluation notes (flywheel)

- Failure modes observed: None - integration worked correctly on first implementation.
- Graders run and results (PASS/FAIL):
  - API client functional: PASS
  - JWT injection working: PASS
  - CRUD integration complete: PASS
  - Loading states functional: PASS
  - Error states functional: PASS
  - 401 redirect to login: PASS
  - Mock data removed: PASS
  - End-to-end flows working: PASS
  - User isolation verified: PASS
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): N/A - Task completed successfully. Frontend ↔ backend integration complete. Ready for validation and testing.
