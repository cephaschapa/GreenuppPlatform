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

  // Get treatment plan by analysis ID
  app.get(
    "/api/treatment-plans/analysis/:analysisId",
    isAuthenticated,
    controller.getTreatmentPlanByAnalysis.bind(controller)
  );

  // Create treatment plan
  app.post(
    "/api/treatment-plans",
    isAuthenticated,
    controller.createTreatmentPlan.bind(controller)
  );

  // Update treatment plan
  app.patch(
    "/api/treatment-plans/:id",
    isAuthenticated,
    controller.updateTreatmentPlan.bind(controller)
  );

  // Delete treatment plan
  app.delete(
    "/api/treatment-plans/:id",
    isAuthenticated,
    controller.deleteTreatmentPlan.bind(controller)
  );

  // Get treatment steps for a plan
  app.get(
    "/api/treatment-plans/:planId/steps",
    isAuthenticated,
    controller.getTreatmentSteps.bind(controller)
  );

  // Get treatment progress for a plan
  app.get(
    "/api/treatment-plans/:planId/progress",
    isAuthenticated,
    controller.getTreatmentProgress.bind(controller)
  );

  // Create treatment step
  app.post(
    "/api/treatment-plans/:planId/steps",
    isAuthenticated,
    controller.createTreatmentStep.bind(controller)
  );

  // Get treatment step by ID
  app.get(
    "/api/treatment-steps/:stepId",
    isAuthenticated,
    controller.getTreatmentStep.bind(controller)
  );

  // Update treatment step
  app.patch(
    "/api/treatment-steps/:stepId",
    isAuthenticated,
    controller.updateTreatmentStep.bind(controller)
  );

  // Delete treatment step
  app.delete(
    "/api/treatment-steps/:stepId",
    isAuthenticated,
    controller.deleteTreatmentStep.bind(controller)
  );

  // Record treatment progress
  app.post(
    "/api/treatment-steps/:stepId/progress",
    isAuthenticated,
    controller.recordTreatmentProgress.bind(controller)
  );

  // Get treatment products
  app.get(
    "/api/treatment-products",
    isAuthenticated,
    controller.getTreatmentProducts.bind(controller)
  );
}
