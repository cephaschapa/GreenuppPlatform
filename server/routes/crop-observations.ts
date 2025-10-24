import { Router } from "express";
import { db } from "../db";
import { cropObservations, fieldVisits } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Apply authentication to all routes
router.use(isAuthenticated);

/**
 * GET /api/crop-observations
 * Get all observations for the current user
 */
router.get("/", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { cropId, limit = "20" } = req.query;

    let query = db
      .select()
      .from(cropObservations)
      .where(eq(cropObservations.userId, userId))
      .orderBy(desc(cropObservations.observationDate))
      .limit(parseInt(limit as string));

    if (cropId) {
      query = db
        .select()
        .from(cropObservations)
        .where(
          and(
            eq(cropObservations.userId, userId),
            eq(cropObservations.cropId, parseInt(cropId as string))
          )
        )
        .orderBy(desc(cropObservations.observationDate))
        .limit(parseInt(limit as string));
    }

    const observations = await query;

    res.json(observations);
  } catch (error) {
    console.error("Error fetching observations:", error);
    res.status(500).json({ message: "Failed to fetch observations" });
  }
});

/**
 * POST /api/crop-observations
 * Create a new crop observation
 */
router.post("/", async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = req.body;

    const [observation] = await db
      .insert(cropObservations)
      .values({
        ...data,
        userId,
      })
      .returning();

    res.status(201).json(observation);
  } catch (error) {
    console.error("Error creating observation:", error);
    res.status(500).json({ message: "Failed to create observation" });
  }
});

/**
 * GET /api/crop-observations/:id
 * Get a specific observation
 */
router.get("/:id", async (req, res) => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);

    const [observation] = await db
      .select()
      .from(cropObservations)
      .where(
        and(eq(cropObservations.id, id), eq(cropObservations.userId, userId))
      );

    if (!observation) {
      return res.status(404).json({ message: "Observation not found" });
    }

    res.json(observation);
  } catch (error) {
    console.error("Error fetching observation:", error);
    res.status(500).json({ message: "Failed to fetch observation" });
  }
});

/**
 * GET /api/field-visits
 * Get all field visits for the current user
 */
router.get("/field-visits", async (req, res) => {
  try {
    const userId = req.user!.id;
    const { fieldId, limit = "20" } = req.query;

    let query = db
      .select()
      .from(fieldVisits)
      .where(eq(fieldVisits.userId, userId))
      .orderBy(desc(fieldVisits.visitDate))
      .limit(parseInt(limit as string));

    if (fieldId) {
      query = db
        .select()
        .from(fieldVisits)
        .where(
          and(
            eq(fieldVisits.userId, userId),
            eq(fieldVisits.fieldId, parseInt(fieldId as string))
          )
        )
        .orderBy(desc(fieldVisits.visitDate))
        .limit(parseInt(limit as string));
    }

    const visits = await query;

    res.json(visits);
  } catch (error) {
    console.error("Error fetching field visits:", error);
    res.status(500).json({ message: "Failed to fetch field visits" });
  }
});

/**
 * POST /api/field-visits
 * Create a new field visit log
 */
router.post("/field-visits", async (req, res) => {
  try {
    const userId = req.user!.id;
    const data = req.body;

    const [visit] = await db
      .insert(fieldVisits)
      .values({
        ...data,
        userId,
      })
      .returning();

    res.status(201).json(visit);
  } catch (error) {
    console.error("Error creating field visit:", error);
    res.status(500).json({ message: "Failed to create field visit" });
  }
});

export default router;
