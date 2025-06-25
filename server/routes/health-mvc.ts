import { Router } from "express";
import { HealthController } from "../controllers/HealthController.js";

const router = Router();

// Simple test endpoint to verify server is responding
router.get("/test", HealthController.test);

// Fast health check endpoint for Railway (no database dependency)
router.get("/", HealthController.basicHealth);

// Database health check (separate endpoint for detailed checks)
router.get("/db", HealthController.databaseHealth);

// Detailed health check
router.get("/detailed", HealthController.detailedHealth);

export default router;
