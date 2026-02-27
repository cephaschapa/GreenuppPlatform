/**
 * Alert delivery: match active events to users by location (Zambia-first),
 * respect subscriptions and quiet hours, record deliveries, send via notifications.
 */

import { db } from "../../db.js";
import {
  alertEvents,
  userAlertSubscriptions,
  alertDeliveries,
  fields,
  farmerProfiles,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { eventMatchesUserPoint, eventOverlapsUserBbox } from "./geo.js";
import type { GeoJSONGeometry } from "./types.js";
import { createNotification } from "../notifications.js";
import { findZambianLocation } from "../../data/zambian-locations.js";
import { logger } from "../../lib/logger.js";

const DEFAULT_RADIUS_KM = 25;
const LUSAKA_TZ = "Africa/Lusaka";

function getHourInLusaka(): number {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: LUSAKA_TZ,
    hour: "numeric",
    hour12: false,
  });
  return parseInt(formatter.format(new Date()), 10);
}

function isInQuietHours(start: number | null, end: number | null): boolean {
  if (start == null || end == null) return false;
  const h = getHourInLusaka();
  if (start <= end) return h >= start && h < end;
  return h >= start || h < end;
}

/** Resolve user locations: field centers/bboxes, then farm location text -> Zambian DB. */
async function getUserLocations(userId: number): Promise<{ points: [number, number][]; bboxes: [number, number, number, number][] }> {
  const points: [number, number][] = [];
  const bboxes: [number, number, number, number][] = [];

  const userFields = await db
    .select({
      centerLat: fields.centerLat,
      centerLng: fields.centerLng,
      boundary: fields.boundary,
    })
    .from(fields)
    .where(eq(fields.userId, userId));
  for (const f of userFields) {
    const lat = f.centerLat != null ? Number(f.centerLat) : null;
    const lng = f.centerLng != null ? Number(f.centerLng) : null;
    if (lat != null && lng != null) points.push([lat, lng]);
    const boundary = f.boundary as { coordinates?: number[][][] } | null;
    if (boundary?.coordinates?.[0]?.length >= 3) {
      const ring = boundary.coordinates[0];
      const lats = ring.map((c) => c[1]);
      const lons = ring.map((c) => c[0]);
      bboxes.push([Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)]);
    }
  }

  const [profile] = await db
    .select({ farmLocation: farmerProfiles.farmLocation, province: farmerProfiles.province })
    .from(farmerProfiles)
    .where(eq(farmerProfiles.userId, userId))
    .limit(1);
  if (profile?.farmLocation) {
    const loc = findZambianLocation(profile.farmLocation);
    if (loc) {
      points.push([loc.coordinates.lat, loc.coordinates.lon]);
    }
  }

  return { points, bboxes };
}

/** Event matches user if any of their points/bboxes match. */
function eventMatchesUser(
  eventGeojson: GeoJSONGeometry | null,
  userPoints: [number, number][],
  userBboxes: [number, number, number, number][],
  radiusKm: number
): boolean {
  for (const [lat, lon] of userPoints) {
    if (eventMatchesUserPoint(eventGeojson, lat, lon, radiusKm)) return true;
  }
  for (const bbox of userBboxes) {
    if (eventOverlapsUserBbox(eventGeojson, bbox)) return true;
  }
  return false;
}

/** Build farmer-friendly message. */
function buildMessage(event: {
  headline: string;
  summary: string | null;
  province: string | null;
  district: string | null;
  recommendedActions: string[] | null;
  startAt: Date | null;
}): string {
  const parts: string[] = [];
  if (event.summary) parts.push(event.summary.slice(0, 200));
  const place = [event.district, event.province].filter(Boolean).join(", ");
  if (place) parts.push(`Location: ${place}.`);
  const actions = (event.recommendedActions ?? []).slice(0, 3);
  if (actions.length) parts.push("Actions: " + actions.join("; "));
  return parts.join(" ");
}

export interface DeliveryResult {
  eventId: string;
  userId: number;
  channel: string;
  status: "sent" | "failed" | "skipped";
  reason?: string;
}

/**
 * Run delivery: for each active event, find subscribed users whose location matches,
 * filter by minSeverity and eventTypes, skip if already delivered, send and record.
 */
export async function runDelivery(): Promise<DeliveryResult[]> {
  const results: DeliveryResult[] = [];
  const activeEvents = await db
    .select()
    .from(alertEvents)
    .where(eq(alertEvents.status, "active"));
  const subscriptions = await db
    .select()
    .from(userAlertSubscriptions)
    .where(eq(userAlertSubscriptions.enabled, true));

  for (const event of activeEvents) {
    const eventGeojson = event.geojson as GeoJSONGeometry | null;
    const eventType = event.eventType;
    const severity = event.severity;

    for (const sub of subscriptions) {
      if (sub.minSeverity > severity) continue;
      const types = (sub.eventTypes ?? []) as string[];
      if (types.length > 0 && !types.includes(eventType)) continue;
      if (isInQuietHours(sub.quietHoursStart, sub.quietHoursEnd)) continue;

      const { points, bboxes } = await getUserLocations(sub.userId);
      if (points.length === 0 && bboxes.length === 0) continue;
      if (!eventMatchesUser(eventGeojson, points, bboxes, DEFAULT_RADIUS_KM)) continue;

      const existingAny = await db
        .select()
        .from(alertDeliveries)
        .where(
          and(
            eq(alertDeliveries.userId, sub.userId),
            eq(alertDeliveries.alertEventId, event.id)
          )
        )
        .limit(1);
      if (existingAny.length > 0) {
        results.push({ eventId: event.id, userId: sub.userId, channel: "in_app", status: "skipped", reason: "already_delivered" });
        continue;
      }

      const title = `${event.headline}${event.province ? ` (${event.province})` : ""}`;
      const message = buildMessage({
        headline: event.headline,
        summary: event.summary,
        province: event.province,
        district: event.district,
        recommendedActions: event.recommendedActions,
        startAt: event.startAt,
      });

      try {
        await createNotification({
          userId: sub.userId,
          type: "weather_alert",
          title,
          message,
          data: { alertEventId: event.id, severity: event.severity, eventType },
          priority: severity >= 4 ? "high" : "medium",
          deepLink: "greenupp://weather",
        });
        for (const channel of ["in_app", "push"] as const) {
          await db.insert(alertDeliveries).values({
            userId: sub.userId,
            alertEventId: event.id,
            channel,
            deliveryStatus: "sent",
          });
          results.push({ eventId: event.id, userId: sub.userId, channel, status: "sent" });
        }
      } catch (err: unknown) {
        const reason = err instanceof Error ? err.message : String(err);
        await db.insert(alertDeliveries).values({
          userId: sub.userId,
          alertEventId: event.id,
          channel: "in_app",
          deliveryStatus: "failed",
          reason,
        });
        results.push({ eventId: event.id, userId: sub.userId, channel: "in_app", status: "failed", reason });
      }
    }
  }

  logger.info({ total: results.length, sent: results.filter((r) => r.status === "sent").length }, "alerts: delivery run complete");
  return results;
}
