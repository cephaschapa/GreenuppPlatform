import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Import all route modules
import { registerAuthRoutes } from "./auth";
import { registerProfileRoutes } from "./profile";
import { registerCropRoutes } from "./crops";
import { registerFieldRoutes } from "./fields";
import { registerTaskRoutes } from "./tasks";
import { registerWeatherRoutes } from "./weather";
import { registerPlantAnalysisRoutes } from "./plant-analysis";
import { registerLocationRoutes } from "./locations";
import { registerMarketplaceRoutes } from "./marketplace";

// Custom TypeScript declaration extensions
declare global {
  namespace Express {
    interface Request {
      originalMarketplacePath?: string;
    }
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log("Registering all API routes...");

  // Middleware to check authentication
  function isAuthenticated(req: Request, res: Response, next: NextFunction) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Not authenticated" });
  }

  // Middleware to check user role
  function hasRole(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (req.isAuthenticated() && req.user && req.user.role === role) {
        return next();
      }
      res.status(403).json({ message: "Unauthorized access" });
    };
  }

  // Register all authentication routes (must be first)
  registerAuthRoutes(app);
  
  // Register all other feature modules
  registerProfileRoutes(app, isAuthenticated, hasRole);
  registerCropRoutes(app, isAuthenticated);
  registerFieldRoutes(app, isAuthenticated);
  registerTaskRoutes(app, isAuthenticated);
  registerWeatherRoutes(app, isAuthenticated);
  registerPlantAnalysisRoutes(app, isAuthenticated);
  registerLocationRoutes(app, isAuthenticated);
  registerMarketplaceRoutes(app, isAuthenticated);

  // TEST endpoint for quick verification
  app.post("/api/test-endpoint", isAuthenticated, async (req, res) => {
    console.log("TEST endpoint hit");
    res.status(200).json({ success: true, message: "API is working correctly" });
  });

  // Log all registered routes
  const registeredRoutes = app._router.stack
    .filter((r) => r.route && r.route.path)
    .map((r) => {
      return Object.keys(r.route.methods)
        .filter((method) => r.route.methods[method])
        .map((method) => `${method.toUpperCase()} ${r.route.path}`)
        .join(", ");
    });
  
  console.log("Registered routes:\n- " + registeredRoutes.join("\n- "));

  // Quick validation of critical routes
  const criticalRoutePatterns = [
    "/api/login", 
    "/api/register", 
    "/api/user",
    "/api/marketplace/listings",
    "/api/crops",
    "/api/fields",
    "/api/weather"
  ];
  
  const missingRoutes = criticalRoutePatterns.filter(pattern => 
    !registeredRoutes.some(route => route.includes(pattern))
  );
  
  if (missingRoutes.length > 0) {
    console.log("⚠️ WARNING: Some critical routes appear to be missing:");
    missingRoutes.forEach(route => console.log(`  - ${route}`));
  } else {
    console.log("✅ All critical routes are properly registered");
  }
  
  // Create and return the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}