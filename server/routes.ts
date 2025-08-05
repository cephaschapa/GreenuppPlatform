import type { Express } from "express";
import { createServer, type Server } from "http";

import cartRoutes from "./routes/cart";
import sellerRoutes from "./routes/seller";
import buyerRoutes from "./routes/buyer";
import cropTraceRoutes from "./routes/croptrace";
import waitlistRoutes from "./routes/waitlist";
import notificationRoutes from "./routes/notifications";
import emailRoutes from "./routes/email";
import {
  greenSocialsRouter,
  setIsAuthenticatedMiddleware,
} from "./routes/green-socials";
import { uploadRouter } from "./routes/upload-routes";
import streamChatRoutes from "./routes/stream-chat-routes";
import streamChatWebhooks from "./routes/stream-chat-webhooks";
import farmingAssistantRoutes from "./routes/farming-assistant";
import searchRoutes from "./routes/search";
import { mapsConfigRouter } from "./routes/maps-config";
import { setWebSocketNotifier } from "./services/websocket-notifier";
import { registerMvcRoutes } from "./routes/index-mvc.js";
import { setupAuth } from "./auth";
import authRoutes from "./routes/auth-routes.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware to handle subdomain routing
  app.use((req, res, next) => {
    // Get the host from the request
    const host = req.hostname;

    // Check if we're on a subdomain (app.yourdomain.com)
    if (host.startsWith("app.")) {
      // Add a property to the request object to identify app/dashboard requests
      (req as any).isDashboard = true;
    } else {
      // This is the main domain (yourdomain.com) - landing page
      (req as any).isDashboard = false;
    }

    next();
  });

  // Set up authentication and get the isAuthenticated middleware
  const { isAuthenticated } = setupAuth(app);

  // Set the isAuthenticated middleware for the Green Socials router
  setIsAuthenticatedMiddleware(isAuthenticated);

  // Register enhanced authentication routes
  app.use("/api/auth", authRoutes);

  // Register MVC routes (includes marketplace, fields, crops, tasks, weather, plant analyses, product verification)
  registerMvcRoutes(app);

  // Set up seller routes
  app.use("/api/marketplace/sellers", sellerRoutes);

  // Set up buyer routes
  app.use("/api/buyer", buyerRoutes);

  // Set up search routes
  searchRoutes(app);

  // Set up cart routes
  app.use("/api/cart", cartRoutes);

  // Set up crop traceability routes
  app.use("/api/croptrace", cropTraceRoutes);

  // Public crop trace verification route
  app.use("/api/trace", cropTraceRoutes);

  // Set up waitlist routes
  app.use("/api/waitlist", waitlistRoutes);

  // Set up notification routes
  app.use("/api/notifications", notificationRoutes);

  // Set up email routes
  app.use(emailRoutes);

  // Set up Green Socials routes
  app.use("/api/social", greenSocialsRouter);

  // Set up file upload routes
  app.use("/api/uploads", uploadRouter);

  // Set up Stream Chat routes
  app.use("/api/stream-chat", streamChatRoutes);

  // Set up Stream Chat webhooks (no authentication required)
  app.use("/api/stream-chat/webhooks", streamChatWebhooks);

  // Set up AI farming assistant routes
  app.use("/api/farming-assistant", farmingAssistantRoutes);

  // Set up maps configuration routes (admin only)
  app.use("/api/maps", mapsConfigRouter);

  // Auto-generate treatment plan from analysis - MIGRATED TO MVC
  // All treatment plan routes have been moved to server/routes/treatment-mvc.ts
  // and are handled by TreatmentController and TreatmentModel

  // Catch-all route for API errors - must be after all API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
  });

  // Create and return the HTTP server
  const httpServer = createServer(app);

  // Provide a no-op implementation for the WebSocket notifier
  // to prevent errors in code that calls this function
  setWebSocketNotifier(() => {
    // No-op implementation - websockets are disabled
  });

  return httpServer;
}
