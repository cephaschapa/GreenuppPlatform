import { Router, Request, Response } from "express";
import { z } from "zod";
import { storage } from "../storage.js";

const router = Router();

// Helper function to ensure user is authenticated
function isAuthenticated(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  next();
}

// Merchant account schema
const merchantAccountSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.enum(["individual", "business", "cooperative"]),
  businessRegistrationNumber: z.string().optional(),
  taxId: z.string().optional(),
  contactPhone: z.string().min(10),
  contactEmail: z.string().email(),
  businessAddress: z.string().min(10),
  bankName: z.string().min(2),
  accountNumber: z.string().min(8),
  accountHolderName: z.string().min(2),
  branchCode: z.string().optional(),
  mobileMoneyProvider: z.enum(["mtn", "airtel", "zamtel", "none"]).optional(),
  mobileMoneyNumber: z.string().optional(),
  nationalIdNumber: z.string().min(8),
  acceptedTerms: z.boolean(),
  acceptedFees: z.boolean(),
});

// Get merchant account
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const merchantAccount = await storage.getMerchantAccount(userId);

    if (!merchantAccount) {
      return res.status(404).json({ error: "Merchant account not found" });
    }

    res.json(merchantAccount);
  } catch (error) {
    console.error("Error fetching merchant account:", error);
    res.status(500).json({ error: "Failed to fetch merchant account" });
  }
});

// Create merchant account
router.post("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const validatedData = merchantAccountSchema.parse(req.body);

    // Check if merchant account already exists
    const existingAccount = await storage.getMerchantAccount(userId);
    if (existingAccount) {
      return res.status(400).json({ error: "Merchant account already exists" });
    }

    const merchantAccount = await storage.createMerchantAccount({
      userId,
      ...validatedData,
      status: "pending",
      verificationStatus: "pending",
    });

    res.status(201).json(merchantAccount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error creating merchant account:", error);
    res.status(500).json({ error: "Failed to create merchant account" });
  }
});

// Update merchant account
router.put("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const validatedData = merchantAccountSchema.partial().parse(req.body);

    const merchantAccount = await storage.updateMerchantAccount(
      userId,
      validatedData
    );

    if (!merchantAccount) {
      return res.status(404).json({ error: "Merchant account not found" });
    }

    res.json(merchantAccount);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: "Invalid data", details: error.errors });
    }
    console.error("Error updating merchant account:", error);
    res.status(500).json({ error: "Failed to update merchant account" });
  }
});

// Get merchant earnings
router.get(
  "/earnings",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const earnings = await storage.getMerchantEarnings(userId);
      res.json(earnings);
    } catch (error) {
      console.error("Error fetching merchant earnings:", error);
      res.status(500).json({ error: "Failed to fetch earnings" });
    }
  }
);

// Get payout history
router.get("/payouts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const payouts = await storage.getMerchantPayouts(userId);
    res.json(payouts);
  } catch (error) {
    console.error("Error fetching payout history:", error);
    res.status(500).json({ error: "Failed to fetch payout history" });
  }
});

// Request payout
router.post(
  "/payouts",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { amount } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Invalid payout amount" });
      }

      const payout = await storage.requestPayout(userId, amount);
      res.status(201).json(payout);
    } catch (error) {
      console.error("Error requesting payout:", error);
      res.status(500).json({ error: "Failed to request payout" });
    }
  }
);

export default router;
