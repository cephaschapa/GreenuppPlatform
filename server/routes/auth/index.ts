import type { Express } from "express";
import { setupAuth as configureAuthMiddleware } from "../../auth";

/**
 * Register all authentication routes
 */
export function registerAuthRoutes(app: Express) {
  // Set up authentication middleware and routes
  configureAuthMiddleware(app);
  
  console.log("✅ Auth routes registered");
}