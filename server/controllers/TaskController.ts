import { Request, Response } from "express";
import {
  TaskModel,
  CreateTaskData,
  UpdateTaskData,
} from "../models/TaskModel.js";
import { FieldModel } from "../models/FieldModel.js";
import { CropModel } from "../models/CropModel.js";
import { logger } from "../lib/logger.js";

export class TaskController {
  /**
   * Get all tasks for the authenticated farmer
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const tasks = await TaskModel.findByUserId(req.user!.id);
      res.status(200).json(tasks);
    } catch (error) {
      logger.error("Failed to get tasks:", error);
      res.status(500).json({
        message: "Failed to retrieve tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get tasks by date
   */
  static async getByDate(req: Request, res: Response): Promise<void> {
    try {
      const dateParam = req.params.date;

      // Validate date format (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        res
          .status(400)
          .json({ message: "Invalid date format. Use YYYY-MM-DD" });
        return;
      }

      const tasks = await TaskModel.findByDate(req.user!.id, dateParam);
      res.status(200).json(tasks);
    } catch (error) {
      logger.error("Failed to get tasks by date:", error);
      res.status(500).json({
        message: "Failed to retrieve tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get tasks by date range
   */
  static async getByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const startDateParam = req.params.startDate;
      const endDateParam = req.params.endDate;

      // Validate date format (YYYY-MM-DD)
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(startDateParam) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(endDateParam)
      ) {
        res
          .status(400)
          .json({ message: "Invalid date format. Use YYYY-MM-DD" });
        return;
      }

      const startDate = new Date(startDateParam);
      const endDate = new Date(endDateParam);

      if (startDate > endDate) {
        res.status(400).json({ message: "Start date must be before end date" });
        return;
      }

      const tasks = await TaskModel.findByDateRange(
        req.user!.id,
        startDateParam,
        endDateParam
      );
      res.status(200).json(tasks);
    } catch (error) {
      logger.error("Failed to get tasks by date range:", error);
      res.status(500).json({
        message: "Failed to retrieve tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get tasks by priority
   */
  static async getByPriority(req: Request, res: Response): Promise<void> {
    try {
      const priority = req.params.priority;
      if (!["low", "medium", "high"].includes(priority)) {
        res.status(400).json({
          message: "Invalid priority. Must be 'low', 'medium', or 'high'",
        });
        return;
      }

      const tasks = await TaskModel.findByPriority(req.user!.id, priority);
      res.status(200).json(tasks);
    } catch (error) {
      logger.error("Failed to get tasks by priority:", error);
      res.status(500).json({
        message: "Failed to retrieve tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get tasks by crop ID
   */
  static async getByCrop(req: Request, res: Response): Promise<void> {
    try {
      const cropId = parseInt(req.params.cropId);
      if (isNaN(cropId)) {
        res.status(400).json({ message: "Invalid crop ID" });
        return;
      }

      // Verify crop belongs to user
      const crop = await CropModel.findByIdAndUserId(cropId, req.user!.id);
      if (!crop) {
        res.status(404).json({ message: "Crop not found" });
        return;
      }

      const tasks = await TaskModel.findByCropId(cropId);
      res.status(200).json(tasks);
    } catch (error) {
      logger.error("Failed to get tasks by crop:", error);
      res.status(500).json({
        message: "Failed to retrieve tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get tasks by field ID
   */
  static async getByField(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = parseInt(req.params.fieldId);
      if (isNaN(fieldId)) {
        res.status(400).json({ message: "Invalid field ID" });
        return;
      }

      // Verify field belongs to user
      const field = await FieldModel.findByIdAndUserId(fieldId, req.user!.id);
      if (!field) {
        res.status(404).json({ message: "Field not found" });
        return;
      }

      const tasks = await TaskModel.findByFieldId(fieldId);
      res.status(200).json(tasks);
    } catch (error) {
      logger.error("Failed to get tasks by field:", error);
      res.status(500).json({
        message: "Failed to retrieve tasks",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get a specific task by ID
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      const task = await TaskModel.findByIdAndUserId(taskId, req.user!.id);
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      res.status(200).json(task);
    } catch (error) {
      logger.error("Failed to get task:", error);
      res.status(500).json({
        message: "Failed to retrieve task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create a new task
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const taskData: CreateTaskData = req.body;

      // Basic validation
      if (!taskData.title) {
        res.status(400).json({
          message: "Task title is required",
        });
        return;
      }

      if (!taskData.dueDate) {
        res.status(400).json({
          message: "Due date is required",
        });
        return;
      }

      // If relatedCropId is provided, ensure it belongs to the user
      if (taskData.relatedCropId) {
        const crop = await CropModel.findByIdAndUserId(
          taskData.relatedCropId,
          req.user!.id
        );
        if (!crop) {
          res.status(404).json({ message: "Related crop not found" });
          return;
        }
      }

      // If relatedFieldId is provided, ensure it belongs to the user
      if (taskData.relatedFieldId) {
        const field = await FieldModel.findByIdAndUserId(
          taskData.relatedFieldId,
          req.user!.id
        );
        if (!field) {
          res.status(404).json({ message: "Related field not found" });
          return;
        }
      }

      const newTask = await TaskModel.create({
        ...taskData,
        userId: req.user!.id,
      });

      logger.info(`Task created: ${newTask.id} by user ${req.user!.id}`);
      res.status(201).json(newTask);
    } catch (error) {
      logger.error("Failed to create task:", error);
      res.status(500).json({
        message: "Failed to create task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update a task
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      // Check if task exists and belongs to user
      const existingTask = await TaskModel.findByIdAndUserId(
        taskId,
        req.user!.id
      );
      if (!existingTask) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const taskData: UpdateTaskData = req.body;

      // If changing relatedCropId, verify the new crop belongs to the user
      if (
        taskData.relatedCropId &&
        taskData.relatedCropId !== existingTask.relatedCropId
      ) {
        const crop = await CropModel.findByIdAndUserId(
          taskData.relatedCropId,
          req.user!.id
        );
        if (!crop) {
          res.status(404).json({ message: "Related crop not found" });
          return;
        }
      }

      // If changing relatedFieldId, verify the new field belongs to the user
      if (
        taskData.relatedFieldId &&
        taskData.relatedFieldId !== existingTask.relatedFieldId
      ) {
        const field = await FieldModel.findByIdAndUserId(
          taskData.relatedFieldId,
          req.user!.id
        );
        if (!field) {
          res.status(404).json({ message: "Related field not found" });
          return;
        }
      }

      const updatedTask = await TaskModel.update(taskId, taskData);

      if (!updatedTask) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      logger.info(`Task updated: ${taskId} by user ${req.user!.id}`);
      res.status(200).json(updatedTask);
    } catch (error) {
      logger.error("Failed to update task:", error);
      res.status(500).json({
        message: "Failed to update task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Complete a task
   */
  static async complete(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      // Check if task exists and belongs to user
      const existingTask = await TaskModel.findByIdAndUserId(
        taskId,
        req.user!.id
      );
      if (!existingTask) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const completedTask = await TaskModel.complete(taskId);

      if (!completedTask) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      logger.info(`Task completed: ${taskId} by user ${req.user!.id}`);
      res.status(200).json({
        success: true,
        message: "Task completed successfully",
        task: completedTask,
      });
    } catch (error) {
      logger.error("Failed to complete task:", error);
      res.status(500).json({
        message: "Failed to complete task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete a task
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.id);
      if (isNaN(taskId)) {
        res.status(400).json({ message: "Invalid task ID" });
        return;
      }

      // Check if task exists and belongs to user
      const existingTask = await TaskModel.findByIdAndUserId(
        taskId,
        req.user!.id
      );
      if (!existingTask) {
        res.status(404).json({ message: "Task not found" });
        return;
      }

      const success = await TaskModel.delete(taskId);

      if (success) {
        logger.info(`Task deleted: ${taskId} by user ${req.user!.id}`);
        res.status(200).json({
          success: true,
          message: "Task deleted successfully",
        });
      } else {
        res.status(500).json({ message: "Failed to delete task" });
      }
    } catch (error) {
      logger.error("Failed to delete task:", error);
      res.status(500).json({
        message: "Failed to delete task",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
