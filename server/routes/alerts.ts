/**
 * Hazard & pest alerts API: events (list/filter), user subscriptions, and test inject.
 */

import { Router, type Request, type Response } from "express";
import { db } from "../db.js";
import {
  alertEvents,
  userAlertSubscriptions,
  alertDeliveries,
  fields,
} from "@shared/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth.js";
import { eventMatchesUserPoint } from "../services/alerts/geo.js";
import type { GeoJSONGeometry } from "../services/alerts/types.js";
import { runIngestion, upsertNormalizedEvents } from "../services/alerts/ingest.js";
import { logger } from "../lib/logger.js";

const router = Router();

/** GET /api/alerts/events — list active events, optional filters (near=lat,lng&radiusKm=&types=&minSeverity=) */
router.get("/events", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const near = req.query.near as string | undefined;
    const radiusKm = Math.min(Number(req.query.radiusKm) || 50, 200);
    const types = req.query.types ? String(req.query.types).split(",") : [];
    const minSeverity = Math.max(1, Math.min(5, Number(req.query.minSeverity) || 1));

    let query = db
      .select()
      .from(alertEvents)
      .where(eq(alertEvents.status, "active"))
      .orderBy(desc(alertEvents.startAt))
      .limit(100);

    const rows = await query;
    let filtered = rows;

    if (types.length) {
      filtered = filtered.filter((r) => types.includes(r.eventType));
    }
    filtered = filtered.filter((r) => r.severity >= minSeverity);

    if (near) {
      const [latS, lonS] = near.split(",").map((s) => parseFloat(s.trim()));
      const lat = Number(latS);
      const lon = Number(lonS);
      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        filtered = filtered.filter((r) => {
          const geojson = r.geojson as GeoJSONGeometry | null;
          return eventMatchesUserPoint(geojson, lat, lon, radiusKm);
        });
      }
    }

    res.json({ events: filtered });
  } catch (err) {
    logger.error("GET /api/alerts/events", err);
    res.status(500).json({ error: "Failed to fetch alerts" });
  }
});

/** GET /api/alerts/me — alerts relevant to current user + subscription settings */
router.get("/me", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const [sub] = await db
      .select()
      .from(userAlertSubscriptions)
      .where(eq(userAlertSubscriptions.userId, userId))
      .limit(1);

    const userFields = await db
      .select({ centerLat: fields.centerLat, centerLng: fields.centerLng })
      .from(fields)
      .where(eq(fields.userId, userId));
    const points: [number, number][] = userFields
      .filter((f) => f.centerLat != null && f.centerLng != null)
      .map((f) => [Number(f.centerLat), Number(f.centerLng)]);

    const active = await db
      .select()
      .from(alertEvents)
      .where(eq(alertEvents.status, "active"))
      .orderBy(desc(alertEvents.startAt))
      .limit(50);

    const minSeverity = sub?.minSeverity ?? 1;
    const eventTypes = (sub?.eventTypes ?? []) as string[];
    const radiusKm = 25;
    const relevant = active.filter((e) => {
      if (e.severity < minSeverity) return false;
      if (eventTypes.length && !eventTypes.includes(e.eventType)) return false;
      if (points.length === 0) return true;
      const geojson = e.geojson as GeoJSONGeometry | null;
      return points.some(([lat, lon]) => eventMatchesUserPoint(geojson, lat, lon, radiusKm));
    });

    res.json({
      subscription: sub ?? null,
      events: relevant,
    });
  } catch (err) {
    logger.error("GET /api/alerts/me", err);
    res.status(500).json({ error: "Failed to fetch my alerts" });
  }
});

