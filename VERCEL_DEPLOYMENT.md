# Vercel Deployment Guide

## Quick Deploy Steps

### 1. Prepare Frontend Environment

Create/Update `.env.production` in frontend directory:

```bash
# Production API URL (Replace with your Railway backend URL)
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
```

### 2. Deploy on Vercel

#### Option A: Via Vercel Dashboard (Easiest)

1. **Go to Vercel**
   - Login: https://vercel.com
   - Click "Add New Project"

2. **Import Repository**
   - Connect GitHub
   - Select: `to-do-app`
   - Branch: `001-neon-migration`

3. **Configure Project**
   ```
   Framework Preset: Next.js
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: .next
   Install Command: npm install
   ```

4. **Add Environment Variables**
   Go to: Settings → Environment Variables

   ```bash
   NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build (1-2 minutes)
   - Vercel will provide URL: `https://your-app.vercel.app`

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

### 3. Configure Custom Domain (Optional)

1. Go to project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### 4. Verify Deployment

```bash
# Check frontend
curl https://your-app.vercel.app

# Check API connection
# Open browser and test login
```

## Environment Variables Summary

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_API_URL` | Your Railway backend URL | API endpoint for frontend |

## Vercel.json Configuration

The project already includes `vercel.json` with optimal settings:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "regions": ["iad1"],
  "installCommand": "cd frontend && npm install"
}
```

## Post-Deployment Checklist

- [ ] Frontend accessible at Vercel URL
- [ ] Environment variables set
- [ ] Backend API accessible from frontend
- [ ] Login flow works
- [ ] Todo CRUD operations work
- [ ] No CORS errors
- [ ] No console errors

## Performance Optimization

Vercel automatically:
- **CDN:** Distributes content globally
- **Edge Network:** Routes requests to nearest edge
- **Image Optimization:** Optimizes images on-the-fly
- **Caching:** Caches static assets

## Monitoring

Vercel provides:
- **Analytics:** Page views, unique visitors
- **Speed Insights:** Core Web Vitals
- **Logs:** Real-time logs
- **Deployments:** Deployment history

Access: Dashboard → Analytics

## CI/CD Integration

Every push to `001-neon-migration` branch triggers:
1. Automatic build
2. Automatic deployment
3. Preview URL for testing
4. Production deployment on merge to main

## Troubleshooting

**Build Failed:**
- Check `package.json` has `build` script
- Verify all dependencies in `package.json`
- Check for TypeScript errors

**API Connection Error:**
- Verify `NEXT_PUBLIC_API_URL` is set
- Check backend CORS includes your Vercel URL
- Ensure backend is deployed and running

**404 on Refresh:**
- Next.js handles this automatically
- Make sure `vercel.json` includes `framework: "nextjs"`

**CORS Errors:**
- Add Vercel URL to backend `CORS_ORIGINS`
- No spaces in comma-separated list
- Include both http and https if needed

## Cost

- **Free Tier:**
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS
  - Edge Network

- **Hobby ($20/month):**
  - 1 TB bandwidth
  - No Vercel branding
  - Team collaboration

## Production Best Practices

1. **Environment Variables:**
   - Never commit `.env.production`
   - Use Vercel dashboard for secrets

2. **Performance:**
   - Enable Vercel Analytics
   - Monitor Core Web Vitals
   - Optimize images

3. **Security:**
   - Use HTTPS (automatic)
   - Set appropriate CORS
   - Monitor logs for errors

4. **Monitoring:**
   - Check deploy logs regularly
   - Set up error tracking (Sentry)
   - Monitor API response times

## Next Steps

After frontend is deployed:
1. Test full application flow
2. Monitor production logs
3. Set up analytics
4. Configure custom domain (optional)
5. Set up automatic backups (Neon)
