import { db } from "../db.js";
import { weatherPreferences } from "@shared/schema";
import { eq } from "drizzle-orm";

export class WeatherModel {
  // Weather API methods (these would call external APIs or internal services)
  static async getWeatherData(location: string, options?: { timezone?: string }) {
    const { getWeatherData } = await import("../weather.js");
    return getWeatherData(location, options);
  }

  static async getHistoricalWeatherData(
    location: string,
    startDate: Date,
    endDate: Date
  ) {
    const { getHistoricalWeatherData } = await import("../weather");
    return getHistoricalWeatherData(location, startDate, endDate);
  }

  static async getClimateData(location: string) {
    const { getClimateData } = await import("../weather");
    return getClimateData(location);
  }

  static async getCropRecommendations(location: string) {
    const { getCropRecommendations } = await import("../weather");
    return getCropRecommendations(location);
  }

  static async reverseGeocode(lat: number, lon: number) {
    const { reverseGeocode } = await import("../weather");
    return reverseGeocode(lat, lon);
  }

  static async geocode(query: string) {
    if (!process.env.OPENWEATHER_API_KEY) throw new Error("API key missing");
    const axios = (await import("axios")).default;
    const response = await axios.get(
      "http://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: query,
          limit: 10,
          appid: process.env.OPENWEATHER_API_KEY,
        },
      }
    );
    return response.data;
  }

  // Weather Preferences CRUD
  static async getWeatherPreferences(userId: number) {
    const result = await db
      .select()
      .from(weatherPreferences)
      .where(eq(weatherPreferences.userId, userId));
    return result[0] || null;
  }

  static async createWeatherPreferences(data: any) {
    const result = await db.insert(weatherPreferences).values(data).returning();
    return result[0];
  }

  static async updateWeatherPreferences(userId: number, data: any) {
    const result = await db
      .update(weatherPreferences)
      .set(data)
      .where(eq(weatherPreferences.userId, userId))
      .returning();
    return result[0];
  }
}
