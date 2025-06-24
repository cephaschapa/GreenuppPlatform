import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import { logger } from "./lib/logger";

// Configure WebSocket for Neon serverless
neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineTLS = true;
neonConfig.pipelineConnect = false;

// Check for required environment variables
const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  logger.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    logger.error(`   - ${varName}`);
  });
  logger.error("");
  logger.error("🔧 Please set these variables in your Railway project:");
  logger.error("   1. Go to your Railway project dashboard");
  logger.error("   2. Click on your service");
  logger.error("   3. Go to the 'Variables' tab");
  logger.error("   4. Add the missing variables");
  logger.error("");
  logger.error(
    "📋 For DATABASE_URL, you can create a PostgreSQL database in Railway"
  );
  logger.error("📋 For SESSION_SECRET, use a long random string");
  process.exit(1);
}

// Add connection error handling
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on("error", (err) => {
  logger.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

// Test the connection
pool
  .query("SELECT NOW()")
  .then(() => logger.info("✅ Database connection successful"))
  .catch((err) => {
    logger.error("❌ Database connection failed:", err);
    logger.error("");
    logger.error("🔧 Please check your DATABASE_URL in Railway:");
    logger.error("   1. Ensure the database is running");
    logger.error("   2. Verify the connection string is correct");
    logger.error("   3. Check if the database credentials are valid");
    process.exit(-1);
  });

export { pool };
export const db = drizzle({ client: pool, schema });
