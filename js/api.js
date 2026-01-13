// API Configuration
// You can override this without editing code:
// - in DevTools console: localStorage.setItem('API_URL', 'http://localhost:8080/api')
// - or set window.API_URL before loading this script
const DEFAULT_API_URL = (typeof window !== "undefined"
    && window.location
    && (window.location.protocol === "http:" || window.location.protocol === "https:"))
    ? `${window.location.origin}/api`
    : "http://localhost:8080/api";

const API_URL = (typeof window !== "undefined" && window.API_URL)
    || localStorage.getItem("API_URL")
    || DEFAULT_API_URL;

const FALLBACK_API_URL = "http://localhost:8080/api";

function isLocalhostHost(hostname) {
    return hostname === "localhost" || hostname === "127.0.0.1";
}

function isUsingDefaultOriginApiUrl() {
    return (typeof window !== "undefined"
        && window.location
        && API_URL === `${window.location.origin}/api`);
}

function setApiUrl(url) {
    localStorage.setItem("API_URL", url);
}

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
        if (typeof window !== "undefined" && window.location && window.location.protocol === "file:") {
            console.warn(
                "You are opening this site via file://. If your backend has CORS restrictions, auth requests may fail. " +
                "Prefer serving the frontend via http://localhost (e.g. a local dev server)."
            );
        }

        const doFetch = async (baseUrl) => {
            return fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers: {
                    ...getAuthHeaders(),
                    ...options.headers
                }
            });
        };

        let response = await doFetch(API_URL);

        // If the frontend is being served by a simple static server (e.g. VS Code Live Server)
        // then `${window.location.origin}/api` won't be proxied to the backend and may return 404/405.
        // Auto-fallback to the backend API directly for localhost dev.
        if (!response.ok
            && (response.status === 404 || response.status === 405)
            && typeof window !== "undefined"
            && window.location
            && isLocalhostHost(window.location.hostname)
            && isUsingDefaultOriginApiUrl()
            && API_URL !== FALLBACK_API_URL
        ) {
            response = await doFetch(FALLBACK_API_URL);
            if (response.ok) {
                setApiUrl(FALLBACK_API_URL);
            }
        }
        
        if (!response.ok) {
            const contentType = response.headers.get("content-type") || "";
            const body = contentType.includes("application/json")
                ? await response.json().catch(() => null)
                : await response.text().catch(() => "");

            const message =
                (body && typeof body === "object" && (body.message || body.error))
                || (typeof body === "string" && body.trim())
                || `HTTP error! status: ${response.status}`;

            throw new Error(message);
        }
        
        return await response.json();
    } catch (error) {
        // Common fetch failure (server down, DNS, CORS blocked -> often surfaces as TypeError)
        if (error instanceof TypeError) {
            const hint = `Cannot reach API at ${API_URL}. Is your backend running, and is CORS allowed for this frontend origin?`;
            console.error(hint, error);
            throw new Error(hint);
        }

        console.error("API Error:", error);
        throw error;
    }
}
