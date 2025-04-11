import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import { insertFieldSchema } from "@shared/schema";

/**
 * Register all field-related routes
 */
export function registerFieldRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  
  // Get all fields for a user
  app.get("/api/fields", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fields = await storage.getFields(req.user.id);
      res.json(fields);
    } catch (error) {
      console.error("Error fetching fields:", error);
      res.status(500).json({ message: "Failed to retrieve fields" });
    }
  });
  
  // Get a specific field
  app.get("/api/fields/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      const field = await storage.getField(fieldId);
      
      if (!field) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      // Check if the user owns this field
      if (field.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this field" });
      }
      
      res.json(field);
    } catch (error) {
      console.error("Error fetching field:", error);
      res.status(500).json({ message: "Failed to retrieve field" });
    }
  });
  
  // Create a new field
  app.post("/api/fields", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldData = insertFieldSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newField = await storage.createField(fieldData);
      
      res.status(201).json(newField);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating field:", error);
        res.status(500).json({ message: "Failed to create field" });
      }
    }
  });
  
  // Update a field
  app.patch("/api/fields/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and user owns it
      const existingField = await storage.getField(fieldId);
      if (!existingField) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (existingField.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this field" });
      }
      
      const fieldData = insertFieldSchema.partial().parse(req.body);
      
      // Ensure userId cannot be changed
      delete fieldData.userId;
      
      const updatedField = await storage.updateField(fieldId, fieldData);
      
      res.json(updatedField);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating field:", error);
        res.status(500).json({ message: "Failed to update field" });
      }
    }
  });
  
  // Delete a field
  app.delete("/api/fields/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and user owns it
      const existingField = await storage.getField(fieldId);
      if (!existingField) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (existingField.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this field" });
      }
      
      const success = await storage.deleteField(fieldId);
      
      if (success) {
        res.json({ success: true, message: "Field deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete field" });
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      res.status(500).json({ message: "Failed to delete field" });
    }
  });

  // Get all crops for a specific field
  app.get("/api/fields/:fieldId/crops", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.fieldId);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and user owns it
      const existingField = await storage.getField(fieldId);
      if (!existingField) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (existingField.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this field's crops" });
      }
      
      const crops = await storage.getCropsByField(fieldId);
      
      res.json(crops);
    } catch (error) {
      console.error("Error fetching field crops:", error);
      res.status(500).json({ message: "Failed to retrieve field crops" });
    }
  });

  // Get all plant analyses for a specific field
  app.get("/api/fields/:fieldId/plant-analyses", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.fieldId);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and user owns it
      const existingField = await storage.getField(fieldId);
      if (!existingField) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (existingField.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this field's plant analyses" });
      }
      
      const analyses = await storage.getPlantAnalysisByField(fieldId);
      
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching field plant analyses:", error);
      res.status(500).json({ message: "Failed to retrieve field plant analyses" });
    }
  });

  // Get all tasks for a specific field
  app.get("/api/fields/:fieldId/tasks", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const fieldId = parseInt(req.params.fieldId);
      if (isNaN(fieldId)) {
        return res.status(400).json({ message: "Invalid field ID" });
      }
      
      // Check if field exists and user owns it
      const existingField = await storage.getField(fieldId);
      if (!existingField) {
        return res.status(404).json({ message: "Field not found" });
      }
      
      if (existingField.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this field's tasks" });
      }
      
      const tasks = await storage.getTasksByField(fieldId);
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching field tasks:", error);
      res.status(500).json({ message: "Failed to retrieve field tasks" });
    }
  });

  console.log("✅ Field routes registered");
}