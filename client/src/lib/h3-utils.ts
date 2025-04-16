import * as h3 from 'h3-js';

/**
 * H3 geospatial utilities for location-based features
 */

/**
 * Generate H3 indexes at different resolutions for a given lat/lng
 * @param lat Latitude
 * @param lng Longitude 
 * @returns Object with H3 indexes at resolutions 8, 9, and 10
 */
export function generateH3Indexes(lat: number, lng: number): { 
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
 * Get the distance between two points in kilometers using H3
 * @param lat1 First latitude
 * @param lng1 First longitude
 * @param lat2 Second latitude 
 * @param lng2 Second longitude
 * @returns Distance in kilometers
 */
export function getDistanceInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  // Convert to radians
  const toRad = (x: number) => (x * Math.PI) / 180;
  
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  // Earth's radius in kilometers
  const R = 6371;
  
  return R * c;
}

/**
 * Get hexagons within a certain radius in kilometers
 * @param lat Center latitude
 * @param lng Center longitude
 * @param radiusKm Radius in kilometers
 * @param resolution H3 resolution (8-10)
 * @returns Array of H3 indexes within the radius
 */
export function getHexagonsWithinRadius(
  lat: number, 
  lng: number, 
  radiusKm: number,
  resolution: 8 | 9 | 10 = 9
): string[] {
  // Convert radius to approximate number of hexagons at the given resolution
  // This is a rough approximation
  const centerH3 = h3.latLngToCell(lat, lng, resolution);
  
  // Use h3.gridDisk to get hexagons within k-ring distance
  // At resolution 9, each hexagon is approx 0.6km² so we calculate k rings based on that
  let kRings: number;
  
  switch (resolution) {
    case 8:
      // At resolution 8, hexagons are ~5km² (avg. edge length ~1.2km)
      kRings = Math.ceil(radiusKm / 1.2);
      break;
    case 9:
      // At resolution 9, hexagons are ~0.6km² (avg. edge length ~0.4km)
      kRings = Math.ceil(radiusKm / 0.4);
      break;
    case 10:
      // At resolution 10, hexagons are ~0.075km² (avg. edge length ~0.15km)
      kRings = Math.ceil(radiusKm / 0.15);
      break;
    default:
      kRings = Math.ceil(radiusKm / 0.4); // Default to resolution 9
  }
  
  return h3.gridDisk(centerH3, kRings);
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
export function getBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const toDeg = (x: number) => (x * 180) / Math.PI;
  
  const startLat = toRad(lat1);
  const startLng = toRad(lng1);
  const destLat = toRad(lat2);
  const destLng = toRad(lng2);
  
  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x = Math.cos(startLat) * Math.sin(destLat) - 
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
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW', 'N'];
  return directions[Math.round(bearing / 45)];
}