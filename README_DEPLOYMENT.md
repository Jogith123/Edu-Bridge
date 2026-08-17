# 🚀 Edu-Bridge Deployment Instructions

Complete guide to deploy your Edu-Bridge application to production.

## 📁 Project Structure

```
Edu-Bridge/
├── backend/                 # FastAPI backend
│   ├── app/                # Application code
│   ├── data/               # Seed data (JSON files)
│   ├── main.py            # FastAPI entry point
│   ├── seed.py            # Database seeder
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Docker configuration
│   ├── Procfile          # Render startup
│   └── runtime.txt       # Python version
├── frontend/               # React + Vite frontend
│   ├── src/               # Source code
│   ├── package.json       # Node dependencies
│   ├── vite.config.ts     # Vite configuration
│   └── vercel.json        # Vercel configuration
├── render.yaml            # Render Infrastructure as Code
├── DEPLOYMENT_GUIDE.md    # Detailed deployment guide
└── QUICK_START_DEPLOYMENT.md  # Quick start guide
```

## ✅ Pre-Deployment Checklist

Run this script to verify everything is ready:

```bash
python test_deployment.py
```

This checks:
- ✓ All required files exist
- ✓ JSON data files are valid
- ✓ Git repository is set up
- ✓ Configuration files are present

## 🔧 Environment Setup

### Backend Environment Variables

Create `backend/.env` for local development:

```bash
# Copy example file
cd backend
cp .env.example .env
# Edit .env with your actual values
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string (from Render)
- `SECRET_KEY` - Random secure key (generate with: `openssl rand -hex 32`)
- `GEMINI_API_KEY` - Get from https://makersuite.google.com/app/apikey
- `CORS_ORIGINS` - Comma-separated list of allowed origins

### Frontend Environment Variables

Create `frontend/.env.local` for local development:

```bash
cd frontend
cp .env.local.example .env.local
```

For production, update `frontend/.env.production` with your backend URL.

## 🚀 Deployment Options

### Option 1: Quick Deploy (Recommended)

Follow the [Quick Start Guide](./QUICK_START_DEPLOYMENT.md) - 20 minutes total

### Option 2: Infrastructure as Code

Use the included `render.yaml`:

1. Push to GitHub
2. Visit https://dashboard.render.com/select-repo?type=blueprint
3. Select your repository
4. Render creates everything automatically
5. Add GEMINI_API_KEY manually

### Option 3: Manual Setup

Follow the [Complete Guide](./DEPLOYMENT_GUIDE.md) for step-by-step instructions

## 🧪 Testing Deployment

### Backend Tests

```bash
# Test health endpoint
curl https://your-backend.onrender.com/health

# Check API docs
# Visit: https://your-backend.onrender.com/docs
```

Expected response:
```json
{
  "status": "healthy",
  "service": "EduBridge AI Backend",
  "version": "1.0.0",
  "database": "connected"
}
```

### Frontend Tests

1. Visit your Vercel URL
2. Register a new account
3. Login
4. Test features:
   - Dashboard loads
   - AI chat works
   - Scholarships display
   - Profile updates

## 🔄 Continuous Deployment

Both platforms auto-deploy on git push:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Render and Vercel automatically deploy
```

Monitor deployments:
- **Render**: https://dashboard.render.com/
- **Vercel**: https://vercel.com/dashboard

## 🐛 Troubleshooting

### Backend won't start

```bash
# Check logs in Render dashboard
# Common issues:
# 1. DATABASE_URL not set correctly
# 2. Missing GEMINI_API_KEY
# 3. Python version mismatch
```

### Frontend can't connect to API

```bash
# Check environment variables in Vercel
# Ensure VITE_API_URL ends with /api
# Format: https://your-backend.onrender.com/api
```

### CORS errors

```bash
# Update CORS_ORIGINS in Render
# Must include your Vercel URL (no trailing slash)
# Example: https://your-app.vercel.app
```

### Database errors

```bash
# Verify you're using the INTERNAL database URL from Render
# Format: postgresql://user:pass@internal-host/db
# NOT the external URL
```

## 📊 Performance

### Free Tier Limitations

**Render (Free):**
- ⏱️ Spins down after 15 min inactivity
- ⏱️ First request takes 30-60 seconds
- ✓ 750 hours/month included

**Vercel (Free):**
- ✓ No spin-down
- ✓ Fast global CDN
- ✓ 100 GB bandwidth/month

### Production Recommendations

For real users, upgrade:
- **Render Starter**: $7/month (no spin-down)
- **Render PostgreSQL**: $7/month (better performance)
- **Vercel Pro**: $20/month (optional, better limits)

## 🔐 Security Best Practices

- ✓ Use strong SECRET_KEY (64+ characters)
- ✓ Never commit .env files
- ✓ Use PostgreSQL in production
- ✓ Restrict CORS to actual domains
- ✓ Keep dependencies updated
- ✓ Monitor error logs
- ✓ Enable database backups
- ✓ Use HTTPS (automatic on Render/Vercel)

## 📚 Additional Resources

- [Render Documentation](https://docs.render.com/)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## 💡 Tips

1. **Test locally first**: Ensure everything works with `DATABASE_URL` pointing to PostgreSQL
2. **Use environment variables**: Never hardcode sensitive data
3. **Monitor logs**: Check Render/Vercel dashboards regularly
4. **Set up alerts**: Configure notifications for errors
5. **Backup database**: Enable automatic backups in Render

## 🆘 Getting Help

1. Check service logs first
2. Verify all environment variables are set
3. Test API endpoints at `/docs`
4. Review CORS configuration
5. Ensure database is running and accessible

## 📈 Scaling

As your app grows:

1. **Database**: Upgrade to paid PostgreSQL plan
2. **Backend**: Increase instance size or add workers
3. **Frontend**: Vercel scales automatically
4. **Caching**: Add Redis for session/data caching
5. **CDN**: Use Cloudflare for additional performance

## ✨ You're Ready!

Follow the [Quick Start Guide](./QUICK_START_DEPLOYMENT.md) to deploy now!
