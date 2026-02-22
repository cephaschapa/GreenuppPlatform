/**
 * Geo helpers for Hazard & Pest Alerts: bbox overlap, point-in-polygon, distance, Zambia province mapping.
 * Uses Zambian locations DB for place names; no PostGIS required (JSONB geometry).
 */

import type { GeoJSONGeometry } from "./types.js";
import { findNearestLocation, zambianLocations } from "../../data/zambian-locations.js";

const EARTH_RADIUS_KM = 6371;
const DEFAULT_NEARBY_RADIUS_KM = 25;

/** Haversine distance in km */
export function distanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

/** Get point from GeoJSON as [lat, lon] (center of polygon or the point). GeoJSON uses [lon, lat]. */
export function getPointFromGeometry(geojson: GeoJSONGeometry | null): [number, number] | null {
  if (!geojson) return null;
  if (geojson.type === "Point") {
    const [lon, lat] = geojson.coordinates;
    return [lat, lon];
  }
  if (geojson.type === "Polygon" && geojson.coordinates?.[0]?.length) {
    const ring = geojson.coordinates[0];
    let lat = 0,
      lon = 0;
    for (const [lng, lt] of ring) {
      lon += lng;
      lat += lt;
    }
    return [lat / ring.length, lon / ring.length];
  }
  if (geojson.type === "MultiPolygon" && geojson.coordinates?.[0]?.[0]?.length) {
    const ring = geojson.coordinates[0][0];
    let lat = 0,
      lon = 0;
    for (const [lng, lt] of ring) {
      lon += lng;
      lat += lt;
    }
    return [lat / ring.length, lon / ring.length];
  }
  return null;
}

/** Bounding box [minLon, minLat, maxLon, maxLat] from geometry. */
export function getBboxFromGeometry(geojson: GeoJSONGeometry | null): [number, number, number, number] | null {
  if (!geojson) return null;
  const coords: [number, number][] = [];
  if (geojson.type === "Point") {
    coords.push([geojson.coordinates[1], geojson.coordinates[0]]);
  } else if (geojson.type === "Polygon" && geojson.coordinates?.[0]) {
    for (const [lng, lat] of geojson.coordinates[0]) coords.push([lat, lng]);
  } else if (geojson.type === "MultiPolygon") {
    for (const poly of geojson.coordinates ?? [])
      for (const ring of poly) for (const [lng, lat] of ring) coords.push([lat, lng]);
  }
  if (coords.length === 0) return null;
  const lats = coords.map((c) => c[0]);
  const lons = coords.map((c) => c[1]);
  return [Math.min(...lons), Math.min(...lats), Math.max(...lons), Math.max(...lats)];
}

/** Check if point (lat, lon) is inside bbox [minLon, minLat, maxLon, maxLat]. */
export function pointInBbox(
  lat: number,
  lon: number,
  bbox: [number, number, number, number]
): boolean {
  const [minLon, minLat, maxLon, maxLat] = bbox;
  return lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon;
}

/** Check if two bboxes overlap. */
export function bboxOverlap(
  a: [number, number, number, number],
  b: [number, number, number, number]
): boolean {
  const [aMinLon, aMinLat, aMaxLon, aMaxLat] = a;
  const [bMinLon, bMinLat, bMaxLon, bMaxLat] = b;
  return !(aMaxLon < bMinLon || bMaxLon < aMinLon || aMaxLat < bMinLat || bMaxLat < aMinLat);
}

/** Simple point-in-polygon (ray casting) for one ring. */
function pointInRing(lat: number, lon: number, ring: [number, number][]): boolean {
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [xi, yi] = [ring[i][1], ring[i][0]];
    const [xj, yj] = [ring[j][1], ring[j][0]];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Point-in-polygon for GeoJSON (first ring only for Polygon). */
export function pointInGeometry(lat: number, lon: number, geojson: GeoJSONGeometry | null): boolean {
  if (!geojson) return false;
  if (geojson.type === "Point")
    return lat === geojson.coordinates[0] && lon === geojson.coordinates[1];
  if (geojson.type === "Polygon" && geojson.coordinates?.[0]) {
    const ring = geojson.coordinates[0].map(([lng, lt]) => [lt, lng] as [number, number]);
    return pointInRing(lat, lon, ring);
  }
  if (geojson.type === "MultiPolygon") {
    for (const poly of geojson.coordinates ?? []) {
      if (poly[0]) {
        const ring = poly[0].map(([lng, lt]) => [lt, lng] as [number, number]);
        if (pointInRing(lat, lon, ring)) return true;
      }
    }
  }
  return false;
}

/** Event matches user location: point within geometry or within radiusKm of event point. */
export function eventMatchesUserPoint(
  eventGeojson: GeoJSONGeometry | null,
  userLat: number,
  userLon: number,
  radiusKm: number = DEFAULT_NEARBY_RADIUS_KM
): boolean {
  const bbox = getBboxFromGeometry(eventGeojson);
  if (bbox && pointInBbox(userLat, userLon, bbox)) return true;
  if (eventGeojson && pointInGeometry(userLat, userLon, eventGeojson)) return true;
  const eventPoint = getPointFromGeometry(eventGeojson);
  if (eventPoint)
    return distanceKm(userLat, userLon, eventPoint[0], eventPoint[1]) <= radiusKm; // eventPoint is [lat, lon]
  return false;
}

/** Event bbox overlaps user bbox (e.g. field bounds). */
export function eventOverlapsUserBbox(
  eventGeojson: GeoJSONGeometry | null,
  userBbox: [number, number, number, number]
): boolean {
  const eventBbox = getBboxFromGeometry(eventGeojson);
  if (!eventBbox) return false;
  return bboxOverlap(eventBbox, userBbox);
}

/** Resolve province/district for (lat, lon) using Zambian locations DB. */
export function resolveZambianPlace(lat: number, lon: number): { province?: string; district?: string; name?: string } {
  const result = findNearestLocation(lat, lon, 150);
  if (!result) return {};
  const { location } = result;
  return {
    province: location.province,
    district: location.district ?? location.city,
    name: location.name,
  };
}

/** All provinces in the Zambian DB (for filtering). */
export function getZambianProvinces(): string[] {
  const set = new Set<string>();
  for (const loc of zambianLocations) set.add(loc.province);
  return Array.from(set).sort();
}
