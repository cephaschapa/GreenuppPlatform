import { Request, Response } from "express";
import {
  UserModel,
  CreateUserData,
  UpdateUserData,
} from "../models/UserModel.js";
import { logger } from "../lib/logger.js";

export class UserController {
  /**
   * Get all users with pagination
   */
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const [users, totalCount] = await Promise.all([
        UserModel.findAll(limit, offset),
        UserModel.count(),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      res.status(200).json({
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      });
    } catch (error) {
      logger.error("Failed to get users:", error);
      res.status(500).json({
        error: "Failed to retrieve users",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Get user by ID
   */
  static async show(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await UserModel.findById(id);

      if (!user) {
        res.status(404).json({
          error: "User not found",
          message: `User with ID ${id} does not exist`,
        });
        return;
      }

      res.status(200).json({ user });
    } catch (error) {
      logger.error("Failed to get user:", error);
      res.status(500).json({
        error: "Failed to retrieve user",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Create a new user
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password } = req.body;

      // Validation
      if (!email || !name || !password) {
        res.status(400).json({
          error: "Validation failed",
          message: "Email, name, and password are required",
        });
        return;
      }

      // Check if user already exists
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        res.status(409).json({
          error: "User already exists",
          message: "A user with this email already exists",
        });
        return;
      }

      const userData: CreateUserData = { email, name, password };
      const newUser = await UserModel.create(userData);

      logger.info(`User created: ${newUser.id}`);
      res.status(201).json({ user: newUser });
    } catch (error) {
      logger.error("Failed to create user:", error);
      res.status(500).json({
        error: "Failed to create user",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Update user
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { email, name } = req.body;

      // Check if user exists
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        res.status(404).json({
          error: "User not found",
          message: `User with ID ${id} does not exist`,
        });
        return;
      }

      // Check if email is being changed and if it's already taken
      if (email && email !== existingUser.email) {
        const userWithEmail = await UserModel.findByEmail(email);
        if (userWithEmail) {
          res.status(409).json({
            error: "Email already taken",
            message: "A user with this email already exists",
          });
          return;
        }
      }

      const updateData: UpdateUserData = {};
      if (email !== undefined) updateData.email = email;
      if (name !== undefined) updateData.name = name;

      const updatedUser = await UserModel.update(id, updateData);

      if (!updatedUser) {
        res.status(404).json({
          error: "User not found",
          message: `User with ID ${id} does not exist`,
        });
        return;
      }

      logger.info(`User updated: ${id}`);
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      logger.error("Failed to update user:", error);
      res.status(500).json({
        error: "Failed to update user",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Delete user
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await UserModel.findById(id);
      if (!existingUser) {
        res.status(404).json({
          error: "User not found",
          message: `User with ID ${id} does not exist`,
        });
        return;
      }

      const deleted = await UserModel.delete(id);

      if (!deleted) {
        res.status(404).json({
          error: "User not found",
          message: `User with ID ${id} does not exist`,
        });
        return;
      }

      logger.info(`User deleted: ${id}`);
      res.status(204).send();
    } catch (error) {
      logger.error("Failed to delete user:", error);
      res.status(500).json({
        error: "Failed to delete user",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
