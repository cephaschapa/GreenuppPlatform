import { 
  type ContactFormData, 
  type ContactInquiry, 
  type InsertUser, 
  type User, 
  type InsertFarmerProfile, 
  type FarmerProfile,
  users,
  farmerProfiles,
  contactForm
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
}

// Memory Storage implementation kept for reference
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private farmerProfiles: Map<number, FarmerProfile>;
  private contactInquiries: Map<number, ContactInquiry>;
  private userId: number;
  private profileId: number;
  private inquiryId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.farmerProfiles = new Map();
    this.contactInquiries = new Map();
    this.userId = 1;
    this.profileId = 1;
    this.inquiryId = 1;
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
}

// Export an instance of DatabaseStorage instead of MemStorage
export const storage = new DatabaseStorage();
