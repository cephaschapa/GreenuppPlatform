import { Router } from "express";
import { db } from "../db";
import { cropRef, seasons } from "@shared/schema";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

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

/** GET /api/reference/seasons — list seasons for planning */
router.get("/seasons", isAuthenticated, async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: seasons.id,
        name: seasons.name,
        startDate: seasons.startDate,
        endDate: seasons.endDate,
      })
      .from(seasons)
      .orderBy(seasons.startDate);
    res.json(rows);
  } catch (err) {
    console.error("List seasons:", err);
    res.status(500).json({ error: "Failed to fetch seasons" });
  }
});

export default router;
