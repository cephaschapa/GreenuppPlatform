import { Router } from "express";
import { CropController } from "../controllers/CropController.js";
import { isAuthenticatedWithUser, isFarmer } from "../middleware/auth.js";

const router = Router();

// Apply authentication and farmer role middleware to all field-crop routes
router.use(isAuthenticatedWithUser);
router.use(isFarmer);

// GET /api/fields/:fieldId/crops - Get crops for a specific field
router.get("/", CropController.getByField);

export default router;
