import { Router } from "express";
import { PlantAnalysisController } from "../controllers/PlantAnalysisController.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";

const router = Router();

// List all analyses for user
router.get(
  "/",
  isAuthenticated,
  hasRole("farmer"),
  PlantAnalysisController.list
);
// Get a specific analysis
router.get(
  "/:id",
  isAuthenticated,
  hasRole("farmer"),
  PlantAnalysisController.get
);
// Get analyses by field
router.get(
  "/fields/:fieldId",
  isAuthenticated,
  hasRole("farmer"),
  PlantAnalysisController.byField
);
// Get analyses by crop
router.get(
  "/crops/:cropId",
  isAuthenticated,
  hasRole("farmer"),
  PlantAnalysisController.byCrop
);
// Create a new analysis
router.post(
  "/",
  isAuthenticated,
  hasRole("farmer"),
  PlantAnalysisController.create
);
// Delete an analysis
router.delete(
  "/:id",
  isAuthenticated,
  hasRole("farmer"),
  PlantAnalysisController.delete
);

export default router;
