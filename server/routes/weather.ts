import { Router } from "express";
import { WeatherController } from "../controllers/WeatherController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.use(isAuthenticated);

// Weather endpoints
router.get("/", WeatherController.getWeather);
router.get("/historical", WeatherController.getHistoricalWeather);
router.get("/climate", WeatherController.getClimate);
router.get("/reverse-geocode", WeatherController.reverseGeocode);
router.get("/geocode", WeatherController.geocode);
router.get("/crop-recommendations", WeatherController.getCropRecommendations);

// Weather preferences endpoints
router.get("/preferences", WeatherController.getPreferences);
router.post("/preferences", WeatherController.createPreferences);
router.patch("/preferences", WeatherController.updatePreferences);

export default router;
