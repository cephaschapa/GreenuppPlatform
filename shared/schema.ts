import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
  pgEnum,
  date,
  decimal,
  varchar,
  json,
  real,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for user roles
export const UserRole = {
  FARMER: "farmer",
  SUPPLIER: "supplier",
  BUYER: "buyer",
  ADMIN: "admin",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

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
  phone: text("phone").unique(), // Phone number for SMS notifications (unique per user)
  emailVerified: boolean("email_verified").default(false), // Email verification status
  // Password attempt tracking
  failedLoginAttempts: integer("failed_login_attempts").default(0), // Number of consecutive failed attempts
  accountLockedUntil: timestamp("account_locked_until"), // When the account will be unlocked (null if not locked)
  lastFailedLoginAt: timestamp("last_failed_login_at"), // When the last failed attempt occurred
  // Push notification fields
  fcmToken: text("fcm_token"), // Firebase Cloud Messaging token
  fcmTokenUpdatedAt: timestamp("fcm_token_updated_at"), // When the token was last updated
  pushNotificationsEnabled: boolean("push_notifications_enabled").default(true), // User preference
  // Onboarding fields
  onboardingCompleted: boolean("onboarding_completed").default(false), // Whether user has completed onboarding
  onboardingCompletedAt: timestamp("onboarding_completed_at"), // When onboarding was completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Onboarding progress table for storing step-by-step progress
export const onboardingProgress = pgTable("onboarding_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id)
    .unique(), // One progress record per user
  currentStep: integer("current_step").notNull().default(1), // Current step in onboarding
  onboardingData: jsonb("onboarding_data")
    .$type<Record<string, any>>()
    .default({}), // Step data storage
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User preferences table for storing user-specific settings
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id)
    .unique(), // One preference record per user
  preferences: jsonb("preferences")
    .$type<Record<string, any>>()
    .notNull()
    .default({}), // All user preferences
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Farmer profiles table (extends user info for farmers)
// farmLocationId resolved by LocationResolverService; farm_location text kept for UX
export const farmerProfiles = pgTable("farmer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  farmName: text("farm_name"),
  farmLocation: text("farm_location"),
  farmLocationId: integer("farm_location_id"), // FK → locations.id (add in migration)
  farmLocationSource: text("farm_location_source"), // user_text | zambian_db | openweather_geo | gps_field_inferred
  farmLocationConfidence: text("farm_location_confidence"), // low | medium | high
  farmLocationResolvedAt: timestamp("farm_location_resolved_at"),
  farmLocationLastGeocodeError: text("farm_location_last_geocode_error"),
  farmSize: text("farm_size"),
  farmType: text("farm_type"),
  bio: text("bio"),
  contactPhone: text("contact_phone"),
  mainCrops: text("main_crops").array(),
  establishedYear: integer("established_year"),
  settings: jsonb("settings").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  // Onboarding (Zambia-first)
  province: text("province"), // Zambian province
  farmerType: text("farmer_type"), // smallholder | emerging | commercial
  yearsFarming: integer("years_farming"),
  mainGoal: text("main_goal"), // increase_yield | reduce_costs | manage_risks | sell_produce
  cooperativeMember: boolean("cooperative_member").default(false),
});

