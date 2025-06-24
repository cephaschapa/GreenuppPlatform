import type { Express } from "express";
import { SettingsController } from "../controllers/SettingsController";
import { isAuthenticated } from "../middleware/auth";

export function setupSettingsRoutes(app: Express) {
  const controller = new SettingsController();

  // Get user settings
  app.get(
    "/api/settings",
    isAuthenticated,
    controller.getUserSettings.bind(controller)
  );

  // Update user settings
  app.patch(
    "/api/settings",
    isAuthenticated,
    controller.updateUserSettings.bind(controller)
  );
}
