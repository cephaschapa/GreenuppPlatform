import type { Express } from "express";
import { LocationController } from "../controllers/LocationController";
import { isAuthenticated } from "../middleware/auth";

export function setupLocationRoutes(app: Express) {
  const controller = new LocationController();

  // Get all locations
  app.get("/api/locations", controller.getAllLocations.bind(controller));

  // Get location by ID
  app.get("/api/locations/:id", controller.getLocation.bind(controller));

  // Search locations by coordinates
  app.get(
    "/api/locations/search/coordinates",
    controller.searchLocationsByCoordinates.bind(controller)
  );

  // Create location (authenticated users only)
  app.post(
    "/api/locations",
    isAuthenticated,
    controller.createLocation.bind(controller)
  );

  // Update location (authenticated users only)
  app.patch(
    "/api/locations/:id",
    isAuthenticated,
    controller.updateLocation.bind(controller)
  );

  // Search locations by text
  app.get("/api/locations/search", controller.searchLocations.bind(controller));

  // Get locations by country
  app.get(
    "/api/locations/country/:country",
    controller.getLocationsByCountry.bind(controller)
  );

  // Get locations by region
  app.get(
    "/api/locations/region/:region",
    controller.getLocationsByRegion.bind(controller)
  );
}
