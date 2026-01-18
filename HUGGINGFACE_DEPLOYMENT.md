# 🤗 Hugging Face Deployment Guide

## **Why Hugging Face Spaces?** ⭐⭐⭐⭐⭐

### **FREE Features:**
- ✅ **Always Running** - No sleep, no cold starts
- ✅ **16 GB RAM** - Massive power!
- ✅ **2 vCPUs** - Fast processing
- ✅ **50 GB Storage** - Plenty of space
- ✅ **Custom Domain** - Free SSL certificate
- ✅ **Auto-Deploy** - GitHub integration
- ✅ **No Credit Card** - 100% Free
- ✅ **Public API** - Share with community

### **Limitations:**
- ⚠️ **Public Only** - Code visible to everyone
- ⚠️ **No Private Spaces** - Need Pro plan ($9/month)
- ⚠️ **Community Focused** - For open source projects

---

## 🚀 **Step-by-Step Deployment**

### **Step 1: Create Hugging Face Account**

1. Go to: https://huggingface.co
2. Click "Sign Up"
3. Choose:
   - Sign up with email/GitHub/Google
4. Verify email
5. Login to your account

### **Step 2: Create New Space**

1. Go to: https://huggingface.co/spaces
2. Click **"Create new Space"**
3. Fill in details:
   ```
   Space Name: todo-api-backend (your-unique-name)
   License: MIT
   SDK: Docker
   Hardware: CPU Basic (Free)
   Visibility: Public ✅
   ```
4. Click **"Create Space"**

### **Step 3: Configure Environment Variables**

1. Go to your new Space
2. Click **"Settings"** tab
3. Scroll to **"Repository secrets"**
4. Add following secrets:

   ```bash
   # Database (Neon PostgreSQL)
   DATABASE_URL=postgresql+asyncpg://neondb_owner:YOUR_PASSWORD_HERE@ep-lucky-meadow-abpkcyn6-pooler.eu-west-2.aws.neon.tech/neondb

   # JWT Secrets
   JWT_SECRET_KEY=yCv2cdpFTHtsZuqvn5Yl1QYCVGYDlvyo
   BETTER_AUTH_SECRET=yCv2cdpFTHtsZuqvn5Yl1QYCVGYDlvyo

   # App Configuration
   ENVIRONMENT=production
   API_PORT=8000
   DEBUG_MODE=false

   # JWT Settings
   JWT_ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=15
   REFRESH_TOKEN_EXPIRE_DAYS=7

   # CORS (Add your frontend URLs)
   CORS_ORIGINS=https://your-app.vercel.app,https://localhost:3000
   ```

5. Click **"Add secret"** for each variable

### **Step 4: Prepare Backend Code**

Your backend is already ready! Just make sure:

1. **Dockerfile exists** in `backend/` ✅ (Already there)
2. **requirements.txt** exists ✅ (Already there)
3. **README_HF.md** exists ✅ (Already created)

### **Step 5: Deploy via GitHub**

**Option A: Push to Hugging Face (Recommended)**

1. Go to your Space on Hugging Face
2. Click **"Files"** tab
3. Click **"Upload files"**
4. Upload these files:
   ```
   backend/
   ├── Dockerfile
   ├── requirements.txt
   ├── README.md (use README_HF.md content)
   └── src/
       └── (all source code)
   ```
5. Hugging Face will **auto-build** 🚀

**Option B: Git Integration (Advanced)**

```bash
# Add Hugging Face as remote
git remote add hf https://huggingface.co/spaces/your-username/todo-api-backend

# Push to Hugging Face
git push hf main
```

### **Step 6: Monitor Deployment**

1. Hugging Face will **auto-build** your Docker image
2. Watch progress in **"Logs"** tab
3. Build takes 2-5 minutes (first time)
4. Status will change to **"Running"** ✅

### **Step 7: Get Your API URL**

After deployment, your API will be at:
```
https://your-username-todo-api-backend.hf.space
```

