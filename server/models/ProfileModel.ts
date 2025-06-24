import { db } from "../db";
import { users, farmerProfiles } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { User, FarmerProfile, InsertFarmerProfile } from "@shared/schema";

export class ProfileModel {
  // Get user profile
  async getUserProfile(userId: number): Promise<User | undefined> {
    const results = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return results[0];
  }

  // Update user profile
  async updateUserProfile(
    userId: number,
    data: Partial<{
      firstName: string;
      lastName: string;
      profileImage: string;
    }>
  ): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return updatedUser;
  }

  // Get farmer profile
  async getFarmerProfile(userId: number): Promise<FarmerProfile | undefined> {
    const results = await db
      .select()
      .from(farmerProfiles)
      .where(eq(farmerProfiles.userId, userId))
      .limit(1);

    return results[0];
  }

  // Create farmer profile
  async createFarmerProfile(
    userId: number,
    data: InsertFarmerProfile
  ): Promise<FarmerProfile> {
    const [profile] = await db
      .insert(farmerProfiles)
      .values({
        ...data,
        userId,
      })
      .returning();

    return profile;
  }

  // Update farmer profile
  async updateFarmerProfile(
    userId: number,
    data: Partial<InsertFarmerProfile>
  ): Promise<FarmerProfile | undefined> {
    const [updatedProfile] = await db
      .update(farmerProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(farmerProfiles.userId, userId))
      .returning();

    return updatedProfile;
  }

  // Check if farmer profile exists
  async farmerProfileExists(userId: number): Promise<boolean> {
    const result = await this.getFarmerProfile(userId);
    return !!result;
  }

  // Get user with farmer profile
  async getUserWithFarmerProfile(userId: number): Promise<{
    user: User;
    farmerProfile: FarmerProfile | null;
  } | null> {
    const user = await this.getUserProfile(userId);
    if (!user) return null;

    const farmerProfile = await this.getFarmerProfile(userId);

    return {
      user,
      farmerProfile: farmerProfile || null,
    };
  }
}
