import OpenAI from "openai";
import { InsertPlantAnalysis } from "@shared/schema";
import { Readable } from "stream";
import { db } from "../db";
import { plantAnalyses } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { logger } from "../lib/logger";
import { ValidationError, NotFoundError } from "../lib/errors";
import { insertPlantAnalysisSchema } from "@shared/schema";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user

interface AnalysisResult {
  disease: {
    name: string; // Can be disease name, pest name, or insect name
    confidence: number; // 0-100
    description: string;
  } | null;
  health: {
    status: "healthy" | "minor issues" | "moderate issues" | "severe issues";
    score: number; // 0-100
  };
  nutrients: {
    deficiencies: string[];
    excess: string[];
  };
  recommendations: string[];
  additionalObservations: string[];
}

/**
 * Convert buffer to/from base64 encoded string
 */
const base64Encode = (img: Buffer): string =>
  Buffer.from(img).toString("base64");
const base64Decode = (base64: string): Buffer => Buffer.from(base64, "base64");

/**
 * Convert Buffer to Readable stream
 */
const bufferToStream = (buffer: Buffer): Readable => {
  const stream = Readable.from(buffer);
  return stream;
};

/**
 * Convert readable stream to Buffer
 */
const streamToBuffer = (stream: Readable): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const buffers: Buffer[] = [];
    stream.on("error", reject);
    stream.on("data", (data) => buffers.push(data));
    stream.on("end", () => resolve(Buffer.concat(buffers)));
  });

/**
 * Detect image format from base64 data
 */
function detectImageFormat(base64Data: string): string {
  console.log("Detecting format for base64 data length:", base64Data.length);

  // Check the first few bytes to determine format
  const buffer = Buffer.from(base64Data, "base64");
  console.log("Buffer length:", buffer.length);
  console.log(
    "First 12 bytes:",
    Array.from(buffer.slice(0, 12))
      .map((b) => `0x${b.toString(16).padStart(2, "0")}`)
      .join(" ")
  );

  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    console.log("Detected: PNG");
    return "png";
  }

  // JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    console.log("Detected: JPEG");
    return "jpeg";
  }

  // GIF signature: 47 49 46 38 (GIF8)
  if (
    buffer[0] === 0x47 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x38
  ) {
    console.log("Detected: GIF");
    return "gif";
  }

  // WebP signature: 52 49 46 46 ... 57 45 42 50 (RIFF....WEBP)
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    console.log("Detected: WebP");
    return "webp";
  }

  console.log("Could not detect format, defaulting to JPEG");
  return "jpeg";
}

/**
 * Extract base64 data from a data URL
 * @param dataUrl The data URL (e.g., "data:image/jpeg;base64,/9j/4AAQ...")
 * @returns The base64 string without the data URL prefix
 */
function extractBase64FromDataUrl(dataUrl: string): string {
  console.log("Extracting from data URL, length:", dataUrl.length);
  console.log("Data URL starts with:", `${dataUrl.substring(0, 100)}...`);

  // Check if it's already a base64 string (no data: prefix)
  if (!dataUrl.startsWith("data:")) {
    console.log("No data: prefix found, treating as raw base64");
    return dataUrl;
  }

  // Extract base64 from data URL
  const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (!base64Match) {
    throw new Error("Invalid data URL format");
  }

  console.log("Extracted base64 data length:", base64Match[1].length);
  return base64Match[1];
}

/**
 * Convert and validate image for OpenAI API
 * This function handles image format detection, validation, and conversion
 */
