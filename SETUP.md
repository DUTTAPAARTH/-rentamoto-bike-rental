# RENTAMOTO Backend Setup Guide

## Quick Setup Steps

### 1. Get Supabase Credentials

1. **Create a Supabase Project** (if you haven't already):

   - Go to https://supabase.com
   - Sign in or create an account
   - Click "New Project"
   - Choose your organization and create the project
   - Wait for the project to be ready (takes 1-2 minutes)

2. **Get Your Project Credentials**:
   - Once your project is ready, go to **Settings > API**
   - Copy the following values:
     - **Project URL** (looks like: `https://xxxxxxxxxxx.supabase.co`)
     - **Anon key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
     - **Service role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### 2. Update Your .env File

Replace the placeholder values in your `.env` file with your actual Supabase credentials:

```bash
# Environment Variables
NODE_ENV=development
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-service-role-key-here

# JWT Configuration (Optional - if using custom JWT alongside Supabase)
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=24h

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=15

# Logging
LOG_LEVEL=info
```

### 3. Run Database Migration

Once your `.env` file is updated with real credentials:

```bash
npm run migrate
```

### 4. Start Development Server

```bash
npm run dev
```

## Common Issues & Solutions

### ❌ "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL"

- **Problem**: SUPABASE_URL is not set or still contains placeholder text
- **Solution**: Update SUPABASE_URL with your actual project URL from Supabase dashboard

### ❌ "Missing required environment variables"

- **Problem**: One or more Supabase keys are missing or invalid
- **Solution**: Check all three Supabase variables are set correctly

### ❌ "JWT Error" during migration

- **Problem**: Service role key is incorrect or has wrong permissions
- **Solution**: Double-check the service role key from Supabase Settings > API

### ❌ "Migration failed"

- **Problem**: Database connection issues or missing permissions
- **Solution**:
  1. Verify Supabase project is active
  2. Check service role key has admin permissions
  3. Try manual migration (see DEPLOYMENT.md)

## Manual Database Setup (Alternative)

If the migration script fails, you can manually set up the database:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `sql/schema.sql`
4. Paste and run the SQL in the editor
5. Copy the contents of `sql/analytics_functions.sql`
6. Paste and run the second SQL file

## Test Your Setup

Once everything is running, test these endpoints:

```bash
# Health check
curl http://localhost:3000/health

# API info
curl http://localhost:3000/

# Sign up a new user
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@rentamoto.com",
    "password": "SecurePass123!",
    "name": "Admin User",
    "role": "admin"
  }'
```

## Next Steps

1. **Create admin user** via `/auth/signup` with role: "admin"
2. **Add sample bikes** via admin endpoints
3. **Test the rental workflow**
4. **Set up your frontend** to connect to this backend

---

Need help? Check the logs in your terminal or the troubleshooting section in DEPLOYMENT.md
