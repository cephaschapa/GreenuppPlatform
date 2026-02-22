import { db } from "../db";
import {
  crops,
  cropGrowthStages,
  cropRef,
  seedVarieties,
  fieldCropPlans,
  cropActivities,
} from "@shared/schema";
import { eq, asc, desc } from "drizzle-orm";

/** Standard activity types for crop lifecycle (planting → storage) */
export const CROP_ACTIVITY_TYPES = [
  "planting",
  "spraying",
  "weeding",
  "fertilizing",
  "irrigation",
  "pest_control",
  "disease_control",
  "scouting",
  "harvesting",
  "post_harvest",
  "storage",
  "other",
] as const;

export type CropActivityType = (typeof CROP_ACTIVITY_TYPES)[number];

export interface StageAdvice {
  stageName: string;
  stageOrder: number;
  description: string | null;
  visualIndicators: string[] | null;
  careActions: string[] | null;
  commonIssues: string[] | null;
  notificationMessage: string | null;
  daysFromPlantingMin: number;
  daysFromPlantingMax: number;
  /** Suggested activity types for this stage */
  recommendedActivityTypes: CropActivityType[];
}

export interface CropStageResult {
  cropId: number;
  cropName: string;
  plantingDate: string | null;
  actualHarvestDate: string | null;
  expectedHarvestDate: string | null;
  /** Variety maturity in days (if known) */
  varietyDaysToMaturity: number | null;
  /** Days since planting (null if not planted) */
  daysFromPlanting: number | null;
  /** Current growth stage */
  currentStage: StageAdvice | null;
  /** Next stage (if any) */
  nextStage: StageAdvice | null;
  /** All stages for this crop (for timeline) */
  allStages: StageAdvice[];
  /** Whether crop is past maturity (harvest window) */
  isHarvestWindow: boolean;
  /** Recent activities logged for this crop */
  recentActivityTypes: string[];
}

/**
 * Map growth stage names to recommended activity types for farmer checklist
 */
function stageToRecommendedActivities(stageName: string): CropActivityType[] {
  const s = stageName.toLowerCase();
  if (s.includes("germination") || s.includes("emergence"))
    return ["planting", "irrigation", "scouting"];
  if (s.includes("vegetative") || s.includes("growth"))
    return ["weeding", "fertilizing", "spraying", "irrigation", "pest_control", "scouting"];
  if (s.includes("tassel") || s.includes("flower") || s.includes("silk"))
    return ["irrigation", "pest_control", "scouting"];
  if (s.includes("grain fill") || s.includes("fruit"))
    return ["irrigation", "disease_control", "scouting"];
  if (s.includes("maturity") || s.includes("ripening"))
    return ["scouting", "harvesting"];
  if (s.includes("post") || s.includes("storage") || s.includes("harvest"))
    return ["post_harvest", "storage"];
  return ["scouting", "weeding", "fertilizing", "spraying"];
}

/**
 * Resolve crop name for lookups: use crop_ref.name if we have cropRefId, else crops.name
 */
async function getCropNameForStages(cropRow: {
  name: string;
  fieldId: number | null;
}): Promise<string> {
  // crop_growth_stages uses crop_name (text). crop_ref has name. Match by crops.name.
  return cropRow.name;
}

/**
 * Get current growth stage and next stage for a crop by days from planting.
 * Uses variety maturity to clamp the last stage when available.
 */
function selectStages(
  stages: Array<{
    id: number;
    stageName: string;
    stageOrder: number;
    daysFromPlantingMin: number;
    daysFromPlantingMax: number;
    description: string | null;
    visualIndicators: string[] | null;
    careActions: string[] | null;
    commonIssues: string[] | null;
    notificationMessage: string | null;
  }>,
  daysFromPlanting: number,
  varietyDaysToMaturity: number | null
): { current: StageAdvice | null; next: StageAdvice | null; all: StageAdvice[] } {
  const all: StageAdvice[] = stages.map((row) => ({
    stageName: row.stageName,
    stageOrder: row.stageOrder,
    description: row.description,
    visualIndicators: row.visualIndicators,
    careActions: row.careActions,
    commonIssues: row.commonIssues,
    notificationMessage: row.notificationMessage,
    daysFromPlantingMin: row.daysFromPlantingMin,
    daysFromPlantingMax: row.daysFromPlantingMax,
    recommendedActivityTypes: stageToRecommendedActivities(row.stageName),
  }));

  // Optionally scale last stage (Maturity) by variety maturity
  let maxDays = Math.max(...stages.map((s) => s.daysFromPlantingMax), 0);
  if (varietyDaysToMaturity != null && varietyDaysToMaturity > 0 && all.length > 0) {
    const last = all[all.length - 1];
    if (last.stageName.toLowerCase().includes("maturity") || last.stageOrder >= all.length) {
      maxDays = varietyDaysToMaturity;
      last.daysFromPlantingMax = varietyDaysToMaturity;
    }
  }

  let current: StageAdvice | null = null;
  let next: StageAdvice | null = null;

  if (daysFromPlanting < 0) {
    next = all[0] ?? null;
    return { current: null, next, all };
  }

  for (let i = 0; i < all.length; i++) {
    const stage = all[i];
    const min = stage.daysFromPlantingMin;
    const max = stage.daysFromPlantingMax;
    if (daysFromPlanting >= min && daysFromPlanting <= max) {
      current = stage;
      next = all[i + 1] ?? null;
      break;
    }
  }
  if (!current && daysFromPlanting > maxDays) {
    current = all[all.length - 1] ?? null;
  }

  return { current, next, all };
}

