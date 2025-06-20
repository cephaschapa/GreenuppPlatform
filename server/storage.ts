import {
  type ContactFormData,
  type ContactInquiry,
  type InsertUser,
  type User,
  type InsertFarmerProfile,
  type FarmerProfile,
  type Field,
  type InsertField,
  type Crop,
  type InsertCrop,
  type CropActivity,
  type InsertCropActivity,
  type WeatherPreferences,
  type InsertWeatherPreferences,
  type FarmerTask,
  type InsertFarmerTask,
  type CropYieldPrediction,
  type InsertCropYieldPrediction,
  type PlantAnalysis,
  type InsertPlantAnalysis,
  // Marketplace types
  type Location,
  type InsertLocation,
  type MarketplaceListing,
  type InsertMarketplaceListing,
  type MarketplaceReview,
  type InsertMarketplaceReview,
  type MarketplaceFavorite,
  type InsertMarketplaceFavorite,
  type MarketplaceMessage,
  type InsertMarketplaceMessage,
  // Database tables
  users,
  farmerProfiles,
  contactForm,
  fields,
  crops,
  cropActivities,
  weatherPreferences,
  farmerTasks,
  cropYieldPredictions,
  plantAnalyses,
  // Marketplace tables
  locations,
  marketplaceListings,
  marketplaceReviews,
  marketplaceFavorites,
  marketplaceMessages,
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, gte, lte, or, isNotNull, asc, desc, sql } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";

