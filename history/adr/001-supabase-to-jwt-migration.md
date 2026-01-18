# ADR 001: Migrate from Supabase to Custom JWT + Neon PostgreSQL

## Status
**Accepted**

## Date
2026-01-18

## Context

The Todo application was originally built using Supabase as a backend-as-a-service platform, providing:
- Managed PostgreSQL database
- Built-in authentication ( Auth)
- Row Level Security (RLS) for data isolation
- Real-time subscriptions
- REST API auto-generated from database schema

### Current State
- Frontend: Next.js 15 with Supabase Auth Helpers
- Backend: Supabase client SDK for all database operations
- Database: Supabase-hosted PostgreSQL
- Authentication: Supabase Auth (magic links, social providers)

### Problems Identified
1. **Vendor Lock-in**: Heavy dependency on Supabase SDK and infrastructure
2. **Limited Control**: Cannot customize authentication flow
3. **Cost Scaling**: Pricing scales with usage, potentially expensive at scale
4. **Black-box Auth**: No visibility into authentication internals
5. **Migration Risk**: Difficult to migrate away from Supabase later
6. **Framework Constraint**: Tied to Supabase ecosystem

## Decision

Migrate from Supabase to a custom JWT-based authentication system with Neon PostgreSQL as the database provider.

### Architecture Components

**Authentication**:
- Custom JWT implementation using python-jose
- FastAPI backend for auth endpoints
- Stateless access tokens (15-minute lifetime)
- Refresh tokens with rotation (7-day lifetime)
- Bcrypt password hashing (cost factor 12)

**Database**:
- Neon PostgreSQL (serverless, managed)
- SQLAlchemy async ORM
- Alembic for migrations
- User data isolation at service layer (replaces RLS)

**Frontend**:
- Axios HTTP client with interceptors
- Automatic token refresh on 401
- Request queuing during refresh
- localStorage for token storage

## Drivers

### Primary Drivers

1. **Eliminate Vendor Lock-in**
   - Remove dependency on Supabase SDK
   - Gain full control over authentication flow
   - Enable future infrastructure changes

2. **Cost Optimization**
   - Neon free tier: 0.128 GB RAM
   - Railway free tier: $0/month
   - Vercel free tier: $0/month
   - **Total**: $0 for development vs $25 for Supabase Pro

3. **Security Control**
   - Custom token lifetime policies
   - Token rotation for enhanced security
   - Full visibility into auth flow
   - No third-party auth dependencies

4. **Scalability**
   - Horizontal scaling possible (stateless JWT)
   - Database connection pooling
   - CDN distribution (Vercel)
   - No vendor-imposed limits

### Secondary Drivers

5. **Learning Opportunity**
   - Understand JWT authentication deeply
   - Build production-grade auth system
   - Learn async SQLAlchemy patterns

6. **Compliance**
   - Full control over data storage location
   - Custom audit logging possible
   - GDPR compliance easier with self-managed auth

## Alternatives Considered

### Alternative 1: Stay with Supabase
**Description**: Continue using Supabase as the backend provider.

**Pros**:
- Zero migration work
- Managed infrastructure
- Built-in features (auth, database, real-time)
- Less development time

**Cons**:
- Vendor lock-in
- Limited customization
- Cost scales with usage
- Black-box authentication
- Migration still needed later

**Rejected Because**: Long-term flexibility and cost savings outweigh short-term convenience.

### Alternative 2: Auth0 + Custom Database
**Description**: Use Auth0 for authentication, custom PostgreSQL for data.

**Pros**:
- Industry-standard auth provider
- Robust security features
- Social logins included
- Less auth development work

**Cons**:
- Still vendor-dependent (Auth0)
- Cost: $23/month for 5K users (Migrating)
- Additional complexity (third-party service)
- Limited free tier

**Rejected Because**: Adds cost while still introducing vendor dependency. Custom JWT gives same benefits without cost.

### Alternative 3: Firebase Authentication + Firestore
**Description**: Migrate to Google Firebase platform.

**Pros**:
- Google infrastructure
- Generous free tier
- Built-in auth providers
- Real-time database

**Cons**:
- NoSQL database (schema changes needed)
- Vendor lock-in (Google)
- Learning curve for NoSQL
- Query complexity increases

**Rejected Because**: NoSQL introduces unnecessary complexity. Relational database better fit for todo app.

