const { Client } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

console.log("🌱 Seeding crop varieties database...\n");

const cropData = [
  {
    name: "Maize (Corn)",
    variety: "Hybrid",
    tempMin: 18,
    tempOptimal: 24,
    tempMax: 32,
    growingDaysMin: 60,
    growingDaysMax: 100,
    waterRequirement: "Medium",
    soilTypes: ["Loam", "Sandy Loam"],
    soilPhMin: 5.8,
    soilPhMax: 7.0,
    plantingSeasons: ["Spring", "Summer"],
    description: "Versatile hybrid maize suitable for various climates",
    region: "Global",
    expectedYieldMin: 3.5,
    expectedYieldMax: 8.0,
  },
  {
    name: "Maize (Corn)",
    variety: "Sweet Corn",
    tempMin: 18,
    tempOptimal: 24,
    tempMax: 30,
    growingDaysMin: 60,
    growingDaysMax: 90,
    waterRequirement: "Medium",
    soilTypes: ["Loam", "Sandy Loam"],
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    plantingSeasons: ["Spring", "Summer"],
    description: "Sweet corn for fresh consumption",
    region: "Global",
    expectedYieldMin: 2.0,
    expectedYieldMax: 5.0,
  },
  {
    name: "Maize (Corn)",
    variety: "MM603 (Zambia)",
    tempMin: 18,
    tempOptimal: 24,
    tempMax: 32,
    growingDaysMin: 120,
    growingDaysMax: 140,
    waterRequirement: "Medium",
    soilTypes: ["Loam", "Sandy Loam"],
    soilPhMin: 5.8,
    soilPhMax: 6.8,
    plantingSeasons: ["Summer"],
    description: "Popular Zambian maize variety (medium maturing)",
    region: "Zambia",
    expectedYieldMin: 4.0,
    expectedYieldMax: 7.0,
  },
  {
    name: "Wheat",
    variety: "Spring Wheat",
    tempMin: 10,
    tempOptimal: 18,
    tempMax: 30,
    growingDaysMin: 90,
    growingDaysMax: 120,
    waterRequirement: "Low",
    soilTypes: ["Clay Loam", "Silt Loam", "Loam"],
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    plantingSeasons: ["Spring"],
    description: "Wheat planted in spring for summer harvest",
    region: "Temperate",
    expectedYieldMin: 2.5,
    expectedYieldMax: 6.0,
  },
  {
    name: "Rice",
    variety: "Long Grain",
    tempMin: 20,
    tempOptimal: 30,
    tempMax: 35,
    growingDaysMin: 90,
    growingDaysMax: 150,
    waterRequirement: "High",
    soilTypes: ["Clay", "Clay Loam"],
    soilPhMin: 5.5,
    soilPhMax: 6.5,
    plantingSeasons: ["Spring", "Summer"],
    description: "Popular long grain rice variety",
    region: "Tropical",
    expectedYieldMin: 4.0,
    expectedYieldMax: 8.0,
  },
  {
    name: "Potato",
    variety: "White",
    tempMin: 10,
    tempOptimal: 18,
    tempMax: 25,
    growingDaysMin: 75,
    growingDaysMax: 110,
    waterRequirement: "Medium",
    soilTypes: ["Sandy Loam", "Loam"],
    soilPhMin: 5.0,
    soilPhMax: 6.5,
    plantingSeasons: ["Spring", "Fall"],
    description: "White potatoes for general use",
    region: "Temperate",
    expectedYieldMin: 20,
    expectedYieldMax: 42,
  },
  {
    name: "Soybean",
    variety: "Mid Maturity",
    tempMin: 15,
    tempOptimal: 25,
    tempMax: 30,
    growingDaysMin: 100,
    growingDaysMax: 115,
    waterRequirement: "Medium",
    soilTypes: ["Loam", "Clay Loam", "Silt Loam"],
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    plantingSeasons: ["Spring", "Summer"],
    description: "Standard soybean variety",
    region: "Global",
    expectedYieldMin: 2.5,
    expectedYieldMax: 4.5,
  },
  {
    name: "Tomato",
    variety: "Roma",
    tempMin: 16,
    tempOptimal: 25,
    tempMax: 30,
    growingDaysMin: 75,
    growingDaysMax: 100,
    waterRequirement: "Medium",
    soilTypes: ["Loam", "Sandy Loam"],
    soilPhMin: 6.0,
    soilPhMax: 6.8,
    plantingSeasons: ["Spring", "Summer"],
    description: "Paste tomatoes for processing",
    region: "Global",
    expectedYieldMin: 20,
    expectedYieldMax: 40,
  },
  {
    name: "Groundnuts (Peanuts)",
    variety: "Chalimbana",
    tempMin: 20,
    tempOptimal: 28,
    tempMax: 35,
    growingDaysMin: 90,
    growingDaysMax: 120,
    waterRequirement: "Low",
    soilTypes: ["Sandy Loam", "Loam"],
    soilPhMin: 5.5,
    soilPhMax: 6.8,
    plantingSeasons: ["Summer"],
    description: "Zambian groundnut variety",
    region: "Zambia",
    expectedYieldMin: 1.5,
    expectedYieldMax: 3.0,
  },
  {
    name: "Sweet Potato",
    variety: "Zambian Orange",
    tempMin: 18,
    tempOptimal: 25,
    tempMax: 32,
    growingDaysMin: 90,
    growingDaysMax: 150,
    waterRequirement: "Low",
    soilTypes: ["Sandy Loam", "Loam"],
    soilPhMin: 5.5,
    soilPhMax: 6.5,
    plantingSeasons: ["Summer"],
    description: "Orange-fleshed sweet potato",
    region: "Zambia",
    expectedYieldMin: 10,
    expectedYieldMax: 25,
  },
  {
    name: "Cassava",
    variety: "Mweru",
    tempMin: 20,
    tempOptimal: 28,
    tempMax: 35,
    growingDaysMin: 270,
    growingDaysMax: 365,
    waterRequirement: "Low",
    soilTypes: ["Sandy Loam", "Loam"],
    soilPhMin: 5.5,
    soilPhMax: 7.0,
    plantingSeasons: ["Summer"],
    description: "Drought-tolerant cassava variety",
    region: "Zambia",
    expectedYieldMin: 8,
    expectedYieldMax: 20,
  },
  {
    name: "Sorghum",
    variety: "MMSH375",
    tempMin: 15,
    tempOptimal: 28,
    tempMax: 40,
    growingDaysMin: 100,
    growingDaysMax: 140,
    waterRequirement: "Low",
    soilTypes: ["Sandy Loam", "Clay Loam"],
    soilPhMin: 5.5,
    soilPhMax: 7.5,
    plantingSeasons: ["Summer"],
    description: "Drought-resistant sorghum",
    region: "Zambia",
    expectedYieldMin: 1.5,
    expectedYieldMax: 4.0,
  },
  {
    name: "Sunflower",
    variety: "Open Pollinated",
    tempMin: 18,
    tempOptimal: 26,
    tempMax: 32,
    growingDaysMin: 90,
    growingDaysMax: 120,
    waterRequirement: "Low",
    soilTypes: ["Loam", "Sandy Loam"],
    soilPhMin: 6.0,
    soilPhMax: 7.5,
    plantingSeasons: ["Summer"],
    description: "Oilseed sunflower for Zambia",
    region: "Zambia",
    expectedYieldMin: 1.0,
    expectedYieldMax: 2.5,
  },
  {
    name: "Common Bean",
    variety: "Red / Speckled",
    tempMin: 18,
    tempOptimal: 24,
    tempMax: 30,
    growingDaysMin: 70,
    growingDaysMax: 90,
    waterRequirement: "Medium",
    soilTypes: ["Loam", "Sandy Loam"],
    soilPhMin: 6.0,
    soilPhMax: 7.0,
    plantingSeasons: ["Summer", "Rainy"],
    description: "Common beans for grain or green",
    region: "Zambia",
    expectedYieldMin: 0.8,
    expectedYieldMax: 2.0,
  },
  {
    name: "Cotton",
    variety: "Upland",
    tempMin: 20,
    tempOptimal: 28,
    tempMax: 35,
    growingDaysMin: 150,
    growingDaysMax: 180,
    waterRequirement: "Medium",
    soilTypes: ["Loam", "Clay Loam"],
    soilPhMin: 5.5,
    soilPhMax: 7.0,
    plantingSeasons: ["Summer"],
    description: "Upland cotton for lint",
    region: "Zambia",
    expectedYieldMin: 0.5,
    expectedYieldMax: 1.5,
  },
];

