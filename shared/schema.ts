import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum, date, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const UserRole = {
  FARMER: "farmer",
  SUPPLIER: "supplier",
  BUYER: "buyer",
  ADMIN: "admin",
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default(UserRole.FARMER),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Farmer profiles table (extends user info for farmers)
export const farmerProfiles = pgTable("farmer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  farmName: text("farm_name"),
  farmLocation: text("farm_location"),
  farmSize: text("farm_size"),
  farmType: text("farm_type"),
  bio: text("bio"),
  contactPhone: text("contact_phone"),
  mainCrops: text("main_crops").array(),
  establishedYear: integer("established_year"),
  settings: jsonb("settings").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insert schema for User registration
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  role: true,
  firstName: true,
  lastName: true,
});

// Extended validation for registration
export const registerUserSchema = insertUserSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Login schema
export const loginUserSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Schema for farmer profile
export const insertFarmerProfileSchema = createInsertSchema(farmerProfiles).pick({
  farmName: true,
  farmLocation: true,
  farmSize: true,
  farmType: true,
  bio: true,
  contactPhone: true,
  mainCrops: true,
  establishedYear: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFarmerProfile = z.infer<typeof insertFarmerProfileSchema>;
export type FarmerProfile = typeof farmerProfiles.$inferSelect;

// Contact form schema
export const contactForm = pgTable("contact_inquiries", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  farmType: text("farm_type").notNull(),
  message: text("message").notNull(),
  newsletter: boolean("newsletter").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const contactFormSchema = createInsertSchema(contactForm).pick({
  firstName: true,
  lastName: true,
  email: true,
  farmType: true,
  message: true,
  newsletter: true,
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type ContactInquiry = typeof contactForm.$inferSelect;

// Crop Management System

// Crop status enum
export const cropStatusEnum = pgEnum('crop_status', ['planning', 'planted', 'growing', 'harvesting', 'completed', 'failed']);

// Field management table
export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  location: text("location"),
  size: decimal("size", { precision: 10, scale: 2 }),
  sizeUnit: text("size_unit").default('hectares'),
  soilType: text("soil_type"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop management table
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  variety: text("variety"),
  status: text("status").notNull().default('planning'),
  fieldId: integer("field_id").references(() => fields.id),
  plantingDate: date("planting_date"),
  expectedHarvestDate: date("expected_harvest_date"),
  actualHarvestDate: date("actual_harvest_date"),
  expectedYield: decimal("expected_yield", { precision: 10, scale: 2 }),
  actualYield: decimal("actual_yield", { precision: 10, scale: 2 }),
  yieldUnit: text("yield_unit").default('kg'),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop activities table (for tracking tasks, treatments, etc.)
export const cropActivities = pgTable("crop_activities", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  activityType: text("activity_type").notNull(), // e.g., fertilizing, pest control, irrigation
  activityDate: date("activity_date").notNull(),
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create schemas for crop management
export const insertFieldSchema = createInsertSchema(fields).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCropActivitySchema = createInsertSchema(cropActivities).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Crop management types
// Weather preferences for farmers
export const weatherPreferences = pgTable("weather_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  locations: text("locations").array(),
  alertsEnabled: boolean("alerts_enabled").default(true),
  temperatureUnit: text("temperature_unit").default('celsius'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Farmer tasks and reminders
export const farmerTasks = pgTable("farmer_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  completed: boolean("completed").default(false),
  priority: text("priority").default('medium'), // low, medium, high
  relatedCropId: integer("related_crop_id").references(() => crops.id),
  relatedFieldId: integer("related_field_id").references(() => fields.id),
  notifyBefore: integer("notify_before"), // days before due date to notify
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop yield predictions
export const cropYieldPredictions = pgTable("crop_yield_predictions", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  predictedYield: decimal("predicted_yield", { precision: 10, scale: 2 }),
  yieldUnit: text("yield_unit").default('kg'),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }), // 0-100%
  factorsConsidered: jsonb("factors_considered").$type<Record<string, any>>(), // weather, soil, etc.
  predictionDate: timestamp("prediction_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create schemas for new tables
export const insertWeatherPreferencesSchema = createInsertSchema(weatherPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFarmerTaskSchema = createInsertSchema(farmerTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCropYieldPredictionSchema = createInsertSchema(cropYieldPredictions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertField = z.infer<typeof insertFieldSchema>;
export type Field = typeof fields.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;
export type Crop = typeof crops.$inferSelect;
export type InsertCropActivity = z.infer<typeof insertCropActivitySchema>;
export type CropActivity = typeof cropActivities.$inferSelect;

// New types for farmer features
export type InsertWeatherPreferences = z.infer<typeof insertWeatherPreferencesSchema>;
export type WeatherPreferences = typeof weatherPreferences.$inferSelect;
export type InsertFarmerTask = z.infer<typeof insertFarmerTaskSchema>;
export type FarmerTask = typeof farmerTasks.$inferSelect;
export type InsertCropYieldPrediction = z.infer<typeof insertCropYieldPredictionSchema>;
export type CropYieldPrediction = typeof cropYieldPredictions.$inferSelect;

// Push notification subscriptions
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow()
});

export const insertPushSubscriptionSchema = createInsertSchema(pushSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertPushSubscription = z.infer<typeof insertPushSubscriptionSchema>;
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
