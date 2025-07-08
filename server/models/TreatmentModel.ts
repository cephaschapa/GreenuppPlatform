import { db } from "../db";
import { treatmentPlans, treatmentSteps } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import type {
  TreatmentPlan,
  TreatmentStep,
  InsertTreatmentPlan,
  InsertTreatmentStep,
} from "@shared/schema";

export class TreatmentModel {
  // Get treatment plan by analysis ID
  async getTreatmentPlanByAnalysis(
    analysisId: number
  ): Promise<TreatmentPlan | undefined> {
    const results = await db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.analysisId, analysisId))
      .limit(1);

    return results[0];
  }

  // Get treatment plan by ID
  async getTreatmentPlan(id: number): Promise<TreatmentPlan | undefined> {
    const results = await db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.id, id))
      .limit(1);

    return results[0];
  }

  // Get all treatment plans for a user
  async getUserTreatmentPlans(userId: number): Promise<TreatmentPlan[]> {
    const results = await db
      .select()
      .from(treatmentPlans)
      .where(eq(treatmentPlans.userId, userId))
      .orderBy(treatmentPlans.createdAt);

    return results;
  }

  // Create treatment plan
  async createTreatmentPlan(data: InsertTreatmentPlan): Promise<TreatmentPlan> {
    const [plan] = await db.insert(treatmentPlans).values(data).returning();

    return plan;
  }

  // Update treatment plan
  async updateTreatmentPlan(
    id: number,
    data: Partial<InsertTreatmentPlan>
  ): Promise<TreatmentPlan | undefined> {
    const [updatedPlan] = await db
      .update(treatmentPlans)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(treatmentPlans.id, id))
      .returning();

    return updatedPlan;
  }

  // Delete treatment plan
  async deleteTreatmentPlan(id: number): Promise<boolean> {
    const result = await db
      .delete(treatmentPlans)
      .where(eq(treatmentPlans.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  // Get treatment steps for a plan
  async getTreatmentSteps(planId: number): Promise<TreatmentStep[]> {
    const results = await db
      .select()
      .from(treatmentSteps)
      .where(eq(treatmentSteps.treatmentPlanId, planId))
      .orderBy(treatmentSteps.stepNumber);

    return results;
  }

  // Create treatment step
  async createTreatmentStep(data: InsertTreatmentStep): Promise<TreatmentStep> {
    const [step] = await db.insert(treatmentSteps).values(data).returning();

    return step;
  }

  // Update treatment step
  async updateTreatmentStep(
    id: number,
    data: Partial<InsertTreatmentStep>
  ): Promise<TreatmentStep | undefined> {
    const [updatedStep] = await db
      .update(treatmentSteps)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(treatmentSteps.id, id))
      .returning();

    return updatedStep;
  }

  // Delete treatment step
  async deleteTreatmentStep(id: number): Promise<boolean> {
    const result = await db
      .delete(treatmentSteps)
      .where(eq(treatmentSteps.id, id));

    return (result.rowCount ?? 0) > 0;
  }

  // Get treatment plan with steps
  async getTreatmentPlanWithSteps(id: number): Promise<
    | {
        plan: TreatmentPlan;
        steps: TreatmentStep[];
      }
    | undefined
  > {
    const plan = await this.getTreatmentPlan(id);
    if (!plan) return undefined;

    const steps = await this.getTreatmentSteps(id);
    return { plan, steps };
  }

  // Get treatment plans by severity
  async getTreatmentPlansBySeverity(
    userId: number,
    severity: string
  ): Promise<TreatmentPlan[]> {
    const results = await db
      .select()
      .from(treatmentPlans)
      .where(
        and(
          eq(treatmentPlans.userId, userId),
          eq(treatmentPlans.severity, severity)
        )
      )
      .orderBy(treatmentPlans.createdAt);

    return results;
  }

  // Get treatment plans by disease type
  async getTreatmentPlansByDisease(
    userId: number,
    diseaseType: string
  ): Promise<TreatmentPlan[]> {
    const results = await db
      .select()
      .from(treatmentPlans)
      .where(
        and(
          eq(treatmentPlans.userId, userId),
          eq(treatmentPlans.diseaseType, diseaseType)
        )
      )
      .orderBy(treatmentPlans.createdAt);

    return results;
  }

  // Get treatment step by ID
  async getTreatmentStep(id: number): Promise<TreatmentStep | undefined> {
    const results = await db
      .select()
      .from(treatmentSteps)
      .where(eq(treatmentSteps.id, id))
      .limit(1);

    return results[0];
  }

  // Get treatment progress for a plan
  async getTreatmentProgress(planId: number): Promise<any[]> {
    // This would typically use a treatmentProgress table
    // For now, return an empty array as placeholder
    return [];
  }

  // Record treatment progress
  async recordTreatmentProgress(data: any): Promise<any> {
    // This would typically use a treatmentProgress table
    // For now, return a mock progress record
    return {
      id: Date.now(),
      treatmentStepId: data.treatmentStepId,
      userId: data.userId,
      applicationDate: new Date(),
      effectiveness: data.effectiveness || 3,
      observations: data.observations || "",
      weatherConditions: data.weatherConditions || "",
      createdAt: new Date(),
    };
  }
}