// Create session stores
const MemoryStore = createMemoryStore(session);
const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User authentication and management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;

  // Farmer profiles
  getFarmerProfile(userId: number): Promise<FarmerProfile | undefined>;
  createFarmerProfile(
    profile: InsertFarmerProfile & { userId: number }
  ): Promise<FarmerProfile>;
  updateFarmerProfile(
    userId: number,
    profileData: Partial<FarmerProfile>
  ): Promise<FarmerProfile | undefined>;

  // Contact form
  saveContactInquiry(data: ContactFormData): Promise<ContactInquiry>;
  getContactInquiries(): Promise<ContactInquiry[]>;

  // Field management
  getFields(userId: number): Promise<Field[]>;
  getField(id: number): Promise<Field | undefined>;
  createField(fieldData: InsertField & { userId: number }): Promise<Field>;
  updateField(
    id: number,
    fieldData: Partial<Field>
  ): Promise<Field | undefined>;
  deleteField(id: number): Promise<boolean>;

  // Crop management
  getCrops(userId: number): Promise<Crop[]>;
  getCropsByField(fieldId: number): Promise<Crop[]>;
  getCrop(id: number): Promise<Crop | undefined>;
  createCrop(cropData: InsertCrop & { userId: number }): Promise<Crop>;
  updateCrop(id: number, cropData: Partial<Crop>): Promise<Crop | undefined>;
  deleteCrop(id: number): Promise<boolean>;

  // Crop activity management
  getCropActivities(cropId: number): Promise<CropActivity[]>;
  getCropActivity(id: number): Promise<CropActivity | undefined>;
  createCropActivity(activityData: InsertCropActivity): Promise<CropActivity>;
  updateCropActivity(
    id: number,
    activityData: Partial<CropActivity>
  ): Promise<CropActivity | undefined>;
  deleteCropActivity(id: number): Promise<boolean>;

  // Weather preferences
  getWeatherPreferences(
    userId: number
  ): Promise<WeatherPreferences | undefined>;
  createWeatherPreferences(
    data: InsertWeatherPreferences & { userId: number }
  ): Promise<WeatherPreferences>;
  updateWeatherPreferences(
    userId: number,
    data: Partial<WeatherPreferences>
  ): Promise<WeatherPreferences | undefined>;

  // Farmer tasks and reminders
  getTasks(userId: number): Promise<FarmerTask[]>;
  getTasksByDate(userId: number, date: Date): Promise<FarmerTask[]>;
  getTasksByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<FarmerTask[]>;
  getTasksByPriority(userId: number, priority: string): Promise<FarmerTask[]>;
  getTasksByCrop(cropId: number): Promise<FarmerTask[]>;
  getTasksByField(fieldId: number): Promise<FarmerTask[]>;
  getTask(id: number): Promise<FarmerTask | undefined>;
  createTask(
    taskData: InsertFarmerTask & { userId: number }
  ): Promise<FarmerTask>;
  updateTask(
    id: number,
    taskData: Partial<FarmerTask>
  ): Promise<FarmerTask | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<FarmerTask | undefined>;

  // Crop yield predictions
  getCropYieldPredictions(cropId: number): Promise<CropYieldPrediction[]>;
  createCropYieldPrediction(
    data: InsertCropYieldPrediction
  ): Promise<CropYieldPrediction>;
  updateCropYieldPrediction(
    id: number,
    data: Partial<CropYieldPrediction>
  ): Promise<CropYieldPrediction | undefined>;

  // Plant analysis
  getPlantAnalyses(userId: number): Promise<PlantAnalysis[]>;
  getPlantAnalysisByField(fieldId: number): Promise<PlantAnalysis[]>;
  getPlantAnalysisByCrop(cropId: number): Promise<PlantAnalysis[]>;
  getPlantAnalysis(id: number): Promise<PlantAnalysis | undefined>;
  createPlantAnalysis(data: InsertPlantAnalysis): Promise<PlantAnalysis>;
  updatePlantAnalysis(
    id: number,
    data: Partial<PlantAnalysis>
  ): Promise<PlantAnalysis | undefined>;
  deletePlantAnalysis(id: number): Promise<boolean>;

  // Marketplace Location management
  getLocations(): Promise<Location[]>;
  getLocation(id: number): Promise<Location | undefined>;
  getLocationByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Location | undefined>;
  createLocation(locationData: InsertLocation): Promise<Location>;
  updateLocation(
    id: number,
    locationData: Partial<Location>
  ): Promise<Location | undefined>;
  deleteLocation(id: number): Promise<boolean>;

  // Marketplace Listings
  getMarketplaceListings(params?: {
    category?: string;
    search?: string;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    status?: string;
    locationId?: number;
    radius?: number; // km from location
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceListing[]>;
  getMarketplaceListingsByLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    filters?: Partial<MarketplaceListing>
  ): Promise<MarketplaceListing[]>;
  getMarketplaceListingsBySellerLocation(
    sellerId: number,
    radiusKm: number
  ): Promise<MarketplaceListing[]>;
  getMarketplaceListing(id: number): Promise<MarketplaceListing | undefined>;
  getMarketplaceListingsBySeller(
    sellerId: number
  ): Promise<MarketplaceListing[]>;
  createMarketplaceListing(
    listingData: InsertMarketplaceListing
  ): Promise<MarketplaceListing>;
  updateMarketplaceListing(
    id: number,
    listingData: Partial<MarketplaceListing>
  ): Promise<MarketplaceListing | undefined>;
  deleteMarketplaceListing(id: number): Promise<boolean>;
  incrementListingViews(id: number): Promise<boolean>;

  // Marketplace Reviews
  getMarketplaceReviews(
    listingId?: number,
    sellerId?: number
  ): Promise<MarketplaceReview[]>;
  getMarketplaceReview(id: number): Promise<MarketplaceReview | undefined>;
  createMarketplaceReview(
    reviewData: InsertMarketplaceReview
  ): Promise<MarketplaceReview>;
  updateMarketplaceReview(
    id: number,
    reviewData: Partial<MarketplaceReview>
  ): Promise<MarketplaceReview | undefined>;
  deleteMarketplaceReview(id: number): Promise<boolean>;

  // Marketplace Favorites/Saved Listings
  getMarketplaceFavorites(userId: number): Promise<MarketplaceFavorite[]>;
  getMarketplaceFavorite(id: number): Promise<MarketplaceFavorite | undefined>;
  createMarketplaceFavorite(
    favoriteData: InsertMarketplaceFavorite
  ): Promise<MarketplaceFavorite>;
  deleteMarketplaceFavorite(id: number): Promise<boolean>;

  // Marketplace Messages
  getMarketplaceMessages(
    senderId?: number,
    recipientId?: number,
    listingId?: number
  ): Promise<MarketplaceMessage[]>;
  getMarketplaceMessage(id: number): Promise<MarketplaceMessage | undefined>;
  createMarketplaceMessage(
    messageData: InsertMarketplaceMessage
  ): Promise<MarketplaceMessage>;
  markMessageAsRead(id: number): Promise<boolean>;
  deleteMarketplaceMessage(id: number): Promise<boolean>;
  getUnreadMessageCount(userId: number): Promise<number>;

  // For session storage
  sessionStore: session.Store;
}

