// --- Firebase Configuration ---
  const firebaseConfig = {
    apiKey: "AIzaSyCbHWUEzqGjzeanOiMG0Z5Lb4wIjWWEMUQ", // Replace with your actual API key if this is a placeholder
    authDomain: "docnest-f85e2.firebaseapp.com", // Replace with your actual auth domain
    projectId: "docnest-f85e2", // Replace with your actual project ID
    storageBucket: "docnest-f85e2.appspot.com", // Replace with your actual storage bucket
    messagingSenderId: "102395439437", // Replace with your actual sender ID
    appId: "1:102395439437:web:84e6676388b5d54395af04", // Replace with your actual App ID
    measurementId: "G-YRMBR8BVSE", // Optional: Replace with your actual Measurement ID
  };

  // --- Global Helper Functions (defined early) ---
  window.showNotification = function (
    message,
    type = "success",
    duration = 3000
  ) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.classList.add("toast", type);

    let iconHtml = "";
    if (type === "success") {
      iconHtml = `<svg class="toast-icon h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === "error") {
      iconHtml = `<svg class="toast-icon h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    } else if (type === "info") {
      iconHtml = `<svg class="toast-icon h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    }

    toast.innerHTML = `${iconHtml}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    toast.offsetHeight; // Trigger reflow

    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, duration);
  };

  window.setButtonLoading = function (
    button,
    isLoading,
    originalText = null
  ) {
    if (!(button instanceof HTMLElement)) {
      console.error(
        "setButtonLoading: button argument is not an HTMLElement",
        button
      );
      return;
    }
    const buttonTextSpan = button.querySelector(".button-text");
    if (isLoading) {
      button.disabled = true;
      if (buttonTextSpan) {
        if (
          originalText !== null &&
          typeof buttonTextSpan.dataset.originalText === "undefined"
        ) {
          buttonTextSpan.dataset.originalText = buttonTextSpan.innerHTML;
        }
        buttonTextSpan.innerHTML = `<span class="spinner"></span>Processing...`;
      } else {
        if (
          originalText !== null &&
          typeof button.dataset.originalText === "undefined"
        ) {
          button.dataset.originalText = button.innerHTML;
        }
        button.innerHTML = `<span class="spinner"></span>Processing...`;
      }
    } else {
      button.disabled = false;
      if (buttonTextSpan) {
        buttonTextSpan.innerHTML =
          buttonTextSpan.dataset.originalText || originalText || "Submit";
        delete buttonTextSpan.dataset.originalText;
      } else {
        button.innerHTML =
          button.dataset.originalText || originalText || "Submit";
        delete button.dataset.originalText;
      }
    }
  };
  // --- End Global Helper Functions ---

  // Initialize Firebase (compat version)
  let firebaseApp;
  let firebaseAuth;

  // Standard Firebase initialization. Ensure firebaseConfig.apiKey is correctly set.
  if (
    firebaseConfig.apiKey &&
    firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY_PLACEHOLDER" &&
    !firebaseConfig.apiKey.startsWith("AIzaSyC_THIS_IS_A_COMMON_PLACEHOLDER_PREFIX")
  ) {
    try {
      firebaseApp = firebase.initializeApp(firebaseConfig);
      firebaseAuth = firebase.auth();
    } catch (e) {
      console.error("Admin Panel: Error initializing Firebase:", e);
      if (window.showNotification)
        window.showNotification(
          "Critical Error: Could not initialize Firebase. Check console.",
          "error",
          10000
        );
    }
  } else {
    console.warn(
      "Admin Panel: Firebase config apiKey might be a placeholder or missing. Please update firebaseConfig."
    );
    if (window.showNotification)
      window.showNotification(
        "Firebase not configured. Admin panel may not work correctly.",
        "error",
        10000
      );
    // Potentially disable UI elements that depend on Firebase if it's not initialized
  }

  

  // --- Auth State Management ---
  const userMenuButton = document.getElementById("user-menu-button");
  const userDisplayNameSpan = document.getElementById("user-display-name");
  const userDropdownMenu = document.getElementById("user-dropdown-menu");
  const dropdownUserName = document.getElementById("dropdown-user-name");
  const dropdownUserEmail = document.getElementById("dropdown-user-email");
  const logoutButtonDropdown = document.getElementById("logout-button-dropdown");

  if (firebaseAuth) {
    // Only proceed if firebaseAuth was initialized
    firebaseAuth.onAuthStateChanged((user) => {
      if (user) {
        if (userDisplayNameSpan)
          userDisplayNameSpan.textContent =
            user.displayName || user.email.split("@")[0];
        if (dropdownUserName)
          dropdownUserName.textContent = user.displayName || "N/A";
        if (dropdownUserEmail) dropdownUserEmail.textContent = user.email;

        // Check if BASE (now BASE_API_URL) is configured before initializing panel
        if (
          BASE_API_URL &&
          !BASE_API_URL.includes("your-docnest-backend-servicename") &&
          !BASE_API_URL.includes("your-actual-cloud-run-url")
        ) {
          initializeAdminPanel();
        } else {
          console.error(
            "Admin Panel: Backend API URL is not properly configured. Halting data load."
          );
          if (window.showNotification)
            window.showNotification(
              "Backend service URL not configured. Please contact support.",
              "error",
              60000
            );
        }
      } else {
        sessionStorage.removeItem("token"); // This is consistent with login_admin.html
        if (!window.location.pathname.endsWith("login_admin.html")) {
          window.location.href = "login_admin.html";
          // The console.warn for commented out redirect can be removed if redirect is active.
        }
      }
    });
  } else {
    console.error(
      "Admin Panel: Firebase Auth is not available (likely due to config issue). Admin panel features requiring authentication will not work."
    );
    if (document.body && !window.location.pathname.endsWith("login_admin.html")) {
      if (window.showNotification)
        window.showNotification(
          "Authentication service unavailable. Please check console.",
          "error",
          10000
        );
      // Fallback redirect
      setTimeout(() => {
        if (!window.location.pathname.endsWith("login_admin.html")) {
          window.location.href = "login_admin.html";
        }
      }, 3000);
    }
  }

  async function getAuthToken() {
    if (!firebaseAuth || !firebaseAuth.currentUser) {
      console.warn(
        "Admin Panel: No current user for getAuthToken. Redirecting to login."
      );
      if (!window.location.pathname.endsWith("login_admin.html")) {
        window.location.href = "login_admin.html";
      }
      return null;
    }
    try {
      const token = await firebaseAuth.currentUser.getIdToken(true);
      sessionStorage.setItem("token", token); // Consistent with login_admin.html
      return token;
    } catch (error) {
      console.error("Admin Panel: Error getting ID token:", error);
      if (window.showNotification)
        window.showNotification(
          "Could not refresh auth token. Please log in again.",
          "error"
        );
      if (firebaseAuth)
        await firebaseAuth
          .signOut()
          .catch((e) =>
            console.error("Sign out error after token refresh failure", e)
          );
      return null; // onAuthStateChanged will handle redirect
    }
  }

 async function secureFetch(url, options = {}) {
    let token = await getAuthToken();

    // If getAuthToken() returned null but we have an active Firebase user, try one more refresh.
    // This can happen if the token expired and getAuthToken's internal refresh failed, or if currentUser was briefly unavailable.
    if (!token && firebaseAuth && firebaseAuth.currentUser) {
        try {
            token = await firebaseAuth.currentUser.getIdToken(true); // Force refresh
            sessionStorage.setItem("token", token); // Ensure it's stored
        } catch (e) {
            console.error("Admin Panel: Token refresh attempt in secureFetch failed during initial check.", e);
            // On critical refresh failure, sign out and throw to propagate.
            if (firebaseAuth) await firebaseAuth.signOut().catch(err => console.error("Sign out after refresh fail in secureFetch failed", err));
            throw new Error("Authentication token refresh failed. Please log in again.");
        }
    }

    if (!token) {
        console.error("Admin Panel: Auth token unavailable for secureFetch to " + url);
        // This case should be handled by getAuthToken's internal redirect/signout.
        // If we reach here, it implies an unusual state, so force sign out if a user is somehow still perceived.
        if (firebaseAuth && firebaseAuth.currentUser) {
            await firebaseAuth.signOut().catch(e => console.error("Sign out due to no token in secureFetch failed", e));
        }
        throw new Error("Authentication token not available. Please log in again.");
    }

    const headers = { ...options.headers };
    headers["Authorization"] = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData) && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
        headers["Content-Type"] = "application/json";
    }

    try {
        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            console.log(`Admin Panel: Received 401 for ${url}, attempting token refresh and retry...`);
            if (firebaseAuth && firebaseAuth.currentUser) {
                try {
                    const newToken = await firebaseAuth.currentUser.getIdToken(true); // Force refresh
                    sessionStorage.setItem("token", newToken);
                    headers["Authorization"] = `Bearer ${newToken}`; // Update header with the new token

                    response = await fetch(url, { ...options, headers }); // Retry the request
                } catch (refreshError) {
                    console.error("Admin Panel: Token refresh for 401 retry failed:", refreshError);
                    if (firebaseAuth) await firebaseAuth.signOut().catch(e => console.error("Sign out after 401 retry refresh fail", e));
                    throw new Error("Session expired after failed refresh. Please log in again.");
                }
            } else {
                console.warn("Admin Panel: No Firebase user for 401 token refresh. Proceeding to final 401 handling.");
            }
        }

        // --- IMPORTANT CHANGE HERE ---
        if (response.status === 403) {
            console.error(`Admin Panel: Permission denied (403) for ${url}.`);
            if(window.showNotification) window.showNotification("Access Denied: You do not have permission to perform this action.", "error", 7000);
            throw new Error(`Permission Denied (403)`); // Throw, but DO NOT SIGN OUT
        }

        if (response.status === 401) { // If it's still 401 after potential retry or initially no user for retry
            console.error(`Admin Panel: Final Authorization error (401) for ${url}.`);
            if(window.showNotification) window.showNotification("Authentication required. Your session may have expired. Please log in again.", "error", 7000);
            if (firebaseAuth) await firebaseAuth.signOut().catch(e => console.error("Sign out after final 401", e));
            throw new Error(`Authorization Failed (401)`);
        }
        // --- END IMPORTANT CHANGE ---

        // For non-auth server errors (like 500), response.ok will be false
        if (!response.ok) {
            let errorDetail = `Request failed with status ${response.status}`;
            try {
                const errorData = await response.json();
                errorDetail = errorData.detail || errorData.message || JSON.stringify(errorData);
            } catch (e) {
                try { errorDetail = await response.text(); } catch (e2) { /* keep original errorDetail */ }
            }
            console.error(`Admin Panel: HTTP error ${response.status} for ${url}. Details: ${errorDetail}`);
            throw new Error(errorDetail);
        }

        return response;
    } catch (networkOrThrownError) {
        console.error(`Admin Panel: Error in secureFetch for ${url}:`, networkOrThrownError);
        // Avoid double-notifying for auth errors that already showed a specific message
        if (!networkOrThrownError.message.toLowerCase().includes("authorization") &&
            !networkOrThrownError.message.toLowerCase().includes("authentication") &&
            !networkOrThrownError.message.toLowerCase().includes("session expired") &&
            !networkOrThrownError.message.toLowerCase().includes("permission denied")) { // Added "permission denied"
            if(window.showNotification) window.showNotification(`Network or Server Error: ${networkOrThrownError.message}.`, "error", 7000);
        }
        throw networkOrThrownError;
    }
}
  // ================================================================
  // DYNAMIC BACKEND URL CONFIGURATION
  // ================================================================
  let BASE_API_URL; // Using a more descriptive name
  const localBaseUrl = "http://localhost:8000"; // NO TRAILING SLASH

  // YOUR ACTUAL CLOUD RUN BASE URL (without any /api paths)
  const cloudRunBaseUrl = "https://docnest-780614596615.asia-south1.run.app"; // NO TRAILING SLASH

  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    BASE_API_URL = localBaseUrl;
  } else {
    BASE_API_URL = cloudRunBaseUrl;

    // Safety check for common generic placeholder strings
    if (
      cloudRunBaseUrl.includes("your-docnest-backend-servicename") ||
      cloudRunBaseUrl.includes("your-actual-cloud-run-url") ||
      cloudRunBaseUrl === "https://placeholder-url.a.run.app"
    ) {
      // Add any other placeholders you might use
      const warningMessage =
        "CRITICAL: Admin Panel Cloud Run URL (BASE_API_URL) looks like a placeholder! API calls will likely fail. Please update 'cloudRunBaseUrl' in the admin.html script.";
      console.error(warningMessage);
      if (window.showNotification) {
        window.showNotification(warningMessage, "error", 60000);
      } else {
        alert(warningMessage);
      }
      // Consider disabling UI or halting further execution
    }
  }
  // ================================================================

  let fullTreeData = [];
  let flatNodeList = [];

  // --- Theme Toggle ---
  // (Your existing theme toggle code using themeToggleButton, sunIcon, moonIcon, applyTheme is here)
  // Ensure themeToggleButton is correctly selected from DOM.
  const themeToggleButton = document.getElementById("theme-toggle-button");
  const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
  const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;


  const LIGHT_MODE_LOGO = "https://niveussolutions.com/wp-content/uploads/2025/02/Niveus-ntt-data.png";
