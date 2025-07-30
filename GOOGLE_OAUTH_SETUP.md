# Google OAuth Setup Guide for QA Detector

## Current Issue

You're seeing "Error creating project: {}" because:

- The user needs to be properly authenticated before creating projects
- Google OAuth needs to be configured in the Supabase dashboard
- Password authentication might need to be enabled separately

## What We've Done with Supabase MCP

1. ✅ Re-enabled Row Level Security on the `projects` table
2. ✅ Created test user records in the database
3. ✅ Ensured database schema is properly set up

## Manual Configuration Required

### Enable Password Authentication (Optional - for testing)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/xcabdindxwzordwmlzmr/auth/providers)
2. Navigate to **Authentication → Providers**
3. Find **Email** provider and ensure it's enabled
4. Check that password-based sign-ins are allowed

### Configure Google OAuth (Required for production)

Since Supabase MCP doesn't support authentication provider configuration, you need to manually set up Google OAuth:

### 1. Configure Google OAuth in Supabase Dashboard

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/xcabdindxwzordwmlzmr/auth/providers)
2. Navigate to **Authentication → Providers**
3. Find **Google** and click to expand
4. Enable the Google provider

### 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**:

   - Go to **APIs & Services → Library**
   - Search for "Google+ API"
   - Click and enable it

4. Create OAuth 2.0 credentials:

   - Go to **APIs & Services → Credentials**
   - Click **Create Credentials** → **OAuth Client ID**
   - Configure the OAuth consent screen first if prompted:
     - Choose **External** user type
     - Fill in the required fields
     - Add your app domain
     - Add scopes: `email`, `profile`, `openid`

5. Create the OAuth Client ID:

   - Application type: **Web application**
   - Name: "QA Detector"
   - Authorized JavaScript origins:
     - `https://xcabdindxwzordwmlzmr.supabase.co`
     - `http://localhost:3002` (for local development)
   - Authorized redirect URIs:
     - `https://xcabdindxwzordwmlzmr.supabase.co/auth/v1/callback`
     - `http://localhost:3002/api/auth/callback` (for local development)
   - Click **Create**

6. Copy the **Client ID** and **Client Secret**

### 3. Add Credentials to Supabase

1. Go back to your [Supabase Dashboard](https://supabase.com/dashboard/project/xcabdindxwzordwmlzmr/auth/providers)
2. In the Google Provider settings:
   - Client ID: (paste the Client ID from Google)
   - Client Secret: (paste the Client Secret from Google)
   - Skip nonce checks: Leave unchecked
3. Click **Save**

### 4. Update Local Environment (if needed)

If you need to update the callback URL for local development, add this to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3002/api/auth/callback
```

## Testing the Setup

### Test with Password Authentication (immediately available)

You can test the application right now using the test user:

- Email: `test@activeset.co`
- Password: `testpassword123`

### Test with Google OAuth (after configuration)

Once you've configured Google OAuth:

1. Go to http://localhost:3002/login
2. Click "Sign in with Google"
3. Use an @activeset.co Google account
4. You should be redirected to the dashboard

## Troubleshooting

### If Google OAuth isn't working:

1. **Check the OAuth consent screen** - Make sure it's published (not in testing mode) or add test users
2. **Verify redirect URLs** - They must match exactly
3. **Check browser console** - Look for any error messages
4. **Verify domain restrictions** - The code enforces @activeset.co emails only

### If you see foreign key constraint errors:

This means users aren't being created in `auth.users`. Possible causes:

- Google OAuth isn't configured
- Authentication is failing before user creation
- The OAuth callback isn't being reached

## Next Steps

1. Configure Google OAuth as described above
2. Test with the password authentication first
3. Once Google OAuth is configured, test with a real @activeset.co account
4. Remove the test user in production:

```sql
DELETE FROM users WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
DELETE FROM auth.users WHERE id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
```
