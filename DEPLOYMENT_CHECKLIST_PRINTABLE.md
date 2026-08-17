# ✅ Edu-Bridge Deployment Checklist

Print this and check off each step as you complete it.

---

## Phase 1: Pre-Deployment Preparation

### Files & Configuration
- [ ] All code is committed to git
- [ ] Pushed to GitHub repository
- [ ] Ran `python test_deployment.py` - all checks passed
- [ ] Generated SECRET_KEY with `python generate_secret_key.py`
- [ ] Obtained Gemini API key from https://makersuite.google.com/app/apikey
- [ ] Backend `.env.example` file exists
- [ ] Frontend `.env.example` file exists

### Accounts Created
- [ ] Render account created at https://render.com
- [ ] Vercel account created at https://vercel.com
- [ ] Both accounts connected to GitHub

---

## Phase 2: Backend Deployment (Render)

### Database Setup
- [ ] Created PostgreSQL database on Render
- [ ] Database name: `edubridge-db`
- [ ] Copied **INTERNAL** Database URL
- [ ] Database URL format: `postgresql://user:pass@internal-host/db`

### Web Service Setup
- [ ] Created Web Service on Render
- [ ] Service name: `edubridge-backend`
- [ ] Connected to GitHub repository
- [ ] Root directory set to: `backend`
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `sh -c "python seed.py && uvicorn main:app --host 0.0.0.0 --port $PORT"`

### Environment Variables Set
- [ ] `DATABASE_URL` = (PostgreSQL Internal URL)
- [ ] `SECRET_KEY` = (Generated 64-char hex key)
- [ ] `ALGORITHM` = HS256
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = 10080
- [ ] `GEMINI_API_KEY` = (Your Gemini API key)
- [ ] `CORS_ORIGINS` = http://localhost:5173,http://localhost:3000
- [ ] `PORT` = 10000

### Deployment Status
- [ ] Backend service deployed successfully
- [ ] No errors in deployment logs
- [ ] Recorded backend URL: `https://_____________________.onrender.com`

---

## Phase 3: Backend Verification

### Test Endpoints
- [ ] Root endpoint works: `https://your-backend.onrender.com/`
- [ ] Health check works: `https://your-backend.onrender.com/health`
- [ ] API docs accessible: `https://your-backend.onrender.com/docs`
- [ ] Health check shows `"database": "connected"`
- [ ] No 500 errors in logs

### Database Verification
- [ ] Seed script ran successfully (check logs for "[OK] Seeded...")
- [ ] Scholarships loaded
- [ ] Government schemes loaded
- [ ] Colleges loaded
- [ ] Career paths loaded

---

## Phase 4: Frontend Deployment (Vercel)

### Environment Configuration
- [ ] Updated `frontend/.env.production` with backend URL
- [ ] `VITE_API_URL` = `https://your-backend.onrender.com/api`
- [ ] Note: Must end with `/api`

### Deployment Setup
- [ ] Went to https://vercel.com/new
- [ ] Imported GitHub repository
- [ ] Framework preset set to: **Vite**
- [ ] Root directory set to: `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install`

### Environment Variables in Vercel
- [ ] `VITE_API_URL` = `https://your-backend.onrender.com/api`

### Deployment Status
- [ ] Frontend deployed successfully
- [ ] No build errors
- [ ] Recorded frontend URL: `https://_____________________.vercel.app`

---

## Phase 5: Frontend Verification

### Basic Tests
- [ ] Homepage loads without errors
- [ ] No console errors in browser
- [ ] Navigation works
- [ ] All pages accessible

### Styling & Assets
- [ ] CSS/Tailwind styles loading correctly
- [ ] Images/icons displaying
- [ ] Responsive design works on mobile
- [ ] Language selector works

---

## Phase 6: Integration Testing

### Update CORS
- [ ] Went to Render backend service → Environment
- [ ] Updated `CORS_ORIGINS` to include Vercel URL
- [ ] Format: `https://your-app.vercel.app` (no trailing slash)
- [ ] Service redeployed successfully

### User Registration & Login
- [ ] Can register a new student account
- [ ] Receive success message
- [ ] Can log in with registered credentials
- [ ] JWT token stored in localStorage
- [ ] Redirected to dashboard after login

### Dashboard & Features
- [ ] Student dashboard loads
- [ ] Profile information displays
- [ ] Can edit profile
- [ ] Profile updates save successfully

