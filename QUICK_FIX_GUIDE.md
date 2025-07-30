# Quick Fix Guide for QA Detector Issues

## Issue 1: Widget Not Showing Up

**Problem:** The widget doesn't appear on your test page.

**Cause:** You haven't replaced `YOUR_TOKEN_HERE` with an actual project token.

**Solution:**

1. Get your project token:

   ```bash
   cd qa-detector && node scripts/get-project-tokens.js
   ```

2. Copy the token from the output (e.g., `c7a69c31ebe3011191bf0c1441630f38...`)

3. Update your HTML file:

   ```html
   <!-- Replace YOUR_TOKEN_HERE with the actual token -->
   <script
     src="http://localhost:3000/widget.js"
     data-token="YOUR_ACTUAL_TOKEN_HERE"
   ></script>
   ```

4. Open the HTML file in your browser - the widget should now appear!

## Issue 2: Error Creating Project: {}

**Problem:** When trying to create a project, you get an empty error object.

**Cause:** Authentication session issues with the Supabase client.

**Solution:** The code has been updated to:

- Check for valid session before creating project
- Provide clearer error messages
- Redirect to login if session expired

Try creating a project again - you should now see more detailed error messages.

## Debug Mode

To see detailed logs, add this before the widget script:

```html
<script>
  window.QA_DETECTOR_DEBUG = true;
</script>
<script src="http://localhost:3000/widget.js" data-token="YOUR_TOKEN"></script>
```

## Complete Testing Steps

1. Start the development server:

   ```bash
   cd qa-detector && npm run dev
   ```

2. Visit http://localhost:3000 and sign in

3. Create a new project (the error handling is now improved)

4. Get your project token:

   ```bash
   node scripts/get-project-tokens.js
   ```

5. Update your test HTML with the token

6. Open the test HTML file - the widget should work!

## Still Having Issues?

Check:

- Browser console for errors (F12)
- Server logs in terminal where `npm run dev` is running
- That you're signed in at http://localhost:3000
- That the token in your HTML matches a project token

For more detailed troubleshooting, see `WIDGET_TROUBLESHOOTING.md`.
