import { Router } from "express";
import { db } from "../db";
import {
  fieldCropPlans,
  fields,
  cropRef,
  seasons,
  seedVarieties,
  seedCompanies,
  yieldSimulationRuns,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { z } from "zod";
import { runAndPersistYieldSimulation } from "../services/yieldSimulationService";

const router = Router();

async function getPlanAndField(planId: number, userId: number) {
  const [row] = await db
    .select({
      planId: fieldCropPlans.id,
      fieldId: fieldCropPlans.fieldId,
      fieldUserId: fields.userId,
    })
    .from(fieldCropPlans)
    .innerJoin(fields, eq(fieldCropPlans.fieldId, fields.id))
    .where(eq(fieldCropPlans.id, planId))
    .limit(1);
  if (!row || row.fieldUserId !== userId) return null;
  return row;
}

const patchBody = z.object({
  seasonId: z.number().int().positive().optional(),
  cropId: z.number().int().positive().optional(),
  seedVarietyId: z.number().int().positive().nullable().optional(),
  targetAreaHa: z.string().or(z.number()).nullable().optional(),
  plantingDate: z.string().nullable().optional(),
  expectedHarvestDate: z.string().nullable().optional(),
  managementLevel: z.enum(["low", "medium", "high"]).optional(),
});

/** PATCH /api/crop-plans/:id — update crop plan (field owner only) */
router.patch("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const planId = parseInt(req.params.id, 10);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(planId)) return res.status(400).json({ error: "Invalid plan id" });

    const auth = await getPlanAndField(planId, userId);
    if (!auth) return res.status(404).json({ error: "Crop plan not found" });

    const parse = patchBody.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Validation failed", details: parse.error.flatten() });
    }
    const body = parse.data;

    const update: Record<string, unknown> = { updatedAt: new Date() };
    if (body.seasonId !== undefined) update.seasonId = body.seasonId;
    if (body.cropId !== undefined) update.cropId = body.cropId;
    if (body.seedVarietyId !== undefined) update.seedVarietyId = body.seedVarietyId;
    if (body.targetAreaHa !== undefined) update.targetAreaHa = body.targetAreaHa == null ? null : String(body.targetAreaHa);
    if (body.plantingDate !== undefined) update.plantingDate = body.plantingDate == null ? null : body.plantingDate.slice(0, 10);
    if (body.expectedHarvestDate !== undefined) update.expectedHarvestDate = body.expectedHarvestDate == null ? null : body.expectedHarvestDate.slice(0, 10);
    if (body.managementLevel !== undefined) update.managementLevel = body.managementLevel;

    const [updated] = await db
      .update(fieldCropPlans)
      .set(update as Partial<typeof fieldCropPlans.$inferInsert>)
      .where(eq(fieldCropPlans.id, planId))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("Update crop plan:", err);
    res.status(500).json({ error: "Failed to update crop plan" });
  }
});

/** POST /api/crop-plans/:id/simulate-yield — run yield simulation and store run (field owner only) */
router.post("/:id/simulate-yield", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const planId = parseInt(req.params.id, 10);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(planId)) return res.status(400).json({ error: "Invalid plan id" });

    const auth = await getPlanAndField(planId, userId);
    if (!auth) return res.status(404).json({ error: "Crop plan not found" });

    const locationOverride = typeof req.body?.location === "string" ? req.body.location : undefined;

    const { run, result } = await runAndPersistYieldSimulation(planId, { locationOverride });

    res.status(201).json({
      run: {
        id: run.id,
        fieldCropPlanId: run.fieldCropPlanId,
        runAt: run.runAt,
        methodVersion: run.methodVersion,
        inputs: run.inputs,
        outputs: run.outputs,
        explanation: run.explanation,
      },
      outputs: result.outputs,
      explanation: result.explanation,
    });
  } catch (err) {
    console.error("Simulate yield:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Failed to run yield simulation",
    });
  }
});

