import type { Express } from "express";
import { ProfileController } from "../controllers/ProfileController";
import { isAuthenticated } from "../middleware/auth";

export function setupProfileRoutes(app: Express) {
  const controller = new ProfileController();

  // User profile routes
  app.get(
    "/api/user",
    isAuthenticated,
    controller.getUserProfile.bind(controller)
  );

  app.patch(
    "/api/user",
    isAuthenticated,
    controller.updateUserProfile.bind(controller)
  );

  // Farmer profile routes
  app.get(
    "/api/farmer-profile",
    isAuthenticated,
    controller.getFarmerProfile.bind(controller)
  );

  app.post(
    "/api/farmer-profile",
    isAuthenticated,
    controller.createFarmerProfile.bind(controller)
  );

  app.patch(
    "/api/farmer-profile",
    isAuthenticated,
    controller.updateFarmerProfile.bind(controller)
  );

  // Combined user with farmer profile route
  app.get(
    "/api/profile",
    isAuthenticated,
    controller.getUserWithFarmerProfile.bind(controller)
  );
}
