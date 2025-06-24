import { db } from "../server/db.js";
import { crops } from "../shared/schema.js";
import { isNull } from "drizzle-orm";
import { cropTraceService } from "../server/services/croptrace.js";

async function generateQRCodesForExistingCrops() {
  try {
    console.log("🔍 Finding crops without QR codes...");

    // Get all crops that don't have batch IDs (QR codes)
    const cropsWithoutQR = await db
      .select()
      .from(crops)
      .where(isNull(crops.batchId));

    console.log(`📊 Found ${cropsWithoutQR.length} crops without QR codes`);

    if (cropsWithoutQR.length === 0) {
      console.log("✅ All crops already have QR codes!");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const crop of cropsWithoutQR) {
      try {
        console.log(
          `🔄 Generating QR code for crop: ${crop.name} (ID: ${crop.id})`
        );

        // Initialize traceability for this crop
        const result = await cropTraceService.initializeCropTraceability(
          crop.id,
          {
            name: crop.name,
            variety: crop.variety,
            status: crop.status,
          }
        );

        if (result.batchId) {
          console.log(
            `✅ Successfully generated QR code for ${crop.name} - Batch ID: ${result.batchId}`
          );
          successCount++;
        } else {
          console.log(`❌ Failed to generate QR code for ${crop.name}`);
          errorCount++;
        }
      } catch (error) {
        console.error(
          `❌ Error generating QR code for crop ${crop.name}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log("\n📈 Summary:");
    console.log(`✅ Successfully generated: ${successCount} QR codes`);
    console.log(`❌ Failed to generate: ${errorCount} QR codes`);
    console.log(`📊 Total processed: ${cropsWithoutQR.length} crops`);
  } catch (error) {
    console.error("❌ Script failed:", error);
  } finally {
    process.exit(0);
  }
}

// Run the script
generateQRCodesForExistingCrops();
