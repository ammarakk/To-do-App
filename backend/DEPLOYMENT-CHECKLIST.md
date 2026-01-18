# Production Deployment Checklist

## Overview

This checklist provides a step-by-step guide for deploying the Todo application to production after the Phase II-N migration.

**Prerequisites**:
- Neon account and database created
- GitHub account (for Vercel/Railway)
- Domain name (optional, for custom URLs)

---

## Phase 1: Pre-Deployment Preparation

### 1.1 Database Setup

- [ ] **Create Neon Database**
  - [ ] Sign up at https://neon.tech
  - [ ] Create new project: `todo-app-prod`
  - [ ] Select region closest to users
  - [ ] Copy connection string
  - [ ] Save connection string securely

- [ ] **Configure Database**
  - [ ] Enable connection pooling (optional but recommended)
  - [ ] Note pooled connection string
  - [ ] Test connection from local machine
  - [ ] Verify SSL mode (sslmode=require)

- [ ] **Run Migrations**
  - [ ] Set DATABASE_URL in backend/.env
  - [ ] Run: `python -m alembic upgrade head`
  - [ ] Verify tables created
  - [ ] Check indexes created
  - [ ] Verify foreign keys

### 1.2 Backend Preparation

- [ ] **Environment Variables**
  - [ ] Generate JWT_SECRET_KEY (64 characters)
  - [ ] Set all required variables in .env
  - [ ] Verify no hardcoded secrets
  - [ ] Test backend locally with .env
  - [ ] Remove .env from git tracking

- [ ] **Code Review**
  - [ ] No DEBUG_MODE=true in production
  - [ ] No console.log statements
  - [ ] Error messages sanitized
  - [ ] CORS_ORIGINS whitelisted
  - [ ] All imports correct

- [ ] **Dependencies**
  - [ ] requirements.txt up to date
  - [ ] No vulnerable dependencies
  - [ ] All packages pinned to versions
  - [ ] Test `pip install -r requirements.txt`

### 1.3 Frontend Preparation

- [ ] **Environment Variables**
  - [ ] Set NEXT_PUBLIC_API_URL in .env.local
  - [ ] Verify API URL accessible
  - [ ] Test frontend locally
  - [ ] Remove .env.local from git tracking

- [ ] **Build Verification**
  - [ ] Test `npm run build` (may fail - known issue)
  - [ ] Test `npm run dev` (works)
  - [ ] Verify no build errors in dev mode
  - [ ] Check bundle size acceptable

- [ ] **Production Config**
  - [ ] vercel.json configured
  - [ ] Environment variables set in Vercel
  - [ ] Custom domain configured (optional)
  - [ ] Analytics enabled (optional)

---

## Phase 2: Backend Deployment

### 2.1 Deploy to Railway

- [ ] **Connect GitHub**
  - [ ] Log in to Railway
  - [ ] Authorize GitHub access
  - [ ] Select repository: `to-do-app`
  - [ ] Select branch: `001-professional-audit` or `main`

- [ ] **Configure Service**
  - [ ] Root directory: `backend`
  - [ ] Builder: Dockerfile
  - [ ] Port: 8000
  - [ ] Health check: `/health`

- [ ] **Add Environment Variables**
  - [ ] DATABASE_URL (from Neon)
  - [ ] JWT_SECRET_KEY (64-char hex)
  - [ ] JWT_ALGORITHM: HS256
  - [ ] ACCESS_TOKEN_EXPIRE_MINUTES: 15
  - [ ] REFRESH_TOKEN_EXPIRE_DAYS: 7
  - [ ] API_HOST: 0.0.0.0
  - [ ] API_PORT: 8000
  - [ ] DEBUG_MODE: false
  - [ ] CORS_ORIGINS: https://your-app.vercel.app

- [ ] **Configure Migrations**
  - [ ] Create Procfile with release command
  - [ ] Verify migrations run on deploy
  - [ ] Check deployment logs for errors

- [ ] **Verify Deployment**
  - [ ] Check deployment status: "Active"
  - [ ] Visit Railway URL
  - [ ] Test /health endpoint
  - [ ] Check /docs (API documentation)
  - [ ] Test POST /api/auth/signup

