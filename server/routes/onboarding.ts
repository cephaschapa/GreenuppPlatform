import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Onboarding data schemas
const farmProfileSchema = z.object({
  farmName: z.string().min(2),
  farmSize: z.string().min(1),
  farmLocation: z.string().min(5),
  farmingExperience: z.string().min(1),
  primaryCrops: z.string().min(2),
  contactPhone: z.string().optional(),
  farmingGoals: z.string().optional(),
});

const preferencesSchema = z.object({
  weatherAlerts: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  marketUpdates: z.boolean().default(true),
  expertTips: z.boolean().default(true),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  language: z.string().default("en"),
  weatherUnits: z.string().default("metric"),
});

const buyerPreferencesSchema = z.object({
  preferredCategories: z.array(z.string()).min(1),
  maxDeliveryDistance: z.string().default("20"),
  priceAlerts: z.boolean().default(true),
  newProductAlerts: z.boolean().default(true),
  harvestAlerts: z.boolean().default(true),
  qualityPreference: z.string().default("organic"),
  deliveryPreference: z.string().default("pickup"),
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
});

const onboardingProgressSchema = z.object({
  step: z.number().min(1).max(4),
  data: z.record(z.any()),
});

const completeOnboardingSchema = z.object({
  farmProfile: farmProfileSchema.optional(),
  preferences: z.union([preferencesSchema, buyerPreferencesSchema]).optional(),
});

// Get onboarding status
router.get("/onboarding-status", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Check if user has completed onboarding
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check for existing onboarding progress
    const progress = await storage.getUserOnboardingProgress(req.user.id);

    res.json({
      completed: user.onboardingCompleted || false,
      step: progress?.currentStep || 1,
      data: progress?.data || {},
    });
  } catch (error) {
    logger.error("Error fetching onboarding status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Save onboarding progress
router.post("/onboarding-progress", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = onboardingProgressSchema.parse(req.body);

    await storage.saveUserOnboardingProgress(req.user.id, {
      currentStep: validatedData.step,
      data: validatedData.data,
      updatedAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors,
      });
    }

    logger.error("Error saving onboarding progress:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Complete onboarding
router.post("/complete-onboarding", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const validatedData = completeOnboardingSchema.parse(req.body);
    const user = await storage.getUser(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save role-specific data
    if (user.role === "farmer" && validatedData.farmProfile) {
      // Map onboarding data to farmer profile schema
      const farmProfileData = {
        farmName: validatedData.farmProfile.farmName,
        farmLocation: validatedData.farmProfile.farmLocation,
        farmSize: validatedData.farmProfile.farmSize,
        farmType: "Mixed Farming", // Default value since not collected in onboarding
        bio:
          validatedData.farmProfile.farmingGoals ||
          "Passionate farmer focused on sustainable agriculture", // Use farming goals as bio or default
        contactPhone:
          validatedData.farmProfile.contactPhone || user.phone || "", // Use form data first, then user's phone
        mainCrops: validatedData.farmProfile.primaryCrops
          ? validatedData.farmProfile.primaryCrops
              .split(",")
              .map((crop) => crop.trim())
          : [], // Convert comma-separated string to array
        establishedYear: null, // Not collected in onboarding, can be added later
        userId: req.user.id,
      };

      // Create or update farmer profile
      logger.info("Creating farmer profile with data:", farmProfileData);
      try {
        await storage.createOrUpdateFarmerProfile(req.user.id, farmProfileData);
        logger.info("✅ Farmer profile creation completed successfully");

        // Verify the profile was created
        const createdProfile = await storage.getFarmerProfile(req.user.id);
        if (createdProfile) {
          logger.info(
            "✅ Farmer profile verified after creation:",
            createdProfile
          );
        } else {
          logger.error(
            "❌ Farmer profile was not found after creation attempt"
          );
        }
      } catch (profileError) {
        logger.error("❌ Error creating farmer profile:", profileError);
        throw profileError;
      }
    }

    // Save user preferences
    if (validatedData.preferences) {
      await storage.saveUserPreferences(req.user.id, validatedData.preferences);
    }

    // Mark onboarding as completed
    await storage.updateUser(req.user.id, {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    });

    // Clear onboarding progress
    await storage.clearUserOnboardingProgress(req.user.id);

    res.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Invalid data",
        errors: error.errors,
      });
    }

    logger.error("Error completing onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Skip onboarding (mark as completed without data)
router.post("/skip-onboarding", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await storage.updateUser(req.user.id, {
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
    });

    await storage.clearUserOnboardingProgress(req.user.id);

    res.json({
      success: true,
      message: "Onboarding skipped successfully",
    });
  } catch (error) {
    logger.error("Error skipping onboarding:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
