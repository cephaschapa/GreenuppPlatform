import { db } from "../db";
import {
  fields,
  locations,
  cropRef,
  seedVarieties,
  seedCompanies,
  agroEcologicalRegions,
} from "@shared/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getClimateData } from "../weather";
import { reverseGeocode } from "../weather";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Minimum monthly rainfall (mm) to consider as start of planting window (onset of rains) */
const ONSET_RAIN_MM = 50;
/** Minimum avg temp (°C) for planting */
const MIN_TEMP_PLANTING = 18;

export interface BestPlantingWindow {
  startMonth: number;   // 1-12
  endMonth: number;     // 1-12
  monthNames: string;   // e.g. "October – December"
  reason: string;
  source: "climate" | "varieties" | "default";
}

export interface ClimateSummary {
  location: string;
  growingSeasonLengthDays: number;
  avgTempC: number;
  totalRainfallMm: number;
  onsetOfRainsMonth: number | null;  // 1-12, first month with adequate rain
}

export interface RecommendedVariety {
  id: number;
  name: string;
  code: string | null;
  maturityClass: string;
  daysToMaturityMin: number | null;
  daysToMaturityMax: number | null;
  yieldPotentialThaMin: number | null;
  yieldPotentialThaMax: number | null;
  companyName: string | null;
  recommendedRegions: string[] | null;
  recommendedPlantingWindow: { start_month?: number; end_month?: number; notes?: string } | null;
  regionMatch: boolean;
  plantingWindowMatch: boolean;
  reason: string;
}

export interface PlantingAdvisoryResult {
  cropId: number;
  cropName: string;
  location: string;
  province: string | null;
  region: string | null;  // I | II | III
  bestPlantingWindow: BestPlantingWindow;
  climateSummary: ClimateSummary;
  recommendedVarieties: RecommendedVariety[];
}

function normalizeProvinceForMatch(name: string | undefined): string {
  if (!name) return "";
  const n = name.trim().replace(/\s+/g, " ");
  if (/north\s*western/i.test(n)) return "North-Western";
  return n;
}

/**
 * Resolve province from field (reverse geocode if we have coords), then get agro-ecological region.
 */
async function resolveRegionFromField(
  centerLat: number | null,
  centerLng: number | null,
  locationText: string | null
): Promise<{ province: string | null; region: string | null }> {
  let province: string | null = null;

  if (centerLat != null && centerLng != null) {
    try {
      const geo = await reverseGeocode(Number(centerLat), Number(centerLng));
      province = geo.state || geo.county || null;
    } catch {
      // ignore
    }
  }

  if (!province && locationText) {
    const upper = locationText.toUpperCase();
    const known = [
      "Lusaka", "Copperbelt", "Central", "Eastern", "Southern",
      "Northern", "Luapula", "North-Western", "Western", "Muchinga",
    ];
    for (const p of known) {
      if (upper.includes(p.toUpperCase().replace("-", " "))) {
        province = p;
        break;
      }
    }
  }

  if (!province) return { province: null, region: null };

  const normalized = normalizeProvinceForMatch(province);
  const [row] = await db
    .select({ region: agroEcologicalRegions.region })
    .from(agroEcologicalRegions)
    .where(eq(agroEcologicalRegions.province, normalized))
    .limit(1);

  if (!row) {
    const [byState] = await db
      .select({ region: agroEcologicalRegions.region })
      .from(agroEcologicalRegions)
      .where(eq(agroEcologicalRegions.province, province))
      .limit(1);
    return { province, region: byState?.region ?? null };
  }
  return { province, region: row.region };
}

/**
 * Infer best planting window from climate (onset of rains) and optionally variety windows.
 */
