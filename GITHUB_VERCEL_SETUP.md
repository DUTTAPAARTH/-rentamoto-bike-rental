# 🚀 RENTAMOTO Deployment Guide

## 📋 Pre-Deployment Checklist

✅ Git repository initialized and committed  
✅ Deployment configurations created  
✅ Environment variable templates ready  
✅ Both servers tested and working locally

## 🌐 Step 1: Create GitHub Repository

### Option A: GitHub Web Interface (Recommended)

1. Go to https://github.com
2. Click "+" → "New repository"
3. Name: `rentamoto-bike-rental`
4. Description: `Full-stack bike rental management system with React & Node.js`
5. Keep it **Public** (or Private if you prefer)
6. **DO NOT** initialize with README (we already have files)
7. Click "Create repository"

### Option B: GitHub CLI (if you have it installed)

```bash
gh repo create rentamoto-bike-rental --public --description "Full-stack bike rental management system"
```

## 🔗 Step 2: Connect Local Repository to GitHub

After creating the GitHub repository, run these commands:

```bash
# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/rentamoto-bike-rental.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## ⚡ Step 3: Deploy to Vercel

### 3.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 3.2 Login to Vercel

```bash
vercel login
```

### 3.3 Deploy Backend

```bash
# From the root directory
vercel --prod

# Follow the prompts:
# - Link to existing project? N
# - Project name: rentamoto-backend
# - Directory: ./
# - Build command: npm run build
# - Output directory: (leave empty)
```

### 3.4 Deploy Frontend

```bash
cd frontend
vercel --prod

# Follow the prompts:
# - Link to existing project? N
# - Project name: rentamoto-frontend
# - Directory: ./
# - Build command: npm run build
# - Output directory: build
```

## 🔧 Step 4: Configure Environment Variables

### Backend Environment Variables (in Vercel Dashboard)

Navigate to your backend project in Vercel → Settings → Environment Variables:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_32_chars_min
```

### Frontend Environment Variables (in Vercel Dashboard)

Navigate to your frontend project in Vercel → Settings → Environment Variables:

```
REACT_APP_API_URL=https://your-backend-domain.vercel.app
REACT_APP_NAME=RENTAMOTO
REACT_APP_VERSION=1.0.0
```

## 🌍 Step 5: Update CORS Settings

After deployment, update your backend CORS configuration:

1. Go to your backend Vercel dashboard
2. Add environment variable:
   ```
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

## 🧪 Step 6: Test Deployment

### Test Endpoints:

- **Frontend**: https://your-frontend-domain.vercel.app
- **Backend Health**: https://your-backend-domain.vercel.app/health
- **API**: https://your-backend-domain.vercel.app/bikes

### Test Flow:

1. ✅ Visit frontend URL
2. ✅ Sign up with new account
3. ✅ Login with demo account
4. ✅ Browse bikes
5. ✅ Make a rental booking
6. ✅ Return bike
7. ✅ Check booking history

## 🔄 Step 7: Enable Continuous Deployment

Once GitHub and Vercel are connected:

1. **Automatic Deployments**: Every push to `main` branch will trigger new deployment
2. **Preview Deployments**: Every pull request gets a preview URL
3. **Environment Promotion**: Test in preview, promote to production

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**:

   ```bash
   # Check build locally
   cd frontend
   npm run build
   ```

2. **API Connection Issues**:

   - Verify `REACT_APP_API_URL` matches backend URL
   - Check CORS configuration
   - Ensure all environment variables are set

3. **Database Connection**:
   - Verify Supabase credentials
   - Check if tables exist
   - Run migration if needed

### Useful Commands:

```bash
# View deployment logs
vercel logs [deployment-url]

# Redeploy with specific environment
vercel --prod --env NODE_ENV=production

# Check build output locally
npm run build
```

## 📱 Next Steps After Deployment

1. **Custom Domain** (Optional):

   - Add custom domain in Vercel dashboard
   - Update CORS and environment variables

2. **Monitoring**:

   - Set up Vercel Analytics
   - Monitor performance and errors

3. **Features to Add**:
   - Payment integration
   - Email notifications
   - GPS tracking
   - Mobile app

## 🎯 Quick Deploy Commands

Once everything is set up, future deployments are simple:

```bash
# Make changes, commit, and push
git add .
git commit -m "Feature: Add new functionality"
git push origin main

# Vercel will automatically deploy! 🚀
```

---

## 📞 Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables
3. Test API endpoints directly
4. Check GitHub Actions (if using)

**Your RENTAMOTO app is ready for the world! 🌍🚴‍♂️**
