@echo off
echo 🚴 RENTAMOTO - Quick GitHub and Vercel Setup
echo ============================================

echo.
echo 📋 What this script will help you do:
echo 1. Show you how to create GitHub repository
echo 2. Connect your local code to GitHub  
echo 3. Prepare for Vercel deployment
echo 4. Set up environment variables
echo.

pause

echo 🌐 STEP 1: Create GitHub Repository
echo ------------------------------------
echo Please go to: https://github.com/new
echo.
echo Repository settings:
echo - Name: rentamoto-bike-rental
echo - Description: Full-stack bike rental management system with React and Node.js
echo - Visibility: Public (recommended) or Private
echo - DO NOT initialize with README, .gitignore, or license
echo.
echo Press any key after creating the repository...
pause

echo.
echo 🔗 STEP 2: Connect to GitHub  
echo ----------------------------
set /p username="Enter your GitHub username: "
set repo_url=https://github.com/%username%/rentamoto-bike-rental.git

echo.
echo Run these commands:
echo git remote add origin %repo_url%
echo git branch -M main
echo git push -u origin main
echo.

echo Copy and paste the above commands in your terminal now...
pause

echo.
echo ⚡ STEP 3: Install Vercel CLI
echo -----------------------------
echo Run this command to install Vercel CLI:
echo npm install -g vercel
echo.
echo Then login:
echo vercel login
echo.
pause

echo.
echo 🚀 STEP 4: Deploy to Vercel
echo ---------------------------
echo.
echo Deploy Backend:
echo 1. From project root: vercel --prod
echo 2. Project name: rentamoto-backend
echo 3. Build command: npm run build
echo 4. Output directory: (leave empty)
echo.
echo Deploy Frontend:
echo 1. cd frontend
echo 2. vercel --prod  
echo 3. Project name: rentamoto-frontend
echo 4. Build command: npm run build
echo 5. Output directory: build
echo.
pause

echo.
echo 🔧 STEP 5: Environment Variables
echo --------------------------------
echo.
echo Backend (Vercel Dashboard):
echo - SUPABASE_URL=your_supabase_url
echo - SUPABASE_ANON_KEY=your_anon_key
echo - SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
echo - NODE_ENV=production
echo - JWT_SECRET=your_32_char_secret
echo.
echo Frontend (Vercel Dashboard):
echo - REACT_APP_API_URL=https://your-backend-url.vercel.app
echo - REACT_APP_NAME=RENTAMOTO
echo.

echo 🎉 Setup Complete!
echo ===================
echo.
echo Your RENTAMOTO app is ready for deployment!
echo.
echo Next steps:
echo 1. ✅ Code is on GitHub
echo 2. 🚀 Deploy to Vercel  
echo 3. 🔧 Set environment variables
echo 4. 🧪 Test your live app
echo.
echo Visit your deployed app and enjoy! 🚴‍♂️
echo.
pause