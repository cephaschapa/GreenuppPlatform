import { db } from "../db";
import {
  fieldCropPlans,
  fields,
  cropRef,
  seedVarieties,
  yieldSimulationRuns,
  locations,
} from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { getClimateData } from "../weather";

const METHOD_VERSION = "mvp_v1";

export interface SimulationInputs {
  fieldCropPlanId: number;
  plantingDate: string | null;
  expectedHarvestDate: string | null;
  targetAreaHa: string | null;
  managementLevel: string | null;
  location: string; // "lat,lon" or place name for weather
  cropWaterRequirementMm: number | null;
  varietyYieldMin: number | null;
  varietyYieldMax: number | null;
}

export interface SimulationOutputs {
  conservative: number;
  expected: number;
  best_case: number;
  /** Area used for total yield (hectares) */
  areaHa?: number;
  /** Total yield (tonnes) = t/ha × areaHa */
  totalConservative?: number;
  totalExpected?: number;
  totalBestCase?: number;
  drivers?: Record<string, number>;
}

export interface SimulationResult {
  inputs: SimulationInputs;
  outputs: SimulationOutputs;
  explanation: string;
  weatherSnapshot: Record<string, unknown> | null;
}

/**
 * Run a deterministic yield simulation for a field crop plan.
 * Uses climate data (monthly rain, GDD), water stress, heat stress, and management factor.
 * Full formulas, examples and scenarios: platform/docs/YIELD_ESTIMATION_CALCULATIONS.md
 */
