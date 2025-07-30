# Webflow Widget Installation Guide

## Current Status

✅ QA Detector app is deployed and running at: https://qa-website-nine.vercel.app/
❌ Widget is NOT installed on your Webflow site: https://activeset-staging.webflow.io/

## Step 1: Get Your Project Token

1. **Log in to QA Detector Dashboard**

   - Go to: https://qa-website-nine.vercel.app/login
   - Use your email/password or Google account to log in

2. **Find or Create the ActiveSet Project**

   - Look for a project named "ActiveSet" or similar
   - If it doesn't exist, click "Create New Project"
   - Enter:
     - Name: ActiveSet
     - URL: https://activeset-staging.webflow.io

3. **Copy the Project Token**
   - Click on the project to view details
   - Look for the embed code section
   - Copy the token (it will look like: `proj_xxxxxxxxxxxxx`)

## Step 2: Add Widget to Webflow

### Method 1: Site-Wide Installation (Recommended)

1. **Open Webflow Designer**

   - Go to your Webflow project
   - Click on the Webflow logo (top left) to go to project settings

2. **Navigate to Custom Code**

   - Click on your project name
   - Select "Project Settings"
   - Click on "Custom Code" tab

3. **Add the Widget Script**
   - In the "Head Code" section, paste this code:

```html
<!-- QA Detector Widget -->
<script
  src="https://qa-website-nine.vercel.app/widget.js"
  data-token="YOUR_PROJECT_TOKEN_HERE"
></script>
```

4. **Replace the Token**

   - Replace `YOUR_PROJECT_TOKEN_HERE` with your actual token
   - Make sure there are no extra spaces

5. **Save and Publish**
   - Click "Save Changes"
   - Go back to Designer
   - Click "Publish" → Select your domain → "Publish to Selected Domains"

### Method 2: Page-Specific Installation

If you only want the widget on specific pages:

1. In Webflow Designer, go to the page
2. Click Page Settings (gear icon in left panel)
3. Scroll to "Custom Code" section
4. Add the same script in "Inside <head> tag"
5. Save and publish

## Step 3: Verify Installation

1. **Visit Your Site**

   - Go to: https://activeset-staging.webflow.io/
   - Wait a few seconds for the page to fully load

2. **Check Browser Console**

   - Open Developer Tools (F12)
   - Go to Console tab
   - You should see:
     - "QA Detector Widget loaded"
     - No error messages about invalid token

3. **Look for the Widget**
   - The widget should appear as a small icon/button
   - It might be in the bottom-right corner
   - Click it to open the QA results panel

## Troubleshooting

### Widget Not Appearing?

1. **Clear Cache**

   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Try incognito/private browsing mode

2. **Check Console for Errors**

   ```javascript
   // Run this in console to check:
   console.log(document.querySelector('script[src*="qa-website"]'));
   ```

3. **Verify Token**
   - Make sure the token starts with `proj_`
   - No quotes around the token value
   - No extra spaces

### Common Issues

1. **"Invalid token" error**

   - Double-check the token from your dashboard
   - Ensure the project URL matches exactly

2. **CORS errors**

   - The production app has CORS enabled
   - Make sure you're using HTTPS

3. **Widget loads but no results**
   - The site might not have any QA issues
   - Try adding a test issue (e.g., image without alt text)

## Example Working Code

Here's exactly what should be in your Webflow custom code:

```html
<!-- QA Detector Widget -->
<script
  src="https://qa-website-nine.vercel.app/widget.js"
  data-token="proj_abc123xyz789"
></script>
```

Replace `proj_abc123xyz789` with your actual token.

## Need Your Token?

If you need help getting your token, you can:

1. Run the script to get existing project tokens:

   ```bash
   cd qa-detector
   node scripts/get-project-tokens.js
   ```

2. Or create a new project via the dashboard

## Testing the Widget

Once installed, create some test issues:

- Add an image without alt text
- Include misspelled words (e.g., "teh" instead of "the")
- Add a broken link (href="#broken")

The widget should detect and display these issues.
