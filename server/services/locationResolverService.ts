/**
 * Location Resolution Layer
 * Resolves farmer_profiles.farm_location (text) → structured locations row.
 * Updates profile with farmLocationId, source, confidence, resolvedAt.
 */

import { db } from "../db";
import {
  farmerProfiles,
  locations,
  type FarmerProfile,
} from "@shared/schema";
import { eq } from "drizzle-orm";
import { geocodeLocation } from "../weather.js";
import {
  findZambianLocation,
  getLocationsByCity,
  type ZambianLocation,
} from "../data/zambian-locations.js";
import { logger } from "../lib/logger.js";

const RESOLUTION_STALE_DAYS = 30;

export type FarmLocationSource =
  | "user_text"
  | "zambian_db"
  | "openweather_geo"
  | "gps_field_inferred";
export type FarmLocationConfidence = "low" | "medium" | "high";

export interface ResolvedLocation {
  id: number;
  country: string;
  region: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  formattedAddress: string | null;
  locationName: string; // display label
  source: FarmLocationSource;
  confidence: FarmLocationConfidence;
}

/**
 * Map ZambianLocation to locations row (for upsert).
 */
function zambianToLocationRow(
  z: ZambianLocation,
  locationName: string
): Record<string, unknown> {
  return {
    country: "Zambia",
    region: z.province,
    city: z.city,
    neighborhood: z.name,
    latitude: String(z.coordinates.lat),
    longitude: String(z.coordinates.lon),
    formattedAddress: locationName,
  };
}

/**
 * Insert a location and return its id. Caller may dedupe by (lat,lng,city) if needed.
 */
async function insertLocation(
  data: Record<string, unknown>
): Promise<{ id: number }> {
  const [inserted] = await db
    .insert(locations)
    .values({
      country: data.country as string,
      region: data.region as string,
      city: data.city as string,
      neighborhood: (data.neighborhood as string) || null,
      latitude: data.latitude as string,
      longitude: data.longitude as string,
      formattedAddress: (data.formattedAddress as string) || null,
    })
    .returning({ id: locations.id });
  return { id: inserted!.id };
}

/**
 * Resolve farm_location text for a user to a structured location.
 * 1) If farmLocationId set and resolved recently → return cached.
 * 2) Search Zambia DB by name/city → upsert locations, update profile.
 * 3) Else OpenWeather geo → upsert locations, update profile.
 * 4) Else fallback Lusaka with low confidence.
 */
export async function resolveFarmLocation(
  userId: number,
  farmLocationText: string | null
): Promise<ResolvedLocation | null> {
  const text = (farmLocationText || "").trim() || "Lusaka, Zambia";
  const [profile] = await db
    .select()
    .from(farmerProfiles)
    .where(eq(farmerProfiles.userId, userId))
    .limit(1);
  if (!profile) return null;

  const now = new Date();
  const resolvedAt = profile.farmLocationResolvedAt
    ? new Date(profile.farmLocationResolvedAt)
    : null;
  const isStale = resolvedAt
    ? (now.getTime() - resolvedAt.getTime()) / (1000 * 60 * 60 * 24) >
      RESOLUTION_STALE_DAYS
    : true;

  if (
    profile.farmLocationId != null &&
    !isStale
  ) {
    const [loc] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, profile.farmLocationId))
      .limit(1);
    if (loc) {
      return {
        id: loc.id,
        country: loc.country,
        region: loc.region,
        city: loc.city,
        latitude: loc.latitude,
        longitude: loc.longitude,
        formattedAddress: loc.formattedAddress,
        locationName: loc.formattedAddress || `${loc.city}, ${loc.country}`,
        source: (profile.farmLocationSource as FarmLocationSource) || "user_text",
        confidence: (profile.farmLocationConfidence as FarmLocationConfidence) || "medium",
      };
    }
  }

  let locationId: number;
  let source: FarmLocationSource = "user_text";
  let confidence: FarmLocationConfidence = "medium";
  let locationName = text;
  let errMsg: string | null = null;

  try {
    const cityPart = text.split(",")[0]?.trim() || text;
    const zambianByCity = getLocationsByCity(cityPart);
    const zambianByName = findZambianLocation(text) || findZambianLocation(cityPart);
    const zambian = zambianByName || zambianByCity[0] || null;

    if (zambian) {
      source = "zambian_db";
      confidence = "high";
      locationName = `${zambian.name}, ${zambian.city}`;
      const row = zambianToLocationRow(zambian, locationName);
      const { id } = await insertLocation(row);
      locationId = id;
    } else {
      const geo = await geocodeLocation(text);
      source = "openweather_geo";
      confidence = "medium";
      locationName = geo.geoPath || `${geo.name}, ${geo.country}`;
      const row = {
        country: geo.country,
        region: geo.state || geo.country,
        city: geo.city || geo.name,
        neighborhood: geo.name,
        latitude: String(geo.lat),
        longitude: String(geo.lon),
        formattedAddress: locationName,
      };
      const { id } = await insertLocation(row);
      locationId = id;
    }
  } catch (e: any) {
    errMsg = e?.message || String(e);
    logger.warn("Location resolve failed, using Lusaka fallback", { userId, text, err: errMsg });
    const fallback = findZambianLocation("Lusaka") || getLocationsByCity("Lusaka")[0];
    if (fallback) {
      source = "zambian_db";
      confidence = "low";
      locationName = "Lusaka, Zambia";
      const row = zambianToLocationRow(fallback, locationName);
      const { id } = await insertLocation(row);
      locationId = id;
    } else {
      const [existing] = await db.select().from(locations).where(eq(locations.city, "Lusaka")).limit(1);
      if (existing) locationId = existing.id;
      else {
        const [inserted] = await db.insert(locations).values({
          country: "Zambia",
          region: "Lusaka",
          city: "Lusaka",
          latitude: "-15.3875",
          longitude: "28.3228",
          formattedAddress: "Lusaka, Zambia",
        }).returning({ id: locations.id });
        locationId = inserted!.id;
      }
    }
  }

  await db
    .update(farmerProfiles)
    .set({
      farmLocationId: locationId,
      farmLocationSource: source,
      farmLocationConfidence: confidence,
      farmLocationResolvedAt: now,
      farmLocationLastGeocodeError: errMsg,
      updatedAt: now,
    })
    .where(eq(farmerProfiles.userId, userId));

  const [loc] = await db.select().from(locations).where(eq(locations.id, locationId)).limit(1);
  if (!loc) return null;
  return {
    id: loc.id,
    country: loc.country,
    region: loc.region,
    city: loc.city,
    latitude: loc.latitude,
    longitude: loc.longitude,
    formattedAddress: loc.formattedAddress,
    locationName: loc.formattedAddress || `${loc.city}, ${loc.country}`,
    source,
    confidence,
  };
}
