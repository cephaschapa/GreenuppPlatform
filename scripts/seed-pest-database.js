// Seed script for pest/disease database
// Run with: node scripts/seed-pest-database.js

import { db } from "../server/db.js";
import { pestDiseaseTypes } from "../shared/schema.js";
import { logger } from "../server/lib/logger.js";

const criticalPestsAndDiseases = [
  {
    name: "Fall Armyworm",
    scientificName: "Spodoptera frugiperda",
    category: "pest",
    riskLevel: "critical",
    affectedCrops: ["maize", "sorghum", "rice", "wheat", "millet"],
    symptoms: [
      "Large irregular holes in leaves",
      "Brown frass (insect excrement) visible",
      "Damage to growing points and tassels",
      "Whorl feeding damage in young plants",
      "Ear damage in mature plants",
    ],
    treatmentRecommendations: [
      "Apply Bt-based biopesticides early morning or evening",
      "Use pheromone traps for monitoring and mass trapping",
      "Apply neem-based organic pesticides",
      "Introduce natural enemies like Telenomus remus",
      "Practice crop rotation with non-host crops",
    ],
    preventionMeasures: [
      "Early planting to avoid peak infestation periods",
      "Regular field monitoring and scouting",
      "Maintain field hygiene and remove crop residues",
      "Plant trap crops like Napier grass around main crop",
      "Use resistant/tolerant varieties where available",
    ],
    imageUrls: [],
    isQuarantinable: true,
    spreadRate: "very_fast",
    economicImpact: "devastating",
    seasonality: ["November", "December", "January", "February", "March"],
    geographicRisk: [
      "Eastern Province",
      "Southern Province",
      "Central Province",
    ],
    alertThreshold: 3,
  },
  {
    name: "Maize Lethal Necrosis",
    scientificName: "MLN Complex",
    category: "viral",
    riskLevel: "critical",
    affectedCrops: ["maize"],
    symptoms: [
      "Yellowing of leaves starting from leaf margins",
      "Necrotic streaking along leaf veins",
      "Stunted plant growth",
      "Premature plant death",
      "Poor ear formation or no ears",
    ],
    treatmentRecommendations: [
      "Remove and destroy infected plants immediately",
      "Control aphid and thrips vectors with appropriate insecticides",
      "Apply reflective mulches to deter vectors",
      "No cure available - focus on prevention",
      "Plant certified disease-free seeds only",
    ],
    preventionMeasures: [
      "Use MLN-resistant maize varieties",
      "Control vector populations (aphids, thrips)",
      "Avoid planting near infected fields",
      "Practice crop rotation with non-host crops",
      "Maintain proper field sanitation",
    ],
    imageUrls: [],
    isQuarantinable: true,
    spreadRate: "fast",
    economicImpact: "devastating",
    seasonality: ["October", "November", "December", "January"],
    geographicRisk: ["Eastern Province", "Central Province", "Lusaka Province"],
    alertThreshold: 2,
  },
  {
    name: "Cassava Mosaic Disease",
    scientificName: "Cassava mosaic virus",
    category: "viral",
    riskLevel: "high",
    affectedCrops: ["cassava"],
    symptoms: [
      "Yellow and green mosaic patterns on leaves",
      "Leaf distortion and curling",
      "Stunted plant growth",
      "Reduced root yield",
      "Brittle stems",
    ],
    treatmentRecommendations: [
      "Remove and destroy infected plants",
      "Control whitefly vectors with neem oil",
      "Use virus-free planting materials",
      "Apply systemic insecticides for vector control",
      "Practice roguing of infected plants",
    ],
    preventionMeasures: [
      "Plant CMD-resistant cassava varieties",
      "Use certified disease-free cuttings",
      "Control whitefly populations",
      "Maintain proper plant spacing",
      "Remove volunteer cassava plants",
    ],
    imageUrls: [],
    isQuarantinable: false,
    spreadRate: "moderate",
    economicImpact: "severe",
    seasonality: ["September", "October", "November", "December"],
    geographicRisk: [
      "Northern Province",
      "Luapula Province",
      "Western Province",
    ],
    alertThreshold: 4,
  },
  {
    name: "African Bollworm",
    scientificName: "Helicoverpa armigera",
    category: "pest",
    riskLevel: "high",
    affectedCrops: ["cotton", "tomato", "beans", "maize", "sorghum"],
    symptoms: [
      "Large holes in leaves and fruits",
      "Boring into cotton bolls",
      "Damage to flower buds and young fruits",
      "Frass visible on damaged parts",
      "Wilting of damaged shoots",
    ],
    treatmentRecommendations: [
      "Apply Bt-based insecticides during egg hatching",
      "Use pheromone traps for monitoring",
      "Apply nuclear polyhedrosis virus (NPV)",
      "Use parasitoid wasps for biological control",
      "Rotate between different insecticide classes",
    ],
    preventionMeasures: [
      "Regular monitoring with pheromone traps",
      "Deep plowing to destroy pupae",
      "Remove crop residues after harvest",
      "Plant early to avoid peak populations",
      "Intercrop with repellent plants",
    ],
    imageUrls: [],
    isQuarantinable: false,
    spreadRate: "fast",
    economicImpact: "severe",
    seasonality: ["December", "January", "February", "March", "April"],
    geographicRisk: [
      "Southern Province",
      "Eastern Province",
      "Central Province",
    ],
    alertThreshold: 5,
  },
  {
    name: "Late Blight",
    scientificName: "Phytophthora infestans",
    category: "fungal",
    riskLevel: "high",
    affectedCrops: ["potato", "tomato"],
    symptoms: [
      "Dark water-soaked lesions on leaves",
      "White fuzzy growth on leaf undersides",
      "Brown to black lesions on stems",
      "Rapid plant collapse in humid conditions",
      "Tuber rot with brown lesions",
    ],
    treatmentRecommendations: [
      "Apply copper-based fungicides preventively",
      "Use systemic fungicides like metalaxyl",
      "Improve air circulation around plants",
      "Remove and destroy infected plant parts",
      "Apply fungicides before rain periods",
    ],
    preventionMeasures: [
      "Plant resistant varieties",
      "Ensure proper plant spacing",
      "Avoid overhead irrigation",
      "Hill potatoes properly to prevent tuber exposure",
      "Monitor weather conditions closely",
    ],
    imageUrls: [],
    isQuarantinable: false,
    spreadRate: "very_fast",
    economicImpact: "severe",
    seasonality: ["May", "June", "July", "August", "September"],
    geographicRisk: [
      "Northern Province",
      "Copperbelt",
      "Northwestern Province",
    ],
    alertThreshold: 3,
  },
  {
    name: "Tuta Absoluta",
    scientificName: "Tuta absoluta",
    category: "pest",
    riskLevel: "critical",
    affectedCrops: ["tomato", "potato", "eggplant"],
    symptoms: [
      "Serpentine leaf mines",
      "Holes in fruits with black frass",
      "Wilting of terminal shoots",
      "Premature fruit drop",
      "Reduced fruit quality and yield",
    ],
    treatmentRecommendations: [
      "Use pheromone traps for monitoring and mass trapping",
      "Apply Bt-based biopesticides",
      "Release biological control agents (Nesidiocoris tenuis)",
      "Use selective insecticides to preserve natural enemies",
      "Practice sanitation and remove infested plant parts",
    ],
    preventionMeasures: [
      "Use insect-proof nets in nurseries",
      "Install pheromone traps before planting",
      "Practice crop rotation",
      "Remove volunteer tomato plants",
      "Maintain field hygiene",
    ],
    imageUrls: [],
    isQuarantinable: true,
    spreadRate: "very_fast",
    economicImpact: "devastating",
    seasonality: ["October", "November", "December", "January", "February"],
    geographicRisk: ["Lusaka Province", "Central Province", "Copperbelt"],
    alertThreshold: 2,
  },
  {
    name: "Banana Xanthomonas Wilt",
    scientificName: "Xanthomonas campestris pv. musacearum",
    category: "bacterial",
    riskLevel: "critical",
    affectedCrops: ["banana", "plantain"],
    symptoms: [
      "Yellowing and wilting of leaves",
      "Brown streaking in pseudostem",
      "Premature ripening of fruits",
      "Bacterial ooze from cut stems",
      "Complete plant death",
    ],
    treatmentRecommendations: [
      "Remove and destroy infected plants immediately",
      "Disinfect tools with bleach solution",
      "No chemical cure available",
      "Focus on prevention and containment",
      "Quarantine affected areas",
    ],
    preventionMeasures: [
      "Use disease-free planting materials",
      "Disinfect tools between plants",
      "Control insect vectors",
      "Avoid mechanical damage to plants",
      "Practice field sanitation",
    ],
    imageUrls: [],
    isQuarantinable: true,
    spreadRate: "fast",
    economicImpact: "devastating",
    seasonality: ["All year round"],
    geographicRisk: [
      "Northern Province",
      "Luapula Province",
      "Western Province",
    ],
    alertThreshold: 1,
  },
];

