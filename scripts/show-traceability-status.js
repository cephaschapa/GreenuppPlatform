/**
 * Show which crops have traceability and which listings can be linked
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

async function showStatus() {
  console.log("\n📊 Traceability Status Report\n");

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  // Get all crops with traceability
  const cropsResult = await client.query(
    "SELECT id, name, variety, batch_id, traceability_qr_code, blockchain_tx_id FROM crops WHERE batch_id IS NOT NULL"
  );
  const cropsWithTrace = cropsResult.rows;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🌾 CROPS WITH BLOCKCHAIN TRACEABILITY:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (cropsWithTrace.length === 0) {
    console.log("❌ No crops have traceability yet.\n");
    console.log("To add traceability:");
    console.log("1. Go to Product Verification page");
    console.log("2. Open crop details");
    console.log("3. Generate QR code\n");
  } else {
    cropsWithTrace.forEach((crop) => {
      console.log(`  ID: ${crop.id}`);
      console.log(`  Name: ${crop.name} (${crop.variety || "No variety"})`);
      console.log(`  Batch: ${crop.batch_id}`);
      console.log(`  QR Code: ${crop.traceability_qr_code ? "✅" : "❌"}`);
      console.log(`  Blockchain: ${crop.blockchain_tx_id ? "✅" : "❌"}`);
      console.log(``);
    });
  }

  // Get all marketplace listings
  const listingsResult = await client.query(
    "SELECT id, title, price, price_currency, traceability_batch_id, blockchain_verified FROM marketplace_listings"
  );
  const allListings = listingsResult.rows;

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🛒 MARKETPLACE LISTINGS:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (allListings.length === 0) {
    console.log("❌ No marketplace listings yet.\n");
  } else {
    const listingsWithTrace = allListings.filter(
      (l) => l.traceability_batch_id
    );
    const listingsWithoutTrace = allListings.filter(
      (l) => !l.traceability_batch_id
    );

    if (listingsWithTrace.length > 0) {
      console.log("✅ WITH TRACEABILITY:\n");
      listingsWithTrace.forEach((listing) => {
        console.log(`  ID: ${listing.id}`);
        console.log(`  Title: ${listing.title}`);
        console.log(`  Batch: ${listing.traceability_batch_id}`);
        console.log(`  Verified: ${listing.blockchain_verified ? "✅" : "⏳"}`);
        console.log(``);
      });
    }

    if (listingsWithoutTrace.length > 0) {
      console.log("❌ WITHOUT TRACEABILITY:\n");
      listingsWithoutTrace.forEach((listing) => {
        console.log(`  ID: ${listing.id}`);
        console.log(`  Title: ${listing.title}`);
        console.log(`  Price: ${listing.price_currency} ${listing.price}`);
        console.log(`  → Can be linked to crops above`);
        console.log(``);
      });

      console.log("\n💡 To add traceability to these listings:");
      console.log(
        `node scripts/add-traceability-to-listing.js <listingId> <cropId>\n`
      );

      if (cropsWithTrace.length > 0) {
        console.log(`Example:`);
        console.log(
          `node scripts/add-traceability-to-listing.js ${listingsWithoutTrace[0].id} ${cropsWithTrace[0].id}\n`
        );
      }
    }
  }

  await client.end();
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

showStatus().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
