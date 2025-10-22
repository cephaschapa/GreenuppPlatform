import { Router } from "express";
import { BlockchainController } from "../controllers/BlockchainController.js";

const router = Router();

/**
 * Public blockchain routes
 */

// Get blockchain status (public - for verification pages)
router.get("/status", BlockchainController.getStatus);

// Verify a transaction (public - anyone can verify)
router.get(
  "/transactions/:txHash/verify",
  BlockchainController.verifyTransaction
);

// Get transaction details (public)
router.get("/transactions/:txHash", BlockchainController.getTransaction);

/**
 * Note: Admin/authenticated routes can be added later:
 * - GET /balance - Get wallet balance (admin only)
 * - POST /estimate-gas - Estimate gas costs (authenticated)
 */

export default router;
