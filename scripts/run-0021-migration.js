/**
 * Run migration 0021_crop_stages_planting_storage_more_crops.sql
 * Usage: from platform folder: node scripts/run-0021-migration.js
 * Requires: DATABASE_URL in env or .env
 */
import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("❌ DATABASE_URL is not set. Set it in .env or the environment.");
    process.exit(1);
  }

  const sql = neon(url);
  const path = join(__dirname, "../migrations/0021_crop_stages_planting_storage_more_crops.sql");
  const content = readFileSync(path, "utf8");

  // Split into statements (each INSERT...SELECT...WHERE NOT EXISTS ends with ;)
  const statements = content
    .split(/;\s*\n/)
    .map((s) => s.replace(/^--[^\n]*\n/gm, "").trim())
    .filter((s) => s.length > 0);

  console.log(`Running ${statements.length} statements from 0021_crop_stages_planting_storage_more_crops.sql ...`);
  for (let i = 0; i < statements.length; i++) {
    const st = statements[i] + ";";
    try {
      await sql(st);
      console.log(`  ✓ ${i + 1}/${statements.length}`);
    } catch (err) {
      console.error(`  ✗ Statement ${i + 1} failed:`, err.message);
      throw err;
    }
  }
  console.log("✅ Migration 0021 completed successfully.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
