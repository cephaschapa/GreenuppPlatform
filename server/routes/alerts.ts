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
import { eq, and, gte, sql, desc, max } from "drizzle-orm";
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

/** GET /api/alerts/me — alerts relevant to current user + subscription settings. Auto-creates default subscription if none. */
router.get("/me", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Not authenticated" });

    let [sub] = await db
      .select()
      .from(userAlertSubscriptions)
      .where(eq(userAlertSubscriptions.userId, userId))
      .limit(1);

    if (!sub) {
      const [created] = await db
        .insert(userAlertSubscriptions)
        .values({
          userId,
          scope: "my_location",
          minSeverity: 1,
          enabled: true,
        })
        .returning();
      sub = created ?? null;
    }

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

/** GET /api/alerts/admin/ingestion-status — admin only: ingestion stats, last ingested per source, recent events */
router.get("/admin/ingestion-status", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req.user ?? (req as any).session?.user) as { id: number; role?: string } | undefined;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    if (user.role !== "admin") return res.status(403).json({ error: "Admin only" });

    const ingestIntervalMin = Number(process.env.ALERTS_INGEST_INTERVAL_MIN) || 15;
    const deliveryIntervalMin = Number(process.env.ALERTS_DELIVERY_INTERVAL_MIN) || 15;

    const [totalRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(alertEvents);
    const totalEvents = Number((totalRow as { count: number })?.count ?? 0);

    const bySourceRows = await db
      .select({
        sourceName: alertEvents.sourceName,
        count: sql<number>`count(*)::int`,
        lastSeen: max(alertEvents.lastSeenAt),
      })
      .from(alertEvents)
      .groupBy(alertEvents.sourceName);
    const bySource: Record<string, number> = {};
    const lastIngestedBySource: Record<string, string | null> = {};
    for (const r of bySourceRows) {
      bySource[r.sourceName] = r.count;
      lastIngestedBySource[r.sourceName] = r.lastSeen ? r.lastSeen.toISOString() : null;
    }

    const byStatusRows = await db
      .select({
        status: alertEvents.status,
        count: sql<number>`count(*)::int`,
      })
      .from(alertEvents)
      .groupBy(alertEvents.status);
    const byStatus: Record<string, number> = {};
    for (const r of byStatusRows) byStatus[r.status] = r.count;

    const recentEvents = await db
      .select()
      .from(alertEvents)
      .orderBy(desc(alertEvents.updatedAt))
      .limit(50);

    return res.json({
      eventCounts: { total: totalEvents, bySource, byStatus },
      lastIngestedBySource,
      recentEvents,
      scheduler: {
        ingestIntervalMin,
        deliveryIntervalMin,
        description: `Ingestion runs every ${ingestIntervalMin} min; delivery every ${deliveryIntervalMin} min.`,
      },
    });
  } catch (err) {
    logger.error("GET /api/alerts/admin/ingestion-status", err);
    res.status(500).json({ error: "Failed to fetch ingestion status" });
  }
});

/** POST /api/alerts/run-ingestion — admin only: run GDACS + ReliefWeb ingestion now and return results (verify feeds are working) */
router.post("/run-ingestion", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req.user ?? (req as any).session?.user) as { id: number; role?: string } | undefined;
    if (!user) return res.status(401).json({ error: "Not authenticated" });
    if (user.role !== "admin") return res.status(403).json({ error: "Admin only" });

    const results = await runIngestion();
    const totalNew = results.reduce((s, r) => s + r.newCount, 0);
    const totalUpdated = results.reduce((s, r) => s + r.updatedCount, 0);
    return res.json({
      ok: true,
      message: "Ingestion complete",
      results,
      summary: { totalNew, totalUpdated },
    });
  } catch (err) {
    logger.error("POST /api/alerts/run-ingestion", err);
    res.status(500).json({ error: "Ingestion failed", details: (err as Error).message });
  }
});

/** POST /api/alerts/test — admin/dev: inject a fake event for QA */
router.post("/test", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const user = (req.user ?? (req as any).session?.user) as { id: number; role?: string } | undefined;
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
