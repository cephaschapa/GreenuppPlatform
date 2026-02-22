/**
 * Alert ingestion orchestrator: fetch from all sources, normalize, upsert into alert_events.
 * Marks events resolved when they disappear from feed or pass endAt.
 */

import { db } from "../../db.js";
import { alertEvents } from "@shared/schema";
import { eq, and, lt } from "drizzle-orm";
import { fetchGdacsFeed } from "./sources/gdacs.js";
import { fetchReliefWebReports } from "./sources/reliefweb.js";
import { normalizeGdacs } from "./normalize.js";
import { normalizeReliefWeb } from "./normalize.js";
import type { NormalizedAlertEvent } from "./types.js";
import { logger } from "../../lib/logger.js";

const ZAMBIA_ISO3 = "ZMB";

/** Map normalized event to DB row (camelCase for Drizzle). */
function toRow(ev: NormalizedAlertEvent, id: string) {
  const now = new Date();
  return {
    id,
    eventType: ev.eventType,
    hazardClass: ev.hazardClass,
    severity: ev.severity,
    confidence: ev.confidence ?? null,
    headline: ev.headline,
    summary: ev.summary ?? null,
    recommendedActions: ev.recommendedActions ?? [],
    geojson: ev.geometry ?? null,
    province: ev.region?.province ?? null,
    district: ev.region?.district ?? null,
    country: ev.region?.country ?? "ZM",
    startAt: ev.startAt ?? null,
    endAt: ev.endAt ?? null,
    firstSeenAt: now,
    lastSeenAt: now,
    sourceName: ev.source.name,
    sourceType: ev.source.type,
    sourceUrl: ev.source.url ?? null,
    externalId: ev.source.externalId ?? null,
    dedupeKey: ev.dedupeKey,
    status: ev.status,
    createdAt: now,
    updatedAt: now,
  };
}

/** Upsert one event; on conflict (dedupe_key) update lastSeenAt and status. */
async function upsertEvent(ev: NormalizedAlertEvent): Promise<{ id: string; isNew: boolean }> {
  const id = crypto.randomUUID();
  const row = toRow(ev, id);
  const existing = await db
    .select({ id: alertEvents.id })
    .from(alertEvents)
    .where(eq(alertEvents.dedupeKey, ev.dedupeKey))
    .limit(1);
  if (existing.length > 0) {
    await db
      .update(alertEvents)
      .set({
        lastSeenAt: new Date(),
        updatedAt: new Date(),
        status: ev.status,
        headline: ev.headline,
        summary: ev.summary ?? undefined,
        severity: ev.severity,
        startAt: ev.startAt ?? undefined,
        endAt: ev.endAt ?? undefined,
      })
      .where(eq(alertEvents.id, existing[0].id));
    return { id: existing[0].id, isNew: false };
  }
  await db.insert(alertEvents).values(row);
  return { id, isNew: true };
}

/** Filter: only Zambia-relevant (country ZM or ZMB or geometry in Zambia bbox). */
const ZAMBIA_BBOX: [number, number, number, number] = [21.9, -18.1, 33.7, -8.2]; // minLon, minLat, maxLon, maxLat
function isZambiaRelevant(ev: NormalizedAlertEvent): boolean {
  const c = ev.region?.country;
  if (c === "ZM" || c === "ZMB" || c === "Zambia") return true;
  if (ev.geometry && ev.geometry.type === "Point") {
    const [lon, lat] = ev.geometry.coordinates;
    if (lon >= ZAMBIA_BBOX[0] && lon <= ZAMBIA_BBOX[2] && lat >= ZAMBIA_BBOX[1] && lat <= ZAMBIA_BBOX[3])
      return true;
  }
  return false;
}

export interface IngestResult {
  source: string;
  newCount: number;
  updatedCount: number;
  skipped: number;
  error?: string;
}

/**
 * Run full ingestion: GDACS + ReliefWeb, normalize, upsert. OpenWeather/pest can be
 * called separately with derived events and passed to upsertNormalizedEvents.
 */
export async function runIngestion(): Promise<IngestResult[]> {
  const results: IngestResult[] = [];
  const allNormalized: NormalizedAlertEvent[] = [];

  // 1) GDACS
  try {
    const gdacs = await fetchGdacsFeed();
    let newCount = 0,
      updatedCount = 0,
      skipped = 0;
    for (const raw of gdacs.events) {
      const ev = normalizeGdacs(raw, gdacs.sourceUrl);
      if (!ev) continue;
      if (!isZambiaRelevant(ev)) {
        skipped++;
        continue;
      }
      const { isNew } = await upsertEvent(ev);
      if (isNew) newCount++;
      else updatedCount++;
    }
    results.push({ source: "GDACS", newCount, updatedCount, skipped, error: gdacs.error });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ source: "GDACS", error: msg }, "alerts: ingest GDACS failed");
    results.push({ source: "GDACS", newCount: 0, updatedCount: 0, skipped: 0, error: msg });
  }

  // 2) ReliefWeb
  try {
    const rw = await fetchReliefWebReports();
    let newCount = 0,
      updatedCount = 0,
      skipped = 0;
    for (const raw of rw.reports) {
      const ev = normalizeReliefWeb(raw, rw.sourceUrl);
      if (!ev) continue;
      if (!isZambiaRelevant(ev)) {
        skipped++;
        continue;
      }
      const { isNew } = await upsertEvent(ev);
      if (isNew) newCount++;
      else updatedCount++;
    }
    results.push({ source: "ReliefWeb", newCount, updatedCount, skipped, error: rw.error });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logger.error({ source: "ReliefWeb", error: msg }, "alerts: ingest ReliefWeb failed");
    results.push({ source: "ReliefWeb", newCount: 0, updatedCount: 0, skipped: 0, error: msg });
  }

  // 3) Mark old events as resolved (optional: events not seen in this run could be marked resolved after N runs)
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    await db
      .update(alertEvents)
      .set({ status: "resolved", updatedAt: new Date() })
      .where(and(eq(alertEvents.status, "active"), lt(alertEvents.endAt, cutoff)));
  } catch {
    // non-fatal
  }

  logger.info({ results }, "alerts: ingestion run complete");
  return results;
}

/**
 * Upsert a list of normalized events (e.g. from OpenWeather or pest signals).
 */
export async function upsertNormalizedEvents(events: NormalizedAlertEvent[]): Promise<{ newCount: number; updatedCount: number }> {
  let newCount = 0,
    updatedCount = 0;
  for (const ev of events) {
    const { isNew } = await upsertEvent(ev);
    if (isNew) newCount++;
    else updatedCount++;
  }
  return { newCount, updatedCount };
}
