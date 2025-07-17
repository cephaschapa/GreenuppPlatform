import { Router } from "express";
import { isAuthenticatedWithUser, isFarmer } from "../middleware/auth.js";

const router = Router();

// Apply authentication and farmer role middleware to all crop activity routes
router.use(isAuthenticatedWithUser);
router.use(isFarmer);

// GET /api/crop-activities - Get all crop activities for the authenticated farmer
router.get("/", async (req, res) => {
  try {
    // For now, return empty array since we don't have crop activities implemented yet
    // This will prevent the 404 error and allow the dashboard to load
    res.status(200).json([]);
  } catch (error) {
    console.error("Failed to get crop activities:", error);
    res.status(500).json({
      message: "Failed to retrieve crop activities",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/crops/:cropId/activities - Get activities for a specific crop
router.get("/crops/:cropId/activities", async (req, res) => {
  try {
    const cropId = parseInt(req.params.cropId);
    if (isNaN(cropId)) {
      res.status(400).json({ message: "Invalid crop ID" });
      return;
    }

    // For now, return empty array since we don't have crop activities implemented yet
    // This will prevent the 404 error and allow the dashboard to load
    res.status(200).json([]);
  } catch (error) {
    console.error("Failed to get crop activities:", error);
    res.status(500).json({
      message: "Failed to retrieve crop activities",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
