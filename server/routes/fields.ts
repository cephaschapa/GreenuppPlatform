import { Router } from "express";
import { FieldController } from "../controllers/FieldController.js";
import { isAuthenticatedWithUser, isFarmer } from "../middleware/auth.js";

const router = Router();

// Apply authentication and farmer role middleware to all field routes
router.use(isAuthenticatedWithUser);
router.use(isFarmer);

// GET /api/fields - Get all fields for the authenticated farmer
router.get("/", FieldController.index);

// GET /api/fields/:id - Get a specific field by ID
router.get("/:id", FieldController.show);

// POST /api/fields - Create a new field
router.post("/", FieldController.create);

// PATCH /api/fields/:id - Update a field
router.patch("/:id", FieldController.update);

// DELETE /api/fields/:id - Delete a field
router.delete("/:id", FieldController.delete);

export default router;
