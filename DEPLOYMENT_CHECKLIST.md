# ✅ Deployment Checklist - Quick Reference

## Pre-Deployment

- [ ] Code pushed to GitHub
- [ ] Gemini API Key obtained
- [ ] Render account created
- [ ] Vercel account created

---

## Backend (Render) - Quick Setup

### 1️⃣ Create PostgreSQL Database
```
Name: edubridge-db
Database: edubridge
Region: US East (or your preferred)
Plan: Free
```
📝 **Save the Internal Database URL**

### 2️⃣ Create Web Service
```
Name: edubridge-backend
Runtime: Python 3
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT"
```

### 3️⃣ Environment Variables
```bash
DATABASE_URL=postgresql://user:pass@host/db  # From step 1
SECRET_KEY=                                    # Generate: openssl rand -hex 32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GEMINI_API_KEY=                               # Your Gemini API key
CORS_ORIGINS=http://localhost:5173            # Update after frontend deploy
PORT=10000
```

### 4️⃣ Deploy & Save URL
📝 **Backend URL**: `https://edubridge-backend.onrender.com`

---

## Frontend (Vercel) - Quick Setup

### 1️⃣ Update Environment File
Create/update `frontend/.env.production`:
```bash
VITE_API_URL=https://edubridge-backend.onrender.com/api
```

### 2️⃣ Deploy via Dashboard
```
Import from GitHub
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3️⃣ Environment Variables
```bash
VITE_API_URL=https://edubridge-backend.onrender.com/api
```

### 4️⃣ Deploy & Save URL
📝 **Frontend URL**: `https://your-app.vercel.app`

---

## Post-Deployment

### Update CORS in Render
Go to backend service → Environment → Update:
```bash
CORS_ORIGINS=https://your-app.vercel.app
```

### Test Your Deployment
- [ ] Backend: `https://edubridge-backend.onrender.com/`
- [ ] Health: `https://edubridge-backend.onrender.com/health`
- [ ] Docs: `https://edubridge-backend.onrender.com/docs`
- [ ] Frontend: `https://your-app.vercel.app`
- [ ] Test registration & login
- [ ] Verify API calls work

---

## Alternative: Vercel CLI Deployment

```bash
# Install CLI
npm install -g vercel

# Login
vercel login

# Deploy (from frontend directory)
cd frontend
vercel

# Set environment variables
vercel env add VITE_API_URL production
# Enter: https://edubridge-backend.onrender.com/api

# Deploy to production
vercel --prod
```

---

## Generate SECRET_KEY

**Windows PowerShell:**
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[System.BitConverter]::ToString($bytes).Replace('-','').ToLower()
```

**Git Bash / Linux / Mac:**
```bash
openssl rand -hex 32
```

**Python:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Update `CORS_ORIGINS` in Render with Vercel URL |
| Database Error | Check `DATABASE_URL` is the Internal URL from Render PostgreSQL |
| API Not Found | Verify `VITE_API_URL` ends with `/api` |
| Build Failed | Check build logs, run `npm run build` locally first |
| Backend Slow | Free tier sleeps - first request takes ~30s |

---

## URLs to Keep Handy

- **Render Dashboard**: https://dashboard.render.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Google AI Studio** (Gemini API): https://makersuite.google.com/app/apikey
- **GitHub Repo**: Your repository URL

---

## Deployment Timeline

- **Database Creation**: 2-3 minutes
- **Backend Deployment**: 5-10 minutes
- **Frontend Deployment**: 2-5 minutes
- **Total**: ~15-20 minutes

---

## Cost Summary

### Free Tier (Good for Testing)
- Render: 750 hours/month
- Vercel: Unlimited deployments
- **Note**: Backend sleeps after 15 min inactivity

### Production (Recommended)
- Render Web Service: $7/month
- Render PostgreSQL: $7/month (or free tier)
- Vercel Pro: $20/month (optional)
- **Total**: $14-34/month

---

✨ **You're all set! Deploy with confidence.**
