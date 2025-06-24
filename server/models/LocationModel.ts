import { db } from "../db";
import { locations } from "@shared/schema";
import { eq, and, or, sql } from "drizzle-orm";
import type { Location, InsertLocation } from "@shared/schema";

export class LocationModel {
  // Get all locations
  async getAllLocations(): Promise<Location[]> {
    const results = await db
      .select()
      .from(locations)
      .orderBy(locations.createdAt);

    return results;
  }

  // Get location by ID
  async getLocation(id: number): Promise<Location | undefined> {
    const results = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id))
      .limit(1);

    return results[0];
  }

  // Get location by coordinates
  async getLocationByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Location | undefined> {
    // Search for locations within a small radius (0.01 degrees ≈ 1km)
    const radius = 0.01;

    const results = await db
      .select()
      .from(locations)
      .where(
        and(
          sql`${locations.latitude} BETWEEN ${latitude - radius} AND ${
            latitude + radius
          }`,
          sql`${locations.longitude} BETWEEN ${longitude - radius} AND ${
            longitude + radius
          }`
        )
      )
      .limit(1);

    return results[0];
  }

  // Create location
  async createLocation(data: InsertLocation): Promise<Location> {
    const [location] = await db.insert(locations).values(data).returning();

    return location;
  }

  // Update location
  async updateLocation(
    id: number,
    data: Partial<InsertLocation>
  ): Promise<Location | undefined> {
    const [updatedLocation] = await db
      .update(locations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id))
      .returning();

    return updatedLocation;
  }

  // Search locations by text
  async searchLocations(query: string): Promise<Location[]> {
    const searchTerm = `%${query}%`;

    const results = await db
      .select()
      .from(locations)
      .where(
        or(
          sql`${locations.city} ILIKE ${searchTerm}`,
          sql`${locations.region} ILIKE ${searchTerm}`,
          sql`${locations.country} ILIKE ${searchTerm}`,
          sql`${locations.formattedAddress} ILIKE ${searchTerm}`
        )
      )
      .orderBy(locations.createdAt)
      .limit(10);

    return results;
  }

  // Get locations by country
  async getLocationsByCountry(country: string): Promise<Location[]> {
    const results = await db
      .select()
      .from(locations)
      .where(eq(locations.country, country))
      .orderBy(locations.city);

    return results;
  }

  // Get locations by region
  async getLocationsByRegion(region: string): Promise<Location[]> {
    const results = await db
      .select()
      .from(locations)
      .where(eq(locations.region, region))
      .orderBy(locations.city);

    return results;
  }
}