/** GET /api/crop-plans/:id/simulation-runs — list yield simulation runs for this plan (field owner only) */
router.get("/:id/simulation-runs", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const planId = parseInt(req.params.id, 10);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(planId)) return res.status(400).json({ error: "Invalid plan id" });

    const auth = await getPlanAndField(planId, userId);
    if (!auth) return res.status(404).json({ error: "Crop plan not found" });

    const runs = await db
      .select({
        id: yieldSimulationRuns.id,
        fieldCropPlanId: yieldSimulationRuns.fieldCropPlanId,
        runAt: yieldSimulationRuns.runAt,
        methodVersion: yieldSimulationRuns.methodVersion,
        inputs: yieldSimulationRuns.inputs,
        outputs: yieldSimulationRuns.outputs,
        explanation: yieldSimulationRuns.explanation,
      })
      .from(yieldSimulationRuns)
      .where(eq(yieldSimulationRuns.fieldCropPlanId, planId))
      .orderBy(desc(yieldSimulationRuns.runAt));

    res.json(runs);
  } catch (err) {
    console.error("List simulation runs:", err);
    res.status(500).json({ error: "Failed to fetch simulation runs" });
  }
});

/** DELETE /api/crop-plans/:id/simulation-runs/:runId — delete one simulation run (field owner only) */
router.delete("/:id/simulation-runs/:runId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const planId = parseInt(req.params.id, 10);
    const runId = parseInt(req.params.runId, 10);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(planId) || Number.isNaN(runId)) return res.status(400).json({ error: "Invalid plan id or run id" });

    const auth = await getPlanAndField(planId, userId);
    if (!auth) return res.status(404).json({ error: "Crop plan not found" });

    const [deleted] = await db
      .delete(yieldSimulationRuns)
      .where(and(eq(yieldSimulationRuns.id, runId), eq(yieldSimulationRuns.fieldCropPlanId, planId)))
      .returning({ id: yieldSimulationRuns.id });

    if (!deleted) return res.status(404).json({ error: "Simulation run not found" });
    res.status(204).send();
  } catch (err) {
    console.error("Delete simulation run:", err);
    res.status(500).json({ error: "Failed to delete simulation run" });
  }
});

/** GET /api/crop-plans/:id — get one crop plan with joins (field owner only) */
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const planId = parseInt(req.params.id, 10);
    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(planId)) return res.status(400).json({ error: "Invalid plan id" });

    const auth = await getPlanAndField(planId, userId);
    if (!auth) return res.status(404).json({ error: "Crop plan not found" });

    const [row] = await db
      .select({
        id: fieldCropPlans.id,
        fieldId: fieldCropPlans.fieldId,
        seasonId: fieldCropPlans.seasonId,
        cropId: fieldCropPlans.cropId,
        seedVarietyId: fieldCropPlans.seedVarietyId,
        targetAreaHa: fieldCropPlans.targetAreaHa,
        plantingDate: fieldCropPlans.plantingDate,
        expectedHarvestDate: fieldCropPlans.expectedHarvestDate,
        managementLevel: fieldCropPlans.managementLevel,
        createdAt: fieldCropPlans.createdAt,
        updatedAt: fieldCropPlans.updatedAt,
        cropName: cropRef.name,
        seasonName: seasons.name,
        seasonStartDate: seasons.startDate,
        seasonEndDate: seasons.endDate,
        varietyName: seedVarieties.name,
        varietyCode: seedVarieties.code,
        companyName: seedCompanies.name,
      })
      .from(fieldCropPlans)
      .innerJoin(cropRef, eq(fieldCropPlans.cropId, cropRef.id))
      .innerJoin(seasons, eq(fieldCropPlans.seasonId, seasons.id))
      .leftJoin(seedVarieties, eq(fieldCropPlans.seedVarietyId, seedVarieties.id))
      .leftJoin(seedCompanies, eq(seedVarieties.companyId, seedCompanies.id))
      .where(eq(fieldCropPlans.id, planId))
      .limit(1);

    if (!row) return res.status(404).json({ error: "Crop plan not found" });
    res.json(row);
  } catch (err) {
    console.error("Get crop plan:", err);
    res.status(500).json({ error: "Failed to fetch crop plan" });
  }
});

export default router;
