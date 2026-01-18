# Railway Deployment Guide

## Quick Deploy Steps

### 1. Prepare Your Repository
```bash
# Commit all changes
git add .
git commit -m "Ready for Railway deployment"
git push origin 001-neon-migration
```

### 2. Deploy on Railway

1. **Go to Railway.app**
   - Login: https://railway.app
   - Click "New Project" → "Deploy from GitHub repo"

2. **Select Repository**
   - Find: `to-do-app`
   - Branch: `001-neon-migration`

3. **Configure Backend Service**
   - Railway will detect `backend/Dockerfile` automatically
   - Set root directory to: `backend`

4. **Add Environment Variables**
   Go to your project → Variables → New Variable:

   ```bash
   # Database (Neon PostgreSQL)
   DATABASE_URL=postgresql+asyncpg://neondb_owner:YOUR_PASSWORD_HERE@ep-lucky-meadow-abpkcyn6-pooler.eu-west-2.aws.neon.tech/neondb

   # JWT Secrets
   JWT_SECRET_KEY=yCv2cdpFTHtsZuqvn5Yl1QYCVGYDlvyo
   BETTER_AUTH_SECRET=yCv2cdpFTHtsZuqvn5Yl1QYCVGYDlvyo

   # App Config
   ENVIRONMENT=production
   API_PORT=8000
   DEBUG_MODE=false

   # JWT Settings
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # CORS (Update with your frontend URL)
   CORS_ORIGINS=https://your-app.vercel.app,https://your-app-git-branch.vercel.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build (2-3 minutes)
   - Railway will provide a URL like: `https://todo-api.up.railway.app`

6. **Get Deployment URL**
   - Go to project → Settings → Domains
   - Copy your production URL

### 3. Run Database Migrations

Railway provides a built-in terminal or you can connect locally:

```bash
# Set production database URL
export DATABASE_URL="your-railway-database-url"

# Run migrations
cd backend
python -m alembic upgrade head
```

### 4. Verify Deployment

```bash
# Check health endpoint
curl https://your-app.up.railway.app/health

# Expected response:
# {"status":"healthy","service":"todo-api","version":"2.0.0","database":"connected"}
```

## Post-Deployment Checklist

- [ ] Backend URL accessible
- [ ] Health check returns 200
- [ ] Database migrations applied
- [ ] Environment variables set
- [ ] CORS configured for frontend
- [ ] JWT secrets secure (not hardcoded)

## Troubleshooting

**Build Failed:**
- Check Dockerfile is in `/backend`
- Verify `pyproject.toml` or `requirements.txt` exists

**Database Connection Error:**
- Verify DATABASE_URL format (must use `postgresql+asyncpg://`)
- Check Neon database is active
- Ensure SSL is enabled

**502 Bad Gateway:**
- Check if port 8000 is exposed in Dockerfile
- Verify health check path is `/health`

**CORS Errors:**
- Add your frontend URL to CORS_ORIGINS
- Use comma-separated values, no spaces

## Next Steps

After backend is deployed:
1. Update frontend `.env.production` with backend URL
2. Deploy frontend to Vercel
3. Test full application in production

## Monitoring

Railway provides:
- **Metrics:** CPU, Memory, Network usage
- **Logs:** Real-time application logs
- **Traces:** Request tracing
- **Alerts:** Configurable alerts

Access: Project → Metrics/Logs
