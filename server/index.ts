import "dotenv/config";
import express from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./vite";
import path from "path";
import { fileURLToPath } from "url";
import { errorHandler } from "./lib/errors";
import { logger, logApiRequest } from "./lib/logger";
import morgan from "morgan";
import { stream } from "./lib/logger";

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Increase JSON payload size limit to 25MB for image uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: false, limit: "25mb" }));

// Setup request logging
app.use(morgan("combined", { stream }));

// Add our custom request logging
app.use(logApiRequest);

// Serve uploaded files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Middleware to check if we're on app subdomain and redirect to auth if not authenticated
// This only applies to non-API routes and allows /auth and static assets
app.use((req, res, next) => {
  const host = req.get("host") || "";
  const isAppSubdomain = host.startsWith("app.");
  const path = req.path;

  // Skip API routes and already on auth page
  if (
    path.startsWith("/api") ||
    path === "/auth" ||
    path.startsWith("/assets/") ||
    path.includes(".") ||
    path.startsWith("/_assets/")
  ) {
    return next();
  }

  // If we're on app subdomain, check for authentication
  if (isAppSubdomain && req.isAuthenticated && !req.isAuthenticated()) {
    console.log(`Subdomain auth redirect: ${path} -> /auth`);
    return res.redirect("/auth");
  }

  next();
});

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = `${logLine.slice(0, 79)}…`;
      }

      logger.info(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Global error handler
  app.use(errorHandler);

  // Log environment for debugging if needed
  if (process.env.DEBUG_APP) {
    logger.info("NODE_ENV:", process.env.NODE_ENV);
    logger.info("App environment:", app.get("env"));
  }

  // Setup Vite in development or serve static files in production
  const isDevelopment = process.env.NODE_ENV !== "production";

  if (isDevelopment) {
    if (process.env.DEBUG_APP) {
      logger.info(
        "Development mode: API server only (frontend served by Vite on port 3000)"
      );
    }
    // In development, only serve the API - frontend is handled by Vite dev server
  } else {
    if (process.env.DEBUG_APP) {
      logger.info("Setting up static serving for production");
    }
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      logger.info(`Server running on port ${port}`);
    }
  );
})();