const DARK_MODE_LOGO = "https://gitlab.niveussolutions.com/uploads/-/system/appearance/header_logo/1/Nivues_log.png";
const docnestLogo = document.getElementById('docnest-logo');

  function applyTheme(theme) {
  if (!docnestLogo) return; // Ensure logo element exists

  if (theme === "light") {
    document.body.classList.add("light-theme");
    if(themeToggleButton) themeToggleButton.innerHTML = moonIcon;
    docnestLogo.src = LIGHT_MODE_LOGO; // Set light mode logo
    localStorage.setItem("adminTheme", "light");
  } else {
    document.body.classList.remove("light-theme");
    if(themeToggleButton) themeToggleButton.innerHTML = sunIcon;
    docnestLogo.src = DARK_MODE_LOGO; // Set dark mode logo
    localStorage.setItem("adminTheme", "dark");
  }
}
  if (themeToggleButton) {
    // Check if button exists
    themeToggleButton.addEventListener("click", () =>
      applyTheme(
        document.body.classList.contains("light-theme") ? "dark" : "light"
      )
    );
    // Apply initial theme
    applyTheme(
      localStorage.getItem("adminTheme") ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "dark")
    );
  }

  function escapeJSString(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/`/g, "&#96;");
  }

  // --- Tree Search ---
  // (Your existing filterTreeDOM and its related code)
  // Ensure searchTreeInput is correctly selected.
  const searchTreeInput = document.getElementById("search-tree-input");
  if (searchTreeInput) {
    searchTreeInput.addEventListener("input", (e) =>
      filterTreeDOM(e.target.value.toLowerCase())
    );
  }
  function filterTreeDOM(searchTerm) {
    const treeElement = document.getElementById("tree");
    if (!treeElement) return;

    function checkVisibility(element, term) {
      let directMatch = false;
      const nodeName = (element.dataset.nodeName || "").toLowerCase();
      const description = (element.dataset.description || "").toLowerCase();
      if (nodeName.includes(term) || description.includes(term)) {
        directMatch = true;
      }
      let childrenMatch = false;
      if (element.classList.contains("tree-node")) {
        const childrenContainer = element.querySelector(
          ".tree-children-container"
        );
        if (childrenContainer) {
          const childrenElements = childrenContainer.children;
          for (const child of childrenElements) {
            if (
              child.classList.contains("tree-node") ||
              child.classList.contains("tree-artifact-wrapper")
            ) {
              if (checkVisibility(child, term)) {
                childrenMatch = true;
              }
            }
          }
        }
      }
      const shouldBeVisible = directMatch || childrenMatch;
      element.classList.toggle("hidden-node", !shouldBeVisible && term.length > 0);
      if (shouldBeVisible && childrenMatch && element.classList.contains("tree-node")) {
        const childrenContainer = document.getElementById(`children-${element.dataset.nodeId}`);
        if (childrenContainer && childrenContainer.classList.contains("collapsed") && term.length > 0) {
          toggleTreeNode(element.dataset.nodeId, false);
        }
      }
      return shouldBeVisible;
    }

    if (searchTerm.length === 0) {
      treeElement
        .querySelectorAll(".hidden-node")
        .forEach((el) => el.classList.remove("hidden-node"));
      return;
    }
    const topLevelNodes = Array.from(treeElement.children);
    topLevelNodes.forEach((node) => {
      if (
        node.classList.contains("tree-node") ||
        node.classList.contains("tree-artifact-wrapper")
      ) {
        checkVisibility(node, searchTerm);
      }
    });
  }

  // --- Tree and Node Dropdown Population ---
  // (Your existing generateFlatNodeList, populateNodeDropdowns, fetchTree, toggleTreeNode, renderTree, fetchNodeName)
  // IMPORTANT: Ensure all fetch calls inside these use `${BASE_API_URL}/...`
  function generateFlatNodeList(nodes, prefix = "", level = 0) {
    let list = [];
    nodes.forEach((node) => {
      const nodeType = node.type || "NODE";
      const displayName = `${"—".repeat(level)} ${node.name}`;
      if (nodeType !== "ARTIFACT") {
        list.push({ id: node.id, name: `${displayName} (Folder)`, type: "NODE" });
      }
      if (node.artifacts) {
        node.artifacts.forEach((artifact) => {
          list.push({
            id: artifact.id,
            name: `${"—".repeat(level + 1)} ${artifact.title} (File)`,
            type: "ARTIFACT",
            nodeId: artifact.id,
          });
        });
      }
      if (node.children) {
        list = list.concat(
          generateFlatNodeList(node.children, prefix + "—", level + 1)
        );
      }
    });
    return list;
  }

  function populateNodeDropdowns() {
    flatNodeList = generateFlatNodeList(fullTreeData);
    const newUserNodeSelect = document.getElementById("newUserNodeAccess");
    const modalNodeSelect = document.getElementById("modalNodeSelect");
    if (!newUserNodeSelect || !modalNodeSelect) return;
    newUserNodeSelect.length = 1;
    modalNodeSelect.length = 1;
    flatNodeList.forEach((item) => {
      const valueId = item.type === "ARTIFACT" ? item.nodeId : item.id;
      const option = new Option(item.name, valueId);
      option.dataset.type = item.type;
      try {
        newUserNodeSelect.add(option.cloneNode(true));
        modalNodeSelect.add(option);
      } catch (e) {
        console.error("Error adding option to select:", e, item);
      }
    });
  }

  async function fetchTree() {
    const treeDiv = document.getElementById("tree");
    if (treeDiv)
      treeDiv.innerHTML = `<p class="text-[var(--text-secondary)] p-2">Loading structure...</p>`;

    try {
      const res = await secureFetch(`${BASE_API_URL}/api/tree`); // USE DYNAMIC URL
      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errData = await res.json();
          errorMsg += ` - ${errData.message || errData.error || JSON.stringify(errData)}`;
        } catch (e) {
          /* ignore */
        }

        // Check if it's a database connection error
        if (errorMsg.includes("database server") || errorMsg.includes("Can't reach database")) {
          if (treeDiv)
            treeDiv.innerHTML = `
           <div class="p-4 text-center">
             <p class="text-[var(--text-red-accent)] mb-2">Database Connection Error</p>
             <p class="text-[var(--text-secondary)] text-sm">Unable to connect to the database. Please try again later.</p>
             <button onclick="fetchTree()" class="mt-3 submit-button secondary">
               <span class="button-text">Retry</span>
             </button>
           </div>`;
          if (window.showNotification)
            window.showNotification(
              "Database connection error. Please try again later.",
              "error",
              5000
            );
          return;
        }

        throw new Error(errorMsg);
      }
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("Admin Panel: Invalid tree data received:", data);
        throw new Error("Invalid tree data format received from server.");
      }
      fullTreeData = data;
      if (treeDiv) {
      treeDiv.innerHTML = ''; // Clear previous content
      treeDiv.appendChild(renderTree(fullTreeData)); // Append the new DOM fragment
    }
      populateNodeDropdowns();
    } catch (error) {
      console.error("Admin Panel: Failed to fetch tree:", error);
      if (treeDiv)
        treeDiv.innerHTML = `
         <div class="p-4 text-center">
           <p class="text-[var(--text-red-accent)] mb-2">Error Loading Structure</p>
           <p class="text-[var(--text-secondary)] text-sm">${error.message}</p>
           <button onclick="fetchTree()" class="mt-3 submit-button secondary">
             <span class="button-text">Retry</span>
           </button>
         </div>`;
      if (window.showNotification)
        window.showNotification(`Error loading folder structure: ${error.message}`, "error");
    }
  }
  window.fetchTree = fetchTree;

  // Inside your <script> tags

function toggleTreeNode(nodeId, doToggle = true) {
  const childrenContainer = document.getElementById(`children-${nodeId}`);
  const toggleIconSpan = document.getElementById(`toggle-icon-${nodeId}`); // Get the parent span
  const svgElement = toggleIconSpan ? toggleIconSpan.querySelector('svg') : null; // Get the SVG inside it

  if (childrenContainer && toggleIconSpan && svgElement) {
    let isCollapsed;

    if (doToggle) {
      isCollapsed = childrenContainer.classList.toggle("collapsed");
      // Also toggle a class on the span itself to control its SVG's rotation
      toggleIconSpan.classList.toggle("collapsed", isCollapsed);
    } else {
      // Force expand
      childrenContainer.classList.remove("collapsed");
      toggleIconSpan.classList.remove("collapsed");
      isCollapsed = false;
    }

    // The CSS rule `tree-toggle-icon.collapsed svg { transform: rotate(-90deg); }`
    // already handles this if the 'collapsed' class is present on the span.
    // So, we don't need to manually manipulate the 'rotate-0'/'rotate-[-90deg]' classes here
    // IF the CSS rule is robustly applied. Let's make sure the CSS is robust.
    // If the CSS is not picking up `transform`, directly toggle the classes on SVG.
    if (isCollapsed) {
        svgElement.classList.remove('rotate-0');
        svgElement.classList.add('rotate-[-90deg]');
    } else {
        svgElement.classList.remove('rotate-[-90deg]');
        svgElement.classList.add('rotate-0');
    }
  }
}


// REPLACE your entire existing renderTree function with this new one.

// REPLACE your entire existing renderTree function with this new, complete version.

// REPLACE your entire existing renderTree function with this new, corrected version.

// REPLACE your entire existing renderTree function with this new version.

function renderTree(nodes) {
  const fragment = document.createDocumentFragment();

  if (!Array.isArray(nodes)) {
    const errorEl = document.createElement('p');
    errorEl.className = 'text-[var(--text-red-accent)] p-2';
    errorEl.textContent = 'Invalid tree data.';
    fragment.appendChild(errorEl);
    return fragment;
  }

  nodes.forEach((n) => {
    if (!n || typeof n.id === "undefined" || typeof n.name === "undefined") {
      console.warn("Skipping invalid node in renderTree:", n);
      return;
    }

    const hasChildren = n.children && n.children.length > 0;
    const hasArtifacts = n.artifacts && n.artifacts.length > 0;
    const isExpandable = hasChildren || hasArtifacts;

    // --- Main Node Container ---
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'tree-node';
    Object.assign(nodeDiv.dataset, { nodeId: n.id, nodeName: n.name, description: n.description || "", nodeType: 'NODE' });

    // --- Node Content (the visible row) ---
    const nodeContentDiv = document.createElement('div');
    // FIX #1: Added "gap-3" class for spacing between text and actions
    nodeContentDiv.className = 'node-content group hover:bg-[var(--bg-card-hover)] rounded-md px-1 py-0.5 gap-3';

    // --- Clickable Text/Icon Area ---
    const textSpan = document.createElement('span');
    textSpan.className = 'font-medium tree-node-text cursor-pointer flex items-center min-w-0';
    textSpan.onclick = () => toggleTreeNode(n.id);

    // FIX #2: The SVG for the expand/collapse arrow is now correctly included.
    const toggleIconHTML = isExpandable
      ? `<span id="toggle-icon-${n.id}" class="tree-toggle-icon collapsed"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" /></svg></span>`
      : '<span class="tree-toggle-icon w-5 h-5 mr-1"></span>';
    
    textSpan.innerHTML = `
        ${toggleIconHTML}
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1 tree-node-icon flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
        <span class="node-display-name pr-1 whitespace-nowrap">${escapeJSString(n.name)}</span> 
        <span class="text-xs text-[var(--text-tertiary)] ml-1.5 flex-shrink-0">(ID: ${n.id})</span>
    `;

    // --- Node Actions ---
    const actionsDiv = document.createElement('div');
    // FIX #1: Removed 'ml-auto' class so icons appear right after the text.
    actionsDiv.className = 'actions opacity-0 group-hover:opacity-100 transition-opacity space-x-1 flex-shrink-0';
    
    // (Button creation logic is correct and remains the same)
    const addButton = document.createElement('button'); /* ... */
    addButton.title = 'Add item to this folder';
    addButton.className = 'action-icon-btn add';
    addButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 8V16M8 12H16" /></svg>`;
    addButton.onclick = (e) => { e.stopPropagation(); showInlineForm(n.id, addButton); };
    
    const infoButton = document.createElement('button'); /* ... */
    infoButton.title = 'Show folder info';
    infoButton.className = 'action-icon-btn';
    infoButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    infoButton.addEventListener('click', (e) => { e.stopPropagation(); showInfoDropdown(e, n.id, 'node', n.name, n.description || ""); });

    const editButton = document.createElement('button'); /* ... */
    editButton.title = 'Edit folder details';
    editButton.className = 'action-icon-btn';
    editButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`;
    editButton.addEventListener('click', (e) => { e.stopPropagation(); startEdit(n.id, 'node', n.name, n.description || ""); });

    const deleteButton = document.createElement('button'); /* ... */
    deleteButton.title = 'Delete folder';
    deleteButton.className = 'action-icon-btn delete';
    deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
    deleteButton.onclick = (e) => { e.stopPropagation(); openDeleteConfirmationModal(n.id, 'node', n.name); };
    
    actionsDiv.append(addButton, infoButton, editButton, deleteButton);
    nodeContentDiv.append(textSpan, actionsDiv);

    // --- Form & Children Containers ---
    const formDiv = document.createElement('div');
    formDiv.id = `form-${n.id}`;
    formDiv.className = 'form-inline mt-2 ml-5 p-4 bg-[var(--bg-inline-form)] rounded-lg border border-[var(--border-primary)] shadow-md';
    formDiv.style.display = 'none';

    const childrenContainer = document.createElement('div');
    childrenContainer.id = `children-${n.id}`;
    childrenContainer.className = 'tree-children-container collapsed';

    if (hasChildren) {
      childrenContainer.appendChild(renderTree(n.children));
    }

    if (hasArtifacts) {
      n.artifacts.forEach(a => {
        const artifactWrapper = document.createElement('div');
        // ... (artifact setup logic remains the same)
        artifactWrapper.className = 'tree-artifact-wrapper';
        Object.assign(artifactWrapper.dataset, { nodeId: a.id, nodeName: a.title, description: a.description || "", nodeType: "ARTIFACT", parentNodeId: n.id });

        const artifactContent = document.createElement('div');
        // FIX #1: Added "gap-3" class
        artifactContent.className = 'node-content group hover:bg-[var(--bg-card-hover)] rounded-md px-1 py-0.5 gap-3';

        const artifactText = document.createElement('span');
        artifactText.className = 'tree-artifact-text clickable flex items-center text-sm';
        artifactText.title = `View details for: ${escapeJSString(a.title)}`;
        artifactText.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2 tree-artifact-icon flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
          <span class="pr-1 whitespace-nowrap">${escapeJSString(a.title)}</span>`;
        artifactText.onclick = () => showArtifactDetailsModal(a.title, a.description, a.link);

        const artifactActions = document.createElement('div');
        // FIX #1: Removed 'ml-auto' class
        artifactActions.className = 'actions opacity-0 group-hover:opacity-100 transition-opacity space-x-1 flex-shrink-0';
        
        // (Button creation for artifacts remains the same)
        const infoBtn = document.createElement('button'); /* ... */
        infoBtn.title = 'Show file info';
        infoBtn.className = 'action-icon-btn';
        infoBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
        infoBtn.addEventListener('click', (e) => { e.stopPropagation(); showInfoDropdown(e, a.id, 'artifact', a.title, a.description || ""); });

        const editBtn = document.createElement('button'); /* ... */
        editBtn.title = 'Edit file details';
        editBtn.className = 'action-icon-btn';
        editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>`;
        editBtn.addEventListener('click', (e) => { e.stopPropagation(); startEdit(a.id, 'artifact', a.title, a.description || ""); });

        const deleteBtn = document.createElement('button'); /* ... */
        deleteBtn.title = 'Delete file';
        deleteBtn.className = 'action-icon-btn delete';
        deleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>`;
        deleteBtn.onclick = (e) => { e.stopPropagation(); openDeleteConfirmationModal(a.id, 'artifact', a.title); };
        
        artifactActions.append(infoBtn, editBtn, deleteBtn);
        artifactContent.append(artifactText, artifactActions);
        artifactWrapper.appendChild(artifactContent);
        childrenContainer.appendChild(artifactWrapper);
      });
    }

    nodeDiv.append(nodeContentDiv, formDiv, childrenContainer);
    fragment.appendChild(nodeDiv);
  });

  return fragment;
}

