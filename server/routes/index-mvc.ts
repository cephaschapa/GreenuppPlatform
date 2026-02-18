import { Express } from "express";
import healthRoutes from "./health-mvc.js";
import userRoutes from "./users.js";
import fieldRoutes from "./fields.js";
import cropRoutes from "./crops.js";
import cropActivityRoutes from "./crop-activities.js";
import fieldCropRoutes from "./field-crops.js";
import seedVarietiesRoutes from "./seed-varieties.js";
import cropPlansRoutes from "./crop-plans.js";
import referenceRoutes from "./reference.js";
import taskRoutes from "./tasks.js";
import weatherRoutes from "./weather.js";
import weatherPreferencesRoutes from "./weather-preferences.js";
import plantAnalysesRoutes from "./plant-analyses.js";
import productVerificationRoutes from "./product-verification.js";
import { setupMarketplaceRoutes } from "./marketplace-mvc.js";
import { setupInventoryRoutes } from "./inventory-mvc.js";
import { setupProfileRoutes } from "./profile-mvc.js";
import { setupContactRoutes } from "./contact-mvc.js";
import { setupSettingsRoutes } from "./settings-mvc.js";
import { setupLocationRoutes } from "./location-mvc.js";
import { setupGeocodingRoutes } from "./geocoding-mvc.js";
import { setupTreatmentRoutes } from "./treatment-mvc.js";
import locationDetectionRoutes from "./location-detection.js";
import homeRoutes from "./home.js";
import decisionsRoutes from "./decisions.js";
import eventsRoutes from "./events.js";
import blockchainRoutes from "./blockchain.js";
import adminRoutes from "./admin.js";
import adminAuthRoutes from "./admin-auth.js";
import pushNotificationRoutes from "./push-notifications.js";
import ussdRoutes from "./ussd.js";

/**
 * Register all routes following MVC pattern
 */
