# ActiveSet Widget Troubleshooting Guide

## Correct Widget Code for ActiveSet Staging

You should use this exact code in your Webflow site-wide custom code (in the Footer Code section):

```html
<script
  src="https://qa-detector.vercel.app/widget.js"
  data-token="7cd92383-1b0b-4da2-bc7b-f8571658533e"
></script>
```

## Common Issues and Solutions

### 1. Widget Not Appearing

**Check these things:**

1. **Correct URL**: Make sure you're using `https://qa-detector.vercel.app/widget.js` NOT `http://localhost:3000/widget.js`

2. **Correct Token**: Your ActiveSet Staging token is: `7cd92383-1b0b-4da2-bc7b-f8571658533e`

3. **Placement**: The code should be in:

   - Webflow Site Settings → Custom Code → Footer Code
   - NOT in the Head Code section

4. **Published Site**: Make sure you've published your Webflow site after adding the code

### 2. How to Verify the Widget is Loading

1. Visit your staging site: https://activeset-staging.webflow.io/
2. Open browser Developer Tools (F12)
3. Go to the Console tab
4. Look for any JavaScript errors
5. Go to the Network tab and search for "widget.js" - it should show status 200

### 3. Check Widget Visibility

The widget appears as a small floating button in the bottom-right corner. It might be:

- Hidden behind other elements
- Off-screen on mobile devices
- Blocked by ad blockers

Try:

1. Scrolling to the bottom of the page
2. Checking on different screen sizes
3. Disabling ad blockers temporarily

### 4. Debug Mode

To see if the widget is loading but not visible, add this to your browser console:

```javascript
// Check if widget script loaded
console.log(
  "Widget script:",
  document.querySelector('script[src*="widget.js"]')
);

// Check if widget container exists
console.log("Widget container:", document.getElementById("qa-detector-widget"));

// Check if widget button exists
console.log("Widget button:", document.querySelector(".qa-widget-button"));
```

### 5. Quick Test

To quickly test if the widget works, you can:

1. Open your browser console on the staging site
2. Paste this code:

```javascript
// Manually trigger widget initialization
if (window.QADetectorWidget) {
  console.log("Widget loaded successfully!");
  // Try to show the widget
  const button = document.querySelector(".qa-widget-button");
  if (button) {
    button.style.display = "block";
    button.style.visibility = "visible";
    console.log("Widget button made visible");
  }
} else {
  console.log("Widget not loaded yet");
}
```

### 6. Full Verification Steps

1. Go to Webflow Editor
2. Click on Site Settings (gear icon)
3. Navigate to Custom Code tab
4. In the Footer Code section, ensure you have:
   ```html
   <script
     src="https://qa-detector.vercel.app/widget.js"
     data-token="7cd92383-1b0b-4da2-bc7b-f8571658533e"
   ></script>
   ```
5. Save changes
6. Publish the site
7. Wait 1-2 minutes for changes to propagate
8. Visit https://activeset-staging.webflow.io/ in an incognito/private window

### 7. Alternative Implementation

If the widget still doesn't appear, try this enhanced version with explicit initialization:

```html
<script
  src="https://qa-detector.vercel.app/widget.js"
  data-token="7cd92383-1b0b-4da2-bc7b-f8571658533e"
></script>
<script>
  // Wait for widget to load and force initialization
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (
        window.QADetectorWidget &&
        typeof window.QADetectorWidget.init === "function"
      ) {
        window.QADetectorWidget.init();
        console.log("QA Detector Widget initialized");
      }
    }, 1000);
  });
</script>
```

## Need More Help?

If the widget still doesn't appear after following these steps:

1. Check the browser console for specific error messages
2. Take a screenshot of the console errors
3. Verify the token is correct by checking your QA Detector dashboard
4. Ensure your Vercel deployment is working: https://qa-detector.vercel.app/
