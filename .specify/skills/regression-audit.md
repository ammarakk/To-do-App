# Regression Audit Skill

**Skill Type**: Quality Assurance & Testing
**Reusability**: Phase II-N, Phase III, all future phases (after each phase completion)

## Purpose

Comprehensive testing and validation to ensure no regressions, all features working, and zero critical bugs.

## Capabilities

1. **Functional Testing**
   - Test all user flows end-to-end
   - Test all API endpoints with valid/invalid data
   - Test authentication flows (signup, login, logout, refresh)
   - Test CRUD operations (create, read, update, delete)
   - Test user data isolation (cross-user access prevention)

2. **Integration Testing**
   - Test frontend-backend integration
   - Test database connectivity and operations
   - Test authentication between frontend and backend
   - Test token refresh flow end-to-end
   - Test error handling across all layers

3. **UI/UX Testing**
   - Test all screens for proper rendering
   - Test responsiveness on mobile, tablet, desktop
   - Test accessibility (keyboard navigation, screen readers)
   - Test loading states and error messages
   - Test smooth transitions and animations

4. **Security Testing**
   - Test SQL injection prevention
   - Test XSS attack prevention
   - Test CSRF protection
   - Test user data isolation (cross-user access)
   - Test authentication bypass attempts

5. **Performance Testing**
   - Test API response times (<200ms p95)
   - Test page load times (<2s for landing page)
   - Test database query performance
   - Test memory usage and leaks
   - Test concurrent user load (1000 users)

6. **Compatibility Testing**
   - Test on Chrome, Firefox, Safari, Edge
   - Test on mobile (iOS Safari, Chrome Mobile)
   - Test on tablet (iPad, Android tablets)
   - Test on different screen sizes (320px - 1920px)
   - Test on different network conditions (3G, 4G, WiFi)

## Testing Checklist

### Authentication
- [ ] Signup with valid email/password
- [ ] Signup with existing email (should fail)
- [ ] Signup with weak password (should fail)
- [ ] Login with correct credentials
- [ ] Login with incorrect credentials (should fail)
- [ ] Logout and verify session cleared
- [ ] Token refresh after access token expiry
- [ ] Session expiry after refresh token expiry

### Todo CRUD
- [ ] Create todo with valid data
- [ ] Create todo with empty title (should fail)
- [ ] Read todo list (only own todos)
- [ ] Read single todo (only if owned)
- [ ] Update todo (only if owned)
- [ ] Delete todo (soft delete, only if owned)
- [ ] Toggle todo completion status

### User Isolation
- [ ] User A cannot see User B's todos
- [ ] User A cannot update User B's todos (404)
- [ ] User A cannot delete User B's todos (404)
- [ ] All queries filter by user_id

### UI/UX
- [ ] Landing page renders properly
- [ ] Login page renders properly
- [ ] Signup page renders properly
- [ ] Dashboard renders properly
- [ ] Todo components render properly
- [ ] All screens responsive on mobile
- [ ] All screens responsive on tablet
- [ ] All screens responsive on desktop
- [ ] No console errors
- [ ] No broken styles
- [ ] Smooth transitions
- [ ] Loading states working

## Bug Reporting

For each bug found:
1. **Severity**: Critical, High, Medium, Low
2. **Description**: Clear description of the bug
3. **Steps to Reproduce**: Exact steps to trigger the bug
4. **Expected Behavior**: What should happen
5. **Actual Behavior**: What actually happens
6. **Environment**: Browser, device, screen size
7. **Screenshots**: Screenshots or screen recordings

## Exit Criteria

All tests passing, zero critical bugs, zero high-severity bugs, app stable and ready for production deployment.
