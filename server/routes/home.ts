/**
 * GET /api/home
 * Returns weather summary + 1–3 decisions for the authenticated user.
 * Resolves farm location, gets/creates weather snapshot (cached), and ensures decisions exist.
 */

import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { resolveFarmLocation } from "../services/locationResolverService.js";
import {
  getOrCreateWeatherSnapshot,
  getLatestSnapshotForUser,
} from "../services/weatherObservationService.js";
import {
  getActiveDecisions,
  generateAndPersistDecisions,
} from "../services/decisionEngineService.js";
import { ProfileModel } from "../models/ProfileModel.js";
import { TaskModel } from "../models/TaskModel.js";
import { FieldModel } from "../models/FieldModel.js";
import { CropModel } from "../models/CropModel.js";
import type { Task } from "../models/TaskModel.js";
import type { Field } from "../models/FieldModel.js";
import type { Crop } from "../models/CropModel.js";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(isAuthenticated);

const profileModel = new ProfileModel();

router.get("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id ?? (req as any).session?.userId;
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const farmerProfile = await profileModel.getFarmerProfile(userId);
    const farmLocationText = farmerProfile?.farmLocation ?? null;

    const location = await resolveFarmLocation(userId, farmLocationText);
    const locationLabel = location?.locationName ?? farmLocationText ?? "Unknown";

    let weather: {
      snapshotId: number;
      source: string;
      locationName: string;
      currentTemp: number;
      condition: string;
      precipitationToday: number;
      windSpeed: number;
      uv: number;
    } | null = null;

    if (location) {
      const { summary } = await getOrCreateWeatherSnapshot(userId, location);
      weather = summary;
    }

    let decisionsList = await getActiveDecisions(userId);
    if (decisionsList.length === 0) {
      const snapshot = location
        ? (await getLatestSnapshotForUser(userId))
        : null;
      const tasks = await TaskModel.findByUserId(userId);
      const fields = await FieldModel.findByUserId(userId);
      const allCrops = await CropModel.findByUserId(userId);
      const cropsByFieldId = new Map<number, Crop[]>();
      for (const c of allCrops) {
        if (c.fieldId != null) {
          const arr = cropsByFieldId.get(c.fieldId) ?? [];
          arr.push(c);
          cropsByFieldId.set(c.fieldId, arr);
        }
      }
      await generateAndPersistDecisions(
        userId,
        snapshot,
        tasks as Task[],
        fields as Field[],
        cropsByFieldId
      );
      decisionsList = await getActiveDecisions(userId);
    }

    const decisions = decisionsList.map((d) => ({
      id: d.id,
      title: d.title,
      summary: d.summary,
      priority: d.priority,
      whyText: d.whyText,
      decisionType: d.decisionType,
      status: d.status,
      expiresAt: d.expiresAt,
    }));

    res.json({
      locationLabel,
      weather: weather ?? null,
      decisions,
    });
  } catch (err: any) {
    logger.error("GET /api/home failed", { err: err?.message ?? err });
    res.status(500).json({
      message: "Failed to load home data",
      error: err?.message ?? "Unknown error",
    });
  }
});

export default router;
