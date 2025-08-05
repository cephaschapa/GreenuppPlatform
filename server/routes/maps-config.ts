import { Router } from "express";
import { isAuthenticated, hasRole } from "../middleware/auth";

const router = Router();

// Get Google Maps configuration (admin only)
router.get("/config", isAuthenticated, hasRole("admin"), async (req, res) => {
  try {
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      return res.status(500).json({
        success: false,
        error: "Google Maps API key not configured",
      });
    }

    res.json({
      success: true,
      apiKey: googleMapsApiKey,
    });
  } catch (error) {
    console.error("Error getting maps config:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get maps configuration",
    });
  }
});

export { router as mapsConfigRouter };