async function seedPestDatabase() {
  try {
    console.log("🌱 Starting pest/disease database seeding...");

    // Check if data already exists
    const existingCount = await db.$count(pestDiseaseTypes);

    if (existingCount > 0) {
      console.log(
        `⚠️  Database already contains ${existingCount} pest/disease records.`
      );
      console.log("Skipping seeding to avoid duplicates.");
      return;
    }

    // Insert all pest/disease data
    const insertedRecords = await db
      .insert(pestDiseaseTypes)
      .values(criticalPestsAndDiseases)
      .returning();

    console.log(
      `✅ Successfully seeded ${insertedRecords.length} pest/disease records:`
    );

    insertedRecords.forEach((record, index) => {
      const emoji =
        record.category === "pest"
          ? "🐛"
          : record.category === "viral"
          ? "🦠"
          : record.category === "fungal"
          ? "🍄"
          : "🦠";

      console.log(`   ${emoji} ${record.name} (${record.riskLevel} risk)`);
    });

    console.log("\n🎯 High-risk pests that will trigger automatic alerts:");
    const highRiskPests = insertedRecords.filter(
      (p) => p.riskLevel === "high" || p.riskLevel === "critical"
    );

    highRiskPests.forEach((pest) => {
      console.log(`   • ${pest.name}: ${pest.alertThreshold} reports = alert`);
    });

    console.log("\n🚀 Pest monitoring system is now active!");
    console.log("   • Plant diagnosis will automatically detect these threats");
    console.log("   • Admin alerts will be sent when thresholds are exceeded");
    console.log(
      "   • Farmers will receive targeted prevention recommendations"
    );
  } catch (error) {
    console.error("❌ Error seeding pest database:", error);
    process.exit(1);
  }
}

// Run the seeding
seedPestDatabase()
  .then(() => {
    console.log("\n✨ Pest database seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
