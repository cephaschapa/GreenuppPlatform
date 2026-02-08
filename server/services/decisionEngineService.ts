/**
 * Decision Engine Service (v1)
 * Port of app/utils/dailyDecisionEngine: 1–3 actionable decisions per user.
 * Weather risks override; persist to decisions table with triggerRefId (e.g. weather_snapshot id).
 */

import { db } from "../db";
import { decisions } from "@shared/schema";
import { and, desc, eq, gt } from "drizzle-orm";
import type { WeatherSnapshotRow } from "./weatherObservationService";
import type { Task } from "../models/TaskModel";
import type { Field } from "../models/FieldModel";
import type { Crop } from "../models/CropModel";

const RULESET_VERSION = "v1.0.0";
const DEFAULT_EXPIRES_HOURS = 24;

type Priority = "high" | "medium" | "low";

interface WeatherLike {
  current?: { temp?: number; windSpeed?: number; uv?: number };
  forecast?: Array<{
    precipitation?: number;
    temp?: { min?: number };
    low?: number;
  }>;
}

interface RawDecision {
  decisionType: string;
  title: string;
  summary: string;
  priority: Priority;
  whyText: string;
  whyPayload: Record<string, unknown>;
  scopeType: "field" | "crop" | "farm" | "general";
  fieldId?: number;
  cropId?: number;
  triggerType: string;
  triggerRefId?: number;
}

function weatherFromSnapshot(snapshot: WeatherSnapshotRow | null): WeatherLike | null {
  if (!snapshot?.forecastJson) return null;
  return snapshot.forecastJson as WeatherLike;
}

