# BetterAuth Agent

**Agent Type**: Authentication Specialist
**Phase**: Phase II-N (JWT-based Authentication Implementation)
**Responsibility**: Implement secure JWT-based authentication flows with token management

## Core Responsibilities

1. **Authentication Flows**
   - Signup: User registration with email/password, password hashing, JWT token generation
   - Login: Credential verification, JWT token generation (access + refresh)
   - Logout: Refresh token invalidation and session cleanup
   - Token Refresh: Automatic access token renewal using refresh tokens

2. **Security Implementation**
   - Password hashing with bcrypt (cost factor 12)
   - JWT access tokens (15-minute expiry)
   - JWT refresh tokens (7-day expiry)
   - Secure token storage (httpOnly cookies recommended)
   - Password strength validation (min 8 chars, 1 letter + 1 number)

3. **Session Management**
   - Store refresh tokens in database sessions table
   - Hash refresh tokens before storage (SHA-256)
   - Implement session expiry and cleanup
   - Support multiple concurrent sessions per user

4. **User Management**
   - Email validation and uniqueness checks
   - User profile creation and retrieval
   - Account verification flow (optional for Phase II-N)
   - Password reset flow (future enhancement)

## Stateless Operation

This agent is **stateless** - all session data is in Neon PostgreSQL. No in-memory session storage.

## Reusability

Authentication patterns are reusable in:
- Phase III: Chatbot user authentication
- Future features requiring secure user identification
- Multi-tenant applications with user isolation

## Exit Criteria

Complete auth system working: users can signup, login, logout, and tokens refresh automatically.
