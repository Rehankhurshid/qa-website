# QA Detector Setup Guide

This guide will help you set up the QA Detector application with Supabase authentication and Google OAuth.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- A Google Cloud Platform account and project

## 1. Supabase Setup

### Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Database Schema

Run the following SQL in your Supabase SQL Editor to create the required tables:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    domain TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    settings JSONB DEFAULT '{"accessibility_enabled": true, "spelling_enabled": true, "html_validation_enabled": true, "notifications_enabled": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create scans table
CREATE TABLE IF NOT EXISTS public.scans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    overall_score INTEGER NOT NULL,
    accessibility_score INTEGER,
    spelling_score INTEGER,
    html_validation_score INTEGER,
    accessibility_issues JSONB DEFAULT '[]'::jsonb,
    spelling_errors JSONB DEFAULT '[]'::jsonb,
    html_errors JSONB DEFAULT '[]'::jsonb,
    html_warnings JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON public.projects
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.projects
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.projects
    FOR DELETE USING (auth.uid() = user_id);

-- Scans policies
CREATE POLICY "Users can view scans for their projects" ON public.scans
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = scans.project_id
            AND projects.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create scans for their projects" ON public.scans
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE projects.id = project_id
            AND projects.user_id = auth.uid()
        )
    );

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_token ON public.projects(token);
CREATE INDEX idx_scans_project_id ON public.scans(project_id);
CREATE INDEX idx_scans_created_at ON public.scans(created_at DESC);
```

## 2. Google OAuth Setup

### Configure Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Go to the [Consent Screen configuration page](https://console.cloud.google.com/apis/credentials/consent)
4. Configure the OAuth consent screen:
   - Choose "External" user type
   - Add your app name and support email
   - Under **Authorized domains**, add your Supabase project's domain: `<PROJECT_ID>.supabase.co`
   - Configure the following non-sensitive scopes:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
     - `openid`

### Create OAuth Credentials

1. Go to the [API Credentials page](https://console.cloud.google.com/apis/credentials)
2. Click `Create credentials` and choose `OAuth Client ID`
3. For application type, choose `Web application`
4. Configure the following:

   - **Name**: Your app name (e.g., "QA Detector")
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (for local development)
     - Your production domain (when deployed)
   - **Authorized redirect URIs**:
     - `https://xcabdindxwzordwmlzmr.supabase.co/auth/v1/callback`
     - You can find this URL in your Supabase Dashboard under Authentication > Providers > Google
     - **Note**: Replace `xcabdindxwzordwmlzmr` with your actual project ID if different

5. Click "Create" and note down your **Client ID** and **Client Secret**

### Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to Authentication > Providers
3. Find Google in the list and click to expand
4. Enable the Google provider
5. Add your Google OAuth credentials:
   - **Client ID**: The client ID from Google Cloud Console
   - **Client Secret**: The client secret from Google Cloud Console
6. Save the configuration

## 3. Environment Setup

Create a `.env.local` file in the project root with your Supabase credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional: For local development with different Supabase URL
# NEXT_PUBLIC_SUPABASE_REDIRECT_URL=http://localhost:3000/api/auth/callback
```

## 4. Install Dependencies

```bash
npm install
```

## 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 6. Testing Google Authentication

1. Navigate to `http://localhost:3000/login`
2. Click "Sign in with Google"
3. You'll be redirected to Google's OAuth consent screen
4. After authorizing, you'll be redirected back to the dashboard

## Troubleshooting

### Google OAuth Issues

- **Error: "Redirect URI mismatch"**: Make sure the redirect URI in Google Cloud Console matches exactly with the one shown in Supabase Dashboard
- **Error: "Invalid client"**: Double-check that you've copied the client ID and secret correctly
- **Not redirecting after login**: Ensure your Supabase project URL is correct in `.env.local`

### Database Issues

- **Tables not found**: Make sure you've run all the SQL commands in the Supabase SQL Editor
- **Permission denied**: Check that Row Level Security (RLS) policies are properly set up
- **User profile not created**: Verify that the trigger `on_auth_user_created` is active

### Local Development

- If you're testing locally, make sure `http://localhost:3000` is added to the Authorized JavaScript origins in Google Cloud Console
- For production deployment, update the authorized origins and redirect URIs accordingly

## Production Deployment

When deploying to production:

1. Update your Google OAuth configuration:

   - Add your production domain to Authorized JavaScript origins
   - Keep the Supabase callback URL in Authorized redirect URIs

2. Set environment variables in your hosting platform (Vercel, Netlify, etc.)

3. Consider using [Custom Domains](https://supabase.com/docs/guides/platform/custom-domains) with Supabase for a more professional appearance in the Google consent screen

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your service role key secure and only use it on the server side
- Regularly rotate your API keys and tokens
- Monitor your Supabase dashboard for unusual activity
