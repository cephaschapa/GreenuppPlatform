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
import { compressImageForStorage } from "../utils/imageCompression.js";

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
    
    // Check if client wants to exclude images to reduce payload size
    const excludeImages = req.query.excludeImages === 'true' || req.query.excludeImages === true;
    
    // Parse pagination parameters
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string) || 50, 100) : 50; // Max 100 per page
    const offset = req.query.offset ? parseInt(req.query.offset as string) || 0 : 0;
    const includePagination = req.query.includePagination === 'true' || req.query.includePagination === true;
    
    logger.info(`Fetching plant analyses for user ${userId}, excludeImages: ${excludeImages}, limit: ${limit}, offset: ${offset}`);
    
    const pagination = { limit, offset };
    const analyses = await PlantAnalysisModel.getAllByUser(userId, excludeImages, pagination);
    
    // Transform the flat database structure to match frontend expectations
    const transformedAnalyses = analyses.map((analysis) => {
      // Parse stored data into the nested structure expected by frontend
      const analysisResult = {
        disease: analysis.diseaseDetected ? {
          name: analysis.diseaseDetected,
          confidence: analysis.diseaseProbability ? parseFloat(analysis.diseaseProbability.toString()) : 0,
          description: analysis.diseaseDescription || '',
        } : null,
        health: {
          status: analysis.healthStatus as 'healthy' | 'minor issues' | 'moderate issues' | 'severe issues',
          score: analysis.healthScore,
        },
        nutrients: {
          deficiencies: analysis.nutrientDeficiencies ? analysis.nutrientDeficiencies.split(',').map(s => s.trim()).filter(Boolean) : [],
          excess: analysis.nutrientExcess ? analysis.nutrientExcess.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        recommendations: analysis.recommendations ? analysis.recommendations.split('\n').filter(Boolean) : [],
        additionalObservations: analysis.additionalObservations ? analysis.additionalObservations.split('\n').filter(Boolean) : [],
      };

      return {
        id: analysis.id,
        userId: analysis.userId,
        imageData: excludeImages ? undefined : analysis.imageData,
        plantType: analysis.plantType,
        fieldId: analysis.fieldId,
        cropId: analysis.cropId,
        notes: analysis.notes,
        location: undefined,
        coordinates: undefined,
        analysisResult,
        // Flat fields for list UI (analysis history)
        analysisDate: analysis.analysisDate,
        diseaseDetected: analysis.diseaseDetected,
        diseaseProbability: analysis.diseaseProbability,
        diseaseDescription: analysis.diseaseDescription,
        healthStatus: analysis.healthStatus,
        healthScore: analysis.healthScore,
        nutrientDeficiencies: analysis.nutrientDeficiencies,
        nutrientExcess: analysis.nutrientExcess,
        recommendations: analysis.recommendations,
        additionalObservations: analysis.additionalObservations,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      };
    });
    
    logger.info(`Returning ${transformedAnalyses.length} analyses (excludeImages: ${excludeImages})`);
    
    // If pagination metadata is requested, include it
    if (includePagination) {
      const total = await PlantAnalysisModel.countByUser(userId);
      res.json({
        data: transformedAnalyses,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + transformedAnalyses.length < total,
        },
      });
    } else {
      res.json(transformedAnalyses);
    }
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
    
    // Transform the flat database structure to match frontend expectations
    const analysisResult = {
      disease: analysis.diseaseDetected ? {
        name: analysis.diseaseDetected,
        confidence: analysis.diseaseProbability ? parseFloat(analysis.diseaseProbability.toString()) : 0,
        description: analysis.diseaseDescription || '',
      } : null,
      health: {
        status: analysis.healthStatus as 'healthy' | 'minor issues' | 'moderate issues' | 'severe issues',
        score: analysis.healthScore,
      },
      nutrients: {
        deficiencies: analysis.nutrientDeficiencies ? analysis.nutrientDeficiencies.split(',').map(s => s.trim()).filter(Boolean) : [],
        excess: analysis.nutrientExcess ? analysis.nutrientExcess.split(',').map(s => s.trim()).filter(Boolean) : [],
      },
      recommendations: analysis.recommendations ? analysis.recommendations.split('\n').filter(Boolean) : [],
      additionalObservations: analysis.additionalObservations ? analysis.additionalObservations.split('\n').filter(Boolean) : [],
    };

    const transformedAnalysis = {
      id: analysis.id,
      userId: analysis.userId,
      imageData: analysis.imageData, // Always include for individual requests
      plantType: analysis.plantType,
      fieldId: analysis.fieldId,
      cropId: analysis.cropId,
      notes: analysis.notes,
      location: undefined, // Not stored in DB currently
      coordinates: undefined, // Not stored in DB currently
      analysisResult,
      createdAt: analysis.createdAt,
      updatedAt: analysis.updatedAt,
    };
    
    res.json(transformedAnalysis);
  }

  static async byField(req: Request, res: Response) {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.fieldId);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (isNaN(fieldId))
      return res.status(400).json({ message: "Invalid field ID" });
    // TODO: check field ownership
    const excludeImages = req.query.excludeImages === 'true' || req.query.excludeImages === true;
    const analyses = await PlantAnalysisModel.getByField(fieldId, excludeImages);
    
    // Transform to match frontend expectations
    const transformedAnalyses = analyses.map((analysis) => {
      const analysisResult = {
        disease: analysis.diseaseDetected ? {
          name: analysis.diseaseDetected,
          confidence: analysis.diseaseProbability ? parseFloat(analysis.diseaseProbability.toString()) : 0,
          description: analysis.diseaseDescription || '',
        } : null,
        health: {
          status: analysis.healthStatus as 'healthy' | 'minor issues' | 'moderate issues' | 'severe issues',
          score: analysis.healthScore,
        },
        nutrients: {
          deficiencies: analysis.nutrientDeficiencies ? analysis.nutrientDeficiencies.split(',').map(s => s.trim()).filter(Boolean) : [],
          excess: analysis.nutrientExcess ? analysis.nutrientExcess.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        recommendations: analysis.recommendations ? analysis.recommendations.split('\n').filter(Boolean) : [],
        additionalObservations: analysis.additionalObservations ? analysis.additionalObservations.split('\n').filter(Boolean) : [],
      };

      return {
        id: analysis.id,
        userId: analysis.userId,
        imageData: excludeImages ? undefined : (analysis as any).imageData,
        plantType: analysis.plantType,
        fieldId: analysis.fieldId,
        cropId: analysis.cropId,
        notes: analysis.notes,
        location: undefined,
        coordinates: undefined,
        analysisResult,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      };
    });
    
    res.json(transformedAnalyses);
  }

  static async byCrop(req: Request, res: Response) {
    const userId = req.user?.id;
    const cropId = parseInt(req.params.cropId);
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    if (isNaN(cropId))
      return res.status(400).json({ message: "Invalid crop ID" });
    // TODO: check crop ownership
    const excludeImages = req.query.excludeImages === 'true' || req.query.excludeImages === true;
    const analyses = await PlantAnalysisModel.getByCrop(cropId, excludeImages);
    
    // Transform to match frontend expectations
    const transformedAnalyses = analyses.map((analysis) => {
      const analysisResult = {
        disease: analysis.diseaseDetected ? {
          name: analysis.diseaseDetected,
          confidence: analysis.diseaseProbability ? parseFloat(analysis.diseaseProbability.toString()) : 0,
          description: analysis.diseaseDescription || '',
        } : null,
        health: {
          status: analysis.healthStatus as 'healthy' | 'minor issues' | 'moderate issues' | 'severe issues',
          score: analysis.healthScore,
        },
        nutrients: {
          deficiencies: analysis.nutrientDeficiencies ? analysis.nutrientDeficiencies.split(',').map(s => s.trim()).filter(Boolean) : [],
          excess: analysis.nutrientExcess ? analysis.nutrientExcess.split(',').map(s => s.trim()).filter(Boolean) : [],
        },
        recommendations: analysis.recommendations ? analysis.recommendations.split('\n').filter(Boolean) : [],
        additionalObservations: analysis.additionalObservations ? analysis.additionalObservations.split('\n').filter(Boolean) : [],
      };

      return {
        id: analysis.id,
        userId: analysis.userId,
        imageData: excludeImages ? undefined : (analysis as any).imageData,
        plantType: analysis.plantType,
        fieldId: analysis.fieldId,
        cropId: analysis.cropId,
        notes: analysis.notes,
        location: undefined,
        coordinates: undefined,
        analysisResult,
        createdAt: analysis.createdAt,
        updatedAt: analysis.updatedAt,
      };
    });
    
    res.json(transformedAnalyses);
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
      createPestReport: requestPestReport,
    } = req.body;
    if (!imageData)
      return res.status(400).json({ message: "Image data is required" });
    try {
      // Compress image before storing to reduce database size (optional - works without sharp)
      let imageToStore = String(imageData);
      try {
        logger.info('Compressing image before storage...');
        const compressedImageData = await compressImageForStorage(String(imageData));
        imageToStore = compressedImageData;
        logger.info('Image compression completed');
      } catch (compressionError) {
        logger.warn('Image compression failed, storing original image:', compressionError);
        // Continue with original image if compression fails
      }
      
      const analysisResult = await analyzePlantImage(
        String(imageData), // Use original for analysis (better quality)
        plantType,
        notes
      );
      const plantAnalysisData = createPlantAnalysis(
        imageToStore, // Store compressed version (or original if compression failed)
        analysisResult,
        userId,
        plantType,
        fieldId ? parseInt(fieldId) : undefined,
        cropId ? parseInt(cropId) : undefined,
        notes
      );
      insertPlantAnalysisSchema.parse(plantAnalysisData);
      const saved = await PlantAnalysisModel.create(plantAnalysisData);

      // Notify user that diagnosis is ready (in-app + push)
      try {
        const { createNotification } = await import("../services/notifications.js");
        const resultSummary = saved.diseaseDetected
          ? `Possible issue: ${saved.diseaseDetected}. Tap to view details.`
          : "Your plant looks healthy. Tap to view full report.";
        await createNotification({
          userId: saved.userId,
          type: "diagnosis_ready",
          title: "Plant diagnosis ready",
          message: resultSummary,
          data: { analysisId: saved.id },
          actionUrl: `/diagnosis/${saved.id}`,
        });
      } catch (notifErr) {
        logger.warn("Diagnosis ready notification failed", { analysisId: saved.id, err: notifErr });
      }

      // Emit a diagnosis follow-up decision so it appears on home (architecture §4.4)
      try {
        const { createDiagnosisFollowUpDecision } = await import(
          "../services/decisionEngineService.js"
        );
        await createDiagnosisFollowUpDecision(saved.userId, saved.id, {
          fieldId: saved.fieldId ?? undefined,
          cropId: saved.cropId ?? undefined,
          diseaseDetected: saved.diseaseDetected ?? undefined,
        });
      } catch (decisionErr) {
        logger.warn("Diagnosis follow-up decision creation failed", { analysisId: saved.id, err: decisionErr });
      }

      // Pest/disease reporting: only run when explicitly requested (reduces API/DB load after diagnosis)
      const runPestReport = requestPestReport === true || requestPestReport === "true";
      if (runPestReport) {
        try {
          logger.info("🔬 Starting pest reporting integration for analysis:", saved.id);
          const userLocation = location || (await getUserLocation(userId));
          if (userLocation) {
            const { createPestReportFromAnalysis } = await import(
              "../services/pest-alert-service.js"
            );
            const enhancedAnalysisResult = {
              ...analysisResult,
              cropType: plantType,
              images: [imageData],
              notes,
              coordinates,
              userId,
              plantAnalysisId: saved.id,
            };
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
          logger.error("❌ Error creating pest report from analysis:", pestError);
        }
      }

      res.status(201).json({
        ...saved,
        pestReportingEnabled: !!runPestReport,
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
