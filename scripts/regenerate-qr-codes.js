import { db } from "../server/db.js";
import { crops } from "../shared/schema.js";
import { eq, isNotNull } from "drizzle-orm";
import { qrCodeService } from "../server/services/qrcode.js";

async function regenerateQRCodesForExistingCrops() {
  try {
    console.log("🔍 Finding crops with existing QR codes...");

    // Get all crops that have batch IDs (existing QR codes)
    const cropsWithQR = await db
      .select()
      .from(crops)
      .where(isNotNull(crops.batchId));

    console.log(`📊 Found ${cropsWithQR.length} crops with existing QR codes`);

    if (cropsWithQR.length === 0) {
      console.log("✅ No crops with QR codes found!");
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    for (const crop of cropsWithQR) {
      try {
        console.log(
          `🔄 Regenerating QR code for crop: ${crop.name} (ID: ${crop.id}, Batch: ${crop.batchId})`
        );

        // Generate new QR code with correct URL
        const newQrCode = await qrCodeService.generateCropTraceQRCode(
          crop.id,
          crop.batchId
        );

        // Update the crop with the new QR code
        await db
          .update(crops)
          .set({
            traceabilityQrCode: newQrCode,
          })
          .where(eq(crops.id, crop.id));

        console.log(`✅ Successfully regenerated QR code for ${crop.name}`);
        successCount++;
      } catch (error) {
        console.error(
          `❌ Error regenerating QR code for crop ${crop.name}:`,
          error.message
        );
        errorCount++;
      }
    }

    console.log("\n📈 Summary:");
    console.log(`✅ Successfully regenerated: ${successCount} QR codes`);
    console.log(`❌ Failed to regenerate: ${errorCount} QR codes`);
    console.log(`📊 Total processed: ${cropsWithQR.length} crops`);

    if (successCount > 0) {
      console.log(
        "\n🎉 QR codes have been updated with correct production URLs!"
      );
      console.log(
        "📱 New QR codes will now link to: https://greenuppplatform-production.up.railway.app/dashboard/verification"
      );
    }
  } catch (error) {
    console.error("❌ Script failed:", error);
  } finally {
    process.exit(0);
  }
}

// Run the script
regenerateQRCodesForExistingCrops();