function inferBestPlantingWindow(
  monthlyAverages: Array<{ month: string; averageTemp: number; averagePrecipitation: number }>,
  varietyMonths: { start: number; end: number }[]
): BestPlantingWindow {
  const monthIndex = (name: string) => {
    const i = MONTH_NAMES.indexOf(name);
    return i >= 0 ? i + 1 : 0;
  };

  // Climate-based: first month with adequate rain and temp
  let climateStart = 0;
  let climateEnd = 0;
  for (let i = 0; i < monthlyAverages.length; i++) {
    const m = monthlyAverages[i];
    const monthNum = i + 1;
    const rain = m.averagePrecipitation ?? 0;
    const temp = m.averageTemp ?? 20;
    if (rain >= ONSET_RAIN_MM && temp >= MIN_TEMP_PLANTING) {
      if (climateStart === 0) climateStart = monthNum;
      climateEnd = monthNum;
    }
  }
  if (climateStart === 0) {
    climateStart = 10;
    climateEnd = 12;
  }

  if (varietyMonths.length === 0) {
    return {
      startMonth: climateStart,
      endMonth: climateEnd,
      monthNames: `${MONTH_NAMES[climateStart - 1]} – ${MONTH_NAMES[climateEnd - 1]}`,
      reason: `Based on local rainfall and temperature: planting typically from onset of rains (${MONTH_NAMES[climateStart - 1]}) through ${MONTH_NAMES[climateEnd - 1]}.`,
      source: "climate",
    };
  }

  const varStarts = varietyMonths.map((v) => v.start).filter((x) => x >= 1 && x <= 12);
  const varEnds = varietyMonths.map((v) => v.end).filter((x) => x >= 1 && x <= 12);
  const startMonth = varStarts.length ? Math.min(...varStarts) : climateStart;
  const endMonth = varEnds.length ? Math.max(...varEnds) : climateEnd;

  const overlap = varietyMonths.some(
    (v) => v.start <= climateEnd && v.end >= climateStart
  );
  const reason = overlap
    ? `Variety planting windows (${MONTH_NAMES[startMonth - 1]} – ${MONTH_NAMES[endMonth - 1]}) align with local onset of rains.`
    : `Recommended window from seed varieties: ${MONTH_NAMES[startMonth - 1]} – ${MONTH_NAMES[endMonth - 1]}. Check local rains.`;

  return {
    startMonth,
    endMonth,
    monthNames: `${MONTH_NAMES[startMonth - 1]} – ${MONTH_NAMES[endMonth - 1]}`,
    reason,
    source: "varieties",
  };
}

/**
 * Get planting advisory for a field and crop: best time to plant and recommended seed varieties by region and climate.
 */
