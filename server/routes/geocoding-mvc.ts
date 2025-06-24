import type { Express } from "express";
import { GeocodingController } from "../controllers/GeocodingController";

export function setupGeocodingRoutes(app: Express) {
  const controller = new GeocodingController();

  // Reverse geocoding (coordinates to address)
  app.get("/api/geocode/reverse", controller.reverseGeocode.bind(controller));

  // Forward geocoding (address to coordinates)
  app.get("/api/geocode/search", controller.forwardGeocode.bind(controller));
}
