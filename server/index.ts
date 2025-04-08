import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session"; // Added for typing session properties

// Log environment details on startup - helpful for debugging deployment issues
const isProduction = process.env.NODE_ENV === 'production';
log(`Starting server in ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'} mode`);
log(`Environment variables check:`);
log(`- DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
log(`- SESSION_SECRET exists: ${!!process.env.SESSION_SECRET}`);
log(`- PGHOST exists: ${!!process.env.PGHOST}`);
log(`- PGDATABASE exists: ${!!process.env.PGDATABASE}`);
log(`- PGUSER exists: ${!!process.env.PGUSER}`);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for production cross-origin access
app.use((req, res, next) => {
  // Allow requests from any origin in production
  const allowedOrigins = ['https://greenupp.replit.app'];
  const origin = req.headers.origin;
  
  if (isProduction && origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    log(`CORS: Allowing origin: ${origin}`);
  } else if (!isProduction) {
    // In development, be more permissive
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  }
  
  // Essential CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

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
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
