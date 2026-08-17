# 🚀 Quick Start Deployment

Get your Edu-Bridge app live in 20 minutes!

---

## Step 1: Push to GitHub (5 min)

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for deployment"

# Create a new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/edu-bridge.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy Backend on Render (10 min)

### Option A: Using Blueprint (Recommended - Easiest)

1. **Go to**: https://dashboard.render.com/select-repo?type=blueprint
2. **Select your repository**
3. **Render will automatically**:
   - Create PostgreSQL database
   - Create web service
   - Configure most environment variables
4. **Manually add** (click on your service → Environment):
   - `GEMINI_API_KEY`: Get from https://makersuite.google.com/app/apikey
5. **Copy your backend URL**: `https://edubridge-backend.onrender.com`

### Option B: Manual Setup

1. **Create Database**:
   - Dashboard → New + → PostgreSQL
   - Name: `edubridge-db`
   - Plan: Free
   - Create & save the **Internal Database URL**

2. **Create Web Service**:
   - Dashboard → New + → Web Service
   - Connect GitHub repo
   - Settings:
     - Name: `edubridge-backend`
     - Root Directory: `backend`
     - Runtime: Python 3
     - Build: `pip install -r requirements.txt`
     - Start: `sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT"`

3. **Add Environment Variables**:
   ```
   DATABASE_URL=<your PostgreSQL Internal URL>
   SECRET_KEY=<generate with: openssl rand -hex 32>
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   GEMINI_API_KEY=<your Gemini API key>
   CORS_ORIGINS=http://localhost:5173,http://localhost:3000
   PORT=10000
   ```

---

## Step 3: Deploy Frontend on Vercel (5 min)

### Option A: Using Dashboard (Easiest)

1. **Go to**: https://vercel.com/new
2. **Import** your GitHub repository
3. **Configure**:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **Add Environment Variable**:
   ```
   VITE_API_URL=https://edubridge-backend.onrender.com/api
   ```
   *(Replace with your actual backend URL)*
5. **Deploy** → Copy your URL: `https://your-app.vercel.app`

### Option B: Using CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod

# When prompted, enter:
# - Project name: edubridge-frontend
# - Build Command: npm run build
# - Output Directory: dist

# Add environment variable
vercel env add VITE_API_URL production
# Enter: https://edubridge-backend.onrender.com/api
```

---

## Step 4: Final Configuration (2 min)

### Update CORS in Backend

1. Go to **Render Dashboard** → Your backend service
2. Click **Environment** tab
3. Update `CORS_ORIGINS`:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```
4. **Save** (service will auto-redeploy)

---

## ✅ Verify Deployment

### Test Backend
Open in browser:
- Root: https://edubridge-backend.onrender.com/
- Health: https://edubridge-backend.onrender.com/health
- Docs: https://edubridge-backend.onrender.com/docs

Should see JSON responses.

### Test Frontend
1. Visit: https://your-app.vercel.app
2. Try registering a new user
3. Login with the user
4. Test AI chat or other features

---

## 🎯 Your Live URLs

Fill these in after deployment:

```
Backend API: https://_____________________.onrender.com
Frontend App: https://_____________________.vercel.app
API Docs: https://_____________________.onrender.com/docs
```

---

## 🔑 Important Notes

### Free Tier Limitations

**Render Free Tier:**
- ⚠️ **Service sleeps** after 15 minutes of inactivity
- First request after sleep takes ~30-60 seconds
- 750 hours/month free compute
- Good for testing, not production

**Vercel Free Tier:**
- ✅ No sleep issues
- 100 GB bandwidth/month
- Perfect for small-medium apps

### Upgrading for Production

For a production app, upgrade Render to **Starter plan ($7/month)** to:
- ✅ Prevent service from sleeping
- ✅ Faster response times
- ✅ Better reliability

---

## 🐛 Common Issues & Fixes

### "CORS Error" in Browser Console
```bash
# Fix: Update CORS_ORIGINS in Render to include your Vercel URL
# Make sure there are NO trailing slashes
CORS_ORIGINS=https://your-app.vercel.app
```

### "Failed to Fetch" / "Network Error"
```bash
# Fix: Check VITE_API_URL in Vercel
# Must end with /api
VITE_API_URL=https://edubridge-backend.onrender.com/api
```

### Backend Takes Forever to Load
```bash
# This is normal on free tier - service is "waking up"
# Wait 30-60 seconds on first request
# Consider upgrading to paid plan
```

### Database Connection Error
```bash
# Fix: Ensure DATABASE_URL is the INTERNAL URL
# Format: postgresql://user:pass@host/database
# Copy from Render PostgreSQL dashboard
```

---

## 📱 Share Your App

Once deployed, share your frontend URL:
- **Users**: https://your-app.vercel.app
- **Developers**: https://your-app.vercel.app/docs

---

## 🔄 Continuous Deployment

Both platforms auto-deploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push

# Render and Vercel automatically deploy! 🎉
```

**Monitor deployments:**
- Render: https://dashboard.render.com/
- Vercel: https://vercel.com/dashboard

---

## 📞 Need Help?

1. Check the [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
2. Review [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
3. Check service logs in Render/Vercel dashboards
4. Verify all environment variables are set correctly

---

## 🎉 Success!

Your Edu-Bridge app is now live and accessible to users worldwide!

**Next Steps:**
- ✅ Test all features thoroughly
- ✅ Monitor error logs
- ✅ Set up custom domain (optional)
- ✅ Configure database backups
- ✅ Add monitoring/analytics

**Happy deploying! 🚀**
