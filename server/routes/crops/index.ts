import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import { 
  insertCropSchema, 
  insertCropActivitySchema,
  insertCropYieldPredictionSchema 
} from "@shared/schema";
import { generateCropYieldPrediction } from "../../ai";

/**
 * Register all crop-related routes
 */
export function registerCropRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  
  // Get all crops for a user
  app.get("/api/crops", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const crops = await storage.getCrops(req.user.id);
      res.json(crops);
    } catch (error) {
      console.error("Error fetching crops:", error);
      res.status(500).json({ message: "Failed to retrieve crops" });
    }
  });
  
  // Get a specific crop
  app.get("/api/crops/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      const crop = await storage.getCrop(cropId);
      
      if (!crop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      // Check if the user owns this crop
      if (crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this crop" });
      }
      
      res.json(crop);
    } catch (error) {
      console.error("Error fetching crop:", error);
      res.status(500).json({ message: "Failed to retrieve crop" });
    }
  });
  
  // Create a new crop
  app.post("/api/crops", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropData = insertCropSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newCrop = await storage.createCrop(cropData);
      
      res.status(201).json(newCrop);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating crop:", error);
        res.status(500).json({ message: "Failed to create crop" });
      }
    }
  });
  
  // Update a crop
  app.patch("/api/crops/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Check if crop exists and user owns it
      const existingCrop = await storage.getCrop(cropId);
      if (!existingCrop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (existingCrop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this crop" });
      }
      
      const cropData = insertCropSchema.partial().parse(req.body);
      
      // Ensure userId cannot be changed
      delete cropData.userId;
      
      const updatedCrop = await storage.updateCrop(cropId, cropData);
      
      res.json(updatedCrop);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating crop:", error);
        res.status(500).json({ message: "Failed to update crop" });
      }
    }
  });
  
  // Delete a crop
  app.delete("/api/crops/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        return res.status(400).json({ message: "Invalid crop ID" });
      }
      
      // Check if crop exists and user owns it
      const existingCrop = await storage.getCrop(cropId);
      if (!existingCrop) {
        return res.status(404).json({ message: "Crop not found" });
      }
      
      if (existingCrop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this crop" });
      }
      
      const success = await storage.deleteCrop(cropId);
      
      if (success) {
        res.json({ success: true, message: "Crop deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete crop" });
      }
    } catch (error) {
      console.error("Error deleting crop:", error);
      res.status(500).json({ message: "Failed to delete crop" });
    }
  });

  // Crop Activities
  
  // Get activities for a specific crop
  app.get("/api/crops/:cropId/activities", isAuthenticated, async (req, res) => {
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
        return res.status(403).json({ message: "You don't have permission to access this crop's activities" });
      }
      
      const activities = await storage.getCropActivities(cropId);
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching crop activities:", error);
      res.status(500).json({ message: "Failed to retrieve crop activities" });
    }
  });

  // Get specific crop activity
  app.get("/api/crop-activities/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      const activity = await storage.getCropActivity(activityId);
      
      if (!activity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if user owns the crop related to this activity
      const crop = await storage.getCrop(activity.cropId);
      if (!crop || crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this activity" });
      }
      
      res.json(activity);
    } catch (error) {
      console.error("Error fetching crop activity:", error);
      res.status(500).json({ message: "Failed to retrieve crop activity" });
    }
  });
  
  // Create a new crop activity
  app.post("/api/crops/:cropId/activities", isAuthenticated, async (req, res) => {
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
        return res.status(403).json({ message: "You don't have permission to add activities to this crop" });
      }
      
      const activityData = insertCropActivitySchema.parse({
        ...req.body,
        cropId
      });
      
      const newActivity = await storage.createCropActivity(activityData);
      
      res.status(201).json(newActivity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating crop activity:", error);
        res.status(500).json({ message: "Failed to create crop activity" });
      }
    }
  });
  
  // Update a crop activity
  app.patch("/api/crop-activities/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Check if activity exists
      const existingActivity = await storage.getCropActivity(activityId);
      if (!existingActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if user owns the crop related to this activity
      const crop = await storage.getCrop(existingActivity.cropId);
      if (!crop || crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this activity" });
      }
      
      const activityData = insertCropActivitySchema.partial().parse(req.body);
      
      // Ensure cropId cannot be changed
      delete activityData.cropId;
      
      const updatedActivity = await storage.updateCropActivity(activityId, activityData);
      
      res.json(updatedActivity);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating crop activity:", error);
        res.status(500).json({ message: "Failed to update crop activity" });
      }
    }
  });
  
  // Delete a crop activity
  app.delete("/api/crop-activities/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activityId = parseInt(req.params.id);
      if (isNaN(activityId)) {
        return res.status(400).json({ message: "Invalid activity ID" });
      }
      
      // Check if activity exists
      const existingActivity = await storage.getCropActivity(activityId);
      if (!existingActivity) {
        return res.status(404).json({ message: "Activity not found" });
      }
      
      // Check if user owns the crop related to this activity
      const crop = await storage.getCrop(existingActivity.cropId);
      if (!crop || crop.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this activity" });
      }
      
      const success = await storage.deleteCropActivity(activityId);
      
      if (success) {
        res.json({ success: true, message: "Activity deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete activity" });
      }
    } catch (error) {
      console.error("Error deleting crop activity:", error);
      res.status(500).json({ message: "Failed to delete crop activity" });
    }
  });

  // Yield Predictions
  
  // Generate a crop yield prediction
  app.post("/api/crops/:cropId/predictions/generate", isAuthenticated, async (req, res) => {
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
        return res.status(403).json({ message: "You don't have permission to generate predictions for this crop" });
      }
      
      // Get the field information
      const field = existingCrop.fieldId 
        ? await storage.getField(existingCrop.fieldId)
        : null;
      
      // Prepare data for prediction
      const cropData = {
        cropId,
        cropType: existingCrop.name,
        plantingDate: existingCrop.plantingDate,
        harvestDate: existingCrop.expectedHarvestDate,
        fieldSize: field?.size,
        fieldLocation: field?.location,
        soilType: field?.soilType,
        // Add other relevant data that might be needed for prediction
      };
      
      // Generate the prediction
      const prediction = await generateCropYieldPrediction(cropData);
      
      // Save the prediction to the database
      const savedPrediction = await storage.createCropYieldPrediction(prediction);
      
      res.status(201).json(savedPrediction);
    } catch (error) {
      console.error("Error generating prediction:", error);
      res.status(500).json({ message: "Failed to generate prediction", error: error.message });
    }
  });
  
  // Get all yield predictions for a crop
  app.get("/api/crops/:cropId/predictions", isAuthenticated, async (req, res) => {
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
        return res.status(403).json({ message: "You don't have permission to access this crop's predictions" });
      }
      
      const predictions = await storage.getCropYieldPredictions(cropId);
      
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching crop predictions:", error);
      res.status(500).json({ message: "Failed to retrieve crop predictions" });
    }
  });
  
  // Manually create a crop yield prediction
  app.post("/api/crops/:cropId/predictions", isAuthenticated, async (req, res) => {
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
        return res.status(403).json({ message: "You don't have permission to add predictions to this crop" });
      }
      
      const predictionData = insertCropYieldPredictionSchema.parse({
        ...req.body,
        cropId
      });
      
      const newPrediction = await storage.createCropYieldPrediction(predictionData);
      
      res.status(201).json(newPrediction);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating crop prediction:", error);
        res.status(500).json({ message: "Failed to create crop prediction" });
      }
    }
  });
  
  // Endpoint for generic yield predictions (not associated with a particular crop)
  app.post("/api/crop-yield-predictions", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Prepare data for prediction
      const cropData = {
        cropId: 0, // Generic prediction not tied to a specific crop
        cropType: req.body.cropType,
        plantingDate: req.body.plantingDate,
        harvestDate: req.body.harvestDate,
        fieldSize: req.body.fieldSize,
        fieldLocation: req.body.fieldLocation,
        soilType: req.body.soilType,
        climate: req.body.climate,
        irrigation: req.body.irrigation,
        fertilizers: req.body.fertilizers,
      };
      
      // Generate the prediction
      const prediction = await generateCropYieldPrediction(cropData);
      
      // For generic predictions, we might not store them
      res.status(200).json(prediction);
    } catch (error) {
      console.error("Error generating generic prediction:", error);
      res.status(500).json({ message: "Failed to generate prediction", error: error.message });
    }
  });
  
  // Get crop recommendations
  app.get("/api/crop-recommendations", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { location, soilType, season } = req.query;
      
      // In a real implementation, this would use AI/ML to generate recommendations
      // For now, we'll return a static set of recommendations
      const recommendations = [
        {
          cropName: "Maize (Corn)",
          suitability: "High",
          profitPotential: "Medium",
          waterRequirements: "Medium",
          growthDuration: "3-4 months",
          bestPlantingTime: "Early rainy season",
          commonVarieties: ["SC403", "SC513", "SC627", "SC719"],
          challenges: ["Fall armyworm", "Drought susceptibility", "Stalk borers"],
          tips: "Plant early in the season to avoid peak pest pressure. Consider drought-tolerant varieties."
        },
        {
          cropName: "Soybean",
          suitability: "Medium-High",
          profitPotential: "Medium-High",
          waterRequirements: "Medium",
          growthDuration: "3-4 months",
          bestPlantingTime: "Early rainy season",
          commonVarieties: ["Safari", "Lukanga", "SC Serenade", "Kaleya"],
          challenges: ["Need for inoculation", "Susceptible to pod-sucking bugs"],
          tips: "Ensure proper inoculation for nitrogen fixation. Consider crop rotation with cereals."
        },
        {
          cropName: "Tomato",
          suitability: "Medium",
          profitPotential: "High",
          waterRequirements: "High",
          growthDuration: "3-4 months",
          bestPlantingTime: "Year-round with irrigation",
          commonVarieties: ["Roma VF", "Rio Grande", "Heinz", "Tengeru"],
          challenges: ["Blight diseases", "Whitefly", "Fruit worm"],
          tips: "Use staking or trellising for better air circulation. Implement crop rotation."
        }
      ];
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error fetching crop recommendations:", error);
      res.status(500).json({ message: "Failed to retrieve crop recommendations" });
    }
  });

  console.log("✅ Crop routes registered");
}