import "dotenv/config";
import { db } from "./server/db.ts";
import { sql } from "drizzle-orm";

async function testFormDataListing() {
  console.log("🧪 Testing FormData marketplace listing creation...\n");

  try {
    // Get a test user ID
    const userResult = await db.execute(sql`
      SELECT id FROM users WHERE email = 'cephaschapa@gmail.com' LIMIT 1
    `);

    if (!userResult.rows.length) {
      console.log("❌ Test user not found. Please create a user first.");
      return;
    }

    const userId = userResult.rows[0].id;
    console.log(`✅ Using test user ID: ${userId}`);

    // Test data that simulates what FormData would send
    const testFormData = {
      title: "Test Organic Maize",
      description:
        "High-quality organic maize grown without pesticides. Perfect for consumption or processing.",
      category: "grains",
      subcategory: "maize",
      price: "150.00",
      priceCurrency: "ZMW",
      priceUnit: "kg",
      quantity: "100.00",
      quantityUnit: "kg",
      condition: "new",
      contactPhone: "+260 9XX XXX XXX",
      deliveryAvailable: "true", // FormData sends strings
      isNegotiable: "true", // FormData sends strings
      status: "active",
      tags: ["organic", "maize", "fresh"], // This would be sent as tags[] in FormData
      images: [
        "http://localhost:3001/uploads/test-image-1.jpg",
        "http://localhost:3001/uploads/test-image-2.jpg",
      ], // Simulated uploaded file URLs
    };

    console.log("📝 Test FormData:", testFormData);

    // Insert the test listing
    const insertResult = await db.execute(sql`
      INSERT INTO marketplace_listings (
        seller_id, title, description, category, subcategory, 
        price, price_currency, price_unit, quantity, quantity_unit,
        condition, contact_phone, delivery_available, is_negotiable,
        status, images, tags
      ) VALUES (
        ${testFormData.sellerId || userId}, ${testFormData.title}, ${
      testFormData.description
    },
        ${testFormData.category}, ${testFormData.subcategory}, ${
      testFormData.price
    },
        ${testFormData.priceCurrency}, ${testFormData.priceUnit}, ${
      testFormData.quantity
    },
        ${testFormData.quantityUnit}, ${testFormData.condition}, ${
      testFormData.contactPhone
    },
        ${testFormData.deliveryAvailable === "true"}, ${
      testFormData.isNegotiable === "true"
    }, ${testFormData.status},
        ${testFormData.images}, ${testFormData.tags}
      ) RETURNING id, title, price, status, images, tags
    `);

    const newListing = insertResult.rows[0];
    console.log("✅ Test FormData listing created successfully!");
    console.log(`   ID: ${newListing.id}`);
    console.log(`   Title: ${newListing.title}`);
    console.log(`   Price: ${newListing.price}`);
    console.log(`   Status: ${newListing.status}`);
    console.log(`   Images: ${JSON.stringify(newListing.images)}`);
    console.log(`   Tags: ${JSON.stringify(newListing.tags)}`);

    // Verify the listing was created
    const verifyResult = await db.execute(sql`
      SELECT id, title, description, category, price, status, images, tags
      FROM marketplace_listings 
      WHERE id = ${newListing.id}
    `);

    if (verifyResult.rows.length > 0) {
      console.log("\n✅ FormData listing verification successful!");
      console.log("   Full listing data:", verifyResult.rows[0]);
    } else {
      console.log("\n❌ FormData listing verification failed!");
    }
  } catch (error) {
    console.error("❌ Error testing FormData marketplace listing:", error);
  }
}

testFormDataListing();