export async function runYieldSimulation(
  planId: number,
  options: { locationOverride?: string } = {}
): Promise<SimulationResult> {
  const [planRow] = await db
    .select({
      id: fieldCropPlans.id,
      fieldId: fieldCropPlans.fieldId,
      cropId: fieldCropPlans.cropId,
      seedVarietyId: fieldCropPlans.seedVarietyId,
      plantingDate: fieldCropPlans.plantingDate,
      expectedHarvestDate: fieldCropPlans.expectedHarvestDate,
      targetAreaHa: fieldCropPlans.targetAreaHa,
      managementLevel: fieldCropPlans.managementLevel,
    })
    .from(fieldCropPlans)
    .where(eq(fieldCropPlans.id, planId))
    .limit(1);

  if (!planRow) throw new Error("Crop plan not found");

  const [fieldRow] = await db
    .select({
      locationId: fields.locationId,
      centerLat: fields.centerLat,
      centerLng: fields.centerLng,
      location: fields.location,
      size: fields.size,
      sizeUnit: fields.sizeUnit,
    })
    .from(fields)
    .where(eq(fields.id, planRow.fieldId))
    .limit(1);

  if (!fieldRow) throw new Error("Field not found");

  const areaHa = (() => {
    const planHa = planRow.targetAreaHa != null ? parseFloat(String(planRow.targetAreaHa)) : NaN;
    if (!Number.isNaN(planHa) && planHa > 0) {
      const ha = Math.round(planHa * 100) / 100;
      return Math.max(0.01, ha);
    }
    const size = fieldRow.size != null ? parseFloat(String(fieldRow.size)) : NaN;
    if (Number.isNaN(size) || size <= 0) return 1;
    const unit = (fieldRow.sizeUnit || "hectares").toLowerCase();
    const ha =
      unit === "acres" ? Math.round(size * 0.4047 * 100) / 100 : Math.round(size * 100) / 100;
    return Math.max(0.01, ha);
  })();

  let locationStr = options.locationOverride ?? "";
  if (!locationStr && fieldRow.centerLat != null && fieldRow.centerLng != null) {
    locationStr = `${fieldRow.centerLat},${fieldRow.centerLng}`;
  }
  if (!locationStr && fieldRow.location) locationStr = fieldRow.location;
  if (!locationStr && fieldRow.locationId) {
    const [loc] = await db
      .select({
        lat: locations.latitude,
        lon: locations.longitude,
        formatted: locations.formattedAddress,
      })
      .from(locations)
      .where(eq(locations.id, fieldRow.locationId))
      .limit(1);
    if (loc?.lat != null && loc?.lon != null) {
      locationStr = `${loc.lat},${loc.lon}`;
    } else if (loc?.formatted) {
      locationStr = loc.formatted;
    }
  }
  if (!locationStr) locationStr = "Lusaka, Zambia"; // fallback for offline / no coords

  const [cropRow] = await db
    .select({
      defaultWaterRequirementMm: cropRef.defaultWaterRequirementMm,
    })
    .from(cropRef)
    .where(eq(cropRef.id, planRow.cropId))
    .limit(1);

  let varietyYieldMin: number | null = null;
  let varietyYieldMax: number | null = null;
  if (planRow.seedVarietyId) {
    const [varRow] = await db
      .select({
        yieldPotentialThaMin: seedVarieties.yieldPotentialThaMin,
        yieldPotentialThaMax: seedVarieties.yieldPotentialThaMax,
      })
      .from(seedVarieties)
      .where(eq(seedVarieties.id, planRow.seedVarietyId))
      .limit(1);
    if (varRow) {
      varietyYieldMin = varRow.yieldPotentialThaMin ?? null;
      varietyYieldMax = varRow.yieldPotentialThaMax ?? null;
    }
  }

  const cropWaterMm = Math.max(1, Number(cropRow?.defaultWaterRequirementMm) || 500);
  const baseYieldMin =
    varietyYieldMin != null && varietyYieldMin > 0 ? varietyYieldMin : 4;
  const baseYieldMax =
    varietyYieldMax != null && varietyYieldMax > 0 ? varietyYieldMax : 8;

  let climateData: Awaited<ReturnType<typeof getClimateData>>;
  let weatherSnapshot: Record<string, unknown> = {};
  try {
    climateData = await getClimateData(locationStr);
    weatherSnapshot = {
      location: climateData.location,
      monthlyAverages: climateData.monthlyAverages,
      growingSeasonLength: climateData.growingSeasonLength,
      soilConditions: climateData.soilConditions,
    };
  } catch (e) {
    weatherSnapshot = { error: String(e), fallback: true };
    climateData = {
      location: locationStr,
      monthlyAverages: Array.from({ length: 12 }, (_, i) => ({
        month: ["January","February","March","April","May","June","July","August","September","October","November","December"][i],
        averageTemp: 22,
        averagePrecipitation: 100,
        growingDegreeDays: 360,
      })),
      soilConditions: { type: "Loam", ph: 6.5, moisture: 50 },
      growingSeasonLength: 180,
    };
  }

  const totalRain = climateData.monthlyAverages.reduce(
    (s, m) => s + (m.averagePrecipitation ?? 0),
    0
  );
  const seasonalRainMm = Math.max(0, totalRain);
  const waterStressFactor =
    cropWaterMm <= 0
      ? 1
      : Math.max(0.2, Math.min(1, seasonalRainMm / cropWaterMm));
  const avgTemp =
    climateData.monthlyAverages.reduce((s, m) => s + (m.averageTemp ?? 20), 0) /
    climateData.monthlyAverages.length;
  const heatStressFactor = avgTemp > 35 ? 0.7 : avgTemp > 30 ? 0.85 : 1;
  const managementFactor =
    planRow.managementLevel === "high" ? 1.1 : planRow.managementLevel === "low" ? 0.85 : 1;

  const expectedYield =
    ((baseYieldMin + baseYieldMax) / 2) * waterStressFactor * heatStressFactor * managementFactor;
  const conservative = expectedYield * 0.75;
  const bestCase = expectedYield * 1.25;

  const inputs: SimulationInputs = {
    fieldCropPlanId: planId,
    plantingDate: planRow.plantingDate,
    expectedHarvestDate: planRow.expectedHarvestDate,
    targetAreaHa: planRow.targetAreaHa,
    managementLevel: planRow.managementLevel,
    location: locationStr,
    cropWaterRequirementMm: cropWaterMm,
    varietyYieldMin,
    varietyYieldMax,
  };

  const perHaConservative = Math.round(conservative * 100) / 100;
  const perHaExpected = Math.round(expectedYield * 100) / 100;
  const perHaBestCase = Math.round(bestCase * 100) / 100;
  const totalConservative = Math.round(perHaConservative * areaHa * 100) / 100;
  const totalExpected = Math.round(perHaExpected * areaHa * 100) / 100;
  const totalBestCase = Math.round(perHaBestCase * areaHa * 100) / 100;

  const outputs: SimulationOutputs = {
    conservative: perHaConservative,
    expected: perHaExpected,
    best_case: perHaBestCase,
    areaHa,
    totalConservative,
    totalExpected,
    totalBestCase,
    drivers: {
      water_stress_factor: Math.round(waterStressFactor * 1000) / 1000,
      heat_stress_factor: heatStressFactor,
      management_factor: managementFactor,
      seasonal_rain_mm: Math.round(seasonalRainMm),
    },
  };

  const explanation = [
    `Yield: ${outputs.conservative}–${outputs.best_case} t/ha (expected ${outputs.expected} t/ha).`,
    `For ${areaHa} ha: ${outputs.totalConservative}–${outputs.totalBestCase} t total (expected ${outputs.totalExpected} t).`,
    `Based on seasonal rainfall (~${Math.round(seasonalRainMm)} mm), water stress factor ${outputs.drivers?.water_stress_factor ?? waterStressFactor}, management level ${planRow.managementLevel ?? "medium"}.`,
  ].join(" ");

  return {
    inputs,
    outputs,
    explanation,
    weatherSnapshot: Object.keys(weatherSnapshot).length ? weatherSnapshot : null,
  };
}

/**
 * Run simulation and persist one row to yield_simulation_runs; returns saved run + result.
 */
export async function runAndPersistYieldSimulation(
  planId: number,
  options: { locationOverride?: string } = {}
): Promise<{ run: typeof yieldSimulationRuns.$inferSelect; result: SimulationResult }> {
  const result = await runYieldSimulation(planId, options);

  const [run] = await db
    .insert(yieldSimulationRuns)
    .values({
      fieldCropPlanId: planId,
      weatherSnapshotJson: result.weatherSnapshot,
      methodVersion: METHOD_VERSION,
      inputs: result.inputs as unknown as Record<string, unknown>,
      outputs: result.outputs as unknown as Record<string, unknown>,
      explanation: result.explanation,
    })
    .returning();

  if (!run) throw new Error("Failed to save yield simulation run");

  return { run, result };
}
