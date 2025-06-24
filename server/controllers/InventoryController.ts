import type { Request, Response } from "express";
import { InventoryModel } from "../models/InventoryModel";
import { MarketplaceModel } from "../models/MarketplaceModel";
import { logger } from "../lib/logger";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
} from "../lib/errors";

export class InventoryController {
  private model: InventoryModel;
  private marketplaceModel: MarketplaceModel;

  constructor() {
    this.model = new InventoryModel();
    this.marketplaceModel = new MarketplaceModel();
  }

  // Get inventory for a specific listing
  async getInventory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { listingId } = req.params;
      const listingIdNum = parseInt(listingId);

      if (isNaN(listingIdNum)) {
        throw new ValidationError("Invalid listing ID");
      }

      // Verify the listing belongs to the authenticated user
      const listing = await this.marketplaceModel.getListing(listingIdNum);
      if (!listing) {
        throw new NotFoundError("Listing not found");
      }

      if (listing.sellerId !== req.user.id) {
        throw new AuthorizationError(
          "You don't have permission to access this inventory"
        );
      }

      const inventory = await this.model.getInventory(listingIdNum);
      if (!inventory) {
        // Create default inventory if it doesn't exist
        const newInventory = await this.model.createInventory(
          listingIdNum,
          0,
          5
        );
        res.json(newInventory);
        return;
      }

      res.json(inventory);
    } catch (error) {
      logger.error("Error fetching inventory:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to retrieve inventory" });
      }
    }
  }

  // Update inventory for a listing
  async updateInventory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { listingId } = req.params;
      const listingIdNum = parseInt(listingId);

      if (isNaN(listingIdNum)) {
        throw new ValidationError("Invalid listing ID");
      }

      // Verify the listing belongs to the authenticated user
      const listing = await this.marketplaceModel.getListing(listingIdNum);
      if (!listing) {
        throw new NotFoundError("Listing not found");
      }

      if (listing.sellerId !== req.user.id) {
        throw new AuthorizationError(
          "You don't have permission to update this inventory"
        );
      }

      const { quantity, lowStockThreshold } = req.body;

      // Validate input
      if (quantity !== undefined && (isNaN(quantity) || quantity < 0)) {
        throw new ValidationError("Invalid quantity");
      }

      if (
        lowStockThreshold !== undefined &&
        (isNaN(lowStockThreshold) || lowStockThreshold < 0)
      ) {
        throw new ValidationError("Invalid low stock threshold");
      }

      const updateData: any = {};
      if (quantity !== undefined) {
        updateData.quantity = quantity;
      }
      if (lowStockThreshold !== undefined) {
        updateData.lowStockThreshold = lowStockThreshold;
      }

      const updatedInventory = await this.model.updateInventory(
        listingIdNum,
        updateData
      );

      if (!updatedInventory) {
        throw new DatabaseError("Failed to update inventory");
      }

      logger.info(
        `Inventory updated for listing ${listingIdNum} by user ${req.user.id}`
      );
      res.json(updatedInventory);
    } catch (error: unknown) {
      logger.error("Error updating inventory item:", error);
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  }

  // Create inventory for a listing
  async createInventory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { listingId, quantity, lowStockThreshold } = req.body;

      if (!listingId) {
        throw new ValidationError("Listing ID is required");
      }

      const listingIdNum = parseInt(listingId);
      if (isNaN(listingIdNum)) {
        throw new ValidationError("Invalid listing ID");
      }

      // Verify the listing belongs to the authenticated user
      const listing = await this.marketplaceModel.getListing(listingIdNum);
      if (!listing) {
        throw new NotFoundError("Listing not found");
      }

      if (listing.sellerId !== req.user.id) {
        throw new AuthorizationError(
          "You don't have permission to create inventory for this listing"
        );
      }

      // Check if inventory already exists
      const existingInventory = await this.model.getInventory(listingIdNum);
      if (existingInventory) {
        res.status(409).json({
          message: "Inventory already exists for this listing",
        });
        return;
      }

      const newInventory = await this.model.createInventory(
        listingIdNum,
        quantity || 0,
        lowStockThreshold || 5
      );

      logger.info(
        `Inventory created for listing ${listingIdNum} by user ${req.user.id}`
      );
      res.status(201).json(newInventory);
    } catch (error) {
      logger.error("Error creating inventory:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ message: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create inventory" });
      }
    }
  }

  // Get all inventory for a seller
  async getSellerInventory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const inventory = await this.model.getInventoryBySeller(req.user.id);
      res.json(inventory);
    } catch (error) {
      logger.error("Error fetching seller inventory:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        res.status(500).json({ message: "Failed to retrieve inventory" });
      }
    }
  }

  // Get low stock inventory for a seller
  async getLowStockInventory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const lowStockInventory = await this.model.getLowStockInventory(
        req.user.id
      );
      res.json(lowStockInventory);
    } catch (error) {
      logger.error("Error fetching low stock inventory:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        res
          .status(500)
          .json({ message: "Failed to retrieve low stock inventory" });
      }
    }
  }

  // Get inventory statistics for a seller
  async getInventoryStats(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const stats = await this.model.getInventoryStats(req.user.id);
      res.json(stats);
    } catch (error) {
      logger.error("Error fetching inventory stats:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else {
        res.status(500).json({ message: "Failed to retrieve inventory stats" });
      }
    }
  }

  // Reserve inventory (for orders)
  async reserveInventory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { listingId, quantity } = req.body;

      if (!listingId || !quantity) {
        throw new ValidationError("Listing ID and quantity are required");
      }

      const listingIdNum = parseInt(listingId);
      const quantityNum = parseInt(quantity);

      if (isNaN(listingIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
        throw new ValidationError("Invalid listing ID or quantity");
      }

      const success = await this.model.reserveInventory(
        listingIdNum,
        quantityNum
      );

      if (!success) {
        throw new ValidationError("Insufficient inventory available");
      }

      logger.info(
        `Inventory reserved: ${quantityNum} units for listing ${listingIdNum} by user ${req.user.id}`
      );
      res.json({ success: true, message: "Inventory reserved successfully" });
    } catch (error) {
      logger.error("Error reserving inventory:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to reserve inventory" });
      }
    }
  }

  // Release reserved inventory
  async releaseInventory(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { listingId, quantity } = req.body;

      if (!listingId || !quantity) {
        throw new ValidationError("Listing ID and quantity are required");
      }

      const listingIdNum = parseInt(listingId);
      const quantityNum = parseInt(quantity);

      if (isNaN(listingIdNum) || isNaN(quantityNum) || quantityNum <= 0) {
        throw new ValidationError("Invalid listing ID or quantity");
      }

      const success = await this.model.releaseInventory(
        listingIdNum,
        quantityNum
      );

      if (!success) {
        throw new ValidationError("Failed to release inventory");
      }

      logger.info(
        `Inventory released: ${quantityNum} units for listing ${listingIdNum} by user ${req.user.id}`
      );
      res.json({ success: true, message: "Inventory released successfully" });
    } catch (error) {
      logger.error("Error releasing inventory:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ message: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to release inventory" });
      }
    }
  }
}
