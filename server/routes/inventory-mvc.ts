import type { Express } from "express";
import { InventoryController } from "../controllers/InventoryController";
import { isAuthenticated } from "../middleware/auth";

export function setupInventoryRoutes(app: Express) {
  const controller = new InventoryController();

  // Get inventory for a specific listing
  app.get(
    "/api/inventory/:listingId",
    isAuthenticated,
    controller.getInventory.bind(controller)
  );

  // Update inventory for a listing
  app.patch(
    "/api/inventory/:listingId",
    isAuthenticated,
    controller.updateInventory.bind(controller)
  );

  // Create inventory for a listing
  app.post(
    "/api/inventory",
    isAuthenticated,
    controller.createInventory.bind(controller)
  );

  // Get all inventory for a seller
  app.get(
    "/api/inventory",
    isAuthenticated,
    controller.getSellerInventory.bind(controller)
  );

  // Get low stock inventory for a seller
  app.get(
    "/api/inventory/low-stock",
    isAuthenticated,
    controller.getLowStockInventory.bind(controller)
  );

  // Get inventory statistics for a seller
  app.get(
    "/api/inventory/stats",
    isAuthenticated,
    controller.getInventoryStats.bind(controller)
  );

  // Reserve inventory (for orders)
  app.post(
    "/api/inventory/reserve",
    isAuthenticated,
    controller.reserveInventory.bind(controller)
  );

  // Release reserved inventory
  app.post(
    "/api/inventory/release",
    isAuthenticated,
    controller.releaseInventory.bind(controller)
  );
}
