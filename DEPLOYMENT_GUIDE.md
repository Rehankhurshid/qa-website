# QA Detector Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure you have all required environment variables set up:

- [ ] `NEXTAUTH_URL` - Your production URL (e.g., https://qa-detector.vercel.app)
- [ ] `NEXTAUTH_SECRET` - A secure random string (generate with `openssl rand -base64 32`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key
- [ ] `NEXT_PUBLIC_APP_URL` - Your production URL (same as NEXTAUTH_URL)

### 2. Database Setup

- [ ] Ensure all tables are created in Supabase (users, projects, scans, scan_results, etc.)
- [ ] RLS policies are properly configured
- [ ] Database connection is tested and working

### 3. Authentication

- [ ] Supabase Auth is configured with at least one provider (Email/Password)
- [ ] Google OAuth is optional but recommended
- [ ] Test user accounts are removed from production

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Connect to Vercel**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

3. **Environment Variables in Vercel**
   Add all environment variables from `.env.local` to Vercel:

   - Go to Project Settings → Environment Variables
   - Add each variable for Production environment

4. **Deploy**

   - Vercel will automatically deploy on push to main branch
   - Get your production URL from Vercel dashboard

5. **Update Supabase Redirect URLs**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - In the **Redirect URLs** section, add:
     - `https://your-vercel-app.vercel.app/api/auth/callback`
     - `https://yourdomain.com/api/auth/callback` (if you have a custom domain)
   - Keep the localhost URL for development:
     - `http://localhost:3000/api/auth/callback`
   - **Important:** The redirect URL must match EXACTLY, including the protocol (http/https)

### Option 2: Deploy to Other Platforms

#### Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize and deploy
railway init
railway up
```

#### Self-Hosted (VPS/Docker)

1. **Dockerfile** (create this file):

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

2. **Build and run**:

```bash
docker build -t qa-detector .
docker run -p 3000:3000 --env-file .env.local qa-detector
```

## Post-Deployment Steps

### 1. Update Configuration

1. **Update NEXTAUTH_URL**
   - Set to your production URL in environment variables
2. **Update Supabase Auth Settings**

   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your production URL to:
     - Site URL
     - Redirect URLs (add `https://your-domain.com/api/auth/callback`)

3. **Update CORS Settings** (if needed)
   - For the widget to work on client websites
   - Configure in your hosting platform

### 2. Test Production Deployment

1. **Test Authentication**

   - Sign up with a new account
   - Sign in/out
   - Password reset (if applicable)

2. **Test Core Features**

   - Create a project
   - Get embed code
   - Install widget on a test site
   - Run a scan
   - View scan results

3. **Test Widget**

   - Create a test HTML file:

   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <title>QA Detector Test</title>
     </head>
     <body>
       <h1>Test Page</h1>
       <img src="test.jpg" alt="" />
       <p>This is a tset page with speling errors.</p>

       <!-- Your widget script -->
       <script
         src="https://your-domain.com/widget.js"
         data-token="YOUR_PROJECT_TOKEN"
       ></script>
     </body>
   </html>
   ```

### 3. Security Checklist

- [ ] Remove all test/development scripts from production
- [ ] Ensure `.env.local` is in `.gitignore`
- [ ] Set secure CSP headers in `next.config.ts`
- [ ] Enable HTTPS (automatic on Vercel/Netlify)
- [ ] Review and tighten RLS policies if needed
- [ ] Remove any console.log statements with sensitive data

### 4. Monitoring & Maintenance

1. **Set up monitoring**

   - Vercel Analytics (built-in)
   - Sentry for error tracking
   - Uptime monitoring (UptimeRobot, Pingdom)

2. **Regular maintenance**
   - Monitor Supabase usage/limits
   - Review scan data growth
   - Update dependencies regularly

## Troubleshooting

### Common Issues

1. **"Invalid environment variables"**

   - Double-check all env vars are set in production
   - Ensure no trailing spaces in values

2. **"Authentication not working"**

   - Verify NEXTAUTH_URL matches your production URL
   - Check Supabase redirect URLs include your domain

3. **"Widget not loading"**

   - Check CORS settings
   - Verify NEXT_PUBLIC_APP_URL is correct
   - Check browser console for errors

4. **"Database connection failed"**
   - Verify Supabase keys are correct
   - Check if Supabase project is not paused

### Support

For deployment issues:

1. Check the [Next.js deployment docs](https://nextjs.org/docs/deployment)
2. Review [Supabase production checklist](https://supabase.com/docs/guides/platform/going-into-prod)
3. Check your hosting platform's documentation

## Production Best Practices

1. **Performance**

   - Enable caching headers
   - Use CDN for static assets
   - Optimize images

2. **Security**

   - Regularly update dependencies
   - Monitor for security advisories
   - Use strong NEXTAUTH_SECRET
   - Implement rate limiting

3. **Backup**
   - Regular database backups (Supabase handles this)
   - Keep configuration documented
   - Version control everything

Ready to deploy! 🚀
