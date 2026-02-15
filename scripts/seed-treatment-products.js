// Seed script for treatment products (pesticides, fungicides, insecticides)
// Run after migrations and optionally after seed-pest-database.js
// Usage: node platform/scripts/seed-treatment-products.js (from repo root) or node scripts/seed-treatment-products.js (from platform/)

import { db } from "../server/db.js";
import { treatmentProducts } from "../shared/schema.js";

// Placeholder image base – replace with real product image URLs when available.
// Format: 400x400, color by type (fungicide=green, insecticide=orange, etc.), text label.
const placeholderImage = (productType, label) => {
  const types = {
    fungicide: "4a7c59",
    insecticide: "c45c2e",
    herbicide: "2e5c8a",
    bactericide: "8a2e2e",
    miticide: "6b4a9e",
    biopesticide: "2d6a4f",
  };
  const hex = types[productType] || "555555";
  const text = encodeURIComponent((label || productType).slice(0, 12));
  return `https://placehold.co/400x400/${hex}/white?text=${text}`;
};

const PRODUCTS = [
  // ----- Fungicides (Late Blight, Early Blight, Powdery Mildew, Leaf Spot) -----
  {
    name: "Copper Oxychloride 50% WP",
    activeIngredient: "Copper oxychloride",
    productType: "fungicide",
    targetDiseases: ["Late Blight", "Early Blight", "Leaf Spot", "Bacterial spot"],
    targetCrops: ["potato", "tomato", "maize", "beans"],
    imageUrl: placeholderImage("fungicide", "Copper"),
    applicationRate: "2–3 g/L water; 300–400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Contact fungicide for prevention of late blight and bacterial diseases.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Mancozeb 80% WP",
    activeIngredient: "Mancozeb",
    productType: "fungicide",
    targetDiseases: ["Late Blight", "Early Blight", "Leaf Spot", "Powdery Mildew"],
    targetCrops: ["potato", "tomato", "maize", "cassava"],
    imageUrl: placeholderImage("fungicide", "Mancozeb"),
    applicationRate: "2 g/L; 400–500 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Protectant fungicide for broad-spectrum foliar diseases.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Metalaxyl-M 4% + Mancozeb 64% WP",
    activeIngredient: "Metalaxyl-M + Mancozeb",
    productType: "fungicide",
    targetDiseases: ["Late Blight", "Early Blight"],
    targetCrops: ["potato", "tomato"],
    imageUrl: placeholderImage("fungicide", "Metalaxyl"),
    applicationRate: "2.5 g/L; apply every 7–10 days",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Systemic + contact combination for potato and tomato blight.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Chlorothalonil 72% SC",
    activeIngredient: "Chlorothalonil",
    productType: "fungicide",
    targetDiseases: ["Late Blight", "Early Blight", "Leaf Spot", "Powdery Mildew"],
    targetCrops: ["potato", "tomato", "beans", "maize"],
    imageUrl: placeholderImage("fungicide", "Chlorothalonil"),
    applicationRate: "2–3 mL/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 14,
    organic: false,
    description: "Broad-spectrum protectant fungicide.",
    manufacturer: "Various",
    availability: "regional",
  },
  {
    name: "Sulphur 80% WG",
    activeIngredient: "Sulphur",
    productType: "fungicide",
    targetDiseases: ["Powdery Mildew", "Rust", "Leaf Spot"],
    targetCrops: ["tomato", "beans", "maize", "wheat"],
    imageUrl: placeholderImage("fungicide", "Sulphur"),
    applicationRate: "2–3 g/L; 300–400 L/ha",
    safetyClass: "III",
    reEntryInterval: 12,
    preHarvestInterval: 3,
    organic: true,
    description: "Sulphur-based fungicide suitable for organic use.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Bordeaux Mixture",
    activeIngredient: "Copper sulphate + Lime",
    productType: "fungicide",
    targetDiseases: ["Late Blight", "Early Blight", "Bacterial spot"],
    targetCrops: ["potato", "tomato", "fruit trees"],
    imageUrl: placeholderImage("fungicide", "Bordeaux"),
    applicationRate: "1% solution; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: true,
    description: "Traditional copper-based fungicide for blight and bacterial diseases.",
    manufacturer: "Various",
    availability: "national",
  },
  // ----- Insecticides (Fall Armyworm, African Bollworm, Tuta Absoluta, Aphids, Whitefly) -----
  {
    name: "Bt (Bacillus thuringiensis) WP",
    activeIngredient: "Bacillus thuringiensis var. kurstaki",
    productType: "insecticide",
    targetDiseases: ["Fall Armyworm", "African Bollworm", "Tuta Absoluta", "Diamondback moth"],
    targetCrops: ["maize", "tomato", "cabbage", "cotton", "beans"],
    imageUrl: placeholderImage("biopesticide", "Bt"),
    applicationRate: "0.5–1 g/L; early morning or evening",
    safetyClass: "IV",
    reEntryInterval: 0,
    preHarvestInterval: 0,
    organic: true,
    description: "Biological insecticide for caterpillars; safe for beneficials.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Lambda-cyhalothrin 2.5% EC",
    activeIngredient: "Lambda-cyhalothrin",
    productType: "insecticide",
    targetDiseases: ["Fall Armyworm", "African Bollworm", "Aphids", "Whitefly", "Thrips"],
    targetCrops: ["maize", "tomato", "cotton", "beans", "cabbage"],
    imageUrl: placeholderImage("insecticide", "Lambda"),
    applicationRate: "0.5–1 mL/L; 300–400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Pyrethroid for chewing and sucking pests.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Emamectin Benzoate 5% SG",
    activeIngredient: "Emamectin benzoate",
    productType: "insecticide",
    targetDiseases: ["Fall Armyworm", "African Bollworm", "Tuta Absoluta"],
    targetCrops: ["maize", "tomato", "cotton", "cabbage"],
    imageUrl: placeholderImage("insecticide", "Emamectin"),
    applicationRate: "0.2–0.3 g/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Systemic insecticide for lepidopteran pests.",
    manufacturer: "Various",
    availability: "regional",
  },
  {
    name: "Neem Oil 1% EC",
    activeIngredient: "Azadirachtin (neem)",
    productType: "insecticide",
    targetDiseases: ["Aphids", "Whitefly", "Spider Mites", "Fall Armyworm", "Thrips"],
    targetCrops: ["tomato", "beans", "cabbage", "maize", "cassava"],
    imageUrl: placeholderImage("biopesticide", "Neem"),
    applicationRate: "5–10 mL/L; 300–400 L/ha",
    safetyClass: "IV",
    reEntryInterval: 0,
    preHarvestInterval: 0,
    organic: true,
    description: "Botanical insecticide and antifeedant; low toxicity.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Spinosad 12% SC",
    activeIngredient: "Spinosad",
    productType: "insecticide",
    targetDiseases: ["Tuta Absoluta", "African Bollworm", "Thrips", "Fall Armyworm"],
    targetCrops: ["tomato", "potato", "eggplant", "cabbage"],
    imageUrl: placeholderImage("insecticide", "Spinosad"),
    applicationRate: "0.3–0.5 mL/L; 400 L/ha",
    safetyClass: "III",
    reEntryInterval: 12,
    preHarvestInterval: 1,
    organic: false,
    description: "Natural origin insecticide for caterpillars and thrips.",
    manufacturer: "Various",
    availability: "regional",
  },
  {
    name: "Acetamiprid 20% SP",
    activeIngredient: "Acetamiprid",
    productType: "insecticide",
    targetDiseases: ["Aphids", "Whitefly", "Thrips", "Leafhoppers"],
    targetCrops: ["tomato", "cotton", "beans", "maize", "cassava"],
    imageUrl: placeholderImage("insecticide", "Acetamiprid"),
    applicationRate: "0.2–0.3 g/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Systemic neonicotinoid for sucking pests; vector control for viruses.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Cypermethrin 10% EC",
    activeIngredient: "Cypermethrin",
    productType: "insecticide",
    targetDiseases: ["Fall Armyworm", "African Bollworm", "Aphids", "Whitefly"],
    targetCrops: ["maize", "cotton", "tomato", "beans"],
    imageUrl: placeholderImage("insecticide", "Cypermethrin"),
    applicationRate: "0.5–1 mL/L; 300–400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Pyrethroid for broad-spectrum insect control.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Deltamethrin 2.5% EC",
    activeIngredient: "Deltamethrin",
    productType: "insecticide",
    targetDiseases: ["Fall Armyworm", "African Bollworm", "Tuta Absoluta", "Aphids"],
    targetCrops: ["maize", "tomato", "cotton", "cabbage"],
    imageUrl: placeholderImage("insecticide", "Deltamethrin"),
    applicationRate: "0.5–1 mL/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 3,
    organic: false,
    description: "Pyrethroid for lepidopteran and sucking pests.",
    manufacturer: "Various",
    availability: "national",
  },
  // ----- Viral / vector control (Maize Lethal Necrosis, Cassava Mosaic – via vectors) -----
  {
    name: "Imidacloprid 17.8% SL",
    activeIngredient: "Imidacloprid",
    productType: "insecticide",
    targetDiseases: ["Maize Lethal Necrosis", "Cassava Mosaic Disease", "Aphids", "Whitefly", "Thrips"],
    targetCrops: ["maize", "cassava", "tomato", "beans"],
    imageUrl: placeholderImage("insecticide", "Imidacloprid"),
    applicationRate: "0.3–0.5 mL/L foliar; or seed/soil as label",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 21,
    organic: false,
    description: "Systemic insecticide for vector control in virus-prone crops.",
    manufacturer: "Various",
    availability: "national",
  },
  // ----- Miticide (Spider Mites) -----
  {
    name: "Abamectin 1.8% EC",
    activeIngredient: "Abamectin",
    productType: "miticide",
    targetDiseases: ["Spider Mites", "Tuta Absoluta", "Leaf miners"],
    targetCrops: ["tomato", "potato", "beans", "cotton"],
    imageUrl: placeholderImage("miticide", "Abamectin"),
    applicationRate: "0.5–1 mL/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 7,
    organic: false,
    description: "Miticide and insecticide for mites and leaf miners.",
    manufacturer: "Various",
    availability: "regional",
  },
  // ----- Bactericide / sanitation (Banana Xanthomonas Wilt – no chemical cure; tools) -----
  {
    name: "Sodium Hypochlorite (Bleach) 5%",
    activeIngredient: "Sodium hypochlorite",
    productType: "bactericide",
    targetDiseases: ["Banana Xanthomonas Wilt", "Bacterial wilt", "Bacterial spot"],
    targetCrops: ["banana", "plantain", "tomato", "potato"],
    imageUrl: placeholderImage("bactericide", "Bleach"),
    applicationRate: "Disinfect tools: 10% solution; do not spray on plants as cure",
    safetyClass: "II",
    reEntryInterval: 0,
    preHarvestInterval: null,
    organic: false,
    description: "Tool and equipment disinfectant to prevent spread of bacterial diseases.",
    manufacturer: "Various",
    availability: "national",
  },
  // ----- Additional fungicides for broader disease coverage -----
  {
    name: "Carbendazim 50% WP",
    activeIngredient: "Carbendazim",
    productType: "fungicide",
    targetDiseases: ["Powdery Mildew", "Leaf Spot", "Early Blight"],
    targetCrops: ["tomato", "beans", "wheat", "maize"],
    imageUrl: placeholderImage("fungicide", "Carbendazim"),
    applicationRate: "0.5 g/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 14,
    organic: false,
    description: "Systemic fungicide for foliar diseases.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Propiconazole 25% EC",
    activeIngredient: "Propiconazole",
    productType: "fungicide",
    targetDiseases: ["Late Blight", "Powdery Mildew", "Rust"],
    targetCrops: ["maize", "wheat", "tomato", "banana"],
    imageUrl: placeholderImage("fungicide", "Propiconazole"),
    applicationRate: "0.5–1 mL/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 14,
    organic: false,
    description: "Systemic triazole fungicide.",
    manufacturer: "Various",
    availability: "regional",
  },
  // ----- Extra coverage: Early Blight, Rust, Diamondback moth, Leaf miners -----
  {
    name: "Azoxystrobin 23% SC",
    activeIngredient: "Azoxystrobin",
    productType: "fungicide",
    targetDiseases: ["Late Blight", "Early Blight", "Powdery Mildew", "Rust"],
    targetCrops: ["potato", "tomato", "maize", "wheat"],
    imageUrl: placeholderImage("fungicide", "Azoxystrobin"),
    applicationRate: "0.5–1 mL/L; 400 L/ha",
    safetyClass: "III",
    reEntryInterval: 12,
    preHarvestInterval: 7,
    organic: false,
    description: "Broad-spectrum systemic fungicide.",
    manufacturer: "Various",
    availability: "regional",
  },
  {
    name: "Indoxacarb 15% SC",
    activeIngredient: "Indoxacarb",
    productType: "insecticide",
    targetDiseases: ["Fall Armyworm", "African Bollworm", "Tuta Absoluta", "Diamondback moth"],
    targetCrops: ["maize", "tomato", "cabbage", "cotton"],
    imageUrl: placeholderImage("insecticide", "Indoxacarb"),
    applicationRate: "0.3–0.5 mL/L; 400 L/ha",
    safetyClass: "II",
    reEntryInterval: 24,
    preHarvestInterval: 3,
    organic: false,
    description: "Oxadiazine insecticide for lepidopteran pests.",
    manufacturer: "Various",
    availability: "regional",
  },
  {
    name: "Pheromone Traps (Fall Armyworm)",
    activeIngredient: "Pheromone lure",
    productType: "insecticide",
    targetDiseases: ["Fall Armyworm"],
    targetCrops: ["maize", "sorghum", "rice"],
    imageUrl: placeholderImage("biopesticide", "Pheromone"),
    applicationRate: "4–5 traps/ha for monitoring; follow label for mass trapping",
    safetyClass: "IV",
    reEntryInterval: 0,
    preHarvestInterval: 0,
    organic: true,
    description: "Monitoring and mass trapping for Fall Armyworm.",
    manufacturer: "Various",
    availability: "national",
  },
  {
    name: "Pheromone Traps (Tuta Absoluta)",
    activeIngredient: "Pheromone lure",
    productType: "insecticide",
    targetDiseases: ["Tuta Absoluta"],
    targetCrops: ["tomato", "potato", "eggplant"],
    imageUrl: placeholderImage("biopesticide", "Tuta Trap"),
    applicationRate: "4–8 traps/ha; install before planting",
    safetyClass: "IV",
    reEntryInterval: 0,
    preHarvestInterval: 0,
    organic: true,
    description: "Monitoring and mass trapping for tomato leaf miner.",
    manufacturer: "Various",
    availability: "national",
  },
];

async function seedTreatmentProducts() {
  try {
    console.log("🌱 Starting treatment products (pesticides/fungicides/insecticides) seeding...");

    const existing = await db.select({ id: treatmentProducts.id }).from(treatmentProducts).limit(1);
    if (existing.length > 0) {
      console.log("⚠️  treatment_products already has data. Skipping to avoid duplicates.");
      console.log("   To re-seed, truncate the table first (e.g. TRUNCATE treatment_products CASCADE);");
      return;
    }

    const inserted = await db.insert(treatmentProducts).values(PRODUCTS).returning();
    console.log(`✅ Seeded ${inserted.length} treatment products.`);

    const byType = {};
    inserted.forEach((p) => {
      byType[p.productType] = (byType[p.productType] || 0) + 1;
    });
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   • ${type}: ${count}`);
    });
    console.log("\n📷 Each product has an image_url (placeholder). Replace with real product images when available.");
  } catch (error) {
    console.error("❌ Error seeding treatment products:", error);
    process.exit(1);
  }
}

seedTreatmentProducts()
  .then(() => {
    console.log("\n✨ Treatment products seeding completed.");
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
