import type { Request, Response } from "express";
import { TreatmentModel } from "../models/TreatmentModel";
import { logger } from "../lib/logger";
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from "../lib/errors";
import { aiTreatmentGenerator } from "../services/ai-treatment-generator";

export class TreatmentController {
  private model: TreatmentModel;

  constructor() {
    this.model = new TreatmentModel();
  }

  // Generate treatment plan from analysis
  async generateTreatmentPlan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { analysisId, useAI = true } = req.body;

      if (!analysisId) {
        throw new ValidationError("Analysis ID is required");
      }

      // Get the plant analysis
      const analysis = await this.getPlantAnalysis(analysisId);
      if (!analysis) {
        throw new NotFoundError("Plant analysis not found");
      }

      // Ensure the analysis belongs to the authenticated user
      if (analysis.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      // Check if a treatment plan already exists for this analysis
      const existingPlan = await this.model.getTreatmentPlanByAnalysis(
        analysisId
      );
      if (existingPlan) {
        res.status(409).json({
          error: "Treatment plan already exists for this analysis",
          plan: existingPlan,
        });
        return;
      }

      // Get recommended treatment products based on detected disease
      const recommendedProducts = await this.fetchTreatmentProducts(
        analysis.diseaseDetected || undefined,
        analysis.plantType || undefined
      );

      let planData: any;
      const treatmentSteps: any[] = [];

      // Try AI generation first if enabled and available
      if (useAI && aiTreatmentGenerator) {
        try {
          logger.info("Generating AI-powered treatment plan...");

          // Get user's location if available
          let location;
          if (analysis.fieldId) {
            const field = await this.getField(analysis.fieldId);
            if (field?.location) {
              location = {
                location: field.location,
              };
            }
          }

          // Generate AI treatment plan
          const aiPlan = await aiTreatmentGenerator.generateTreatmentPlan(
            analysis,
            recommendedProducts,
            location
          );

          // Create the treatment plan from AI response
          planData = {
            userId: req.user.id,
            analysisId,
            title: aiPlan.title,
            description: aiPlan.description,
            diseaseType: analysis.diseaseDetected || "Unknown",
            severity: aiPlan.severity,
            estimatedDuration: aiPlan.estimatedDuration,
          };

          const plan = await this.model.createTreatmentPlan(planData);

          // Create treatment steps from AI response
          for (const aiStep of aiPlan.steps) {
            const stepData = {
              treatmentPlanId: plan.id,
              stepNumber: aiStep.stepNumber,
              title: aiStep.title,
              description: aiStep.description,
              treatmentType: aiStep.treatmentType,
              productName: aiStep.productName,
              activeIngredient: aiStep.activeIngredient,
              dosage: aiStep.dosage,
              applicationMethod: aiStep.applicationMethod,
              frequency: aiStep.frequency,
              duration: aiStep.duration,
              safetyNotes: aiStep.safetyNotes,
              cost: aiStep.cost.toString(),
              costUnit: aiStep.costUnit,
            };

            const step = await this.model.createTreatmentStep(stepData);
            treatmentSteps.push(step);
          }

          // Return the complete AI-generated treatment plan
          const completePlan = {
            ...plan,
            steps: treatmentSteps,
            analysis,
            recommendedProducts,
            aiGenerated: true,
            recommendations: aiPlan.recommendations,
            warnings: aiPlan.warnings,
            costEstimate: aiPlan.costEstimate,
            marketplaceLinks: this.generateMarketplaceLinks(
              recommendedProducts,
              analysis
            ),
          };

          logger.info(
            `AI treatment plan generated for user ${req.user.id}: ${plan.id}`
          );
          res.status(201).json(completePlan);
          return;
        } catch (aiError) {
          logger.error(
            "AI generation failed, falling back to rule-based:",
            aiError
          );
          // Fall back to rule-based generation
        }
      }

      // Rule-based generation (fallback or when AI is disabled)
      logger.info("Generating rule-based treatment plan...");

      // Generate treatment plan title
      const planTitle = `Treatment Plan for ${
        analysis.diseaseDetected || "Plant Disease"
      }`;

      // Determine severity based on disease probability
      let severity = "low";
      if (analysis.diseaseProbability) {
        const probability = parseFloat(analysis.diseaseProbability.toString());
        if (probability > 0.7) severity = "high";
        else if (probability > 0.4) severity = "medium";
      }

      // Estimate duration based on disease type and severity
      let estimatedDuration = 14; // default 2 weeks
      if (analysis.diseaseDetected) {
        const disease = analysis.diseaseDetected.toLowerCase();
        if (disease.includes("blight") || disease.includes("rot")) {
          estimatedDuration = 21; // 3 weeks for serious diseases
        } else if (disease.includes("mildew") || disease.includes("spot")) {
          estimatedDuration = 10; // 10 days for fungal issues
        }
      }

      // Create the treatment plan
      planData = {
        userId: req.user.id,
        analysisId,
        title: planTitle,
        description: `Automatically generated treatment plan for ${
          analysis.diseaseDetected || "detected disease"
        } in ${analysis.plantType || "plant"}. Health score: ${
          analysis.healthScore
        }/100.`,
        diseaseType: analysis.diseaseDetected || "Unknown",
        severity,
        estimatedDuration,
      };

      const plan = await this.model.createTreatmentPlan(planData);

      // Auto-generate treatment steps based on recommended products
      if (recommendedProducts.length > 0) {
        for (let i = 0; i < Math.min(recommendedProducts.length, 3); i++) {
          const product = recommendedProducts[i];
          const stepData = {
            treatmentPlanId: plan.id,
            stepNumber: i + 1,
            title: `Apply ${product.name}`,
            description: `Apply ${product.name} to treat ${
              analysis.diseaseDetected || "the detected disease"
            }. ${product.description || ""}`,
            treatmentType: product.productType || "chemical",
            productName: product.name,
            activeIngredient: product.activeIngredient,
            dosage:
              product.applicationRate || "Follow manufacturer instructions",
            applicationMethod: "Spray application",
            frequency: "Every 7-10 days",
            duration: 7,
            safetyNotes: `Safety class: ${
              product.safetyClass || "Unknown"
            }. Re-entry interval: ${product.reEntryInterval || "24"} hours.`,
            cost: (product.price || 0).toString(),
            costUnit: product.priceUnit || "USD",
          };

          const step = await this.model.createTreatmentStep(stepData);
          treatmentSteps.push(step);
        }
      } else {
        // Create a generic treatment step if no products are found
        const genericStep = {
          treatmentPlanId: plan.id,
          stepNumber: 1,
          title: "General Treatment",
          description:
            "Apply appropriate fungicide or pesticide based on the detected disease. Consult with a local agricultural expert for specific product recommendations.",
          treatmentType: "chemical",
          productName: "Recommended fungicide/pesticide",
          activeIngredient: "Consult product label",
          dosage: "Follow manufacturer instructions",
          applicationMethod: "Spray application",
          frequency: "Every 7-10 days",
          duration: 7,
          safetyNotes:
            "Always follow safety instructions on product label. Wear protective equipment.",
          cost: "0",
          costUnit: "USD",
        };

        const step = await this.model.createTreatmentStep(genericStep);
        treatmentSteps.push(step);
      }

      // Return the complete treatment plan with steps
      const completePlan = {
        ...plan,
        steps: treatmentSteps,
        analysis,
        recommendedProducts,
        aiGenerated: false,
        marketplaceLinks: this.generateMarketplaceLinks(
          recommendedProducts,
          analysis
        ),
      };

      logger.info(
        `Rule-based treatment plan generated for user ${req.user.id}: ${plan.id}`
      );
      res.status(201).json(completePlan);
    } catch (error) {
      logger.error("Error generating treatment plan:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  // Get all treatment plans for user
  async getUserTreatmentPlans(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const plans = await this.model.getUserTreatmentPlans(req.user.id);
      res.json(plans);
    } catch (error) {
      logger.error("Error fetching user treatment plans:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else {
        res.status(500).json({ error: "Failed to retrieve treatment plans" });
      }
    }
  }

  // Get treatment plan by ID
  async getTreatmentPlan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const planId = parseInt(id);

      if (isNaN(planId)) {
        throw new ValidationError("Invalid treatment plan ID");
      }

      const planWithSteps = await this.model.getTreatmentPlanWithSteps(planId);
      if (!planWithSteps) {
        throw new NotFoundError("Treatment plan not found");
      }

      // Ensure the plan belongs to the authenticated user
      if (planWithSteps.plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      res.json(planWithSteps);
    } catch (error) {
      logger.error("Error fetching treatment plan:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to retrieve treatment plan" });
      }
    }
  }

  // Get treatment plan by analysis ID
  async getTreatmentPlanByAnalysis(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { analysisId } = req.params;
      const analysisIdNum = parseInt(analysisId);

      if (isNaN(analysisIdNum)) {
        throw new ValidationError("Invalid analysis ID");
      }

      const plan = await this.model.getTreatmentPlanByAnalysis(analysisIdNum);
      if (!plan) {
        res.status(404).json({ error: "Treatment plan not found" });
        return;
      }

      // Ensure the plan belongs to the authenticated user
      if (plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      res.json(plan);
    } catch (error) {
      logger.error("Error fetching treatment plan by analysis:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to retrieve treatment plan" });
      }
    }
  }

  // Create treatment plan
  async createTreatmentPlan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const planData = {
        ...req.body,
        userId: req.user.id,
      };

      const plan = await this.model.createTreatmentPlan(planData);
      res.status(201).json(plan);
    } catch (error) {
      logger.error("Error creating treatment plan:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create treatment plan" });
      }
    }
  }

  // Update treatment plan
  async updateTreatmentPlan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const planId = parseInt(id);

      if (isNaN(planId)) {
        throw new ValidationError("Invalid treatment plan ID");
      }

      const plan = await this.model.getTreatmentPlan(planId);
      if (!plan) {
        throw new NotFoundError("Treatment plan not found");
      }

      if (plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      const updatedPlan = await this.model.updateTreatmentPlan(
        planId,
        req.body
      );
      res.json(updatedPlan);
    } catch (error) {
      logger.error("Error updating treatment plan:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update treatment plan" });
      }
    }
  }

  // Delete treatment plan
  async deleteTreatmentPlan(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { id } = req.params;
      const planId = parseInt(id);

      if (isNaN(planId)) {
        throw new ValidationError("Invalid treatment plan ID");
      }

      const plan = await this.model.getTreatmentPlan(planId);
      if (!plan) {
        throw new NotFoundError("Treatment plan not found");
      }

      if (plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      await this.model.deleteTreatmentPlan(planId);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting treatment plan:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete treatment plan" });
      }
    }
  }

  // Get treatment steps for a plan
  async getTreatmentSteps(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { planId } = req.params;
      const planIdNum = parseInt(planId);

      if (isNaN(planIdNum)) {
        throw new ValidationError("Invalid plan ID");
      }

      const plan = await this.model.getTreatmentPlan(planIdNum);
      if (!plan) {
        throw new NotFoundError("Treatment plan not found");
      }

      if (plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      const steps = await this.model.getTreatmentSteps(planIdNum);
      res.json(steps);
    } catch (error) {
      logger.error("Error fetching treatment steps:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to retrieve treatment steps" });
      }
    }
  }

  // Get treatment progress for a plan
  async getTreatmentProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { planId } = req.params;
      const planIdNum = parseInt(planId);

      if (isNaN(planIdNum)) {
        throw new ValidationError("Invalid plan ID");
      }

      const plan = await this.model.getTreatmentPlan(planIdNum);
      if (!plan) {
        throw new NotFoundError("Treatment plan not found");
      }

      if (plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      const progress = await this.model.getTreatmentProgress(planIdNum);
      res.json(progress);
    } catch (error) {
      logger.error("Error fetching treatment progress:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res
          .status(500)
          .json({ error: "Failed to retrieve treatment progress" });
      }
    }
  }

  // Create treatment step
  async createTreatmentStep(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { planId } = req.params;
      const planIdNum = parseInt(planId);

      if (isNaN(planIdNum)) {
        throw new ValidationError("Invalid plan ID");
      }

      const plan = await this.model.getTreatmentPlan(planIdNum);
      if (!plan) {
        throw new NotFoundError("Treatment plan not found");
      }

      if (plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      const stepData = {
        ...req.body,
        treatmentPlanId: planIdNum,
      };

      const step = await this.model.createTreatmentStep(stepData);
      res.status(201).json(step);
    } catch (error) {
      logger.error("Error creating treatment step:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create treatment step" });
      }
    }
  }

  // Get treatment step by ID
  async getTreatmentStep(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { stepId } = req.params;
      const stepIdNum = parseInt(stepId);

      if (isNaN(stepIdNum)) {
        throw new ValidationError("Invalid step ID");
      }

      const step = await this.model.getTreatmentStep(stepIdNum);
      if (!step) {
        throw new NotFoundError("Treatment step not found");
      }

      // Get the plan to check ownership
      const plan = await this.model.getTreatmentPlan(step.treatmentPlanId);
      if (!plan || plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      res.json(step);
    } catch (error) {
      logger.error("Error fetching treatment step:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to retrieve treatment step" });
      }
    }
  }

  // Update treatment step
  async updateTreatmentStep(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { stepId } = req.params;
      const stepIdNum = parseInt(stepId);

      if (isNaN(stepIdNum)) {
        throw new ValidationError("Invalid step ID");
      }

      const step = await this.model.getTreatmentStep(stepIdNum);
      if (!step) {
        throw new NotFoundError("Treatment step not found");
      }

      // Get the plan to check ownership
      const plan = await this.model.getTreatmentPlan(step.treatmentPlanId);
      if (!plan || plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      const updatedStep = await this.model.updateTreatmentStep(
        stepIdNum,
        req.body
      );
      res.json(updatedStep);
    } catch (error) {
      logger.error("Error updating treatment step:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to update treatment step" });
      }
    }
  }

  // Delete treatment step
  async deleteTreatmentStep(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { stepId } = req.params;
      const stepIdNum = parseInt(stepId);

      if (isNaN(stepIdNum)) {
        throw new ValidationError("Invalid step ID");
      }

      const step = await this.model.getTreatmentStep(stepIdNum);
      if (!step) {
        throw new NotFoundError("Treatment step not found");
      }

      // Get the plan to check ownership
      const plan = await this.model.getTreatmentPlan(step.treatmentPlanId);
      if (!plan || plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      await this.model.deleteTreatmentStep(stepIdNum);
      res.status(204).send();
    } catch (error) {
      logger.error("Error deleting treatment step:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to delete treatment step" });
      }
    }
  }

  // Record treatment progress
  async recordTreatmentProgress(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { stepId } = req.params;
      const stepIdNum = parseInt(stepId);

      if (isNaN(stepIdNum)) {
        throw new ValidationError("Invalid step ID");
      }

      const step = await this.model.getTreatmentStep(stepIdNum);
      if (!step) {
        throw new NotFoundError("Treatment step not found");
      }

      // Get the plan to check ownership
      const plan = await this.model.getTreatmentPlan(step.treatmentPlanId);
      if (!plan || plan.userId !== req.user.id) {
        throw new AuthorizationError("Access denied");
      }

      const progressData = {
        ...req.body,
        treatmentStepId: stepIdNum,
        userId: req.user.id,
      };

      const progress = await this.model.recordTreatmentProgress(progressData);
      res.status(201).json(progress);
    } catch (error) {
      logger.error("Error recording treatment progress:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else if (error instanceof AuthorizationError) {
        res.status(403).json({ error: error.message });
      } else if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to record treatment progress" });
      }
    }
  }

  // Get treatment products
  async getTreatmentProducts(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AuthenticationError();
      }

      const { disease, plantType } = req.query;
      const products = await this.fetchTreatmentProducts(
        disease as string,
        plantType as string
      );
      res.json(products);
    } catch (error) {
      logger.error("Error fetching treatment products:", error);
      if (error instanceof AuthenticationError) {
        res.status(401).json({ error: "Authentication required" });
      } else {
        res
          .status(500)
          .json({ error: "Failed to retrieve treatment products" });
      }
    }
  }

  // Helper methods (these would typically be injected or moved to a service)
  private async getPlantAnalysis(analysisId: number): Promise<any> {
    // This would typically use a PlantAnalysisModel
    // For now, we'll use the storage directly
    const { storage } = await import("../storage");
    return storage.getPlantAnalysis(analysisId);
  }

  private async getField(fieldId: number): Promise<any> {
    // This would typically use a FieldModel
    const { storage } = await import("../storage");
    return storage.getField(fieldId);
  }

  private async fetchTreatmentProducts(
    disease?: string,
    plantType?: string
  ): Promise<any[]> {
    // This would typically use a ProductModel
    const { storage } = await import("../storage");
    return storage.getTreatmentProducts(disease, plantType);
  }

  private generateMarketplaceLinks(recommendedProducts: any[], analysis: any) {
    return {
      products: recommendedProducts.map((product) => ({
        productId: product.id,
        name: product.name,
        marketplaceUrl: `/marketplace/products?search=${encodeURIComponent(
          product.name
        )}`,
        dealerUrl: `/marketplace/dealers?product=${encodeURIComponent(
          product.name
        )}`,
      })),
      expertConsultation: {
        chatUrl: `/chat/experts?topic=${encodeURIComponent(
          analysis.diseaseDetected || "plant disease"
        )}`,
        expertListUrl: `/marketplace/experts?specialty=plant-disease`,
      },
    };
  }
}
