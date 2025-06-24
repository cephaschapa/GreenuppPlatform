import { db } from "../db";
import { inventory, marketplaceListings } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type { Inventory, InsertInventory } from "@shared/schema";

export class InventoryModel {
  // Get inventory for a specific listing
  async getInventory(listingId: number): Promise<Inventory | undefined> {
    const results = await db
      .select()
      .from(inventory)
      .where(eq(inventory.listingId, listingId))
      .limit(1);

    return results[0];
  }

  // Create inventory for a listing
  async createInventory(
    listingId: number,
    quantity: number,
    lowStockThreshold: number = 5
  ): Promise<Inventory> {
    const [inventoryRecord] = await db
      .insert(inventory)
      .values({
        listingId,
        quantity: quantity.toString(),
        reservedQuantity: "0",
        availableQuantity: quantity.toString(),
        lowStockThreshold: lowStockThreshold.toString(),
      })
      .returning();

    return inventoryRecord;
  }

  // Update inventory for a listing
  async updateInventory(
    listingId: number,
    data: Partial<{
      quantity: number;
      reservedQuantity: number;
      availableQuantity: number;
      lowStockThreshold: number;
    }>
  ): Promise<Inventory | undefined> {
    const currentInventory = await this.getInventory(listingId);

    if (!currentInventory) {
      return this.createInventory(
        listingId,
        data.quantity || 0,
        data.lowStockThreshold || 5
      );
    }

    // Calculate available quantity based on current reserved quantity
    const currentQuantity =
      data.quantity !== undefined
        ? data.quantity
        : parseFloat(currentInventory.quantity);
    const currentLowStockThreshold =
      data.lowStockThreshold !== undefined
        ? data.lowStockThreshold
        : parseFloat(currentInventory.lowStockThreshold || "5");
    const reservedQuantity = parseFloat(
      currentInventory.reservedQuantity || "0"
    );
    const availableQuantity = currentQuantity - reservedQuantity;

    const [updatedInventory] = await db
      .update(inventory)
      .set({
        quantity: currentQuantity.toString(),
        availableQuantity: availableQuantity.toString(),
        lowStockThreshold: currentLowStockThreshold.toString(),
        lastUpdated: new Date(),
      })
      .where(eq(inventory.listingId, listingId))
      .returning();

    return updatedInventory;
  }

  // Reserve inventory (for orders)
  async reserveInventory(
    listingId: number,
    quantity: number
  ): Promise<boolean> {
    const currentInventory = await this.getInventory(listingId);
    if (!currentInventory) return false;

    const currentReserved = parseFloat(
      currentInventory.reservedQuantity || "0"
    );
    const currentAvailable = parseFloat(currentInventory.availableQuantity);

    if (currentAvailable < quantity) return false;

    await db
      .update(inventory)
      .set({
        reservedQuantity: (currentReserved + quantity).toString(),
        availableQuantity: (currentAvailable - quantity).toString(),
        lastUpdated: new Date(),
      })
      .where(eq(inventory.listingId, listingId));

    return true;
  }

  // Release reserved inventory
  async releaseInventory(
    listingId: number,
    quantity: number
  ): Promise<boolean> {
    const currentInventory = await this.getInventory(listingId);
    if (!currentInventory) return false;

    const currentReserved = parseFloat(
      currentInventory.reservedQuantity || "0"
    );
    const currentAvailable = parseFloat(currentInventory.availableQuantity);

    if (currentReserved < quantity) return false;

    await db
      .update(inventory)
      .set({
        reservedQuantity: (currentReserved - quantity).toString(),
        availableQuantity: (currentAvailable + quantity).toString(),
        lastUpdated: new Date(),
      })
      .where(eq(inventory.listingId, listingId));

    return true;
  }

  // Get all inventory for a seller
  async getInventoryBySeller(
    sellerId: number
  ): Promise<(Inventory & { listing: any })[]> {
    // Get all listings for the seller
    const sellerListings = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, sellerId));

    // Get inventory for each listing
    const inventoryWithListings = await Promise.all(
      sellerListings.map(async (listing) => {
        const inventory = await this.getInventory(listing.id);
        return inventory
          ? {
              ...inventory,
              listing,
            }
          : null;
      })
    );

    return inventoryWithListings.filter(
      (item): item is Inventory & { listing: any } =>
        item !== null && item.id !== undefined
    );
  }

  // Check if inventory exists for a listing
  async inventoryExists(listingId: number): Promise<boolean> {
    const result = await this.getInventory(listingId);
    return !!result;
  }

  // Get low stock inventory for a seller
  async getLowStockInventory(
    sellerId: number
  ): Promise<(Inventory & { listing: any })[]> {
    const allInventory = await this.getInventoryBySeller(sellerId);

    return allInventory.filter((item) => {
      const availableQuantity = parseFloat(item.availableQuantity);
      const lowStockThreshold = parseFloat(item.lowStockThreshold || "5");
      return availableQuantity <= lowStockThreshold;
    });
  }

  // Get inventory statistics for a seller
  async getInventoryStats(sellerId: number): Promise<{
    totalListings: number;
    listingsWithInventory: number;
    totalQuantity: number;
    totalReserved: number;
    totalAvailable: number;
    lowStockCount: number;
  }> {
    const allInventory = await this.getInventoryBySeller(sellerId);

    const totalListings = allInventory.length;
    const listingsWithInventory = allInventory.filter((item) => item.id).length;

    const totalQuantity = allInventory.reduce(
      (sum, item) => sum + parseFloat(item.quantity),
      0
    );
    const totalReserved = allInventory.reduce(
      (sum, item) => sum + parseFloat(item.reservedQuantity || "0"),
      0
    );
    const totalAvailable = allInventory.reduce(
      (sum, item) => sum + parseFloat(item.availableQuantity),
      0
    );

    const lowStockCount = allInventory.filter((item) => {
      const availableQuantity = parseFloat(item.availableQuantity);
      const lowStockThreshold = parseFloat(item.lowStockThreshold || "5");
      return availableQuantity <= lowStockThreshold;
    }).length;

    return {
      totalListings,
      listingsWithInventory,
      totalQuantity,
      totalReserved,
      totalAvailable,
      lowStockCount,
    };
  }
}
