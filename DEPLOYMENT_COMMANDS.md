# 📋 Deployment Commands Reference

Quick reference for all deployment commands and configurations.

---

## 🔧 Pre-Deployment Setup

### 1. Generate SECRET_KEY

**Windows PowerShell:**
```powershell
# Generate 64-character hex key
-join ((48..57) + (97..102) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Or use Python
python generate_secret_key.py
```

**Git Bash / Linux / Mac:**
```bash
openssl rand -hex 32
```

**Python:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### 2. Validate Configuration

```bash
# Check all files are ready
python test_deployment.py

# Validate environment variables (after creating .env)
cd backend
python validate_env.py
```

---

## 📦 Git Commands

### Initial Setup
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Add remote (replace with your URL)
git remote add origin https://github.com/YOUR_USERNAME/edu-bridge.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### After Changes
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

## 🎯 Render Deployment

### Option A: Blueprint (Easiest)

1. Push code to GitHub
2. Visit: https://dashboard.render.com/select-repo?type=blueprint
3. Select repository
4. Wait for deployment
5. Add GEMINI_API_KEY in dashboard

### Option B: Manual Database Creation

```bash
# Via Render Dashboard:
# 1. New + → PostgreSQL
# 2. Name: edubridge-db
# 3. Database: edubridge
# 4. Plan: Free
# 5. Region: US East (or preferred)
# 6. Create Database
# 7. Copy INTERNAL Database URL (starts with postgresql://)
```

### Option C: Manual Web Service

```bash
# Via Render Dashboard:
# 1. New + → Web Service
# 2. Connect GitHub repo
# 3. Configure:

Name: edubridge-backend
Runtime: Python 3
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT"

# Environment Variables:
DATABASE_URL=<your-postgresql-internal-url>
SECRET_KEY=<generated-secret-key>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GEMINI_API_KEY=<your-gemini-api-key>
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
PORT=10000
```

### Environment Variables for Render

```env
DATABASE_URL=postgresql://user:password@dpg-xxxxx-a/edubridge
SECRET_KEY=your-64-character-hex-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GEMINI_API_KEY=your-gemini-api-key-from-google
VAPI_API_KEY=your-vapi-key-optional
VAPI_PHONE_NUMBER_ID=your-phone-id-optional
VAPI_WEBHOOK_URL=your-webhook-url-optional
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
PORT=10000
```

---

## 🚀 Vercel Deployment

### Option A: Dashboard (Recommended)

1. Go to: https://vercel.com/new
2. Import from GitHub
3. Configure:
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```
4. Add Environment Variable:
```
VITE_API_URL=https://edubridge-backend.onrender.com/api
```
5. Deploy

### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to frontend
cd frontend

# Deploy to production
vercel --prod

# Set environment variable
vercel env add VITE_API_URL production
# When prompted, enter: https://edubridge-backend.onrender.com/api

# Redeploy with new env vars
vercel --prod
```

### Alternative: Deploy without switching directories

```bash
# From project root
vercel --cwd frontend --prod

# Set env
vercel env add VITE_API_URL production --cwd frontend
```

---

## 🔄 Update CORS After Frontend Deployment

```bash
# In Render Dashboard:
# 1. Go to your backend service
# 2. Environment tab
# 3. Edit CORS_ORIGINS:

CORS_ORIGINS=https://your-app-name.vercel.app

# Or with custom domain:
CORS_ORIGINS=https://your-custom-domain.com,https://your-app-name.vercel.app

# 4. Save (service will auto-redeploy)
```

---

## ✅ Verification Commands

### Test Backend Locally

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your values

# Run database seed
python seed.py

# Start server
uvicorn main:app --reload --port 8000

# Test in browser:
# http://localhost:8000/
# http://localhost:8000/health
# http://localhost:8000/docs
```

### Test Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local (copy from .env.local.example)
cp .env.local.example .env.local

# Start dev server
npm run dev

# Open browser:
# http://localhost:5173
```

### Test Production Deployment

```bash
# From project root
python verify_deployment.py https://edubridge-backend.onrender.com https://your-app.vercel.app
```

### Manual API Tests

