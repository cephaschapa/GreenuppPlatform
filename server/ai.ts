import OpenAI from "openai";
import { InsertCropYieldPrediction, InsertPlantingRecommendation, WeatherHistory } from "@shared/schema";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = "gpt-4o";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface for weather planting recommendation request
 */
interface PlantingRecommendationRequest {
  userId: number;
  location: string;
  cropType: string;
  weatherHistory: WeatherHistory[];
  soilType?: string;
  fieldSize?: number | string;
}

interface CropData {
  cropId: number;
  cropType: string;
  plantingDate?: string | Date | null;
  harvestDate?: string | Date | null;
  fieldSize?: number | string | null;
  fieldLocation?: string | null;
  soilType?: string | null;
  climate?: string | null;
  irrigation?: string | null;
  fertilizers?: string | null;
}

/**
 * Generate a crop yield prediction using OpenAI
 */
export async function generateCropYieldPrediction(data: CropData): Promise<InsertCropYieldPrediction> {
  try {
    // Format data for prompt
    const formattedData = {
      cropType: data.cropType,
      plantingDate: data.plantingDate ? new Date(data.plantingDate).toISOString().split('T')[0] : 'unknown',
      harvestDate: data.harvestDate ? new Date(data.harvestDate).toISOString().split('T')[0] : 'unknown',
      fieldSize: data.fieldSize || 'unknown',
      fieldLocation: data.fieldLocation || 'unknown',
      soilType: data.soilType || 'unknown',
      climate: data.climate || 'unknown',
      irrigation: data.irrigation || 'unknown',
      fertilizers: data.fertilizers || 'unknown',
    };

    // Create AI prompt
    const prompt = `
      I need a crop yield prediction based on the following data:
      
      Crop Type: ${formattedData.cropType}
      Planting Date: ${formattedData.plantingDate}
      Expected Harvest Date: ${formattedData.harvestDate}
      Field Size: ${formattedData.fieldSize}
      Field Location: ${formattedData.fieldLocation}
      Soil Type: ${formattedData.soilType}
      Climate: ${formattedData.climate}
      Irrigation: ${formattedData.irrigation}
      Fertilizers: ${formattedData.fertilizers}
      
      Based on agricultural science and the data provided, please predict:
      1. The expected yield in tons per hectare for this crop
      2. A confidence level for this prediction (0-1 scale)
      3. List the factors you considered in making this prediction
      
      Respond with JSON in this format:
      {
        "predictedYield": "number as string",
        "yieldUnit": "tons",
        "confidenceLevel": "number as string between 0 and 1",
        "factorsConsidered": {
          "key factors": "values and reasoning"
        }
      }
    `;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an agricultural expert specialized in crop yield prediction." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // More deterministic results
    });

    // Parse response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Format response in the expected shape for our database
    return {
      cropId: data.cropId,
      predictedYield: result.predictedYield || null,
      yieldUnit: result.yieldUnit || "tons",
      confidenceLevel: result.confidenceLevel || null,
      // Note: our database schema defines factorsConsidered as a generic Record<string, any>
      // so we can just pass the JSON object directly
      factorsConsidered: result.factorsConsidered || {},
    };
  } catch (error) {
    console.error("Error generating AI crop yield prediction:", error);
    
    // Return a fallback prediction if AI fails
    return {
      cropId: data.cropId,
      predictedYield: null,
      yieldUnit: "tons",
      confidenceLevel: null,
      factorsConsidered: {
        error: "Failed to generate AI prediction. Please try again later."
      },
    };
  }
}

/**
 * Generate planting recommendations based on historical weather data
 */
export async function generatePlantingRecommendations(data: PlantingRecommendationRequest): Promise<InsertPlantingRecommendation> {
  try {
    // Format historical weather data for the prompt
    const weatherSummary = data.weatherHistory.map(record => ({
      date: new Date(record.date).toISOString().split('T')[0],
      temperature: record.temperature,
      precipitation: record.precipitation,
      humidity: record.humidity,
      windSpeed: record.windSpeed,
      conditions: record.conditions
    }));

    // Create AI prompt with weather history and crop information
    const prompt = `
      I need a planting recommendation based on historical weather data for growing ${data.cropType} in ${data.location}.
      
      Additional information:
      Soil Type: ${data.soilType || 'Unknown'}
      Field Size: ${data.fieldSize || 'Unknown'}
      
      Historical weather data for this location:
      ${JSON.stringify(weatherSummary, null, 2)}
      
      Based on agricultural science and the historical weather patterns provided:
      1. Recommend an optimal planting window (start and end dates) for ${data.cropType} in this location
      2. Provide a confidence level for this recommendation (0-1 scale)
      3. Explain the key weather factors that influenced this recommendation
      
      Respond with JSON in this format:
      {
        "recommendedStartDate": "YYYY-MM-DD",
        "recommendedEndDate": "YYYY-MM-DD",
        "confidenceLevel": "number between 0 and 1 as string",
        "reasonsConsidered": {
          "key factors": "explanation of how each factor influenced the recommendation"
        }
      }
    `;

    // Call OpenAI
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { 
          role: "system", 
          content: "You are an agricultural weather expert who analyzes historical weather patterns to recommend ideal planting times for crops."
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // More deterministic for date recommendations
    });

    // Parse response
    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Format response for database
    return {
      userId: data.userId,
      location: data.location,
      cropType: data.cropType,
      recommendedStartDate: result.recommendedStartDate || null,
      recommendedEndDate: result.recommendedEndDate || null,
      confidenceLevel: result.confidenceLevel || null,
      reasonsConsidered: result.reasonsConsidered || {},
    };
  } catch (error) {
    console.error("Error generating AI planting recommendations:", error);
    
    // Return a basic recommendation if AI fails
    return {
      userId: data.userId,
      location: data.location,
      cropType: data.cropType,
      recommendedStartDate: null,
      recommendedEndDate: null,
      confidenceLevel: null,
      reasonsConsidered: {
        error: "Failed to generate AI planting recommendations. Please try again later."
      },
    };
  }
}