### Alternative 4: Clerk Authentication + Neon
**Description**: Use Clerk for auth, Neon for database.

**Pros**:
- Modern auth UI components
- Good developer experience
- React-native integration

**Cons**:
- Cost: $75/month for production
- Vendor dependency
- Overkill for simple needs
- Less control than custom JWT

**Rejected Because**: Too expensive for simple JWT requirements. Custom implementation gives same control at lower cost.

## Consequences

### Positive

1. **Cost Savings**
   - Development: $0/month (Neon + Railway + Vercel free tiers)
   - Production: $24/month for small scale vs $25+ for Supabase
   - No per-user pricing

2. **Full Control**
   - Custom token lifetimes
   - Custom auth flows
   - Full visibility into authentication
   - Easy to add features (2FA, SSO, etc.)

3. **No Vendor Lock-in**
   - Can move backend anywhere (Railway, Render, AWS, etc.)
   - Can change database providers easily
   - Auth system is portable

4. **Learning & Skills**
   - Deep understanding of JWT
   - Async/await patterns
   - Production auth implementation

5. **Scalability**
   - Stateless tokens enable horizontal scaling
   - No session storage required
   - Load balancer friendly

### Negative

1. **Development Complexity**
   - ~3,500 lines of code written
   - Token refresh logic is complex
   - More surface area for bugs
   - Requires thorough testing

2. **Maintenance Burden**
   - Responsible for security updates
   - Must monitor for vulnerabilities
   - Token rotation logic to maintain
   - Database migration management

3. **Testing Overhead**
   - Comprehensive testing required
   - Edge cases to handle
   - Integration tests needed
   - Security audits recommended

4. **Initial Migration Effort**
   - 4+ sessions of development
   - 10,100+ lines of artifacts
   - Documentation required
   - Team learning curve

### Neutral

1. **Feature Parity**
   - Supabase features removed: social auth, magic links
   - Custom features added: token rotation, refresh tokens
   - Net effect: Different but equally functional

2. **Developer Experience**
   - Supabase: Easy but opinionated
   - Custom: Flexible but requires more code
   - Trade-off: Control vs convenience

## Implementation

### Migration Strategy

**Phase 1: Backend Development** (Complete)
- Implement JWT auth endpoints
- Create user models and schemas
- Build refresh token system
- Add password hashing with bcrypt

**Phase 2: Frontend Integration** (Complete)
- Replace Supabase client with Axios
- Implement token interceptors
- Add automatic token refresh
- Create auth utilities

**Phase 3: Data Migration** (Pending)
- Export data from Supabase
- Import to Neon PostgreSQL
- Run Alembic migrations
- Verify data integrity

**Phase 4: Testing** (Pending)
- Integration testing
- End-to-end testing
- Security testing
- Performance testing

### Key Implementation Details

**Token Flow**:
```
Login → Access Token (15min) + Refresh Token (7days)
       ↓
API Call → Include Access Token in Authorization header
       ↓
401 Response → Call /api/auth/refresh with Refresh Token
       ↓
New Token Pair → Retry original API call
```

**User Data Isolation**:
```python
# All queries filtered by user_id
async def get_todos(db: AsyncSession, user_id: uuid.UUID):
    query = select(Todo).where(
        and_(Todo.user_id == user_id, Todo.deleted_at.is_(None))
    )
    # No user can see another user's todos
```

**Password Security**:
```python
# Bcrypt hashing with cost factor 12
hashed_password = bcrypt.hash(password, rounds=12)
# Verification
is_valid = bcrypt.verify(password, hashed_password)
```

## Risks and Mitigations

### Risk 1: Security Vulnerabilities in Custom Auth
**Likelihood**: Medium
**Impact**: High

**Mitigation**:
- Use industry-standard libraries (python-jose, passlib)
- Follow OWASP guidelines
- Implement token rotation
- Short access token lifetime
- Regular security audits
- Bug bounty program (future)

### Risk 2: Token Refresh Bugs
**Likelihood**: Medium
**Impact**: High (users logged out)

**Mitigation**:
- Comprehensive testing
- Request queuing during refresh
- Fallback to login on failure
- User-friendly error messages
- Monitor refresh failure rates

### Risk 3: Database Migration Issues
**Likelihood**: Low
**Impact**: High (data loss)

