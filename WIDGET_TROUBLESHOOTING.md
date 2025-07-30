# QA Detector Widget Troubleshooting Guide

## Widget Not Showing Up? Follow These Steps:

### 1. Check Your Token

The most common issue is not having a valid token. Open your browser's developer console (F12) and look for this error:

```
QA Detector: Token is required
```

**Solution:**

1. Sign in to your QA Detector dashboard at http://localhost:3000
2. Create a new project if you haven't already
3. Copy the embed token from your project (it's a long string like `c7a69c31ebe3011191bf0c1441630f38...`)
4. Replace `YOUR_TOKEN_HERE` in your HTML with the actual token:
   ```html
   <script
     src="http://localhost:3000/widget.js"
     data-token="YOUR_ACTUAL_TOKEN_HERE"
   ></script>
   ```

### 2. Check CORS Settings

The widget needs to communicate with your QA Detector server. Make sure:

1. Your development server is running (`npm run dev` in the qa-detector directory)
2. The widget script URL matches your server URL:
   - For local development: `http://localhost:3000/widget.js`
   - For production: `https://your-domain.vercel.app/widget.js`

### 3. Check Browser Console for Errors

Open the browser console and look for:

- Network errors (failed to load widget.js)
- JavaScript errors
- CORS errors

### 4. Verify Token in Database

You can verify your project exists and has a valid token:

```bash
cd qa-detector
node -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data, error } = await supabase.from('projects').select('*');
  console.log('Projects:', data);
})();
"
```

### 5. Test with a Simple HTML File

Create a minimal test file to isolate the issue:

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Widget Test</title>
  </head>
  <body>
    <h1>Testing QA Widget</h1>
    <p>Check the browser console for errors.</p>

    <!-- Replace with your actual token -->
    <script
      src="http://localhost:3000/widget.js"
      data-token="YOUR_TOKEN_HERE"
    ></script>
  </body>
</html>
```

### 6. Common Issues and Solutions

**Issue: "Invalid token" error**

- Make sure you're using the embed_token from the projects table, not the user ID
- Ensure the token hasn't been modified (no spaces or line breaks)

**Issue: Widget loads but doesn't appear**

- Check if the widget button is hidden behind other elements
- Look for the element with ID `qa-detector-widget` in the DOM

**Issue: CORS errors**

- Make sure your project's domain matches the site where you're embedding the widget
- Update the domain in your project settings if needed

### 7. Debug Mode

Add this to your HTML to see more detailed logs:

```html
<script>
  window.QA_DETECTOR_DEBUG = true;
</script>
<script src="http://localhost:3000/widget.js" data-token="YOUR_TOKEN"></script>
```

### 8. Manual Token Test

Test if your token is valid by visiting:

```
http://localhost:3000/api/verify-token
```

And sending a POST request with:

```json
{
  "token": "YOUR_TOKEN_HERE"
}
```

You can use curl:

```bash
curl -X POST http://localhost:3000/api/verify-token \
  -H "Content-Type: application/json" \
  -d '{"token": "YOUR_TOKEN_HERE"}'
```

## Still Having Issues?

1. Check the server logs in your terminal where `npm run dev` is running
2. Make sure all environment variables are set correctly in `.env.local`
3. Try clearing your browser cache and cookies
4. Test in an incognito/private browser window

## Quick Checklist

- [ ] Development server is running (`npm run dev`)
- [ ] Created a project in the dashboard
- [ ] Copied the embed token from the project
- [ ] Replaced `YOUR_TOKEN_HERE` with the actual token
- [ ] No errors in browser console
- [ ] Widget script URL is correct for your environment