// PostgreSQL implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Initialize session store with PostgreSQL
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // Helper method for calculating distance using Haversine formula
  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        firstName: insertUser.firstName || null,
        lastName: insertUser.lastName || null,
        profileImage: null,
        role: insertUser.role || "farmer",
      })
      .returning();

    return user;
  }

  async updateUser(
    id: number,
    userData: Partial<User>
  ): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user;
  }

  async getFarmerProfile(userId: number): Promise<FarmerProfile | undefined> {
    const [profile] = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, userId));

    return profile;
  }

  async createFarmerProfile(
    profileData: InsertFarmerProfile & { userId: number }
  ): Promise<FarmerProfile> {
    const [profile] = await db
      .insert(farmerProfiles)
      .values({
        ...profileData,
        farmName: profileData.farmName || null,
        farmLocation: profileData.farmLocation || null,
        farmSize: profileData.farmSize || null,
        farmType: profileData.farmType || null,
        bio: profileData.bio || null,
        contactPhone: profileData.contactPhone || null,
        mainCrops: profileData.mainCrops || null,
        establishedYear: profileData.establishedYear || null,
        settings: {},
      })
      .returning();

    return profile;
  }

  async updateFarmerProfile(
    userId: number,
    profileData: Partial<FarmerProfile>
  ): Promise<FarmerProfile | undefined> {
    // First, find the profile by userId
    const existingProfile = await this.getFarmerProfile(userId);
    if (!existingProfile) return undefined;

    // Then update it by id
    const [profile] = await db
      .update(farmerProfiles)
      .set({
        ...profileData,
        updatedAt: new Date(),
      })
      .where(eq(farmerProfiles.id, existingProfile.id))
      .returning();

    return profile;
  }

  async saveContactInquiry(data: ContactFormData): Promise<ContactInquiry> {
    const [inquiry] = await db
      .insert(contactForm)
      .values({
        ...data,
        newsletter: data.newsletter || false,
      })
      .returning();

    return inquiry;
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    return db.select().from(contactForm);
  }

  // Field management methods
  async getFields(userId: number): Promise<Field[]> {
    return db.select().from(fields).where(eq(fields.userId, userId));
  }

  async getField(id: number): Promise<Field | undefined> {
    const [field] = await db.select().from(fields).where(eq(fields.id, id));
    return field;
  }

  async createField(
    fieldData: InsertField & { userId: number }
  ): Promise<Field> {
    const [field] = await db
      .insert(fields)
      .values({
        ...fieldData,
        location: fieldData.location || null,
        size: fieldData.size || null,
        sizeUnit: fieldData.sizeUnit || "hectares",
        soilType: fieldData.soilType || null,
        notes: fieldData.notes || null,
      })
      .returning();

    return field;
  }

  async updateField(
    id: number,
    fieldData: Partial<Field>
  ): Promise<Field | undefined> {
    const [field] = await db
      .update(fields)
      .set({
        ...fieldData,
        updatedAt: new Date(),
      })
      .where(eq(fields.id, id))
      .returning();

    return field;
  }

  async deleteField(id: number): Promise<boolean> {
    try {
      const result = await db.delete(fields).where(eq(fields.id, id));

      return true; // If no error is thrown, the delete was successful
    } catch (error) {
      console.error("Error deleting field:", error);
      return false;
    }
  }

  // Crop management methods
  async getCrops(userId: number): Promise<Crop[]> {
    return db.select().from(crops).where(eq(crops.userId, userId));
  }

  async getCropsByField(fieldId: number): Promise<Crop[]> {
    return db.select().from(crops).where(eq(crops.fieldId, fieldId));
  }

  async getCrop(id: number): Promise<Crop | undefined> {
    const [crop] = await db.select().from(crops).where(eq(crops.id, id));
    return crop;
  }

  async createCrop(cropData: InsertCrop & { userId: number }): Promise<Crop> {
    const [crop] = await db
      .insert(crops)
      .values({
        ...cropData,
        variety: cropData.variety || null,
        status: cropData.status || "planning",
        fieldId: cropData.fieldId || null,
        plantingDate: cropData.plantingDate || null,
        expectedHarvestDate: cropData.expectedHarvestDate || null,
        actualHarvestDate: cropData.actualHarvestDate || null,
        expectedYield: cropData.expectedYield || null,
        actualYield: cropData.actualYield || null,
        yieldUnit: cropData.yieldUnit || "kg",
        notes: cropData.notes || null,
      })
      .returning();

    return crop;
  }

  async updateCrop(
    id: number,
    cropData: Partial<Crop>
  ): Promise<Crop | undefined> {
    const [crop] = await db
      .update(crops)
      .set({
        ...cropData,
        updatedAt: new Date(),
      })
      .where(eq(crops.id, id))
      .returning();

    return crop;
  }

  async deleteCrop(id: number): Promise<boolean> {
    try {
      const result = await db.delete(crops).where(eq(crops.id, id));

      return true; // If no error is thrown, the delete was successful
    } catch (error) {
      console.error("Error deleting crop:", error);
      return false;
    }
  }

  // Crop activity methods
  async getCropActivities(cropId: number): Promise<CropActivity[]> {
    return db
      .select()
      .from(cropActivities)
      .where(eq(cropActivities.cropId, cropId));
  }

  async getCropActivity(id: number): Promise<CropActivity | undefined> {
    const [activity] = await db
      .select()
      .from(cropActivities)
      .where(eq(cropActivities.id, id));
    return activity;
  }

  async createCropActivity(
    activityData: InsertCropActivity
  ): Promise<CropActivity> {
    const [activity] = await db
      .insert(cropActivities)
      .values({
        ...activityData,
        cost: activityData.cost || null,
        notes: activityData.notes || null,
      })
      .returning();

    return activity;
  }

  async updateCropActivity(
    id: number,
    activityData: Partial<CropActivity>
  ): Promise<CropActivity | undefined> {
    const [activity] = await db
      .update(cropActivities)
      .set({
        ...activityData,
        updatedAt: new Date(),
      })
      .where(eq(cropActivities.id, id))
      .returning();

    return activity;
  }

  async deleteCropActivity(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(cropActivities)
        .where(eq(cropActivities.id, id));

      return true; // If no error is thrown, the delete was successful
    } catch (error) {
      console.error("Error deleting crop activity:", error);
      return false;
    }
  }

  // Weather preferences methods
  async getWeatherPreferences(
    userId: number
  ): Promise<WeatherPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(weatherPreferences)
      .where(eq(weatherPreferences.userId, userId));

    return prefs;
  }

  async createWeatherPreferences(
    data: InsertWeatherPreferences & { userId: number }
  ): Promise<WeatherPreferences> {
    const [prefs] = await db
      .insert(weatherPreferences)
      .values({
        ...data,
        locations: data.locations || [],
        alertsEnabled: data.alertsEnabled ?? true,
        temperatureUnit: data.temperatureUnit || "celsius",
      })
      .returning();

    return prefs;
  }

  async updateWeatherPreferences(
    userId: number,
    data: Partial<WeatherPreferences>
  ): Promise<WeatherPreferences | undefined> {
    // First, find the preferences by userId
    const existingPrefs = await this.getWeatherPreferences(userId);
    if (!existingPrefs) return undefined;

    // Make sure locations is always an array
    const updatedData: any = { ...data };

    // If locations is provided, ensure it's an array
    if ("locations" in updatedData) {
      if (!Array.isArray(updatedData.locations)) {
        // If it's not an array, make it an empty array
        updatedData.locations = [];
        console.log("Converted non-array locations to empty array");
      } else {
        console.log("Locations is already an array:", updatedData.locations);
      }
    }

    console.log("Updating weather preferences with data:", updatedData);

    // Then update it by id
    const [prefs] = await db
      .update(weatherPreferences)
      .set({
        ...updatedData,
        updatedAt: new Date(),
      })
      .where(eq(weatherPreferences.id, existingPrefs.id))
      .returning();

    console.log("Updated preferences:", prefs);

    return prefs;
  }

  // Farmer tasks methods
  async getTasks(userId: number): Promise<FarmerTask[]> {
    return db.select().from(farmerTasks).where(eq(farmerTasks.userId, userId));
  }

  async getTasksByDate(userId: number, date: Date): Promise<FarmerTask[]> {
    // Format the date to match SQL date format (YYYY-MM-DD)
    const formattedDate = date.toISOString().split("T")[0];

    return db
      .select()
      .from(farmerTasks)
      .where(
        and(
          eq(farmerTasks.userId, userId),
          eq(farmerTasks.dueDate, formattedDate)
        )
      );
  }

  async getTasksByDateRange(
    userId: number,
    startDate: Date,
    endDate: Date
  ): Promise<FarmerTask[]> {
    // Format dates to match SQL date format (YYYY-MM-DD)
    const formattedStartDate = startDate.toISOString().split("T")[0];
    const formattedEndDate = endDate.toISOString().split("T")[0];

    return db
      .select()
      .from(farmerTasks)
      .where(
        and(
          eq(farmerTasks.userId, userId),
          gte(farmerTasks.dueDate, formattedStartDate),
          lte(farmerTasks.dueDate, formattedEndDate)
        )
      );
  }

  async getTasksByPriority(
    userId: number,
    priority: string
  ): Promise<FarmerTask[]> {
    return db
      .select()
      .from(farmerTasks)
      .where(
        and(eq(farmerTasks.userId, userId), eq(farmerTasks.priority, priority))
      );
  }

  async getTasksByCrop(cropId: number): Promise<FarmerTask[]> {
    return db
      .select()
      .from(farmerTasks)
      .where(eq(farmerTasks.relatedCropId, cropId));
  }

  async getTasksByField(fieldId: number): Promise<FarmerTask[]> {
    return db
      .select()
      .from(farmerTasks)
      .where(eq(farmerTasks.relatedFieldId, fieldId));
  }

  async getTask(id: number): Promise<FarmerTask | undefined> {
    const [task] = await db
      .select()
      .from(farmerTasks)
      .where(eq(farmerTasks.id, id));

    return task;
  }

  async createTask(
    taskData: InsertFarmerTask & { userId: number }
  ): Promise<FarmerTask> {
    const [task] = await db
      .insert(farmerTasks)
      .values({
        ...taskData,
        description: taskData.description || null,
        completed: taskData.completed || false,
        priority: taskData.priority || "medium",
        relatedCropId: taskData.relatedCropId || null,
        relatedFieldId: taskData.relatedFieldId || null,
        notifyBefore: taskData.notifyBefore || null,
      })
      .returning();

    return task;
  }

  async updateTask(
    id: number,
    taskData: Partial<FarmerTask>
  ): Promise<FarmerTask | undefined> {
    const [task] = await db
      .update(farmerTasks)
      .set({
        ...taskData,
        updatedAt: new Date(),
      })
      .where(eq(farmerTasks.id, id))
      .returning();

    return task;
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      await db.delete(farmerTasks).where(eq(farmerTasks.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      return false;
    }
  }

  async completeTask(id: number): Promise<FarmerTask | undefined> {
    const [task] = await db
      .update(farmerTasks)
      .set({
        completed: true,
        updatedAt: new Date(),
      })
      .where(eq(farmerTasks.id, id))
      .returning();

    return task;
  }

  // Crop yield prediction methods
  async getCropYieldPredictions(
    cropId: number
  ): Promise<CropYieldPrediction[]> {
    return db
      .select()
      .from(cropYieldPredictions)
      .where(eq(cropYieldPredictions.cropId, cropId));
  }

  async createCropYieldPrediction(
    data: InsertCropYieldPrediction
  ): Promise<CropYieldPrediction> {
    const [prediction] = await db
      .insert(cropYieldPredictions)
      .values({
        ...data,
        predictedYield: data.predictedYield || null,
        yieldUnit: data.yieldUnit || "kg",
        confidenceLevel: data.confidenceLevel || null,
        factorsConsidered: data.factorsConsidered || {},
      })
      .returning();

    return prediction;
  }

  async updateCropYieldPrediction(
    id: number,
    data: Partial<CropYieldPrediction>
  ): Promise<CropYieldPrediction | undefined> {
    const [prediction] = await db
      .update(cropYieldPredictions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(cropYieldPredictions.id, id))
      .returning();

    return prediction;
  }

  // Plant analysis methods
  async getPlantAnalyses(userId: number): Promise<PlantAnalysis[]> {
    return db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.userId, userId));
  }

  async getPlantAnalysisByField(fieldId: number): Promise<PlantAnalysis[]> {
    return db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.fieldId, fieldId));
  }

  async getPlantAnalysisByCrop(cropId: number): Promise<PlantAnalysis[]> {
    return db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.cropId, cropId));
  }

  async getPlantAnalysis(id: number): Promise<PlantAnalysis | undefined> {
    const [analysis] = await db
      .select()
      .from(plantAnalyses)
      .where(eq(plantAnalyses.id, id));

    return analysis;
  }

  // ============== MARKETPLACE METHODS ==============//

  // Location methods
  async getLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db
      .select()
      .from(locations)
      .where(eq(locations.id, id));
    return location;
  }

  async getLocationByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<Location | undefined> {
    // Use a small threshold to find a location with similar coordinates
    const threshold = 0.0001; // Approximately 10 meters

    const nearbyLocations = await db
      .select()
      .from(locations)
      .where(
        and(
          sql`ABS(${locations.latitude}::float - ${latitude}) < ${threshold}`,
          sql`ABS(${locations.longitude}::float - ${longitude}) < ${threshold}`
        )
      );

    return nearbyLocations[0];
  }

  async createLocation(locationData: InsertLocation): Promise<Location> {
    // Generate H3 indexes if latitude and longitude are provided
    let h3Indexes = {};
    if (locationData.latitude && locationData.longitude) {
      const lat = Number(locationData.latitude);
      const lng = Number(locationData.longitude);

      // Import directly here to avoid circular dependencies
      const { generateH3Indexes } = await import("./services/h3-service");
      h3Indexes = generateH3Indexes(lat, lng);
    }

    const [location] = await db
      .insert(locations)
      .values({
        ...locationData,
        ...h3Indexes,
      })
      .returning();

    return location;
  }

  async updateLocation(
    id: number,
    locationData: Partial<Location>
  ): Promise<Location | undefined> {
    // Generate H3 indexes if latitude and longitude are updated
    let h3Indexes = {};
    if (locationData.latitude && locationData.longitude) {
      const lat = Number(locationData.latitude);
      const lng = Number(locationData.longitude);

      // Import directly here to avoid circular dependencies
      const { generateH3Indexes } = await import("./services/h3-service");
      h3Indexes = generateH3Indexes(lat, lng);
    }

    const [updatedLocation] = await db
      .update(locations)
      .set({
        ...locationData,
        ...h3Indexes,
        updatedAt: new Date(),
      })
      .where(eq(locations.id, id))
      .returning();
    return updatedLocation;
  }

  async deleteLocation(id: number): Promise<boolean> {
    try {
      await db.delete(locations).where(eq(locations.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting location:", error);
      return false;
    }
  }

  // Marketplace Listing methods
  async getMarketplaceListings(params?: {
    category?: string;
    search?: string;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    status?: string;
    locationId?: number;
    radius?: number;
    sortBy?: string;
    limit?: number;
    offset?: number;
  }): Promise<MarketplaceListing[]> {
    let query = db.select().from(marketplaceListings);

    if (params) {
      const whereConditions = [];

      if (params.category) {
        whereConditions.push(eq(marketplaceListings.category, params.category));
      }

      if (params.sellerId) {
        whereConditions.push(eq(marketplaceListings.sellerId, params.sellerId));
      }

      if (params.condition) {
        whereConditions.push(
          eq(marketplaceListings.condition, params.condition)
        );
      }

      if (params.status) {
        whereConditions.push(eq(marketplaceListings.status, params.status));
      }

      if (params.locationId) {
        whereConditions.push(
          eq(marketplaceListings.locationId, params.locationId)
        );
      }

      if (params.minPrice !== undefined) {
        whereConditions.push(
          sql`${marketplaceListings.price}::float >= ${params.minPrice}`
        );
      }

      if (params.maxPrice !== undefined) {
        whereConditions.push(
          sql`${marketplaceListings.price}::float <= ${params.maxPrice}`
        );
      }

      if (params.search) {
        whereConditions.push(
          or(
            sql`${marketplaceListings.title} ILIKE ${
              "%" + params.search + "%"
            }`,
            sql`${marketplaceListings.description} ILIKE ${
              "%" + params.search + "%"
            }`
          )
        );
      }

      if (whereConditions.length > 0) {
        query = query.where(and(...whereConditions));
      }

      // Apply sorting
      if (params.sortBy) {
        const [field, direction] = params.sortBy.split(":");
        const isDesc = direction === "desc";

        switch (field) {
          case "price":
            query = isDesc
              ? query.orderBy(desc(marketplaceListings.price))
              : query.orderBy(asc(marketplaceListings.price));
            break;
          case "createdAt":
            query = isDesc
              ? query.orderBy(desc(marketplaceListings.createdAt))
              : query.orderBy(asc(marketplaceListings.createdAt));
            break;
          case "title":
            query = isDesc
              ? query.orderBy(desc(marketplaceListings.title))
              : query.orderBy(asc(marketplaceListings.title));
            break;
          case "views":
            query = isDesc
              ? query.orderBy(desc(marketplaceListings.views))
              : query.orderBy(asc(marketplaceListings.views));
            break;
          default:
            // Default sorting by most recent
            query = query.orderBy(desc(marketplaceListings.createdAt));
        }
      } else {
        // Default sorting by most recent
        query = query.orderBy(desc(marketplaceListings.createdAt));
      }

      // Apply pagination
      if (params.limit !== undefined) {
        query = query.limit(params.limit);

        if (params.offset !== undefined) {
          query = query.offset(params.offset);
        }
      }
    }

    return await query;
  }

  async getMarketplaceListingsByLocation(
    latitude: number,
    longitude: number,
    radiusKm: number,
    filters?: Partial<MarketplaceListing>
  ): Promise<MarketplaceListing[]> {
    // Get all listings with locations
    const listingsWithLocations = await db
      .select({
        listing: marketplaceListings,
        location: locations,
      })
      .from(marketplaceListings)
      .leftJoin(locations, eq(marketplaceListings.locationId, locations.id))
      .where(
        and(
          isNotNull(marketplaceListings.locationId),
          isNotNull(locations.latitude),
          isNotNull(locations.longitude)
        )
      );

    // Filter listings by distance
    const filteredListings = listingsWithLocations
      .filter(({ location }) => {
        if (!location || !location.latitude || !location.longitude)
          return false;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = this.deg2rad(Number(location.latitude) - latitude);
        const dLon = this.deg2rad(Number(location.longitude) - longitude);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.deg2rad(latitude)) *
            Math.cos(this.deg2rad(Number(location.latitude))) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c; // Distance in km

        return distance <= radiusKm;
      })
      .map(({ listing }) => listing);

    // Apply additional filters if needed
    if (filters) {
      return filteredListings.filter((listing) => {
        for (const [key, value] of Object.entries(filters)) {
          if (key === "minPrice") {
            if (Number(listing.price) < Number(value)) return false;
          } else if (key === "maxPrice") {
            if (Number(listing.price) > Number(value)) return false;
          } else if (listing[key as keyof MarketplaceListing] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    return filteredListings;
  }

  async getMarketplaceListingsBySellerLocation(
    sellerId: number,
    radiusKm: number
  ): Promise<MarketplaceListing[]> {
    // First get all listings by this seller
    const sellerListings = await this.getMarketplaceListingsBySeller(sellerId);

    // Filter by radius from seller's location
    const result: MarketplaceListing[] = [];

    for (const listing of sellerListings) {
      if (!listing.locationId) continue;

      const location = await this.getLocation(listing.locationId);
      if (!location || !location.latitude || !location.longitude) continue;

      // Get other listings within radius of this listing
      const nearbyListings = await this.getMarketplaceListingsByLocation(
        Number(location.latitude),
        Number(location.longitude),
        radiusKm
      );

      // Add unique listings to result
      for (const nearby of nearbyListings) {
        if (!result.some((l) => l.id === nearby.id)) {
          result.push(nearby);
        }
      }
    }

    return result;
  }

  async getMarketplaceListing(
    id: number
  ): Promise<MarketplaceListing | undefined> {
    const [listing] = await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.id, id));
    return listing;
  }

  async getMarketplaceListingsBySeller(
    sellerId: number
  ): Promise<MarketplaceListing[]> {
    return await db
      .select()
      .from(marketplaceListings)
      .where(eq(marketplaceListings.sellerId, sellerId));
  }

  async createMarketplaceListing(
    listingData: InsertMarketplaceListing
  ): Promise<MarketplaceListing> {
    // The zod schema will handle boolean conversion now
    const [listing] = await db
      .insert(marketplaceListings)
      .values({
        ...listingData,
        status: listingData.status || "active",
        priceCurrency: listingData.priceCurrency || "USD",
        views: 0,
        favoriteCount: 0, // Initialize favorite count to zero
      })
      .returning();
    return listing;
  }

  async updateMarketplaceListing(
    id: number,
    listingData: Partial<MarketplaceListing>
  ): Promise<MarketplaceListing | undefined> {
    const [updatedListing] = await db
      .update(marketplaceListings)
      .set({
        ...listingData,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceListings.id, id))
      .returning();
    return updatedListing;
  }

  async deleteMarketplaceListing(id: number): Promise<boolean> {
    try {
      await db
        .delete(marketplaceListings)
        .where(eq(marketplaceListings.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting marketplace listing:", error);
      return false;
    }
  }

  async incrementListingViews(id: number): Promise<boolean> {
    try {
      const [listing] = await db
        .select()
        .from(marketplaceListings)
        .where(eq(marketplaceListings.id, id));

      if (!listing) return false;

      await db
        .update(marketplaceListings)
        .set({
          views: (listing.views || 0) + 1,
        })
        .where(eq(marketplaceListings.id, id));

      return true;
    } catch (error) {
      console.error("Error incrementing listing views:", error);
      return false;
    }
  }

  // Marketplace Review methods
  async getMarketplaceReviews(
    listingId?: number,
    sellerId?: number
  ): Promise<MarketplaceReview[]> {
    if (listingId && sellerId) {
      return await db
        .select()
        .from(marketplaceReviews)
        .where(
          and(
            eq(marketplaceReviews.listingId, listingId),
            eq(marketplaceReviews.sellerId, sellerId)
          )
        );
    } else if (listingId) {
      return await db
        .select()
        .from(marketplaceReviews)
        .where(eq(marketplaceReviews.listingId, listingId));
    } else if (sellerId) {
      return await db
        .select()
        .from(marketplaceReviews)
        .where(eq(marketplaceReviews.sellerId, sellerId));
    } else {
      return await db.select().from(marketplaceReviews);
    }
  }

  async getMarketplaceReview(
    id: number
  ): Promise<MarketplaceReview | undefined> {
    const [review] = await db
      .select()
      .from(marketplaceReviews)
      .where(eq(marketplaceReviews.id, id));
    return review;
  }

  async createMarketplaceReview(
    reviewData: InsertMarketplaceReview
  ): Promise<MarketplaceReview> {
    const [review] = await db
      .insert(marketplaceReviews)
      .values({
        ...reviewData,
        listingId: reviewData.listingId || null,
      })
      .returning();
    return review;
  }

  async updateMarketplaceReview(
    id: number,
    reviewData: Partial<MarketplaceReview>
  ): Promise<MarketplaceReview | undefined> {
    const [updatedReview] = await db
      .update(marketplaceReviews)
      .set({
        ...reviewData,
        updatedAt: new Date(),
      })
      .where(eq(marketplaceReviews.id, id))
      .returning();
    return updatedReview;
  }

  async deleteMarketplaceReview(id: number): Promise<boolean> {
    try {
      await db.delete(marketplaceReviews).where(eq(marketplaceReviews.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting marketplace review:", error);
      return false;
    }
  }

  // Marketplace Favorites methods
  async getMarketplaceFavorites(
    userId: number
  ): Promise<MarketplaceFavorite[]> {
    return await db
      .select()
      .from(marketplaceFavorites)
      .where(eq(marketplaceFavorites.userId, userId));
  }

  async getMarketplaceFavorite(
    id: number
  ): Promise<MarketplaceFavorite | undefined> {
    const [favorite] = await db
      .select()
      .from(marketplaceFavorites)
      .where(eq(marketplaceFavorites.id, id));
    return favorite;
  }

  async createMarketplaceFavorite(
    favoriteData: InsertMarketplaceFavorite
  ): Promise<MarketplaceFavorite> {
    const [favorite] = await db
      .insert(marketplaceFavorites)
      .values(favoriteData)
      .returning();

    // Increment the favorite count on the listing
    if (favoriteData.listingId) {
      try {
        const [listing] = await db
          .select()
          .from(marketplaceListings)
          .where(eq(marketplaceListings.id, favoriteData.listingId));

        if (listing) {
          await db
            .update(marketplaceListings)
            .set({
              favoriteCount: (listing.favoriteCount || 0) + 1,
            })
            .where(eq(marketplaceListings.id, favoriteData.listingId));
        }
      } catch (error) {
        console.error("Error incrementing favorite count:", error);
      }
    }

    return favorite;
  }

  async deleteMarketplaceFavorite(id: number): Promise<boolean> {
    try {
      // First, get the favorite to know which listing to update
      const [favorite] = await db
        .select()
        .from(marketplaceFavorites)
        .where(eq(marketplaceFavorites.id, id));

      // Delete the favorite
      await db
        .delete(marketplaceFavorites)
        .where(eq(marketplaceFavorites.id, id));

      // Decrement the favorite count on the listing
      if (favorite && favorite.listingId) {
        const [listing] = await db
          .select()
          .from(marketplaceListings)
          .where(eq(marketplaceListings.id, favorite.listingId));

        if (listing && listing.favoriteCount && listing.favoriteCount > 0) {
          await db
            .update(marketplaceListings)
            .set({
              favoriteCount: listing.favoriteCount - 1,
            })
            .where(eq(marketplaceListings.id, favorite.listingId));
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting marketplace favorite:", error);
      return false;
    }
  }

  // Marketplace Messages methods
  async getMarketplaceMessages(
    senderId?: number,
    recipientId?: number,
    listingId?: number
  ): Promise<MarketplaceMessage[]> {
    let query = db.select().from(marketplaceMessages);

    const whereConditions = [];

    if (senderId) {
      whereConditions.push(eq(marketplaceMessages.senderId, senderId));
    }

    if (recipientId) {
      whereConditions.push(eq(marketplaceMessages.recipientId, recipientId));
    }

    if (listingId) {
      whereConditions.push(eq(marketplaceMessages.listingId, listingId));
    }

    if (whereConditions.length > 0) {
      query = query.where(and(...whereConditions));
    }

    // Sort by date (newest first)
    query = query.orderBy(desc(marketplaceMessages.createdAt));

    return await query;
  }

  async getMarketplaceMessage(
    id: number
  ): Promise<MarketplaceMessage | undefined> {
    const [message] = await db
      .select()
      .from(marketplaceMessages)
      .where(eq(marketplaceMessages.id, id));
    return message;
  }

  async createMarketplaceMessage(
    messageData: InsertMarketplaceMessage
  ): Promise<MarketplaceMessage> {
    const [message] = await db
      .insert(marketplaceMessages)
      .values({
        ...messageData,
        read: false,
      })
      .returning();
    return message;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    try {
      const [updatedMessage] = await db
        .update(marketplaceMessages)
        .set({
          read: true,
        })
        .where(eq(marketplaceMessages.id, id))
        .returning();

      return !!updatedMessage;
    } catch (error) {
      console.error("Error marking message as read:", error);
      return false;
    }
  }

  async deleteMarketplaceMessage(id: number): Promise<boolean> {
    try {
      await db
        .delete(marketplaceMessages)
        .where(eq(marketplaceMessages.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting marketplace message:", error);
      return false;
    }
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(marketplaceMessages)
        .where(
          and(
            eq(marketplaceMessages.recipientId, userId),
            eq(marketplaceMessages.read, false)
          )
        );

      return Number(result[0]?.count || 0);
    } catch (error) {
      console.error("Error getting unread message count:", error);
      return 0;
    }
  }

  async createPlantAnalysis(data: InsertPlantAnalysis): Promise<PlantAnalysis> {
    const [analysis] = await db
      .insert(plantAnalyses)
      .values({
        ...data,
        fieldId: data.fieldId || null,
        cropId: data.cropId || null,
        diseaseDetected: data.diseaseDetected || null,
        diseaseProbability: data.diseaseProbability || null,
        diseaseDescription: data.diseaseDescription || null,
        nutrientDeficiencies: data.nutrientDeficiencies || null,
        nutrientExcess: data.nutrientExcess || null,
        recommendations: data.recommendations || null,
        additionalObservations: data.additionalObservations || null,
        notes: data.notes || null,
      })
      .returning();

    return analysis;
  }

  async updatePlantAnalysis(
    id: number,
    data: Partial<PlantAnalysis>
  ): Promise<PlantAnalysis | undefined> {
    const [analysis] = await db
      .update(plantAnalyses)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(plantAnalyses.id, id))
      .returning();

    return analysis;
  }

  async deletePlantAnalysis(id: number): Promise<boolean> {
    try {
      await db.delete(plantAnalyses).where(eq(plantAnalyses.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting plant analysis:", error);
      return false;
    }
  }
}

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
