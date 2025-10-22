/**
 * Script to add blockchain traceability to existing marketplace listings
 * Usage: node scripts/add-traceability-to-listing.js <listingId> <cropId>
 */

import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Client } = pkg;

async function addTraceabilityToListing(listingId, cropId) {
  console.log(
    `\n🔗 Adding traceability to listing ${listingId} from crop ${cropId}...\n`
  );

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    // Get the crop
    const cropResult = await client.query(
      "SELECT id, name, variety, batch_id, traceability_qr_code, blockchain_tx_id FROM crops WHERE id = $1",
      [cropId]
    );
    const crop = cropResult.rows[0];

    if (!crop) {
      console.error(`❌ Crop ${cropId} not found`);
      process.exit(1);
    }

    console.log(
      `✅ Found crop: ${crop.name} (${crop.variety || "No variety"})`
    );

    // Check if crop has traceability data
    if (!crop.batch_id) {
      console.error(
        `❌ Crop doesn't have a batch ID. Create traceability first!`
      );
      console.log(
        `\nTip: Go to Product Verification page and generate QR code for this crop.`
      );
      await client.end();
      process.exit(1);
    }

    console.log(`✅ Batch ID: ${crop.batch_id}`);
    console.log(`✅ QR Code: ${crop.traceability_qr_code ? "Yes" : "No"}`);
    console.log(`✅ Blockchain TX: ${crop.blockchain_tx_id || "Not yet"}`);

    // Get the listing
    const listingResult = await client.query(
      "SELECT id, title FROM marketplace_listings WHERE id = $1",
      [listingId]
    );
    const listing = listingResult.rows[0];

    if (!listing) {
      console.error(`❌ Listing ${listingId} not found`);
      await client.end();
      process.exit(1);
    }

    console.log(`\n✅ Found listing: ${listing.title}`);

    // Update the listing with traceability data
    await client.query(
      `UPDATE marketplace_listings 
       SET source_crop_id = $1,
           traceability_batch_id = $2,
           traceability_qr_code = $3,
           blockchain_verified = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [
        cropId,
        crop.batch_id,
        crop.traceability_qr_code,
        !!crop.blockchain_tx_id,
        listingId,
      ]
    );

    console.log(`\n✅ Traceability added successfully!`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📝 Listing ID: ${listingId}`);
    console.log(`🌾 Source Crop: ${crop.name}`);
    console.log(`🔗 Batch ID: ${crop.batch_id}`);
    console.log(
      `✅ Blockchain Verified: ${crop.blockchain_tx_id ? "Yes" : "No"}`
    );
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(`🎉 Done! Refresh the listing page to see blockchain info.\n`);

    await client.end();
  } catch (error) {
    console.error(`\n❌ Error:`, error);
    process.exit(1);
  }

  process.exit(0);
}

// Parse command line arguments
const listingId = parseInt(process.argv[2]);
const cropId = parseInt(process.argv[3]);

if (!listingId || isNaN(listingId) || !cropId || isNaN(cropId)) {
  console.error(
    `\n❌ Usage: node scripts/add-traceability-to-listing.js <listingId> <cropId>\n`
  );
  console.log(`Example: node scripts/add-traceability-to-listing.js 5 3\n`);
  console.log(
    `This will link listing #5 to crop #3's blockchain traceability.\n`
  );
  process.exit(1);
}

addTraceabilityToListing(listingId, cropId);
