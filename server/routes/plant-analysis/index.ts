import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import { insertPlantAnalysisSchema } from "@shared/schema";
import multer from "multer";

/**
 * Register all plant analysis-related routes
 */
export function registerPlantAnalysisRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  
  // Configure multer for image uploads
  const multerStorage = multer.memoryStorage();
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
      files: 1
    }
  }).fields([
    { name: 'image', maxCount: 1 }
  ]);
  
  // Get all plant analyses for a user
  app.get("/api/plant-analyses", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const analyses = await storage.getPlantAnalyses(req.user.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching plant analyses:", error);
      res.status(500).json({ message: "Failed to retrieve plant analyses" });
    }
  });
  
  // Get a specific plant analysis
  app.get("/api/plant-analyses/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const analysisId = parseInt(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      
      const analysis = await storage.getPlantAnalysis(analysisId);
      
      if (!analysis) {
        return res.status(404).json({ message: "Plant analysis not found" });
      }
      
      // Check if the user owns this analysis
      if (analysis.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this analysis" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching plant analysis:", error);
      res.status(500).json({ message: "Failed to retrieve plant analysis" });
    }
  });
  
  // Get all plant analyses for a specific crop
  app.get("/api/crops/:cropId/plant-analyses", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Check if crop exists and user owns it
      const existingCrop = await storage.getCrop(cropId);
      if (!existingCrop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (existingCrop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this crop's analyses" });
      }
      
      const analyses = await storage.getPlantAnalysisByCrop(cropId);
      
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching crop plant analyses:", error);
      res.status(500).json({ message: "Failed to retrieve crop plant analyses" });
    }
  });
  
  // Create a new plant analysis with image upload
  app.post("/api/plant-analyses", isAuthenticated, (req, res, next) => {
    console.log("Starting plant analysis upload");
    
    // Handle image upload
    try {
      upload(req, res, (err) => {
        if (err) {
          console.error("Multer error:", err);
          return res.status(400).json({ 
            message: "Image upload error", 
            details: err.message 
          });
        }
        next();
      });
    } catch (error) {
      console.error("Critical error in file upload middleware:", error);
      return res.status(500).json({ message: "Server error processing image upload" });
    }
  }, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      console.log("Processing plant analysis data");
      
      // Process uploaded image
      let imageData;
      
      // Handle multer.fields() format
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      // Check for image in form data
      if (files && files.image && files.image.length > 0) {
        // Convert Buffer to base64 string for storage
        const base64 = files.image[0].buffer.toString('base64');
        imageData = `data:${files.image[0].mimetype};base64,${base64}`;
      } else if (req.body.imageData) {
        // Allow directly passing base64 image data in the request body
        imageData = req.body.imageData;
      } else {
        return res.status(400).json({ message: "Image is required for plant analysis" });
      }
      
      // Validate related resources
      if (req.body.fieldId) {
        const fieldId = parseInt(req.body.fieldId);
        const field = await storage.getField(fieldId);
        
        if (!field || field.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid or inaccessible field ID" });
        }
      }
      
      if (req.body.cropId) {
        const cropId = parseInt(req.body.cropId);
        const crop = await storage.getCrop(cropId);
        
        if (!crop || crop.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid or inaccessible crop ID" });
        }
      }
      
      console.log("Creating analysis with image data");
      
      // Ensure we have the necessary data, including user ID and image
      const analysisData = insertPlantAnalysisSchema.parse({
        ...req.body,
        userId: req.user.id,
        imageData: imageData,
        // Set default values for required fields if not provided
        healthStatus: req.body.healthStatus || 'unknown',
        healthScore: req.body.healthScore || 0,
      });
      
      // Create the analysis record
      const newAnalysis = await storage.createPlantAnalysis(analysisData);
      
      res.status(201).json(newAnalysis);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating plant analysis:", error);
        res.status(500).json({ message: "Failed to create plant analysis", error: error.message });
      }
    }
  });
  
  // Delete a plant analysis
  app.delete("/api/plant-analyses/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const analysisId = parseInt(req.params.id);
      if (isNaN(analysisId)) {
        return res.status(400).json({ message: "Invalid analysis ID" });
      }
      
      // Check if analysis exists and user owns it
      const existingAnalysis = await storage.getPlantAnalysis(analysisId);
      if (!existingAnalysis) {
        return res.status(404).json({ message: "Plant analysis not found" });
      }
      
      if (existingAnalysis.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this analysis" });
      }
      
      const success = await storage.deletePlantAnalysis(analysisId);
      
      if (success) {
        res.json({ success: true, message: "Plant analysis deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete plant analysis" });
      }
    } catch (error) {
      console.error("Error deleting plant analysis:", error);
      res.status(500).json({ message: "Failed to delete plant analysis" });
    }
  });

  console.log("✅ Plant analysis routes registered");
}