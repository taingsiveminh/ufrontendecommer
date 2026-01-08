// API Configuration
const API_URL = "http://localhost:8080/api";

// Helper function to get auth token
function getToken() {
    return localStorage.getItem("token");
}

// Helper function to set auth token
function setToken(token) {
    localStorage.setItem("token", token);
}

// Helper function to remove auth token
function removeToken() {
    localStorage.removeItem("token");
}

// Helper function to get authorization headers
function getAuthHeaders() {
    const headers = {
        "Content-Type": "application/json"
    };
    
    const token = getToken();
    if (token) {
        headers["Authorization"] = "Bearer " + token;
    }
    
    return headers;
}

// Helper function for API calls with error handling
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getAuthHeaders(),
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: "An error occurred" }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
}