export async function getPlantingAdvisory(
  fieldId: number,
  cropId: number
): Promise<PlantingAdvisoryResult | null> {
  const [field] = await db
    .select({
      location: fields.location,
      centerLat: fields.centerLat,
      centerLng: fields.centerLng,
      locationId: fields.locationId,
    })
    .from(fields)
    .where(eq(fields.id, fieldId))
    .limit(1);

  if (!field) return null;

  const [cropRow] = await db
    .select({ name: cropRef.name })
    .from(cropRef)
    .where(eq(cropRef.id, cropId))
    .limit(1);

  if (!cropRow) return null;

  let locationStr = field.location ?? "";
  if (!locationStr && field.centerLat != null && field.centerLng != null) {
    locationStr = `${field.centerLat},${field.centerLng}`;
  }
  if (!locationStr && field.locationId) {
    const [loc] = await db
      .select({
        lat: locations.latitude,
        lon: locations.longitude,
        formatted: locations.formattedAddress,
      })
      .from(locations)
      .where(eq(locations.id, field.locationId))
      .limit(1);
    if (loc?.lat != null && loc?.lon != null) {
      locationStr = `${loc.lat},${loc.lon}`;
    } else if (loc?.formatted) {
      locationStr = loc.formatted;
    }
  }
  if (!locationStr) locationStr = "Lusaka, Zambia";

  const [climateData, regionResult] = await Promise.all([
    getClimateData(locationStr).catch(() => null),
    resolveRegionFromField(
      field.centerLat != null ? Number(field.centerLat) : null,
      field.centerLng != null ? Number(field.centerLng) : null,
      field.location
    ),
  ]);

  const varietyRows = await db
    .select({
      id: seedVarieties.id,
      name: seedVarieties.name,
      code: seedVarieties.code,
      maturityClass: seedVarieties.maturityClass,
      daysToMaturityMin: seedVarieties.daysToMaturityMin,
      daysToMaturityMax: seedVarieties.daysToMaturityMax,
      yieldPotentialThaMin: seedVarieties.yieldPotentialThaMin,
      yieldPotentialThaMax: seedVarieties.yieldPotentialThaMax,
      recommendedRegions: seedVarieties.recommendedRegions,
      recommendedPlantingWindow: seedVarieties.recommendedPlantingWindow,
      companyId: seedVarieties.companyId,
    })
    .from(seedVarieties)
    .where(and(eq(seedVarieties.cropId, cropId), eq(seedVarieties.isActive, true)));

  const companyIds = [...new Set(varietyRows.map((v) => v.companyId).filter(Boolean))] as number[];
  const companies =
    companyIds.length > 0
      ? await db
          .select({ id: seedCompanies.id, name: seedCompanies.name })
          .from(seedCompanies)
          .where(inArray(seedCompanies.id, companyIds))
      : [];
  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.name]));

  const varietyMonths: { start: number; end: number }[] = varietyRows
    .map((v) => {
      const w = v.recommendedPlantingWindow;
      if (w?.start_month && w?.end_month) return { start: w.start_month, end: w.end_month };
      return null;
    })
    .filter(Boolean) as { start: number; end: number }[];

  const monthlyAverages = climateData?.monthlyAverages ?? [];
  const bestPlantingWindow = inferBestPlantingWindow(monthlyAverages, varietyMonths);

  const avgTemp =
    monthlyAverages.length > 0
      ? monthlyAverages.reduce((s, m) => s + (m.averageTemp ?? 0), 0) / monthlyAverages.length
      : 22;
  const totalRainfall =
    monthlyAverages.length > 0
      ? monthlyAverages.reduce((s, m) => s + (m.averagePrecipitation ?? 0), 0)
      : 0;
  let onsetOfRainsMonth: number | null = null;
  for (let i = 0; i < monthlyAverages.length; i++) {
    const m = monthlyAverages[i];
    if ((m.averagePrecipitation ?? 0) >= ONSET_RAIN_MM && (m.averageTemp ?? 0) >= MIN_TEMP_PLANTING) {
      onsetOfRainsMonth = i + 1;
      break;
    }
  }

  const climateSummary: ClimateSummary = {
    location: climateData?.location ?? locationStr,
    growingSeasonLengthDays: climateData?.growingSeasonLength ?? 180,
    avgTempC: Math.round(avgTemp * 10) / 10,
    totalRainfallMm: Math.round(totalRainfall),
    onsetOfRainsMonth,
  };

  const region = regionResult.region;
  const recommendedVarieties: RecommendedVariety[] = varietyRows.map((v) => {
    const regions = v.recommendedRegions ?? [];
    const regionMatch = !!region && regions.includes(region);
    const win = v.recommendedPlantingWindow;
    const plantingWindowMatch =
      !!win?.start_month &&
      !!win?.end_month &&
      bestPlantingWindow.startMonth <= (win.end_month ?? 0) &&
      bestPlantingWindow.endMonth >= (win.start_month ?? 0);
    let reason = "";
    if (regionMatch && plantingWindowMatch) reason = "Well suited to your region and planting window.";
    else if (regionMatch) reason = "Recommended for your agro-ecological region.";
    else if (plantingWindowMatch) reason = "Planting window fits your area.";
    else if (regions.length > 0) reason = "Consider region fit; may need adaptation.";
    else reason = "Check local extension for suitability.";

    return {
      id: v.id,
      name: v.name,
      code: v.code,
      maturityClass: v.maturityClass,
      daysToMaturityMin: v.daysToMaturityMin,
      daysToMaturityMax: v.daysToMaturityMax,
      yieldPotentialThaMin: v.yieldPotentialThaMin != null ? Number(v.yieldPotentialThaMin) : null,
      yieldPotentialThaMax: v.yieldPotentialThaMax != null ? Number(v.yieldPotentialThaMax) : null,
      companyName: v.companyId ? companyMap[v.companyId] ?? null : null,
      recommendedRegions: v.recommendedRegions,
      recommendedPlantingWindow: v.recommendedPlantingWindow,
      regionMatch,
      plantingWindowMatch,
      reason,
    };
  });

  // Sort: region match first, then planting window match, then by yield potential
  recommendedVarieties.sort((a, b) => {
    if (a.regionMatch !== b.regionMatch) return a.regionMatch ? -1 : 1;
    if (a.plantingWindowMatch !== b.plantingWindowMatch) return a.plantingWindowMatch ? -1 : 1;
    const ya = (a.yieldPotentialThaMin ?? 0) + (a.yieldPotentialThaMax ?? 0);
    const yb = (b.yieldPotentialThaMin ?? 0) + (b.yieldPotentialThaMax ?? 0);
    return yb - ya;
  });

  return {
    cropId,
    cropName: cropRow.name,
    location: climateSummary.location,
    province: regionResult.province,
    region,
    bestPlantingWindow,
    climateSummary,
    recommendedVarieties,
  };
}

