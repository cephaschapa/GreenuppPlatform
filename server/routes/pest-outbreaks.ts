import { Router } from "express";
import { hasRole } from "../middleware/auth.js";
import { PestDiseaseModel } from "../models/PestDiseaseModel.js";
import { sendAdminAlert } from "../services/pest-alert-service.js";
import { logger } from "../lib/logger.js";
import { db } from "../db.js";
import { pestOutbreaks, pestDiseaseTypes, pestReports } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

const router = Router();

// Apply admin role middleware to all routes
router.use(hasRole("admin"));

/**
 * GET /api/admin/pest-outbreaks/stats
 * Get outbreak statistics for dashboard
 */
router.get("/stats", async (req, res) => {
  try {
    const stats = await PestDiseaseModel.getOutbreakStats();
    res.json(stats);
  } catch (error) {
    logger.error("Error fetching outbreak stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch outbreak statistics",
    });
  }
});

/**
 * GET /api/admin/pest-outbreaks
 * Get all active outbreaks with pest information
 */
router.get("/", async (req, res) => {
  try {
    const outbreaks = await PestDiseaseModel.getActiveOutbreaks();
    res.json(outbreaks);
  } catch (error) {
    logger.error("Error fetching active outbreaks:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch active outbreaks",
    });
  }
});

/**
 * GET /api/admin/pest-outbreaks/:id
 * Get specific outbreak details
 */
router.get("/:id", async (req, res) => {
  try {
    const outbreakId = parseInt(req.params.id);

    if (isNaN(outbreakId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid outbreak ID",
      });
    }

    const [outbreak] = await db
      .select({
        outbreak: pestOutbreaks,
        pestInfo: pestDiseaseTypes,
      })
      .from(pestOutbreaks)
      .innerJoin(
        pestDiseaseTypes,
        eq(pestOutbreaks.pestDiseaseId, pestDiseaseTypes.id)
      )
      .where(eq(pestOutbreaks.id, outbreakId));

    if (!outbreak) {
      return res.status(404).json({
        success: false,
        error: "Outbreak not found",
      });
    }

    res.json(outbreak);
  } catch (error) {
    logger.error("Error fetching outbreak details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch outbreak details",
    });
  }
});

/**
 * PUT /api/admin/pest-outbreaks/:id
 * Update outbreak status and management information
 */
router.put("/:id", async (req, res) => {
  try {
    const outbreakId = parseInt(req.params.id);
    const { status, adminNotes, containmentMeasures } = req.body;

    if (isNaN(outbreakId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid outbreak ID",
      });
    }

    // Validate status
    const validStatuses = ["active", "contained", "resolved", "monitoring"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status",
      });
    }

    // Update outbreak
    const [updatedOutbreak] = await db
      .update(pestOutbreaks)
      .set({
        status: status || undefined,
        adminNotes: adminNotes || undefined,
        containmentMeasures: containmentMeasures || undefined,
        lastUpdatedAt: new Date(),
      })
      .where(eq(pestOutbreaks.id, outbreakId))
      .returning();

    if (!updatedOutbreak) {
      return res.status(404).json({
        success: false,
        error: "Outbreak not found",
      });
    }

    logger.info(
      `Outbreak ${outbreakId} updated by admin ${req.user?.id}: status=${status}`
    );

    res.json({
      success: true,
      message: "Outbreak updated successfully",
      outbreak: updatedOutbreak,
    });
  } catch (error) {
    logger.error("Error updating outbreak:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update outbreak",
    });
  }
});

/**
 * POST /api/admin/pest-outbreaks/:id/alert
 * Send emergency alert for specific outbreak
 */
