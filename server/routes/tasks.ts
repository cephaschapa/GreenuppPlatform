import { Router } from "express";
import { TaskController } from "../controllers/TaskController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

// Apply authentication middleware to all task routes
router.use(isAuthenticated);

// Task Management Routes

// Get all tasks for the authenticated farmer
router.get("/", TaskController.index);

// Get tasks by date
router.get("/date/:date", TaskController.getByDate);

// Get tasks by date range
router.get("/range/:startDate/:endDate", TaskController.getByDateRange);

// Get tasks by priority
router.get("/priority/:priority", TaskController.getByPriority);

// Get tasks by crop ID
router.get("/crops/:cropId", TaskController.getByCrop);

// Get tasks by field ID
router.get("/fields/:fieldId", TaskController.getByField);

// Get a specific task
router.get("/:id", TaskController.show);

// Create a new task
router.post("/", TaskController.create);

// Update a task
router.patch("/:id", TaskController.update);

// Complete a task
router.post("/:id/complete", TaskController.complete);

// Delete a task
router.delete("/:id", TaskController.delete);

export default router;