---

## 🧪 **Testing Your Deployed API**

### **Health Check:**
```bash
curl https://your-username-todo-api-backend.hf.space/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "todo-api",
  "version": "2.0.0",
  "database": "connected"
}
```

### **Test Signup:**
```bash
curl -X POST https://your-username-todo-api-backend.hf.space/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@huggingface.co",
    "password": "Password123",
    "full_name": "HF User"
  }'
```

### **Access API Docs:**
```
https://your-username-todo-api-backend.hf.space/docs
```

---

## 🌐 **Frontend Configuration**

Update frontend `.env.production`:

```bash
NEXT_PUBLIC_API_URL=https://your-username-todo-api-backend.hf.space
```

---

## 📊 **Monitoring & Logs**

### **View Logs:**
1. Go to your Space
2. Click **"Logs"** tab
3. See real-time logs:
   - Build logs
   - Application logs
   - Error logs

### **Metrics:**
Hugging Face provides:
- CPU usage
- Memory usage
- Request count
- Response time

---

## 🔧 **Troubleshooting**

### **Build Failed:**

**Problem:** Dockerfile error
```bash
# Solution: Check Dockerfile path
# Must be in root of uploaded files
```

**Problem:** Requirements missing
```bash
# Solution: Make sure requirements.txt is uploaded
# Should be in same directory as Dockerfile
```

### **App Crashes:**

**Problem:** Database connection error
```bash
# Solution: Check DATABASE_URL format
# Must use: postgresql+asyncpg://
# NOT: postgresql://
```

**Problem:** Port 8000 not accessible
```bash
# Solution: Hugging Face automatically routes
# No need to change EXPOSE in Dockerfile
```

### **Environment Variables Not Working:**

**Problem:** Secrets not loaded
```bash
# Solution: Make sure secret names match EXACTLY:
# DATABASE_URL (not DATABASE_URL_TEST)
# Case-sensitive!
```

---

## 🎯 **Best Practices for Hugging Face**

### **1. Keep Image Size Small**
- Already using multi-stage build ✅
- Minimal Python base image ✅

### **2. Handle Secrets Properly**
- NEVER commit secrets to git ❌
- Always use Repository Secrets ✅

### **3. Monitor Resources**
- Check logs regularly
- Monitor CPU/Memory usage
- Set up alerts (if available)

### **4. Update Regularly**
- Push updates via Git
- Hugging Face auto-rebuilds
- Zero downtime deployment

---

## 💰 **Pricing Comparison**

| Platform | Free Tier | Always On | RAM | Storage | Cost |
|----------|-----------|-----------|-----|---------|------|
| **Hugging Face** | ✅ Yes | ✅ Yes | 16 GB | 50 GB | **FREE** |
| Railway | $5 trial | ✅ Yes | 512 MB | 1 GB | $5/mo |
| Render | ✅ Yes | ❌ Sleep | 512 MB | - | FREE |
| Fly.io | ✅ Yes | ✅ Yes | 256 MB | 3 GB | FREE |

**Hugging Face is CLEAR WINNER for free hosting! 🏆**

---

## 🚀 **Next Steps**

After Backend Deployed:
1. ✅ Test all API endpoints
2. ✅ Deploy frontend to Vercel
3. ✅ Update frontend with HF backend URL
4. ✅ Test full application
5. ✅ Share with community!

---

## 📚 **Useful Links**

- **Your Space:** https://huggingface.co/spaces/your-username/todo-api-backend
- **Documentation:** https://huggingface.co/docs/hub/spaces
- **Docker Guide:** https://huggingface.co/docs/hub/spaces#docker-spaces
- **Community:** https://discuss.huggingface.co

---

## 🎉 **Success!**

Your FastAPI backend is now running on Hugging Face Spaces:
- ✅ **100% Free**
- ✅ **Always Running**
- ✅ **16 GB RAM**
- ✅ **Public API**

**Made with ❤️ using Spec-Driven Development**
