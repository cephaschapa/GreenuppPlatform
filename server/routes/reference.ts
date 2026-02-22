import { Router } from "express";
import { db } from "../db";
import { cropRef, seasons } from "@shared/schema";
import { isAuthenticated } from "../middleware/auth";
import { getStagesForCropType, CROP_ACTIVITY_TYPES } from "../services/cropStageService";
import { getPlantingAdvisoryByLocation } from "../services/plantingAdvisoryService";

const router = Router();

/** GET /api/reference/crops/:cropName/stages — growth stages and advice for a crop type (e.g. Maize, Tomato) */
router.get("/crops/:cropName/stages", isAuthenticated, async (req, res) => {
  try {
    const cropName = decodeURIComponent((req.params as { cropName: string }).cropName || "");
    if (!cropName) return res.status(400).json({ error: "Crop name required" });
    const stages = await getStagesForCropType(cropName);
    res.json(stages);
  } catch (err) {
    console.error("Get crop type stages:", err);
    res.status(500).json({ error: "Failed to fetch stages" });
  }
});

/** GET /api/reference/activity-types — standard crop activity types (planting, spraying, weeding, etc.) */
router.get("/activity-types", isAuthenticated, (_req, res) => {
  res.json({ activityTypes: CROP_ACTIVITY_TYPES });
});

/** GET /api/reference/planting-advisory — best planting time and seed varieties by region and climate */
router.get("/planting-advisory", isAuthenticated, async (req, res) => {
  try {
    const location = (req.query.location as string)?.trim();
    const cropId = parseInt(req.query.cropId as string, 10);
    if (!location || Number.isNaN(cropId)) {
      return res.status(400).json({
        error: "Query params 'location' and 'cropId' (number) are required",
      });
    }
    const advisory = await getPlantingAdvisoryByLocation(location, cropId);
    if (!advisory) return res.status(404).json({ error: "Crop not found or location could not be resolved" });
    res.json(advisory);
  } catch (err) {
    console.error("Get planting advisory:", err);
    res.status(500).json({ error: "Failed to get planting advisory" });
  }
});

/** GET /api/reference/crops — list reference crops (crop_ref) for planning */
router.get("/crops", isAuthenticated, async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: cropRef.id,
        name: cropRef.name,
        category: cropRef.category,
      })
      .from(cropRef)
      .orderBy(cropRef.name);
    res.json(rows);
  } catch (err) {
    console.error("List reference crops:", err);
    res.status(500).json({ error: "Failed to fetch crops" });
  }
});

/** GET /api/reference/seasons — list seasons for planning (seeds defaults if empty) */
router.get("/seasons", isAuthenticated, async (_req, res) => {
  try {
    let rows = await db
      .select({
        id: seasons.id,
        name: seasons.name,
        startDate: seasons.startDate,
        endDate: seasons.endDate,
      })
      .from(seasons)
      .orderBy(seasons.startDate);

    if (rows.length === 0) {
      await db.insert(seasons).values([
        { name: "2025/26", startDate: "2025-10-01", endDate: "2026-04-30" },
        { name: "2026/27", startDate: "2026-10-01", endDate: "2027-04-30" },
      ]);
      rows = await db
        .select({
          id: seasons.id,
          name: seasons.name,
          startDate: seasons.startDate,
          endDate: seasons.endDate,
        })
        .from(seasons)
        .orderBy(seasons.startDate);
    }

    res.json(rows);
  } catch (err) {
    console.error("List seasons:", err);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});

export default router;