let currentInfoDropdown = null;

function showInfoDropdown(event, id, type, name, description) {
  event.stopPropagation(); // Prevent event bubbling

  // Remove any existing dropdown
  if (currentInfoDropdown) {
    currentInfoDropdown.remove();
    currentInfoDropdown = null;
  }

  const buttonElement = event.currentTarget; // The button that was clicked
  const rect = buttonElement.getBoundingClientRect();

  const dropdown = document.createElement('div');
  dropdown.className = 'absolute p-3 rounded-md shadow-lg z-50 border text-sm';
  dropdown.style.backgroundColor = 'var(--bg-card)';
  dropdown.style.borderColor = 'var(--border-primary)';
  dropdown.style.color = 'var(--text-primary)';
  // Position below the button, slightly offset
  dropdown.style.top = `${rect.bottom + window.scrollY + 2}px`;
  dropdown.style.left = `${rect.left + window.scrollX - 100}px`; // Adjust left offset as needed
  dropdown.style.minWidth = '250px';
  dropdown.style.maxWidth = '350px';

  // Sanitize inputs before displaying
  const safeName = escapeJSString(name);
  const safeDescription = escapeJSString(description);

  dropdown.innerHTML = `
    <div class="flex justify-between items-center mb-2">
      <h4 class="text-md font-semibold text-[var(--text-card-header)]">Item Information</h4>
      <button 
        class="modal-close-btn !text-xl !p-0" 
        onclick="this.closest('.absolute').remove(); currentInfoDropdown = null;" 
        title="Close info">
        &times;
      </button>
    </div>
    <div class="space-y-1.5">
      <p><strong>ID:</strong> <span class="font-mono text-xs">${id}</span></p>
      <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
      <p><strong>Name:</strong> ${safeName}</p>
      <p class="break-words"><strong>Description:</strong> ${safeDescription || '<em class="text-[var(--text-tertiary)]">Not provided</em>'}</p>
    </div>
  `;

  document.body.appendChild(dropdown);
  currentInfoDropdown = dropdown;

  // Click outside to close
  function clickOutsideHandler(e) {
    if (currentInfoDropdown && !currentInfoDropdown.contains(e.target) && e.target !== buttonElement) {
      currentInfoDropdown.remove();
      currentInfoDropdown = null;
      document.removeEventListener('click', clickOutsideHandler, true); // Use capture phase
    }
  }
  // Add with slight delay to avoid capturing the initial click that opened it
  setTimeout(() => {
    document.addEventListener('click', clickOutsideHandler, true);
  }, 0);
}

  async function fetchNodeName(nodeId) {
    if (!nodeId || String(nodeId).toLowerCase() === "null" || typeof nodeId === "undefined") {
      return "Global / Unspecified Node";
    }
    const localNode = flatNodeList.find((n) => String(n.id) === String(nodeId));
    if (localNode) {
      const nameMatch = localNode.name.match(/^(—*\s*)(.*)\s+\((Folder|File)\)$/);
      const cleanName = nameMatch ? nameMatch[2].trim() : localNode.name.replace(/—/g, "").trim();
      const typeSuffix = localNode.type === "NODE" ? "(Folder)" : "(File)";
      return `${cleanName} ${typeSuffix} (ID: ${nodeId})`;
    }
    console.warn(`Admin Panel: Node/Artifact ID ${nodeId} not found locally, attempting API fallback.`);
    try {
      let resNode = await secureFetch(`${BASE_API_URL}/api/nodes/${nodeId}`); // USE DYNAMIC URL
      if (resNode.ok) {
        const data = await resNode.json();
        return data.name ? `${data.name} (Folder) (ID: ${data.id})` : `Item ${nodeId}`;
      }
      // Fallback to check artifacts if not found as a node
      let resArtifact = await secureFetch(`${BASE_API_URL}/api/artifacts/${nodeId}`); // USE DYNAMIC URL
      if (resArtifact.ok) {
        const data = await resArtifact.json();
        return data.title ? `${data.title} (File) (ID: ${data.id})` : `Item ${nodeId}`;
      }
      console.warn(
        `Admin Panel: API fallback failed for ID ${nodeId} (Node: ${resNode.status}, Artifact: ${resArtifact.status}).`
      );
      return `Item ${nodeId}`;
    } catch (error) {
      console.error(`Admin Panel: Error fetching details for ID ${nodeId}:`, error);
      return `Item ${nodeId}`;
    }
  }
  // --- End Tree and Node Dropdown ---

  // --- User Management ---
  // (Your existing fetchUsers, applyUserSearchFilter, renderPaginatedUsers, deleteUser functions)
  // IMPORTANT: Ensure all fetch calls inside these use `${BASE_API_URL}/...`
  let allUsersMasterList = [];
  let currentUsersToDisplay = [];
  let displayedUserCount = 0;
  const usersPerPage = 10;
  let isLoadingUsers = false;
  const userSearchInput = document.getElementById("search-users-input");
  const userListContainer = document.getElementById("userListContainer");
  const userListElement = document.getElementById("userList");
  const userListLoadingIndicator = document.getElementById(
    "user-list-loading-indicator"
  );
  const userListInitialSpinner = document.getElementById(
    "user-list-initial-spinner"
  );
  const userListMessageArea = document.getElementById("user-list-message-area");

  function showUserListMessage(message) {
    if (
      userListMessageArea &&
      userListElement &&
      userListInitialSpinner &&
      userListLoadingIndicator
    ) {
      userListMessageArea.textContent = message;
      userListMessageArea.style.display = "block";
      userListElement.innerHTML = "";
      userListInitialSpinner.style.display = "none";
      userListLoadingIndicator.style.display = "none";
    }
  }

  function hideUserListMessage() {
    if (userListMessageArea) userListMessageArea.style.display = "none";
  }

  async function fetchUsers() {
    if (isLoadingUsers) return;
    isLoadingUsers = true;
    if (userListInitialSpinner) userListInitialSpinner.style.display = "block";
    if (userListElement) userListElement.innerHTML = "";
    hideUserListMessage();

    try {
      const res = await secureFetch(`${BASE_API_URL}/api/users`); // USE DYNAMIC URL
      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errData = await res.json();
          errorMsg += ` - ${errData.message || errData.error || JSON.stringify(errData)}`;
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorMsg);
      }
      const users = await res.json();
      if (!Array.isArray(users)) {
        throw new Error("Invalid user data received from server.");
      }
      allUsersMasterList = users.sort((a, b) => a.email.localeCompare(b.email));
      applyUserSearchFilter();
    } catch (error) {
      console.error("Admin Panel: Failed to fetch users:", error);
      if (window.showNotification)
        window.showNotification(`Error loading users: ${error.message}`, "error");
      showUserListMessage("Failed to load users. Please try again later.");
    } finally {
      isLoadingUsers = false;
      if (userListInitialSpinner) userListInitialSpinner.style.display = "none";
    }
  }
  if (userSearchInput) userSearchInput.addEventListener("input", applyUserSearchFilter);

  function applyUserSearchFilter() {
    const searchTerm = userSearchInput ? userSearchInput.value.toLowerCase().trim() : "";
    currentUsersToDisplay =
      searchTerm === "" ?
      [...allUsersMasterList] :
      allUsersMasterList.filter((user) =>
        user.email.toLowerCase().includes(searchTerm)
      );
    if (userListElement) userListElement.innerHTML = "";
    displayedUserCount = 0;
    hideUserListMessage();
    if (currentUsersToDisplay.length === 0 && allUsersMasterList.length > 0) {
      showUserListMessage(`No users found matching "${escapeJSString(searchTerm)}".`);
    } else if (
      currentUsersToDisplay.length === 0 &&
      allUsersMasterList.length === 0 &&
      !isLoadingUsers
    ) {
      // This case is tricky because fetchUsers might be loading.
      // Rely on fetchUsers to show initial "no users" or "failed to load".
    } else {
      renderPaginatedUsers();
    }
  }
  async function renderPaginatedUsers(loadMore = false) {
    if (isLoadingUsers && loadMore) return;
    const isCurrentlyPaginatingOperation = loadMore;
    if (isCurrentlyPaginatingOperation) {
      isLoadingUsers = true;
      if (userListLoadingIndicator)
        userListLoadingIndicator.style.display = "block";
    }
    const usersToRender = currentUsersToDisplay.slice(
      displayedUserCount,
      displayedUserCount + usersPerPage
    );
    if (usersToRender.length === 0 && isCurrentlyPaginatingOperation) {
      // No more to load
      isLoadingUsers = false;
      if (userListLoadingIndicator)
        userListLoadingIndicator.style.display = "none";
      return;
    }
    if (
      usersToRender.length === 0 &&
      displayedUserCount === 0 &&
      !isLoadingUsers
    ) {
      // This message is handled by applyUserSearchFilter or fetchUsers
    }

    hideUserListMessage();
    const userListPromises = usersToRender.map(async (u) => {
      let nodeAccessSummary = "No specific node roles.";
      if (u.roles && u.roles.length > 0) {
        const roleCount = u.roles.length;
        nodeAccessSummary = `Node Access: ${roleCount} specific role${roleCount > 1 ? "s" : ""}`;
      }
      return `
           <li class="user-list-item p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center gap-4">
             <div class="flex-grow min-w-0">
               <span class="font-semibold user-email-text block text-md truncate" title="${escapeJSString(u.email)}">${escapeJSString(u.email)}</span>
               <span class="text-sm user-role-text block mt-0.5">${u.role ? `Global: ${u.role}` : "No Global Role"}</span>
               <span class="user-node-role-summary block mt-1">${nodeAccessSummary}</span>
             </div>
             <div class="user-actions space-x-2 flex-shrink-0 flex items-center">
               <button class="user-action-button manage-access" title="Manage User Access" onclick="openAccessModal('${escapeJSString(u.email)}')">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 Manage Access
               </button>
               <button class="user-action-button delete-user" title="Delete User & All Access" onclick="deleteUser('${escapeJSString(u.email)}')">
                 <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                 Delete User
               </button>
             </div>
           </li>`;
    });

    try {
      const userListHtmlChunk = await Promise.all(userListPromises);
      if (userListElement)
        userListElement.insertAdjacentHTML("beforeend", userListHtmlChunk.join(""));
      displayedUserCount += usersToRender.length;
    } catch (renderError) {
      console.error("Admin Panel: Error rendering user list items:", renderError);
      showUserListMessage("Error displaying some user data.");
    }
    if (isCurrentlyPaginatingOperation) {
      isLoadingUsers = false;
      if (userListLoadingIndicator)
        userListLoadingIndicator.style.display = "none";
    }
  }
  if (userListContainer) {
    userListContainer.addEventListener("scroll", () => {
      if (isLoadingUsers) return;
      const {
        scrollTop,
        scrollHeight,
        clientHeight
      } = userListContainer;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        if (displayedUserCount < currentUsersToDisplay.length) {
          renderPaginatedUsers(true);
        }
      }
    });
  }
  async function deleteUser(email) {
    openDeleteConfirmationModal(email, "user", email);
  }
  window.deleteUser = deleteUser;
  // --- End User Management ---

  // --- Inline Form (Add item to folder) ---
  // (Your showInlineForm, toggleFileInput, toggleLinkOrUpload, submitInlineForm functions)
  // IMPORTANT: Ensure submitInlineForm uses `${BASE_API_URL}/...`
  function showInlineForm(parentId, buttonElement) {
    const form = document.getElementById(`form-${parentId}`);
    if (form) {
      const isVisible = form.style.display === "block";
      document.querySelectorAll(".form-inline").forEach((f) => {
        if (f !== form) f.style.display = "none";
      });
      form.style.display = isVisible ? "none" : "block";
      if (!isVisible) {
        // Create form if it doesn't exist
        if (!form.querySelector("form")) {
          form.innerHTML = `
             <form class="space-y-4">
               <div>
                 <label class="label-text">Name</label>
                 <input type="text" id="name-${parentId}" class="input-field" required placeholder="Enter name">
               </div>
               <div>
                 <label class="label-text">Type</label>
                 <select id="type-${parentId}" class="input-field" onchange="toggleFileInput(${parentId})">
                   <option value="FOLDER">Folder</option>
                   <option value="FILE">File</option>
                 </select>
               </div>
               <div id="file-method-options-${parentId}" style="display: none;">
                 <label class="label-text">File Source</label>
                 <select id="file-source-${parentId}" class="input-field" onchange="toggleLinkOrUpload(${parentId})">
                   <option value="link">Link</option>
                   <option value="upload">Upload</option>
                 </select>
               </div>
               <div id="link-input-container-${parentId}" style="display: none;">
                 <label class="label-text">Link URL</label>
                 <input type="url" id="link-${parentId}" class="input-field" placeholder="https://...">
               </div>
               <div id="upload-input-container-${parentId}" style="display: none;">
                 <label class="label-text">Upload File</label>
                 <input type="file" id="file-upload-${parentId}" class="input-field">
               </div>
               <div>
                 <label class="label-text">Description</label>
                 <textarea id="description-${parentId}" class="input-field" placeholder="Enter description"></textarea>
               </div>
               <div class="flex justify-end gap-2">
                 <button type="button" class="submit-button secondary" onclick="showInlineForm(${parentId})">Cancel</button>
                 <button type="submit" class="submit-button">
                   <span class="button-text">Add Item</span>
                 </button>
               </div>
             </form>`;

          // Add form submit event listener
          const formElement = form.querySelector("form");
          if (formElement) {
            formElement.addEventListener("submit", async (e) => {
              e.preventDefault();
              await submitInlineForm(parentId, e.target.querySelector('button[type="submit"]'));
            });
          }
        }
        form.querySelector('input[type="text"], select')?.focus();
        toggleFileInput(parentId);
      }
    }
  }
  window.showInlineForm = showInlineForm;

  function toggleFileInput(parentId) {
    const typeSelect = document.getElementById(`type-${parentId}`);
    const fileMethodOptionsDiv = document.getElementById(
      `file-method-options-${parentId}`
    );
    const descriptionTextarea = document.getElementById(`description-${parentId}`);
    const fileInput = document.getElementById(`file-upload-${parentId}`);
    const linkInput = document.getElementById(`link-${parentId}`);

    if (!typeSelect || !fileMethodOptionsDiv || !descriptionTextarea) return;

    if (typeSelect.value === "FILE") {
      fileMethodOptionsDiv.style.display = "block";
      descriptionTextarea.placeholder = "Description (Optional for File)";
      const fileSourceSelect = document.getElementById(`file-source-${parentId}`);
      if (fileSourceSelect) fileSourceSelect.value = "link";
      toggleLinkOrUpload(parentId);
    } else {
      fileMethodOptionsDiv.style.display = "none";
      descriptionTextarea.placeholder = "Description (Optional for Folder)";
      if (fileInput) fileInput.value = "";
      if (linkInput) linkInput.value = "";
    }
  }

  window.toggleFileInput= toggleFileInput;

  function toggleLinkOrUpload(parentId) {
    const fileSourceSelect = document.getElementById(`file-source-${parentId}`);
    const linkInputContainer = document.getElementById(
      `link-input-container-${parentId}`
    );
    const uploadInputContainer = document.getElementById(
      `upload-input-container-${parentId}`
    );
    const fileInput = document.getElementById(`file-upload-${parentId}`);
    const linkInput = document.getElementById(`link-${parentId}`);

    if (!fileSourceSelect || !linkInputContainer || !uploadInputContainer) return;

    const fileSource = fileSourceSelect.value;
    linkInputContainer.style.display = fileSource === "link" ? "block" : "none";
    uploadInputContainer.style.display = fileSource === "upload" ? "block" : "none";
    if (fileSource === "link" && fileInput) fileInput.value = "";
    if (fileSource === "upload" && linkInput) linkInput.value = "";
  }
  window.toggleLinkOrUpload = toggleLinkOrUpload;

  async function submitInlineForm(parentId, submitButton) {
    const name = document.getElementById(`name-${parentId}`).value;
    const type = document.getElementById(`type-${parentId}`).value;
    const description = document.getElementById(`description-${parentId}`).value;
    const fileSource = document.getElementById(`file-source-${parentId}`).value;
    const link = document.getElementById(`link-${parentId}`).value;
    const fileUpload = document.getElementById(`file-upload-${parentId}`).files[0];

    if (!name) {
      if (window.showNotification) window.showNotification("Please enter a name", "error");
      return;
    }

    if (type === "FILE") {
      if (fileSource === "link" && !link) {
        if (window.showNotification)
          window.showNotification("Please enter a link URL", "error");
        return;
      }
      if (fileSource === "upload" && !fileUpload) {
        if (window.showNotification)
          window.showNotification("Please select a file to upload", "error");
        return;
      }
    }

    const originalButtonText =
      submitButton.querySelector(".button-text")?.textContent ||
      submitButton.textContent;
    window.setButtonLoading(submitButton, true, originalButtonText);

    try {
      if (type === "FOLDER") {
        const response = await secureFetch(`${BASE_API_URL}/api/nodes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            type: "FOLDER",
            description,
            parentId: parseInt(parentId),
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: response.statusText
          }));
          throw new Error(
            `Failed to create folder: ${errorData.message || errorData.detail || response.statusText}`
          );
        }

        if (window.showNotification)
          window.showNotification("Folder created successfully! ✅", "success");
        await fetchTree(); // Refresh the tree
        await fetchActivity(); // Update activity log
      } else {
        // Handle file creation
        const formData = new FormData();
        formData.append("title", name);
        formData.append("description", description);
        formData.append("nodeId", String(parentId));

        if (fileSource === "link") {
          formData.append("link", link);
          const response = await secureFetch(`${BASE_API_URL}/api/artifacts`, {
            method: "POST",
            body: JSON.stringify({
              title: name,
              description,
              link,
              nodeId: parseInt(parentId),
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: response.statusText
            }));
            throw new Error(
              `Failed to create file: ${errorData.message || errorData.detail || response.statusText}`
            );
          }
        } else if (fileUpload) {
          formData.append("file", fileUpload);
          const response = await secureFetch(`${BASE_API_URL}/api/upload`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              message: response.statusText
            }));
            throw new Error(
              `Failed to upload file: ${errorData.message || errorData.detail || response.statusText}`
            );
          }
        }

        if (window.showNotification)
          window.showNotification("File created successfully! ✅", "success");
        await fetchTree(); // Refresh the tree
        await fetchActivity(); // Update activity log
      }

      // Reset and hide the form
      const formElement = document.getElementById(`form-${parentId}`);
      if (formElement) {
        const innerForm = formElement.querySelector("form");
        if (innerForm) innerForm.reset();
        toggleFileInput(parentId);
        formElement.style.display = "none";
      }
    } catch (error) {
      console.error("Error creating item:", error);
      if (window.showNotification)
        window.showNotification(`Error: ${error.message}`, "error");
    } finally {
      window.setButtonLoading(submitButton, false, originalButtonText);
    }
  }
  // --- End Inline Form ---

  // --- Delete Confirmation Modal ---
  // (Your openDeleteConfirmationModal, closeDeleteConfirmationModal, and event listeners)
  // IMPORTANT: Ensure confirmDeleteButton listener uses `${BASE_API_URL}/...`
  const deleteConfirmationModal = document.getElementById(
    "delete-confirmation-modal"
  );
  const deleteModalTitle = document.getElementById("delete-modal-title");
  const deleteModalMessage = document.getElementById("delete-modal-message");
  const deleteConfirmInput = document.getElementById("delete-confirm-input");
  const confirmDeleteButton = document.getElementById("confirm-delete-button");
  let itemToDelete = {
    id: null,
    type: null,
    name: ""
  };

  function openDeleteConfirmationModal(itemId, itemType, itemName) {
    itemToDelete = {
      id: itemId,
      type: itemType,
      name: itemName
    };
    if (deleteModalTitle)
      deleteModalTitle.textContent = `Confirm Deletion: ${escapeJSString(itemName)}`;

    let message = `Are you sure you want to delete the ${itemType} "${escapeJSString(itemName)}"?`;
    if (itemType === "node")
      message += " All its contents (subfolders and files) will also be deleted.";
    if (itemType === "user") message += " All associated access roles will be removed.";
    message += " This action cannot be undone.";
    if (deleteModalMessage) deleteModalMessage.textContent = message;

    if (deleteConfirmInput) deleteConfirmInput.value = "";
    if (confirmDeleteButton) confirmDeleteButton.disabled = true;
    if (deleteConfirmationModal) deleteConfirmationModal.classList.add("active");
    if (deleteConfirmInput) deleteConfirmInput.focus();
  }
  function closeDeleteConfirmationModal() {
    if (deleteConfirmationModal)
      deleteConfirmationModal.classList.remove("active");
  }
  window.closeDeleteConfirmationModal = closeDeleteConfirmationModal;

  if (deleteConfirmInput && confirmDeleteButton) {
    deleteConfirmInput.addEventListener("input", () => {
      confirmDeleteButton.disabled =
        deleteConfirmInput.value.trim().toLowerCase() !== "delete";
    });
    confirmDeleteButton.addEventListener("click", async () => {
      if (
        deleteConfirmInput.value.trim().toLowerCase() !== "delete" ||
        !itemToDelete.id
      ) {
        if (window.showNotification)
          window.showNotification("Deletion not confirmed correctly.", "error");
        return;
      }
      const originalButtonText =
        confirmDeleteButton.querySelector(".button-text")?.textContent ||
        confirmDeleteButton.textContent;
      window.setButtonLoading(confirmDeleteButton, true, originalButtonText);
      try {
        let endpoint;
        if (itemToDelete.type === "node")
          endpoint = `${BASE_API_URL}/api/nodes/${itemToDelete.id}`; // USE DYNAMIC URL
        else if (itemToDelete.type === "artifact")
          endpoint = `${BASE_API_URL}/api/artifacts/${itemToDelete.id}`; // USE DYNAMIC URL
        else if (itemToDelete.type === "user")
          endpoint = `${BASE_API_URL}/api/users/${itemToDelete.id}`; // USE DYNAMIC URL
        else throw new Error("Invalid item type for deletion.");

        const response = await secureFetch(endpoint, {
          method: "DELETE"
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: `Request failed with status ${response.status}`
          }));
          throw new Error(
            `Failed to delete: ${errorData.message || errorData.detail || response.statusText}`
          );
        }
        const itemTypeDisplay =
          itemToDelete.type.charAt(0).toUpperCase() + itemToDelete.type.slice(1);
        if (window.showNotification)
          window.showNotification(
            `${itemTypeDisplay} "${escapeJSString(itemToDelete.name)}" deleted. ✅`,
            "success"
          );

        if (itemToDelete.type === "user") {
          await fetchUsers();
          await fetchActivity();
        } else {
          await fetchTree();
          await fetchActivity();
        }
        closeDeleteConfirmationModal();
      } catch (error) {
        console.error(`Admin Panel: Error deleting ${itemToDelete.type}:`, error);
        if (window.showNotification)
          window.showNotification(`Error deleting: ${error.message}`, "error");
      } finally {
        window.setButtonLoading(confirmDeleteButton, false, originalButtonText);
      }
    });
  }
  // --- End Delete Modal ---

  // --- Root Folder Prompt ---
  // (Your promptNewRoot function)
  // IMPORTANT: Ensure it uses `${BASE_API_URL}/...`
  async function promptNewRoot() {
    const name = prompt("Enter new root folder name (e.g., Vertical name):");
    if (!name?.trim()) return;
    try {
      const response = await secureFetch(`${BASE_API_URL}/api/nodes`, {
        // USE DYNAMIC URL
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          type: "VERTICAL",
          parentId: null,
          description: "Root Vertical Folder",
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(
          `Failed: ${err.message || err.detail || response.statusText}`
        );
      }
      if (window.showNotification)
        window.showNotification("New root folder created! ✅", "success");
      await fetchTree();
      await fetchActivity();
    } catch (error) {
      console.error("Admin Panel: Error creating new root:", error);
      if (window.showNotification)
        window.showNotification(`Error: ${error.message}`, "error");
    }
  }
  window.promptNewRoot = promptNewRoot;

  // --- End Root Folder ---

  // --- Add User Form ---
  // (Your addUserForm event listener)
  // IMPORTANT: Ensure all fetch calls use `${BASE_API_URL}/...`
  const addUserFormElement = document.getElementById("addUserForm");
  if (addUserFormElement) {
    addUserFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const submitButton = e.target.querySelector('button[type="submit"]');
      const originalButtonText =
        submitButton.querySelector(".button-text")?.textContent ||
        submitButton.textContent;
      window.setButtonLoading(submitButton, true, originalButtonText);

      const emailInput = document.getElementById("newUserEmail");
      const globalRoleSelect = document.getElementById("newUserRole");
      const nodeAccessSelect = document.getElementById("newUserNodeAccess");
      const nodeRoleSelect = document.getElementById("newUserNodeRole");
      const applyGlobalCheckbox = document.getElementById(
        "applyGlobalRoleToAllNodesCheckbox"
      );

      const email = emailInput.value.trim();
      const globalRole = globalRoleSelect.value;
      const selectedNodeIdForAccess = nodeAccessSelect.value;
      const selectedNodeRoleForAccess = nodeRoleSelect.value;
      const applyGlobalToAllNodes = applyGlobalCheckbox.checked;

      if (!email || !globalRole) {
        if (window.showNotification)
          window.showNotification("Email and Global Role are required.", "error");
        window.setButtonLoading(submitButton, false, originalButtonText);
        if (!email) emailInput.focus();
        else globalRoleSelect.focus();
        return;
      }
      if (selectedNodeIdForAccess && applyGlobalToAllNodes) {
        if (window.showNotification)
          window.showNotification(
            "Cannot select both a specific node and 'Apply global role to all nodes'.",
            "error",
            6000
          );
        window.setButtonLoading(submitButton, false, originalButtonText);
        nodeAccessSelect.focus();
        return;
      }

      let overallSuccessMessage = "";
      let operationFailed = false;

      try {
        let userCreationResponse = await secureFetch(`${BASE_API_URL}/api/users`, {
          // USE DYNAMIC URL
          method: "POST",
          body: JSON.stringify({
            email,
            role: globalRole
          }),
        });

        if (!userCreationResponse.ok) {
          const errorData = await userCreationResponse.json().catch(() => ({
            message: userCreationResponse.statusText
          }));
          if (userCreationResponse.status === 409) {
            if (
              confirm(
                `User ${email} already exists. Update global role to ${globalRole}?`
              )
            ) {
              userCreationResponse = await secureFetch(
                `${BASE_API_URL}/api/users/${email}`, {
                  // USE DYNAMIC URL
                  method: "PUT",
                  body: JSON.stringify({
                    role: globalRole
                  }),
                }
              );
              if (!userCreationResponse.ok) {
                const updateErrorData = await userCreationResponse.json().catch(() => ({
                  message: userCreationResponse.statusText
                }));
                throw new Error(
                  `Failed to update user: ${updateErrorData.message || updateErrorData.detail || userCreationResponse.statusText}`
                );
              }
              overallSuccessMessage = `User's global role updated. `;
            } else {
              throw new Error("User addition cancelled (already exists).");
            }
          } else {
            throw new Error(
              `Failed to add user: ${errorData.message || errorData.detail || userCreationResponse.statusText}`
            );
          }
        } else {
          overallSuccessMessage = "User added successfully! ✅ ";
        }

        if (selectedNodeIdForAccess) {
          const accessResponse = await secureFetch(`${BASE_API_URL}/api/access`, {
            // USE DYNAMIC URL
            method: "PUT",
            body: JSON.stringify({
              email,
              nodeId: parseInt(selectedNodeIdForAccess),
              role: selectedNodeRoleForAccess,
            }),
          });
          if (!accessResponse.ok) {
            const errorData = await accessResponse.json().catch(() => ({
              message: accessResponse.statusText
            }));
            overallSuccessMessage += `\n⚠️ Node access grant failed: ${errorData.message || errorData.detail || accessResponse.statusText}`;
            operationFailed = true;
          } else {
            overallSuccessMessage += ` Initial node access granted.`;
          }
        } else if (applyGlobalToAllNodes) {
          if (window.showNotification)
            window.showNotification(
              `Applying '${globalRole}' to all nodes for ${email}. This may take time...`,
              "info",
              8000
            );
          if (!flatNodeList || flatNodeList.length === 0) {
            overallSuccessMessage += "\n⚠️ No nodes found to apply global role.";
            operationFailed = true;
          } else {
            let nodesProcessedCount = 0,
              nodesFailedCount = 0;
            for (const item of flatNodeList) {
              try {
                const nodeAccessResponse = await secureFetch(
                  `${BASE_API_URL}/api/access`, {
                    // USE DYNAMIC URL
                    method: "PUT",
                    body: JSON.stringify({
                      email,
                      nodeId: parseInt(item.id),
                      role: globalRole
                    }),
                  }
                );
                if (nodeAccessResponse.ok) nodesProcessedCount++;
                else nodesFailedCount++;
              } catch (loopErr) {
                nodesFailedCount++;
                console.error(`Error applying role to item ${item.id}:`, loopErr);
              }
            }
            if (nodesFailedCount > 0) {
              overallSuccessMessage += `\n⚠️ Applied to ${nodesProcessedCount}, failed for ${nodesFailedCount}.`;
              operationFailed = true;
            } else {
              overallSuccessMessage += `\nApplied to all ${nodesProcessedCount} items.`;
            }
          }
        }
        if (window.showNotification)
          window.showNotification(
            overallSuccessMessage,
            operationFailed ? "error" : "success",
            operationFailed ? 8000 : 5000
          );
        await fetchUsers();
        await fetchActivity();
        e.target.reset();
        if (applyGlobalCheckbox) applyGlobalCheckbox.checked = false;
      } catch (error) {
        console.error("Admin Panel: Error in add user process:", error);
        if (window.showNotification)
          window.showNotification(`Error: ${error.message}`, "error", 6000);
      } finally {
        window.setButtonLoading(submitButton, false, originalButtonText);
      }
    });
  }
  // --- End Add User ---

  // --- Access Management Modal ---
  // (Your openAccessModal, closeAccessModal, loadUserAccessRolesForModal, updateNodeAccessInModal, revokeNodeAccessInModal, grantNewAccessForm submit listener)
  // IMPORTANT: Ensure all fetch calls use `${BASE_API_URL}/...`
  const accessModal = document.getElementById("access-management-modal");
  const modalUserEmailSpan = document.getElementById("modal-user-email");
  const modalCurrentAccessDiv = document.getElementById(
    "access-management-modal-current-access"
  );
  const modalEditingUserEmailHidden = document.getElementById(
    "modal-editing-user-email-hidden"
  );

  async function openAccessModal(email) {
    if (modalUserEmailSpan) modalUserEmailSpan.textContent = email;
    if (modalEditingUserEmailHidden) modalEditingUserEmailHidden.value = email;
    const modalNodeSelect = document.getElementById("modalNodeSelect");
    if (modalNodeSelect) modalNodeSelect.value = "";
    if (accessModal) accessModal.classList.add("active");
    await loadUserAccessRolesForModal(email);
  }
  window.openAccessModal = openAccessModal;

  function closeAccessModal() {
    if (accessModal) accessModal.classList.remove("active");
    if (modalCurrentAccessDiv)
      modalCurrentAccessDiv.innerHTML = `<p class="text-[var(--text-tertiary)] p-3">Loading access...</p>`;
  }
  window.closeAccessModal = closeAccessModal;

  async function loadUserAccessRolesForModal(email) {
    if (!modalCurrentAccessDiv) return;
    modalCurrentAccessDiv.innerHTML = `<div class="flex justify-center items-center p-4"><div class="spinner" style="border-color: var(--text-primary); border-top-color: transparent;"></div><span class="ml-2 text-[var(--text-secondary)]">Loading roles...</span></div>`;
    try {
      const res = await secureFetch(`${BASE_API_URL}/api/users/${email}`); // USE DYNAMIC URL
      if (!res.ok) {
        const errData = await res.json().catch(() => ({
          message: `User ${email} roles load failed.`
        }));
        throw new Error(errData.message || `HTTP error ${res.status}`);
      }
      const user = await res.json();
      if (!user || !user.roles || user.roles.length === 0) {
        modalCurrentAccessDiv.innerHTML = `<p class="text-[var(--text-tertiary)] p-3">No specific node/file access granted.</p>`;
        return;
      }
      const items = await Promise.all(
        user.roles.map(async (role) => {
          const nodeName = await fetchNodeName(role.nodeId);
          const safeEmail = escapeJSString(email);
          const roleSelectHTML = `
              <select class="input-field text-xs py-1 px-2 w-auto bg-[var(--bg-input)] border-[var(--border-input)]"
                      data-node-id="${role.nodeId}" data-original-role="${role.role}"
                      onchange="updateNodeAccessInModal(this, '${safeEmail}', ${role.nodeId})">
                    <option value="ADMIN" ${role.role === "ADMIN" ? "selected" : ""}>ADMIN</option>
                    <option value="EDITOR" ${role.role === "EDITOR" ? "selected" : ""}>EDITOR</option>
                    <option value="VIEWER" ${role.role === "VIEWER" ? "selected" : ""}>VIEWER</option>
              </select>`;
          const revokeButtonHTML = `
              <button class="action-icon-btn delete text-sm" title="Revoke Access" onclick="revokeNodeAccessInModal('${safeEmail}', ${role.nodeId})">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>`;
          return `<div class="access-item flex justify-between items-center p-2.5 border-b border-[var(--border-primary)] last:border-b-0">
                            <div><span class="font-medium text-[var(--text-primary)] text-sm">${escapeJSString(nodeName)}</span></div>
                            <div class="flex items-center gap-2">${roleSelectHTML}${revokeButtonHTML}</div>
                        </div>`;
        })
      );
      modalCurrentAccessDiv.innerHTML = items.join("");
    } catch (error) {
      console.error("Admin Panel: Error loading user access for modal:", error);
      modalCurrentAccessDiv.innerHTML = `<p class="text-[var(--text-red-accent)] p-3">Error loading roles: ${error.message}</p>`;
    }
  }

  async function updateNodeAccessInModal(selectElement, email, nodeId) {
    const newRole = selectElement.value;
    const originalRole = selectElement.dataset.originalRole;
    if (newRole === originalRole) return;
    selectElement.disabled = true;
    selectElement.style.opacity = "0.7";
    try {
      const response = await secureFetch(`${BASE_API_URL}/api/access`, {
        // USE DYNAMIC URL
        method: "PUT",
        body: JSON.stringify({
          email,
          nodeId,
          role: newRole
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(`Failed: ${err.message || err.detail || response.statusText}`);
      }
      if (window.showNotification)
        window.showNotification("Access updated! ✅", "success");
      selectElement.dataset.originalRole = newRole;
      await fetchUsers();
      await fetchActivity();
    } catch (error) {
      console.error("Admin Panel: Error updating access:", error);
      if (window.showNotification)
        window.showNotification(`Error updating access: ${error.message}`, "error");
      selectElement.value = originalRole;
    } finally {
      selectElement.disabled = false;
      selectElement.style.opacity = "1";
    }
  }
  window.updateNodeAccessInModal = updateNodeAccessInModal;

  async function revokeNodeAccessInModal(email, nodeId) {
    const nodeName = await fetchNodeName(nodeId);
    if (!confirm(`Revoke access for ${email} from "${escapeJSString(nodeName)}"?`))
      return;
    const revokeButton = event.target.closest("button");
    if (revokeButton) revokeButton.disabled = true;
    try {
      const response = await secureFetch(`${BASE_API_URL}/api/access`, {
        // USE DYNAMIC URL
        method: "DELETE",
        body: JSON.stringify({
          email,
          nodeId
        }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({
          message: response.statusText
        }));
        throw new Error(`Failed: ${err.message || err.detail || response.statusText}`);
      }
      if (window.showNotification)
        window.showNotification("Access revoked! ✅", "success");
      const accessItemDiv = revokeButton.closest(".access-item");
      if (accessItemDiv) {
        accessItemDiv.style.transition = "opacity 0.3s ease";
        accessItemDiv.style.opacity = "0";
        setTimeout(() => {
          accessItemDiv.remove();
          if (modalCurrentAccessDiv && modalCurrentAccessDiv.children.length === 0) {
            modalCurrentAccessDiv.innerHTML = `<p class="text-[var(--text-tertiary)] p-3">No specific node/file access granted.</p>`;
          }
        }, 300);
      } else {
        await loadUserAccessRolesForModal(email);
      }
      await fetchUsers();
      await fetchActivity();
    } catch (error) {
      console.error("Admin Panel: Error revoking access:", error);
      if (window.showNotification)
        window.showNotification(`Error revoking access: ${error.message}`, "error");
      if (revokeButton) revokeButton.disabled = false;
    }
  }
  window.revokeNodeAccessInModal = revokeNodeAccessInModal;
  
  const grantNewAccessFormElement = document.getElementById("grantNewAccessForm");
  if (grantNewAccessFormElement) {
    grantNewAccessFormElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = e.target.querySelector('button[type="submit"]');
      const originalText =
        btn.querySelector(".button-text")?.textContent || btn.textContent;
      window.setButtonLoading(btn, true, originalText);

      const email = modalEditingUserEmailHidden.value;
      const nodeIdSelect = document.getElementById("modalNodeSelect");
      const roleSelect = document.getElementById("modalNodeRoleSelect");
      const nodeId = nodeIdSelect.value;
      const role = roleSelect.value;

      if (!email || !nodeId || !role) {
        if (window.showNotification)
          window.showNotification(
            "Please select a folder/file and assign a role.",
            "error"
          );
        window.setButtonLoading(btn, false, originalText);
        if (!nodeId) nodeIdSelect.focus();
        else roleSelect.focus();
        return;
      }
      try {
        const response = await secureFetch(`${BASE_API_URL}/api/access`, {
          // USE DYNAMIC URL
          method: "PUT",
          body: JSON.stringify({
            email,
            nodeId: parseInt(nodeId),
            role
          }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({
            message: response.statusText
          }));
          throw new Error(`Failed: ${err.message || err.detail || response.statusText}`);
        }
        if (window.showNotification)
          window.showNotification("Access granted successfully! ✅", "success");
        await loadUserAccessRolesForModal(email);
        await fetchUsers();
        await fetchActivity();
        e.target.reset();
        nodeIdSelect.value = "";
      } catch (error) {
        console.error("Admin Panel: Error granting new access:", error);
        if (window.showNotification)
          window.showNotification(`Error granting access: ${error.message}`, "error");
      } finally {
        window.setButtonLoading(btn, false, originalText);
      }
    });
  }
  // --- End Access Modal ---

  // --- Artifact Details Modal Logic ---
  // (Your showArtifactDetailsModal and closeArtifactDetailsModal functions)
  const artifactDetailsModalEl = document.getElementById("artifact-details-modal");
  function showArtifactDetailsModal(title, description, link) {
    const titleEl = document.getElementById("artifact-modal-title");
    const descEl = document.getElementById("artifact-details-modal-description");
    const linkEl = document.getElementById("artifact-modal-link");
    if (!artifactDetailsModalEl || !titleEl || !descEl || !linkEl) {
      console.error("Admin Panel: Artifact modal elements not found.");
      return;
    }
    titleEl.textContent = title || "Artifact Details";
    descEl.innerHTML = description ?
      escapeJSString(description).replace(/\n/g, "<br>") :
      "<em>No description provided.</em>";
    let pLink = link || "#";
    if (pLink && pLink !== "#" && !pLink.match(/^(https?:\/\/|mailto:|tel:)/i)) {
      if (!pLink.includes(".") || pLink.startsWith("/")) {
        console.warn("Admin Panel: Potentially invalid link format in artifact modal:", pLink);
      } else {
        pLink = `https://${pLink}`;
      }
    }
    linkEl.href = pLink;
    if (!link || link === "#") {
      linkEl.classList.add("opacity-50", "cursor-not-allowed");
      linkEl.removeAttribute("target");
      linkEl.onclick = (ev) => ev.preventDefault();
      linkEl.title = "No link provided";
    } else {
      linkEl.classList.remove("opacity-50", "cursor-not-allowed");
      linkEl.setAttribute("target", "_blank");
      linkEl.onclick = null;
      linkEl.title = `Go to: ${pLink}`;
    }
    artifactDetailsModalEl.classList.add("active");
  }
  function closeArtifactDetailsModal() {
    if (artifactDetailsModalEl) artifactDetailsModalEl.classList.remove("active");
  }
  window.closeArtifactDetailsModal = closeArtifactDetailsModal;
  // --- End Artifact Modal ---

  // --- User Menu Dropdown Logic ---
  // (Your existing user menu dropdown logic)
  if (userMenuButton && userDropdownMenu) {
    userMenuButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const isExpanded = userMenuButton.getAttribute("aria-expanded") === "true" || false;
      userMenuButton.setAttribute("aria-expanded", !isExpanded);
      userDropdownMenu.classList.toggle("hidden");
    });
    document.addEventListener("click", (event) => {
      if (
        userMenuButton &&
        userDropdownMenu &&
        !userMenuButton.contains(event.target) &&
        !userDropdownMenu.contains(event.target)
      ) {
        userDropdownMenu.classList.add("hidden");
        userMenuButton.setAttribute("aria-expanded", "false");
      }
    });
  }
  if (logoutButtonDropdown && firebaseAuth) {
    logoutButtonDropdown.addEventListener("click", async () => {
      try {
        await firebaseAuth.signOut();
        sessionStorage.removeItem("token"); // Consistent token name
        if (window.showNotification)
          window.showNotification("Logged out successfully.", "success");
        // onAuthStateChanged will handle the redirect
        if (userDropdownMenu) userDropdownMenu.classList.add("hidden");
        if (userMenuButton) userMenuButton.setAttribute("aria-expanded", "false");
      } catch (error) {
        console.error("Admin Panel: Error signing out:", error);
        if (window.showNotification)
          window.showNotification("Logout failed. Please try again.", "error");
      }
    });
  }
  // --- End User Menu ---

  // --- Initialization ---
  function initializeAdminPanel() {
    if (firebaseAuth && firebaseAuth.currentUser) {
      fetchTree();
      fetchUsers();
      fetchActivity();
    } else {
      const treeDiv = document.getElementById("tree");
      if (treeDiv)
        treeDiv.innerHTML = `<p class="text-[var(--text-tertiary)] p-3 text-center">Please log in to view structure.</p>`;
      if (userListContainer) showUserListMessage("Please log in to view users.");
      // Activity log will also show its initial message or error from fetchActivity
    }
  }
  // --- End Initialization ---

  // --- Global Event Listeners ---
  // (Your existing keydown listener for Escape key)
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (accessModal?.classList.contains("active")) closeAccessModal();
      if (artifactDetailsModalEl?.classList.contains("active"))
        closeArtifactDetailsModal();
      const deleteModal = document.getElementById("delete-confirmation-modal");
      if (deleteModal?.classList.contains("active")) closeDeleteConfirmationModal();

      document.querySelectorAll(".form-inline").forEach((form) => {
        if (form.style.display === "block") form.style.display = "none";
      });
      if (userDropdownMenu && !userDropdownMenu.classList.contains("hidden")) {
        userDropdownMenu.classList.add("hidden");
        if (userMenuButton) userMenuButton.setAttribute("aria-expanded", "false");
      }
    }
  });
  // --- End Global Event Listeners ---

  // --- Activity Log ---
  // (Your existing Activity Log functions: showActivityListMessage, hideActivityListMessage, fetchActivity, renderActivity)
  // IMPORTANT: Ensure fetchActivity uses `${BASE_API_URL}/...`
  const activityListElement = document.getElementById("activityList");
  const activityListInitialSpinnerElement = document.getElementById(
    "activity-list-initial-spinner"
  ); // Renamed for clarity
  const activityListMessageAreaElement = document.getElementById(
    "activity-list-message-area"
  ); // Renamed
  let isLoadingActivity = false;

  function showActivityListMessage(message) {
    if (
      activityListMessageAreaElement &&
      activityListElement &&
      activityListInitialSpinnerElement
    ) {
      activityListMessageAreaElement.textContent = message;
      activityListMessageAreaElement.style.display = "block";
      activityListElement.innerHTML = "";
      activityListInitialSpinnerElement.style.display = "none";
    }
  }

  function hideActivityListMessage() {
    if (activityListMessageAreaElement && activityListInitialSpinnerElement) {
      activityListMessageAreaElement.style.display = "none";
      activityListInitialSpinnerElement.style.display = "none";
    }
  }

  async function fetchActivity(manualRefresh = false) {
    if (isLoadingActivity && !manualRefresh) return;
    isLoadingActivity = true;

    if (activityListInitialSpinnerElement)
      activityListInitialSpinnerElement.style.display = "block";
    if (activityListElement) activityListElement.innerHTML = "";
    hideActivityListMessage();

    try {
      const res = await secureFetch(`${BASE_API_URL}/api/activity`); // USE DYNAMIC URL
      if (!res.ok) {
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const errData = await res.json();
          errorMsg += ` - ${errData.message || errData.error || JSON.stringify(errData)}`;
        } catch (e) {
          /* ignore */
        }
        throw new Error(errorMsg);
      }
      const activities = await res.json();
      if (!Array.isArray(activities)) {
        throw new Error("Invalid activity data received from server.");
      }
      renderActivity(activities);
      if (activities.length === 0) {
        showActivityListMessage("No recent activity found.");
      }
    } catch (error) {
      console.error("Admin Panel: Failed to fetch activity:", error);
      if (window.showNotification)
        window.showNotification(`Error loading activity: ${error.message}`, "error");
      showActivityListMessage("Failed to load activity. Please try again later.");
    } finally {
      isLoadingActivity = false;
      if (activityListInitialSpinnerElement)
        activityListInitialSpinnerElement.style.display = "none";
    }
  }

  window.fetchActivity = fetchActivity;

  function renderActivity(activities) {
    if (!activityListElement) return;
    activityListElement.innerHTML = "";

    if (activities.length === 0) {
      // Message handled by caller
      return;
    }
    const activityItemsHTML = activities
      .map((activity) => {
        const messageContent = escapeJSString(
          activity.message || "Log message unavailable."
        );
        return `<li class="p-2 border-b border-[var(--border-primary)] last:border-b-0 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-sm transition-colors duration-150">${messageContent}</li>`;
      })
      .join("");
    activityListElement.innerHTML = activityItemsHTML;
  }
  // --- End Activity Log ---

