import { Router } from "express";
import { WeatherController } from "../controllers/WeatherController.js";
import { isAuthenticated } from "../middleware/auth.js";

const router = Router();

router.use(isAuthenticated);

// Weather preferences endpoints only
router.get("/", WeatherController.getPreferences);
router.post("/", WeatherController.createPreferences);
router.patch("/", WeatherController.updatePreferences);

export default router;
