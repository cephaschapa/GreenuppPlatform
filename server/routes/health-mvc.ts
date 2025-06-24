import { Router } from "express";
import { HealthController } from "../controllers/HealthController.js";

const router = Router();

// HEALTH CHECKS DISABLED - Uncomment to re-enable
/*
// Simple test endpoint to verify server is responding
router.get("/test", HealthController.test);

// Fast health check endpoint for Railway (no database dependency)
router.get("/health", HealthController.basicHealth);

// Database health check (separate endpoint for detailed checks)
router.get("/health/db", HealthController.databaseHealth);

// Detailed health check
router.get("/health/detailed", HealthController.detailedHealth);
*/

export default router;
