/**
 * Decision action endpoints: POST /api/decisions/:id/shown | /act | /ignore
 */

import { Router, type Request, type Response } from "express";
import { isAuthenticated } from "../middleware/auth.js";
import { db } from "../db.js";
import { decisions } from "@shared/schema";
import { and, eq } from "drizzle-orm";
import { logger } from "../lib/logger.js";

const router = Router();
router.use(isAuthenticated);

function getUserId(req: Request): number | null {
  return (req as any).user?.id ?? (req as any).session?.userId ?? null;
}

async function getDecisionForUser(
  decisionId: string,
  userId: number
): Promise<{ id: number } | null> {
  const id = parseInt(decisionId, 10);
  if (Number.isNaN(id)) return null;
  const [row] = await db
    .select({ id: decisions.id })
    .from(decisions)
    .where(and(eq(decisions.id, id), eq(decisions.userId, userId)))
    .limit(1);
  return row ?? null;
}

router.post("/:id/shown", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const decision = await getDecisionForUser(req.params.id, userId);
    if (!decision) {
      res.status(404).json({ message: "Decision not found" });
      return;
    }
    await db
      .update(decisions)
      .set({ shownAt: new Date() })
      .where(eq(decisions.id, decision.id));
    res.json({ ok: true });
  } catch (err: any) {
    logger.error("POST /api/decisions/:id/shown failed", { err: err?.message });
    res.status(500).json({ message: "Failed to update decision" });
  }
});

router.post("/:id/act", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const decision = await getDecisionForUser(req.params.id, userId);
    if (!decision) {
      res.status(404).json({ message: "Decision not found" });
      return;
    }
    await db
      .update(decisions)
      .set({ actedAt: new Date(), status: "acted" })
      .where(eq(decisions.id, decision.id));
    res.json({ ok: true });
  } catch (err: any) {
    logger.error("POST /api/decisions/:id/act failed", { err: err?.message });
    res.status(500).json({ message: "Failed to update decision" });
  }
});

router.post("/:id/ignore", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }
    const decision = await getDecisionForUser(req.params.id, userId);
    if (!decision) {
      res.status(404).json({ message: "Decision not found" });
      return;
    }
    await db
      .update(decisions)
      .set({ status: "ignored" })
      .where(eq(decisions.id, decision.id));
    res.json({ ok: true });
  } catch (err: any) {
    logger.error("POST /api/decisions/:id/ignore failed", { err: err?.message });
    res.status(500).json({ message: "Failed to update decision" });
  }
});

export default router;
