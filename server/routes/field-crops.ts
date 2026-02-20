import { Router } from "express";
import { db } from "../db";
import { crops, fields, cropActivities, cropObservations } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { CropController } from "../controllers/CropController.js";
import { isAuthenticatedWithUser, isFarmer } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

// Apply authentication and farmer role middleware to all field-crop routes
router.use(isAuthenticatedWithUser);
router.use(isFarmer);

// GET /api/fields/:fieldId/crops - Get crops for a specific field
router.get("/", CropController.getByField);

/** DELETE /api/fields/:fieldId/crops/:id — delete a crop (must belong to this field and to the authenticated user) */
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user?.id;
    const params = req.params as { fieldId?: string; id?: string };
    const fieldId = parseInt(params.fieldId ?? "", 10);
    const cropId = parseInt(params.id ?? "", 10);

    if (!userId) return res.status(401).json({ error: "User not authenticated" });
    if (Number.isNaN(fieldId) || Number.isNaN(cropId)) return res.status(400).json({ error: "Invalid field or crop id" });

    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
      .limit(1);
    if (!field) return res.status(404).json({ error: "Field not found" });

    const [crop] = await db
      .select()
      .from(crops)
      .where(and(eq(crops.id, cropId), eq(crops.userId, userId), eq(crops.fieldId, fieldId)))
      .limit(1);
    if (!crop) return res.status(404).json({ error: "Crop not found" });

    await db.delete(cropActivities).where(eq(cropActivities.cropId, cropId));
    await db.delete(cropObservations).where(eq(cropObservations.cropId, cropId));
    await db.delete(crops).where(eq(crops.id, cropId));
    res.status(204).send();
  } catch (err) {
    console.error("Delete crop:", err);
    res.status(500).json({ error: "Failed to delete crop" });
  }
});

export default router;
