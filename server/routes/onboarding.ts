import { Router } from "express";
import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { storage } from "../storage.js";
import { db } from "../db.js";
import { cropVarieties } from "@shared/schema";
import { logger } from "../lib/logger.js";
import { resolveFarmLocation } from "../services/locationResolverService.js";
import {
  getOrCreateWeatherSnapshot,
} from "../services/weatherObservationService.js";

const router = Router();

// Zambian provinces (match zambian-locations and spec)
const ZAMBIAN_PROVINCES = [
  "Central",
  "Copperbelt",
  "Eastern",
  "Luapula",
  "Lusaka",
  "Muchinga",
  "Northern",
  "North-Western",
  "Southern",
  "Western",
] as const;

const onboardingProfileSchema = z.object({
  province: z.enum(ZAMBIAN_PROVINCES),
  farmerType: z.enum(["smallholder", "emerging", "commercial"]),
  yearsFarming: z.number().int().min(0).max(80).optional(),
  mainGoal: z
    .enum(["increase_yield", "reduce_costs", "manage_risks", "sell_produce"])
    .optional(),
  cooperativeMember: z.boolean().optional(),
});

const onboardingFarmSchema = z.object({
  farmName: z.string().min(1).max(100).default("My Farm"),
  farmLocationText: z.string().min(3).max(200),
  farmLocationSource: z.enum(["zambian_database", "gps", "manual"]),
  farmSizeHa: z.number().min(0.01).max(9999.99),
  lat: z.number().optional(),
  lng: z.number().optional(),
  irrigationType: z
    .enum(["rainfed", "borehole", "canal", "drip", "pivot", "none"])
    .optional(),
  waterSourceNotes: z.string().max(500).optional(),
});

const onboardingFieldSchema = z.object({
  farmId: z.number().int().positive(),
  fieldName: z.string().min(1).max(80),
  fieldSizeHa: z.number().min(0.01).max(9999.99),
  soilType: z.enum(["sandy", "loam", "clay", "unknown"]).optional(),
  previousCrop: z.string().max(120).optional(),
});

const onboardingCropSchema = z.object({
  fieldId: z.number().int().positive(),
  cropName: z.string().min(1).max(120),
  variety: z.string().max(120).optional(),
  plantingDate: z.string().max(10).optional(), // YYYY-MM-DD
});

// Onboarding data schemas (legacy complete-onboarding)
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
  step: z.number().min(1).max(8), // 0-7 screens + 8 = completed
  data: z.record(z.any()),
});

const completeOnboardingSchema = z.object({
  farmProfile: farmProfileSchema.optional(),
  preferences: z.union([preferencesSchema, buyerPreferencesSchema]).optional(),
});

