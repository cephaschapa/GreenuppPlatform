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
  users,
  farmerProfiles,
  contactForm,
  fields,
  crops,
  cropActivities,
  weatherPreferences,
  farmerTasks,
  cropYieldPredictions,
  plantAnalyses
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq, and, gte, lte } from "drizzle-orm";
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
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Farmer profiles
  getFarmerProfile(userId: number): Promise<FarmerProfile | undefined>;
  createFarmerProfile(profile: InsertFarmerProfile & { userId: number }): Promise<FarmerProfile>;
  updateFarmerProfile(userId: number, profileData: Partial<FarmerProfile>): Promise<FarmerProfile | undefined>;
  
  // Contact form
  saveContactInquiry(data: ContactFormData): Promise<ContactInquiry>;
  getContactInquiries(): Promise<ContactInquiry[]>;
  
  // Field management
  getFields(userId: number): Promise<Field[]>;
  getField(id: number): Promise<Field | undefined>;
  createField(fieldData: InsertField & { userId: number }): Promise<Field>;
  updateField(id: number, fieldData: Partial<Field>): Promise<Field | undefined>;
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
  updateCropActivity(id: number, activityData: Partial<CropActivity>): Promise<CropActivity | undefined>;
  deleteCropActivity(id: number): Promise<boolean>;
  
  // Weather preferences
  getWeatherPreferences(userId: number): Promise<WeatherPreferences | undefined>;
  createWeatherPreferences(data: InsertWeatherPreferences & { userId: number }): Promise<WeatherPreferences>;
  updateWeatherPreferences(userId: number, data: Partial<WeatherPreferences>): Promise<WeatherPreferences | undefined>;
  
  // Farmer tasks and reminders
  getTasks(userId: number): Promise<FarmerTask[]>;
  getTasksByDate(userId: number, date: Date): Promise<FarmerTask[]>;
  getTasksByDateRange(userId: number, startDate: Date, endDate: Date): Promise<FarmerTask[]>;
  getTasksByPriority(userId: number, priority: string): Promise<FarmerTask[]>;
  getTasksByCrop(cropId: number): Promise<FarmerTask[]>;
  getTasksByField(fieldId: number): Promise<FarmerTask[]>;
  getTask(id: number): Promise<FarmerTask | undefined>;
  createTask(taskData: InsertFarmerTask & { userId: number }): Promise<FarmerTask>;
  updateTask(id: number, taskData: Partial<FarmerTask>): Promise<FarmerTask | undefined>;
  deleteTask(id: number): Promise<boolean>;
  completeTask(id: number): Promise<FarmerTask | undefined>;
  
  // Crop yield predictions
  getCropYieldPredictions(cropId: number): Promise<CropYieldPrediction[]>;
  createCropYieldPrediction(data: InsertCropYieldPrediction): Promise<CropYieldPrediction>;
  updateCropYieldPrediction(id: number, data: Partial<CropYieldPrediction>): Promise<CropYieldPrediction | undefined>;
  
  // Plant analysis
  getPlantAnalyses(userId: number): Promise<PlantAnalysis[]>;
  getPlantAnalysisByField(fieldId: number): Promise<PlantAnalysis[]>;
  getPlantAnalysisByCrop(cropId: number): Promise<PlantAnalysis[]>;
  getPlantAnalysis(id: number): Promise<PlantAnalysis | undefined>;
  createPlantAnalysis(data: InsertPlantAnalysis): Promise<PlantAnalysis>;
  updatePlantAnalysis(id: number, data: Partial<PlantAnalysis>): Promise<PlantAnalysis | undefined>;
  deletePlantAnalysis(id: number): Promise<boolean>;
  
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

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values({
      ...insertUser,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      profileImage: null,
      role: insertUser.role || "farmer",
    }).returning();
    
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
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
  
  async createFarmerProfile(profileData: InsertFarmerProfile & { userId: number }): Promise<FarmerProfile> {
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
  
  async updateFarmerProfile(userId: number, profileData: Partial<FarmerProfile>): Promise<FarmerProfile | undefined> {
    // First, find the profile by userId
    const existingProfile = await this.getFarmerProfile(userId);
    if (!existingProfile) return undefined;
    
    // Then update it by id
    const [profile] = await db
      .update(farmerProfiles)
      .set({
        ...profileData,
        updatedAt: new Date()
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

  async createField(fieldData: InsertField & { userId: number }): Promise<Field> {
    const [field] = await db
      .insert(fields)
      .values({
        ...fieldData,
        location: fieldData.location || null,
        size: fieldData.size || null,
        sizeUnit: fieldData.sizeUnit || 'hectares',
        soilType: fieldData.soilType || null,
        notes: fieldData.notes || null,
      })
      .returning();
    
    return field;
  }

  async updateField(id: number, fieldData: Partial<Field>): Promise<Field | undefined> {
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
      const result = await db
        .delete(fields)
        .where(eq(fields.id, id));
      
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
        status: cropData.status || 'planning',
        fieldId: cropData.fieldId || null,
        plantingDate: cropData.plantingDate || null,
        expectedHarvestDate: cropData.expectedHarvestDate || null,
        actualHarvestDate: cropData.actualHarvestDate || null,
        expectedYield: cropData.expectedYield || null,
        actualYield: cropData.actualYield || null,
        yieldUnit: cropData.yieldUnit || 'kg',
        notes: cropData.notes || null,
      })
      .returning();
    
    return crop;
  }

  async updateCrop(id: number, cropData: Partial<Crop>): Promise<Crop | undefined> {
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
      const result = await db
        .delete(crops)
        .where(eq(crops.id, id));
      
      return true; // If no error is thrown, the delete was successful
    } catch (error) {
      console.error("Error deleting crop:", error);
      return false;
    }
  }

  // Crop activity methods
  async getCropActivities(cropId: number): Promise<CropActivity[]> {
    return db.select().from(cropActivities).where(eq(cropActivities.cropId, cropId));
  }

  async getCropActivity(id: number): Promise<CropActivity | undefined> {
    const [activity] = await db.select().from(cropActivities).where(eq(cropActivities.id, id));
    return activity;
  }

  async createCropActivity(activityData: InsertCropActivity): Promise<CropActivity> {
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

  async updateCropActivity(id: number, activityData: Partial<CropActivity>): Promise<CropActivity | undefined> {
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
  async getWeatherPreferences(userId: number): Promise<WeatherPreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(weatherPreferences)
      .where(eq(weatherPreferences.userId, userId));
    
    return prefs;
  }

  async createWeatherPreferences(data: InsertWeatherPreferences & { userId: number }): Promise<WeatherPreferences> {
    const [prefs] = await db
      .insert(weatherPreferences)
      .values({
        ...data,
        locations: data.locations || [],
        alertsEnabled: data.alertsEnabled ?? true,
        temperatureUnit: data.temperatureUnit || 'celsius',
      })
      .returning();
    
    return prefs;
  }

  async updateWeatherPreferences(userId: number, data: Partial<WeatherPreferences>): Promise<WeatherPreferences | undefined> {
    // First, find the preferences by userId
    const existingPrefs = await this.getWeatherPreferences(userId);
    if (!existingPrefs) return undefined;
    
    // Make sure locations is always an array
    const updatedData: any = { ...data };
    
    // If locations is provided, ensure it's an array
    if ('locations' in updatedData) {
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
        updatedAt: new Date()
      })
      .where(eq(weatherPreferences.id, existingPrefs.id))
      .returning();
    
    console.log("Updated preferences:", prefs);
    
    return prefs;
  }

  // Farmer tasks methods
  async getTasks(userId: number): Promise<FarmerTask[]> {
    return db
      .select()
      .from(farmerTasks)
      .where(eq(farmerTasks.userId, userId));
  }

  async getTasksByDate(userId: number, date: Date): Promise<FarmerTask[]> {
    // Format the date to match SQL date format (YYYY-MM-DD)
    const formattedDate = date.toISOString().split('T')[0];
    
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

  async getTasksByDateRange(userId: number, startDate: Date, endDate: Date): Promise<FarmerTask[]> {
    // Format dates to match SQL date format (YYYY-MM-DD)
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = endDate.toISOString().split('T')[0];
    
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

  async getTasksByPriority(userId: number, priority: string): Promise<FarmerTask[]> {
    return db
      .select()
      .from(farmerTasks)
      .where(
        and(
          eq(farmerTasks.userId, userId),
          eq(farmerTasks.priority, priority)
        )
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

  async createTask(taskData: InsertFarmerTask & { userId: number }): Promise<FarmerTask> {
    const [task] = await db
      .insert(farmerTasks)
      .values({
        ...taskData,
        description: taskData.description || null,
        completed: taskData.completed || false,
        priority: taskData.priority || 'medium',
        relatedCropId: taskData.relatedCropId || null,
        relatedFieldId: taskData.relatedFieldId || null,
        notifyBefore: taskData.notifyBefore || null,
      })
      .returning();
    
    return task;
  }

  async updateTask(id: number, taskData: Partial<FarmerTask>): Promise<FarmerTask | undefined> {
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
      await db
        .delete(farmerTasks)
        .where(eq(farmerTasks.id, id));
      
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
  async getCropYieldPredictions(cropId: number): Promise<CropYieldPrediction[]> {
    return db
      .select()
      .from(cropYieldPredictions)
      .where(eq(cropYieldPredictions.cropId, cropId));
  }

  async createCropYieldPrediction(data: InsertCropYieldPrediction): Promise<CropYieldPrediction> {
    const [prediction] = await db
      .insert(cropYieldPredictions)
      .values({
        ...data,
        predictedYield: data.predictedYield || null,
        yieldUnit: data.yieldUnit || 'kg',
        confidenceLevel: data.confidenceLevel || null,
        factorsConsidered: data.factorsConsidered || {},
      })
      .returning();
    
    return prediction;
  }

  async updateCropYieldPrediction(id: number, data: Partial<CropYieldPrediction>): Promise<CropYieldPrediction | undefined> {
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

  async updatePlantAnalysis(id: number, data: Partial<PlantAnalysis>): Promise<PlantAnalysis | undefined> {
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
      await db
        .delete(plantAnalyses)
        .where(eq(plantAnalyses.id, id));
      
      return true;
    } catch (error) {
      console.error("Error deleting plant analysis:", error);
      return false;
    }
  }
}

// Memory Storage implementation kept for reference
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private farmerProfiles: Map<number, FarmerProfile>;
  private contactInquiries: Map<number, ContactInquiry>;
  private fields: Map<number, Field>;
  private crops: Map<number, Crop>;
  private cropActivities: Map<number, CropActivity>;
  private weatherPrefs: Map<number, WeatherPreferences>;
  private tasks: Map<number, FarmerTask>;
  private yieldPredictions: Map<number, CropYieldPrediction>;
  private plantAnalyses: Map<number, PlantAnalysis>;
  private userId: number;
  private profileId: number;
  private inquiryId: number;
  private fieldId: number;
  private cropId: number;
  private activityId: number;
  private prefsId: number;
  private taskId: number;
  private predictionId: number;
  private analysisId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.farmerProfiles = new Map();
    this.contactInquiries = new Map();
    this.fields = new Map();
    this.crops = new Map();
    this.cropActivities = new Map();
    this.weatherPrefs = new Map();
    this.tasks = new Map();
    this.yieldPredictions = new Map();
    this.plantAnalyses = new Map();
    this.userId = 1;
    this.profileId = 1;
    this.inquiryId = 1;
    this.fieldId = 1;
    this.cropId = 1;
    this.activityId = 1;
    this.prefsId = 1;
    this.taskId = 1;
    this.predictionId = 1;
    this.analysisId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      profileImage: null,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || "farmer",
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser: User = {
      ...user,
      ...userData,
      id, // Ensure id doesn't change
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async getFarmerProfile(userId: number): Promise<FarmerProfile | undefined> {
    return Array.from(this.farmerProfiles.values()).find(
      (profile) => profile.userId === userId,
    );
  }
  
  async createFarmerProfile(profileData: InsertFarmerProfile & { userId: number }): Promise<FarmerProfile> {
    const id = this.profileId++;
    const now = new Date();
    const profile: FarmerProfile = {
      ...profileData,
      id,
      farmName: profileData.farmName || null,
      farmLocation: profileData.farmLocation || null,
      farmSize: profileData.farmSize || null,
      farmType: profileData.farmType || null,
      bio: profileData.bio || null,
      contactPhone: profileData.contactPhone || null,
      mainCrops: profileData.mainCrops ? [...profileData.mainCrops as string[]] : null,
      establishedYear: profileData.establishedYear || null,
      settings: {},
      createdAt: now,
      updatedAt: now,
    };
    
    this.farmerProfiles.set(id, profile);
    return profile;
  }
  
  async updateFarmerProfile(userId: number, profileData: Partial<FarmerProfile>): Promise<FarmerProfile | undefined> {
    const profile = await this.getFarmerProfile(userId);
    if (!profile) return undefined;
    
    const updatedProfile: FarmerProfile = {
      ...profile,
      ...profileData,
      id: profile.id, // Ensure id doesn't change
      userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };
    
    this.farmerProfiles.set(profile.id, updatedProfile);
    return updatedProfile;
  }

  async saveContactInquiry(data: ContactFormData): Promise<ContactInquiry> {
    const id = this.inquiryId++;
    const timestamp = new Date();
    
    const inquiry: ContactInquiry = {
      id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      farmType: data.farmType,
      message: data.message,
      newsletter: data.newsletter || false,
      timestamp,
    };
    
    this.contactInquiries.set(id, inquiry);
    return inquiry;
  }

  async getContactInquiries(): Promise<ContactInquiry[]> {
    return Array.from(this.contactInquiries.values());
  }

  // Field management methods
  async getFields(userId: number): Promise<Field[]> {
    return Array.from(this.fields.values()).filter(
      (field) => field.userId === userId,
    );
  }

  async getField(id: number): Promise<Field | undefined> {
    return this.fields.get(id);
  }

  async createField(fieldData: InsertField & { userId: number }): Promise<Field> {
    const id = this.fieldId++;
    const now = new Date();
    const field: Field = {
      ...fieldData,
      id,
      location: fieldData.location || null,
      size: fieldData.size || null,
      sizeUnit: fieldData.sizeUnit || 'hectares',
      soilType: fieldData.soilType || null,
      notes: fieldData.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.fields.set(id, field);
    return field;
  }

  async updateField(id: number, fieldData: Partial<Field>): Promise<Field | undefined> {
    const field = await this.getField(id);
    if (!field) return undefined;
    
    const updatedField: Field = {
      ...field,
      ...fieldData,
      id, // Ensure id doesn't change
      userId: field.userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };
    
    this.fields.set(id, updatedField);
    return updatedField;
  }

  async deleteField(id: number): Promise<boolean> {
    const exists = this.fields.has(id);
    if (exists) {
      this.fields.delete(id);
    }
    return exists;
  }

  // Crop management methods
  async getCrops(userId: number): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(
      (crop) => crop.userId === userId,
    );
  }

  async getCropsByField(fieldId: number): Promise<Crop[]> {
    return Array.from(this.crops.values()).filter(
      (crop) => crop.fieldId === fieldId,
    );
  }

  async getCrop(id: number): Promise<Crop | undefined> {
    return this.crops.get(id);
  }

  async createCrop(cropData: InsertCrop & { userId: number }): Promise<Crop> {
    const id = this.cropId++;
    const now = new Date();
    const crop: Crop = {
      ...cropData,
      id,
      variety: cropData.variety || null,
      status: cropData.status || 'planning',
      fieldId: cropData.fieldId || null,
      plantingDate: cropData.plantingDate || null,
      expectedHarvestDate: cropData.expectedHarvestDate || null,
      actualHarvestDate: cropData.actualHarvestDate || null,
      expectedYield: cropData.expectedYield || null,
      actualYield: cropData.actualYield || null,
      yieldUnit: cropData.yieldUnit || 'kg',
      notes: cropData.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.crops.set(id, crop);
    return crop;
  }

  async updateCrop(id: number, cropData: Partial<Crop>): Promise<Crop | undefined> {
    const crop = await this.getCrop(id);
    if (!crop) return undefined;
    
    const updatedCrop: Crop = {
      ...crop,
      ...cropData,
      id, // Ensure id doesn't change
      userId: crop.userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };
    
    this.crops.set(id, updatedCrop);
    return updatedCrop;
  }

  async deleteCrop(id: number): Promise<boolean> {
    const exists = this.crops.has(id);
    if (exists) {
      this.crops.delete(id);
    }
    return exists;
  }

  // Crop activity methods
  async getCropActivities(cropId: number): Promise<CropActivity[]> {
    return Array.from(this.cropActivities.values()).filter(
      (activity) => activity.cropId === cropId,
    );
  }

  async getCropActivity(id: number): Promise<CropActivity | undefined> {
    return this.cropActivities.get(id);
  }

  async createCropActivity(activityData: InsertCropActivity): Promise<CropActivity> {
    const id = this.activityId++;
    const now = new Date();
    const activity: CropActivity = {
      ...activityData,
      id,
      cost: activityData.cost || null,
      notes: activityData.notes || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.cropActivities.set(id, activity);
    return activity;
  }

  async updateCropActivity(id: number, activityData: Partial<CropActivity>): Promise<CropActivity | undefined> {
    const activity = await this.getCropActivity(id);
    if (!activity) return undefined;
    
    const updatedActivity: CropActivity = {
      ...activity,
      ...activityData,
      id, // Ensure id doesn't change
      cropId: activity.cropId, // Ensure cropId doesn't change
      updatedAt: new Date(),
    };
    
    this.cropActivities.set(id, updatedActivity);
    return updatedActivity;
  }

  async deleteCropActivity(id: number): Promise<boolean> {
    const exists = this.cropActivities.has(id);
    if (exists) {
      this.cropActivities.delete(id);
    }
    return exists;
  }
  
  // Weather preferences methods
  async getWeatherPreferences(userId: number): Promise<WeatherPreferences | undefined> {
    return Array.from(this.weatherPrefs.values()).find(
      (prefs) => prefs.userId === userId,
    );
  }

  async createWeatherPreferences(data: InsertWeatherPreferences & { userId: number }): Promise<WeatherPreferences> {
    const id = this.prefsId++;
    const now = new Date();
    const prefs: WeatherPreferences = {
      ...data,
      id,
      locations: data.locations || [],
      alertsEnabled: data.alertsEnabled ?? true,
      temperatureUnit: data.temperatureUnit || 'celsius',
      createdAt: now,
      updatedAt: now,
    };
    
    this.weatherPrefs.set(id, prefs);
    return prefs;
  }

  async updateWeatherPreferences(userId: number, data: Partial<WeatherPreferences>): Promise<WeatherPreferences | undefined> {
    const prefs = await this.getWeatherPreferences(userId);
    if (!prefs) return undefined;
    
    const updatedPrefs: WeatherPreferences = {
      ...prefs,
      ...data,
      id: prefs.id, // Ensure id doesn't change
      userId: prefs.userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };
    
    this.weatherPrefs.set(prefs.id, updatedPrefs);
    return updatedPrefs;
  }

  // Farmer tasks methods
  async getTasks(userId: number): Promise<FarmerTask[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  async getTasksByDate(userId: number, date: Date): Promise<FarmerTask[]> {
    const dateString = date.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
    return Array.from(this.tasks.values()).filter(
      (task) => {
        // Safely convert any date format to YYYY-MM-DD string
        let taskDate: string;
        
        if (typeof task.dueDate === 'string') {
          // If it's a string, try to parse it
          try {
            taskDate = new Date(task.dueDate).toISOString().split('T')[0];
          } catch (e) {
            // If parsing fails, just use the string for comparison
            taskDate = task.dueDate;
          }
        } else if (task.dueDate && typeof task.dueDate === 'object' && 'toISOString' in task.dueDate) {
          // If it's a Date-like object, convert to string
          taskDate = task.dueDate.toISOString().split('T')[0];
        } else {
          // If it's something else, return false to exclude it
          return false;
        }
          
        return task.userId === userId && taskDate === dateString;
      }
    );
  }

  async getTasksByDateRange(userId: number, startDate: Date, endDate: Date): Promise<FarmerTask[]> {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return Array.from(this.tasks.values()).filter(
      (task) => {
        // Safely convert any date format to YYYY-MM-DD string
        let taskDateStr: string;
        
        if (typeof task.dueDate === 'string') {
          // If it's a string, try to parse it
          try {
            taskDateStr = new Date(task.dueDate).toISOString().split('T')[0];
          } catch (e) {
            // If parsing fails, just use the string for comparison
            taskDateStr = task.dueDate;
          }
        } else if (task.dueDate && typeof task.dueDate === 'object' && 'toISOString' in task.dueDate) {
          // If it's a Date-like object, convert to string
          taskDateStr = task.dueDate.toISOString().split('T')[0];
        } else {
          // If it's something else, return false to exclude it
          return false;
        }
          
        return (
          task.userId === userId && 
          taskDateStr >= startDateStr && 
          taskDateStr <= endDateStr
        );
      }
    );
  }

  async getTasksByPriority(userId: number, priority: string): Promise<FarmerTask[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId && task.priority === priority,
    );
  }

  async getTasksByCrop(cropId: number): Promise<FarmerTask[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.relatedCropId === cropId,
    );
  }

  async getTasksByField(fieldId: number): Promise<FarmerTask[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.relatedFieldId === fieldId,
    );
  }

  async getTask(id: number): Promise<FarmerTask | undefined> {
    return this.tasks.get(id);
  }

  async createTask(taskData: InsertFarmerTask & { userId: number }): Promise<FarmerTask> {
    const id = this.taskId++;
    const now = new Date();
    const task: FarmerTask = {
      ...taskData,
      id,
      description: taskData.description || null,
      completed: taskData.completed || false,
      priority: taskData.priority || 'medium',
      relatedCropId: taskData.relatedCropId || null,
      relatedFieldId: taskData.relatedFieldId || null,
      notifyBefore: taskData.notifyBefore || null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, taskData: Partial<FarmerTask>): Promise<FarmerTask | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const updatedTask: FarmerTask = {
      ...task,
      ...taskData,
      id, // Ensure id doesn't change
      userId: task.userId, // Ensure userId doesn't change
      updatedAt: new Date(),
    };
    
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const exists = this.tasks.has(id);
    if (exists) {
      this.tasks.delete(id);
    }
    return exists;
  }

  async completeTask(id: number): Promise<FarmerTask | undefined> {
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    const completedTask: FarmerTask = {
      ...task,
      completed: true,
      updatedAt: new Date(),
    };
    
    this.tasks.set(id, completedTask);
    return completedTask;
  }

  // Crop yield prediction methods
  async getCropYieldPredictions(cropId: number): Promise<CropYieldPrediction[]> {
    return Array.from(this.yieldPredictions.values()).filter(
      (prediction) => prediction.cropId === cropId,
    );
  }

  async createCropYieldPrediction(data: InsertCropYieldPrediction): Promise<CropYieldPrediction> {
    const id = this.predictionId++;
    const now = new Date();
    const prediction: CropYieldPrediction = {
      ...data,
      id,
      predictedYield: data.predictedYield || null,
      yieldUnit: data.yieldUnit || 'kg',
      confidenceLevel: data.confidenceLevel || null,
      factorsConsidered: data.factorsConsidered || {},
      predictionDate: now,
      createdAt: now,
      updatedAt: now,
    };
    
    this.yieldPredictions.set(id, prediction);
    return prediction;
  }

  async updateCropYieldPrediction(id: number, data: Partial<CropYieldPrediction>): Promise<CropYieldPrediction | undefined> {
    const prediction = this.yieldPredictions.get(id);
    if (!prediction) return undefined;
    
    const updatedPrediction: CropYieldPrediction = {
      ...prediction,
      ...data,
      id, // Ensure id doesn't change
      cropId: prediction.cropId, // Ensure cropId doesn't change
      updatedAt: new Date(),
    };
    
    this.yieldPredictions.set(id, updatedPrediction);
    return updatedPrediction;
  }
  
  // Plant analysis methods
  async getPlantAnalyses(userId: number): Promise<PlantAnalysis[]> {
    return Array.from(this.plantAnalyses.values()).filter(
      (analysis) => analysis.userId === userId,
    );
  }
  
  async getPlantAnalysisByField(fieldId: number): Promise<PlantAnalysis[]> {
    return Array.from(this.plantAnalyses.values()).filter(
      (analysis) => analysis.fieldId === fieldId,
    );
  }
  
  async getPlantAnalysisByCrop(cropId: number): Promise<PlantAnalysis[]> {
    return Array.from(this.plantAnalyses.values()).filter(
      (analysis) => analysis.cropId === cropId,
    );
  }
  
  async getPlantAnalysis(id: number): Promise<PlantAnalysis | undefined> {
    return this.plantAnalyses.get(id);
  }
  
  async createPlantAnalysis(data: InsertPlantAnalysis): Promise<PlantAnalysis> {
    const id = this.analysisId++;
    const now = new Date();
    const analysis: PlantAnalysis = {
      ...data,
      id,
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
      createdAt: now,
      updatedAt: now,
    };
    
    this.plantAnalyses.set(id, analysis);
    return analysis;
  }
  
  async updatePlantAnalysis(id: number, data: Partial<PlantAnalysis>): Promise<PlantAnalysis | undefined> {
    const analysis = this.plantAnalyses.get(id);
    if (!analysis) return undefined;
    
    const updatedAnalysis: PlantAnalysis = {
      ...analysis,
      ...data,
      id,
      userId: analysis.userId,
      updatedAt: new Date(),
    };
    
    this.plantAnalyses.set(id, updatedAnalysis);
    return updatedAnalysis;
  }
  
  async deletePlantAnalysis(id: number): Promise<boolean> {
    const exists = this.plantAnalyses.has(id);
    if (exists) {
      this.plantAnalyses.delete(id);
    }
    return exists;
  }
}

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
