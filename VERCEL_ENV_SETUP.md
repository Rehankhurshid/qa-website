# Vercel Environment Variables Setup

The middleware error you're seeing is because the required environment variables are not configured on Vercel. Follow these steps to fix it:

## Required Environment Variables

You need to add these environment variables to your Vercel project:

1. **Go to your Vercel Dashboard**

   - Navigate to your project (qa-website)
   - Click on "Settings" tab
   - Click on "Environment Variables" in the left sidebar

2. **Add the following variables:**

### Core Variables (Required)

```
NEXT_PUBLIC_SUPABASE_URL=https://xcabdindxwzordwmlzmr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[Your anon key from Supabase]
SUPABASE_SERVICE_ROLE_KEY=[Your service role key from Supabase]
```

### Authentication Variables (Required)

```
NEXTAUTH_URL=https://qa-website.vercel.app
NEXTAUTH_SECRET=[Generate with: openssl rand -base64 32]
```

### Application URL (Required)

```
NEXT_PUBLIC_APP_URL=https://qa-website.vercel.app
```

## Step-by-Step Instructions

1. **Get your Supabase keys:**

   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy the following:
     - Project URL → NEXT_PUBLIC_SUPABASE_URL
     - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY
     - service_role secret key → SUPABASE_SERVICE_ROLE_KEY

2. **Generate NEXTAUTH_SECRET:**

   ```bash
   openssl rand -base64 32
   ```

   Copy the output and use it as your NEXTAUTH_SECRET value

3. **Add to Vercel:**

   - In Vercel Environment Variables page
   - For each variable:
     - Enter the Key (e.g., NEXT_PUBLIC_SUPABASE_URL)
     - Enter the Value
     - Select "Production" environment
     - Click "Save"

4. **Redeploy:**
   - After adding all variables, go to the Deployments tab
   - Click the three dots on the latest deployment
   - Select "Redeploy"

## Verify Your URLs

Make sure to update your production URL in:

- NEXTAUTH_URL
- NEXT_PUBLIC_APP_URL

Both should match your Vercel deployment URL (e.g., https://qa-website.vercel.app or your custom domain)

## Update Supabase Settings

After setting up environment variables:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Update:
   - Site URL: `https://qa-website.vercel.app` (or your custom domain)
   - Add to Redirect URLs: `https://qa-website.vercel.app/api/auth/callback`

## Test After Deployment

Once redeployed with environment variables:

1. Visit your site
2. Try to log in
3. The middleware error should be resolved

## Common Issues

- **Still getting errors?** Make sure there are no trailing spaces in your environment variable values
- **Authentication not working?** Double-check that NEXTAUTH_URL matches your actual Vercel URL
- **Supabase connection failing?** Verify your Supabase project is not paused and keys are correct
