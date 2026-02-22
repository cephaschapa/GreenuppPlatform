/**
 * Map raw source payloads to normalized alert event model.
 */

import type {
  NormalizedAlertEvent,
  RawGdacsEvent,
  RawReliefWebReport,
  EventType,
  HazardClass,
  GeoJSONPoint,
} from "./types.js";
import { createDedupeKey } from "./dedupe.js";

const GDACS_EVENT_TYPE_MAP: Record<string, EventType> = {
  EQ: "storm",
  FL: "flood",
  TC: "storm",
  DR: "drought",
  WF: "storm",
  VO: "advisory",
};
const GDACS_SEVERITY_MAP: Record<string, number> = {
  green: 1,
  orange: 3,
  red: 5,
};

/** Parse GDACS RSS/Atom item to normalized event. */
export function normalizeGdacs(raw: RawGdacsEvent, sourceUrl: string): NormalizedAlertEvent | null {
  const title = sanitize(raw.title) || "GDACS Alert";
  const eventTypeRaw = raw["gdacs:eventtype"] ?? raw["gdacs:eventid"] ?? "";
  const eventType = GDACS_EVENT_TYPE_MAP[String(eventTypeRaw).toUpperCase()] ?? "advisory";
  const severityRaw = (raw["gdacs:severity"] ?? "green").toLowerCase();
  const severity = GDACS_SEVERITY_MAP[severityRaw] ?? 2;
  const pointRaw = raw["georss:point"];
  let geometry: GeoJSONPoint | undefined;
  if (pointRaw) {
    const parts = String(pointRaw).trim().split(/\s+/);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lon = parseFloat(parts[1]);
      if (!Number.isNaN(lat) && !Number.isNaN(lon))
        geometry = { type: "Point", coordinates: [lon, lat] };
    }
  }
  const country = sanitize(raw["gdacs:country"]);
  const fromDate = raw["gdacs:fromdate"];
  const toDate = raw["gdacs:todate"];
  const startAt = fromDate ? parseSafeDate(fromDate) : undefined;
  const endAt = toDate ? parseSafeDate(toDate) : undefined;
  const externalId = [raw["gdacs:eventid"], raw["gdacs:episodeid"]].filter(Boolean).join("-") || raw.guid;
  const source = {
    name: "GDACS",
    type: "rss" as const,
    url: sourceUrl,
    externalId: externalId ? String(externalId) : undefined,
  };
  const headline = title;
  const summary = sanitize(raw.description)?.slice(0, 500);
  const recommendedActions = inferActions(eventType);
  const dedupeKey = createDedupeKey({ source, headline, startAt, geometry });
  return {
    eventType,
    hazardClass: "weather",
    severity,
    confidence: 0.8,
    geometry,
    region: country ? { country } : undefined,
    startAt,
    endAt,
    headline,
    summary,
    recommendedActions,
    source,
    dedupeKey,
    status: "active",
  };
}

/** Parse ReliefWeb API report to normalized event. */
export function normalizeReliefWeb(
  raw: RawReliefWebReport,
  sourceUrl: string
): NormalizedAlertEvent | null {
  const title = sanitize(raw.title) || "ReliefWeb Report";
  const themeNames = (raw.theme ?? []).map((t: { name?: string }) => t.name).filter(Boolean);
  const eventType = mapReliefWebThemeToEventType(themeNames);
  const country = raw.primary_country?.name ?? raw.country?.[0]?.name;
  const province = country === "Zambia" ? undefined : undefined;
  const dateCreated = raw.date?.created;
  const startAt = dateCreated ? parseSafeDate(dateCreated) : undefined;
  const externalId = raw.id ? String(raw.id) : undefined;
  const source = {
    name: "ReliefWeb",
    type: "api" as const,
    url: sourceUrl,
    externalId,
  };
  const summary = sanitize(raw.body)?.replace(/<[^>]+>/g, "").slice(0, 500);
  const recommendedActions = inferActions(eventType);
  const dedupeKey = createDedupeKey({ source, headline: title, startAt, geometry: undefined });
  return {
    eventType,
    hazardClass: "climate",
    severity: 3,
    confidence: 0.7,
    region: country ? { country, province } : undefined,
    startAt,
    headline: title,
    summary,
    recommendedActions,
    source,
    dedupeKey,
    status: "active",
  };
}

function mapReliefWebThemeToEventType(themes: string[]): EventType {
  const s = themes.join(" ").toLowerCase();
  if (s.includes("flood")) return "flood";
  if (s.includes("drought")) return "drought";
  if (s.includes("storm") || s.includes("cyclone")) return "storm";
  if (s.includes("heat")) return "heat";
  if (s.includes("pest") || s.includes("locust")) return "pest_outbreak";
  return "advisory";
}

function inferActions(eventType: EventType): string[] {
  const base: Record<EventType, string[]> = {
    flood: ["Move livestock to higher ground", "Check drainage", "Avoid crossing flooded roads"],
    drought: ["Save water", "Consider drought-tolerant varieties", "Monitor soil moisture"],
    storm: ["Secure loose objects", "Stay indoors during heavy wind", "Check structures"],
    heat: ["Increase shade for livestock", "Water crops in early morning", "Avoid midday work"],
    extreme_rain: ["Delay spraying", "Check drainage", "Harvest if near maturity"],
    pest_outbreak: ["Scout for fall armyworm", "Report sightings to extension", "Consider biopesticide"],
    disease_risk: ["Scout crops", "Remove infected plants", "Avoid overhead irrigation"],
    advisory: ["Monitor situation", "Follow local authority advice"],
  };
  return base[eventType] ?? base.advisory;
}

function sanitize(s: unknown): string | undefined {
  if (s == null) return undefined;
  const t = String(s).trim();
  return t.length ? t : undefined;
}

function parseSafeDate(s: string): Date | undefined {
  try {
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? undefined : d;
  } catch {
    return undefined;
  }
}
