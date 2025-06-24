import { db } from "../db.js";
import { crops } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface Crop {
  id: number;
  userId: number;
  name: string;
  variety: string | null;
  status: string;
  fieldId: number | null;
  fieldSize: string | null;
  sizeUnit: string | null;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  actualHarvestDate: string | null;
  expectedYield: string | null;
  actualYield: string | null;
  yieldUnit: string | null;
  notes: string | null;
  batchId: string | null;
  seedSource: string | null;
  seedVariety: string | null;
  organicCertified: boolean;
  certificationId: string | null;
  blockchainTxId: string | null;
  traceabilityQrCode: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCropData {
  name: string;
  variety?: string;
  status?: string;
  fieldId?: number;
  fieldSize?: string;
  sizeUnit?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  expectedYield?: string;
  actualYield?: string;
  yieldUnit?: string;
  notes?: string;
  batchId?: string;
  seedSource?: string;
  seedVariety?: string;
  organicCertified?: boolean;
  certificationId?: string;
  blockchainTxId?: string;
  traceabilityQrCode?: string;
}

export interface UpdateCropData {
  name?: string;
  variety?: string;
  status?: string;
  fieldId?: number;
  fieldSize?: string;
  sizeUnit?: string;
  plantingDate?: string;
  expectedHarvestDate?: string;
  actualHarvestDate?: string;
  expectedYield?: string;
  actualYield?: string;
  yieldUnit?: string;
  notes?: string;
  batchId?: string;
  seedSource?: string;
  seedVariety?: string;
  organicCertified?: boolean;
  certificationId?: string;
  blockchainTxId?: string;
  traceabilityQrCode?: string;
}

export class CropModel {
  /**
   * Find crop by ID
   */
  static async findById(id: number): Promise<Crop | null> {
    try {
      const result = await db
        .select()
        .from(crops)
        .where(eq(crops.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as Crop;
    } catch (error) {
      throw new Error(
        `Failed to find crop by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Find crop by ID and user ID (for authorization)
   */
  static async findByIdAndUserId(
    id: number,
    userId: number
  ): Promise<Crop | null> {
    try {
      const result = await db
        .select()
        .from(crops)
        .where(and(eq(crops.id, id), eq(crops.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as Crop;
    } catch (error) {
      throw new Error(
        `Failed to find crop by ID and user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all crops for a user
   */
  static async findByUserId(userId: number): Promise<Crop[]> {
    try {
      const result = await db
        .select()
        .from(crops)
        .where(eq(crops.userId, userId))
        .orderBy(crops.createdAt);

      return result as Crop[];
    } catch (error) {
      throw new Error(
        `Failed to find crops by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get crops by field ID
   */
  static async findByFieldId(fieldId: number): Promise<Crop[]> {
    try {
      const result = await db
        .select()
        .from(crops)
        .where(eq(crops.fieldId, fieldId))
        .orderBy(crops.createdAt);

      return result as Crop[];
    } catch (error) {
      throw new Error(
        `Failed to find crops by field ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a new crop
   */
  static async create(
    cropData: CreateCropData & { userId: number }
  ): Promise<Crop> {
    try {
      const result = await db
        .insert(crops)
        .values({
          name: cropData.name,
          userId: cropData.userId,
          variety: cropData.variety || null,
          status: cropData.status || "planning",
          fieldId: cropData.fieldId || null,
          fieldSize: cropData.fieldSize || null,
          sizeUnit: cropData.sizeUnit || "hectares",
          plantingDate: cropData.plantingDate || null,
          expectedHarvestDate: cropData.expectedHarvestDate || null,
          actualHarvestDate: cropData.actualHarvestDate || null,
          expectedYield: cropData.expectedYield || null,
          actualYield: cropData.actualYield || null,
          yieldUnit: cropData.yieldUnit || "kg",
          notes: cropData.notes || null,
          batchId: cropData.batchId || null,
          seedSource: cropData.seedSource || null,
          seedVariety: cropData.seedVariety || null,
          organicCertified: cropData.organicCertified || false,
          certificationId: cropData.certificationId || null,
          blockchainTxId: cropData.blockchainTxId || null,
          traceabilityQrCode: cropData.traceabilityQrCode || null,
        })
        .returning();

      return result[0] as Crop;
    } catch (error) {
      throw new Error(
        `Failed to create crop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update crop
   */
  static async update(
    id: number,
    cropData: UpdateCropData
  ): Promise<Crop | null> {
    try {
      const updates: any = {};

      if (cropData.name !== undefined) {
        updates.name = cropData.name;
      }

      if (cropData.variety !== undefined) {
        updates.variety = cropData.variety;
      }

      if (cropData.status !== undefined) {
        updates.status = cropData.status;
      }

      if (cropData.fieldId !== undefined) {
        updates.fieldId = cropData.fieldId;
      }

      if (cropData.fieldSize !== undefined) {
        updates.fieldSize = cropData.fieldSize;
      }

      if (cropData.sizeUnit !== undefined) {
        updates.sizeUnit = cropData.sizeUnit;
      }

      if (cropData.plantingDate !== undefined) {
        updates.plantingDate = cropData.plantingDate;
      }

      if (cropData.expectedHarvestDate !== undefined) {
        updates.expectedHarvestDate = cropData.expectedHarvestDate;
      }

      if (cropData.actualHarvestDate !== undefined) {
        updates.actualHarvestDate = cropData.actualHarvestDate;
      }

      if (cropData.expectedYield !== undefined) {
        updates.expectedYield = cropData.expectedYield;
      }

      if (cropData.actualYield !== undefined) {
        updates.actualYield = cropData.actualYield;
      }

      if (cropData.yieldUnit !== undefined) {
        updates.yieldUnit = cropData.yieldUnit;
      }

      if (cropData.notes !== undefined) {
        updates.notes = cropData.notes;
      }

      if (cropData.batchId !== undefined) {
        updates.batchId = cropData.batchId;
      }

      if (cropData.seedSource !== undefined) {
        updates.seedSource = cropData.seedSource;
      }

      if (cropData.seedVariety !== undefined) {
        updates.seedVariety = cropData.seedVariety;
      }

      if (cropData.organicCertified !== undefined) {
        updates.organicCertified = cropData.organicCertified;
      }

      if (cropData.certificationId !== undefined) {
        updates.certificationId = cropData.certificationId;
      }

      if (cropData.blockchainTxId !== undefined) {
        updates.blockchainTxId = cropData.blockchainTxId;
      }

      if (cropData.traceabilityQrCode !== undefined) {
        updates.traceabilityQrCode = cropData.traceabilityQrCode;
      }

      if (Object.keys(updates).length === 0) {
        return this.findById(id);
      }

      const result = await db
        .update(crops)
        .set(updates)
        .where(eq(crops.id, id))
        .returning();

      if (result.length === 0) {
        return null;
      }

      return result[0] as Crop;
    } catch (error) {
      throw new Error(
        `Failed to update crop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete crop
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db.delete(crops).where(eq(crops.id, id)).returning();

      return result.length > 0;
    } catch (error) {
      throw new Error(
        `Failed to delete crop: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Count crops for a user
   */
  static async countByUserId(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: crops.id })
        .from(crops)
        .where(eq(crops.userId, userId));

      return result.length;
    } catch (error) {
      throw new Error(
        `Failed to count crops by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Count crops by field ID
   */
  static async countByFieldId(fieldId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: crops.id })
        .from(crops)
        .where(eq(crops.fieldId, fieldId));

      return result.length;
    } catch (error) {
      throw new Error(
        `Failed to count crops by field ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