export function registerMvcRoutes(app: Express): void {
  // Health check routes
  app.use("/api/health", healthRoutes);

  // User management routes
  app.use("/api/users", userRoutes);

  // Field management routes
  app.use("/api/fields", fieldRoutes);

  // Crop management routes
  app.use("/api/crops", cropRoutes);

  // Crop activities routes
  app.use("/api/crop-activities", cropActivityRoutes);

  // Field-specific crop routes
  app.use("/api/fields/:fieldId/crops", fieldCropRoutes);

  // Seed varieties (with optional recommendation by field)
  app.use("/api/seed-varieties", seedVarietiesRoutes);

  // Crop plans by id (PATCH, GET, simulate-yield)
  app.use("/api/crop-plans", cropPlansRoutes);

  // Reference data for crop planning (crops, seasons)
  app.use("/api/reference", referenceRoutes);

  // Task management routes
  app.use("/api/tasks", taskRoutes);

  // Weather routes (current, historical, climate, geocode, preferences)
  app.use("/api/weather", weatherRoutes);

  // Weather preferences routes (separate endpoint to match client expectations)
  app.use("/api/weather-preferences", weatherPreferencesRoutes);

  // Plant analysis/diagnosis routes
  app.use("/api/plant-analyses", plantAnalysesRoutes);

  // Product verification routes
  app.use("/api/product-verification", productVerificationRoutes);

  // Marketplace routes
  setupMarketplaceRoutes(app);

  // Inventory management routes
  setupInventoryRoutes(app);

  // Profile management routes
  setupProfileRoutes(app);

  // Contact form routes
  setupContactRoutes(app);

  // Settings management routes
  setupSettingsRoutes(app);

  // Location management routes
  setupLocationRoutes(app);

  // Geocoding routes
  setupGeocodingRoutes(app);

  // Location detection routes (accurate global location detection)
  app.use("/api/location", locationDetectionRoutes);

  // Home: weather + decisions for dashboard
  app.use("/api/home", homeRoutes);

  // Decision actions (shown, act, ignore)
  app.use("/api/decisions", decisionsRoutes);

  // Analytics events (batch ingestion for retention/funnel)
  app.use("/api/events", eventsRoutes);

  // Blockchain status and transaction routes
  app.use("/api/blockchain", blockchainRoutes);

  // Treatment plan routes
  setupTreatmentRoutes(app);

  // Admin authentication routes (separate path to avoid middleware conflicts)
  app.use("/api/admin-auth", adminAuthRoutes);

  // Admin routes (protected by admin middleware)
  app.use("/api/admin", adminRoutes);

  // Push notification routes
  app.use("/api/push-notifications", pushNotificationRoutes);

  // USSD routes
  app.use("/api/ussd", ussdRoutes);

  // You can add more route modules here:
  // app.use("/api/products", productRoutes);
  // app.use("/api/orders", orderRoutes);
  // app.use("/api/auth", authRoutes);

  // API documentation route
  app.get("/api", (req, res) => {
    res.json({
      message: "API is running",
      version: "1.0.0",
      endpoints: {
        health: {
          "GET /api/health/test": "Test server response",
          "GET /api/health": "Basic health check",
          "GET /api/health/db": "Database health check",
          "GET /api/health/detailed": "Detailed health check",
        },
        users: {
          "GET /api/users": "Get all users (with pagination)",
          "GET /api/users/:id": "Get user by ID",
          "POST /api/users": "Create new user",
          "PUT /api/users/:id": "Update user",
          "DELETE /api/users/:id": "Delete user",
        },
        fields: {
          "GET /api/fields": "Get all fields for authenticated farmer",
          "GET /api/fields/:id": "Get field by ID",
          "POST /api/fields": "Create new field",
          "PATCH /api/fields/:id": "Update field",
          "DELETE /api/fields/:id": "Delete field",
        },
        crops: {
          "GET /api/crops": "Get all crops for authenticated farmer",
          "GET /api/crops/:id": "Get crop by ID",
          "POST /api/crops": "Create new crop",
          "PATCH /api/crops/:id": "Update crop",
          "DELETE /api/crops/:id": "Delete crop",
        },
        fieldCrops: {
          "GET /api/fields/:fieldId/crops": "Get crops for a specific field",
        },
        tasks: {
          "GET /api/tasks": "Get all tasks for authenticated farmer",
          "GET /api/tasks/:id": "Get task by ID",
          "GET /api/tasks/date/:date": "Get tasks by date",
          "GET /api/tasks/range/:startDate/:endDate": "Get tasks by date range",
          "GET /api/tasks/priority/:priority": "Get tasks by priority",
          "GET /api/tasks/crops/:cropId": "Get tasks by crop ID",
          "GET /api/tasks/fields/:fieldId": "Get tasks by field ID",
          "POST /api/tasks": "Create new task",
          "PATCH /api/tasks/:id": "Update task",
          "POST /api/tasks/:id/complete": "Complete task",
          "DELETE /api/tasks/:id": "Delete task",
        },
        weather: {
          "GET /api/weather": "Get weather data for location",
          "GET /api/weather/historical": "Get historical weather data",
          "GET /api/weather/climate": "Get climate data for location",
          "GET /api/weather/reverse-geocode":
            "Reverse geocoding (coordinates to address)",
          "GET /api/weather/geocode":
            "Forward geocoding (address to coordinates)",
          "GET /api/weather/preferences": "Get weather preferences",
          "POST /api/weather/preferences": "Create weather preferences",
          "PATCH /api/weather/preferences": "Update weather preferences",
          "GET /api/weather-preferences":
            "Get weather preferences (alternative endpoint)",
          "POST /api/weather-preferences":
            "Create weather preferences (alternative endpoint)",
          "PATCH /api/weather-preferences":
            "Update weather preferences (alternative endpoint)",
        },
        plantAnalyses: {
          "GET /api/plant-analyses":
            "Get all plant analyses for authenticated farmer",
          "GET /api/plant-analyses/:id": "Get plant analysis by ID",
          "GET /api/plant-analyses/fields/:fieldId":
            "Get plant analyses by field",
          "GET /api/plant-analyses/crops/:cropId": "Get plant analyses by crop",
          "POST /api/plant-analyses": "Submit plant image for analysis",
          "DELETE /api/plant-analyses/:id": "Delete plant analysis",
        },
        productVerification: {
          "GET /api/product-verification/verify/:batchId":
            "Public verification of batch ID (no auth required)",
          "GET /api/product-verification/internal/verify/:batchId":
            "Internal verification of batch ID (authenticated)",
          "GET /api/product-verification/scannable-products":
            "Get all scannable products for authenticated farmer",
          "GET /api/product-verification/scannable-crops":
            "Get scannable crops for authenticated farmer",
          "GET /api/product-verification/scannable-listings":
            "Get scannable marketplace listings for authenticated farmer",
          "GET /api/product-verification/crops/:cropId/trace/history":
            "Get crop traceability history",
        },
        marketplace: {
          "GET /api/marketplace/listings": "Get all marketplace listings",
          "GET /api/marketplace/listings/:id": "Get marketplace listing by ID",
          "GET /api/marketplace/listings/by-location":
            "Get listings by location",
          "GET /api/marketplace/sellers/:sellerId/listings":
            "Get seller listings",
          "GET /api/marketplace/sellers/:sellerId/stats":
            "Get seller statistics",
          "GET /api/marketplace/reviews": "Get marketplace reviews",
          "GET /api/marketplace/search/suggestions": "Get search suggestions",
          "POST /api/marketplace/listings": "Create new marketplace listing",
          "PUT /api/marketplace/listings/:id": "Update marketplace listing",
          "DELETE /api/marketplace/listings/:id": "Delete marketplace listing",
          "POST /api/marketplace/reviews": "Create marketplace review",
          "PUT /api/marketplace/reviews/:id": "Update marketplace review",
          "DELETE /api/marketplace/reviews/:id": "Delete marketplace review",
          "GET /api/marketplace/favorites": "Get user favorites",
          "POST /api/marketplace/favorites": "Add to favorites",
          "DELETE /api/marketplace/favorites/:id": "Remove from favorites",
          "GET /api/marketplace/messages": "Get marketplace messages",
          "POST /api/marketplace/messages": "Send marketplace message",
          "PUT /api/marketplace/messages/:id": "Update marketplace message",
          "DELETE /api/marketplace/messages/:id": "Delete marketplace message",
          "GET /api/marketplace/messages/unread/count":
            "Get unread message count",
        },
        inventory: {
          "GET /api/inventory": "Get all inventory for authenticated seller",
          "GET /api/inventory/:listingId": "Get inventory for specific listing",
          "PATCH /api/inventory/:listingId": "Update inventory for listing",
          "POST /api/inventory": "Create inventory for listing",
          "GET /api/inventory/low-stock": "Get low stock inventory",
          "GET /api/inventory/stats": "Get inventory statistics",
          "POST /api/inventory/reserve": "Reserve inventory for orders",
          "POST /api/inventory/release": "Release reserved inventory",
        },
        profile: {
          "GET /api/user": "Get user profile",
          "PATCH /api/user": "Update user profile",
          "GET /api/farmer-profile": "Get farmer profile",
          "POST /api/farmer-profile": "Create farmer profile",
          "PATCH /api/farmer-profile": "Update farmer profile",
          "GET /api/profile": "Get user with farmer profile",
        },
        contact: {
          "POST /api/contact": "Submit contact form (public)",
          "GET /api/contact": "Get all contact inquiries (admin)",
          "GET /api/contact/:id": "Get contact inquiry by ID (admin)",
        },
        settings: {
          "GET /api/settings": "Get user settings",
          "PATCH /api/settings": "Update user settings",
        },
        locations: {
          "GET /api/locations": "Get all locations",
          "GET /api/locations/:id": "Get location by ID",
          "GET /api/locations/search/coordinates":
            "Search locations by coordinates",
          "POST /api/locations": "Create location (authenticated)",
          "PATCH /api/locations/:id": "Update location (authenticated)",
          "GET /api/locations/search": "Search locations by text",
          "GET /api/locations/country/:country": "Get locations by country",
          "GET /api/locations/region/:region": "Get locations by region",
        },
        geocoding: {
          "GET /api/geocode/reverse":
            "Reverse geocoding (coordinates to address)",
          "GET /api/geocode/search":
            "Forward geocoding (address to coordinates)",
        },
        treatmentPlans: {
          "POST /api/treatment-plans/generate":
            "Generate treatment plan from analysis",
          "GET /api/treatment-plans": "Get all treatment plans for user",
          "GET /api/treatment-plans/:id": "Get treatment plan by ID",
        },
        pushNotifications: {
          "POST /api/push-notifications/register":
            "Register FCM token for push notifications",
          "DELETE /api/push-notifications/unregister": "Remove FCM token",
          "PATCH /api/push-notifications/preferences":
            "Update push notification preferences",
          "POST /api/push-notifications/subscribe": "Subscribe to topic",
          "POST /api/push-notifications/unsubscribe": "Unsubscribe from topic",
          "POST /api/push-notifications/test": "Send test push notification",
        },
      },
    });
  });
}