router.post("/:id/alert", async (req, res) => {
  try {
    const outbreakId = parseInt(req.params.id);

    if (isNaN(outbreakId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid outbreak ID",
      });
    }

    // Get outbreak details
    const [outbreakData] = await db
      .select({
        outbreak: pestOutbreaks,
        pestInfo: pestDiseaseTypes,
      })
      .from(pestOutbreaks)
      .innerJoin(
        pestDiseaseTypes,
        eq(pestOutbreaks.pestDiseaseId, pestDiseaseTypes.id)
      )
      .where(eq(pestOutbreaks.id, outbreakId));

    if (!outbreakData) {
      return res.status(404).json({
        success: false,
        error: "Outbreak not found",
      });
    }

    // Create mock alert data (in real implementation, you'd get recent reports)
    const alertData = {
      type: "pest_outbreak" as const,
      pestInfo: outbreakData.pestInfo,
      outbreak: outbreakData.outbreak,
      triggerReport: {
        id: 0,
        userId: 0,
        pestDiseaseId: outbreakData.pestInfo.id,
        location: outbreakData.outbreak.locationArea,
        severity: "critical" as const,
        confidence: 95,
        cropType: outbreakData.pestInfo.affectedCrops[0] || "unknown",
        growthStage: "unknown",
        images: [],
        symptoms: outbreakData.pestInfo.symptoms,
        verifiedByExpert: true,
        treatmentApplied: [],
        followUpRequired: true,
        reportedAt: outbreakData.outbreak.firstReportedAt,
        updatedAt: new Date(),
        plantAnalysisId: null,
        coordinates: null,
        affectedArea: null,
        weatherConditions: null,
        farmerNotes: null,
        expertNotes: null,
      },
      recentReports: [], // In real implementation, fetch recent reports
      severity: outbreakData.outbreak.alertLevel,
    };

    // Send alert using the pest alert service
    await sendAdminAlert(alertData);

    logger.info(
      `Emergency alert sent for outbreak ${outbreakId} by admin ${req.user?.id}`
    );

    res.json({
      success: true,
      message: "Emergency alert sent successfully",
    });
  } catch (error) {
    logger.error("Error sending outbreak alert:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send outbreak alert",
    });
  }
});

/**
 * GET /api/admin/pest-outbreaks/reports/:outbreakId
 * Get all reports related to a specific outbreak
 */
router.get("/reports/:outbreakId", async (req, res) => {
  try {
    const outbreakId = parseInt(req.params.outbreakId);

    if (isNaN(outbreakId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid outbreak ID",
      });
    }

    // Get outbreak info first
    const [outbreak] = await db
      .select()
      .from(pestOutbreaks)
      .where(eq(pestOutbreaks.id, outbreakId));

    if (!outbreak) {
      return res.status(404).json({
        success: false,
        error: "Outbreak not found",
      });
    }

    // Get recent reports for this pest/disease in the same location
    const reports = await db
      .select()
      .from(pestReports)
      .where(
        and(
          eq(pestReports.pestDiseaseId, outbreak.pestDiseaseId),
          eq(pestReports.location, outbreak.locationArea)
        )
      )
      .orderBy(desc(pestReports.reportedAt));

    res.json({
      success: true,
      reports,
      outbreak,
    });
  } catch (error) {
    logger.error("Error fetching outbreak reports:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch outbreak reports",
    });
  }
});

/**
 * POST /api/admin/pest-outbreaks/resolve/:id
 * Mark outbreak as resolved
 */
router.post("/resolve/:id", async (req, res) => {
  try {
    const outbreakId = parseInt(req.params.id);
    const { resolutionNotes } = req.body;

    if (isNaN(outbreakId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid outbreak ID",
      });
    }

    // Update outbreak to resolved status
    const [updatedOutbreak] = await db
      .update(pestOutbreaks)
      .set({
        status: "resolved",
        adminNotes: resolutionNotes || "Outbreak resolved by admin",
        lastUpdatedAt: new Date(),
      })
      .where(eq(pestOutbreaks.id, outbreakId))
      .returning();

    if (!updatedOutbreak) {
      return res.status(404).json({
        success: false,
        error: "Outbreak not found",
      });
    }

    logger.info(`Outbreak ${outbreakId} resolved by admin ${req.user?.id}`);

    // TODO: Send resolution notification to affected farmers

    res.json({
      success: true,
      message: "Outbreak marked as resolved",
      outbreak: updatedOutbreak,
    });
  } catch (error) {
    logger.error("Error resolving outbreak:", error);
    res.status(500).json({
      success: false,
      error: "Failed to resolve outbreak",
    });
  }
});

export default router;
