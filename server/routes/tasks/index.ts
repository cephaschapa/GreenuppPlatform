import type { Express, Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { storage } from "../../storage";
import { insertFarmerTaskSchema } from "@shared/schema";

/**
 * Register all task-related routes
 */
export function registerTaskRoutes(app: Express, isAuthenticated: (req: Request, res: Response, next: NextFunction) => void) {
  
  // Get all tasks for a user
  app.get("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const tasks = await storage.getTasksByUser(req.user.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to retrieve tasks" });
    }
  });
  
  // Get a specific task
  app.get("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Check if the user owns this task
      if (task.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to access this task" });
      }
      
      res.json(task);
    } catch (error) {
      console.error("Error fetching task:", error);
      res.status(500).json({ message: "Failed to retrieve task" });
    }
  });
  
  // Get tasks by priority
  app.get("/api/tasks/priority/:priority", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { priority } = req.params;
      
      if (!priority || !["low", "medium", "high"].includes(priority)) {
        return res.status(400).json({ message: "Invalid priority. Must be 'low', 'medium', or 'high'." });
      }
      
      const tasks = await storage.getTasksByPriority(req.user.id, priority);
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by priority:", error);
      res.status(500).json({ message: "Failed to retrieve tasks by priority" });
    }
  });
  
  // Get tasks for a specific date
  app.get("/api/tasks/date/:date", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { date } = req.params;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }
      
      const tasks = await storage.getTasksByDate(req.user.id, date);
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by date:", error);
      res.status(500).json({ message: "Failed to retrieve tasks by date" });
    }
  });
  
  // Get tasks for a date range
  app.get("/api/tasks/range/:startDate/:endDate", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const { startDate, endDate } = req.params;
      
      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate) || !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }
      
      const tasks = await storage.getTasksByDateRange(req.user.id, startDate, endDate);
      
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks by date range:", error);
      res.status(500).json({ message: "Failed to retrieve tasks by date range" });
    }
  });
  
  // Create a new task
  app.post("/api/tasks", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // Validate related resources
      if (req.body.relatedCropId) {
        const cropId = parseInt(req.body.relatedCropId);
        const crop = await storage.getCrop(cropId);
        
        if (!crop || crop.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid or inaccessible crop ID" });
        }
      }
      
      if (req.body.relatedFieldId) {
        const fieldId = parseInt(req.body.relatedFieldId);
        const field = await storage.getField(fieldId);
        
        if (!field || field.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid or inaccessible field ID" });
        }
      }
      
      const taskData = insertFarmerTaskSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newTask = await storage.createTask(taskData);
      
      res.status(201).json(newTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });
  
  // Update a task
  app.patch("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Check if task exists and user owns it
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this task" });
      }
      
      // Validate related resources
      if (req.body.relatedCropId) {
        const cropId = parseInt(req.body.relatedCropId);
        const crop = await storage.getCrop(cropId);
        
        if (!crop || crop.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid or inaccessible crop ID" });
        }
      }
      
      if (req.body.relatedFieldId) {
        const fieldId = parseInt(req.body.relatedFieldId);
        const field = await storage.getField(fieldId);
        
        if (!field || field.userId !== req.user.id) {
          return res.status(400).json({ message: "Invalid or inaccessible field ID" });
        }
      }
      
      const taskData = insertFarmerTaskSchema.partial().parse(req.body);
      
      // Ensure userId cannot be changed
      delete taskData.userId;
      
      const updatedTask = await storage.updateTask(taskId, taskData);
      
      res.json(updatedTask);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });
  
  // Mark a task as complete
  app.post("/api/tasks/:id/complete", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Check if task exists and user owns it
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to update this task" });
      }
      
      const updatedTask = await storage.updateTask(taskId, { completed: true });
      
      res.json(updatedTask);
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });
  
  // Delete a task
  app.delete("/api/tasks/:id", isAuthenticated, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      
      // Check if task exists and user owns it
      const existingTask = await storage.getTask(taskId);
      if (!existingTask) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (existingTask.userId !== req.user.id) {
        return res.status(403).json({ message: "You don't have permission to delete this task" });
      }
      
      const success = await storage.deleteTask(taskId);
      
      if (success) {
        res.json({ success: true, message: "Task deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete task" });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  console.log("✅ Task routes registered");
}