```bash
# Test backend root
curl https://edubridge-backend.onrender.com/

# Test health check
curl https://edubridge-backend.onrender.com/health

# Test registration (replace with your backend URL)
curl -X POST https://edubridge-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","role":"student"}'
```

---

## 🔍 Monitoring Commands

### View Logs

**Render:**
```bash
# Via Dashboard:
# 1. Go to your service
# 2. Click "Logs" tab
# 3. Watch real-time logs

# Or use Render CLI (if installed):
render logs <service-id>
```

**Vercel:**
```bash
# Via Dashboard:
# 1. Go to your project
# 2. Click "Deployments"
# 3. Click specific deployment
# 4. View logs

# Or use Vercel CLI:
vercel logs
```

---

## 🐛 Troubleshooting Commands

### Check Backend Health

```bash
# Test endpoint
curl -i https://edubridge-backend.onrender.com/health

# Should return 200 OK with:
# {
#   "status": "healthy",
#   "database": "connected"
# }
```

### Check Frontend Build

```bash
cd frontend

# Build locally to check for errors
npm run build

# Preview production build
npm run preview
```

### Test Database Connection

```bash
cd backend

# With your DATABASE_URL set in .env
python -c "
from app.core.database import engine
import asyncio

async def test():
    async with engine.connect() as conn:
        result = await conn.execute('SELECT 1')
        print('Database connected!')

asyncio.run(test())
"
```

---

## 📊 Useful Dashboard Links

**Render:**
- Dashboard: https://dashboard.render.com/
- Create Blueprint: https://dashboard.render.com/select-repo?type=blueprint
- Documentation: https://docs.render.com/

**Vercel:**
- Dashboard: https://vercel.com/dashboard
- New Project: https://vercel.com/new
- Documentation: https://vercel.com/docs

**API Keys:**
- Gemini API: https://makersuite.google.com/app/apikey
- VAPI: https://vapi.ai/

---

## 💾 Database Commands

### Backup Database (Render)

```bash
# Via Dashboard:
# 1. Go to your PostgreSQL database
# 2. Click "Backups" tab
# 3. Enable automatic backups

# Manual backup:
# Use pg_dump with your external database URL
```

### Reset Database

```bash
# CAUTION: This deletes all data!

# Method 1: Via Render Dashboard
# 1. Go to database
# 2. Suspend database
# 3. Delete database
# 4. Create new database with same name

# Method 2: Run reset script (if you have one)
cd backend
python reset_db.py
```

---

## 🔐 Security Commands

### Rotate SECRET_KEY

```bash
# Generate new key
python generate_secret_key.py

# Update in Render:
# 1. Go to backend service
# 2. Environment tab
# 3. Edit SECRET_KEY
# 4. Save (service redeploys)

# ⚠️ This will invalidate all existing JWT tokens
```

### Update Dependencies

```bash
# Backend
cd backend
pip list --outdated
pip install --upgrade package-name

# Frontend
cd frontend
npm outdated
npm update package-name

# Commit and push to trigger redeployment
```

---

## 📈 Performance Monitoring

### Check Response Times

```bash
# Test backend speed
time curl https://edubridge-backend.onrender.com/health

# Load test (requires 'ab' - Apache Bench)
ab -n 100 -c 10 https://edubridge-backend.onrender.com/
```

### Monitor Free Tier

**Render Free Tier:**
- 750 hours/month
- Check usage in dashboard

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Check analytics in dashboard

---

## 🎯 Quick Reference URLs

After deployment, save these URLs:

```
Backend API: https://_____________________.onrender.com
Frontend App: https://_____________________.vercel.app
API Docs: https://_____________________.onrender.com/docs
Health Check: https://_____________________.onrender.com/health
Database: (Internal - check Render dashboard)
```

---

## 🚨 Emergency Rollback

### Render

```bash
# Via Dashboard:
# 1. Go to service
# 2. Click "Events" tab
# 3. Find previous successful deployment
# 4. Click "Redeploy"
```

### Vercel

```bash
# Via Dashboard:
# 1. Go to project → Deployments
# 2. Find previous deployment
# 3. Click three dots → Promote to Production

# Or via CLI:
vercel rollback
```

---

✨ **Keep this file handy for quick reference during deployment!**
