/**
 * POST /api/events/batch
 * Append-only analytics event ingestion for retention and funnel metrics.
 * Whitelist event names; validate payload; server adds userId and timestamp.
 */

import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { db } from "../db.js";
import { events } from "@shared/schema";
import { logger } from "../lib/logger.js";

const router = Router();

const MAX_BATCH_SIZE = 50;
const MAX_PROPERTIES_SIZE = 2000; // chars per event properties JSON

const EVENT_WHITELIST = new Set([
  "app_opened",
  "app_open",
  "decision_shown",
  "decision_why_opened",
  "recommendation_why_tapped",
  "decision_acted",
  "decision_ignored",
  "recommendation_tapped",
  "task_completed",
  "diagnosis_started",
  "diagnosis_requested",
  "diagnosis_treatment_viewed",
  "treatment_viewed",
  "diagnosis_purchase_viewed",
  "action_taken",
]);

function getUserId(req: Request): number | null {
  return (req as any).user?.id ?? (req as any).session?.userId ?? null;
}

router.post("/batch", isAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const body = req.body;
    if (!Array.isArray(body)) {
      res.status(400).json({ message: "Body must be an array of events" });
      return;
    }

    if (body.length > MAX_BATCH_SIZE) {
      res.status(400).json({ message: `Batch size must be at most ${MAX_BATCH_SIZE}` });
      return;
    }

    const sessionId = (req as any).session?.id ?? req.get("x-session-id") ?? null;
    const deviceId = req.get("x-device-id") ?? null;

    const rows: Array<{
      userId: number;
      sessionId: string | null;
      deviceId: string | null;
      eventName: string;
      entityType: string | null;
      entityId: number | null;
      properties: object | null;
    }> = [];

    for (let i = 0; i < body.length; i++) {
      const e = body[i];
      const eventName = typeof e?.eventName === "string" ? e.eventName.trim() : null;
      if (!eventName || !EVENT_WHITELIST.has(eventName)) {
        logger.warn("events/batch: skipped invalid or non-whitelisted event", {
          index: i,
          eventName: eventName ?? "(missing)",
        });
        continue;
      }

      let entityType: string | null = null;
      if (typeof e.entityType === "string" && e.entityType.trim()) {
        entityType = e.entityType.trim().slice(0, 100);
      }

      let entityId: number | null = null;
      if (typeof e.entityId === "number" && Number.isFinite(e.entityId)) {
        entityId = e.entityId;
      } else if (typeof e.entityId === "string") {
        const n = parseInt(e.entityId, 10);
        if (Number.isFinite(n)) entityId = n;
      }

      let properties: object | null = null;
      if (e.properties != null && typeof e.properties === "object" && !Array.isArray(e.properties)) {
        const str = JSON.stringify(e.properties);
        if (str.length <= MAX_PROPERTIES_SIZE) {
          properties = e.properties as object;
        }
      }

      rows.push({
        userId,
        sessionId,
        deviceId,
        eventName,
        entityType,
        entityId,
        properties,
      });
    }

    if (rows.length === 0) {
      res.json({ ok: true, ingested: 0 });
      return;
    }

    await db.insert(events).values(
      rows.map((r) => ({
        userId: r.userId,
        sessionId: r.sessionId,
        deviceId: r.deviceId,
        eventName: r.eventName,
        entityType: r.entityType,
        entityId: r.entityId,
        properties: r.properties,
      }))
    );

    res.json({ ok: true, ingested: rows.length });
  } catch (err: any) {
    logger.error("POST /api/events/batch failed", { err: err?.message ?? err });
    res.status(500).json({
      message: "Failed to ingest events",
      error: err?.message ?? "Unknown error",
    });
  }
});

export default router;
