import OpenAI from 'openai';
import { InsertPlantAnalysis } from '@shared/schema';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface AnalysisResult {
  disease: {
    name: string;
    confidence: number;  // 0-100
    description: string;
  } | null;
  health: {
    status: 'healthy' | 'minor issues' | 'moderate issues' | 'severe issues';
    score: number;  // 0-100
  };
  nutrients: {
    deficiencies: string[];
    excess: string[];
  };
  recommendations: string[];
  additionalObservations: string[];
}

/**
 * Analyze a plant image for disease, health, and nutrient issues
 * @param imageBase64 The base64-encoded image data
 * @param plantType Optional plant type to provide context to the AI
 * @param additionalNotes Any additional notes or context about the plant
 * @returns Structured analysis of the plant's condition
 */
export async function analyzePlantImage(
  imageBase64: string,
  plantType?: string,
  additionalNotes?: string
): Promise<AnalysisResult> {
  try {
    // Construct prompt with any context provided
    let contextPrompt = "Analyze this plant image for diseases, health issues, and nutrient deficiencies.";
    
    if (plantType) {
      contextPrompt += ` This is a ${plantType} plant.`;
    }
    
    if (additionalNotes) {
      contextPrompt += ` Additional context: ${additionalNotes}`;
    }
    
    // Define expected structured output for clarity
    contextPrompt += ` 
    Respond with a detailed assessment in the following JSON format only:
    {
      "disease": {
        "name": "Disease name or null if none detected",
        "confidence": "Number between 0-100 indicating confidence in the diagnosis",
        "description": "Brief description of the disease if detected"
      },
      "health": {
        "status": "One of: healthy, minor issues, moderate issues, severe issues",
        "score": "Health score from 0-100"
      },
      "nutrients": {
        "deficiencies": ["List of potential nutrient deficiencies"],
        "excess": ["List of potential nutrient excesses"]
      },
      "recommendations": ["List of actionable recommendations for the farmer"],
      "additionalObservations": ["Any other notable observations"]
    }`;

    // Call OpenAI API with the image
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert agricultural plant pathologist specializing in crop disease identification and treatment. Provide accurate, scientific diagnoses based on visual evidence."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: contextPrompt
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Parse the response to get structured data
    const analysisResult: AnalysisResult = JSON.parse(response.choices[0].message.content);
    
    // Ensure the response format is valid
    return validateAndNormalizeResponse(analysisResult);
  } catch (error) {
    console.error('Error analyzing plant image:', error);
    throw new Error('Failed to analyze plant image. Please try again later.');
  }
}

/**
 * Create a plant analysis record for storage in the database
 */
export function createPlantAnalysis(
  imageBase64: string,
  analysis: AnalysisResult,
  userId: number,
  plantType?: string,
  fieldId?: number,
  cropId?: number,
  notes?: string
): InsertPlantAnalysis {
  return {
    userId,
    imageData: imageBase64,
    plantType: plantType || 'Unknown',
    fieldId,
    cropId,
    analysisDate: new Date(),
    diseaseDetected: analysis.disease?.name || null,
    diseaseProbability: analysis.disease?.confidence || 0,
    diseaseDescription: analysis.disease?.description || null,
    healthStatus: analysis.health.status,
    healthScore: analysis.health.score,
    nutrientDeficiencies: analysis.nutrients.deficiencies.join(', '),
    nutrientExcess: analysis.nutrients.excess.join(', '),
    recommendations: analysis.recommendations.join('\n'),
    additionalObservations: analysis.additionalObservations.join('\n'),
    notes: notes || null
  };
}

/**
 * Validate and normalize the AI response to ensure it matches expected format
 */
function validateAndNormalizeResponse(analysis: any): AnalysisResult {
  // Create default values for any missing fields
  const normalizedAnalysis: AnalysisResult = {
    disease: analysis.disease || null,
    health: {
      status: analysis.health?.status || 'healthy',
      score: analysis.health?.score || 100
    },
    nutrients: {
      deficiencies: analysis.nutrients?.deficiencies || [],
      excess: analysis.nutrients?.excess || []
    },
    recommendations: analysis.recommendations || [],
    additionalObservations: analysis.additionalObservations || []
  };

  // Ensure numeric values are numbers
  if (normalizedAnalysis.disease) {
    normalizedAnalysis.disease.confidence = Number(normalizedAnalysis.disease.confidence);
  }
  
  normalizedAnalysis.health.score = Number(normalizedAnalysis.health.score);

  return normalizedAnalysis;
}