function convertImageForOpenAI(imageData: string): {
  base64Data: string;
  format: string;
  dataUrl: string;
} {
  console.log("=== Starting image conversion for OpenAI ===");
  console.log("Input imageData type:", typeof imageData);
  console.log("Input imageData length:", imageData.length);
  console.log(
    "Input imageData starts with:",
    `${imageData.substring(0, 100)}...`
  );

  try {
    // Check if it's a blob URL (which we shouldn't receive anymore)
    if (imageData.startsWith("blob:")) {
      throw new Error(
        "Blob URLs are not supported. Please upload the actual image data."
      );
    }

    // Extract base64 data from data URL if needed
    const base64Data = extractBase64FromDataUrl(imageData);
    console.log("Extracted base64 data length:", base64Data.length);

    // Validate base64 data
    if (!base64Data || base64Data.length === 0) {
      throw new Error("Invalid or empty image data");
    }

    // Validate that the base64 data is actually valid
    try {
      Buffer.from(base64Data, "base64");
    } catch {
      throw new Error("Invalid base64 data format");
    }

    // Detect image format from the actual data
    const imageFormat = detectImageFormat(base64Data);
    console.log(`Final detected format: ${imageFormat}`);

    // Validate that the format is supported by OpenAI
    const supportedFormats = ["png", "jpeg", "gif", "webp"];
    if (!supportedFormats.includes(imageFormat)) {
      throw new Error(
        `Unsupported image format: ${imageFormat}. Supported formats: ${supportedFormats.join(
          ", "
        )}`
      );
    }

    // Create the proper data URL for OpenAI
    const dataUrl = `data:image/${imageFormat};base64,${base64Data}`;
    console.log("Generated data URL length:", dataUrl.length);
    console.log("Data URL starts with:", `${dataUrl.substring(0, 100)}...`);

    return {
      base64Data,
      format: imageFormat,
      dataUrl: base64Data, // Return just the base64 data for OpenAI
    };
  } catch (error) {
    console.error("Error converting image for OpenAI:", error);
    throw new Error(
      `Image conversion failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

/**
 * Analyze a plant image for diseases, pests, insects, health, and nutrient issues
 * @param imageData The image data (can be base64 string or data URL)
 * @param plantType Optional plant type to provide context to the AI
 * @param additionalNotes Any additional notes or context about the plant
 * @returns Structured analysis of the plant's condition including pest identification
 */
export async function analyzePlantImage(
  imageData: string,
  plantType?: string,
  additionalNotes?: string
): Promise<AnalysisResult> {
  try {
    // Convert and validate the image
    const { dataUrl: base64Data, format } = convertImageForOpenAI(imageData);

    // Construct prompt with any context provided
    let contextPrompt =
      "Analyze this plant image for diseases, pests, insects, health issues, and nutrient deficiencies. Pay special attention to identifying any visible insects, larvae, caterpillars, or pest damage on the plant.";

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
        "name": "Disease, pest, or insect name (e.g., 'Fall Armyworm', 'Army Worm', 'Aphids', 'Bacterial Wilt') or null if none detected",
        "confidence": "Number between 0-100 indicating confidence in the diagnosis",
        "description": "Brief description of the disease, pest, or insect if detected, including visible symptoms or damage patterns"
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

    // Call OpenAI API with the image using the proper data URL format
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an expert agricultural plant pathologist and entomologist specializing in crop disease identification, pest identification, and treatment. Provide accurate, scientific diagnoses based on visual evidence. Pay special attention to identifying insects, larvae, caterpillars, and other pests that may be visible in the image, including army worms, fall armyworms, aphids, and other common agricultural pests.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: contextPrompt,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/${format};base64,${base64Data}`, // Send proper data URL format
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Parse the response to get structured data
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content received from OpenAI");
    }

    const analysisResult: AnalysisResult = JSON.parse(content);

    // Ensure the response format is valid
    return validateAndNormalizeResponse(analysisResult);
  } catch (error) {
    console.error("Error analyzing plant image:", error);
    throw new Error("Failed to analyze plant image. Please try again later.");
  }
}

/**
 * Create a plant analysis record for storage in the database
 */
export function createPlantAnalysis(
  imageData: string,
  analysis: AnalysisResult,
  userId: number,
  plantType?: string,
  fieldId?: number,
  cropId?: number,
  notes?: string
): InsertPlantAnalysis {
  // Extract base64 data for storage
  const base64Data = extractBase64FromDataUrl(imageData);

  return {
    userId,
    imageData: base64Data,
    plantType: plantType || "Unknown",
    fieldId,
    cropId,
    analysisDate: new Date(),
    diseaseDetected: analysis.disease?.name || null,
    diseaseProbability: analysis.disease?.confidence
      ? analysis.disease.confidence.toString()
      : null,
    diseaseDescription: analysis.disease?.description || null,
    healthStatus: analysis.health.status,
    healthScore: analysis.health.score,
    nutrientDeficiencies: analysis.nutrients.deficiencies.join(", "),
    nutrientExcess: analysis.nutrients.excess.join(", "),
    recommendations: analysis.recommendations.join("\n"),
    additionalObservations: analysis.additionalObservations.join("\n"),
    notes: notes || null,
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
      status: analysis.health?.status || "healthy",
      score: analysis.health?.score || 100,
    },
    nutrients: {
      deficiencies: analysis.nutrients?.deficiencies || [],
      excess: analysis.nutrients?.excess || [],
    },
    recommendations: analysis.recommendations || [],
    additionalObservations: analysis.additionalObservations || [],
  };

  // Ensure numeric values are numbers
  if (normalizedAnalysis.disease) {
    normalizedAnalysis.disease.confidence = Number(
      normalizedAnalysis.disease.confidence
    );
  }

  normalizedAnalysis.health.score = Number(normalizedAnalysis.health.score);

  return normalizedAnalysis;
}
