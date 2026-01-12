import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createProxyMiddleware } from "http-proxy-middleware";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, "..");

// Backend target (your API server)
// Default assumes a backend running on http://localhost:8080 serving routes under /api
const API_TARGET = process.env.API_TARGET || "http://localhost:8080";
const PORT = Number(process.env.PORT || 3000);

const app = express();

// Proxy API calls to backend (same-origin from the browser => no CORS needed)
app.use(
  "/api",
  createProxyMiddleware({
    target: API_TARGET,
    changeOrigin: true,
    logLevel: "warn",
    // Express strips the mount path (/api) before the request reaches the proxy.
    // Our backend routes are under /api/*, so we must add it back.
    pathRewrite: (path) => `/api${path}`,
    proxyTimeout: 30_000,
    timeout: 30_000
  })
);

// Serve static frontend
app.use(express.static(rootDir));

// Simple convenience route
app.get("/", (_req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MOMENTO dev server running: http://localhost:${PORT}`);
  // eslint-disable-next-line no-console
  console.log(`Proxying /api -> ${API_TARGET}`);
});
