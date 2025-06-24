import { Request, Response } from "express";
import {
  CropModel,
  CreateCropData,
  UpdateCropData,
} from "../models/CropModel.js";
import { FieldModel } from "../models/FieldModel.js";
import { logger } from "../lib/logger.js";
import { AuthenticationError } from "../lib/errors.js";

export class CropController {
  /**
   * Get all crops for the authenticated farmer
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const crops = await CropModel.findByUserId(req.user!.id);
      res.status(200).json(crops);
    } catch (error) {
      logger.error("Failed to get crops:", error);
      res.status(500).json({
        message: "Failed to retrieve crops",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get crops for a specific field
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

      const crops = await CropModel.findByFieldId(fieldId);
      res.status(200).json(crops);
    } catch (error) {
      logger.error("Failed to get crops for field:", error);
      res.status(500).json({
        message: "Failed to retrieve crops",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get a specific crop by ID
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        res.status(400).json({ message: "Invalid crop ID" });
        return;
      }

      const crop = await CropModel.findByIdAndUserId(cropId, req.user!.id);
      if (!crop) {
        res.status(404).json({ message: "Crop not found" });
        return;
      }

      res.status(200).json(crop);
    } catch (error) {
      logger.error("Failed to get crop:", error);
      res.status(500).json({
        message: "Failed to retrieve crop",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create a new crop
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?.id) {
        throw new AuthenticationError("Authentication required");
      }

      const cropData = {
        ...req.body,
        userId: req.user.id,
      };

      const newCrop = await CropModel.create(cropData);
      res.status(201).json(newCrop);
    } catch (error: unknown) {
      logger.error("Error creating crop:", error);
      res.status(500).json({ message: "Failed to create crop" });
    }
  }

  /**
   * Update a crop
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        res.status(400).json({ message: "Invalid crop ID" });
        return;
      }

      // Check if crop exists and belongs to user
      const existingCrop = await CropModel.findByIdAndUserId(
        cropId,
        req.user!.id
      );
      if (!existingCrop) {
        res.status(404).json({ message: "Crop not found" });
        return;
      }

      const cropData: UpdateCropData = req.body;

      // If changing the field, verify the new field belongs to the user
      if (cropData.fieldId && cropData.fieldId !== existingCrop.fieldId) {
        const field = await FieldModel.findByIdAndUserId(
          cropData.fieldId,
          req.user!.id
        );
        if (!field) {
          res.status(404).json({ message: "Field not found" });
          return;
        }
      }

      const updatedCrop = await CropModel.update(cropId, cropData);

      if (!updatedCrop) {
        res.status(404).json({ message: "Crop not found" });
        return;
      }

      logger.info(`Crop updated: ${cropId} by user ${req.user!.id}`);
      res.status(200).json(updatedCrop);
    } catch (error) {
      logger.error("Failed to update crop:", error);
      res.status(500).json({
        message: "Failed to update crop",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete a crop
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const cropId = parseInt(req.params.id);
      if (isNaN(cropId)) {
        res.status(400).json({ message: "Invalid crop ID" });
        return;
      }

      // Check if crop exists and belongs to user
      const existingCrop = await CropModel.findByIdAndUserId(
        cropId,
        req.user!.id
      );
      if (!existingCrop) {
        res.status(404).json({ message: "Crop not found" });
        return;
      }

      const success = await CropModel.delete(cropId);

      if (success) {
        logger.info(`Crop deleted: ${cropId} by user ${req.user!.id}`);
        res.status(200).json({
          success: true,
          message: "Crop deleted successfully",
        });
      } else {
        res.status(500).json({ message: "Failed to delete crop" });
      }
    } catch (error) {
      logger.error("Failed to delete crop:", error);
      res.status(500).json({
        message: "Failed to delete crop",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