/** POST /api/alerts/subscriptions — create or update subscription for current user */
router.post("/subscriptions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    const { scope, customGeojson, eventTypes, minSeverity, digestMode, quietHoursStart, quietHoursEnd, enabled } = req.body ?? {};
    const [existing] = await db
      .select()
      .from(userAlertSubscriptions)
      .where(eq(userAlertSubscriptions.userId, userId))
      .limit(1);

    const payload = {
      scope: scope ?? "my_location",
      customGeojson: customGeojson ?? null,
      eventTypes: Array.isArray(eventTypes) ? eventTypes : [],
      minSeverity: Math.max(1, Math.min(5, Number(minSeverity) || 1)),
      digestMode: Boolean(digestMode),
      quietHoursStart: quietHoursStart != null ? Math.max(0, Math.min(23, Number(quietHoursStart))) : null,
      quietHoursEnd: quietHoursEnd != null ? Math.max(0, Math.min(23, Number(quietHoursEnd))) : null,
      enabled: enabled !== false,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(userAlertSubscriptions)
        .set(payload)
        .where(eq(userAlertSubscriptions.id, existing.id));
      const [updated] = await db.select().from(userAlertSubscriptions).where(eq(userAlertSubscriptions.id, existing.id));
      return res.json(updated);
    }
    const [created] = await db
      .insert(userAlertSubscriptions)
      .values({ userId, ...payload })
      .returning();
    res.status(201).json(created);
  } catch (err) {
    logger.error("POST /api/alerts/subscriptions", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

/** PATCH /api/alerts/subscriptions/:id — update subscription (enable/disable, eventTypes, minSeverity, quietHours) */
router.patch("/subscriptions/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    if (!userId || Number.isNaN(id)) return res.status(400).json({ error: "Bad request" });

    const [sub] = await db
      .select()
      .from(userAlertSubscriptions)
      .where(and(eq(userAlertSubscriptions.id, id), eq(userAlertSubscriptions.userId, userId)))
      .limit(1);
    if (!sub) return res.status(404).json({ error: "Subscription not found" });

    const { enabled, eventTypes, minSeverity, quietHoursStart, quietHoursEnd } = req.body ?? {};
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof enabled === "boolean") updates.enabled = enabled;
    if (Array.isArray(eventTypes)) updates.eventTypes = eventTypes;
    if (minSeverity != null) updates.minSeverity = Math.max(1, Math.min(5, Number(minSeverity)));
    if (quietHoursStart != null) updates.quietHoursStart = Math.max(0, Math.min(23, Number(quietHoursStart)));
    if (quietHoursEnd != null) updates.quietHoursEnd = Math.max(0, Math.min(23, Number(quietHoursEnd)));

    await db.update(userAlertSubscriptions).set(updates as any).where(eq(userAlertSubscriptions.id, id));
    const [updated] = await db.select().from(userAlertSubscriptions).where(eq(userAlertSubscriptions.id, id));
    res.json(updated);
  } catch (err) {
    logger.error("PATCH /api/alerts/subscriptions/:id", err);
    res.status(500).json({ error: "Failed to update subscription" });
  }
});

/** POST /api/alerts/test — admin/dev: inject a fake event for QA */
router.post("/test", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = req.user as { id: number; role?: string } | undefined;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    if (user.role !== "admin") return res.status(403).json({ error: "Admin only" });

    const { eventType, headline, province, severity } = req.body ?? {};
    const { deriveOpenWeatherSignals } = await import("../services/alerts/sources/openweatherSignals.js");
    const signals = deriveOpenWeatherSignals(
      [
        {
          lat: -15.3875,
          lon: 28.3228,
          province: province ?? "Lusaka",
          date: new Date(),
          locationName: "Lusaka",
          precipMm: 50,
          maxTempC: 38,
        },
      ],
      "test"
    );
    const ev = signals[0];
    if (!ev) return res.status(400).json({ error: "No signal generated" });
    const toInject = {
      ...ev,
      eventType: (eventType ?? ev.eventType) as typeof ev.eventType,
      headline: headline ?? ev.headline,
      severity: severity ?? ev.severity,
      status: "test" as const,
    };
    const { upsertNormalizedEvents: upsert } = await import("../services/alerts/ingest.js");
    await upsert([toInject]);
    res.json({ ok: true, message: "Test event injected" });
  } catch (err) {
    logger.error("POST /api/alerts/test", err);
    res.status(500).json({ error: "Failed to inject test event" });
  }
});

export default router;
