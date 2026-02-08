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
import { getWeatherData } from "../weather.js";

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

    let location: Awaited<ReturnType<typeof resolveFarmLocation>> = null;
    try {
      location = await resolveFarmLocation(userId, farmLocationText);
    } catch (locErr: any) {
      logger.warn("GET /api/home: resolveFarmLocation failed", { userId, err: locErr?.message });
    }
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
      try {
        const { summary } = await getOrCreateWeatherSnapshot(userId, location);
        weather = summary;
      } catch (weatherErr: any) {
        logger.warn("GET /api/home: getOrCreateWeatherSnapshot failed", { userId, err: weatherErr?.message });
      }
    }

    const [tasks, fields, allCrops] = await Promise.all([
      TaskModel.findByUserId(userId),
      FieldModel.findByUserId(userId),
      CropModel.findByUserId(userId),
    ]);
    const cropsByFieldId = new Map<number, Crop[]>();
    for (const c of allCrops) {
      if (c.fieldId != null) {
        const arr = cropsByFieldId.get(c.fieldId) ?? [];
        arr.push(c);
        cropsByFieldId.set(c.fieldId, arr);
      }
    }

    let decisionsList = await getActiveDecisions(userId);
    if (decisionsList.length === 0) {
      const snapshot = location
        ? (await getLatestSnapshotForUser(userId))
        : null;
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

    let weatherAtCurrentLocation: typeof weather = null;
    const latParam = req.query.lat != null ? parseFloat(String(req.query.lat)) : NaN;
    const lngParam = req.query.lng != null ? parseFloat(String(req.query.lng)) : NaN;
    if (Number.isFinite(latParam) && Number.isFinite(lngParam)) {
      try {
        const currentWeatherData = await getWeatherData(`${latParam},${lngParam}`);
        const cur = currentWeatherData.current;
        const day0 = currentWeatherData.forecast?.[0];
        weatherAtCurrentLocation = {
          snapshotId: 0,
          source: "openweather_current",
          locationName: currentWeatherData.location ?? "Current location",
          currentTemp: cur.temp,
          condition: cur.condition,
          precipitationToday: day0 ? (typeof day0.precipitation === "number" ? day0.precipitation : 0) : 0,
          windSpeed: cur.windSpeed,
          uv: cur.uv ?? 0,
        };
      } catch (currErr: any) {
        logger.warn("GET /api/home: weather at current location failed", { lat: latParam, lng: lngParam, err: currErr?.message });
      }
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setDate(todayEnd.getDate() + 1);
    const in7Days = new Date(today);
    in7Days.setDate(in7Days.getDate() + 7);

    let overdue = 0;
    let dueSoon = 0;
    for (const t of tasks as Task[]) {
      if (t.completed) continue;
      const due = new Date(t.dueDate);
      if (due < todayEnd) overdue += 1;
      else if (due <= in7Days) dueSoon += 1;
    }

    const precipToday = weather?.precipitationToday ?? 0;
    const weatherRisk = precipToday >= 50;
    const fieldsPreview = fields.map((f) => {
      const fieldCrops = cropsByFieldId.get(f.id) ?? [];
      const first = fieldCrops[0];
      const cropLabel = first ? (first.name || (first as Crop).variety || "—") : "—";
      return {
        fieldId: f.id,
        crop: cropLabel,
        status: weatherRisk ? "Weather risk" : "OK",
      };
    });

    res.json({
      locationLabel,
      weather: weather ?? null,
      weatherAtCurrentLocation: weatherAtCurrentLocation ?? null,
      decisions,
      fieldsPreview,
      tasksSummary: { overdue, dueSoon },
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
