import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function syncMigrations() {
  try {
    console.log("🔍 Introspecting database...");

    // Get all tables in the database
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const existingTables = tablesResult.rows.map((row) => row.table_name);
    console.log("📋 Existing tables:", existingTables);

    // Read current migration journal
    const journalPath = path.join(
      __dirname,
      "../migrations/meta/_journal.json"
    );
    const journal = JSON.parse(fs.readFileSync(journalPath, "utf8"));

    // Get all migration files
    const migrationsDir = path.join(__dirname, "../migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter(
        (file) =>
          file.endsWith(".sql") &&
          file !== "add_trust_features_to_marketplace.sql"
      )
      .sort();

    console.log("📁 Migration files:", migrationFiles);

    // Create a new journal with all migrations marked as applied
    const newJournal = {
      version: journal.version,
      dialect: journal.dialect,
      entries: [],
    };

    // Add entries for all migration files
    migrationFiles.forEach((file, index) => {
      const tag = file.replace(".sql", "");
      newJournal.entries.push({
        idx: index,
        version: journal.version,
        when: Date.now() + index, // Ensure unique timestamps
        tag: tag,
        breakpoints: true,
      });
    });

    // Write the new journal
    fs.writeFileSync(journalPath, JSON.stringify(newJournal, null, 2));

    console.log("✅ Migration journal synced!");
    console.log(
      "📝 Applied migrations:",
      newJournal.entries.map((e) => e.tag)
    );

    // Check if we need to add the trust features
    const hasTrustColumns = await checkTrustColumns();
    if (!hasTrustColumns) {
      console.log(
        "⚠️  Trust features not found. You may need to apply them manually."
      );
    } else {
      console.log("✅ Trust features already applied.");
    }
  } catch (error) {
    console.error("❌ Error syncing migrations:", error);
  } finally {
    await pool.end();
  }
}

async function checkTrustColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'marketplace_listings' 
      AND column_name IN ('blockchain_id', 'greenupp_verified', 'farm_name', 'organic_certified');
    `);

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking trust columns:", error);
    return false;
  }
}

// Run the sync
syncMigrations();
