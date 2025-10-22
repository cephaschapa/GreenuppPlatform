import { Router } from "express";
import { ProductVerificationController } from "../controllers/ProductVerificationController.js";
import { isAuthenticated, hasRole } from "../middleware/auth.js";

const router = Router();

// Public verification endpoint (no authentication required)
router.get("/verify/:batchId", ProductVerificationController.verifyBatchPublic);

// Authenticated verification endpoints
router.get(
  "/internal/verify/:batchId",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.verifyBatch
);

// Get scannable products for authenticated user
router.get(
  "/scannable-products",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getScannableProducts
);

// Get scannable crops for authenticated user
router.get(
  "/scannable-crops",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getScannableCrops
);

// Get scannable listings for authenticated user
router.get(
  "/scannable-listings",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getScannableListings
);

// Get crop traceability history
router.get(
  "/crops/:cropId/trace/history",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getCropTraceabilityHistory
);

// Get scan analytics for a crop
router.get(
  "/crops/:cropId/scan-analytics",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getCropScanAnalytics
);

// Get user's top scanned products
router.get(
  "/top-scanned",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getTopScannedProducts
);

// Get farmer trust score
router.get(
  "/trust-score",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getFarmerTrustScore
);

// Get product trust score
router.get(
  "/crops/:cropId/trust-score",
  isAuthenticated,
  hasRole("farmer"),
  ProductVerificationController.getProductTrustScore
);

// Get scan analytics by batch ID (for marketplace listings)
router.get(
  "/batch-analytics/:batchId",
  isAuthenticated,
  ProductVerificationController.getBatchScanAnalytics
);

export default router;
