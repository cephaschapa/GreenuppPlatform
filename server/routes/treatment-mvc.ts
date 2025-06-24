import type { Express } from "express";
import { TreatmentController } from "../controllers/TreatmentController";
import { isAuthenticated } from "../middleware/auth";

export function setupTreatmentRoutes(app: Express) {
  const controller = new TreatmentController();

  // Generate treatment plan from analysis
  app.post(
    "/api/treatment-plans/generate",
    isAuthenticated,
    controller.generateTreatmentPlan.bind(controller)
  );

  // Get all treatment plans for user
  app.get(
    "/api/treatment-plans",
    isAuthenticated,
    controller.getUserTreatmentPlans.bind(controller)
  );

  // Get treatment plan by ID
  app.get(
    "/api/treatment-plans/:id",
    isAuthenticated,
    controller.getTreatmentPlan.bind(controller)
  );
}
