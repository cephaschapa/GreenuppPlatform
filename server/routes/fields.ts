import { Router } from "express";
import { db } from "../db";
import {
  fields,
  crops,
  locations,
  fieldCropPlans,
  yieldSimulationRuns,
  cropActivities,
  cropObservations,
  plantAnalyses,
  treatmentPlans,
  treatmentSteps,
  pestReports,
  marketplaceListings,
} from "@shared/schema";
import { eq, and, isNotNull, inArray } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";
import fieldCropPlansRouter from "./field-crop-plans";

const router = Router();

// Mount crop-plans under /:fieldId/crop-plans (before /:id so "crop-plans" is not treated as id)
router.use("/:fieldId/crop-plans", fieldCropPlansRouter);

// Get all fields for a user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userFields = await db
      .select()
      .from(fields)
      .where(eq(fields.userId, userId))
      .orderBy(fields.createdAt);

    res.json(userFields);
  } catch (error) {
    console.error("Error fetching fields:", error);
    res.status(500).json({ error: "Failed to fetch fields" });
  }
});

// Get fields with location data and crops
router.get("/with-locations", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Get fields with location data and boundary information
    const fieldsWithLocations = await db
      .select({
        id: fields.id,
        name: fields.name,
        location: fields.location,
        locationId: fields.locationId,
        size: fields.size,
        sizeUnit: fields.sizeUnit,
        soilType: fields.soilType,
        notes: fields.notes,
        // Include boundary data
        boundary: fields.boundary,
        calculatedArea: fields.calculatedArea,
        centerLat: fields.centerLat,
        centerLng: fields.centerLng,
        createdAt: fields.createdAt,
        updatedAt: fields.updatedAt,
        locationData: {
          id: locations.id,
          latitude: locations.latitude,
          longitude: locations.longitude,
          country: locations.country,
          region: locations.region,
          city: locations.city,
          formattedAddress: locations.formattedAddress,
        },
      })
      .from(fields)
      .leftJoin(locations, eq(fields.locationId, locations.id))
      .where(eq(fields.userId, userId))
      .orderBy(fields.createdAt);

    // Get crops for each field
    const fieldIds = fieldsWithLocations.map((field) => field.id);
    const fieldCrops =
      fieldIds.length > 0
        ? await db
            .select({
              id: crops.id,
              fieldId: crops.fieldId,
              name: crops.name,
              variety: crops.variety,
              status: crops.status,
              plantingDate: crops.plantingDate,
              expectedHarvestDate: crops.expectedHarvestDate,
            })
            .from(crops)
            .where(and(eq(crops.userId, userId), isNotNull(crops.fieldId)))
        : [];

    // Group crops by field
    const cropsByField = fieldCrops.reduce((acc, crop) => {
      if (!acc[crop.fieldId!]) {
        acc[crop.fieldId!] = [];
      }
      acc[crop.fieldId!].push(crop);
      return acc;
    }, {} as Record<number, typeof fieldCrops>);

    // Combine fields with their crops
    const result = fieldsWithLocations.map((field) => ({
      ...field,
      crops: cropsByField[field.id] || [],
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching fields with locations:", error);
    res.status(500).json({ error: "Failed to fetch fields with locations" });
  }
});

// Get a specific field
router.get("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const field = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
      .limit(1);

    if (field.length === 0) {
      return res.status(404).json({ error: "Field not found" });
    }

    res.json(field[0]);
  } catch (error) {
    console.error("Error fetching field:", error);
    res.status(500).json({ error: "Failed to fetch field" });
  }
});

// Create a new field
router.post("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      name,
      location,
      locationId,
      size,
      sizeUnit,
      soilType,
      notes,
      boundary,
      calculatedArea,
      centerLat,
      centerLng,
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Field name is required" });
    }

    const fieldValues = {
      userId,
      name,
      location: location || null,
      locationId: locationId || null,
      size: size || null,
      sizeUnit: sizeUnit || "hectares",
      soilType: soilType || null,
      notes: notes || null,
      boundary: boundary || null,
      calculatedArea: calculatedArea || null,
      centerLat: centerLat || null,
      centerLng: centerLng || null,
    };

    const [newField] = await db.insert(fields).values(fieldValues).returning();

    res.status(201).json(newField);
  } catch (error) {
    console.error("Error creating field:", error);
    res.status(500).json({ error: "Failed to create field" });
  }
});

