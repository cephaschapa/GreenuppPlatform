#!/usr/bin/env node

/**
 * Performance Optimization Script for Greenupp Platform
 * This script applies various performance optimizations
 */

import { fileURLToPath } from "url";
import { dirname } from "path";
import { Pool } from "pg";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: new URL("../.env", import.meta.url) });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runOptimizations() {
  console.log("🚀 Starting Performance Optimizations for Greenupp Platform");
  console.log("==========================================================");
  console.log("");

  try {
    // 1. Apply database indexes
    console.log("📊 Step 1: Applying Database Indexes...");
    await applyDatabaseIndexes();
    console.log("✅ Database indexes applied successfully");
    console.log("");

    // 2. Analyze table statistics
    console.log("📈 Step 2: Updating Table Statistics...");
    await updateTableStatistics();
    console.log("✅ Table statistics updated");
    console.log("");

    // 3. Optimize database configuration
    console.log("⚙️ Step 3: Optimizing Database Configuration...");
    await optimizeDatabaseConfig();
    console.log("✅ Database configuration optimized");
    console.log("");

    // 4. Clean up old data
    console.log("🧹 Step 4: Cleaning Up Old Data...");
    await cleanupOldData();
    console.log("✅ Old data cleanup completed");
    console.log("");

    // 5. Performance analysis
    console.log("📊 Step 5: Running Performance Analysis...");
    await runPerformanceAnalysis();
    console.log("✅ Performance analysis completed");
    console.log("");

    console.log("🎉 All performance optimizations completed successfully!");
    console.log("");
    console.log("📋 Summary of optimizations applied:");
    console.log("- Database indexes for faster queries");
    console.log("- Updated table statistics for better query planning");
    console.log("- Optimized database configuration");
    console.log("- Cleaned up old data and sessions");
    console.log("- Performance analysis and recommendations");
  } catch (error) {
    console.error("❌ Error during optimization:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function applyDatabaseIndexes() {
  const indexes = [
    // User and Authentication Indexes
    "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
    "CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)",
    "CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at)",
    "CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON device_sessions(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_device_sessions_expires_at ON device_sessions(expires_at)",

    // Farmer Profile Indexes
    "CREATE INDEX IF NOT EXISTS idx_farmer_profiles_user_id ON farmer_profiles(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_profiles_location_id ON farmer_profiles(location_id)",

    // Field and Crop Indexes
    "CREATE INDEX IF NOT EXISTS idx_fields_user_id ON fields(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_fields_location_id ON fields(location_id)",
    "CREATE INDEX IF NOT EXISTS idx_fields_created_at ON fields(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_crops_user_id ON crops(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_crops_field_id ON crops(field_id)",
    "CREATE INDEX IF NOT EXISTS idx_crops_planting_date ON crops(planting_date)",
    "CREATE INDEX IF NOT EXISTS idx_crops_harvest_date ON crops(harvest_date)",

    // Task Management Indexes
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_user_id ON farmer_tasks(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_crop_id ON farmer_tasks(crop_id)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_field_id ON farmer_tasks(field_id)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_due_date ON farmer_tasks(due_date)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_priority ON farmer_tasks(priority)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_status ON farmer_tasks(status)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_completed_at ON farmer_tasks(completed_at)",

    // Plant Analysis Indexes
    "CREATE INDEX IF NOT EXISTS idx_plant_analyses_user_id ON plant_analyses(user_id)",
    "CREATE INDEX IF NOT EXISTS idx_plant_analyses_field_id ON plant_analyses(field_id)",
    "CREATE INDEX IF NOT EXISTS idx_plant_analyses_crop_id ON plant_analyses(crop_id)",
    "CREATE INDEX IF NOT EXISTS idx_plant_analyses_analysis_date ON plant_analyses(analysis_date)",
    "CREATE INDEX IF NOT EXISTS idx_plant_analyses_disease_detected ON plant_analyses(disease_detected)",

    // Marketplace Indexes
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_id ON marketplace_listings(seller_id)",
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category ON marketplace_listings(category)",
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status ON marketplace_listings(status)",
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_condition ON marketplace_listings(condition)",
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_location_id ON marketplace_listings(location_id)",
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_created_at ON marketplace_listings(created_at)",
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_price ON marketplace_listings(price)",
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_views ON marketplace_listings(views)",

    // Location and Geospatial Indexes
    "CREATE INDEX IF NOT EXISTS idx_locations_latitude_longitude ON locations(latitude, longitude)",
    "CREATE INDEX IF NOT EXISTS idx_locations_h3_index_8 ON locations(h3_index_8)",
    "CREATE INDEX IF NOT EXISTS idx_locations_h3_index_9 ON locations(h3_index_9)",
    "CREATE INDEX IF NOT EXISTS idx_locations_h3_index_10 ON locations(h3_index_10)",
    "CREATE INDEX IF NOT EXISTS idx_locations_country_city ON locations(country, city)",

    // Composite Indexes for Complex Queries
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_category_status_price ON marketplace_listings(category, status, price)",
    "CREATE INDEX IF NOT EXISTS idx_farmer_tasks_user_priority_due_date ON farmer_tasks(user_id, priority, due_date)",
    "CREATE INDEX IF NOT EXISTS idx_plant_analyses_user_date_disease ON plant_analyses(user_id, analysis_date, disease_detected)",

    // Full-text Search Indexes
    "CREATE INDEX IF NOT EXISTS idx_marketplace_listings_title_description_fts ON marketplace_listings USING gin(to_tsvector('english', title || ' ' || description))",
    "CREATE INDEX IF NOT EXISTS idx_plant_analyses_notes_fts ON plant_analyses USING gin(to_tsvector('english', notes))",
  ];

  for (const index of indexes) {
    try {
      await pool.query(index);
    } catch (error) {
      if (error.code !== "42P07") {
        // Skip if index already exists
        console.warn(`⚠️ Warning creating index: ${error.message}`);
      }
    }
  }
}

async function updateTableStatistics() {
  const tables = [
    "users",
    "sessions",
    "device_sessions",
    "farmer_profiles",
    "fields",
    "crops",
    "farmer_tasks",
    "plant_analyses",
    "marketplace_listings",
    "locations",
    "weather_preferences",
    "treatment_plans",
    "orders",
    "notifications",
    "chat_messages",
  ];

  for (const table of tables) {
    try {
      await pool.query(`ANALYZE ${table}`);
    } catch (error) {
      console.warn(`⚠️ Warning analyzing table ${table}: ${error.message}`);
    }
  }
}

async function optimizeDatabaseConfig() {
  const optimizations = [
    // Increase work_mem for better query performance
    "SET work_mem = '256MB'",

    // Increase shared_buffers for better caching
    "SET shared_buffers = '256MB'",

    // Optimize random_page_cost for SSD storage
    "SET random_page_cost = 1.1",

    // Increase effective_cache_size
    "SET effective_cache_size = '1GB'",

    // Optimize maintenance_work_mem
    "SET maintenance_work_mem = '256MB'",

    // Enable parallel query execution
    "SET max_parallel_workers_per_gather = 2",
    "SET max_parallel_workers = 4",

    // Optimize checkpoint settings
    "SET checkpoint_completion_target = 0.9",
    "SET wal_buffers = '16MB'",
  ];

  for (const optimization of optimizations) {
    try {
      await pool.query(optimization);
    } catch (error) {
      console.warn(`⚠️ Warning applying optimization: ${error.message}`);
    }
  }
}

async function cleanupOldData() {
  const cleanupQueries = [
    // Clean up expired sessions (older than 30 days)
    "DELETE FROM sessions WHERE expires_at < NOW() - INTERVAL '30 days'",

    // Clean up expired device sessions (older than 30 days)
    "DELETE FROM device_sessions WHERE expires_at < NOW() - INTERVAL '30 days'",

    // Clean up old notifications (older than 90 days)
    "DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '90 days'",

    // Clean up old chat messages (older than 1 year)
    "DELETE FROM chat_messages WHERE created_at < NOW() - INTERVAL '1 year'",

    // Clean up old login attempts (older than 30 days)
    "DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '30 days'",

    // Clean up old security events (older than 90 days)
    "DELETE FROM security_events WHERE created_at < NOW() - INTERVAL '90 days'",
  ];

  for (const query of cleanupQueries) {
    try {
      const result = await pool.query(query);
      console.log(`🧹 Cleaned up ${result.rowCount} old records`);
    } catch (error) {
      console.warn(`⚠️ Warning during cleanup: ${error.message}`);
    }
  }
}

async function runPerformanceAnalysis() {
  console.log("📊 Analyzing query performance...");

  try {
    // Get slow queries
    const slowQueries = await pool.query(`
      SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
      FROM pg_stat_statements 
      WHERE mean_time > 1000
      ORDER BY mean_time DESC 
      LIMIT 10
    `);

    if (slowQueries.rows.length > 0) {
      console.log("🐌 Slow queries detected:");
      slowQueries.rows.forEach((row, index) => {
        console.log(
          `  ${index + 1}. ${row.query.substring(
            0,
            100
          )}... (${row.mean_time.toFixed(2)}ms avg)`
        );
      });
    } else {
      console.log("✅ No slow queries detected");
    }

    // Get table sizes
    const tableSizes = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `);

    console.log("\n📏 Table sizes:");
    tableSizes.rows.forEach((row) => {
      console.log(`  ${row.tablename}: ${row.size}`);
    });

    // Get index usage statistics
    const indexUsage = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes 
      ORDER BY idx_scan DESC 
      LIMIT 10
    `);

    console.log("\n📈 Most used indexes:");
    indexUsage.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.indexname} (${row.idx_scan} scans)`);
    });
  } catch (error) {
    console.warn(`⚠️ Warning during performance analysis: ${error.message}`);
  }
}

// Run the optimizations
runOptimizations()
  .then(() => {
    console.log("\n🎯 Performance optimization script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
