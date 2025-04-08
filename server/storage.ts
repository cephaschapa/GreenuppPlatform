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
  users,
  farmerProfiles,
  contactForm,
  fields,
  crops,
  cropActivities
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { db } from "./db";
import { eq } from "drizzle-orm";
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
}

// Memory Storage implementation kept for reference
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private farmerProfiles: Map<number, FarmerProfile>;
  private contactInquiries: Map<number, ContactInquiry>;
  private fields: Map<number, Field>;
  private crops: Map<number, Crop>;
  private cropActivities: Map<number, CropActivity>;
  private userId: number;
  private profileId: number;
  private inquiryId: number;
  private fieldId: number;
  private cropId: number;
  private activityId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.farmerProfiles = new Map();
    this.contactInquiries = new Map();
    this.fields = new Map();
    this.crops = new Map();
    this.cropActivities = new Map();
    this.userId = 1;
    this.profileId = 1;
    this.inquiryId = 1;
    this.fieldId = 1;
    this.cropId = 1;
    this.activityId = 1;
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
}

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
