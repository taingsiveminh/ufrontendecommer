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
        
        const username = document.getElementById("username").value;
        const password = document.getElementById("password").value;
        const errorEl = document.getElementById("login-error");
        const submitBtn = e.target.querySelector('button[type="submit"]');

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = "Logging in...";
            errorEl.style.display = "none";

            const response = await apiCall("/auth/login", {
                method: "POST",
                body: JSON.stringify({ username, password })
            });

            // Save token
            if (response.token) {
                setToken(response.token);
            }

            // Save user info if available
            if (response.user) {
                localStorage.setItem("user", JSON.stringify(response.user));
            }

            alert("Login successful!");
            window.location.href = "index.html";
        } catch (error) {
            errorEl.style.display = "block";
            errorEl.textContent = error.message || "Login failed. Please check your credentials.";
            submitBtn.disabled = false;
            submitBtn.textContent = "Login";
        }
    });
}

// Handle register form submission
if (document.getElementById("register-form")) {
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const username = document.getElementById("reg-username").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        const confirmPassword = document.getElementById("reg-confirm-password").value;
        const errorEl = document.getElementById("register-error");
        const successEl = document.getElementById("register-success");
        const submitBtn = e.target.querySelector('button[type="submit"]');

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

            const response = await apiCall("/auth/register", {
                method: "POST",
                body: JSON.stringify({ username, email, password })
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
            submitBtn.textContent = "Register";
        }
    });
}

// Get current user info
function getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
}
