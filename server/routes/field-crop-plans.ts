import { Router } from "express";
import { db } from "../db";
import {
  fields,
  fieldCropPlans,
  cropRef,
  seedVarieties,
  seasons,
  seedCompanies,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import { z } from "zod";

const router = Router({ mergeParams: true });

const createCropPlanBody = z.object({
  seasonId: z.number().int().positive(),
  cropId: z.number().int().positive(),
  seedVarietyId: z.number().int().positive().optional(),
  targetAreaHa: z.string().or(z.number()).optional(),
  plantingDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  expectedHarvestDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  managementLevel: z.enum(["low", "medium", "high"]).optional(),
});

/** GET /api/fields/:fieldId/crop-plans?seasonId= — list crop plans for field (optional season filter) */
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.fieldId, 10);
    const seasonId = req.query.seasonId ? parseInt(String(req.query.seasonId), 10) : undefined;

    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(fieldId)) return res.status(400).json({ error: "Invalid fieldId" });

    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
      .limit(1);

    if (!field) return res.status(404).json({ error: "Field not found" });

    const planColumns = {
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
    };

    const plansList = seasonId
      ? await db
          .select(planColumns)
          .from(fieldCropPlans)
          .innerJoin(cropRef, eq(fieldCropPlans.cropId, cropRef.id))
          .innerJoin(seasons, eq(fieldCropPlans.seasonId, seasons.id))
          .leftJoin(seedVarieties, eq(fieldCropPlans.seedVarietyId, seedVarieties.id))
          .leftJoin(seedCompanies, eq(seedVarieties.companyId, seedCompanies.id))
          .where(and(eq(fieldCropPlans.fieldId, fieldId), eq(fieldCropPlans.seasonId, seasonId)))
      : await db
          .select(planColumns)
          .from(fieldCropPlans)
          .innerJoin(cropRef, eq(fieldCropPlans.cropId, cropRef.id))
          .innerJoin(seasons, eq(fieldCropPlans.seasonId, seasons.id))
          .leftJoin(seedVarieties, eq(fieldCropPlans.seedVarietyId, seedVarieties.id))
          .leftJoin(seedCompanies, eq(seedVarieties.companyId, seedCompanies.id))
          .where(eq(fieldCropPlans.fieldId, fieldId));

    res.json(plansList);
  } catch (err) {
    console.error("List field crop plans:", err);
    res.status(500).json({ error: "Failed to fetch crop plans" });
  }
});

/** POST /api/fields/:fieldId/crop-plans — create crop plan (field owner only) */
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.fieldId, 10);

    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(fieldId)) return res.status(400).json({ error: "Invalid fieldId" });

    const parse = createCropPlanBody.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: "Validation failed", details: parse.error.flatten() });
    }
    const body = parse.data;

    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
      .limit(1);

    if (!field) return res.status(404).json({ error: "Field not found" });

    const targetAreaHa = body.targetAreaHa != null ? String(body.targetAreaHa) : null;
    const plantingDate = body.plantingDate != null ? body.plantingDate.slice(0, 10) : null;
    const expectedHarvestDate =
      body.expectedHarvestDate != null ? body.expectedHarvestDate.slice(0, 10) : null;

    const [created] = await db
      .insert(fieldCropPlans)
      .values({
        fieldId,
        seasonId: body.seasonId,
        cropId: body.cropId,
        seedVarietyId: body.seedVarietyId ?? null,
        targetAreaHa,
        plantingDate,
        expectedHarvestDate,
        managementLevel: body.managementLevel ?? "medium",
      })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    console.error("Create crop plan:", err);
    res.status(500).json({ error: "Failed to create crop plan" });
  }
});

/** DELETE /api/fields/:fieldId/crop-plans/:planId — delete crop plan (field owner only) */
router.delete("/:planId", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.fieldId, 10);
    const planId = parseInt(req.params.planId, 10);

    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(fieldId) || Number.isNaN(planId)) {
      return res.status(400).json({ error: "Invalid fieldId or planId" });
    }

    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
      .limit(1);

    if (!field) return res.status(404).json({ error: "Field not found" });

    const [deleted] = await db
      .delete(fieldCropPlans)
      .where(and(eq(fieldCropPlans.id, planId), eq(fieldCropPlans.fieldId, fieldId)))
      .returning();

    if (!deleted) return res.status(404).json({ error: "Crop plan not found" });

    res.json({ message: "Crop plan deleted", id: deleted.id });
  } catch (err) {
    console.error("Delete crop plan:", err);
    res.status(500).json({ error: "Failed to delete crop plan" });
  }
});

export default router;
