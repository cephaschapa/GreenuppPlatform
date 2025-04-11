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

// Plant Disease Analysis
export const plantAnalyses = pgTable("plant_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  imageData: text("image_data").notNull(), // Base64 encoded image
  plantType: text("plant_type"),
  fieldId: integer("field_id").references(() => fields.id),
  cropId: integer("crop_id").references(() => crops.id),
  analysisDate: timestamp("analysis_date").notNull().defaultNow(),
  diseaseDetected: text("disease_detected"),
  diseaseProbability: decimal("disease_probability", { precision: 5, scale: 2 }),
  diseaseDescription: text("disease_description"),
  healthStatus: text("health_status").notNull(),
  healthScore: integer("health_score").notNull(),
  nutrientDeficiencies: text("nutrient_deficiencies"),
  nutrientExcess: text("nutrient_excess"),
  recommendations: text("recommendations"),
  additionalObservations: text("additional_observations"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPlantAnalysisSchema = createInsertSchema(plantAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertPlantAnalysis = z.infer<typeof insertPlantAnalysisSchema>;
export type PlantAnalysis = typeof plantAnalyses.$inferSelect;

// Marketplace Schema

// Product categories enum
export const productCategoryEnum = pgEnum('product_category', [
  'seeds', 
  'fertilizers', 
  'pesticides',
  'equipment',
  'tools',
  'irrigation',
  'livestock',
  'feed',
  'produce',
  'grains',
  'fruits',
  'vegetables',
  'dairy',
  'meat',
  'services',
  'other'
]);

// Product condition enum
export const productConditionEnum = pgEnum('product_condition', [
  'new',
  'like_new',
  'good',
  'fair',
  'poor'
]);

// Listing status enum
export const listingStatusEnum = pgEnum('listing_status', [
  'active',
  'pending',
  'sold',
  'expired',
  'suspended'
]);

// Location table for precise geo-tracking
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  region: text("region").notNull(), // state/province
  city: text("city").notNull(),     // city/municipality
  neighborhood: text("neighborhood"), // optional neighborhood
  postalCode: text("postal_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  formattedAddress: text("formatted_address"),
  placeId: text("place_id"), // For Google Maps integration
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Marketplace listings table
export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceCurrency: text("price_currency").notNull().default('USD'),
  priceUnit: text("price_unit"), // per kg, per ton, per unit, etc.
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  quantityUnit: text("quantity_unit"), // kg, ton, unit, etc.
  condition: text("condition"), // new, used, etc.
  locationId: integer("location_id").references(() => locations.id),
  contactPhone: text("contact_phone"),
  // Note: contactEmail was removed because it doesn't exist in the database
  // Use contactPhone or user email instead
  availableFrom: timestamp("available_from").defaultNow(),
  availableUntil: timestamp("available_until"),
  deliveryAvailable: boolean("delivery_available").default(false),
  deliveryRadius: decimal("delivery_radius", { precision: 10, scale: 2 }),
  deliveryRadiusUnit: text("delivery_radius_unit").default('km'),
  status: text("status").notNull().default('active'),
  images: text("images").array(), // Array of image URLs or Base64
  views: integer("views").notNull().default(0),
  featured: boolean("featured").default(false),
  verified: boolean("verified").default(false),
  tags: text("tags").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Marketplace reviews
export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => marketplaceListings.id),
  sellerId: integer("seller_id").notNull().references(() => users.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Marketplace favorites/saved listings
export const marketplaceFavorites = pgTable("marketplace_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  listingId: integer("listing_id").notNull().references(() => marketplaceListings.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketplace messages/inquiries
export const marketplaceMessages = pgTable("marketplace_messages", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => marketplaceListings.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Create schemas for marketplace
export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  views: true,
});

export const insertMarketplaceReviewSchema = createInsertSchema(marketplaceReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceFavoriteSchema = createInsertSchema(marketplaceFavorites).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceMessageSchema = createInsertSchema(marketplaceMessages).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Export marketplace types
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertMarketplaceListing = z.infer<typeof insertMarketplaceListingSchema>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceReview = z.infer<typeof insertMarketplaceReviewSchema>;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type InsertMarketplaceFavorite = z.infer<typeof insertMarketplaceFavoriteSchema>;
export type MarketplaceFavorite = typeof marketplaceFavorites.$inferSelect;
export type InsertMarketplaceMessage = z.infer<typeof insertMarketplaceMessageSchema>;
export type MarketplaceMessage = typeof marketplaceMessages.$inferSelect;