// REPLACE your entire startEdit function with this more precise version.

async function startEdit(id, type, currentName, currentDescription) {
  let nodeElement = null;

  // --- START: MODIFIED & MORE PRECISE SELECTOR ---
  // This logic now looks for the specific class AND the data-id, which is much safer.
  if (type === 'node') {
    nodeElement = document.querySelector(`.tree-node[data-node-id="${id}"]`);
  } else if (type === 'artifact') {
    nodeElement = document.querySelector(`.tree-artifact-wrapper[data-node-id="${id}"]`);
  }
  // --- END: MODIFIED SELECTOR ---

  if (!nodeElement) {
    console.error(`Cannot find a specific .${type}-wrapper element for editing:`, id);
    return;
  }

  let displayElementToReplace = null;
  if (type === 'node') {
    displayElementToReplace = nodeElement.querySelector('.tree-node-text');
  } else if (type === 'artifact') {
    displayElementToReplace = nodeElement.querySelector('.tree-artifact-text');
  }
  
  if (!displayElementToReplace) {
    console.error(`Cannot find content display element for editing (type: ${type}):`, id);
    return;
  }
  
  const actionsElement = nodeElement.querySelector('.node-content .actions');
  if (actionsElement) actionsElement.style.display = 'none';

  // --- Create the edit form container (this part is unchanged) ---
  const editFormContainer = document.createElement('div');
  editFormContainer.className = 'inline-edit-form p-2 space-y-2 border border-[var(--border-input)] rounded-md bg-[var(--bg-inline-form)] w-full';
  
  const nameLabel = document.createElement('label');
  nameLabel.className = 'label-text !mb-0.5';
  nameLabel.textContent = (type === 'node' ? 'Folder Name:' : 'File Title:');
  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = currentName;
  nameInput.className = 'input-field text-sm py-1 px-2 w-full mb-1';

  const descriptionLabel = document.createElement('label');
  descriptionLabel.className = 'label-text !mb-0.5';
  descriptionLabel.textContent = 'Description:';
  const descriptionTextarea = document.createElement('textarea');
  descriptionTextarea.value = currentDescription || "";
  descriptionTextarea.className = 'input-field text-sm py-1 px-2 w-full min-h-[60px] mb-1';
  descriptionTextarea.placeholder = 'Optional';
  
  const buttonsDiv = document.createElement('div');
  buttonsDiv.className = 'flex justify-end space-x-2 mt-2';

  const saveButton = document.createElement('button');
  saveButton.innerHTML = `<span class="button-text">Save</span>`;
  saveButton.className = 'submit-button text-xs py-1 px-2';
  saveButton.title = 'Save changes';

  const cancelButton = document.createElement('button');
  cancelButton.innerHTML = `<span class="button-text">Cancel</span>`;
  cancelButton.className = 'submit-button secondary text-xs py-1 px-2';
  cancelButton.type = 'button'; 
  cancelButton.title = 'Cancel editing';

  buttonsDiv.appendChild(cancelButton);
  buttonsDiv.appendChild(saveButton);

  editFormContainer.appendChild(nameLabel);
  editFormContainer.appendChild(nameInput);
  editFormContainer.appendChild(descriptionLabel);
  editFormContainer.appendChild(descriptionTextarea);
  editFormContainer.appendChild(buttonsDiv);
  // --- End of form creation ---

  const originalDisplayElementClone = displayElementToReplace.cloneNode(true);
  displayElementToReplace.replaceWith(editFormContainer);

  nameInput.focus();
  nameInput.select();

  const revertUI = () => {
    editFormContainer.replaceWith(originalDisplayElementClone);
    if (actionsElement) actionsElement.style.display = '';
  };

  const handleSave = async () => {
    // ... This entire function remains unchanged from the previous version ...
    const newName = nameInput.value.trim();
    const newDescription = descriptionTextarea.value.trim();

    if (!newName) {
      window.showNotification('Name/Title cannot be empty.', 'error');
      nameInput.focus();
      return;
    }

    if (newName === currentName && newDescription === (currentDescription || "")) {
      revertUI();
      return;
    }
    
    const originalButtonText = saveButton.querySelector(".button-text")?.textContent || "Save";
    window.setButtonLoading(saveButton, true, originalButtonText);
    cancelButton.disabled = true;

    try {
      const endpoint = type === 'node' ?
        `${BASE_API_URL}/api/nodes/${id}` :
        `${BASE_API_URL}/api/artifacts/${id}`;

      const payload = type === 'node' ? 
        { name: newName, description: newDescription } : 
        { title: newName, description: newDescription };

      const response = await secureFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to update: ${response.statusText}` }));
        throw new Error(errorData.detail || errorData.message);
      }
      
      nodeElement.dataset.nodeName = newName; 
      nodeElement.dataset.description = newDescription;
      
      const nameTextInClone = (type === 'node') ?
                                  originalDisplayElementClone.querySelector('.node-display-name') :
                                  originalDisplayElementClone.querySelector('.whitespace-nowrap');
      if (nameTextInClone) {
        nameTextInClone.textContent = newName;
      }
      
      revertUI(); 

      if (actionsElement) {
          const editButton = actionsElement.querySelector('button[title^="Edit"]'); 
          const infoButton = actionsElement.querySelector('button[title^="Show"]');
          
          if(editButton) {
              editButton.onclick = (e) => { e.stopPropagation(); startEdit(id, type, newName, newDescription); };
          }
          if(infoButton) {
              infoButton.onclick = (e) => { e.stopPropagation(); showInfoDropdown(e, id, type, newName, newDescription); };
          }
      }

      window.showNotification(
        `${type === 'node' ? 'Folder' : 'File'} details updated! ✅`,
        "success"
      );
      await fetchActivity(); 

    } catch (error) {
      console.error('Error updating item:', error);
      window.showNotification(`Error updating: ${error.message}`, "error");
    } finally {
      window.setButtonLoading(saveButton, false, originalButtonText);
      cancelButton.disabled = false;
    }
  };

  saveButton.addEventListener('click', handleSave);
  cancelButton.addEventListener('click', revertUI);

  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSave(); } 
    else if (e.key === 'Escape') { revertUI(); }
  });
  descriptionTextarea.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { revertUI(); }
  });
}