/**
 * Get full stage and advice for a crop (crops table).
 * Uses planting date and optional variety maturity from linked plan or seed variety name match.
 */
export async function getCropStageAndAdvice(cropId: number): Promise<CropStageResult | null> {
  const [crop] = await db
    .select({
      id: crops.id,
      name: crops.name,
      plantingDate: crops.plantingDate,
      expectedHarvestDate: crops.expectedHarvestDate,
      actualHarvestDate: crops.actualHarvestDate,
      fieldId: crops.fieldId,
    })
    .from(crops)
    .where(eq(crops.id, cropId))
    .limit(1);

  if (!crop) return null;

  const cropName = await getCropNameForStages({ name: crop.name, fieldId: crop.fieldId });
  const stageRows = await db
    .select({
      id: cropGrowthStages.id,
      stageName: cropGrowthStages.stageName,
      stageOrder: cropGrowthStages.stageOrder,
      daysFromPlantingMin: cropGrowthStages.daysFromPlantingMin,
      daysFromPlantingMax: cropGrowthStages.daysFromPlantingMax,
      description: cropGrowthStages.description,
      visualIndicators: cropGrowthStages.visualIndicators,
      careActions: cropGrowthStages.careActions,
      commonIssues: cropGrowthStages.commonIssues,
      notificationMessage: cropGrowthStages.notificationMessage,
    })
    .from(cropGrowthStages)
    .where(eq(cropGrowthStages.cropName, cropName))
    .orderBy(asc(cropGrowthStages.stageOrder));

  let daysFromPlanting: number | null = null;
  let varietyDaysToMaturity: number | null = null;

  if (crop.plantingDate) {
    const planting = new Date(crop.plantingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    planting.setHours(0, 0, 0, 0);
    daysFromPlanting = Math.floor((today.getTime() - planting.getTime()) / (24 * 60 * 60 * 1000));
  }

  // Try to get variety maturity: from a plan linked to same field+crop name, or from seed_varieties by name match (crops.seedVariety is text)
  // For now we don't have plan↔crop link; use expectedHarvestDate if set to infer effective maturity
  if (crop.plantingDate && crop.expectedHarvestDate) {
    const p = new Date(crop.plantingDate);
    const h = new Date(crop.expectedHarvestDate);
    varietyDaysToMaturity = Math.round((h.getTime() - p.getTime()) / (24 * 60 * 60 * 1000));
  }

  const { current, next, all } = selectStages(
    stageRows,
    daysFromPlanting ?? -1,
    varietyDaysToMaturity
  );

  const maxStageDays =
    varietyDaysToMaturity ??
    (stageRows.length > 0 ? Math.max(...stageRows.map((s) => s.daysFromPlantingMax)) : 0);
  const isHarvestWindow =
    daysFromPlanting != null &&
    maxStageDays > 0 &&
    daysFromPlanting >= Math.max(0, maxStageDays - 21);

  const recentActivities = await db
    .select({ activityType: cropActivities.activityType })
    .from(cropActivities)
    .where(eq(cropActivities.cropId, cropId))
    .orderBy(desc(cropActivities.activityDate))
    .limit(20);

  return {
    cropId: crop.id,
    cropName: crop.name,
    plantingDate: crop.plantingDate,
    actualHarvestDate: crop.actualHarvestDate,
    expectedHarvestDate: crop.expectedHarvestDate,
    varietyDaysToMaturity,
    daysFromPlanting,
    currentStage: current,
    nextStage: next,
    allStages: all,
    isHarvestWindow,
    recentActivityTypes: [...new Set(recentActivities.map((a) => a.activityType))],
  };
}

/**
 * Get stage and advice for a field crop plan (uses plan's planting date and seed variety maturity).
 */
export async function getPlanStageAndAdvice(planId: number): Promise<{
  planId: number;
  cropName: string;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  varietyDaysToMaturity: number | null;
  varietyName: string | null;
  daysFromPlanting: number | null;
  currentStage: StageAdvice | null;
  nextStage: StageAdvice | null;
  allStages: StageAdvice[];
  isHarvestWindow: boolean;
  recommendedActivityTypes: CropActivityType[];
} | null> {
  const [plan] = await db
    .select({
      id: fieldCropPlans.id,
      cropId: fieldCropPlans.cropId,
      seedVarietyId: fieldCropPlans.seedVarietyId,
      plantingDate: fieldCropPlans.plantingDate,
      expectedHarvestDate: fieldCropPlans.expectedHarvestDate,
    })
    .from(fieldCropPlans)
    .where(eq(fieldCropPlans.id, planId))
    .limit(1);

  if (!plan) return null;

  const [cropRefRow] = await db
    .select({ name: cropRef.name })
    .from(cropRef)
    .where(eq(cropRef.id, plan.cropId))
    .limit(1);

  const cropName = cropRefRow?.name ?? "Maize";

  let varietyDaysToMaturity: number | null = null;
  let varietyName: string | null = null;
  if (plan.seedVarietyId) {
    const [v] = await db
      .select({
        daysToMaturityMin: seedVarieties.daysToMaturityMin,
        daysToMaturityMax: seedVarieties.daysToMaturityMax,
        name: seedVarieties.name,
      })
      .from(seedVarieties)
      .where(eq(seedVarieties.id, plan.seedVarietyId))
      .limit(1);
    if (v) {
      varietyName = v.name;
      varietyDaysToMaturity =
        v.daysToMaturityMin != null && v.daysToMaturityMax != null
          ? Math.round((v.daysToMaturityMin + v.daysToMaturityMax) / 2)
          : v.daysToMaturityMax ?? v.daysToMaturityMin ?? null;
    }
  }

  const stageRows = await db
    .select({
      id: cropGrowthStages.id,
      stageName: cropGrowthStages.stageName,
      stageOrder: cropGrowthStages.stageOrder,
      daysFromPlantingMin: cropGrowthStages.daysFromPlantingMin,
      daysFromPlantingMax: cropGrowthStages.daysFromPlantingMax,
      description: cropGrowthStages.description,
      visualIndicators: cropGrowthStages.visualIndicators,
      careActions: cropGrowthStages.careActions,
      commonIssues: cropGrowthStages.commonIssues,
      notificationMessage: cropGrowthStages.notificationMessage,
    })
    .from(cropGrowthStages)
    .where(eq(cropGrowthStages.cropName, cropName))
    .orderBy(asc(cropGrowthStages.stageOrder));

  let daysFromPlanting: number | null = null;
  if (plan.plantingDate) {
    const planting = new Date(plan.plantingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    planting.setHours(0, 0, 0, 0);
    daysFromPlanting = Math.floor((today.getTime() - planting.getTime()) / (24 * 60 * 60 * 1000));
  }

  const { current, next, all } = selectStages(
    stageRows,
    daysFromPlanting ?? -1,
    varietyDaysToMaturity
  );

  const maxStageDays =
    varietyDaysToMaturity ??
    (stageRows.length > 0 ? Math.max(...stageRows.map((s) => s.daysFromPlantingMax)) : 0);
  const isHarvestWindow =
    daysFromPlanting != null &&
    maxStageDays > 0 &&
    daysFromPlanting >= Math.max(0, maxStageDays - 21);

  const recommendedActivityTypes = current
    ? current.recommendedActivityTypes
    : (all[0]?.recommendedActivityTypes ?? ["planting", "scouting"]);

  return {
    planId: plan.id,
    cropName,
    plantingDate: plan.plantingDate,
    expectedHarvestDate: plan.expectedHarvestDate,
    varietyDaysToMaturity,
    varietyName,
    daysFromPlanting,
    currentStage: current ?? null,
    nextStage: next ?? null,
    allStages: all,
    isHarvestWindow,
    recommendedActivityTypes,
  };
}

/**
 * List stages and generic advice for a crop type (by name). Used for "what to expect" before planting.
 */
export async function getStagesForCropType(cropName: string): Promise<StageAdvice[]> {
  const rows = await db
    .select({
      stageName: cropGrowthStages.stageName,
      stageOrder: cropGrowthStages.stageOrder,
      daysFromPlantingMin: cropGrowthStages.daysFromPlantingMin,
      daysFromPlantingMax: cropGrowthStages.daysFromPlantingMax,
      description: cropGrowthStages.description,
      visualIndicators: cropGrowthStages.visualIndicators,
      careActions: cropGrowthStages.careActions,
      commonIssues: cropGrowthStages.commonIssues,
      notificationMessage: cropGrowthStages.notificationMessage,
    })
    .from(cropGrowthStages)
    .where(eq(cropGrowthStages.cropName, cropName))
    .orderBy(asc(cropGrowthStages.stageOrder));

  return rows.map((row) => ({
    stageName: row.stageName,
    stageOrder: row.stageOrder,
    description: row.description,
    visualIndicators: row.visualIndicators,
    careActions: row.careActions,
    commonIssues: row.commonIssues,
    notificationMessage: row.notificationMessage,
    daysFromPlantingMin: row.daysFromPlantingMin,
    daysFromPlantingMax: row.daysFromPlantingMax,
    recommendedActivityTypes: stageToRecommendedActivities(row.stageName),
  }));
}
