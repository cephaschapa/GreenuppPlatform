import { db } from "../db.js";
import { plantAnalyses } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { PlantAnalysis, InsertPlantAnalysis } from "@shared/schema";

export class PlantAnalysisModel {
  static async getAllByUser(userId: number): Promise<PlantAnalysis[]> {
    return db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.userId, userId));
  }

  static async getById(id: number): Promise<PlantAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.id, id));
    return analysis;
  }

  static async getByField(fieldId: number): Promise<PlantAnalysis[]> {
    return db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.fieldId, fieldId));
  }

  static async getByCrop(cropId: number): Promise<PlantAnalysis[]> {
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