// Farms table (one per farm; supports multi-farm)
export const farms = pgTable("farms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  farmName: text("farm_name").notNull().default("My Farm"),
  farmLocationText: text("farm_location_text").notNull(),
  farmLocationSource: text("farm_location_source").notNull(), // zambian_database | gps | manual
  farmLocationId: integer("farm_location_id"), // FK → locations.id (set by location resolver)
  lat: decimal("lat", { precision: 10, scale: 7 }),
  lng: decimal("lng", { precision: 10, scale: 7 }),
  farmSizeHa: decimal("farm_size_ha", { precision: 8, scale: 2 }).notNull(),
  irrigationType: text("irrigation_type"), // rainfed | borehole | canal | drip | pivot | none
  waterSourceNotes: text("water_source_notes"),
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
export const registerUserSchema = insertUserSchema
  .extend({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Login schema
export const loginUserSchema = z.object({
  email: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

// Schema for farmer profile
export const insertFarmerProfileSchema = createInsertSchema(
  farmerProfiles
).pick({
  farmName: true,
  farmLocation: true,
  farmSize: true,
  farmType: true,
  bio: true,
  contactPhone: true,
  mainCrops: true,
  establishedYear: true,
});

// Schema for farm (onboarding / multi-farm)
export const insertFarmSchema = createInsertSchema(farms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFarmerProfile = z.infer<typeof insertFarmerProfileSchema>;
export type FarmerProfile = typeof farmerProfiles.$inferSelect;
export type InsertFarm = z.infer<typeof insertFarmSchema>;
export type Farm = typeof farms.$inferSelect;

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
export const cropStatusEnum = pgEnum("crop_status", [
  "planning",
  "planted",
  "growing",
  "harvesting",
  "completed",
  "failed",
]);

// Field management table
export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  farmId: integer("farm_id").references(() => farms.id), // FK to farms (onboarding / multi-farm)
  name: text("name").notNull(),
  location: text("location"), // Keep for backward compatibility
  locationId: integer("location_id").references(() => locations.id), // Link to precise location data
  size: decimal("size", { precision: 10, scale: 2 }),
  sizeUnit: text("size_unit").default("hectares"),
  soilType: text("soil_type"),
  notes: text("notes"),
  // Field boundary as GeoJSON polygon
  boundary: jsonb("boundary").$type<{
    type: "Polygon";
    coordinates: number[][][]; // [[[lng, lat], [lng, lat], ...]]
  }>(),
  // Calculated area from boundary (in square meters)
  calculatedArea: decimal("calculated_area", { precision: 12, scale: 2 }),
  // Center point of the field (calculated from boundary)
  centerLat: decimal("center_lat", { precision: 10, scale: 7 }),
  centerLng: decimal("center_lng", { precision: 10, scale: 7 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop management table with traceability fields
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  variety: text("variety"),
  status: text("status").notNull().default("planning"),
  fieldId: integer("field_id").references(() => fields.id),
  fieldSize: text("field_size"), // Area under this specific crop
  sizeUnit: text("size_unit").default("hectares"), // Unit for the field size
  plantingDate: date("planting_date"),
  expectedHarvestDate: date("expected_harvest_date"),
  actualHarvestDate: date("actual_harvest_date"),
  expectedYield: decimal("expected_yield", { precision: 10, scale: 2 }),
  actualYield: decimal("actual_yield", { precision: 10, scale: 2 }),
  yieldUnit: text("yield_unit").default("kg"),
  notes: text("notes"),
  // CropTrace fields
  batchId: text("batch_id"), // Unique identifier for this crop batch
  seedSource: text("seed_source"), // Origin of the seeds
  seedVariety: text("seed_variety"), // Specific variety from the seed provider
  organicCertified: boolean("organic_certified").default(false),
  certificationId: text("certification_id"), // Reference to certification if any
  blockchainTxId: text("blockchain_tx_id"), // Blockchain transaction ID
  traceabilityQrCode: text("traceability_qr_code"), // QR code for public tracking
  qrScanCount: integer("qr_scan_count").default(0), // Total QR code scans
  lastScannedAt: timestamp("last_scanned_at"), // Last scan timestamp
  firstScannedAt: timestamp("first_scanned_at"), // First scan timestamp
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop activities table (for tracking tasks, treatments, etc.)
export const cropActivities = pgTable("crop_activities", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id),
  activityType: text("activity_type").notNull(), // e.g., fertilizing, pest control, irrigation
  activityDate: date("activity_date").notNull(),
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop observations table for daily monitoring
export const cropObservations = pgTable("crop_observations", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  fieldId: integer("field_id").references(() => fields.id),
  observationDate: timestamp("observation_date").notNull().defaultNow(),
  observationType: text("observation_type").notNull(),
  notes: text("notes"),
  healthStatus: text("health_status"),
  healthScore: integer("health_score"),
  heightCm: decimal("height_cm", { precision: 10, scale: 2 }),
  leafCount: integer("leaf_count"),
  fruitCount: integer("fruit_count"),
  pestDetected: boolean("pest_detected").default(false),
  pestType: text("pest_type"),
  pestSeverity: text("pest_severity"),
  diseaseDetected: boolean("disease_detected").default(false),
  diseaseType: text("disease_type"),
  diseaseSeverity: text("disease_severity"),
  actionTaken: text("action_taken"),
  waterAmountLiters: decimal("water_amount_liters", {
    precision: 10,
    scale: 2,
  }),
  fertilizerApplied: boolean("fertilizer_applied").default(false),
  fertilizerType: text("fertilizer_type"),
  fertilizerAmount: text("fertilizer_amount"),
  photos: text("photos").array(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  weatherCondition: text("weather_condition"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Field visits table
export const fieldVisits = pgTable("field_visits", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id")
    .notNull()
    .references(() => fields.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  visitDate: timestamp("visit_date").notNull().defaultNow(),
  durationMinutes: integer("duration_minutes"),
  purpose: text("purpose"),
  notes: text("notes"),
  overallCondition: text("overall_condition"),
  issuesFound: text("issues_found").array(),
  actionsTaken: text("actions_taken").array(),
  temperature: decimal("temperature", { precision: 5, scale: 2 }),
  weatherCondition: text("weather_condition"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  photos: text("photos").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop growth stages for smart notifications
export const cropGrowthStages = pgTable("crop_growth_stages", {
  id: serial("id").primaryKey(),
  cropName: text("crop_name").notNull(),
  stageName: text("stage_name").notNull(),
  stageOrder: integer("stage_order").notNull(),
  daysFromPlantingMin: integer("days_from_planting_min").notNull(),
  daysFromPlantingMax: integer("days_from_planting_max").notNull(),
  description: text("description"),
  visualIndicators: text("visual_indicators").array(),
  careActions: text("care_actions").array(),
  commonIssues: text("common_issues").array(),
  shouldNotify: boolean("should_notify").default(true),
  notificationMessage: text("notification_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ---- Crop Planning + Seed Variety + Yield Simulation (Zambia) ----

/** Reference crop types (Maize, Soybean, etc.) for planning */
export const cropRef = pgTable("crop_ref", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"), // cereal, legume, tuber, etc.
  defaultWaterRequirementMm: real("default_water_requirement_mm"),
  defaultGddRange: jsonb("default_gdd_range").$type<{ min?: number; max?: number }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Seed companies (SeedCo, Pioneer/Corteva, etc.) */
export const seedCompanies = pgTable("seed_companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  country: text("country").default("ZM"),
  website: text("website"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Seed varieties with Zambia agro-ecological fit and planting windows */
export const seedVarieties = pgTable("seed_varieties", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").notNull().references(() => cropRef.id),
  companyId: integer("company_id").references(() => seedCompanies.id),
  name: text("name").notNull(),
  code: text("code"),
  type: text("type").notNull(), // hybrid | opv
  grainColor: text("grain_color"),
  maturityClass: text("maturity_class").notNull(), // ultra_early | early | medium | late
  daysToMaturityMin: integer("days_to_maturity_min"),
  daysToMaturityMax: integer("days_to_maturity_max"),
  yieldPotentialThaMin: real("yield_potential_t_ha_min"),
  yieldPotentialThaMax: real("yield_potential_t_ha_max"),
  traits: jsonb("traits").$type<{
    drought_tolerant?: boolean;
    disease_tolerance?: string[];
    standability?: string;
    [k: string]: unknown;
  }>(),
  recommendedRegions: text("recommended_regions").array(), // I, II, III
  recommendedProvinces: text("recommended_provinces").array(),
  recommendedPlantingWindow: jsonb("recommended_planting_window").$type<{
    start_month?: number;
    end_month?: number;
    notes?: string;
  }>(),
  sourceUrl: text("source_url"),
  sourceDoc: text("source_doc"),
  lastVerifiedAt: date("last_verified_at"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Seasons (e.g. 2026/27) */
export const seasons = pgTable("seasons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Management level for crop plan */
export const managementLevelEnum = pgEnum("management_level_enum", [
  "low",
  "medium",
  "high",
]);

/** Field crop plan: crop + optional seed variety per field per season */
export const fieldCropPlans = pgTable("field_crop_plans", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull().references(() => fields.id),
  seasonId: integer("season_id").notNull().references(() => seasons.id),
  cropId: integer("crop_id").notNull().references(() => cropRef.id),
  seedVarietyId: integer("seed_variety_id").references(() => seedVarieties.id),
  targetAreaHa: decimal("target_area_ha", { precision: 10, scale: 2 }),
  plantingDate: date("planting_date"),
  expectedHarvestDate: date("expected_harvest_date"),
  managementLevel: text("management_level").default("medium"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/** Yield simulation run snapshot (auditable) */
export const yieldSimulationRuns = pgTable("yield_simulation_runs", {
  id: serial("id").primaryKey(),
  fieldCropPlanId: integer("field_crop_plan_id")
    .notNull()
    .references(() => fieldCropPlans.id),
  runAt: timestamp("run_at").notNull().defaultNow(),
  weatherSnapshotJson: jsonb("weather_snapshot_json").$type<Record<string, unknown>>(),
  methodVersion: text("method_version").notNull().default("mvp_v1"),
  inputs: jsonb("inputs").$type<Record<string, unknown>>().notNull(),
  outputs: jsonb("outputs").$type<{
    conservative?: number;
    expected?: number;
    best_case?: number;
    drivers?: Record<string, number>;
  }>().notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

/** Province/District → Agro-Ecological Region (I, II, III) for Zambia */
export const agroEcologicalRegions = pgTable("agro_ecological_regions", {
  id: serial("id").primaryKey(),
  province: text("province").notNull(),
  district: text("district"),
  region: text("region").notNull(), // I | II | III
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

export const insertCropActivitySchema = createInsertSchema(cropActivities).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  }
);

// Crop management types
// Weather preferences for farmers
export const weatherPreferences = pgTable("weather_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  locations: text("locations").array(),
  alertsEnabled: boolean("alerts_enabled").default(true),
  temperatureUnit: text("temperature_unit").default("celsius"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Farmer tasks and reminders
export const farmerTasks = pgTable("farmer_tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: date("due_date").notNull(),
  completed: boolean("completed").default(false),
  priority: text("priority").default("medium"), // low, medium, high
  relatedCropId: integer("related_crop_id").references(() => crops.id),
  relatedFieldId: integer("related_field_id").references(() => fields.id),
  notifyBefore: integer("notify_before"), // days before due date to notify
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop yield predictions
export const cropYieldPredictions = pgTable("crop_yield_predictions", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id),
  predictedYield: decimal("predicted_yield", { precision: 10, scale: 2 }),
  yieldUnit: text("yield_unit").default("kg"),
  confidenceLevel: decimal("confidence_level", { precision: 5, scale: 2 }), // 0-100%
  factorsConsidered: jsonb("factors_considered").$type<Record<string, any>>(), // weather, soil, etc.
  predictionDate: timestamp("prediction_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Crop varieties reference database
export const cropVarieties = pgTable("crop_varieties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Maize (Corn)", "Wheat"
  variety: text("variety").notNull(), // e.g., "Hybrid", "Winter Wheat"
  // Temperature requirements (°C)
  tempMin: decimal("temp_min", { precision: 5, scale: 2 }).notNull(),
  tempOptimal: decimal("temp_optimal", { precision: 5, scale: 2 }).notNull(),
  tempMax: decimal("temp_max", { precision: 5, scale: 2 }).notNull(),
  // Growing period (days)
  growingDaysMin: integer("growing_days_min").notNull(),
  growingDaysMax: integer("growing_days_max").notNull(),
  // Water requirements
  waterRequirement: text("water_requirement").notNull(), // 'Low', 'Medium', 'High'
  // Soil preferences
  soilTypes: text("soil_types").array().notNull(),
  soilPhMin: decimal("soil_ph_min", { precision: 3, scale: 1 }).notNull(),
  soilPhMax: decimal("soil_ph_max", { precision: 3, scale: 1 }).notNull(),
  // Seasonality
  plantingSeasons: text("planting_seasons").array().notNull(),
  // Additional metadata
  description: text("description"),
  isActive: boolean("is_active").default(true),
  region: text("region"), // e.g., "Global", "Tropical", "Temperate", "Zambia"
  // Yield information
  expectedYieldMin: decimal("expected_yield_min", { precision: 8, scale: 2 }),
  expectedYieldMax: decimal("expected_yield_max", { precision: 8, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create schemas for new tables
export const insertWeatherPreferencesSchema = createInsertSchema(
  weatherPreferences
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFarmerTaskSchema = createInsertSchema(farmerTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCropYieldPredictionSchema = createInsertSchema(
  cropYieldPredictions
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCropVarietySchema = createInsertSchema(cropVarieties).omit({
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
export type InsertWeatherPreferences = z.infer<
  typeof insertWeatherPreferencesSchema
>;
export type WeatherPreferences = typeof weatherPreferences.$inferSelect;
export type InsertFarmerTask = z.infer<typeof insertFarmerTaskSchema>;
export type FarmerTask = typeof farmerTasks.$inferSelect;
export type InsertCropYieldPrediction = z.infer<
  typeof insertCropYieldPredictionSchema
>;
export type CropYieldPrediction = typeof cropYieldPredictions.$inferSelect;
export type InsertCropVariety = z.infer<typeof insertCropVarietySchema>;
export type CropVariety = typeof cropVarieties.$inferSelect;

// Note: CropTrace events table is defined below in the marketplace section

// Plant Disease Analysis
export const plantAnalyses = pgTable("plant_analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  imageData: text("image_data").notNull(), // Base64 encoded image
  plantType: text("plant_type"),
  fieldId: integer("field_id").references(() => fields.id),
  cropId: integer("crop_id").references(() => crops.id),
  analysisDate: timestamp("analysis_date").notNull().defaultNow(),
  diseaseDetected: text("disease_detected"),
  diseaseProbability: decimal("disease_probability", {
    precision: 5,
    scale: 2,
  }),
  diseaseDescription: text("disease_description"),
  healthStatus: text("health_status").notNull(),
  healthScore: integer("health_score").notNull(),
  nutrientDeficiencies: text("nutrient_deficiencies"),
  nutrientExcess: text("nutrient_excess"),
  recommendations: text("recommendations"),
  additionalObservations: text("additional_observations"),
  notes: text("notes"),
  // Treatment plan reference - will be set after treatment plan is created
  // treatmentPlanId: integer("treatment_plan_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Treatment Plans for plant diseases
export const treatmentPlans = pgTable("treatment_plans", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  analysisId: integer("analysis_id")
    .notNull()
    .references(() => plantAnalyses.id),
  title: text("title").notNull(),
  description: text("description"),
  diseaseType: text("disease_type").notNull(),
  severity: text("severity").notNull(), // mild, moderate, severe
  estimatedDuration: integer("estimated_duration"), // in days
  status: text("status").notNull().default("active"), // active, completed, cancelled
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Treatment Steps within a plan
export const treatmentSteps = pgTable("treatment_steps", {
  id: serial("id").primaryKey(),
  treatmentPlanId: integer("treatment_plan_id")
    .notNull()
    .references(() => treatmentPlans.id),
  stepNumber: integer("step_number").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  treatmentType: text("treatment_type").notNull(), // chemical, organic, cultural, biological
  productName: text("product_name"),
  activeIngredient: text("active_ingredient"),
  dosage: text("dosage"), // e.g., "2ml per liter"
  applicationMethod: text("application_method"), // spray, soil drench, foliar, etc.
  frequency: text("frequency"), // daily, weekly, bi-weekly, etc.
  duration: integer("duration"), // number of applications
  safetyNotes: text("safety_notes"),
  cost: decimal("cost", { precision: 10, scale: 2 }),
  costUnit: text("cost_unit"), // per application, total, etc.
  isCompleted: boolean("is_completed").default(false),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Treatment Progress Tracking
export const treatmentProgress = pgTable("treatment_progress", {
  id: serial("id").primaryKey(),
  treatmentStepId: integer("treatment_step_id")
    .notNull()
    .references(() => treatmentSteps.id),
  applicationDate: timestamp("application_date").notNull().defaultNow(),
  appliedDosage: text("applied_dosage"),
  weatherConditions: text("weather_conditions"),
  observations: text("observations"),
  effectiveness: integer("effectiveness"), // 1-5 scale
  photos: text("photos").array(), // Base64 encoded images
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Product Recommendations for treatments
export const treatmentProducts = pgTable("treatment_products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  activeIngredient: text("active_ingredient"),
  productType: text("product_type").notNull(), // fungicide, insecticide, herbicide, fertilizer, etc.
  targetDiseases: text("target_diseases").array(), // disease and pest names (e.g. Late Blight, Fall Armyworm)
  targetCrops: text("target_crops").array(),
  imageUrl: text("image_url"), // product image for UI
  applicationRate: text("application_rate"),
  safetyClass: text("safety_class"), // I, II, III, IV
  reEntryInterval: integer("re_entry_interval"), // hours
  preHarvestInterval: integer("pre_harvest_interval"), // days
  organic: boolean("organic").default(false),
  description: text("description"),
  manufacturer: text("manufacturer"),
  price: decimal("price", { precision: 10, scale: 2 }),
  priceUnit: text("price_unit"), // per liter, per kg, etc.
  availability: text("availability"), // local, regional, national
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPlantAnalysisSchema = createInsertSchema(plantAnalyses).omit(
  {
    id: true,
    createdAt: true,
    updatedAt: true,
  }
);

export type InsertPlantAnalysis = z.infer<typeof insertPlantAnalysisSchema>;
export type PlantAnalysis = typeof plantAnalyses.$inferSelect;

// Treatment Plan schemas
export const insertTreatmentPlanSchema = createInsertSchema(
  treatmentPlans
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTreatmentStepSchema = createInsertSchema(
  treatmentSteps
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTreatmentProgressSchema = createInsertSchema(
  treatmentProgress
).omit({
  id: true,
  createdAt: true,
});

export const insertTreatmentProductSchema = createInsertSchema(
  treatmentProducts
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTreatmentPlan = z.infer<typeof insertTreatmentPlanSchema>;
export type TreatmentPlan = typeof treatmentPlans.$inferSelect;
export type InsertTreatmentStep = z.infer<typeof insertTreatmentStepSchema>;
export type TreatmentStep = typeof treatmentSteps.$inferSelect;
export type InsertTreatmentProgress = z.infer<
  typeof insertTreatmentProgressSchema
>;
export type TreatmentProgress = typeof treatmentProgress.$inferSelect;
export type InsertTreatmentProduct = z.infer<
  typeof insertTreatmentProductSchema
>;
export type TreatmentProduct = typeof treatmentProducts.$inferSelect;

// Marketplace Schema

// Product categories enum
// Notification types enum
export const notificationTypeEnum = pgEnum("notification_type", [
  "weather_alert",
  "task_reminder",
  "market_price_alert",
  "system_notification",
  "message",
  "crop_update",
]);

// Notification status enum
export const notificationStatusEnum = pgEnum("notification_status", [
  "unread",
  "read",
  "archived",
]);

export const productCategoryEnum = pgEnum("product_category", [
  "seeds",
  "fertilizers",
  "pesticides",
  "equipment",
  "tools",
  "irrigation",
  "livestock",
  "feed",
  "produce",
  "grains",
  "fruits",
  "vegetables",
  "dairy",
  "meat",
  "services",
  "other",
]);

// Product condition enum
export const productConditionEnum = pgEnum("product_condition", [
  "new",
  "like_new",
  "good",
  "fair",
  "poor",
]);

// Listing status enum
export const listingStatusEnum = pgEnum("listing_status", [
  "active",
  "pending",
  "sold",
  "expired",
  "suspended",
]);

// Location table for precise geo-tracking
export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  country: text("country").notNull(),
  region: text("region").notNull(), // state/province
  city: text("city").notNull(), // city/municipality
  neighborhood: text("neighborhood"), // optional neighborhood
  postalCode: text("postal_code"),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  formattedAddress: text("formatted_address"),
  placeId: text("place_id"), // For Google Maps integration
  // H3 geospatial indexes at different resolutions for efficient geo queries
  h3Index8: text("h3_index_8"), // Resolution 8 (~ 5km² hexagons)
  h3Index9: text("h3_index_9"), // Resolution 9 (~ 0.6km² hexagons)
  h3Index10: text("h3_index_10"), // Resolution 10 (~ 0.075km² hexagons)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Weather snapshots (observation layer) – normalized forecast for reproducibility
export const weatherSnapshots = pgTable("weather_snapshots", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  userId: integer("user_id").references(() => users.id),
  locationName: text("location_name").notNull(),
  lat: decimal("lat", { precision: 10, scale: 7 }).notNull(),
  lng: decimal("lng", { precision: 10, scale: 7 }).notNull(),
  source: text("source").notNull(), // openweather_2_5 | openweather_3_0 | zambian_database
  forecastJson: jsonb("forecast_json").notNull(),
  forecastFrom: timestamp("forecast_from"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Decisions (decision layer) – daily actionable recommendations
export const decisions = pgTable("decisions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  scopeType: text("scope_type").notNull(), // field | crop | farm | general
  fieldId: integer("field_id").references(() => fields.id),
  cropId: integer("crop_id").references(() => crops.id),
  decisionType: text("decision_type").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  priority: text("priority").notNull(), // high | medium | low
  confidenceLevel: text("confidence_level").notNull(), // low | medium | high
  confidenceScore: decimal("confidence_score", { precision: 5, scale: 2 }),
  whyText: text("why_text").notNull(),
  whyPayload: jsonb("why_payload"),
  triggerType: text("trigger_type").notNull(),
  triggerRefId: integer("trigger_ref_id"),
  rulesetVersion: text("ruleset_version").notNull(),
  status: text("status").notNull().default("generated"),
  expiresAt: timestamp("expires_at").notNull(),
  shownAt: timestamp("shown_at"),
  actedAt: timestamp("acted_at"),
  /** Micro feedback: true = helpful, false = not helpful */
  feedbackHelpful: boolean("feedback_helpful"),
  /** Optional reason when feedbackHelpful is false */
  feedbackReason: text("feedback_reason"),
  feedbackAt: timestamp("feedback_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Analytics events (append-only; table name avoids conflict with social "events")
export const events = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  deviceId: text("device_id"),
  eventName: text("event_name").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  properties: jsonb("properties"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketplace listings table
// Crop trace events table for blockchain traceability
export const cropTraceEvents = pgTable("crop_trace_events", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id")
    .notNull()
    .references(() => crops.id),
  eventType: text("event_type").notNull(), // planting, fertilizing, harvesting, processing, packaging, shipping, etc.
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull().defaultNow(),
  performedBy: integer("performed_by")
    .notNull()
    .references(() => users.id),
  inputMaterials: text("input_materials"), // fertilizers, pesticides, etc.
  outputQuantity: decimal("output_quantity", { precision: 10, scale: 2 }),
  outputUnit: text("output_unit"), // kg, lb, units, etc.
  blockchainTxId: text("blockchain_tx_id"), // blockchain transaction ID
  blockchainTxHash: text("blockchain_tx_hash"), // blockchain transaction hash for verification
  attachments: text("attachments").array(), // URLs to images or documents
  metadata: jsonb("metadata").$type<Record<string, any>>(), // additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  sellerId: integer("seller_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  priceCurrency: text("price_currency").notNull().default("ZMW"),
  priceUnit: text("price_unit"), // per kg, per ton, per unit, etc.
  quantity: decimal("quantity", { precision: 10, scale: 2 }),
  quantityUnit: text("quantity_unit"), // kg, ton, unit, etc.
  condition: text("condition"), // new, used, etc.
  locationId: integer("location_id").references(() => locations.id),
  contactPhone: text("contact_phone"),
  // Note: We're removing availableFrom and availableUntil because they don't exist in the database
  // Using expires_at and delivery_available instead
  deliveryAvailable: boolean("delivery_available").default(false),
  isNegotiable: boolean("is_negotiable").default(false),
  isFeatured: boolean("is_featured").default(false),
  expiresAt: timestamp("expires_at"),
  // Removing deliveryRadius and deliveryRadiusUnit as they don't exist in the database
  status: text("status").notNull().default("active"),
  images: text("images").array(), // Array of image URLs or Base64
  views: integer("views").notNull().default(0),
  favoriteCount: integer("favorite_count").notNull().default(0),
  // Remove featured and verified flags as they don't exist in the database
  tags: text("tags").array(),
  // CropTrace fields to link marketplace listings to crops for traceability
  sourceCropId: integer("source_crop_id").references(() => crops.id), // Link to the source crop
  traceabilityQrCode: text("traceability_qr_code"), // QR code for public tracing
  certifications: text("certifications").array(), // Any certifications (organic, fair trade, etc.)
  blockchainVerified: boolean("blockchain_verified").default(false), // Whether this listing has been verified on blockchain
  traceabilityBatchId: text("traceability_batch_id"), // For linking multiple products from same batch

  // Enhanced Blockchain and Traceability
  blockchainId: text("blockchain_id"), // Unique blockchain identifier
  blockchainTxHash: text("blockchain_tx_hash"), // Blockchain transaction hash
  blockchainVerifiedAt: timestamp("blockchain_verified_at"), // When blockchain verification was completed

  // Greenupp Platform Verification
  greenuppVerified: boolean("greenupp_verified").default(false), // Platform verification status
  greenuppVerifiedAt: timestamp("greenupp_verified_at"), // When platform verification was completed
  greenuppVerificationLevel: text("greenupp_verification_level").default(
    "basic"
  ), // basic, premium, certified

  // Farm Details
  farmName: text("farm_name"), // Name of the farm
  farmLocation: text("farm_location"), // Location of the farm
  farmSize: text("farm_size"), // Size of the farm
  farmType: text("farm_type"), // Type of farm (organic, conventional, etc.)
  farmEstablishedYear: integer("farm_established_year"), // Year farm was established
  farmCertifications: text("farm_certifications").array(), // Array of farm certifications
  farmComplianceStatus: text("farm_compliance_status").default("pending"), // pending, compliant, non_compliant
  farmAuditDate: timestamp("farm_audit_date"), // Last audit date

  // Quality Assurance
  qualityScore: decimal("quality_score", { precision: 3, scale: 2 }), // 0.00 to 5.00 quality rating
  qualityTested: boolean("quality_tested").default(false), // Whether product has been quality tested
  qualityTestDate: timestamp("quality_test_date"), // When quality test was conducted
  qualityTestResults: jsonb("quality_test_results"), // Detailed test results as JSON

  // Certifications and Compliance
  organicCertified: boolean("organic_certified").default(false), // Organic certification
  organicCertificationId: text("organic_certification_id"), // Organic certification ID
  fairTradeCertified: boolean("fair_trade_certified").default(false), // Fair trade certification
  fairTradeCertificationId: text("fair_trade_certification_id"), // Fair trade certification ID

  // Sustainability Metrics
  sustainabilityScore: decimal("sustainability_score", {
    precision: 3,
    scale: 2,
  }), // 0.00 to 5.00 sustainability rating
  carbonFootprint: decimal("carbon_footprint", { precision: 10, scale: 2 }), // CO2 equivalent in kg
  waterUsage: decimal("water_usage", { precision: 10, scale: 2 }), // Water usage in liters

  // Product Attributes
  pesticideFree: boolean("pesticide_free").default(false), // Pesticide free
  gmoFree: boolean("gmo_free").default(false), // GMO free
  localSourced: boolean("local_sourced").default(false), // Locally sourced

  // Product Lifecycle
  harvestDate: date("harvest_date"), // Harvest date
  expiryDate: date("expiry_date"), // Expiry date
  storageConditions: text("storage_conditions"), // Storage conditions
  transportMethod: text("transport_method"), // Transport method
  packagingType: text("packaging_type"), // Packaging type
  packagingMaterial: text("packaging_material"), // Packaging material
  packagingRecyclable: boolean("packaging_recyclable").default(false), // Recyclable packaging

  // Seller Trust Metrics
  sellerRating: decimal("seller_rating", { precision: 3, scale: 2 }), // Average seller rating
  sellerReviewCount: integer("seller_review_count").default(0), // Number of seller reviews
  sellerVerified: boolean("seller_verified").default(false), // Seller verification status
  sellerVerifiedAt: timestamp("seller_verified_at"), // When seller was verified

  // Overall Trust and Transparency
  trustScore: decimal("trust_score", { precision: 3, scale: 2 }), // Overall trust score 0.00 to 5.00
  transparencyLevel: text("transparency_level").default("basic"), // basic, enhanced, premium

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Marketplace reviews
export const marketplaceReviews = pgTable("marketplace_reviews", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => marketplaceListings.id),
  sellerId: integer("seller_id")
    .notNull()
    .references(() => users.id),
  reviewerId: integer("reviewer_id")
    .notNull()
    .references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  review: text("review"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Marketplace favorites/saved listings
export const marketplaceFavorites = pgTable("marketplace_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  listingId: integer("listing_id")
    .notNull()
    .references(() => marketplaceListings.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Marketplace messages/inquiries
export const marketplaceMessages = pgTable("marketplace_messages", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id").references(() => marketplaceListings.id),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id),
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

export const insertMarketplaceListingSchema = createInsertSchema(
  marketplaceListings
)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    views: true,
    favoriteCount: true,
  })
  .extend({
    // Allow 'true'/'false' strings to be parsed as booleans
    isNegotiable: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    isFeatured: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    deliveryAvailable: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    // Convert sourceCropId from string to number
    sourceCropId: z
      .union([z.number(), z.string().transform((val) => parseInt(val, 10))])
      .optional(),
    // Handle boolean fields for trust features
    blockchainVerified: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    greenuppVerified: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    qualityTested: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    organicCertified: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    fairTradeCertified: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    pesticideFree: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    gmoFree: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    localSourced: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    packagingRecyclable: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    sellerVerified: z
      .union([z.boolean(), z.string().transform((val) => val === "true")])
      .optional(),
    // Handle numeric fields - with NaN validation
    farmEstablishedYear: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseInt(val, 10);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    sellerReviewCount: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseInt(val, 10);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    // Handle decimal fields - with NaN validation
    qualityScore: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    sustainabilityScore: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    carbonFootprint: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    waterUsage: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    sellerRating: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    trustScore: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional()
      .nullable(),
    // Also handle price and quantity with NaN validation
    price: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional(),
    quantity: z
      .union([
        z.number(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null")
            return undefined;
          const num = parseFloat(val);
          return isNaN(num) ? undefined : num;
        }),
      ])
      .optional(),
    // Handle date fields - with proper validation to avoid Invalid Date
    harvestDate: z
      .union([
        z.date(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null") {
            return undefined;
          }
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      ])
      .optional()
      .nullable(),
    expiryDate: z
      .union([
        z.date(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null") {
            return undefined;
          }
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      ])
      .optional()
      .nullable(),
    blockchainVerifiedAt: z
      .union([
        z.date(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null") {
            return undefined;
          }
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      ])
      .optional()
      .nullable(),
    greenuppVerifiedAt: z
      .union([
        z.date(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null") {
            return undefined;
          }
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      ])
      .optional()
      .nullable(),
    qualityTestDate: z
      .union([
        z.date(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null") {
            return undefined;
          }
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      ])
      .optional()
      .nullable(),
    farmAuditDate: z
      .union([
        z.date(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null") {
            return undefined;
          }
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      ])
      .optional()
      .nullable(),
    sellerVerifiedAt: z
      .union([
        z.date(),
        z.string().transform((val) => {
          if (!val || val === "" || val === "undefined" || val === "null") {
            return undefined;
          }
          const date = new Date(val);
          return isNaN(date.getTime()) ? undefined : date;
        }),
      ])
      .optional()
      .nullable(),
  });

export const insertMarketplaceReviewSchema = createInsertSchema(
  marketplaceReviews
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMarketplaceFavoriteSchema = createInsertSchema(
  marketplaceFavorites
).omit({
  id: true,
  createdAt: true,
});

export const insertMarketplaceMessageSchema = createInsertSchema(
  marketplaceMessages
).omit({
  id: true,
  createdAt: true,
  read: true,
});

// CropTrace schemas
export const insertCropTraceEventSchema = createInsertSchema(
  cropTraceEvents
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  blockchainTxId: true, // These will be generated by the blockchain service
  blockchainTxHash: true, // These will be generated by the blockchain service
});

// Export marketplace types
export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertMarketplaceListing = z.infer<
  typeof insertMarketplaceListingSchema
>;
export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceReview = z.infer<
  typeof insertMarketplaceReviewSchema
>;
export type MarketplaceReview = typeof marketplaceReviews.$inferSelect;
export type InsertMarketplaceFavorite = z.infer<
  typeof insertMarketplaceFavoriteSchema
>;
export type MarketplaceFavorite = typeof marketplaceFavorites.$inferSelect;
export type InsertMarketplaceMessage = z.infer<
  typeof insertMarketplaceMessageSchema
>;
export type MarketplaceMessage = typeof marketplaceMessages.$inferSelect;

// CropTrace types
export type InsertCropTraceEvent = z.infer<typeof insertCropTraceEventSchema>;
export type CropTraceEvent = typeof cropTraceEvents.$inferSelect;

// QR Scan Events table for analytics
export const qrScanEvents = pgTable("qr_scan_events", {
  id: serial("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  cropId: integer("crop_id").references(() => crops.id, {
    onDelete: "cascade",
  }),
  scannedAt: timestamp("scanned_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  locationLat: real("location_lat"),
  locationLon: real("location_lon"),
  locationCity: text("location_city"),
  locationCountry: text("location_country"),
  referrer: text("referrer"),
  scanSource: text("scan_source").default("web"), // 'web', 'mobile', 'app'
  verificationResult: boolean("verification_result").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type QRScanEvent = typeof qrScanEvents.$inferSelect;
export type InsertQRScanEvent = typeof qrScanEvents.$inferInsert;

// Cart schemas
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"), // active, checkout, completed, abandoned
  // Store totals for quick reference and to preserve prices if listing prices change later
  subtotal: decimal("subtotal", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  shipping: decimal("shipping", { precision: 10, scale: 2 }).default("0"),
  tax: decimal("tax", { precision: 10, scale: 2 }).default("0"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0"),
  // Payment related fields
  paymentProvider: text("payment_provider"), // stripe, metatron, etc.
  paymentIntentId: text("payment_intent_id"), // ID from payment provider
  paymentStatus: text("payment_status"), // pending, succeeded, failed
  paymentDate: timestamp("payment_date"),
});

// Cart items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id")
    .notNull()
    .references(() => carts.id),
  listingId: integer("listing_id")
    .notNull()
    .references(() => marketplaceListings.id),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Price at time of adding to cart
  priceUnit: text("price_unit"), // The unit (per kg, per bag, etc.)
  notes: text("notes"), // Any special requests/notes for this item
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create schemas for cart
export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  subtotal: true,
  shipping: true,
  tax: true,
  total: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    cartId: true, // Server will handle this
    price: true, // Server will get this from the listing
    priceUnit: true, // Server will get this from the listing
  })
  .required({
    listingId: true,
  })
  .partial();

// Export cart types
export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof carts.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").$type<Record<string, any>>(), // Additional data specific to notification type
  status: text("status").notNull().default("unread"),
  actionUrl: text("action_url"), // Optional URL user can navigate to
  expiresAt: timestamp("expires_at"), // When this notification should expire/auto-archive
  sentViaEmail: boolean("sent_via_email").default(false), // Tracking if email was sent
  emailSentAt: timestamp("email_sent_at"), // When the email was sent
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Notification settings
export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  emailEnabled: boolean("email_enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  weatherAlerts: boolean("weather_alerts").default(true),
  taskReminders: boolean("task_reminders").default(true),
  marketPriceAlerts: boolean("market_price_alerts").default(false),
  systemNotifications: boolean("system_notifications").default(true),
  messageNotifications: boolean("message_notifications").default(true),
  // Social notifications
  socialLikes: boolean("social_likes").default(true),
  socialComments: boolean("social_comments").default(true),
  socialFollows: boolean("social_follows").default(true),
  socialMentions: boolean("social_mentions").default(true),
  socialSaves: boolean("social_saves").default(true),
  // Email settings
  emailFrequency: text("email_frequency").default("instant"), // instant, daily, weekly
  emailDigestDay: integer("email_digest_day"), // day of week for weekly digests (0-6)
  emailDigestTime: integer("email_digest_time"), // hour of day for digests (0-23)
  smsEnabled: boolean("sms_enabled").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Create notification schemas
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  status: true,
  sentViaEmail: true,
  emailSentAt: true,
  createdAt: true,
  updatedAt: true,
});

export const insertNotificationSettingsSchema = createInsertSchema(
  notificationSettings
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notification types
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotificationSettings = z.infer<
  typeof insertNotificationSettingsSchema
>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;

// Chat related enums
export const chatMessageStatusEnum = pgEnum("chat_message_status", [
  "sent",
  "delivered",
  "read",
]);
export const chatRoomTypeEnum = pgEnum("chat_room_type", ["direct", "group"]);

// Chat rooms table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name"),
  type: chatRoomTypeEnum("type").notNull().default("direct"),
  createdById: integer("created_by_id")
    .notNull()
    .references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// Chat room members junction table
export const chatRoomMembers = pgTable("chat_room_members", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => chatRooms.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
  isAdmin: boolean("is_admin").notNull().default(false),
  nickname: text("nickname"),
  isMuted: boolean("is_muted").notNull().default(false),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id")
    .notNull()
    .references(() => chatRooms.id),
  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id),
  content: text("content").notNull(),
  status: chatMessageStatusEnum("status").notNull().default("sent"),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  media: jsonb("media"),
  replyToId: integer("reply_to_id"),
  isEdited: boolean("is_edited").notNull().default(false),
  isDeleted: boolean("is_deleted").notNull().default(false),
});

// Create insert schemas
export const insertChatRoomSchema = createInsertSchema(chatRooms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastMessageAt: true,
});

export const insertChatRoomMemberSchema = createInsertSchema(
  chatRoomMembers
).omit({
  id: true,
  joinedAt: true,
  lastReadAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  sentAt: true,
  isEdited: true,
  isDeleted: true,
});

// Chat types
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRooms.$inferSelect;
export type InsertChatRoomMember = z.infer<typeof insertChatRoomMemberSchema>;
export type ChatRoomMember = typeof chatRoomMembers.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// AI Assistant chat messages
export const aiAssistantMessages = pgTable("ai_assistant_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  role: text("role").notNull(), // 'user', 'assistant', or 'system'
  content: text("content").notNull(),
  contextData: jsonb("context_data").$type<Record<string, any>>(), // Store context like crops, soil type, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sessionId: text("session_id").notNull(), // Group messages by conversation session
});

export const insertAiAssistantMessageSchema = createInsertSchema(
  aiAssistantMessages
).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAssistantMessage = z.infer<
  typeof insertAiAssistantMessageSchema
>;
export type AiAssistantMessage = typeof aiAssistantMessages.$inferSelect;

// Order Management Tables
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  sellerId: integer("seller_id")
    .notNull()
    .references(() => users.id),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled, refunded
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("ZMW"),
  shippingAddress: text("shipping_address"),
  billingAddress: text("billing_address"),
  paymentMethod: text("payment_method"), // stripe, metatron_pay, cash_on_delivery
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, paid, failed, refunded
  paymentIntentId: text("payment_intent_id"),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default(
    "0"
  ),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0"),
  notes: text("notes"),
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  listingId: integer("listing_id")
    .notNull()
    .references(() => marketplaceListings.id),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("ZMW"),
  status: text("status").notNull().default("pending"), // pending, confirmed, shipped, delivered, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderStatusHistory = pgTable("order_status_history", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  notes: text("notes"),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Inventory Management
export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  listingId: integer("listing_id")
    .notNull()
    .references(() => marketplaceListings.id, { onDelete: "cascade" }),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  reservedQuantity: decimal("reserved_quantity", {
    precision: 10,
    scale: 2,
  }).default("0"),
  availableQuantity: decimal("available_quantity", {
    precision: 10,
    scale: 2,
  }).notNull(),
  lowStockThreshold: decimal("low_stock_threshold", {
    precision: 10,
    scale: 2,
  }).default("5"),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Create insert schema for inventory
export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

// Inventory types
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

// Merchant Account types
export type MerchantAccount = typeof merchantAccounts.$inferSelect;
export type InsertMerchantAccount = typeof merchantAccounts.$inferInsert;
export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

// Delivery Management
export const deliveries = pgTable("deliveries", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  deliveryMethod: text("delivery_method").notNull(), // pickup, delivery, shipping
  deliveryAddress: text("delivery_address"),
  deliveryInstructions: text("delivery_instructions"),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"), // courier company name
  estimatedDeliveryDate: timestamp("estimated_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  status: text("status").notNull().default("pending"), // pending, in_transit, delivered, failed
  deliveryCost: decimal("delivery_cost", { precision: 10, scale: 2 }).default(
    "0"
  ),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deliveryStatusHistory = pgTable("delivery_status_history", {
  id: serial("id").primaryKey(),
  deliveryId: integer("delivery_id")
    .notNull()
    .references(() => deliveries.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  location: text("location"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Merchant Account Management
export const merchantAccounts = pgTable("merchant_accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("pending"), // pending, approved, rejected, suspended
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(), // individual, business, cooperative
  businessRegistrationNumber: text("business_registration_number"),
  taxId: text("tax_id"),
  contactPhone: text("contact_phone").notNull(),
  contactEmail: text("contact_email").notNull(),
  businessAddress: text("business_address").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumber: text("account_number").notNull(),
  accountHolderName: text("account_holder_name").notNull(),
  branchCode: text("branch_code"),
  mobileMoneyProvider: text("mobile_money_provider"), // mtn, airtel, zamtel
  mobileMoneyNumber: text("mobile_money_number"),
  nationalIdNumber: text("national_id_number").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, verified, rejected
  verificationNotes: text("verification_notes"),
  monthlyEarnings: decimal("monthly_earnings", {
    precision: 10,
    scale: 2,
  }).default("0"),
  totalEarnings: decimal("total_earnings", { precision: 10, scale: 2 }).default(
    "0"
  ),
  pendingPayouts: decimal("pending_payouts", {
    precision: 10,
    scale: 2,
  }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  approvedAt: timestamp("approved_at"),
  approvedBy: integer("approved_by").references(() => users.id),
});

// Payout Management
export const payouts = pgTable("payouts", {
  id: serial("id").primaryKey(),
  merchantAccountId: integer("merchant_account_id")
    .notNull()
    .references(() => merchantAccounts.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("ZMW"),
  method: text("method").notNull(), // bank_transfer, mobile_money
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  transactionId: text("transaction_id"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default(
    "0"
  ),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }).notNull(),
  scheduledDate: timestamp("scheduled_date"),
  processedDate: timestamp("processed_date"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Authentication Tables

// OAuth providers for third-party authentication
export const oauthProviders = pgTable("oauth_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  provider: text("provider").notNull(), // 'google', 'facebook', 'github', etc.
  providerUserId: text("provider_user_id").notNull(), // ID from the OAuth provider
  providerEmail: text("provider_email"),
  providerName: text("provider_name"),
  providerPicture: text("provider_picture"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiresAt: timestamp("token_expires_at"),
  isPrimary: boolean("is_primary").default(false), // Whether this is the primary login method
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Two-factor authentication settings
export const twoFactorAuth = pgTable("two_factor_auth", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  isEnabled: boolean("is_enabled").default(false),
  secret: text("secret"), // TOTP secret key
  backupCodes: text("backup_codes").array(), // Array of backup codes
  lastUsedAt: timestamp("last_used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Device sessions for device management
export const deviceSessions = pgTable("device_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  sessionId: text("session_id").notNull().unique(), // Express session ID
  deviceName: text("device_name"), // User-friendly device name
  deviceType: text("device_type"), // 'desktop', 'mobile', 'tablet'
  browser: text("browser"), // Browser name
  os: text("os"), // Operating system
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  location: text("location"), // Approximate location based on IP
  latitude: decimal("latitude", { precision: 10, scale: 7 }), // Precise latitude coordinates
  longitude: decimal("longitude", { precision: 10, scale: 7 }), // Precise longitude coordinates
  geoPath: text("geo_path"), // Full geographic path (City, State, Country)
  country: text("country"), // Country name
  city: text("city"), // City name
  state: text("state"), // State/province name
  isCurrent: boolean("is_current").default(false), // Whether this is the current session
  isTrusted: boolean("is_trusted").default(false), // Whether user has marked this device as trusted
  lastActiveAt: timestamp("last_active_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Login attempts for security monitoring
export const loginAttempts = pgTable("login_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Can be null for failed attempts
  email: text("email").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  success: boolean("success").notNull(),
  failureReason: text("failure_reason"), // 'invalid_password', 'user_not_found', '2fa_required', etc.
  provider: text("provider"), // 'local', 'google', 'facebook', etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Security events for audit trail
export const securityEvents = pgTable("security_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  eventType: text("event_type").notNull(), // 'password_changed', '2fa_enabled', 'device_added', 'suspicious_login', etc.
  description: text("description").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  metadata: jsonb("metadata").$type<Record<string, any>>(), // Additional event data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Verification tokens for email verification and password reset
export const verificationTokens = pgTable("verification_tokens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // 'email_verification', 'password_reset'
  used: boolean("used").default(false),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// For session storage (express-session with connect-pg-simple)
export const sessions = pgTable("session", {
  sid: varchar("sid", { length: 255 }).primaryKey().notNull(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { withTimezone: true }).notNull(),
});

// Waitlist registrations for testing program
export const waitlistRegistrations = pgTable("waitlist_registrations", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  organization: text("organization"),
  userType: text("user_type").notNull(), // farmer, buyer, supplier, distributor, other
  location: text("location").notNull(),
  farmSize: text("farm_size"),
  primaryCrops: text("primary_crops"),
  experience: text("experience").notNull(), // beginner, intermediate, advanced, expert
  interests: text("interests").array().notNull(), // array of feature interests
  additionalInfo: text("additional_info"),
  agreeToTerms: boolean("agree_to_terms").notNull().default(false),
  subscribeUpdates: boolean("subscribe_updates").notNull().default(true),
  status: text("status").notNull().default("pending"), // pending, invited, accepted, rejected
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  invitedAt: timestamp("invited_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Pest and Disease Management Tables

// Pest/Disease types with risk levels and characteristics
export const pestDiseaseTypes = pgTable("pest_disease_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Fall Armyworm", "Late Blight"
  scientificName: text("scientific_name"), // e.g., "Spodoptera frugiperda"
  category: text("category").notNull(), // pest, disease, fungal, bacterial, viral
  riskLevel: text("risk_level").notNull(), // low, medium, high, critical
  affectedCrops: text("affected_crops").array().notNull(), // crops that can be affected
  symptoms: text("symptoms").array().notNull(), // list of symptoms
  treatmentRecommendations: text("treatment_recommendations").array().notNull(),
  preventionMeasures: text("prevention_measures").array().notNull(),
  imageUrls: text("image_urls").array().default([]), // reference images
  isQuarantinable: boolean("is_quarantinable").default(false), // requires quarantine measures
  spreadRate: text("spread_rate").notNull(), // slow, moderate, fast, very_fast
  economicImpact: text("economic_impact").notNull(), // minimal, moderate, severe, devastating
  seasonality: text("seasonality").array().default([]), // months when most active
  geographicRisk: text("geographic_risk").array().default([]), // regions at higher risk
  alertThreshold: integer("alert_threshold").default(3), // number of cases to trigger alert
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Outbreak tracking for coordinated response
export const pestOutbreaks = pgTable("pest_outbreaks", {
  id: serial("id").primaryKey(),
  pestDiseaseId: integer("pest_disease_id")
    .notNull()
    .references(() => pestDiseaseTypes.id),
  locationArea: text("location_area").notNull(), // general area/region
  severity: text("severity").notNull(), // isolated, localized, widespread, epidemic
  status: text("status").notNull(), // active, contained, resolved, monitoring
  firstReportedAt: timestamp("first_reported_at").notNull(),
  lastUpdatedAt: timestamp("last_updated_at").notNull(),
  affectedFarms: integer("affected_farms").default(0),
  estimatedLosses: decimal("estimated_losses", { precision: 12, scale: 2 }), // economic losses
  containmentMeasures: text("containment_measures").array().default([]),
  adminNotes: text("admin_notes"),
  alertLevel: text("alert_level").notNull(), // watch, advisory, warning, emergency
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Individual pest/disease reports from farmers
export const pestReports = pgTable("pest_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  plantAnalysisId: integer("plant_analysis_id").references(
    () => plantAnalyses.id
  ), // link to plant diagnosis
  pestDiseaseId: integer("pest_disease_id")
    .notNull()
    .references(() => pestDiseaseTypes.id),
  location: text("location").notNull(), // farmer's location
  coordinates: jsonb("coordinates").$type<{ lat: number; lng: number }>(), // GPS coordinates
  severity: text("severity").notNull(), // mild, moderate, severe, critical
  confidence: integer("confidence").notNull(), // AI confidence score 0-100
  affectedArea: decimal("affected_area", { precision: 8, scale: 2 }), // hectares affected
  cropType: text("crop_type").notNull(),
  growthStage: text("growth_stage").notNull(),
  weatherConditions: text("weather_conditions"),
  images: text("images").array().default([]), // uploaded images
  symptoms: text("symptoms").array().default([]), // observed symptoms
  farmerNotes: text("farmer_notes"),
  verifiedByExpert: boolean("verified_by_expert").default(false),
  expertNotes: text("expert_notes"),
  treatmentApplied: text("treatment_applied").array().default([]),
  followUpRequired: boolean("follow_up_required").default(false),
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Risk assessments for predictive alerts
export const riskAssessments = pgTable("risk_assessments", {
  id: serial("id").primaryKey(),
  pestDiseaseId: integer("pest_disease_id")
    .notNull()
    .references(() => pestDiseaseTypes.id),
  location: text("location").notNull(),
  riskScore: integer("risk_score").notNull(), // 0-100
  factors: jsonb("factors")
    .$type<{
      recentReports: number;
      weatherSuitability: number;
      cropVulnerability: number;
      seasonalRisk: number;
      geographicProximity: number;
    }>()
    .notNull(),
  recommendations: text("recommendations").array().notNull(),
  alertTriggered: boolean("alert_triggered").default(false),
  assessmentDate: timestamp("assessment_date").notNull().defaultNow(),
});