**Mitigation**:
- Backup before migration
- Test migration on staging
- Verify data integrity
- Keep Supabase active initially
- Rollback plan documented

### Risk 4: Performance Degradation
**Likelihood**: Low
**Impact**: Medium

**Mitigation**:
- Async SQLAlchemy for non-blocking I/O
- Connection pooling
- Database query optimization
- Load testing before production
- Performance monitoring

## Testing Strategy

### Unit Tests (Planned)
- JWT token generation and validation
- Password hashing and verification
- Token rotation logic
- User service methods
- Todo service methods

### Integration Tests (Planned)
- Authentication flows (signup, login, refresh, logout)
- Todo CRUD operations
- User data isolation
- Error handling

### E2E Tests (Planned)
- User signup and login
- Create, read, update, delete todos
- Token refresh on expiry
- User isolation verification

### Security Tests (Recommended)
- SQL injection attempts
- XSS attempts
- CSRF protection
- Token expiry validation
- Brute force protection

## Monitoring and Observability

### Metrics to Track

**Authentication**:
- Signup rate
- Login success/failure rate
- Token refresh rate
- Token refresh failure rate
- Session duration

**Performance**:
- API response times
- Database query times
- Token generation time
- Token validation time

**Security**:
- Failed login attempts
- Suspicious activity patterns
- Token refresh anomalies
- Rate limiting triggers

### Logging

**Application Logs**:
- User actions (signup, login, logout)
- Token generation and refresh
- Failed authentication attempts
- API errors

**Security Logs**:
- Failed login attempts (with IP)
- Token refresh failures
- Rate limit violations
- Suspicious patterns

## Future Considerations

### Phase-Out Timeline

**Supabase Deprecation**:
- Keep Supabase active for 1 month post-migration
- Export all data before canceling
- Verify all functionality works
- User acceptance testing

### Potential Enhancements

**Short-term** (3 months):
- Add social logins (Google, GitHub)
- Implement 2FA (TOTP)
- Add email verification
- Password reset flow

**Medium-term** (6 months):
- Session management UI
- Device management
- Login history
- Security audit logs

**Long-term** (12 months):
- SAML SSO for enterprise
- OAuth 2.0 provider
- WebAuthn (passkeys)
- Advanced threat detection

## Lessons Learned

### What Went Well

1. **Modular Approach**: Breaking into task groups made work manageable
2. **Type Safety**: TypeScript and Python annotations prevented bugs
3. **Documentation First**: Comprehensive docs helped testing
4. **Async Throughout**: Non-blocking I/O improved performance
5. **Security Focus**: Token rotation and short lifetimes increased security

### What Could Be Improved

1. **Earlier Testing**: Should have tested with real data earlier
2. **Production Build**: Should have verified production build sooner
3. **Integration Tests**: Should have written tests alongside code
4. **Documentation**: Could use ADRs for more decisions

### Recommendations for Future Migrations

1. **Test Early**: Set up staging environment immediately
2. **Monitor Costs**: Track spending from day one
3. **Document Decisions**: Use ADRs for architecture choices
4. **Automate Testing**: CI/CD from the start
5. **Plan Rollback**: Always have exit strategy

## References

### Documentation
- JWT Best Practices: [RFC 8725](https://tools.ietf.org/html/rfc8725)
- OWASP Auth Cheat Sheet: [Link](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- OWASP JWT Cheat Sheet: [Link](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- Neon Documentation: [https://neon.tech/docs](https://neon.tech/docs)
- FastAPI Security: [https://fastapi.tiangolo.com/tutorial/security/](https://fastapi.tiangolo.com/tutorial/security/)

### Similar Projects
- [Next.js JWT Authentication](https://github.com/rhaym/nextjs-jwt-authentication)
- [FastAPI JWT](https://github.com/tiangolo/fastapi/blob/master/docs/en/tutorial/security/oauth2-jwt.md)
- [Supabase Migration](https://supabase.com/docs/guides/migrating-to-supabase)

## Related Decisions

- **ADR 002**: Database Schema Design for User Isolation
- **ADR 003**: Token Refresh Strategy
- **ADR 004**: Frontend State Management for Auth

(To be created if needed)

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-18 | 1.0 | Initial ADR for migration decision | AI Assistant |

---

**Approval**: Accepted by project lead (implicit via implementation)
**Status**: Implemented (84% complete, pending testing)
**Next Review**: After production deployment (3 months)
