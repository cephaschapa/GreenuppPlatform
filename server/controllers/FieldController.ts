import { Request, Response } from "express";
import {
  FieldModel,
  CreateFieldData,
  UpdateFieldData,
} from "../models/FieldModel.js";
import { logger } from "../lib/logger.js";
import { AuthenticationError } from "../lib/errors.js";

export class FieldController {
  /**
   * Get all fields for the authenticated farmer
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const fields = await FieldModel.findByUserId(req.user!.id);
      res.status(200).json(fields);
    } catch (error) {
      logger.error("Failed to get fields:", error);
      res.status(500).json({
        message: "Failed to retrieve fields",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get a specific field by ID
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        res.status(400).json({ message: "Invalid field ID" });
        return;
      }

      const field = await FieldModel.findByIdAndUserId(fieldId, req.user!.id);
      if (!field) {
        res.status(404).json({ message: "Field not found" });
        return;
      }

      res.status(200).json(field);
    } catch (error) {
      logger.error("Failed to get field:", error);
      res.status(500).json({
        message: "Failed to retrieve field",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create a new field
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AuthenticationError("Authentication required");
      }

      const fieldData = {
        ...req.body,
        userId: req.user.id,
      };

      const newField = await FieldModel.create(fieldData);
      res.status(201).json(newField);
    } catch (error: unknown) {
      logger.error("Error creating field:", error);
      res.status(500).json({ message: "Failed to create field" });
    }
  }

  /**
   * Update a field
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        res.status(400).json({ message: "Invalid field ID" });
        return;
      }

      // Check if field exists and belongs to user
      const existingField = await FieldModel.findByIdAndUserId(
        fieldId,
        req.user!.id
      );
      if (!existingField) {
        res.status(404).json({ message: "Field not found" });
        return;
      }

      const fieldData: UpdateFieldData = req.body;
      const updatedField = await FieldModel.update(fieldId, fieldData);

      if (!updatedField) {
        res.status(404).json({ message: "Field not found" });
        return;
      }

      logger.info(`Field updated: ${fieldId} by user ${req.user!.id}`);
      res.status(200).json(updatedField);
    } catch (error) {
      logger.error("Failed to update field:", error);
      res.status(500).json({
        message: "Failed to update field",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete a field
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const fieldId = parseInt(req.params.id);
      if (isNaN(fieldId)) {
        res.status(400).json({ message: "Invalid field ID" });
        return;
      }

      // Check if field exists and belongs to user
      const existingField = await FieldModel.findByIdAndUserId(
        fieldId,
        req.user!.id
      );
      if (!existingField) {
        res.status(404).json({ message: "Field not found" });
        return;
      }

      const success = await FieldModel.delete(fieldId);

      if (success) {
        logger.info(`Field deleted: ${fieldId} by user ${req.user!.id}`);
        res.status(200).json({
          success: true,
          message: "Field deleted successfully",
        });
      } else {
        res.status(500).json({ message: "Failed to delete field" });
      }
    } catch (error) {
      logger.error("Failed to delete field:", error);
      res.status(500).json({
        message: "Failed to delete field",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
