/**
 * Scheduled notification jobs: weather alerts, task reminders, farming insights,
 * marketplace recommendations, weekly outlook. Aligned with platform/NOTIFICATION_GUIDE.md.
 */

import cron from "node-cron";
import { db } from "../db.js";
import {
  notificationSettings,
  farmerProfiles,
  farmerTasks,
  users,
} from "@shared/schema";
import { eq, and, gte, lte, isNotNull } from "drizzle-orm";
import { createNotification, shouldSendNotification } from "./notifications.js";
import { resolveFarmLocation } from "./locationResolverService.js";
import {
  getOrCreateWeatherSnapshot,
  getLatestSnapshotForUser,
} from "./weatherObservationService.js";
import {
  getActiveDecisions,
  generateAndPersistDecisions,
} from "./decisionEngineService.js";
import { storage } from "../storage.js";
import { logger } from "../lib/logger.js";
import type { Task } from "../models/TaskModel.js";
import type { Field } from "../models/FieldModel.js";
import type { Crop } from "../models/CropModel.js";
import { TaskModel } from "../models/TaskModel.js";
import { FieldModel } from "../models/FieldModel.js";
import { CropModel } from "../models/CropModel.js";

/** §5 NOTIFICATION_GUIDE: configurable thresholds (env or defaults) */
const RAIN_PROB_THRESHOLD = Number(process.env.NOTIFICATION_RAIN_PROB_THRESHOLD) || 50;
const WIND_KMH_THRESHOLD = Number(process.env.NOTIFICATION_WIND_KMH_THRESHOLD) || 20;
const FROST_TEMP_THRESHOLD = 5;

type WeatherRiskResult =
  | { kind: "rain"; title: string; message: string }
  | { kind: "wind"; title: string; message: string }
  | { kind: "frost"; title: string; message: string }
  | { kind: "uv"; title: string; message: string }
  | null;

function getWeatherRisk(forecastJson: any, windKmh?: number, uv?: number): WeatherRiskResult {
  if (!forecastJson?.forecast?.length) return null;
  const day0 = forecastJson.forecast[0];
  const precip = day0?.precipitation ?? 0;
  const minTemp = day0?.temp?.min ?? day0?.low ?? 99;
  const wind = windKmh ?? 0;
  const uvIndex = uv ?? 0;

  if (precip >= RAIN_PROB_THRESHOLD) {
    return {
      kind: "rain",
      title: `Heavy rain likely tomorrow (${Math.round(precip)}%)`,
      message: "Delay spraying and check drainage today.",
    };
  }
  if (wind >= WIND_KMH_THRESHOLD) {
    return {
      kind: "wind",
      title: `High winds (${Math.round(wind)} km/h) this afternoon`,
      message: "Avoid spraying to prevent drift.",
    };
  }
  if (minTemp < FROST_TEMP_THRESHOLD) {
    return {
      kind: "frost",
      title: "Frost risk",
      message: `Low temperature around ${Math.round(minTemp)}°C expected. Protect sensitive crops.`,
    };
  }
  if (uvIndex >= 8) {
    return {
      kind: "uv",
      title: `High UV (index ${Math.round(uvIndex)}) between 11:00–15:00`,
      message: "Plan fieldwork for early morning or late afternoon.",
    };
  }
  return null;
}

/** Dry window = next 1–2 days low precip; §3 weather_opportunity */
function getWeatherOpportunity(forecastJson: any): { title: string; message: string } | null {
  if (!forecastJson?.forecast?.length) return null;
  const day0 = forecastJson.forecast[0];
  const day1 = forecastJson.forecast[1];
  const p0 = day0?.precipitation ?? 100;
  const p1 = day1?.precipitation ?? 100;
  if (p0 <= 30 && p1 <= 30) {
    return {
      title: "Dry window next 2 days",
      message: "Good time for planting or spraying early morning.",
    };
  }
  if (p0 <= 30) {
    return {
      title: "Dry window tomorrow",
      message: "Good time for field work or spraying if needed.",
    };
  }
  return null;
}

