/**
 * Derived weather/climate signals from OpenWeather (or existing hyperlocal) data.
 * Thresholds: heavy rainfall, heatwave, high wind. Zambia-focused.
 * Uses internal weather service; no external scraping.
 */

import { logger } from "../../../lib/logger.js";
import type { NormalizedAlertEvent } from "../types.js";
import { createDedupeKey } from "../dedupe.js";

const HEAVY_RAIN_MM_DAY = Number(process.env.ALERT_HEAVY_RAIN_MM_DAY) || 40;
const HEATWAVE_TEMP_C = Number(process.env.ALERT_HEATWAVE_TEMP_C) || 36;
const HIGH_WIND_MS = Number(process.env.ALERT_HIGH_WIND_MS) || 15;

export interface OpenWeatherSignalInput {
  lat: number;
  lon: number;
  province?: string;
  district?: string;
  /** Forecast or observed: daily precip (mm), max temp (C), wind speed (m/s). */
  precipMm?: number;
  maxTempC?: number;
  windSpeedMs?: number;
  date: Date;
  locationName?: string;
}

/**
 * Generate normalized alert events from threshold breaches (one per input that breaches).
 */
export function deriveOpenWeatherSignals(
  inputs: OpenWeatherSignalInput[],
  sourceUrl: string
): NormalizedAlertEvent[] {
  const events: NormalizedAlertEvent[] = [];
  const source = { name: "OpenWeather", type: "model" as const, url: sourceUrl };

  for (const input of inputs) {
    if (input.precipMm != null && input.precipMm >= HEAVY_RAIN_MM_DAY) {
      const headline = `Heavy rain expected (${Math.round(input.precipMm)} mm)${input.locationName ? ` near ${input.locationName}` : ""}`;
      const summary = `Daily rainfall may exceed ${HEAVY_RAIN_MM_DAY} mm. Consider delaying spraying and checking drainage.`;
      const ev: NormalizedAlertEvent = {
        eventType: "extreme_rain",
        hazardClass: "weather",
        severity: input.precipMm >= 60 ? 4 : 3,
        confidence: 0.7,
        geometry: { type: "Point", coordinates: [input.lon, input.lat] },
        region: input.province ? { country: "ZM", province: input.province, district: input.district } : { country: "ZM" },
        startAt: input.date,
        headline,
        summary,
        recommendedActions: ["Delay spraying", "Check drainage", "Harvest if near maturity"],
        source,
        dedupeKey: createDedupeKey({ source, headline, startAt: input.date, geometry: { type: "Point", coordinates: [input.lon, input.lat] } }),
        status: "active",
      };
      events.push(ev);
    }
    if (input.maxTempC != null && input.maxTempC >= HEATWAVE_TEMP_C) {
      const headline = `High temperature (${Math.round(input.maxTempC)}°C)${input.locationName ? ` near ${input.locationName}` : ""}`;
      const ev: NormalizedAlertEvent = {
        eventType: "heat",
        hazardClass: "weather",
        severity: input.maxTempC >= 38 ? 4 : 3,
        confidence: 0.75,
        geometry: { type: "Point", coordinates: [input.lon, input.lat] },
        region: input.province ? { country: "ZM", province: input.province, district: input.district } : { country: "ZM" },
        startAt: input.date,
        headline,
        summary: `Maximum temperature may reach ${Math.round(input.maxTempC)}°C. Water crops in early morning; avoid midday work.`,
        recommendedActions: ["Increase shade for livestock", "Water crops in early morning", "Avoid midday work"],
        source,
        dedupeKey: createDedupeKey({ source, headline, startAt: input.date, geometry: { type: "Point", coordinates: [input.lon, input.lat] } }),
        status: "active",
      };
      events.push(ev);
    }
    if (input.windSpeedMs != null && input.windSpeedMs >= HIGH_WIND_MS) {
      const headline = `Strong winds expected${input.locationName ? ` near ${input.locationName}` : ""}`;
      const ev: NormalizedAlertEvent = {
        eventType: "storm",
        hazardClass: "weather",
        severity: 3,
        confidence: 0.7,
        geometry: { type: "Point", coordinates: [input.lon, input.lat] },
        region: input.province ? { country: "ZM", province: input.province, district: input.district } : { country: "ZM" },
        startAt: input.date,
        headline,
        summary: `Wind speed may reach ${Math.round(input.windSpeedMs)} m/s. Avoid spraying to prevent drift.`,
        recommendedActions: ["Secure loose objects", "Avoid spraying", "Check structures"],
        source,
        dedupeKey: createDedupeKey({ source, headline, startAt: input.date, geometry: { type: "Point", coordinates: [input.lon, input.lat] } }),
        status: "active",
      };
      events.push(ev);
    }
  }

  if (events.length) {
    logger.info({ sourceName: "OpenWeather", count: events.length }, "alerts: OpenWeather signals derived");
  }
  return events;
}
