# 🚀 Edu-Bridge Deployment Guide

This guide walks you through deploying your Edu-Bridge application with:
- **Backend**: Render (FastAPI + PostgreSQL)
- **Frontend**: Vercel (React + Vite)

---

## 📋 Prerequisites

1. GitHub account (to push your code)
2. [Render account](https://render.com) (free tier available)
3. [Vercel account](https://vercel.com) (free tier available)
4. Gemini API Key from [Google AI Studio](https://makersuite.google.com/app/apikey)
5. VAPI API credentials (if using voice features)

---

## Part 1: Backend Deployment on Render

### Step 1: Prepare Your Repository

1. **Push your code to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

### Step 2: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `edubridge-db`
   - **Database**: `edubridge`
   - **User**: (auto-generated)
   - **Region**: Choose closest to your users
   - **PostgreSQL Version**: 16 (or latest)
   - **Plan**: Free (or paid for production)
4. Click **"Create Database"**
5. **Save the Internal Database URL** (you'll need it in the next step)
   - It looks like: `postgresql://user:password@host/database`

### Step 3: Create Web Service on Render

1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure the service:

   **Basic Settings:**
   - **Name**: `edubridge-backend`
   - **Region**: Same as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT"`

   **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL=<paste your PostgreSQL Internal Database URL from Step 2>
   SECRET_KEY=<generate a strong random key - use: openssl rand -hex 32>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   GEMINI_API_KEY=<your Gemini API key>
   VAPI_API_KEY=<your VAPI API key (optional)>
   VAPI_PHONE_NUMBER_ID=<your VAPI phone number ID (optional)>
   VAPI_WEBHOOK_URL=<your webhook URL (optional)>
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   PORT=10000
   ```

   **Important Notes:**
   - Replace `<...>` with your actual values
   - We'll update `CORS_ORIGINS` after deploying the frontend
   - Keep `SECRET_KEY` secure and never share it

4. Click **"Create Web Service"**
5. Wait for the deployment to complete (5-10 minutes)
6. **Save your backend URL**: `https://edubridge-backend.onrender.com`

### Step 4: Update CORS After Frontend Deployment

After deploying the frontend (Part 2), you'll need to:
1. Go back to your Render backend service
2. Click **"Environment"**
3. Update **CORS_ORIGINS** to include your Vercel URL:
   ```
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://your-app.vercel.app
   ```
4. Save changes (service will auto-redeploy)

---

## Part 2: Frontend Deployment on Vercel

### Step 1: Create Environment File

1. Create `frontend/.env.production` (if not exists):
   ```env
   VITE_API_URL=https://edubridge-backend.onrender.com/api
   ```
   Replace with your actual Render backend URL from Part 1, Step 3.

### Step 2: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:

   **Framework Preset**: `Vite`
   
   **Root Directory**: `frontend`
   
   **Build Settings:**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

   **Environment Variables:**
   ```
   VITE_API_URL=https://edubridge-backend.onrender.com/api
   ```
   (Replace with your actual backend URL)

5. Click **"Deploy"**
6. Wait for deployment (2-5 minutes)
7. **Save your frontend URL**: `https://your-app.vercel.app`

#### Option B: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from the frontend directory:
   ```bash
   cd frontend
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy: **Y**
   - Scope: Select your account
   - Link to existing project: **N**
   - Project name: `edubridge-frontend`
   - Directory: `./` (already in frontend folder)
   - Override settings: **Y**
     - Build Command: `npm run build`
     - Output Directory: `dist`
     - Development Command: `npm run dev`

5. Set environment variables:
   ```bash
   vercel env add VITE_API_URL
   ```
   Enter: `https://edubridge-backend.onrender.com/api`

6. Deploy to production:
   ```bash
   vercel --prod
   ```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard, go to your project
2. Click **"Settings"** → **"Domains"**
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Part 3: Post-Deployment Configuration

### Update Backend CORS Settings

1. Go to Render Dashboard → Your backend service
2. Click **"Environment"**
3. Update **CORS_ORIGINS**:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
4. Add your custom domain if you configured one
5. Save (service will redeploy)

### Verify Deployment

1. **Test Backend API**:
   - Visit: `https://edubridge-backend.onrender.com/`
   - Should see: `{"name": "EduBridge AI", ...}`
   - Check health: `https://edubridge-backend.onrender.com/health`
   - API docs: `https://edubridge-backend.onrender.com/docs`

2. **Test Frontend**:
   - Visit: `https://your-app.vercel.app`
   - Try registering a new account
   - Test login functionality
   - Verify API calls work

### Monitor Your Apps

**Render:**
- View logs: Dashboard → Your service → **Logs**
- Monitor metrics: **Metrics** tab
- Free tier sleeps after 15 min of inactivity (first request takes ~30s)

**Vercel:**
- View deployments: Dashboard → Your project → **Deployments**
- Analytics: **Analytics** tab
- Logs: Click any deployment → **Logs**

---

## 🔧 Troubleshooting

### Backend Issues

**Database Connection Errors:**
```bash
# Check DATABASE_URL is correct
# Format: postgresql://user:password@host:port/database
# Must be the INTERNAL URL from Render PostgreSQL
```

**CORS Errors:**
```bash
# Ensure CORS_ORIGINS includes your Vercel domain
# Update in Render Environment Variables
# No trailing slashes in URLs
```

**Free Tier Sleep:**
```bash
# Render free tier spins down after 15 min inactivity
# First request after sleep takes ~30-60 seconds
# Consider paid plan for production
```

### Frontend Issues

**API Connection Failed:**
```bash
# Check VITE_API_URL in Vercel environment variables
# Must include /api at the end
# Example: https://edubridge-backend.onrender.com/api
```

**Build Failures:**
```bash
# Check build logs in Vercel dashboard
# Ensure all dependencies are in package.json
# Verify TypeScript has no errors locally first
```

**Environment Variables Not Working:**
```bash
# VITE_ prefix is required for Vite
# Redeploy after adding new env vars
# Clear build cache if needed
```

---

## 📊 Cost Estimate

### Free Tier Limits:

**Render:**
- 750 hours/month free compute
- Free PostgreSQL (limited storage)
- Service spins down after 15 min

**Vercel:**
- Unlimited deployments
- 100 GB bandwidth/month
- Serverless function executions included

### Upgrade Recommendations:

**For Production:**
- Render: $7/month (prevents sleep)
- Database: $7/month (better performance)
- Vercel Pro: $20/month (better analytics, more bandwidth)

---

## 🔐 Security Checklist

- [ ] Use strong `SECRET_KEY` (32+ characters, random)
- [ ] Never commit `.env` files to Git
- [ ] Enable HTTPS (automatic on Render/Vercel)
- [ ] Restrict CORS to your actual domains only
- [ ] Use PostgreSQL in production (not SQLite)
- [ ] Regularly update dependencies
- [ ] Monitor error logs
- [ ] Set up database backups
- [ ] Use environment variables for all secrets

---

## 🚀 Continuous Deployment

Both Render and Vercel support automatic deployments:

1. **Push to GitHub** → automatic deployment
2. **Pull Requests** → preview deployments (Vercel)
3. **Main branch** → production deployment

Configure in:
- **Render**: Settings → Build & Deploy
- **Vercel**: Settings → Git

---

## 📚 Additional Resources

- [Render Docs](https://docs.render.com/)
- [Vercel Docs](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

---

## 🆘 Need Help?

- Check service logs first
- Verify all environment variables
- Test API endpoints with `/docs`
- Check CORS configuration
- Ensure database is running

**Common First-Time Issues:**
1. Wrong DATABASE_URL (use Internal URL)
2. Missing GEMINI_API_KEY
3. CORS not including frontend URL
4. VITE_API_URL missing /api suffix

---

✨ **Your Edu-Bridge app should now be live!**
