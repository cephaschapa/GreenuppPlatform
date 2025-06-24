import { db } from "../db.js";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role?: string;
  firstName?: string;
  lastName?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
}

export class UserModel {
  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, parseInt(id)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as User;
    } catch (error) {
      throw new Error(
        `Failed to find user by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as User;
    } catch (error) {
      throw new Error(
        `Failed to find user by email: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a new user
   */
  static async create(userData: CreateUserData): Promise<User> {
    try {
      const result = await db
        .insert(users)
        .values({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          role: userData.role || "farmer",
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
        })
        .returning();

      return result[0] as User;
    } catch (error) {
      throw new Error(
        `Failed to create user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update user
   */
  static async update(
    id: string,
    userData: UpdateUserData
  ): Promise<User | null> {
    try {
      const updates: any = {};

      if (userData.username !== undefined) {
        updates.username = userData.username;
      }

      if (userData.email !== undefined) {
        updates.email = userData.email;
      }

      if (userData.firstName !== undefined) {
        updates.firstName = userData.firstName;
      }

      if (userData.lastName !== undefined) {
        updates.lastName = userData.lastName;
      }

      if (userData.profileImage !== undefined) {
        updates.profileImage = userData.profileImage;
      }

      if (Object.keys(updates).length === 0) {
        return this.findById(id);
      }

      const result = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, parseInt(id)))
        .returning();

      if (result.length === 0) {
        return null;
      }

      return result[0] as User;
    } catch (error) {
      throw new Error(
        `Failed to update user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await db
        .delete(users)
        .where(eq(users.id, parseInt(id)))
        .returning();

      return result.length > 0;
    } catch (error) {
      throw new Error(
        `Failed to delete user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all users with pagination
   */
  static async findAll(
    limit: number = 10,
    offset: number = 0
  ): Promise<User[]> {
    try {
      const result = await db.select().from(users).limit(limit).offset(offset);

      return result as User[];
    } catch (error) {
      throw new Error(
        `Failed to find users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Count total users
   */
  static async count(): Promise<number> {
    try {
      const result = await db.select({ count: users.id }).from(users);

      return result.length;
    } catch (error) {
      throw new Error(
        `Failed to count users: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
