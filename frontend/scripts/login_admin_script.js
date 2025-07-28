// Import Firebase v9 modular SDK
      import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
      import {
        getAuth,
        signInWithPopup,
        GoogleAuthProvider,
        onAuthStateChanged,
        signOut,
        getIdToken,
      } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

      const firebaseConfig = {
        apiKey: "AIzaSyCbHWUEzqGjzeanOiMG0Z5Lb4wIjWWEMUQ",
        authDomain: "docnest-f85e2.firebaseapp.com",
        projectId: "docnest-f85e2",
        storageBucket: "docnest-f85e2.appspot.com",
        messagingSenderId: "102395439437",
        appId: "1:102395439437:web:84e6676388b5d54395af04",
        measurementId: "G-YRMBR8BVSE",
      };

      let app;
      let auth;
      let googleProvider;
      let isProcessingLogin = false;

      const loginButton = document.getElementById("login-button");
      const errorMessageDiv = document.getElementById("error-message");
      const themeToggleButtonLogin = document.getElementById(
        "theme-toggle-button-login"
      );

      const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>`;
      const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>`;

      function applyLoginTheme(theme) {
        if (theme === "light") {
          document.body.classList.add("light-theme");
          if (themeToggleButtonLogin)
            themeToggleButtonLogin.innerHTML = moonIcon;
          localStorage.setItem("loginTheme", "light");
        } else {
          document.body.classList.remove("light-theme");
          if (themeToggleButtonLogin)
            themeToggleButtonLogin.innerHTML = sunIcon;
          localStorage.setItem("loginTheme", "dark");
        }
      }

      if (themeToggleButtonLogin) {
        themeToggleButtonLogin.addEventListener("click", () => {
          applyLoginTheme(
            document.body.classList.contains("light-theme") ? "dark" : "light"
          );
        });
      }

      const savedLoginTheme = localStorage.getItem("loginTheme");
      const prefersDarkLogin = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      applyLoginTheme(savedLoginTheme || (prefersDarkLogin ? "dark" : "dark"));

      function setButtonLoadingState(isLoading) {
        const buttonTextSpan = loginButton.querySelector(".button-text");
        if (isLoading) {
          loginButton.disabled = true;
          if (buttonTextSpan) {
            buttonTextSpan.dataset.originalText = buttonTextSpan.textContent;
            buttonTextSpan.innerHTML = `<span class="spinner"></span>Signing in...`;
          }
        } else {
          loginButton.disabled = false;
          if (buttonTextSpan && buttonTextSpan.dataset.originalText) {
            buttonTextSpan.innerHTML = buttonTextSpan.dataset.originalText;
          } else if (buttonTextSpan) {
            buttonTextSpan.innerHTML = "Sign in with Google";
          }
        }
      }

      function showLoginError(message) {
        errorMessageDiv.textContent = message;
        errorMessageDiv.classList.remove("hidden");
      }

      function clearLoginError() {
        errorMessageDiv.textContent = "";
        errorMessageDiv.classList.add("hidden");
      }

      if (
        firebaseConfig.apiKey === "AIzaSyCbHWUEzqGjzeanOiMG0Z5Lb4wIjWWEMUQ"
      ) {
        console.warn(
          "Firebase config might be using a placeholder API key. Please ensure it's correctly set for production."
        );
        // Decide if you want to block login or show an error if the key seems like a placeholder
        // For development, you might allow it, but for production, you'd want the real key.
      }

      try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        googleProvider = new GoogleAuthProvider();
      } catch (e) {
        console.error("Error initializing Firebase:", e);
        showLoginError(
          "Login service initialization failed. Please contact support."
        );
        if (loginButton) loginButton.disabled = true;
      }


      async function handleAdminAuthentication(user) {
        if (!user) {
          setButtonLoadingState(false);
          isProcessingLogin = false;
          return;
        }

        setButtonLoadingState(true);
        clearLoginError();

        try {
          const token = await getIdToken(user, true);
          sessionStorage.setItem("token", token);

          // ================================================================
          // DYNAMIC BACKEND URL SELECTION
          // ================================================================
          let backendApiUrl;
          const localApiUrl = "http://localhost:8000/api/auth";
          // IMPORTANT: Replace this with your *actual* Cloud Run service URL
          const cloudRunApiUrl = "https://docnest-780614596615.asia-south1.run.app/api/auth";

          if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            backendApiUrl = localApiUrl;
          } else {
            backendApiUrl = cloudRunApiUrl;
            // Safety check for placeholder URL in production-like environment
            if (cloudRunApiUrl.includes("your-docnest-backend-servicename-xxxxxx-yy") || cloudRunApiUrl.includes("your-actual-cloud-run-url")) {
                 const warningMessage = "CRITICAL: Cloud Run URL is a placeholder! Please update 'cloudRunApiUrl' in the script.";
                 console.error(warningMessage);
                 showLoginError("Configuration error. Cannot contact login service. Please inform the administrator.");
                 setButtonLoadingState(false);
                 isProcessingLogin = false;
                 // Optionally sign out the user if they were partially logged in via Firebase
                 if (auth && auth.currentUser) {
                    await signOut(auth).catch(e => console.error("Sign out error during config warning:", e));
                 }
                 sessionStorage.removeItem("token");
                 return; // Stop execution
            }
          }
          // ================================================================

          const backendResponse = await fetch(
            backendApiUrl,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );


          if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error("Admin Login: Backend auth error response:", errorText);
            let errorData = { detail: `Authorization failed (Status: ${backendResponse.status})` }; // Default error
            try {
                if (errorText) { // Ensure errorText is not empty
                    const parsedError = JSON.parse(errorText);
                    if (parsedError.detail) {
                        errorData.detail = parsedError.detail;
                    }
                }
            } catch (parseError) {
                console.warn("Admin Login: Could not parse JSON error response from backend. Using raw text or default.", parseError);
                if (errorText) errorData.detail = errorText; // Use raw error text if parsing fails
            }
            throw new Error(errorData.detail);
          }

          const userData = await backendResponse.json();

          if (userData && userData.isAdmin === true) {
            window.location.href = "admin.html";
          } else {
            showLoginError(
              "Access Denied: You do not have administrator privileges."
            );
            if (auth) {
              await signOut(auth).catch((e) =>
                console.error("Sign out error (not admin):", e)
              );
            }
            sessionStorage.removeItem("token");
            setButtonLoadingState(false);
          }
        } catch (error) {
          console.error("Admin Login: Error during authentication flow:", error);
          showLoginError(`Authentication error: ${error.message}.`);
          if (auth && auth.currentUser) { // Check if auth object and currentUser exist
            await signOut(auth).catch((e) =>
              console.error("Sign out error during catch:", e)
            );
          }
          sessionStorage.removeItem("token");
          setButtonLoadingState(false);
        } finally {
          isProcessingLogin = false;
        }
      }

      let initialAuthCheckProcessed = false;
      if (auth) {
        onAuthStateChanged(auth, (user) => {

          if (user && !initialAuthCheckProcessed && !isProcessingLogin) {
            initialAuthCheckProcessed = true;
            handleAdminAuthentication(user);
          } else if (!user) {
            sessionStorage.removeItem("token");
            setButtonLoadingState(false);
            isProcessingLogin = false;
            // No need to reset initialAuthCheckProcessed here usually,
            // as it's meant for the very first load. If a user signs out and
            // then signs back in via button click, that's handled by triggerGoogleSignIn.
          }
        });
      }


      async function triggerGoogleSignIn() {
        if (!auth || !googleProvider) {
          showLoginError(
            "Login service not available. Please check configuration."
          );
          return;
        }
        if (isProcessingLogin) {
          return;
        }

        clearLoginError();
        setButtonLoadingState(true);
        isProcessingLogin = true;

        try {
          const result = await signInWithPopup(auth, googleProvider);
          await handleAdminAuthentication(result.user);
        } catch (err) {
          console.error("Admin Login: Google Sign-In Popup Error:", err);
          let friendlyMessage = "Sign-in failed. Please try again.";
          if (err.code === "auth/popup-closed-by-user") {
            friendlyMessage = "Sign-in popup closed before completion.";
          } else if (err.code === "auth/network-request-failed") {
            friendlyMessage = "Network error. Please check your connection.";
          } else if (
            err.code === "auth/cancelled-popup-request" ||
            err.code === "auth/popup-blocked"
          ) {
            friendlyMessage =
              "Sign-in popup was blocked or cancelled. Please enable popups and try again.";
          }
          showLoginError(friendlyMessage);
          setButtonLoadingState(false);
          isProcessingLogin = false;
        }
      }

      if (loginButton) {
        loginButton.addEventListener("click", triggerGoogleSignIn);
      } else {
        console.error("Login button not found.");
      }