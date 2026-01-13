// Simple in-page navigation helper
// Prevents full page reload when clicking links like "index.html" or "index.html#shop"
// while you're already on the homepage.

function isHomePath(pathname) {
    // Handles: /, /index.html, and file-like previews
    return pathname === "/" || pathname.endsWith("/index.html") || pathname.endsWith("index.html");
}

function scrollToHash(hash) {
    if (!hash || hash === "#") return;
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("click", (e) => {
    const a = e.target instanceof Element ? e.target.closest("a") : null;
    if (!a) return;

    const href = a.getAttribute("href") || "";
    if (!href) return;

    // Pure in-page hashes should never reload
    if (href.startsWith("#")) {
        e.preventDefault();
        history.pushState(null, "", href);
        scrollToHash(href);
        return;
    }

    // If you're already on the homepage, convert index.html(#hash) clicks into smooth scroll
    if (typeof window !== "undefined" && window.location && isHomePath(window.location.pathname)) {
        if (href === "index.html") {
            e.preventDefault();
            history.pushState(null, "", "#top");
            scrollToHash("#top");
            return;
        }

        if (href.startsWith("index.html#")) {
            const hash = href.slice("index.html".length);
            e.preventDefault();
            history.pushState(null, "", hash);
            scrollToHash(hash);
        }
    }
});

// On initial load, scroll to hash (useful for redirects after login)
window.addEventListener("load", () => {
    if (window.location && window.location.hash) {
        scrollToHash(window.location.hash);
    }
});
