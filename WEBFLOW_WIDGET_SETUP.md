# Adding QA Detector Widget to Webflow

## Issue

The QA Detector widget is not currently installed on your Webflow site (https://activeset-staging.webflow.io/).

## Steps to Add the Widget

### 1. Get Your Project Token

First, you need to get the project token for your website:

1. Log in to your QA Detector dashboard at https://qa-website-nine.vercel.app/login
2. Find or create a project for "ActiveSet"
3. Copy the project token from the embed code

### 2. Add Widget to Webflow

#### Option A: Add to Site-Wide Custom Code (Recommended)

1. In your Webflow project, go to **Project Settings**
2. Navigate to the **Custom Code** tab
3. In the **Head Code** section, add:

```html
<!-- QA Detector Widget -->
<script
  src="https://qa-website-nine.vercel.app/widget.js"
  data-token="YOUR_PROJECT_TOKEN_HERE"
></script>
```

4. Replace `YOUR_PROJECT_TOKEN_HERE` with your actual project token
5. **Save** the changes
6. **Publish** your Webflow site

#### Option B: Add to Specific Pages

If you only want the widget on specific pages:

1. Go to the page in Webflow Designer
2. Click on the **Page Settings** (gear icon)
3. Scroll to **Custom Code**
4. In the **Inside <head> tag** section, add the same script
5. Save and publish

### 3. Verify Installation

After publishing:

1. Visit your site: https://activeset-staging.webflow.io/
2. Open the browser developer console (F12)
3. You should see:
   - The widget loading message
   - No CORS errors

### 4. Test the Widget

1. Create some test issues on your page:

   - Add an image without alt text
   - Include some spelling mistakes
   - Add broken links

2. The widget should automatically scan and report these issues

## Important Notes

- **Production URL**: Make sure you're using the production widget URL:

  ```
  https://qa-website-nine.vercel.app/widget.js
  ```

  NOT the localhost version

- **CORS**: The widget is configured to work cross-origin, so it should work on any domain

- **Project Token**: Each website needs its own unique project token

## Troubleshooting

### Widget Not Showing

1. Check browser console for errors
2. Verify the script URL is correct
3. Ensure the project token is valid
4. Make sure the site is published (not just saved)

### CORS Errors

If you see CORS errors:

1. The production app (qa-website-nine.vercel.app) should already have CORS configured
2. Check that you're using HTTPS for both sites

### Token Issues

If the widget says "Invalid token":

1. Go back to the QA Detector dashboard
2. Verify the project exists
3. Copy the token again (ensure no extra spaces)

## Example Working Implementation

Here's a complete example of what should be in your Webflow custom code:

```html
<!-- QA Detector Widget -->
<script
  src="https://qa-website-nine.vercel.app/widget.js"
  data-token="proj_abc123xyz789"
></script>
```

Replace `proj_abc123xyz789` with your actual token.

## Need Help?

If you're still having issues:

1. Check the browser console for specific error messages
2. Verify the widget loads on a test HTML page first
3. Ensure your Webflow plan supports custom code