// Update a field
router.put("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const {
      name,
      location,
      locationId,
      size,
      sizeUnit,
      soilType,
      notes,
      boundary,
      calculatedArea,
      centerLat,
      centerLng,
    } = req.body;

    const [updatedField] = await db
      .update(fields)
      .set({
        name,
        location: location || null,
        locationId: locationId || null,
        size: size || null,
        sizeUnit: sizeUnit || "hectares",
        soilType: soilType || null,
        notes: notes || null,
        boundary: boundary || null,
        calculatedArea: calculatedArea || null,
        centerLat: centerLat || null,
        centerLng: centerLng || null,
        updatedAt: new Date(),
      })
      .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
      .returning();

    if (!updatedField) {
      return res.status(404).json({ error: "Field not found" });
    }

    res.json(updatedField);
  } catch (error) {
    console.error("Error updating field:", error);
    res.status(500).json({ error: "Failed to update field" });
  }
});

// Delete a field (and its dependent crops, crop plans, and simulation runs)
router.delete("/:id", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    const fieldId = parseInt(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const [field] = await db
      .select()
      .from(fields)
      .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
      .limit(1);

    if (!field) {
      return res.status(404).json({ error: "Field not found" });
    }

    const planIds = await db
      .select({ id: fieldCropPlans.id })
      .from(fieldCropPlans)
      .where(eq(fieldCropPlans.fieldId, fieldId));

    if (planIds.length > 0) {
      await db
        .delete(yieldSimulationRuns)
        .where(inArray(yieldSimulationRuns.fieldCropPlanId, planIds.map((p) => p.id)));
    }

    await db.delete(fieldCropPlans).where(eq(fieldCropPlans.fieldId, fieldId));

    const cropIds = await db
      .select({ id: crops.id })
      .from(crops)
      .where(eq(crops.fieldId, fieldId));
    if (cropIds.length > 0) {
      const ids = cropIds.map((c) => c.id);
      const plantAnalysisRows = await db
        .select({ id: plantAnalyses.id })
        .from(plantAnalyses)
        .where(inArray(plantAnalyses.cropId, ids));
      const plantAnalysisIds = plantAnalysisRows.map((p) => p.id);
      if (plantAnalysisIds.length > 0) {
        const plans = await db
          .select({ id: treatmentPlans.id })
          .from(treatmentPlans)
          .where(inArray(treatmentPlans.analysisId, plantAnalysisIds));
        const planIds = plans.map((t) => t.id);
        if (planIds.length > 0) {
          await db.delete(treatmentSteps).where(inArray(treatmentSteps.treatmentPlanId, planIds));
        }
        await db.delete(treatmentPlans).where(inArray(treatmentPlans.analysisId, plantAnalysisIds));
        await db.delete(pestReports).where(inArray(pestReports.plantAnalysisId, plantAnalysisIds));
      }
      await db.delete(plantAnalyses).where(inArray(plantAnalyses.cropId, ids));
      await db.delete(cropActivities).where(inArray(cropActivities.cropId, ids));
      await db.delete(cropObservations).where(inArray(cropObservations.cropId, ids));
      await db
        .update(marketplaceListings)
        .set({ sourceCropId: null })
        .where(inArray(marketplaceListings.sourceCropId, ids));
    }
    await db.delete(crops).where(eq(crops.fieldId, fieldId));
    await db.delete(fields).where(eq(fields.id, fieldId));

    res.json({ message: "Field deleted successfully" });
  } catch (error) {
    console.error("Error deleting field:", error);
    res.status(500).json({ error: "Failed to delete field" });
  }
});

export default router;
