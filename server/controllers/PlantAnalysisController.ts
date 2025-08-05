import { Request, Response } from "express";
import { PlantAnalysisModel } from "../models/PlantAnalysisModel.js";
import {
  analyzePlantImage,
  createPlantAnalysis,
} from "../services/plant-analysis.js";
import { insertPlantAnalysisSchema } from "@shared/schema";
import { logger } from "../utils/logger.js";
import { db } from "../db.js";
import { farmerProfiles, users } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * Get user's location for pest reporting
 */
async function getUserLocation(userId: number): Promise<string | null> {
  try {
    // Try to get location from farmer profile first
    const [profile] = await db
      .select({ location: farmerProfiles.farmLocation })
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, userId))
      .limit(1);

    if (profile?.location) {
      return profile.location;
    }

    // If no farmer profile location, you could add other location sources here
    // For now, return a default or null
    return null;
  } catch (error) {
    logger.error("Error getting user location:", error);
    return null;
  }
}

export class PlantAnalysisController {
  static async list(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const analyses = await PlantAnalysisModel.getAllByUser(userId);
    res.json(analyses);
  }

  static async get(req: Request, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid analysis ID" });
    const analysis = await PlantAnalysisModel.getById(id);
    if (!analysis)
      return res.status(404).json({ message: "Analysis not found" });
    if (analysis.userId !== userId)
      return res.status(403).json({ message: "Forbidden" });
    res.json(analysis);
  }

  static async byField(req: Request, res: Response) {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.fieldId);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (isNaN(fieldId))
      return res.status(400).json({ message: "Invalid field ID" });
    // TODO: check field ownership
    const analyses = await PlantAnalysisModel.getByField(fieldId);
    res.json(analyses);
  }

  static async byCrop(req: Request, res: Response) {
    const userId = req.user?.id;
    const cropId = parseInt(req.params.cropId);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (isNaN(cropId))
      return res.status(400).json({ message: "Invalid crop ID" });
    // TODO: check crop ownership
    const analyses = await PlantAnalysisModel.getByCrop(cropId);
    res.json(analyses);
  }

  static async create(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const {
      imageData,
      plantType,
      fieldId,
      cropId,
      notes,
      location,
      coordinates,
    } = req.body;
    if (!imageData)
      return res.status(400).json({ message: "Image data is required" });
    try {
      const analysisResult = await analyzePlantImage(
        String(imageData),
        plantType,
        notes
      );
      const plantAnalysisData = createPlantAnalysis(
        String(imageData),
        analysisResult,
        userId,
        plantType,
        fieldId ? parseInt(fieldId) : undefined,
        cropId ? parseInt(cropId) : undefined,
        notes
      );
      insertPlantAnalysisSchema.parse(plantAnalysisData);
      const saved = await PlantAnalysisModel.create(plantAnalysisData);

      // ✨ NEW: Integrate pest/disease reporting system
      try {
        logger.info("🔬 Starting pest reporting integration for analysis:", {
          plantAnalysisId: saved.id,
          userId,
          hasDisease: !!analysisResult.disease,
          diseaseName: analysisResult.disease?.name,
          confidence: analysisResult.disease?.confidence,
        });

        // Get user's location for pest reporting
        const userLocation = location || (await getUserLocation(userId));
        logger.info("📍 User location for pest reporting:", userLocation);

        if (userLocation) {
          // Import pest alert service
          const { createPestReportFromAnalysis } = await import(
            "../services/pest-alert-service.js"
          );

          // Create enhanced analysis result with additional data
          const enhancedAnalysisResult = {
            ...analysisResult,
            cropType: plantType,
            images: [imageData],
            notes,
            coordinates,
            userId,
            plantAnalysisId: saved.id,
          };

          logger.info("🚀 Calling createPestReportFromAnalysis...");

          // Create pest report if threats detected
          await createPestReportFromAnalysis(
            saved.id,
            enhancedAnalysisResult,
            userId,
            userLocation
          );

          logger.info("✅ Pest reporting integration completed");
        } else {
          logger.warn("⚠️ No user location found, skipping pest reporting");
        }
      } catch (pestError) {
        // Log pest reporting error but don't fail the analysis
        logger.error("❌ Error creating pest report from analysis:", pestError);
      }

      res.status(201).json({
        ...saved,
        pestReportingEnabled: true, // Indicate that pest monitoring is active
      });
    } catch (error: unknown) {
      logger.error("Error creating plant analysis:", error);
      res.status(500).json({ message: "Failed to create plant analysis" });
    }
  }

  static async delete(req: Request, res: Response) {
    const userId = req.user?.id;
    const id = parseInt(req.params.id);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid analysis ID" });
    const analysis = await PlantAnalysisModel.getById(id);
    if (!analysis)
      return res.status(404).json({ message: "Analysis not found" });
    if (analysis.userId !== userId)
      return res.status(403).json({ message: "Forbidden" });
    const success = await PlantAnalysisModel.delete(id);
    if (success)
      res.json({
        success: true,
        message: "Plant analysis deleted successfully",
      });
    else res.status(500).json({ message: "Failed to delete plant analysis" });
  }
}
