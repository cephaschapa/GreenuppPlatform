import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "../storage";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "../auth";
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
  
  // Set up authentication 
  setupAuth(app);

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

  // Register all route modules
  registerMarketplaceRoutes(app, isAuthenticated);
  
  // Add other route modules here as they are created
  // Example: registerCropRoutes(app, isAuthenticated, hasRole);
  // Example: registerWeatherRoutes(app, isAuthenticated);

  // TEST endpoint for quick verification
  app.post("/api/test-marketplace", isAuthenticated, async (req, res) => {
    console.log("TEST MARKETPLACE endpoint hit");
    res.status(200).json({ success: true, message: "Test marketplace endpoint working" });
  });

  // Log all registered routes
  const registeredRoutes = app._router.stack
    .filter((r) => r.route)
    .map((r) => {
      return Object.keys(r.route.methods)
        .filter((method) => r.route.methods[method])
        .map((method) => `${method.toUpperCase()} ${r.route.path}`)
        .join(", ");
    });
  
  console.log("Registered routes:\n- " + registeredRoutes.join("\n- "));

  if (registeredRoutes.some(route => route.includes("/api/marketplace/listings"))) {
    console.log("✅ Marketplace listings routes are properly registered");
  } else {
    console.log("❌ WARNING: Marketplace listings routes not found in registered routes!");
  }
  
  // Create and return the HTTP server
  const httpServer = createServer(app);
  
  return httpServer;
}