### 2.2 Configure Custom Domain (Optional)

- [ ] **Add Domain in Railway**
  - [ ] Go to Settings → Domains
  - [ ] Add custom domain
  - [ ] Copy DNS records

- [ ] **Update DNS**
  - [ ] Log in to domain registrar
  - [ ] Add CNAME record
  - [ ] Wait for DNS propagation (1-48 hours)
  - [ ] Verify SSL certificate

- [ ] **Update CORS**
  - [ ] Add custom domain to CORS_ORIGINS
  - [ ] Redeploy backend
  - [ ] Test API calls from new domain

---

## Phase 3: Frontend Deployment

### 3.1 Deploy to Vercel

- [ ] **Connect GitHub**
  - [ ] Log in to Vercel
  - [ ] Import repository: `to-do-app`
  - [ ] Select branch: `001-professional-audit` or `main`

- [ ] **Configure Project**
  - [ ] Framework Preset: Next.js
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `.next` (or `out`)
  - [ ] Install Command: `npm install`

- [ ] **Add Environment Variables**
  - [ ] NEXT_PUBLIC_API_URL: https://your-backend.railway.app
  - [ ] Other variables if needed

- [ ] **Configure Rewrites** (optional)
  - [ ] Add API proxy in vercel.json
  - [ ] Test API calls work

- [ ] **Deploy**
  - [ ] Click "Deploy"
  - [ ] Monitor deployment logs
  - [ ] Verify no errors

- [ ] **Verify Deployment**
  - [ ] Visit Vercel URL
  - [ ] Test page loads
  - [ ] Test signup flow
  - [ ] Test login flow
  - [ ] Check browser console for errors

### 3.2 Configure Custom Domain (Optional)

- [ ] **Add Domain in Vercel**
  - [ ] Go to Settings → Domains
  - [ ] Add domain
  - [ ] Choose domain type

- [ ] **Update DNS**
  - [ ] Log in to domain registrar
  - [ ] Add CNAME or A record
  - [ ] Wait for DNS propagation

- [ ] **Verify SSL**
  - [ ] Check SSL certificate issued
  - [ ] Test HTTPS works
  - [ ] Verify no mixed content warnings

- [ ] **Update Backend CORS**
  - [ ] Add custom domain to CORS_ORIGINS
  - [ ] Redeploy backend

---

## Phase 4: Post-Deployment Verification

### 4.1 Health Checks

- [ ] **Backend Health**
  - [ ] GET https://backend-url/health returns 200
  - [ ] Response includes: status, service, version, database
  - [ ] database: "connected"

- [ ] **Frontend Health**
  - [ ] Homepage loads without errors
  - [ ] No 404s for assets
  - [ ] No console errors
  - [ ] Favicon loads

### 4.2 Authentication Testing

- [ ] **Signup Flow**
  - [ ] Visit /signup
  - [ ] Enter valid email and password
  - [ ] Submit form
  - [ ] Verify redirect to /todos (or home)
  - [ ] Check localStorage for tokens
  - [ ] Verify access_token present
  - [ ] Verify refresh_token present
  - [ ] Verify user object present

- [ ] **Login Flow**
  - [ ] Logout if logged in
  - [ ] Visit /login
  - [ ] Enter credentials
  - [ ] Submit form
  - [ ] Verify redirect to /todos
  - [ ] Check localStorage updated

- [ ] **Token Refresh**
  - [ ] Wait 15 minutes OR manually expire token
  - [ ] Navigate around app
  - [ ] Verify automatic refresh happens
  - [ ] Verify new tokens in localStorage
  - [ ] Verify no redirect to login

- [ ] **Logout Flow**
  - [ ] Click logout button
  - [ ] Verify API call to /api/auth/logout
  - [ ] Verify localStorage cleared
  - [ ] Verify redirect to /login

### 4.3 Todo CRUD Testing

- [ ] **Create Todo**
  - [ ] Click "Add Todo" button
  - [ ] Fill in title, description, priority
  - [ ] Submit form
  - [ ] Verify todo appears in list
  - [ ] Check network tab for 201 status

