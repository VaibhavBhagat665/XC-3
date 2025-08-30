import path from "path";
import express from "express";
import { createServer } from "./index";

const port = process.env.PORT || 3000;

// Root app that serves SPA and mounts API under /api
const app = express();

// Create API app and mount at /api so routes like /projects become /api/projects
const api = createServer();
app.use("/api", api);

// In production, serve the built SPA files
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("/*splat", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(port, () => {
  // Determine the correct URLs for frontend and backend
  const getFrontendUrl = () => {
    // First check for explicit frontend URL
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL;
    }

    // Check CORS_ORIGIN as it typically points to the frontend
    if (process.env.CORS_ORIGIN) {
      return process.env.CORS_ORIGIN;
    }

    // Fall back to backend URL for development
    if (process.env.NODE_ENV !== "production") {
      return `http://localhost:${port}`;
    }

    // For production, default to the backend URL if no frontend is specified
    return getBackendUrl();
  };

  const getBackendUrl = () => {
    // Check for Render.com environment variable
    if (process.env.RENDER_EXTERNAL_URL) {
      return process.env.RENDER_EXTERNAL_URL;
    }

    // Check for generic deployment URL environment variable
    if (process.env.APP_URL) {
      return process.env.APP_URL;
    }

    // Check for Vercel environment
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }

    // Check for Netlify environment
    if (process.env.DEPLOY_PRIME_URL) {
      return process.env.DEPLOY_PRIME_URL;
    }

    // Fall back to localhost for development
    return `http://localhost:${port}`;
  };

  const frontendUrl = getFrontendUrl();
  const backendUrl = getBackendUrl();

  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: ${frontendUrl}`);
  console.log(`🔧 API: ${backendUrl}/api`);

  if (process.env.NODE_ENV === "production") {
    console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
    console.log(
      `🏠 Deployment Platform: ${process.env.RENDER_EXTERNAL_URL ? "Render" : process.env.VERCEL_URL ? "Vercel" : process.env.DEPLOY_PRIME_URL ? "Netlify" : "Unknown"}`,
    );
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
