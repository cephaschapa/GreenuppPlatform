import { Router } from "express";
import { db } from "../db";
import {
  seedVarieties,
  seedCompanies,
  cropRef,
  agroEcologicalRegions,
  fields,
  locations,
  farmerProfiles,
} from "@shared/schema";
import { eq, and, sql, isNull } from "drizzle-orm";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

/**
 * GET /api/seed-varieties
 * Query: cropId, region (I|II|III), maturityClass, companyId, fieldId (optional – for recommendations)
 * Returns list of varieties; when fieldId is provided, adds recommendation score and explanations.
 */
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "User not authenticated" });

    const cropId = req.query.cropId ? parseInt(String(req.query.cropId), 10) : undefined;
    const region = req.query.region as string | undefined; // I | II | III
    const maturityClass = req.query.maturityClass as string | undefined;
    const companyId = req.query.companyId ? parseInt(String(req.query.companyId), 10) : undefined;
    const fieldId = req.query.fieldId ? parseInt(String(req.query.fieldId), 10) : undefined;

    // Resolve agro-ecological region from field when fieldId provided
    let resolvedRegion: string | undefined = region;
    let province: string | undefined;
    if (fieldId && !region) {
      const [field] = await db
        .select({
          locationId: fields.locationId,
          userId: fields.userId,
        })
        .from(fields)
        .where(and(eq(fields.id, fieldId), eq(fields.userId, userId)))
        .limit(1);
      if (field) {
        if (field.locationId) {
          const [loc] = await db
            .select({ region: locations.region })
            .from(locations)
            .where(eq(locations.id, field.locationId))
            .limit(1);
          province = loc?.region ?? undefined;
        }
        if (!province) {
          const [profile] = await db
            .select({ province: farmerProfiles.province })
            .from(farmerProfiles)
            .where(eq(farmerProfiles.userId, field.userId))
            .limit(1);
          province = profile?.province ?? undefined;
        }
        if (province) {
          const provinceNorm = province.replace(/\s*Province\s*$/i, "").trim();
          const [agro] = await db
            .select({ region: agroEcologicalRegions.region })
            .from(agroEcologicalRegions)
            .where(
              and(
                eq(agroEcologicalRegions.province, provinceNorm),
                isNull(agroEcologicalRegions.district)
              )
            )
            .limit(1);
          if (!agro) {
            const [anyAgro] = await db
              .select({ region: agroEcologicalRegions.region })
              .from(agroEcologicalRegions)
              .where(eq(agroEcologicalRegions.province, provinceNorm))
              .limit(1);
            resolvedRegion = anyAgro?.region ?? undefined;
          } else {
            resolvedRegion = agro.region;
          }
        }
      }
    }

    const conditions = [eq(seedVarieties.isActive, true)];
    if (cropId != null && !Number.isNaN(cropId)) conditions.push(eq(seedVarieties.cropId, cropId));
    if (companyId != null && !Number.isNaN(companyId))
      conditions.push(eq(seedVarieties.companyId, companyId));
    if (maturityClass) conditions.push(eq(seedVarieties.maturityClass, maturityClass));
    if (resolvedRegion) {
      conditions.push(sql`${resolvedRegion} = ANY(${seedVarieties.recommendedRegions})`);
    }

    const rows = await db
      .select({
        id: seedVarieties.id,
        cropId: seedVarieties.cropId,
        companyId: seedVarieties.companyId,
        name: seedVarieties.name,
        code: seedVarieties.code,
        type: seedVarieties.type,
        grainColor: seedVarieties.grainColor,
        maturityClass: seedVarieties.maturityClass,
        daysToMaturityMin: seedVarieties.daysToMaturityMin,
        daysToMaturityMax: seedVarieties.daysToMaturityMax,
        yieldPotentialThaMin: seedVarieties.yieldPotentialThaMin,
        yieldPotentialThaMax: seedVarieties.yieldPotentialThaMax,
        traits: seedVarieties.traits,
        recommendedRegions: seedVarieties.recommendedRegions,
        recommendedPlantingWindow: seedVarieties.recommendedPlantingWindow,
        sourceUrl: seedVarieties.sourceUrl,
        lastVerifiedAt: seedVarieties.lastVerifiedAt,
        companyName: seedCompanies.name,
        cropName: cropRef.name,
      })
      .from(seedVarieties)
      .innerJoin(cropRef, eq(seedVarieties.cropId, cropRef.id))
      .leftJoin(seedCompanies, eq(seedVarieties.companyId, seedCompanies.id))
      .where(and(...conditions));

    type Row = (typeof rows)[0];
    type Out = Row & {
      recommended?: boolean;
      recommendationScore?: number;
      recommendationReasons?: string[];
    };

    const result: Out[] = rows.map((row) => {
      const out: Out = { ...row };
      if (fieldId != null && resolvedRegion) {
        const reasons: string[] = [];
        let score = 0;
        const regions = row.recommendedRegions ?? [];
        if (regions.includes(resolvedRegion)) {
          reasons.push(`Suited to agro-ecological region ${resolvedRegion} (${province ?? "your area"}).`);
          score += 40;
        }
        if (row.recommendedPlantingWindow && typeof row.recommendedPlantingWindow === "object") {
          const w = row.recommendedPlantingWindow as { start_month?: number; end_month?: number; notes?: string };
          if (w.start_month != null && w.end_month != null) {
            reasons.push(
              `Planting window: ${monthName(w.start_month)}–${monthName(w.end_month)}.${w.notes ? ` ${w.notes}` : ""}`
            );
            score += 30;
          }
        }
        reasons.push(`Maturity: ${row.maturityClass}; ${row.daysToMaturityMin ?? "?"}–${row.daysToMaturityMax ?? "?"} days.`);
        score += 20;
        if (row.yieldPotentialThaMin != null && row.yieldPotentialThaMax != null) {
          reasons.push(`Yield potential: ${row.yieldPotentialThaMin}–${row.yieldPotentialThaMax} t/ha.`);
          score += 10;
        }
        out.recommended = score >= 50;
        out.recommendationScore = Math.min(100, score);
        out.recommendationReasons = reasons;
      }
      return out;
    });

    if (fieldId != null && resolvedRegion) {
      result.sort((a, b) => (b.recommendationScore ?? 0) - (a.recommendationScore ?? 0));
    }

    res.json(result);
  } catch (err) {
    console.error("List seed varieties:", err);
    res.status(500).json({ error: "Failed to fetch seed varieties" });
  }
});

function monthName(month: number): string {
  const names = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return names[month - 1] ?? String(month);
}

export default router;
