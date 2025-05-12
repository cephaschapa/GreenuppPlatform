import { pgTable, text, serial, integer, boolean, timestamp, jsonb, pgEnum, date, decimal, primaryKey } from "drizzle-orm/pg-core";
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

// Crop management table with traceability fields
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  variety: text("variety"),
  status: text("status").notNull().default('planning'),
  fieldId: integer("field_id").references(() => fields.id),
  fieldSize: text("field_size"), // Area under this specific crop
  sizeUnit: text("size_unit").default('hectares'), // Unit for the field size
  plantingDate: date("planting_date"),
  expectedHarvestDate: date("expected_harvest_date"),
  actualHarvestDate: date("actual_harvest_date"),
  expectedYield: decimal("expected_yield", { precision: 10, scale: 2 }),
  actualYield: decimal("actual_yield", { precision: 10, scale: 2 }),
  yieldUnit: text("yield_unit").default('kg'),
  notes: text("notes"),
  // CropTrace fields
  batchId: text("batch_id"), // Unique identifier for this crop batch
  seedSource: text("seed_source"), // Origin of the seeds
  seedVariety: text("seed_variety"), // Specific variety from the seed provider
  organicCertified: boolean("organic_certified").default(false),
  certificationId: text("certification_id"), // Reference to certification if any
  blockchainTxId: text("blockchain_tx_id"), // Blockchain transaction ID
  traceabilityQrCode: text("traceability_qr_code"), // QR code for public tracking
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

// Note: CropTrace events table is defined below in the marketplace section

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
// Notification types enum
export const notificationTypeEnum = pgEnum('notification_type', [
  'weather_alert',
  'task_reminder',
  'market_price_alert',
  'system_notification',
  'message',
  'crop_update'
]);

// Notification status enum
export const notificationStatusEnum = pgEnum('notification_status', [
  'unread',
  'read',
  'archived'
]);

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
  // H3 geospatial indexes at different resolutions for efficient geo queries
  h3Index8: text("h3_index_8"), // Resolution 8 (~ 5km² hexagons)
  h3Index9: text("h3_index_9"), // Resolution 9 (~ 0.6km² hexagons)
  h3Index10: text("h3_index_10"), // Resolution 10 (~ 0.075km² hexagons)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Marketplace listings table
// Crop trace events table for blockchain traceability
export const cropTraceEvents = pgTable("crop_trace_events", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").notNull().references(() => crops.id),
  eventType: text("event_type").notNull(), // planting, fertilizing, harvesting, processing, packaging, shipping, etc.
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull().defaultNow(),
  performedBy: integer("performed_by").notNull().references(() => users.id),
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
  // Note: We're removing availableFrom and availableUntil because they don't exist in the database
  // Using expires_at and delivery_available instead
  deliveryAvailable: boolean("delivery_available").default(false),
  isNegotiable: boolean("is_negotiable").default(false),
  isFeatured: boolean("is_featured").default(false),
  expiresAt: timestamp("expires_at"),
  // Removing deliveryRadius and deliveryRadiusUnit as they don't exist in the database
  status: text("status").notNull().default('active'),
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

export const insertMarketplaceListingSchema = createInsertSchema(marketplaceListings)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    views: true,
    favoriteCount: true,
  })
  .extend({
    // Allow 'true'/'false' strings to be parsed as booleans
    isNegotiable: z.union([
      z.boolean(),
      z.string().transform(val => val === 'true')
    ]).optional(),
    isFeatured: z.union([
      z.boolean(),
      z.string().transform(val => val === 'true')
    ]).optional(),
    deliveryAvailable: z.union([
      z.boolean(),
      z.string().transform(val => val === 'true')
    ]).optional(),
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

// CropTrace schemas
export const insertCropTraceEventSchema = createInsertSchema(cropTraceEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  blockchainTxId: true, // These will be generated by the blockchain service
  blockchainTxHash: true, // These will be generated by the blockchain service
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

// CropTrace types
export type InsertCropTraceEvent = z.infer<typeof insertCropTraceEventSchema>;
export type CropTraceEvent = typeof cropTraceEvents.$inferSelect;

// Cart schemas
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  status: text("status").notNull().default("active"), // active, checkout, completed, abandoned
  // Store totals for quick reference and to preserve prices if listing prices change later
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull().default("0"),
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
  cartId: integer("cart_id").notNull().references(() => carts.id),
  listingId: integer("listing_id").notNull().references(() => marketplaceListings.id),
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
    price: true,  // Server will get this from the listing
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
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").$type<Record<string, any>>(), // Additional data specific to notification type
  status: text("status").notNull().default('unread'),
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
  userId: integer("user_id").notNull().references(() => users.id),
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
  emailFrequency: text("email_frequency").default('instant'), // instant, daily, weekly
  emailDigestDay: integer("email_digest_day"), // day of week for weekly digests (0-6)
  emailDigestTime: integer("email_digest_time"), // hour of day for digests (0-23)
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

export const insertNotificationSettingsSchema = createInsertSchema(notificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Notification types
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotificationSettings = z.infer<typeof insertNotificationSettingsSchema>;
export type NotificationSettings = typeof notificationSettings.$inferSelect;

// Chat related enums
export const chatMessageStatusEnum = pgEnum('chat_message_status', ['sent', 'delivered', 'read']);
export const chatRoomTypeEnum = pgEnum('chat_room_type', ['direct', 'group']);

// Chat rooms table
export const chatRooms = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  name: text("name"),
  type: chatRoomTypeEnum("type").notNull().default('direct'),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  lastMessageAt: timestamp("last_message_at").notNull().defaultNow(),
  isActive: boolean("is_active").notNull().default(true),
});

// Chat room members junction table
export const chatRoomMembers = pgTable("chat_room_members", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  userId: integer("user_id").notNull().references(() => users.id),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
  lastReadAt: timestamp("last_read_at").notNull().defaultNow(),
  isAdmin: boolean("is_admin").notNull().default(false),
  nickname: text("nickname"),
  isMuted: boolean("is_muted").notNull().default(false),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => chatRooms.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  status: chatMessageStatusEnum("status").notNull().default('sent'),
  sentAt: timestamp("sent_at").notNull().defaultNow(),
  media: jsonb("media"),
  replyToId: integer("reply_to_id").references(() => chatMessages.id),
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

export const insertChatRoomMemberSchema = createInsertSchema(chatRoomMembers).omit({
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
  userId: integer("user_id").notNull().references(() => users.id),
  role: text("role").notNull(), // 'user', 'assistant', or 'system'
  content: text("content").notNull(),
  contextData: jsonb("context_data").$type<Record<string, any>>(), // Store context like crops, soil type, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  sessionId: text("session_id").notNull(), // Group messages by conversation session
});

export const insertAiAssistantMessageSchema = createInsertSchema(aiAssistantMessages).omit({
  id: true,
  createdAt: true,
});

export type InsertAiAssistantMessage = z.infer<typeof insertAiAssistantMessageSchema>;
export type AiAssistantMessage = typeof aiAssistantMessages.$inferSelect;
