import { storage } from "../../storage";
import { insertWeatherPreferencesSchema } from "@shared/schema";

/**
 * Create default weather preferences for a user if they don't exist.
 * This is a helper function to ensure all users have weather preferences.
 */
export async function createDefaultWeatherPreferencesIfNeeded(userId: number) {
  try {
    // Check if the user already has preferences
    const existingPrefs = await storage.getWeatherPreferences(userId);
    
    // If preferences already exist, no need to create defaults
    if (existingPrefs) {
      return existingPrefs;
    }
    
    // Default preferences data
    const defaultPrefsData = {
      userId,
      locations: ["Lusaka, Zambia"], // Default location
      alertsEnabled: true,
      temperatureUnit: "celsius"
    };
    
    // Validate the data
    const validPrefsData = insertWeatherPreferencesSchema.parse(defaultPrefsData);
    
    // Create the preferences
    const newPrefs = await storage.createWeatherPreferences({
      ...validPrefsData,
      userId
    });
    
    console.log(`Created default weather preferences for user ${userId}`);
    return newPrefs;
    
  } catch (error) {
    console.error("Error creating default weather preferences:", error);
    throw new Error("Failed to create default weather preferences");
  }
}