/**
 * Alert jobs scheduler: ingestion (every 15 min), delivery (every 15 min after ingest).
 * Wire into notificationJobs or start separately.
 */

import { logger } from "../../lib/logger.js";
import { runIngestion } from "./ingest.js";
import { runDelivery } from "./delivery.js";

const INGEST_INTERVAL_MS = (Number(process.env.ALERTS_INGEST_INTERVAL_MIN) || 15) * 60 * 1000;
const DELIVERY_INTERVAL_MS = (Number(process.env.ALERTS_DELIVERY_INTERVAL_MIN) || 15) * 60 * 1000;

let ingestTimer: ReturnType<typeof setInterval> | null = null;
let deliveryTimer: ReturnType<typeof setInterval> | null = null;

export async function runAlertsIngestion(): Promise<void> {
  const start = Date.now();
  try {
    const results = await runIngestion();
    logger.info(
      { durationMs: Date.now() - start, results: results.map((r) => ({ source: r.source, new: r.newCount, updated: r.updatedCount })) },
      "alerts: ingestion job finished"
    );
  } catch (err) {
    logger.error({ err, durationMs: Date.now() - start }, "alerts: ingestion job failed");
  }
}

export async function runAlertsDelivery(): Promise<void> {
  const start = Date.now();
  try {
    const results = await runDelivery();
    const sent = results.filter((r) => r.status === "sent").length;
    logger.info({ durationMs: Date.now() - start, total: results.length, sent }, "alerts: delivery job finished");
  } catch (err) {
    logger.error({ err, durationMs: Date.now() - start }, "alerts: delivery job failed");
  }
}

/**
 * Start recurring alert jobs (ingestion + delivery).
 * Call from server bootstrap (e.g. notificationJobs).
 */
export function startAlertsScheduler(): void {
  if (ingestTimer) return;
  runAlertsIngestion().then(() => {
    ingestTimer = setInterval(runAlertsIngestion, INGEST_INTERVAL_MS);
    logger.info({ intervalMin: INGEST_INTERVAL_MS / 60000 }, "alerts: ingestion scheduler started");
  });
  deliveryTimer = setInterval(runAlertsDelivery, DELIVERY_INTERVAL_MS);
  logger.info({ intervalMin: DELIVERY_INTERVAL_MS / 60000 }, "alerts: delivery scheduler started");
}

export function stopAlertsScheduler(): void {
  if (ingestTimer) {
    clearInterval(ingestTimer);
    ingestTimer = null;
  }
  if (deliveryTimer) {
    clearInterval(deliveryTimer);
    deliveryTimer = null;
  }
  logger.info("alerts: scheduler stopped");
}