async function runWeatherAlerts(): Promise<void> {
  try {
    const rows = await db
      .select({ userId: notificationSettings.userId })
      .from(notificationSettings)
      .where(eq(notificationSettings.weatherAlerts, true));
    for (const { userId } of rows) {
      try {
        const [profile] = await db
          .select({ farmLocation: farmerProfiles.farmLocation })
          .from(farmerProfiles)
          .where(eq(farmerProfiles.userId, userId))
          .limit(1);
        const farmLocationText = profile?.farmLocation ?? null;
        if (!farmLocationText) continue;
        const location = await resolveFarmLocation(userId, farmLocationText);
        if (!location) continue;
        const { snapshot, summary } = await getOrCreateWeatherSnapshot(userId, location);
        const forecastJson = snapshot?.forecastJson as any;
        const windKmh = summary?.windSpeed != null ? Math.round(summary.windSpeed * 3.6) : undefined;
        const uv = summary?.uv;

        const risk = getWeatherRisk(forecastJson, windKmh, uv);
        if (risk) {
          const throttle = await shouldSendNotification(userId, "weather_risk", { priority: "high" });
          if (!throttle.send) {
            logger.debug("notificationJobs: weather risk skipped", { userId, reason: throttle.reason });
            continue;
          }
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 1);
          await createNotification({
            userId,
            type: "weather_risk",
            title: risk.title,
            message: risk.message,
            data: { locationLabel: location.displayName ?? location.formattedAddress ?? "" },
            priority: "high",
            confidence: "high",
            deepLink: "greenupp://weather",
            expiresAt,
          });
          logger.info("notificationJobs: weather risk sent", { userId, kind: risk.kind });
          continue;
        }

        const opportunity = getWeatherOpportunity(forecastJson);
        if (opportunity) {
          const throttle = await shouldSendNotification(userId, "weather_opportunity", { priority: "medium" });
          if (!throttle.send) continue;
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 2);
          await createNotification({
            userId,
            type: "weather_opportunity",
            title: opportunity.title,
            message: opportunity.message,
            data: { locationLabel: location.displayName ?? location.formattedAddress ?? "" },
            priority: "medium",
            confidence: "high",
            deepLink: "greenupp://weather",
            expiresAt,
          });
          logger.info("notificationJobs: weather opportunity sent", { userId });
        }
      } catch (err) {
        logger.warn("notificationJobs: weather alert failed for user", { userId, err });
      }
    }
  } catch (err) {
    logger.error("notificationJobs: runWeatherAlerts failed", err);
  }
}

async function runTaskReminders(): Promise<void> {
  try {
    const rows = await db
      .select({ userId: notificationSettings.userId })
      .from(notificationSettings)
      .where(eq(notificationSettings.taskReminders, true));
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    for (const { userId } of rows) {
      try {
        const tasks = await storage.getTasksByDateRange(userId, today, tomorrow);
        const pending = tasks.filter((t: any) => !t.completed);
        if (pending.length === 0) continue;

        const throttle = await shouldSendNotification(userId, "task_due", { priority: "medium" });
        if (!throttle.send) continue;

        const first = pending[0];
        const title =
          pending.length === 1
            ? (first.title || "Task due today")
            : `${pending.length} tasks due soon`;
        const message =
          pending.length === 1
            ? "Check when you can. Tap to view."
            : `You have ${pending.length} tasks due today or tomorrow. Tap to view.`;
        const taskId = first?.id != null ? Number(first.id) : undefined;

        await createNotification({
          userId,
          type: "task_due",
          title,
          message,
          data: { taskIds: pending.map((t: any) => t.id), ...(taskId != null && { taskId }) },
          priority: "medium",
          deepLink: "greenupp://tasks",
          expiresAt: new Date(tomorrow.getTime() + 12 * 60 * 60 * 1000),
        });
        logger.info("notificationJobs: task reminder sent", { userId, count: pending.length });
      } catch (err) {
        logger.warn("notificationJobs: task reminder failed for user", { userId, err });
      }
    }
  } catch (err) {
    logger.error("notificationJobs: runTaskReminders failed", err);
  }
}

async function runFarmingInsights(): Promise<void> {
  try {
    const rows = await db
      .select({ userId: notificationSettings.userId })
      .from(notificationSettings)
      .where(eq(notificationSettings.systemNotifications, true));
    const taskModel = new TaskModel();
    const fieldModel = new FieldModel();
    const cropModel = new CropModel();
    for (const { userId } of rows) {
      try {
        let decisions = await getActiveDecisions(userId);
        if (decisions.length === 0) {
          const snapshot = await getLatestSnapshotForUser(userId);
          const tasks = await taskModel.findByUserId(userId);
          const fields = await fieldModel.findByUserId(userId);
          const allCrops = await cropModel.findByUserId(userId);
          const cropsByFieldId = new Map<number, Crop[]>();
          for (const c of allCrops) {
            if (c.fieldId != null) {
              const arr = cropsByFieldId.get(c.fieldId) ?? [];
              arr.push(c);
              cropsByFieldId.set(c.fieldId, arr);
            }
          }
          await generateAndPersistDecisions(
            userId,
            snapshot,
            tasks as Task[],
            fields as Field[],
            cropsByFieldId
          );
          decisions = await getActiveDecisions(userId);
        }
        if (decisions.length === 0) continue;

        const throttle = await shouldSendNotification(userId, "farming_insights", { priority: "medium" });
        if (!throttle.send) continue;

        const firstDecision = decisions[0];
        await createNotification({
          userId,
          type: "farming_insights",
          title: decisions.length === 1 ? "Recommendation for you" : `${decisions.length} recommendations today`,
          message:
            decisions.length === 1
              ? firstDecision.title
              : `Based on your weather and crops, you have ${decisions.length} actions to consider. Tap to view.`,
          data: { decisionIds: decisions.map((d) => d.id), decisionId: firstDecision?.id },
          priority: "medium",
          decisionId: firstDecision?.id,
          deepLink: "greenupp://decisions",
          expiresAt: firstDecision?.expiresAt ?? undefined,
        });
        logger.info("notificationJobs: farming insights sent", { userId, count: decisions.length });
      } catch (err) {
        logger.warn("notificationJobs: farming insights failed for user", { userId, err });
      }
    }
  } catch (err) {
    logger.error("notificationJobs: runFarmingInsights failed", err);
  }
}

