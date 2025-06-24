import { db } from "../db.js";
import { fields } from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface Field {
  id: number;
  userId: number;
  name: string;
  location: string | null;
  size: string | null;
  sizeUnit: string | null;
  soilType: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateFieldData {
  name: string;
  location?: string;
  size?: string;
  sizeUnit?: string;
  soilType?: string;
  notes?: string;
}

export interface UpdateFieldData {
  name?: string;
  location?: string;
  size?: string;
  sizeUnit?: string;
  soilType?: string;
  notes?: string;
}

export class FieldModel {
  /**
   * Find field by ID
   */
  static async findById(id: number): Promise<Field | null> {
    try {
      const result = await db
        .select()
        .from(fields)
        .where(eq(fields.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as Field;
    } catch (error) {
      throw new Error(
        `Failed to find field by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Find field by ID and user ID (for authorization)
   */
  static async findByIdAndUserId(
    id: number,
    userId: number
  ): Promise<Field | null> {
    try {
      const result = await db
        .select()
        .from(fields)
        .where(and(eq(fields.id, id), eq(fields.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as Field;
    } catch (error) {
      throw new Error(
        `Failed to find field by ID and user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all fields for a user
   */
  static async findByUserId(userId: number): Promise<Field[]> {
    try {
      const result = await db
        .select()
        .from(fields)
        .where(eq(fields.userId, userId))
        .orderBy(fields.createdAt);

      return result as Field[];
    } catch (error) {
      throw new Error(
        `Failed to find fields by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a new field
   */
  static async create(
    fieldData: CreateFieldData & { userId: number }
  ): Promise<Field> {
    try {
      const result = await db
        .insert(fields)
        .values({
          name: fieldData.name,
          userId: fieldData.userId,
          location: fieldData.location || null,
          size: fieldData.size || null,
          sizeUnit: fieldData.sizeUnit || "hectares",
          soilType: fieldData.soilType || null,
          notes: fieldData.notes || null,
        })
        .returning();

      return result[0] as Field;
    } catch (error) {
      throw new Error(
        `Failed to create field: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update field
   */
  static async update(
    id: number,
    fieldData: UpdateFieldData
  ): Promise<Field | null> {
    try {
      const updates: any = {};

      if (fieldData.name !== undefined) {
        updates.name = fieldData.name;
      }

      if (fieldData.location !== undefined) {
        updates.location = fieldData.location;
      }

      if (fieldData.size !== undefined) {
        updates.size = fieldData.size;
      }

      if (fieldData.sizeUnit !== undefined) {
        updates.sizeUnit = fieldData.sizeUnit;
      }

      if (fieldData.soilType !== undefined) {
        updates.soilType = fieldData.soilType;
      }

      if (fieldData.notes !== undefined) {
        updates.notes = fieldData.notes;
      }

      if (Object.keys(updates).length === 0) {
        return this.findById(id);
      }

      const result = await db
        .update(fields)
        .set(updates)
        .where(eq(fields.id, id))
        .returning();

      if (result.length === 0) {
        return null;
      }

      return result[0] as Field;
    } catch (error) {
      throw new Error(
        `Failed to update field: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete field
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(fields)
        .where(eq(fields.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      throw new Error(
        `Failed to delete field: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Count fields for a user
   */
  static async countByUserId(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: fields.id })
        .from(fields)
        .where(eq(fields.userId, userId));

      return result.length;
    } catch (error) {
      throw new Error(
        `Failed to count fields by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
