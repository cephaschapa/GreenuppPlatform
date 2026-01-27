import { db } from "../db.js";
import { plantAnalyses } from "@shared/schema";
import { eq, desc, count } from "drizzle-orm";
import type { PlantAnalysis, InsertPlantAnalysis } from "@shared/schema";

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export class PlantAnalysisModel {
  /**
   * Get total count of analyses for a user
   */
  static async countByUser(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(plantAnalyses)
      .where(eq(plantAnalyses.userId, userId));
    return result?.count ?? 0;
  }

  /**
   * Get all analyses for a user with pagination
   * @param userId - The user ID
   * @param excludeImages - If true, excludes imageData field to reduce payload size
   * @param pagination - Pagination options (limit, offset)
   */
  static async getAllByUser(
    userId: number, 
    excludeImages: boolean = false,
    pagination?: PaginationOptions
  ): Promise<PlantAnalysis[]> {
    const limit = pagination?.limit ?? 50; // Default 50 items per page
    const offset = pagination?.offset ?? 0;
    
    const baseQuery = db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.userId, userId))
      .orderBy(desc(plantAnalyses.createdAt))
      .limit(limit)
      .offset(offset);
    if (excludeImages) {
      // Select all fields except imageData to reduce payload size significantly
      return db
        .select({
          id: plantAnalyses.id,
          userId: plantAnalyses.userId,
          plantType: plantAnalyses.plantType,
          fieldId: plantAnalyses.fieldId,
          cropId: plantAnalyses.cropId,
          analysisDate: plantAnalyses.analysisDate,
          diseaseDetected: plantAnalyses.diseaseDetected,
          diseaseProbability: plantAnalyses.diseaseProbability,
          diseaseDescription: plantAnalyses.diseaseDescription,
          healthStatus: plantAnalyses.healthStatus,
          healthScore: plantAnalyses.healthScore,
          nutrientDeficiencies: plantAnalyses.nutrientDeficiencies,
          nutrientExcess: plantAnalyses.nutrientExcess,
          recommendations: plantAnalyses.recommendations,
          additionalObservations: plantAnalyses.additionalObservations,
          notes: plantAnalyses.notes,
          createdAt: plantAnalyses.createdAt,
          updatedAt: plantAnalyses.updatedAt,
        })
        .from(plantAnalyses)
        .where(eq(plantAnalyses.userId, userId))
        .orderBy(desc(plantAnalyses.createdAt))
        .limit(limit)
        .offset(offset);
    }
    
    // Include all fields including imageData
    return baseQuery;
  }

  static async getById(id: number): Promise<PlantAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.id, id));
    return analysis;
  }

  static async getByField(fieldId: number, excludeImages: boolean = false): Promise<PlantAnalysis[]> {
    if (excludeImages) {
      return db
        .select({
          id: plantAnalyses.id,
          userId: plantAnalyses.userId,
          plantType: plantAnalyses.plantType,
          fieldId: plantAnalyses.fieldId,
          cropId: plantAnalyses.cropId,
          analysisDate: plantAnalyses.analysisDate,
          diseaseDetected: plantAnalyses.diseaseDetected,
          diseaseProbability: plantAnalyses.diseaseProbability,
          diseaseDescription: plantAnalyses.diseaseDescription,
          healthStatus: plantAnalyses.healthStatus,
          healthScore: plantAnalyses.healthScore,
          nutrientDeficiencies: plantAnalyses.nutrientDeficiencies,
          nutrientExcess: plantAnalyses.nutrientExcess,
          recommendations: plantAnalyses.recommendations,
          additionalObservations: plantAnalyses.additionalObservations,
          notes: plantAnalyses.notes,
          createdAt: plantAnalyses.createdAt,
          updatedAt: plantAnalyses.updatedAt,
        })
        .from(plantAnalyses)
        .where(eq(plantAnalyses.fieldId, fieldId));
    }
    return db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.fieldId, fieldId));
  }

  static async getByCrop(cropId: number, excludeImages: boolean = false): Promise<PlantAnalysis[]> {
    if (excludeImages) {
      return db
        .select({
          id: plantAnalyses.id,
          userId: plantAnalyses.userId,
          plantType: plantAnalyses.plantType,
          fieldId: plantAnalyses.fieldId,
          cropId: plantAnalyses.cropId,
          analysisDate: plantAnalyses.analysisDate,
          diseaseDetected: plantAnalyses.diseaseDetected,
          diseaseProbability: plantAnalyses.diseaseProbability,
          diseaseDescription: plantAnalyses.diseaseDescription,
          healthStatus: plantAnalyses.healthStatus,
          healthScore: plantAnalyses.healthScore,
          nutrientDeficiencies: plantAnalyses.nutrientDeficiencies,
          nutrientExcess: plantAnalyses.nutrientExcess,
          recommendations: plantAnalyses.recommendations,
          additionalObservations: plantAnalyses.additionalObservations,
          notes: plantAnalyses.notes,
          createdAt: plantAnalyses.createdAt,
          updatedAt: plantAnalyses.updatedAt,
        })
        .from(plantAnalyses)
        .where(eq(plantAnalyses.cropId, cropId));
    }
    return db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.cropId, cropId));
  }

  static async create(data: InsertPlantAnalysis): Promise<PlantAnalysis> {
    const [created] = await db.insert(plantAnalyses).values(data).returning();
    return created;
  }

  static async delete(id: number): Promise<boolean> {
    const result = await db
      .delete(plantAnalyses)
      .where(eq(plantAnalyses.id, id));
    return (result?.rowCount ?? 0) > 0;
  }
}
