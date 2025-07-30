(function () {
  "use strict";

  // Configuration
  const WIDGET_ID = "qa-detector-widget";
  const SESSION_KEY = "qa-detector-session";
  const API_BASE = window.location.origin;
  const token = document.currentScript.getAttribute("data-token");

  if (!token) {
    console.error("QA Detector: Token is required");
    return;
  }

  // Check if widget already exists
  if (document.getElementById(WIDGET_ID)) {
    return;
  }

  // Session management
  function getSession() {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  }

  function setSession(data) {
    try {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          ...data,
          timestamp: Date.now(),
        })
      );
    } catch {
      // Silent fail for localStorage issues
    }
  }

  // Create widget styles
  const styles = `
    #${WIDGET_ID} {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .qa-trigger-button {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qa-trigger-button:hover {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .qa-trigger-button:active {
      transform: translateY(0);
    }

    .qa-trigger-button svg {
      width: 16px;
      height: 16px;
    }

    .qa-results-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 400px;
      height: 100vh;
      background: white;
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.1);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 999998;
      display: flex;
      flex-direction: column;
    }

    .qa-results-panel.open {
      transform: translateX(0);
    }

    .qa-results-header {
      padding: 20px;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .qa-results-title {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .qa-close-button {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .qa-close-button:hover {
      background: #f3f4f6;
    }

    .qa-results-content {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .qa-section {
      margin-bottom: 24px;
    }

    .qa-section-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qa-issue {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 6px;
      padding: 12px;
      margin-bottom: 8px;
      font-size: 13px;
      color: #92400e;
    }

    .qa-success {
      background: #d1fae5;
      border: 1px solid #6ee7b7;
      color: #065f46;
    }

    .qa-error {
      background: #fee2e2;
      border: 1px solid #fca5a5;
      color: #991b1b;
    }

    .qa-loading {
      text-align: center;
      padding: 40px;
      color: #6b7280;
    }

    .qa-spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 16px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: qa-spin 0.8s linear infinite;
    }

    @keyframes qa-spin {
      to { transform: rotate(360deg); }
    }

    .qa-highlight {
      background: #fef3c7 !important;
      outline: 2px solid #f59e0b !important;
      outline-offset: 2px;
    }

    .qa-link-tooltip {
      position: absolute;
      background: #1f2937;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 999997;
      pointer-events: none;
      opacity: 0;
      transform: translateY(-8px);
      transition: all 0.2s;
    }

    .qa-link-tooltip.show {
      opacity: 1;
      transform: translateY(0);
    }

    .qa-link-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-top-color: #1f2937;
    }

    @media (max-width: 640px) {
      .qa-results-panel {
        width: 100%;
      }
    }
  `;

  // Inject styles
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);

  // Check if user is authenticated (from @activeset.co)
  async function checkUserAuth() {
    try {
      const response = await fetch(`${API_BASE}/api/check-auth`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        return data.email && data.email.endsWith("@activeset.co");
      }
    } catch {
      // Silent fail
    }
    return false;
  }

  // Verify token with backend
  async function verifyToken() {
    try {
      const response = await fetch(`${API_BASE}/api/verify-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  // Perform QA scan
  async function performScan() {
    const panel = document.querySelector(".qa-results-panel");
    const content = panel.querySelector(".qa-results-content");

    // Show loading state
    content.innerHTML = `
      <div class="qa-loading">
        <div class="qa-spinner"></div>
        <div>Scanning page...</div>
      </div>
    `;

    try {
      // Collect page data
      const pageData = {
        token,
        url: window.location.href,
        title: document.title,
        html: document.documentElement.outerHTML,
        images: Array.from(document.images).map((img) => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height,
        })),
        links: Array.from(document.links).map((link) => ({
          href: link.href,
          text: link.textContent.trim(),
          title: link.title,
        })),
        text: document.body.innerText,
      };

      // Send to backend for analysis
      const response = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        throw new Error("Scan failed");
      }

      const results = await response.json();
      displayResults(results);

      // Store scan in session
      setSession({
        lastScan: Date.now(),
        pageUrl: window.location.href,
      });
    } catch (error) {
      content.innerHTML = `
        <div class="qa-issue qa-error">
          Failed to perform scan. Please try again.
        </div>
      `;
    }
  }

  // Display scan results
  function displayResults(results) {
    const content = document.querySelector(".qa-results-content");

    let html = "";

    // Alt text issues
    if (results.altTextIssues && results.altTextIssues.length > 0) {
      html += `
        <div class="qa-section">
          <h3 class="qa-section-title">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
            </svg>
            Missing Alt Text (${results.altTextIssues.length})
          </h3>
          ${results.altTextIssues
            .map(
              (issue) => `
            <div class="qa-issue">
              Image: ${issue.src.split("/").pop() || "Unknown"}
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    // HTML structure recommendations
    if (results.htmlIssues && results.htmlIssues.length > 0) {
      html += `
        <div class="qa-section">
          <h3 class="qa-section-title">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
            HTML Structure Issues
          </h3>
          ${results.htmlIssues
            .map(
              (issue) => `
            <div class="qa-issue">
              ${issue.message}
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    // Spelling errors
    if (results.spellingErrors && results.spellingErrors.length > 0) {
      html += `
        <div class="qa-section">
          <h3 class="qa-section-title">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clip-rule="evenodd"/>
              <path d="M15 7h1a2 2 0 012 2v5.5a1.5 1.5 0 01-3 0V7z"/>
            </svg>
            Spelling Errors (${results.spellingErrors.length})
          </h3>
          ${results.spellingErrors
            .map(
              (error) => `
            <div class="qa-issue">
              "${error.word}" → ${error.suggestions.join(", ")}
            </div>
          `
            )
            .join("")}
        </div>
      `;

      // Highlight spelling errors on page
      highlightSpellingErrors(results.spellingErrors);
    }

    // Links
    if (results.links && results.links.length > 0) {
      html += `
        <div class="qa-section">
          <h3 class="qa-section-title">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd"/>
            </svg>
            Links Found (${results.links.length})
          </h3>
          <div class="qa-success">
            ${results.links.length} links detected and enhanced with tooltips
          </div>
        </div>
      `;

      // Add tooltips to links
      enhanceLinks();
    }

    if (!html) {
      html = `
        <div class="qa-success" style="text-align: center; padding: 40px;">
          <svg style="width: 48px; height: 48px; margin: 0 auto 16px; display: block; color: #10b981;" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <div style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">All checks passed!</div>
          <div style="color: #6b7280;">No QA issues found on this page.</div>
        </div>
      `;
    }

    content.innerHTML = html;
  }

  // Highlight spelling errors
  function highlightSpellingErrors(errors) {
    errors.forEach((error) => {
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      let node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.includes(error.word)) {
          const parent = node.parentElement;
          if (parent && !parent.classList.contains("qa-highlight")) {
            parent.classList.add("qa-highlight");
          }
        }
      }
    });
  }

  // Enhance links with tooltips
  function enhanceLinks() {
    const links = document.querySelectorAll("a[href]");
    const tooltip = document.createElement("div");
    tooltip.className = "qa-link-tooltip";
    document.body.appendChild(tooltip);

    links.forEach((link) => {
      link.addEventListener("mouseenter", (e) => {
        const rect = link.getBoundingClientRect();
        tooltip.textContent = link.href;
        tooltip.style.left = rect.left + rect.width / 2 + "px";
        tooltip.style.top = rect.top - 40 + "px";
        tooltip.classList.add("show");
      });

      link.addEventListener("mouseleave", () => {
        tooltip.classList.remove("show");
      });
    });
  }

  // Create widget UI
  function createWidget(isAuthenticated) {
    const widget = document.createElement("div");
    widget.id = WIDGET_ID;

    // Create trigger button
    const button = document.createElement("button");
    button.className = "qa-trigger-button";
    button.innerHTML = `
      <svg viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/>
      </svg>
      Run QA Check
    `;

    // Create results panel
    const panel = document.createElement("div");
    panel.className = "qa-results-panel";
    panel.innerHTML = `
      <div class="qa-results-header">
        <h2 class="qa-results-title">QA Check Results</h2>
        <button class="qa-close-button">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
      <div class="qa-results-content"></div>
    `;

    // Event handlers
    button.addEventListener("click", async () => {
      panel.classList.add("open");
      await performScan();
    });

    panel.querySelector(".qa-close-button").addEventListener("click", () => {
      panel.classList.remove("open");
    });

    widget.appendChild(button);
    document.body.appendChild(widget);
    document.body.appendChild(panel);

    // Auto-scan for non-authenticated users on first load
    if (!isAuthenticated) {
      const session = getSession();
      const shouldAutoScan =
        !session ||
        session.pageUrl !== window.location.href ||
        Date.now() - session.lastScan > 24 * 60 * 60 * 1000; // 24 hours

      if (shouldAutoScan) {
        setTimeout(async () => {
          panel.classList.add("open");
          await performScan();
        }, 1000);
      }
    }
  }

  // Initialize
  async function init() {
    // Verify token first
    const isValidToken = await verifyToken();
    if (!isValidToken) {
      console.error("QA Detector: Invalid token");
      return;
    }

    // Check authentication
    const isAuthenticated = await checkUserAuth();

    // Create widget
    createWidget(isAuthenticated);
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
