/**
 * Pest risk signals: FAO Locust Watch (if API/feed available) or derived from weather.
 * Fallback: agronomic heuristics (e.g. armyworm risk from warm + wet conditions).
 * No scraping of disallowed pages; feeds/APIs only.
 */

import { logger } from "../../../lib/logger.js";
import type { NormalizedAlertEvent } from "../types.js";
import { createDedupeKey } from "../dedupe.js";

/** Input for heuristic pest risk (e.g. from weather + season). */
export interface PestRiskInput {
  lat: number;
  lon: number;
  province?: string;
  district?: string;
  locationName?: string;
  /** Warm + wet favours armyworm. */
  avgTempC?: number;
  precipMm?: number;
  date: Date;
  /** Optional: external feed said "locust" or "armyworm" in this area. */
  externalSignal?: "locust" | "armyworm" | "fall_armyworm";
}

const ARMYWORM_TEMP_MIN = 18;
const ARMYWORM_RAIN_MM_MONTH = 50;

/**
 * Derive pest outbreak / disease_risk advisories from conditions or external signal.
 * One event per input that meets threshold or has external signal.
 */
export function derivePestSignals(
  inputs: PestRiskInput[],
  sourceUrl: string
): NormalizedAlertEvent[] {
  const events: NormalizedAlertEvent[] = [];
  const source = { name: "PestSignals", type: "model" as const, url: sourceUrl };

  for (const input of inputs) {
    const hasArmywormConditions =
      (input.avgTempC != null && input.avgTempC >= ARMYWORM_TEMP_MIN && (input.precipMm ?? 0) >= ARMYWORM_RAIN_MM_MONTH) ||
      input.externalSignal === "armyworm" ||
      input.externalSignal === "fall_armyworm";

    const hasLocustSignal = input.externalSignal === "locust";

    if (hasLocustSignal) {
      const headline = `Locust activity reported${input.locationName ? ` near ${input.locationName}` : ""}`;
      const ev: NormalizedAlertEvent = {
        eventType: "pest_outbreak",
        hazardClass: "pest",
        severity: 4,
        confidence: 0.7,
        geometry: { type: "Point", coordinates: [input.lon, input.lat] },
        region: input.province ? { country: "ZM", province: input.province, district: input.district } : { country: "ZM" },
        startAt: input.date,
        headline,
        summary: "Monitor crops and report sightings to extension services.",
        recommendedActions: ["Scout for locusts", "Report sightings to extension", "Follow authority advice"],
        source,
        dedupeKey: createDedupeKey({ source, headline, startAt: input.date, geometry: { type: "Point", coordinates: [input.lon, input.lat] } }),
        status: "active",
      };
      events.push(ev);
    }

    if (hasArmywormConditions) {
      const headline = `Fall armyworm risk elevated${input.locationName ? ` near ${input.locationName}` : ""}`;
      const ev: NormalizedAlertEvent = {
        eventType: "pest_outbreak",
        hazardClass: "pest",
        severity: 3,
        confidence: 0.6,
        geometry: { type: "Point", coordinates: [input.lon, input.lat] },
        region: input.province ? { country: "ZM", province: input.province, district: input.district } : { country: "ZM" },
        startAt: input.date,
        headline,
        summary: "Warm, wet conditions favour fall armyworm. Scout maize and report damage.",
        recommendedActions: ["Scout for fall armyworm", "Report sightings to extension", "Consider biopesticide"],
        source,
        dedupeKey: createDedupeKey({ source, headline, startAt: input.date, geometry: { type: "Point", coordinates: [input.lon, input.lat] } }),
        status: "active",
      };
      events.push(ev);
    }
  }

  if (events.length) {
    logger.info({ sourceName: "PestSignals", count: events.length }, "alerts: pest signals derived");
  }
  return events;
}
