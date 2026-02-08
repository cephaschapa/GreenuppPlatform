/**
 * Weather Observation Service
 * Gets or creates a weather_snapshot for a user's resolved location.
 * Enforces cache window (e.g. 3 hours per location) to avoid hitting OpenWeather every time.
 */

import { db } from "../db";
import { weatherSnapshots } from "@shared/schema";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { getWeatherData } from "../weather";
import type { ResolvedLocation } from "./locationResolverService";
import { logger } from "../lib/logger";

const CACHE_WINDOW_HOURS = 3;

export interface WeatherSnapshotRow {
  id: number;
  locationId: number | null;
  userId: number | null;
  locationName: string;
  lat: string;
  lng: string;
  source: string;
  forecastJson: unknown;
  forecastFrom: Date | null;
  createdAt: Date;
}

export interface WeatherSummary {
  snapshotId: number;
  source: string;
  locationName: string;
  currentTemp: number;
  condition: string;
  precipitationToday: number;
  windSpeed: number;
  uv: number;
}

/**
 * Find a recent snapshot for this location (and optionally user) within the cache window.
 */
async function findRecentSnapshot(
  locationId: number | null,
  lat: string,
  lng: string,
  userId: number | null
): Promise<WeatherSnapshotRow | null> {
  const since = new Date(Date.now() - CACHE_WINDOW_HOURS * 60 * 60 * 1000);
  const conditions = [
    eq(weatherSnapshots.lat, lat),
    eq(weatherSnapshots.lng, lng),
    gte(weatherSnapshots.createdAt, since),
  ];
  if (locationId != null) {
    conditions.push(eq(weatherSnapshots.locationId, locationId));
  }
  if (userId != null) {
    conditions.push(eq(weatherSnapshots.userId, userId));
  }
  const [row] = await db
    .select()
    .from(weatherSnapshots)
    .where(and(...conditions))
    .orderBy(desc(weatherSnapshots.createdAt))
    .limit(1);
  return (row as WeatherSnapshotRow) ?? null;
}

/**
 * Get or create a weather snapshot for the user at the given resolved location.
 * Returns the snapshot row and a summary for API responses.
 */
export async function getOrCreateWeatherSnapshot(
  userId: number,
  location: ResolvedLocation
): Promise<{ snapshot: WeatherSnapshotRow; summary: WeatherSummary }> {
  const lat = location.latitude ?? "0";
  const lng = location.longitude ?? "0";
  const locationQuery = location.locationName || `${lat},${lng}`;

  const existing = await findRecentSnapshot(
    location.id,
    lat,
    lng,
    userId
  );
  if (existing) {
    const summary = snapshotToSummary(existing);
    return { snapshot: existing, summary };
  }

  const weatherData = await getWeatherData(locationQuery);
  const source = "openweather_2_5"; // or openweather_3_0 if One Call was used; keep simple
  const forecastJson = {
    current: weatherData.current,
    forecast: weatherData.forecast,
    location: weatherData.location,
    coordinates: weatherData.coordinates,
  };

  const [inserted] = await db
    .insert(weatherSnapshots)
    .values({
      locationId: location.id,
      userId,
      locationName: location.locationName,
      lat: String(weatherData.coordinates.lat),
      lng: String(weatherData.coordinates.lon),
      source,
      forecastJson,
      forecastFrom: new Date(),
      createdAt: new Date(),
    })
    .returning();

  if (!inserted) {
    logger.error("weatherObservationService: insert failed", { userId, locationId: location.id });
    throw new Error("Failed to save weather snapshot");
  }

  const snapshot = inserted as WeatherSnapshotRow;
  const summary = snapshotToSummary(snapshot);
  return { snapshot, summary };
}

function snapshotToSummary(row: WeatherSnapshotRow): WeatherSummary {
  const forecast = row.forecastJson as {
    current?: { temp?: number; windSpeed?: number; uv?: number; condition?: string };
    forecast?: Array<{ precipitation?: number }>;
  };
  const current = forecast?.current;
  const day0 = forecast?.forecast?.[0];
  return {
    snapshotId: row.id,
    source: row.source,
    locationName: row.locationName,
    currentTemp: current?.temp ?? 0,
    condition: current?.condition ?? "Unknown",
    precipitationToday: day0?.precipitation ?? 0,
    windSpeed: current?.windSpeed ?? 0,
    uv: current?.uv ?? 0,
  };
}

/**
 * Get the latest weather snapshot for a user (any location), e.g. for decision engine.
 */
export async function getLatestSnapshotForUser(
  userId: number
): Promise<WeatherSnapshotRow | null> {
  const [row] = await db
    .select()
    .from(weatherSnapshots)
    .where(eq(weatherSnapshots.userId, userId))
    .orderBy(desc(weatherSnapshots.createdAt))
    .limit(1);
  return (row as WeatherSnapshotRow) ?? null;
}
