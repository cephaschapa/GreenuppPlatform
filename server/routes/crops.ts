import { Router } from "express";
import { CropController } from "../controllers/CropController.js";
import { isAuthenticatedWithUser, isFarmer } from "../middleware/auth.js";

const router = Router();

// Apply authentication and farmer role middleware to all crop routes
router.use(isAuthenticatedWithUser);
router.use(isFarmer);

// GET /api/crops - Get all crops for the authenticated farmer
router.get("/", CropController.index);

// GET /api/crops/:id - Get a specific crop by ID
router.get("/:id", CropController.show);

// POST /api/crops - Create a new crop
router.post("/", CropController.create);

// PATCH /api/crops/:id - Update a crop
router.patch("/:id", CropController.update);

// DELETE /api/crops/:id - Delete a crop
router.delete("/:id", CropController.delete);

export default router;
