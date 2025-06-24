import type { Request, Response } from "express";
import { ProfileModel } from "../models/ProfileModel";
import { logger } from "../lib/logger";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from "../lib/errors";
import { insertFarmerProfileSchema } from "@shared/schema";

export class ProfileController {
  private model: ProfileModel;

  constructor() {
    this.model = new ProfileModel();
  }

  // Get user profile
  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const userProfile = await this.model.getUserProfile(req.user.id);
      if (!userProfile) {
        throw new NotFoundError("User profile not found");
      }

      res.json(userProfile);
    } catch (error) {
      logger.error("Error fetching user profile:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve user profile" });
      }
    }
  }

  // Update user profile
  async updateUserProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { firstName, lastName, profileImage } = req.body;

      // Validate input
      if (firstName !== undefined && typeof firstName !== "string") {
        throw new ValidationError("First name must be a string");
      }

      if (lastName !== undefined && typeof lastName !== "string") {
        throw new ValidationError("Last name must be a string");
      }

      if (profileImage !== undefined && typeof profileImage !== "string") {
        throw new ValidationError("Profile image must be a string");
      }

      const updateData: any = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (profileImage !== undefined) updateData.profileImage = profileImage;

      const updatedProfile = await this.model.updateUserProfile(
        req.user.id,
        updateData
      );

      if (!updatedProfile) {
        throw new DatabaseError("Failed to update user profile");
      }

      logger.info(`User profile updated by user ${req.user.id}`);
      res.json(updatedProfile);
    } catch (error) {
      logger.error("Error updating user profile:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update user profile" });
      }
    }
  }

  // Get farmer profile
  async getFarmerProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      if (req.user.role !== "farmer") {
        throw new AuthorizationError("Only farmers can access farmer profiles");
      }

      const farmerProfile = await this.model.getFarmerProfile(req.user.id);
      if (!farmerProfile) {
        throw new NotFoundError("Farmer profile not found");
      }

      res.json(farmerProfile);
    } catch (error) {
      logger.error("Error fetching farmer profile:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve farmer profile" });
      }
    }
  }

  // Create farmer profile
  async createFarmerProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      if (req.user.role !== "farmer") {
        throw new AuthorizationError("Only farmers can create farmer profiles");
      }

      // Check if profile already exists
      const existingProfile = await this.model.getFarmerProfile(req.user.id);
      if (existingProfile) {
        res.status(409).json({ message: "Farmer profile already exists" });
        return;
      }

      // Validate and create profile
      const profileData = insertFarmerProfileSchema.parse(req.body);
      const newProfile = await this.model.createFarmerProfile(
        req.user.id,
        profileData
      );

      logger.info(`Farmer profile created by user ${req.user.id}`);
      res.status(201).json(newProfile);
    } catch (error) {
      logger.error("Error creating farmer profile:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create farmer profile" });
      }
    }
  }

  // Update farmer profile
  async updateFarmerProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      if (req.user.role !== "farmer") {
        throw new AuthorizationError("Only farmers can update farmer profiles");
      }

      // Check if profile exists
      const existingProfile = await this.model.getFarmerProfile(req.user.id);
      if (!existingProfile) {
        throw new NotFoundError("Farmer profile not found");
      }

      // Validate and update profile
      const profileData = insertFarmerProfileSchema.partial().parse(req.body);
      const updatedProfile = await this.model.updateFarmerProfile(
        req.user.id,
        profileData
      );

      if (!updatedProfile) {
        throw new DatabaseError("Failed to update farmer profile");
      }

      logger.info(`Farmer profile updated by user ${req.user.id}`);
      res.json(updatedProfile);
    } catch (error) {
      logger.error("Error updating farmer profile:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else if (error instanceof DatabaseError) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to update farmer profile" });
      }
    }
  }

  // Get user with farmer profile
  async getUserWithFarmerProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const userWithProfile = await this.model.getUserWithFarmerProfile(
        req.user.id
      );
      if (!userWithProfile) {
        throw new NotFoundError("User not found");
      }

      res.json(userWithProfile);
    } catch (error) {
      logger.error("Error fetching user with farmer profile:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve user profile" });
      }
    }
  }
}
