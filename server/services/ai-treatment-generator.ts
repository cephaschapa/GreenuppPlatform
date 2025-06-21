import OpenAI from "openai";
import { PlantAnalysis } from "@shared/schema";

interface TreatmentProduct {
  id: number;
  name: string;
  description?: string | null;
  productType: string;
  activeIngredient?: string | null;
  applicationRate?: string | null;
  safetyClass?: string | null;
  reEntryInterval?: number | null;
  preHarvestInterval?: number | null;
  price?: string | null;
  priceUnit?: string | null;
  targetDiseases: string[] | null;
  targetCrops: string[] | null;
  organic?: boolean | null;
  availability?: string | null;
  manufacturer?: string | null;
}

interface AITreatmentPlan {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  estimatedDuration: number;
  steps: AITreatmentStep[];
  recommendations: string[];
  warnings: string[];
  costEstimate: {
    total: number;
    currency: string;
    breakdown: string[];
  };
}

interface AITreatmentStep {
  stepNumber: number;
  title: string;
  description: string;
  treatmentType: "chemical" | "organic" | "cultural" | "biological";
  productName?: string;
  activeIngredient?: string;
  dosage: string;
  applicationMethod: string;
  frequency: string;
  duration: number;
  safetyNotes: string;
  cost: number;
  costUnit: string;
  timing: string;
  weatherConditions?: string;
}

