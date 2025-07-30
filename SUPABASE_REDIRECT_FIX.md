# Fix Supabase OAuth Redirect Issue

## Problem

When signing in on the production Vercel app, users are redirected to localhost instead of the production URL.

## Solution

You need to add the production URL to your Supabase project's allowed redirect URLs.

### Steps to Fix:

1. **Go to Supabase Dashboard**

   - Navigate to https://app.supabase.com
   - Select your project

2. **Add Production Redirect URL**

   - Go to **Authentication** → **URL Configuration**
   - In the **Redirect URLs** section, add:
     ```
     https://qa-website-nine.vercel.app/api/auth/callback
     ```
   - Also add your custom domain if you have one:
     ```
     https://yourdomain.com/api/auth/callback
     ```

3. **Verify Existing URLs**
   Make sure you have these URLs in the list:

   - `http://localhost:3000/api/auth/callback` (for local development)
   - `https://qa-website-nine.vercel.app/api/auth/callback` (for Vercel)
   - Any other deployment URLs you use

4. **Save Changes**
   - Click **Save** to update the configuration

### Important Notes:

- The redirect URL must match EXACTLY, including the protocol (http/https)
- Each deployment environment needs its own redirect URL
- Vercel preview deployments have unique URLs, so you might want to add a wildcard pattern if Supabase supports it

### Testing:

After adding the production URL:

1. Clear your browser cache/cookies
2. Go to https://qa-website-nine.vercel.app/login
3. Sign in with Google
4. You should now be redirected back to the production app, not localhost

### Additional Vercel Deployments:

If you have preview deployments on Vercel, you may want to add:

- `https://*.vercel.app/api/auth/callback` (if Supabase supports wildcards)
- Or add specific preview URLs as needed

### Environment Variables Check:

Also verify in your Vercel project settings that:

- `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set correctly
- These should match your Supabase project values