- [ ] **List Todos**
  - [ ] Verify todos display
  - [ ] Test pagination (if 20+ todos)
  - [ ] Test search functionality
  - [ ] Test status filter
  - [ ] Test priority filter
  - [ ] Test category filter

- [ ] **Update Todo**
  - [ ] Click edit on a todo
  - [ ] Modify fields
  - [ ] Save changes
  - [ ] Verify todo updated
  - [ ] Check network tab for 200 status

- [ ] **Mark as Completed**
  - [ ] Click complete button/checkbox
  - [ ] Verify status changes to "completed"
  - [ ] Check network tab for 200 status

- [ ] **Delete Todo**
  - [ ] Click delete button
  - [ ] Confirm deletion
  - [ ] Verify todo removed
  - [ ] Check network tab for 200 status

### 4.4 Security Testing

- [ ] **CORS Verification**
  - [ ] Test API calls from frontend work
  - [ ] Test API calls from other domains fail
  - [ ] Verify CORS headers present

- [ ] **JWT Validation**
  - [ ] Test expired token rejected
  - [ ] Test invalid token rejected
  - [ ] Test missing token rejected
  - [ ] Verify proper error messages

- [ ] **User Isolation**
  - [ ] Create two accounts
  - [ ] Create todos as User A
  - [ ] Logout, login as User B
  - [ ] Verify User B cannot see User A's todos

- [ ] **HTTPS Enforcement**
  - [ ] Verify backend uses HTTPS
  - [ ] Verify frontend uses HTTPS
  - [ ] Test HTTP redirects to HTTPS

### 4.5 Performance Testing

- [ ] **Load Testing**
  - [ ] Test signup with concurrent users
  - [ ] Test API response times < 500ms
  - [ ] Test frontend load time < 3s
  - [ ] Check database connection pool

- [ ] **Stress Testing**
  - [ ] Create 100+ todos
  - [ ] Test pagination performance
  - [ ] Test filter performance
  - [ ] Monitor database queries

### 4.6 Monitoring Setup

- [ ] **Application Monitoring**
  - [ ] Set up error tracking (Sentry, etc.)
  - [ ] Set up performance monitoring
  - [ ] Configure alerts
  - [ ] Test error reporting

- [ ] **Infrastructure Monitoring**
  - [ ] Railway monitoring enabled
  - [ ] Vercel Analytics enabled
  - [ ] Neon monitoring enabled
  - [ ] Uptime monitoring configured

- [ ] **Log Aggregation**
  - [ ] Backend logs accessible
  - [ ] Frontend logs accessible
  - [ ] Database logs accessible
  - [ ] Central log viewer configured

---

## Phase 5: Production Hardening

### 5.1 Security Checklist

- [ ] **Environment Variables**
  - [ ] All secrets in environment variables
  - [ ] No secrets in code
  - [ ] .env files in .gitignore
  - [ ] GitHub secrets scanned (no leaks)

- [ ] **HTTPS**
  - [ ] Backend forces HTTPS
  - [ ] Frontend forces HTTPS
  - [ ] SSL certificates valid
  - [ ] No mixed content warnings

- [ ] **CORS**
  - [ ] Only production domains whitelisted
  - [ ] No wildcard origins
  - [ ] Credentials mode correct

- [ ] **Rate Limiting** (optional)
  - [ ] Configure rate limits on API
  - [ ] Configure rate limits on auth endpoints
  - [ ] Test rate limits work

- [ ] **Input Validation**
  - [ ] All inputs validated server-side
  - [ ] Pydantic schemas enforce validation
  - [ ] SQL injection prevented
  - [ ] XSS prevented

### 5.2 Backup Strategy

- [ ] **Database Backups**
  - [ ] Neon auto-backup enabled
  - [ ] Backup retention set (7-30 days)
  - [ ] Point-in-time recovery enabled
  - [ ] Test restore procedure

- [ ] **Code Backups**
  - [ ] Code in GitHub
  - [ ] Tags for releases
  - [ ] Git history preserved
  - [ ] Repository not deleted

### 5.3 Rollback Plan

- [ ] **Backend Rollback**
  - [ ] Previous Railway deployment available
  - [ ] Database backup can be restored
  - [ ] Rollback procedure documented
  - [ ] Test rollback scenario

