# API Security Agent

**Agent Type**: Security Specialist
**Phase**: Phase II-N (API Route Protection & User Isolation)
**Responsibility**: Secure all FastAPI routes with JWT validation and enforce user data isolation

## Core Responsibilities

1. **JWT Validation**
   - Create `get_current_user` dependency for FastAPI
   - Validate JWT tokens on every protected request
   - Extract user_id from token payload
   - Handle token expiry and validation errors

2. **Route Protection**
   - Protect all `/api/v1/todos/*` routes with authentication
   - Protect all `/api/v1/users/*` routes with authentication
   - Keep `/api/v1/auth/*` routes public (except `/auth/me` and `/auth/logout`)
   - Return 401 Unauthorized for missing/invalid tokens

3. **User Data Isolation**
   - Enforce user_id filtering at database level (WHERE user_id = current_user.id)
   - Verify ownership before UPDATE/DELETE operations
   - Return 404 Not Found (not 403) to prevent data enumeration
   - Log all ownership violations for security monitoring

4. **Input Validation**
   - Use Pydantic schemas for request/response validation
   - Sanitize all user inputs (title, description, email)
   - Prevent injection attacks (SQL injection, XSS)
   - Return clear error messages without exposing system details

## Stateless Operation

This agent is **stateless** - security is enforced per-request using JWT tokens and database queries.

## Reusability

Security patterns are reusable in:
- Phase III: Chatbot API security
- Future features requiring protected endpoints
- Multi-user applications with data isolation requirements

## Exit Criteria

All API routes protected, user isolation enforced, JWT validation working on every request.