export class AITreatmentGenerator {
  private openai?: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn(
        "OpenAI API key not found. AI treatment generation will be disabled."
      );
      return;
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
    });
  }

  async generateTreatmentPlan(
    analysis: PlantAnalysis,
    availableProducts: TreatmentProduct[],
    location?: { location?: string },
    userPreferences?: { organicOnly?: boolean; budget?: number }
  ): Promise<AITreatmentPlan> {
    if (!this.openai) {
      throw new Error("OpenAI API not configured");
    }

    try {
      const prompt = this.buildPrompt(
        analysis,
        availableProducts,
        location,
        userPreferences
      );

      // Generate treatment plan using OpenAI
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an expert agricultural consultant specializing in plant disease treatment. 
            Create detailed, practical treatment plans for farmers. 
            Consider the specific disease, plant type, and local conditions when making recommendations.
            
            Always respond with valid JSON in the exact format specified.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI service");
      }

      // Clean the response to extract JSON from markdown formatting
      let jsonContent = content.trim();

      // Remove markdown code blocks if present
      if (jsonContent.startsWith("```json")) {
        jsonContent = jsonContent
          .replace(/^```json\s*/, "")
          .replace(/\s*```$/, "");
      } else if (jsonContent.startsWith("```")) {
        jsonContent = jsonContent.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }

      const aiPlan = JSON.parse(jsonContent) as AITreatmentPlan;

      // Validate and enhance the AI response
      return this.validateAndEnhancePlan(aiPlan, analysis, availableProducts);
    } catch (error) {
      console.error("Error generating AI treatment plan:", error);
      throw new Error("Failed to generate AI treatment plan");
    }
  }

  private buildPrompt(
    analysis: PlantAnalysis,
    availableProducts: TreatmentProduct[],
    location?: { location?: string },
    userPreferences?: { organicOnly?: boolean; budget?: number }
  ): string {
    const productsInfo = availableProducts
      .map(
        (p) =>
          `- ${p.name} (${p.productType}): ${
            p.description || "No description"
          } | Active: ${p.activeIngredient || "Unknown"} | Rate: ${
            p.applicationRate || "Follow label"
          } | Safety: ${p.safetyClass || "Unknown"} | Price: ${p.price || 0} ${
            p.priceUnit || "USD"
          }`
      )
      .join("\n");

    return `Generate a comprehensive treatment plan for the following plant analysis:

ANALYSIS DATA:
- Plant Type: ${analysis.plantType || "Unknown"}
- Disease Detected: ${analysis.diseaseDetected || "Unknown"}
- Disease Probability: ${analysis.diseaseProbability || "Unknown"}
- Health Score: ${analysis.healthScore}/100
- Health Status: ${analysis.healthStatus}
- Disease Description: ${analysis.diseaseDescription || "No description"}
- Nutrient Deficiencies: ${analysis.nutrientDeficiencies || "None detected"}
- Recommendations: ${analysis.recommendations || "None provided"}
- Analysis Date: ${analysis.analysisDate}

LOCATION CONTEXT:
${
  location
    ? `- Climate: ${location.location || "Unknown"}`
    : "- Climate: Unknown"
}

USER PREFERENCES:
${
  userPreferences
    ? `- Organic Only: ${userPreferences.organicOnly || false}`
    : "- Organic Only: Not specified"
}
${
  userPreferences
    ? `- Budget: ${userPreferences.budget || "No limit"}`
    : "- Budget: No limit"
}

AVAILABLE TREATMENT PRODUCTS:
${productsInfo}

Please generate a treatment plan in the following JSON format:
{
  "title": "Descriptive title for the treatment plan",
  "description": "Comprehensive description of the treatment approach",
  "severity": "low|medium|high",
  "estimatedDuration": number_of_days,
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed step description",
      "treatmentType": "chemical|organic|cultural|biological",
      "productName": "Product name if applicable",
      "activeIngredient": "Active ingredient if applicable",
      "dosage": "Specific dosage instructions",
      "applicationMethod": "How to apply",
      "frequency": "How often to apply",
      "duration": number_of_applications,
      "safetyNotes": "Safety considerations",
      "cost": cost_per_application,
      "costUnit": "USD",
      "timing": "When to apply (e.g., early morning, evening)",
      "weatherConditions": "Weather requirements if any"
    }
  ],
  "recommendations": ["Additional recommendations"],
  "warnings": ["Important warnings"],
  "costEstimate": {
    "total": total_cost,
    "currency": "USD",
    "breakdown": ["Cost breakdown items"]
  }
}

Consider the following:
1. Match products to the detected disease and plant type
2. Consider severity based on health score and disease probability
3. Provide cultural practices alongside chemical treatments
4. Include safety considerations and environmental impact
5. Consider local climate and growing conditions
6. Respect user preferences for organic options
7. Provide cost-effective solutions within budget constraints
8. Include timing and weather considerations
9. Suggest preventive measures for future outbreaks`;
  }

  private validateAndEnhancePlan(
    aiPlan: AITreatmentPlan,
    analysis: PlantAnalysis,
    availableProducts: TreatmentProduct[]
  ): AITreatmentPlan {
    // Validate severity
    if (!["low", "medium", "high"].includes(aiPlan.severity)) {
      aiPlan.severity = this.calculateSeverity(analysis);
    }

    // Validate duration
    if (!aiPlan.estimatedDuration || aiPlan.estimatedDuration < 1) {
      aiPlan.estimatedDuration = this.calculateDuration(analysis);
    }

    // Enhance steps with product information
    aiPlan.steps = aiPlan.steps.map((step, index) => {
      const enhancedStep = { ...step, stepNumber: index + 1 };

      // Match with available products if product name is provided
      if (step.productName) {
        const matchedProduct = availableProducts.find(
          (p) =>
            p.name.toLowerCase().includes(step.productName!.toLowerCase()) ||
            step.productName!.toLowerCase().includes(p.name.toLowerCase())
        );

        if (matchedProduct) {
          enhancedStep.activeIngredient =
            matchedProduct.activeIngredient ?? undefined;
          enhancedStep.dosage =
            step.dosage ||
            matchedProduct.applicationRate ||
            "Follow manufacturer instructions";
          enhancedStep.cost =
            step.cost ||
            (matchedProduct.price ? parseFloat(matchedProduct.price) : 0);
          enhancedStep.costUnit =
            step.costUnit || matchedProduct.priceUnit || "USD";
        }
      }

      return enhancedStep;
    });

    return aiPlan;
  }

  private calculateSeverity(
    analysis: PlantAnalysis
  ): "low" | "medium" | "high" {
    const healthScore = analysis.healthScore || 50;
    const probability = analysis.diseaseProbability
      ? parseFloat(analysis.diseaseProbability.toString())
      : 0.5;

    if (healthScore < 40 || probability > 0.8) return "high";
    if (healthScore < 60 || probability > 0.5) return "medium";
    return "low";
  }

  private calculateDuration(analysis: PlantAnalysis): number {
    const disease = analysis.diseaseDetected?.toLowerCase() || "";

    if (
      disease.includes("blight") ||
      disease.includes("rot") ||
      disease.includes("wilt")
    ) {
      return 21; // 3 weeks for serious diseases
    } else if (
      disease.includes("mildew") ||
      disease.includes("spot") ||
      disease.includes("rust")
    ) {
      return 14; // 2 weeks for fungal issues
    } else if (disease.includes("virus") || disease.includes("mosaic")) {
      return 30; // 4 weeks for viral diseases
    }

    return 14; // Default 2 weeks
  }
}

export const aiTreatmentGenerator = new AITreatmentGenerator();
