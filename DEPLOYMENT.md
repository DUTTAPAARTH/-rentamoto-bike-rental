# RENTAMOTO API Deployment Guide

## Environment Variables Required

Make sure to set these environment variables in your deployment platform:

### Required

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (secret)

### Optional

- `NODE_ENV` - Set to "production" for production deployments
- `PORT` - Server port (default: 3000, automatically set by most platforms)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
- `RATE_LIMIT_REQUESTS` - Rate limit requests per window (default: 100)
- `RATE_LIMIT_WINDOW` - Rate limit window in minutes (default: 15)
- `JWT_SECRET` - Custom JWT secret (recommended for production)

## Deployment Platforms

### 1. Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
# or via CLI:
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 2. Render Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm install`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

### 3. Railway Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy to Railway
railway login
railway init
railway up

# Set environment variables
railway variables:set SUPABASE_URL=your_url
railway variables:set SUPABASE_ANON_KEY=your_key
railway variables:set SUPABASE_SERVICE_ROLE_KEY=your_secret_key
```

### 4. Heroku Deployment

```bash
# Install Heroku CLI and login
heroku login

# Create Heroku app
heroku create rentamoto-api

# Set environment variables
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your_secret_key
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

### 5. Netlify Functions

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy to Netlify
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

## Pre-Deployment Checklist

- [ ] Set up Supabase project and get API keys
- [ ] Run database migration: `npm run migrate`
- [ ] Test all endpoints locally: `npm run dev`
- [ ] Set all required environment variables
- [ ] Configure CORS origins for your frontend domain
- [ ] Set up rate limiting for production traffic
- [ ] Test authentication flow
- [ ] Verify admin and customer role permissions
- [ ] Test bike rental and return workflow

## Post-Deployment Steps

1. **Test API Health**

   ```bash
   curl https://your-api-domain.com/health
   ```

2. **Create Admin User**

   - Sign up via `/auth/signup` with role: "admin"
   - Or manually update user role in Supabase dashboard

3. **Add Sample Bikes**

   - Use admin endpoints to add bikes to inventory
   - Set proper locations (latitude/longitude)

4. **Configure Frontend**

   - Update frontend API base URL
   - Test authentication integration
   - Verify bike booking workflow

5. **Monitor and Scale**
   - Set up error monitoring (e.g., Sentry)
   - Monitor response times and usage
   - Scale resources based on traffic

## Troubleshooting

### Common Issues

1. **CORS Errors**

   - Set `ALLOWED_ORIGINS` environment variable
   - Include your frontend domain

2. **Authentication Failures**

   - Verify Supabase keys are correct
   - Check JWT token expiration settings

3. **Database Connection Issues**

   - Ensure Supabase project is active
   - Verify service role key permissions

4. **Rate Limiting**

   - Adjust `RATE_LIMIT_REQUESTS` if needed
   - Consider implementing user-based rate limiting

5. **Performance Issues**
   - Enable database query optimization
   - Implement caching for frequently accessed data
   - Use connection pooling

### Health Check Endpoints

- `GET /health` - Basic health check
- `GET /` - API information and available endpoints

### Monitoring

Set up monitoring for:

- API response times
- Error rates
- Database connection status
- Active user sessions
- Revenue metrics