async function runMarketplaceRecommendations(): Promise<void> {
  try {
    const userIds = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.pushNotificationsEnabled, true), isNotNull(users.fcmToken)));
    for (const { id: userId } of userIds) {
      try {
        const throttle = await shouldSendNotification(userId, "marketplace_recommendation", { priority: "low" });
        if (!throttle.send) continue;
        await createNotification({
          userId,
          type: "marketplace_recommendation",
          title: "New products on the Market",
          message: "Seeds, fertilizers, and tools from local sellers. View when you can.",
          data: {},
          priority: "low",
          deepLink: "greenupp://marketplace",
        });
        logger.info("notificationJobs: marketplace recommendation sent", { userId });
      } catch (err) {
        logger.warn("notificationJobs: marketplace recommendation failed for user", { userId, err });
      }
    }
  } catch (err) {
    logger.error("notificationJobs: runMarketplaceRecommendations failed", err);
  }
}

/** §3 NOTIFICATION_GUIDE: weekly outlook (retention); 1/week */
async function runWeeklyOutlook(): Promise<void> {
  try {
    const rows = await db
      .select({ userId: notificationSettings.userId })
      .from(notificationSettings)
      .where(eq(notificationSettings.systemNotifications, true));
    for (const { userId } of rows) {
      try {
        const throttle = await shouldSendNotification(userId, "weekly_outlook", { priority: "low" });
        if (!throttle.send) continue;

        const snapshot = await getLatestSnapshotForUser(userId);
        const forecastJson = snapshot?.forecastJson as any;
        const day0 = forecastJson?.forecast?.[0];
        const day1 = forecastJson?.forecast?.[1];
        const p0 = day0?.precipitation ?? 0;
        const p1 = day1?.precipitation ?? 0;
        const dryDays = [p0 <= 30, p1 <= 30].filter(Boolean).length;
        const title = "Weekly Farm Outlook";
        const message =
          dryDays >= 2
            ? "2 dry days ahead. Good window for field work."
            : dryDays === 1
              ? "1 dry day ahead. Plan field work when you can."
              : "Mixed weather this week. Check the app to plan.";

        await createNotification({
          userId,
          type: "weekly_outlook",
          title,
          message,
          data: {},
          priority: "low",
          deepLink: "greenupp://home?panel=weekly",
        });
        logger.info("notificationJobs: weekly outlook sent", { userId });
      } catch (err) {
        logger.warn("notificationJobs: weekly outlook failed for user", { userId, err });
      }
    }
  } catch (err) {
    logger.error("notificationJobs: runWeeklyOutlook failed", err);
  }
}

export function startNotificationJobs(): void {
  if (typeof cron.schedule !== "function") {
    logger.warn("notificationJobs: node-cron not available, skipping scheduled jobs");
    return;
  }
  // Weather alerts: every 6 hours
  cron.schedule("0 */6 * * *", runWeatherAlerts, { timezone: "Africa/Lusaka" });
  logger.info("notificationJobs: weather alerts scheduled (every 6h)");
  // Task reminders: daily at 8:00
  cron.schedule("0 8 * * *", runTaskReminders, { timezone: "Africa/Lusaka" });
  logger.info("notificationJobs: task reminders scheduled (daily 8:00)");
  // Farming insights: daily at 8:15
  cron.schedule("15 8 * * *", runFarmingInsights, { timezone: "Africa/Lusaka" });
  logger.info("notificationJobs: farming insights scheduled (daily 8:15)");
  // Marketplace: Mondays at 9:00
  cron.schedule("0 9 * * 1", runMarketplaceRecommendations, { timezone: "Africa/Lusaka" });
  logger.info("notificationJobs: marketplace recommendations scheduled (Mon 9:00)");
  // Weekly outlook: Sunday 18:00 (guide §8)
  cron.schedule("0 18 * * 0", runWeeklyOutlook, { timezone: "Africa/Lusaka" });
  logger.info("notificationJobs: weekly outlook scheduled (Sun 18:00)");
}
