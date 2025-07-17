import { Pool } from "pg";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function resetDatabase() {
  try {
    console.log("🗑️  Dropping all tables...");

    // Drop all tables in the public schema
    await sql`
      DROP SCHEMA IF EXISTS public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `;

    console.log("✅ Database dropped successfully");

    console.log("🔄 Running migrations...");

    // Run all migrations
    const db = drizzle(sql);
    await migrate(db, { migrationsFolder: "./migrations" });

    console.log("✅ Database reset complete!");
    console.log("🎉 All migrations applied successfully");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