function getWeatherDecisions(weather: WeatherLike | null, weatherSnapshotId?: number): RawDecision[] {
  if (!weather) return [];
  const out: RawDecision[] = [];
  const precip = weather.forecast?.[0]?.precipitation ?? 0;
  const precipTomorrow = weather.forecast?.[1]?.precipitation ?? 0;
  const windSpeed = weather.current?.windSpeed ?? 0;
  const uv = weather.current?.uv ?? 0;
  const next3Dry = weather.forecast?.slice(0, 3).every((d) => (d.precipitation ?? 0) < 25);
  const minTempNext = weather.forecast?.slice(0, 3).map((d) => d.temp?.min ?? d.low ?? 99).reduce((a, b) => Math.min(a, b), 99);

  const triggerType = "weather_snapshot";
  const triggerRefId = weatherSnapshotId;

  if (precip >= 70) {
    out.push({
      decisionType: "delay_spray",
      title: "Delay spraying for 48 hours",
      summary: "Rain likely. Check drainage and protect low-lying crops.",
      priority: "high",
      whyText: `Rain probability is ${Math.round(precip)}% in your area within the next 24–36 hours.`,
      whyPayload: { precip, precipTomorrow },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
    out.push({
      decisionType: "check_drainage",
      title: "Check drainage systems",
      summary: "Reduce waterlogging risk before heavy rain.",
      priority: "high",
      whyText: "Heavy rain expected. Good drainage protects roots and reduces disease risk.",
      whyPayload: { precip },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
    return out;
  }
  if (precip >= 50) {
    out.push({
      decisionType: "avoid_spray_today",
      title: "Avoid spraying today",
      summary: "Rain likely. Delay chemical applications.",
      priority: "high",
      whyText: `Rain chance is ${Math.round(precip)}% today. Spray can wash off or cause runoff.`,
      whyPayload: { precip },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
    return out;
  }
  if (precip >= 30) {
    out.push({
      decisionType: "plan_spray_window",
      title: "Plan spraying for a dry window",
      summary: "Rain possible today. Use tomorrow if drier.",
      priority: "medium",
      whyText: `Rain probability ${Math.round(precip)}% today. Check forecast for a dry slot.`,
      whyPayload: { precip },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
  }

  if (windSpeed > 25) {
    out.push({
      decisionType: "no_spray_wind",
      title: "Do not spray in high wind",
      summary: "Wind can drift spray and waste product.",
      priority: "high",
      whyText: `Winds around ${Math.round(windSpeed)} km/h in your area. Spray when calmer.`,
      whyPayload: { windSpeed },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
    return out;
  }

  if (minTempNext < 15 && minTempNext !== 99) {
    out.push({
      decisionType: "protect_cold",
      title: "Protect sensitive crops from cold",
      summary: "Cool nights ahead. Use covers or move containers.",
      priority: "medium",
      whyText: `Night temperatures may drop to around ${Math.round(minTempNext)}°C this week.`,
      whyPayload: { minTempNext },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
  }

  if (next3Dry && precip < 30) {
    out.push({
      decisionType: "dry_window",
      title: "Use the dry window for planting or spraying",
      summary: "Next 3 days mostly dry. Good for field work.",
      priority: "medium",
      whyText: "Low rain chance for the next few days. Good time to plant or apply treatments.",
      whyPayload: { precip },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
  }

  if (uv > 6) {
    out.push({
      decisionType: "limit_midday",
      title: "Limit midday field work",
      summary: "High UV. Prefer morning or late afternoon.",
      priority: "medium",
      whyText: `UV index is high (${uv.toFixed(1)}). Seedlings and skin need protection at midday.`,
      whyPayload: { uv },
      scopeType: "farm",
      triggerType,
      triggerRefId,
    });
  }

  return out;
}

function getTaskDecisions(tasks: Task[], weatherOverrides: boolean, _weatherSnapshotId?: number): RawDecision[] {
  if (weatherOverrides) return [];
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const overdue = tasks.filter((t) => !t.completed && t.dueDate && new Date(t.dueDate) < now);
  const dueToday = tasks.filter((t) => !t.completed && t.dueDate && t.dueDate.slice(0, 10) === today);
  const next = overdue[0] ?? dueToday[0];
  if (!next) return [];
  const isOverdue = overdue.length > 0 && next.dueDate && new Date(next.dueDate) < now;
  return [
    {
      decisionType: "task_due",
      title: isOverdue ? "Complete overdue task" : "Task due today",
      summary: next.title.length > 40 ? next.title.slice(0, 37) + "…" : next.title,
      priority: (next.priority === "high" || isOverdue ? "high" : next.priority === "medium" ? "medium" : "low") as Priority,
      whyText: isOverdue ? "This task was due earlier. Completing it keeps your plan on track." : "You set this for today. One less thing to carry over.",
      whyPayload: { taskId: next.id, dueDate: next.dueDate },
      scopeType: "general",
      triggerType: "task",
      triggerRefId: next.id,
    },
  ];
}

function getCropDecisions(
  fields: Field[],
  cropsByFieldId: Map<number, Crop[]>,
  weatherOverrides: boolean
): RawDecision[] {
  if (weatherOverrides) return [];
  const out: RawDecision[] = [];
  for (const field of fields.slice(0, 2)) {
    const fieldCrops = cropsByFieldId.get(field.id) ?? [];
    const crop = fieldCrops[0];
    if (!crop) continue;
    const stage = crop.status === "planted" ? "early" : crop.status === "growing" ? "vegetative" : crop.status;
    if (stage === "vegetative" || stage === "growing") {
      out.push({
        decisionType: "scout_pests",
        title: "Scout for pests on " + (crop.name || "crops"),
        summary: "Vegetative stage is when pests often appear.",
        priority: "low",
        whyText: `${crop.name || "Crop"} is at a growth stage where pests commonly appear. A quick check helps catch issues early.`,
        whyPayload: { fieldId: field.id, cropId: crop.id },
        scopeType: "field",
        fieldId: field.id,
        cropId: crop.id,
        triggerType: "crop",
        triggerRefId: crop.id,
      });
      break;
    }
  }
  return out;
}

/**
 * Generate 1–3 decisions and persist to decisions table.
 * Returns the created decision rows.
 */
export async function generateAndPersistDecisions(
  userId: number,
  snapshot: WeatherSnapshotRow | null,
  tasks: Task[],
  fields: Field[],
  cropsByFieldId: Map<number, Crop[]>,
  options?: { expiresInHours?: number }
): Promise<Array<{ id: number; title: string; summary: string; priority: string }>> {
  const weather = weatherFromSnapshot(snapshot);
  const weatherDecisions = getWeatherDecisions(weather, snapshot?.id);
  const weatherOverrides = weatherDecisions.some((d) => d.priority === "high");
  const taskDecisions = getTaskDecisions(tasks, weatherOverrides);
  const cropDecisions = getCropDecisions(fields, cropsByFieldId, weatherOverrides);

  const combined: RawDecision[] = [];
  for (const d of weatherDecisions) {
    if (combined.length >= 3) break;
    combined.push(d);
  }
  for (const d of taskDecisions) {
    if (combined.length >= 3) break;
    combined.push(d);
  }
  for (const d of cropDecisions) {
    if (combined.length >= 3) break;
    combined.push(d);
  }

  if (combined.length === 0) {
    combined.push({
      decisionType: "routine",
      title: "Routine field work",
      summary: "No urgent actions. Scout and plan as usual.",
      priority: "low",
      whyText: "Weather and tasks look stable. Good day for general checks and planning.",
      whyPayload: {},
      scopeType: "general",
      triggerType: "engine",
      triggerRefId: snapshot?.id,
    });
  }

  const toInsert = combined.slice(0, 3);
  const expiresInHours = options?.expiresInHours ?? DEFAULT_EXPIRES_HOURS;
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const inserted = await db
    .insert(decisions)
    .values(
      toInsert.map((d) => ({
        userId,
        scopeType: d.scopeType,
        fieldId: d.fieldId ?? null,
        cropId: d.cropId ?? null,
        decisionType: d.decisionType,
        title: d.title,
        summary: d.summary,
        priority: d.priority,
        confidenceLevel: "medium",
        confidenceScore: "0.80",
        whyText: d.whyText,
        whyPayload: d.whyPayload,
        triggerType: d.triggerType,
        triggerRefId: d.triggerRefId ?? null,
        rulesetVersion: RULESET_VERSION,
        status: "generated",
        expiresAt,
      }))
    )
    .returning({ id: decisions.id, title: decisions.title, summary: decisions.summary, priority: decisions.priority });

  return inserted;
}

/**
 * Create a single decision linked to a plant analysis (diagnosis follow-up).
 * Called after a new analysis is created so it appears on home as a recommended action.
 */
export async function createDiagnosisFollowUpDecision(
  userId: number,
  analysisId: number,
  options: { fieldId?: number | null; cropId?: number | null; diseaseDetected?: string | null }
): Promise<{ id: number } | null> {
  const expiresAt = new Date(Date.now() + DEFAULT_EXPIRES_HOURS * 60 * 60 * 1000);
  const title = options.diseaseDetected
    ? `Review diagnosis: ${options.diseaseDetected}`
    : "Review your plant analysis";
  const summary = "Follow up on your diagnosis and treatment recommendations.";
  const whyText = "You submitted a plant analysis. Review the results and any treatment steps.";
  const [inserted] = await db
    .insert(decisions)
    .values({
      userId,
      scopeType: options.fieldId != null ? "field" : options.cropId != null ? "crop" : "general",
      fieldId: options.fieldId ?? null,
      cropId: options.cropId ?? null,
      decisionType: "inspect",
      title,
      summary,
      priority: "medium",
      confidenceLevel: "medium",
      confidenceScore: "0.80",
      whyText,
      whyPayload: { analysisId, diseaseDetected: options.diseaseDetected ?? null },
      triggerType: "diagnosis",
      triggerRefId: analysisId,
      rulesetVersion: RULESET_VERSION,
      status: "generated",
      expiresAt,
    })
    .returning({ id: decisions.id });
  return inserted ?? null;
}

/**
 * Get today's non-expired decisions for a user.
 */
export async function getActiveDecisions(userId: number): Promise<Array<{
  id: number;
  title: string;
  summary: string;
  priority: string;
  whyText: string;
  decisionType: string;
  status: string;
  expiresAt: Date;
}>> {
  const now = new Date();
  const rows = await db
    .select({
      id: decisions.id,
      title: decisions.title,
      summary: decisions.summary,
      priority: decisions.priority,
      whyText: decisions.whyText,
      decisionType: decisions.decisionType,
      status: decisions.status,
      expiresAt: decisions.expiresAt,
    })
    .from(decisions)
    .where(and(eq(decisions.userId, userId), gt(decisions.expiresAt, now)))
    .orderBy(desc(decisions.createdAt));
  return rows as any;
}