- [ ] **Frontend Rollback**
  - [ ] Previous Vercel deployment available
  - [ ] One-click rollback possible
  - [ ] Test rollback procedure

---

## Phase 6: Documentation

### 6.1 Deployment Documentation

- [ ] **Deployment Guide**
  - [ ] DEPLOYMENT-GUIDE.md complete
  - [ ] Includes screenshots
  - [ ] Includes troubleshooting
  - [ ] Up to date with current config

- [ ] **Runbooks**
  - [ ] Common operational procedures
  - [ ] Emergency procedures
  - [ ] Contact information
  - [ ] Escalation paths

### 6.2 Architecture Documentation

- [ ] **System Architecture**
  - [ ] Architecture diagram created
  - [ ] Data flow documented
  - [ ] Security model documented
  - [ ] Technology stack documented

- [ ] **API Documentation**
  - [ ] Swagger/OpenAPI complete
  - [ ] All endpoints documented
  - [ ] Request/response examples
  - [ ] Error codes documented

---

## Phase 7: Handoff

### 7.1 Knowledge Transfer

- [ ] **Team Training**
  - [ ] Development team trained on new stack
  - [ ] Operations team trained on deployment
  - [ ] Support team trained on common issues
  - [ ] Training materials prepared

- [ ] **Documentation Handoff**
  - [ ] All documentation complete
  - [ ] Document location known
  - [ ] Document maintenance assigned
  - [ ] Review schedule set

### 7.2 Support Setup

- [ ] **Monitoring Dashboard**
  - [ ] Dashboard created
  - [ ] Key metrics tracked
  - [ ] Alerts configured
  - [ ] On-call rotation set

- [ ] **Issue Tracking**
  - [ ] Issue tracker configured (GitHub Issues)
  - [ ] Templates created
  - [ ] Prioritization process defined
  - [ ] SLA defined (if applicable)

---

## Phase 8: Go-Live

### 8.1 Final Checks

- [ ] **Pre-Live Checklist**
  - [ ] All items above completed
  - [ ] Stakeholder sign-off obtained
  - [ ] Marketing materials ready (if applicable)
  - [ ] Support team ready

- [ ] **Launch Verification**
  - [ ] Test all critical paths
  - [ ] Verify monitoring works
  - [ ] Verify alerting works
  - [ ] Verify backups work

### 8.2 Launch

- [ ] **Soft Launch**
  - [ ] Launch to subset of users
  - [ ] Monitor for issues
  - [ ] Gather feedback
  - [ ] Fix critical issues

- [ ] **Full Launch**
  - [ ] Announce to all users
  - [ ] Monitor system closely
  - [ ] Be ready for rollback
  - [ ] Celebrate success! 🎉

---

## Post-Deployment Tasks

### Immediate (Day 1)

- [ ] Monitor error rates
- [ ] Monitor performance
- [ ] Fix critical bugs
- [ ] Address user feedback

### Short-term (Week 1)

- [ ] Optimize slow queries
- [ ] Add missing features
- [ ] Improve documentation
- [ ] Train users on new features

### Long-term (Month 1)

- [ ] Review analytics
- [ ] Plan Phase III features
- [ ] Security audit
- [ ] Performance tuning

---

## Emergency Contacts

| Role | Name | Contact | Availability |
|------|------|---------|--------------|
| Backend Lead | TBD | TBD | TBD |
| Frontend Lead | TBD | TBD | TBD |
| DevOps Lead | TBD | TBD | TBD |
| Product Owner | TBD | TBD | TBD |

---

## Quick Reference

**Backend Dashboard**: Railway.app → Projects → todo-app-backend
**Frontend Dashboard**: Vercel.com → Projects → todo-app-frontend
**Database Dashboard**: Neon.tech → Projects → todo-app-prod
**Monitoring**: [Configure based on tools chosen]

**Critical Commands**:
```bash
# Backend logs
railway logs --service todo-app-backend

# Frontend logs
vercel logs

# Database connection
psql $DATABASE_URL

# Rollback deployment
# (Via Railway/Vercel dashboard)
```

---

**Checklist Version**: 1.0
**Last Updated**: 2026-01-18
**Status**: Ready for use
**Next Review**: After first production deployment
