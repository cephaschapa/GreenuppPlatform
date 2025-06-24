import type { Request, Response } from "express";
import { SettingsModel } from "../models/SettingsModel";
import { logger } from "../lib/logger";
import { ValidationError, AuthenticationError } from "../lib/errors";

export class SettingsController {
  private model: SettingsModel;

  constructor() {
    this.model = new SettingsModel();
  }

  // Get user settings
  async getUserSettings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const settings = await this.model.getUserSettings(req.user.id);
      res.json(settings);
    } catch (error) {
      logger.error("Error fetching user settings:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        res.status(500).json({ message: "Failed to retrieve settings" });
      }
    }
  }

  // Update user settings
  async updateUserSettings(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { type, settings } = req.body;

      if (!type || !settings) {
        throw new ValidationError("Missing type or settings data");
      }

      // Validate settings type
      const validTypes = [
        "notifications",
        "display",
        "security",
        "privacy",
        "units",
      ];
      if (!validTypes.includes(type)) {
        throw new ValidationError("Invalid settings type");
      }

      const updatedSettings = await this.model.updateUserSettings(
        req.user.id,
        type,
        settings
      );

      logger.info(`Settings updated for user ${req.user.id}, type: ${type}`);
      res.json(updatedSettings);
    } catch (error) {
      logger.error("Error updating user settings:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update settings" });
      }
    }
  }
}
