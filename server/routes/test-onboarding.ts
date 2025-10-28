import { Router } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { storage } from "../storage.js";
import { logger } from "../lib/logger.js";

const router = Router();

// Test endpoint to check farmer profile status (development/testing only)
router.get("/check-farmer-profile", isAuthenticated, async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message: "This endpoint is only available in development",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    const farmerProfile = await storage.getFarmerProfile(userId);
    const onboardingProgress = await storage.getUserOnboardingProgress(userId);

    res.json({
      userId,
      user: {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        onboardingCompleted: user?.onboardingCompleted,
        onboardingCompletedAt: user?.onboardingCompletedAt,
      },
      farmerProfile: farmerProfile || null,
      onboardingProgress: onboardingProgress || null,
    });
  } catch (error) {
    logger.error("Error checking farmer profile status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Test endpoint to reset user's onboarding status (development/testing only)
router.post("/reset-onboarding", isAuthenticated, async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({
        message: "This endpoint is only available in development",
      });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Reset onboarding status
    await storage.updateUser(userId, {
      onboardingCompleted: false,
      onboardingCompletedAt: null,
    });

    // Clear any existing onboarding progress
    await storage.clearUserOnboardingProgress(userId);

    logger.info(`Reset onboarding status for user ${userId}`);

    res.json({
      success: true,
      message: "Onboarding status reset successfully",
      userId,
    });
  } catch (error) {
    logger.error("Error resetting onboarding status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Test endpoint to check current user's onboarding status (development/testing only)
router.get("/check-onboarding", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(userId);
    const progress = await storage.getUserOnboardingProgress(userId);

    res.json({
      userId,
      user: {
        id: user?.id,
        email: user?.email,
        role: user?.role,
        onboardingCompleted: user?.onboardingCompleted,
        onboardingCompletedAt: user?.onboardingCompletedAt,
      },
      progress: progress || null,
    });
  } catch (error) {
    logger.error("Error checking onboarding status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
