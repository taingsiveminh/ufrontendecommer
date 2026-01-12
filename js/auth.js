// Check if user is logged in
function isLoggedIn() {
    return !!getToken();
}

// Update auth link based on login status
function updateAuthLink() {
    const authLink = document.getElementById("auth-link");
    if (!authLink) return;

    if (isLoggedIn()) {
        authLink.textContent = "Logout";
        authLink.href = "#";
        authLink.onclick = (e) => {
            e.preventDefault();
            logout();
        };
    } else {
        authLink.textContent = "Login";
        authLink.href = "login.html";
        authLink.onclick = null;
    }
}

// Logout function
function logout() {
    removeToken();
    localStorage.removeItem("user");
    alert("Logged out successfully!");
    window.location.href = "index.html";
}

// Handle login form submission
if (document.getElementById("login-form")) {
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Spring Boot API expects: { email, password }
        // The UI input is labeled as username in HTML, but it should be an email.
        const email = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorEl = document.getElementById("login-error");
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || "Sign In";

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Logging in...";
            errorEl.style.display = "none";

            const response = await apiCall("/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password })
            });

            // Save token
            if (response.token) {
                setToken(response.token);
            }

            // Spring Boot returns: { token, email, role }
            if (response && (response.email || response.role)) {
                localStorage.setItem(
                    "user",
                    JSON.stringify({ email: response.email || email, role: response.role || null })
                );
            }

            // Optional admin redirect (admin dashboard runs on a different origin)
            if (String(response?.role || "").toUpperCase() === "ADMIN") {
                const adminUrl = localStorage.getItem("ADMIN_URL") || "http://localhost:5173";
                const base = String(adminUrl).replace(/\/+$/, "");
                window.location.href = `${base}/login#token=${encodeURIComponent(response.token)}`;
                return;
            }

            alert("Login successful!");
            window.location.href = "index.html";
        } catch (error) {
            errorEl.style.display = "block";
            errorEl.textContent = error.message || "Login failed. Please check your credentials.";
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Handle register form submission
if (document.getElementById("register-form")) {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        const confirmPassword = document.getElementById("reg-confirm-password").value;
        const errorEl = document.getElementById("register-error");
        const successEl = document.getElementById("register-success");
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn?.textContent || "Create Account";

        // Validate passwords match
        if (password !== confirmPassword) {
            errorEl.style.display = "block";
            errorEl.textContent = "Passwords do not match!";
            successEl.style.display = "none";
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Registering...";
            errorEl.style.display = "none";
            successEl.style.display = "none";

            await apiCall("/auth/register", {
                method: "POST",
                // Spring Boot expects: { email, password }
                body: JSON.stringify({ email, password })
            });

            successEl.style.display = "block";
            successEl.textContent = "Registration successful! Redirecting to login...";
            
            // Redirect to login page after 2 seconds
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        } catch (error) {
            errorEl.style.display = "block";
            errorEl.textContent = error.message || "Registration failed. Please try again.";
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });
}

// Get current user info
function getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}