// Get onboarding status (spec: GET /onboarding/status)
router.get("/onboarding-status", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const progress = await storage.getUserOnboardingProgress(req.user.id);

    res.json({
      completed: user.onboardingCompleted || false,
      step: progress?.currentStep ?? 1,
      data: progress?.data ?? {},
    });
  } catch (error) {
    logger.error("Error fetching onboarding status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /onboarding/profile — Screen 2: province, farmerType, optional ask-later fields
router.post("/onboarding/profile", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = onboardingProfileSchema.parse(req.body);
    await storage.createOrUpdateFarmerProfile(req.user.id, {
      province: body.province,
      farmerType: body.farmerType,
      yearsFarming: body.yearsFarming ?? null,
      mainGoal: body.mainGoal ?? null,
      cooperativeMember: body.cooperativeMember ?? false,
    });

    const progress = await storage.getUserOnboardingProgress(req.user.id);
    await storage.saveUserOnboardingProgress(req.user.id, {
      currentStep: 3, // next: farm
      data: { ...progress?.data, profile: body },
      updatedAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    logger.error("Error saving onboarding profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /onboarding/farm — Screen 3: farm name, location, size; triggers location resolve + weather
router.post("/onboarding/farm", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = onboardingFarmSchema.parse(req.body);
    const farm = await storage.createFarm({
      userId: req.user.id,
      farmName: body.farmName,
      farmLocationText: body.farmLocationText,
      farmLocationSource: body.farmLocationSource,
      farmSizeHa: String(body.farmSizeHa),
      lat: body.lat != null ? String(body.lat) : null,
      lng: body.lng != null ? String(body.lng) : null,
      irrigationType: body.irrigationType ?? null,
      waterSourceNotes: body.waterSourceNotes ?? null,
    });

    // Sync farmer profile farmLocation so GET /api/home and weather resolution work
    await storage.createOrUpdateFarmerProfile(req.user.id, {
      farmLocation: body.farmLocationText,
      farmLocationSource: body.farmLocationSource,
      farmName: body.farmName,
      farmSize: String(body.farmSizeHa),
    });

    // Resolve location (Zambian DB) and create weather snapshot
    try {
      const location = await resolveFarmLocation(req.user.id, body.farmLocationText);
      if (location) {
        const { getOrCreateWeatherSnapshot } = await import("../services/weatherObservationService.js");
        await getOrCreateWeatherSnapshot(req.user.id, location);
      }
    } catch (enrichErr: any) {
      logger.warn("Onboarding farm: enrichment (location/weather) failed", { err: (enrichErr as Error)?.message });
    }

    const progress = await storage.getUserOnboardingProgress(req.user.id);
    await storage.saveUserOnboardingProgress(req.user.id, {
      currentStep: 4,
      data: { ...progress?.data, farm: { ...body, id: farm.id } },
      updatedAt: new Date(),
    });

    res.json({ success: true, farm: { id: farm.id, farmName: farm.farmName } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    logger.error("Error saving onboarding farm:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST /onboarding/field — Screen 4: at least one field linked to farm
router.post("/onboarding/field", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = onboardingFieldSchema.parse(req.body);
    const farm = await storage.getFarm(body.farmId);
    if (!farm || farm.userId !== req.user.id) {
      return res.status(400).json({ message: "Farm not found or access denied" });
    }

    const field = await storage.createField({
      userId: req.user.id,
      farmId: body.farmId,
      name: body.fieldName,
      size: String(body.fieldSizeHa),
      sizeUnit: "hectares",
      soilType: body.soilType ?? null,
      notes: body.previousCrop ?? null,
    });

    const progress = await storage.getUserOnboardingProgress(req.user.id);
    const fieldsList = [...(progress?.data?.fields ?? []), { id: field.id, name: field.name, size: field.size }];
    await storage.saveUserOnboardingProgress(req.user.id, {
      currentStep: 5,
      data: { ...progress?.data, fields: fieldsList },
      updatedAt: new Date(),
    });

    res.json({ success: true, field: { id: field.id, name: field.name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    logger.error("Error saving onboarding field:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET /onboarding/crop-options — Screen 5: list crop varieties for "What are you growing now?"
router.get("/onboarding/crop-options", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const list = await db
      .select({ id: cropVarieties.id, name: cropVarieties.name, variety: cropVarieties.variety })
      .from(cropVarieties)
      .where(eq(cropVarieties.isActive, true))
      .orderBy(asc(cropVarieties.name));

    res.json({ success: true, options: list });
  } catch (error) {
    logger.error("Error fetching crop options:", error);
    res.status(500).json({ message: "Failed to load crop options" });
  }
});

// POST /onboarding/crop — Screen 5: add a crop to a field (Mode A: "What are you growing now?")
router.post("/onboarding/crop", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = onboardingCropSchema.parse(req.body);

    const field = await storage.getField(body.fieldId);
    if (!field || field.userId !== req.user.id) {
      return res.status(400).json({ message: "Field not found or access denied" });
    }

    const crop = await storage.createCrop({
      userId: req.user.id,
      fieldId: body.fieldId,
      name: body.cropName,
      variety: body.variety ?? null,
      plantingDate: body.plantingDate ?? null,
      status: "planted",
    });

    const progress = await storage.getUserOnboardingProgress(req.user.id);
    const cropsList = [...(progress?.data?.crops ?? []), { id: crop.id, name: crop.name, fieldId: crop.fieldId }];
    await storage.saveUserOnboardingProgress(req.user.id, {
      currentStep: 5,
      data: { ...progress?.data, crops: cropsList },
      updatedAt: new Date(),
    });

    res.json({ success: true, crop: { id: crop.id, name: crop.name } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    logger.error("Error saving onboarding crop:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const onboardingNotificationsSchema = z.object({
  notificationsEnabled: z.boolean(),
  fcmToken: z.string().optional(),
  weatherAlerts: z.boolean().optional().default(true),
  taskReminders: z.boolean().optional().default(true),
  pestDiseaseAlerts: z.boolean().optional().default(true),
  marketplaceDeals: z.boolean().optional().default(false),
});

// POST /onboarding/notifications — Screen 6: preferences + FCM token
router.post("/onboarding/notifications", async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = onboardingNotificationsSchema.parse(req.body);
    await storage.saveUserPreferences(req.user.id, {
      weatherAlerts: body.weatherAlerts,
      taskReminders: body.taskReminders,
      pestDiseaseAlerts: body.pestDiseaseAlerts,
      marketplaceDeals: body.marketplaceDeals,
      pushNotifications: body.notificationsEnabled,
      language: "en",
      weatherUnits: "metric",
    });

    if (body.notificationsEnabled && body.fcmToken) {
      const { storeUserFCMToken } = await import("../services/firebase.js");
      await storeUserFCMToken(req.user.id, body.fcmToken);
    } else if (!body.notificationsEnabled) {
      await storage.updateUser(req.user.id, { pushNotificationsEnabled: false });
    }

    const progress = await storage.getUserOnboardingProgress(req.user.id);
    await storage.saveUserOnboardingProgress(req.user.id, {
      currentStep: 7,
      data: { ...progress?.data, notifications: body },
      updatedAt: new Date(),
    });

    res.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid data", errors: error.errors });
    }
    logger.error("Error saving onboarding notifications:", error);
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

    // Create merchant account for suppliers
    if (req.user.role === "supplier" && validatedData.merchantSetup) {
      try {
        logger.info("🏪 Creating merchant account for seller:", req.user.id);
        await storage.createMerchantAccount({
          userId: req.user.id,
          ...validatedData.merchantSetup,
          status: "pending",
          verificationStatus: "pending",
        });
        logger.info("✅ Merchant account created successfully");
      } catch (merchantError) {
        logger.error("❌ Error creating merchant account:", merchantError);
        throw merchantError;
      }
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
