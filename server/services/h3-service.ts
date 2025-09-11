import * as h3 from "h3-js";
import { db } from "../db";
import { locations, marketplaceListings } from "@shared/schema";
import { eq, inArray } from "drizzle-orm";

/**
 * Server-side H3 geospatial utilities for location-based features
 */

/**
 * Generate H3 indexes at different resolutions for a given lat/lng
 * @param lat Latitude
 * @param lng Longitude
 * @returns Object with H3 indexes at resolutions 8, 9, and 10
 */
export function generateH3Indexes(
  lat: number,
  lng: number
): {
  h3Index8: string;
  h3Index9: string;
  h3Index10: string;
} {
  return {
    h3Index8: h3.latLngToCell(lat, lng, 8),
    h3Index9: h3.latLngToCell(lat, lng, 9),
    h3Index10: h3.latLngToCell(lat, lng, 10),
  };
}

/**
 * Calculate hexagons within a specified radius around a center point
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param radiusKm Radius in kilometers
 * @param resolution H3 resolution (8-10)
 * @returns Array of H3 indexes covering the area
 */
export function getHexagonsWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  resolution: 8 | 9 | 10 = 9
): string[] {
  // Convert radius to approximate number of hexagons at the given resolution
  const centerH3 = h3.latLngToCell(centerLat, centerLng, resolution);

  // Average hexagon edge length in km at different resolutions
  const edgeLengthMap = {
    8: 1.2, // ~5km² area
    9: 0.4, // ~0.6km² area
    10: 0.15, // ~0.075km² area
  };

  // Calculate k-rings based on radius and resolution
  const kRings = Math.ceil(radiusKm / edgeLengthMap[resolution]);

  return h3.gridDisk(centerH3, kRings);
}

/**
 * Find locations within a specified radius
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Array of locations within the radius
 */
export async function findLocationsWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number
) {
  // Use resolution 9 for most queries (hexagons of ~0.6km²)
  // For large radius searches (>20km), use resolution 8
  const resolution = radiusKm > 20 ? 8 : 9;

  // Get H3 indexes for the search area
  const h3Indexes = getHexagonsWithinRadius(
    centerLat,
    centerLng,
    radiusKm,
    resolution
  );

  // Determine which column to query based on resolution
  const h3Column =
    resolution === 8 ? "h3Index8" : resolution === 9 ? "h3Index9" : "h3Index10";

  // Find all locations in the matching H3 cells
  const matchingLocations = await db
    .select()
    .from(locations)
    .where(inArray(locations[h3Column], h3Indexes));

  // Filter results to exact radius using Haversine distance
  // (H3 cells might extend beyond the requested radius)
  return matchingLocations.filter((location) => {
    const distance = getDistanceInKm(
      centerLat,
      centerLng,
      Number(location.latitude),
      Number(location.longitude)
    );
    return distance <= radiusKm;
  });
}

/**
 * Find marketplace listings within a specified radius
 * @param centerLat Center latitude
 * @param centerLng Center longitude
 * @param radiusKm Radius in kilometers
 * @returns Array of listings with distance information
 */
export async function findListingsWithinRadius(
  centerLat: number,
  centerLng: number,
  radiusKm: number
) {
  // Use resolution 9 for most queries (hexagons of ~0.6km²)
  // For large radius searches (>20km), use resolution 8
  const resolution = radiusKm > 20 ? 8 : 9;

  // Get H3 indexes for the search area
  const h3Indexes = getHexagonsWithinRadius(
    centerLat,
    centerLng,
    radiusKm,
    resolution
  );

  // Determine which column to query based on resolution
  const h3Column =
    resolution === 8 ? "h3Index8" : resolution === 9 ? "h3Index9" : "h3Index10";

  // Find all locations in the matching H3 cells
  const locationIds = await db
    .select({ id: locations.id })
    .from(locations)
    .where(inArray(locations[h3Column], h3Indexes));

  if (locationIds.length === 0) {
    return [];
  }

  // Get all listings with those location IDs
  const listingsWithLocations = await db
    .select({
      listing: marketplaceListings,
      location: locations,
    })
    .from(marketplaceListings)
    .leftJoin(locations, eq(marketplaceListings.locationId, locations.id))
    .where(
      inArray(
        marketplaceListings.locationId,
        locationIds.map((l) => l.id)
      )
    );

  // Calculate distance and add it to each listing
  const listingsWithDistance = listingsWithLocations.map((item) => {
    if (!item.location) {
      return {
        ...item.listing,
        location: null,
        distance: {
          km: 0,
          direction: "unknown",
          formatted: "unknown",
        },
      };
    }

    const distance = getDistanceInKm(
      centerLat,
      centerLng,
      Number(item.location.latitude),
      Number(item.location.longitude)
    );

    // Calculate bearing to determine direction
    const bearing = getBearing(
      centerLat,
      centerLng,
      Number(item.location.latitude),
      Number(item.location.longitude)
    );

    const direction = getCardinalDirection(bearing);

    return {
      ...item.listing,
      location: item.location,
      distance: {
        km: distance,
        direction,
        formatted: formatDistance(distance),
      },
    };
  });

  // Filter by exact radius and sort by distance
  return listingsWithDistance
    .filter((listing) => listing.distance.km <= radiusKm)
    .sort((a, b) => a.distance.km - b.distance.km);
}

/**
 * Get the distance between two points in kilometers using Haversine formula
 * @param lat1 First latitude
 * @param lng1 First longitude
 * @param lat2 Second latitude
 * @param lng2 Second longitude
 * @returns Distance in kilometers
 */
export function getDistanceInKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  // Convert to radians
  const toRad = (x: number) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // Earth's radius in kilometers
  const R = 6371;

  return R * c;
}

/**
 * Format distance for display
 * @param distanceKm Distance in kilometers
 * @returns Formatted distance string
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    // Convert to meters if less than 1km
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    // Show 1 decimal place for distances under 10km
    return `${distanceKm.toFixed(1)}km`;
  } else {
    // Round to nearest km for larger distances
    return `${Math.round(distanceKm)}km`;
  }
}

/**
 * Calculate the bearing between two points (determines direction)
 * @param lat1 Starting latitude
 * @param lng1 Starting longitude
 * @param lat2 Destination latitude
 * @param lng2 Destination longitude
 * @returns Bearing in degrees (0-360)
 */
export function getBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;

  const startLat = toRad(lat1);
  const startLng = toRad(lng1);
  const destLat = toRad(lat2);
  const destLng = toRad(lng2);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);

  let bearing = toDeg(Math.atan2(y, x));

  // Normalize to 0-360
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Get cardinal direction (N, NE, E, SE, etc.) from bearing
 * @param bearing Bearing in degrees
 * @returns Cardinal direction as string
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
  return directions[Math.round(bearing / 45)];
}