### AI Features
- [ ] AI chat page accessible
- [ ] Can send messages to AI
- [ ] AI responds correctly
- [ ] Chat history persists

### Data Features
- [ ] Scholarships page loads
- [ ] Scholarships list displays
- [ ] Can filter/search scholarships
- [ ] College recommendations work
- [ ] Career roadmap generates

---

## Phase 7: Admin Testing (if applicable)

### Admin Access
- [ ] Can register admin account
- [ ] Admin dashboard accessible
- [ ] Different from student dashboard

### Admin Features
- [ ] Can view all students
- [ ] Can view leads
- [ ] Campaign management works
- [ ] Analytics display correctly

---

## Phase 8: Performance & Monitoring

### Performance Check
- [ ] Backend responds within acceptable time
- [ ] Frontend loads quickly
- [ ] No memory leaks detected
- [ ] Database queries optimized

### Monitoring Setup
- [ ] Render logs accessible
- [ ] Vercel deployment logs accessible
- [ ] No critical errors in logs
- [ ] Health check endpoint monitored

### Free Tier Considerations
- [ ] Aware that Render free tier sleeps after 15 min
- [ ] Tested wake-up time (~30-60 seconds)
- [ ] Consider upgrade for production use

---

## Phase 9: Security Review

### Security Checklist
- [ ] SECRET_KEY is strong (64+ characters)
- [ ] No secrets committed to git
- [ ] CORS restricted to actual domains
- [ ] Using PostgreSQL (not SQLite) in production
- [ ] HTTPS enabled (automatic on Render/Vercel)
- [ ] Environment variables secure
- [ ] Database backups enabled (recommended)

### Access Control
- [ ] JWT tokens working correctly
- [ ] Password hashing enabled
- [ ] Role-based access working (student/admin)
- [ ] API endpoints properly protected

---

## Phase 10: Documentation & Handoff

### Documentation
- [ ] Deployment guide reviewed
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Troubleshooting guide available

### URLs Documented
```
Backend URL: https://___________________________________
Frontend URL: https://___________________________________
API Docs: https://_____________________________________/docs
GitHub Repo: https://github.com/__________________________
Render Dashboard: https://dashboard.render.com/
Vercel Dashboard: https://vercel.com/dashboard
```

### Access Information Stored Securely
- [ ] Render login credentials
- [ ] Vercel login credentials
- [ ] GitHub access token (if needed)
- [ ] Database credentials (from Render)
- [ ] Gemini API key
- [ ] VAPI credentials (if used)

---

## Phase 11: Post-Deployment

### Monitoring (First 24 Hours)
- [ ] Check logs every few hours
- [ ] Monitor for errors
- [ ] Watch database performance
- [ ] Track response times

### User Testing
- [ ] Test from different devices
- [ ] Test from different browsers
- [ ] Test from different locations
- [ ] Get feedback from test users

### Optimization
- [ ] Review and optimize slow queries
- [ ] Check bundle size (frontend)
- [ ] Enable caching where appropriate
- [ ] Consider CDN for static assets

---

## Phase 12: Maintenance Plan

### Regular Tasks
- [ ] Monitor logs weekly
- [ ] Check database usage
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Test backups quarterly

### Scaling Plan
- [ ] Document when to upgrade Render
- [ ] Plan for increased database needs
- [ ] Consider Redis for caching
- [ ] Monitor bandwidth usage

---

## ✅ Deployment Complete!

**Date Deployed:** _______________

**Deployed By:** _______________

**Production URLs:**
- Frontend: https://___________________________________
- Backend: https://___________________________________

**Notes:**
________________________________________________________________
________________________________________________________________
________________________________________________________________
________________________________________________________________

---

## 🎉 Success Criteria

All items checked? Congratulations! Your Edu-Bridge application is live!

**Next Steps:**
1. Share with users
2. Gather feedback
3. Monitor performance
4. Plan feature updates

---

## 🆘 Emergency Contacts

**Support Resources:**
- Render Support: https://render.com/docs
- Vercel Support: https://vercel.com/support
- GitHub Issues: (your repo URL)/issues

**Quick Rollback:**
- Render: Dashboard → Events → Redeploy previous
- Vercel: Dashboard → Deployments → Promote previous

---

**Keep this checklist for future deployments and updates!**