/**
 * Get planting advisory by location string (no field). Uses location for climate; region may be inferred from geocode.
 */
export async function getPlantingAdvisoryByLocation(
  locationStr: string,
  cropId: number
): Promise<PlantingAdvisoryResult | null> {
  const [cropRow] = await db
    .select({ name: cropRef.name })
    .from(cropRef)
    .where(eq(cropRef.id, cropId))
    .limit(1);

  if (!cropRow) return null;

  const coordsMatch = locationStr.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
  let province: string | null = null;
  let region: string | null = null;
  if (coordsMatch) {
    const lat = parseFloat(coordsMatch[1]);
    const lon = parseFloat(coordsMatch[2]);
    const res = await resolveRegionFromField(lat, lon, null);
    province = res.province;
    region = res.region;
  } else {
    const known = ["Lusaka", "Copperbelt", "Central", "Eastern", "Southern", "Northern", "Luapula", "North-Western", "Western", "Muchinga"];
    const upper = locationStr.toUpperCase();
    for (const p of known) {
      if (upper.includes(p.toUpperCase().replace("-", " "))) {
        province = p;
        const [row] = await db.select({ region: agroEcologicalRegions.region }).from(agroEcologicalRegions).where(eq(agroEcologicalRegions.province, p)).limit(1);
        region = row?.region ?? null;
        break;
      }
    }
  }

  const climateData = await getClimateData(locationStr).catch(() => null);
  const varietyRows = await db
    .select({
      id: seedVarieties.id,
      name: seedVarieties.name,
      code: seedVarieties.code,
      maturityClass: seedVarieties.maturityClass,
      daysToMaturityMin: seedVarieties.daysToMaturityMin,
      daysToMaturityMax: seedVarieties.daysToMaturityMax,
      yieldPotentialThaMin: seedVarieties.yieldPotentialThaMin,
      yieldPotentialThaMax: seedVarieties.yieldPotentialThaMax,
      recommendedRegions: seedVarieties.recommendedRegions,
      recommendedPlantingWindow: seedVarieties.recommendedPlantingWindow,
      companyId: seedVarieties.companyId,
    })
    .from(seedVarieties)
    .where(and(eq(seedVarieties.cropId, cropId), eq(seedVarieties.isActive, true)));

  const companyIds = [...new Set(varietyRows.map((v) => v.companyId).filter(Boolean))] as number[];
  const companies =
    companyIds.length > 0
      ? await db
          .select({ id: seedCompanies.id, name: seedCompanies.name })
          .from(seedCompanies)
          .where(inArray(seedCompanies.id, companyIds))
      : [];
  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.name]));

  const varietyMonths = varietyRows
    .map((v) => {
      const w = v.recommendedPlantingWindow;
      if (w?.start_month && w?.end_month) return { start: w.start_month, end: w.end_month };
      return null;
    })
    .filter(Boolean) as { start: number; end: number }[];

  const monthlyAverages = climateData?.monthlyAverages ?? [];
  const bestPlantingWindow = inferBestPlantingWindow(monthlyAverages, varietyMonths);

  const avgTemp = monthlyAverages.length > 0
    ? monthlyAverages.reduce((s, m) => s + (m.averageTemp ?? 0), 0) / monthlyAverages.length
    : 22;
  const totalRainfall = monthlyAverages.length > 0
    ? monthlyAverages.reduce((s, m) => s + (m.averagePrecipitation ?? 0), 0)
    : 0;
  let onsetOfRainsMonth: number | null = null;
  for (let i = 0; i < monthlyAverages.length; i++) {
    const m = monthlyAverages[i];
    if ((m.averagePrecipitation ?? 0) >= ONSET_RAIN_MM && (m.averageTemp ?? 0) >= MIN_TEMP_PLANTING) {
      onsetOfRainsMonth = i + 1;
      break;
    }
  }

  const climateSummary: ClimateSummary = {
    location: climateData?.location ?? locationStr,
    growingSeasonLengthDays: climateData?.growingSeasonLength ?? 180,
    avgTempC: Math.round(avgTemp * 10) / 10,
    totalRainfallMm: Math.round(totalRainfall),
    onsetOfRainsMonth,
  };

  const recommendedVarieties: RecommendedVariety[] = varietyRows.map((v) => {
    const regions = v.recommendedRegions ?? [];
    const regionMatch = !!region && regions.includes(region);
    const win = v.recommendedPlantingWindow;
    const plantingWindowMatch =
      !!win?.start_month && !!win?.end_month &&
      bestPlantingWindow.startMonth <= (win.end_month ?? 0) &&
      bestPlantingWindow.endMonth >= (win.start_month ?? 0);
    let reason = "";
    if (regionMatch && plantingWindowMatch) reason = "Well suited to your region and planting window.";
    else if (regionMatch) reason = "Recommended for your agro-ecological region.";
    else if (plantingWindowMatch) reason = "Planting window fits your area.";
    else if (regions.length > 0) reason = "Consider region fit; may need adaptation.";
    else reason = "Check local extension for suitability.";

    return {
      id: v.id,
      name: v.name,
      code: v.code,
      maturityClass: v.maturityClass,
      daysToMaturityMin: v.daysToMaturityMin,
      daysToMaturityMax: v.daysToMaturityMax,
      yieldPotentialThaMin: v.yieldPotentialThaMin != null ? Number(v.yieldPotentialThaMin) : null,
      yieldPotentialThaMax: v.yieldPotentialThaMax != null ? Number(v.yieldPotentialThaMax) : null,
      companyName: v.companyId ? companyMap[v.companyId] ?? null : null,
      recommendedRegions: v.recommendedRegions,
      recommendedPlantingWindow: v.recommendedPlantingWindow,
      regionMatch,
      plantingWindowMatch,
      reason,
    };
  });

  recommendedVarieties.sort((a, b) => {
    if (a.regionMatch !== b.regionMatch) return a.regionMatch ? -1 : 1;
    if (a.plantingWindowMatch !== b.plantingWindowMatch) return a.plantingWindowMatch ? -1 : 1;
    const ya = (a.yieldPotentialThaMin ?? 0) + (a.yieldPotentialThaMax ?? 0);
    const yb = (b.yieldPotentialThaMin ?? 0) + (b.yieldPotentialThaMax ?? 0);
    return yb - ya;
  });

  return {
    cropId,
    cropName: cropRow.name,
    location: climateSummary.location,
    province,
    region,
    bestPlantingWindow,
    climateSummary,
    recommendedVarieties,
  };
}
