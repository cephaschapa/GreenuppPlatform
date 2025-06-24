import { db } from "../db.js";
import { farmerTasks } from "@shared/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface Task {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  dueDate: string;
  completed: boolean;
  priority: string | null;
  relatedCropId: number | null;
  relatedFieldId: number | null;
  notifyBefore: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: string;
  priority?: string;
  relatedCropId?: number;
  relatedFieldId?: number;
  notifyBefore?: number;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: string;
  completed?: boolean;
  priority?: string;
  relatedCropId?: number;
  relatedFieldId?: number;
  notifyBefore?: number;
}

export class TaskModel {
  /**
   * Find task by ID
   */
  static async findById(id: number): Promise<Task | null> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(eq(farmerTasks.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as Task;
    } catch (error) {
      throw new Error(
        `Failed to find task by ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Find task by ID and user ID (for authorization)
   */
  static async findByIdAndUserId(
    id: number,
    userId: number
  ): Promise<Task | null> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(and(eq(farmerTasks.id, id), eq(farmerTasks.userId, userId)))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      return result[0] as Task;
    } catch (error) {
      throw new Error(
        `Failed to find task by ID and user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get all tasks for a user
   */
  static async findByUserId(userId: number): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(eq(farmerTasks.userId, userId))
        .orderBy(farmerTasks.dueDate);

      return result as Task[];
    } catch (error) {
      throw new Error(
        `Failed to find tasks by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tasks by date
   */
  static async findByDate(userId: number, date: string): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(
          and(eq(farmerTasks.userId, userId), eq(farmerTasks.dueDate, date))
        )
        .orderBy(farmerTasks.dueDate);

      return result as Task[];
    } catch (error) {
      throw new Error(
        `Failed to find tasks by date: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tasks by date range
   */
  static async findByDateRange(
    userId: number,
    startDate: string,
    endDate: string
  ): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(
          and(
            eq(farmerTasks.userId, userId),
            gte(farmerTasks.dueDate, startDate),
            lte(farmerTasks.dueDate, endDate)
          )
        )
        .orderBy(farmerTasks.dueDate);

      return result as Task[];
    } catch (error) {
      throw new Error(
        `Failed to find tasks by date range: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tasks by priority
   */
  static async findByPriority(
    userId: number,
    priority: string
  ): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(
          and(
            eq(farmerTasks.userId, userId),
            eq(farmerTasks.priority, priority)
          )
        )
        .orderBy(farmerTasks.dueDate);

      return result as Task[];
    } catch (error) {
      throw new Error(
        `Failed to find tasks by priority: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tasks by crop ID
   */
  static async findByCropId(cropId: number): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(eq(farmerTasks.relatedCropId, cropId))
        .orderBy(farmerTasks.dueDate);

      return result as Task[];
    } catch (error) {
      throw new Error(
        `Failed to find tasks by crop ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get tasks by field ID
   */
  static async findByFieldId(fieldId: number): Promise<Task[]> {
    try {
      const result = await db
        .select()
        .from(farmerTasks)
        .where(eq(farmerTasks.relatedFieldId, fieldId))
        .orderBy(farmerTasks.dueDate);

      return result as Task[];
    } catch (error) {
      throw new Error(
        `Failed to find tasks by field ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create a new task
   */
  static async create(
    taskData: CreateTaskData & { userId: number }
  ): Promise<Task> {
    try {
      const result = await db
        .insert(farmerTasks)
        .values({
          title: taskData.title,
          userId: taskData.userId,
          description: taskData.description || null,
          dueDate: taskData.dueDate,
          priority: taskData.priority || "medium",
          relatedCropId: taskData.relatedCropId || null,
          relatedFieldId: taskData.relatedFieldId || null,
          notifyBefore: taskData.notifyBefore || null,
        })
        .returning();

      return result[0] as Task;
    } catch (error) {
      throw new Error(
        `Failed to create task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Update task
   */
  static async update(
    id: number,
    taskData: UpdateTaskData
  ): Promise<Task | null> {
    try {
      const updates: any = {};

      if (taskData.title !== undefined) {
        updates.title = taskData.title;
      }

      if (taskData.description !== undefined) {
        updates.description = taskData.description;
      }

      if (taskData.dueDate !== undefined) {
        updates.dueDate = taskData.dueDate;
      }

      if (taskData.completed !== undefined) {
        updates.completed = taskData.completed;
      }

      if (taskData.priority !== undefined) {
        updates.priority = taskData.priority;
      }

      if (taskData.relatedCropId !== undefined) {
        updates.relatedCropId = taskData.relatedCropId;
      }

      if (taskData.relatedFieldId !== undefined) {
        updates.relatedFieldId = taskData.relatedFieldId;
      }

      if (taskData.notifyBefore !== undefined) {
        updates.notifyBefore = taskData.notifyBefore;
      }

      if (Object.keys(updates).length === 0) {
        return this.findById(id);
      }

      const result = await db
        .update(farmerTasks)
        .set(updates)
        .where(eq(farmerTasks.id, id))
        .returning();

      if (result.length === 0) {
        return null;
      }

      return result[0] as Task;
    } catch (error) {
      throw new Error(
        `Failed to update task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Complete a task
   */
  static async complete(id: number): Promise<Task | null> {
    try {
      const result = await db
        .update(farmerTasks)
        .set({ completed: true })
        .where(eq(farmerTasks.id, id))
        .returning();

      if (result.length === 0) {
        return null;
      }

      return result[0] as Task;
    } catch (error) {
      throw new Error(
        `Failed to complete task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Delete task
   */
  static async delete(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(farmerTasks)
        .where(eq(farmerTasks.id, id))
        .returning();

      return result.length > 0;
    } catch (error) {
      throw new Error(
        `Failed to delete task: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Count tasks for a user
   */
  static async countByUserId(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: farmerTasks.id })
        .from(farmerTasks)
        .where(eq(farmerTasks.userId, userId));

      return result.length;
    } catch (error) {
      throw new Error(
        `Failed to count tasks by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Count completed tasks for a user
   */
  static async countCompletedByUserId(userId: number): Promise<number> {
    try {
      const result = await db
        .select({ count: farmerTasks.id })
        .from(farmerTasks)
        .where(
          and(eq(farmerTasks.userId, userId), eq(farmerTasks.completed, true))
        );

      return result.length;
    } catch (error) {
      throw new Error(
        `Failed to count completed tasks by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Count overdue tasks for a user
   */
  static async countOverdueByUserId(userId: number): Promise<number> {
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await db
        .select({ count: farmerTasks.id })
        .from(farmerTasks)
        .where(
          and(
            eq(farmerTasks.userId, userId),
            eq(farmerTasks.completed, false),
            lte(farmerTasks.dueDate, today)
          )
        );

      return result.length;
    } catch (error) {
      throw new Error(
        `Failed to count overdue tasks by user ID: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