async function seedCropVarieties() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log("✓ Connected to database\n");

    // Check if data already exists
    const checkResult = await client.query(
      "SELECT COUNT(*) FROM crop_varieties"
    );
    const count = parseInt(checkResult.rows[0].count);

    if (count > 0) {
      console.log(`⚠️  Found ${count} existing crop varieties. Skipping seed.`);
      console.log(
        "   If you want to re-seed, run: DELETE FROM crop_varieties;\n"
      );
      await client.end();
      return;
    }

    console.log(`📦 Inserting ${cropData.length} crop varieties...\n`);

    for (const crop of cropData) {
      await client.query(
        `INSERT INTO crop_varieties (
          name, variety, temp_min, temp_optimal, temp_max,
          growing_days_min, growing_days_max, water_requirement,
          soil_types, soil_ph_min, soil_ph_max, planting_seasons,
          description, region, expected_yield_min, expected_yield_max, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, true)`,
        [
          crop.name,
          crop.variety,
          crop.tempMin,
          crop.tempOptimal,
          crop.tempMax,
          crop.growingDaysMin,
          crop.growingDaysMax,
          crop.waterRequirement,
          crop.soilTypes,
          crop.soilPhMin,
          crop.soilPhMax,
          crop.plantingSeasons,
          crop.description,
          crop.region,
          crop.expectedYieldMin,
          crop.expectedYieldMax,
        ]
      );
      console.log(`✓ Added: ${crop.name} - ${crop.variety}`);
    }

    console.log("\n✅ Crop varieties seeded successfully!");
    console.log(`   Total: ${cropData.length} varieties\n`);

    await client.end();
  } catch (error) {
    console.error("❌ Error seeding crop varieties:", error.message);
    await client.end();
    process.exit(1);
  }
}

seedCropVarieties();
