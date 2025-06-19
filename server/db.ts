import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

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
  .filter(([_, value]) => !value)
  .map(([key, _]) => key);

if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`   - ${varName}`);
  });
  console.error("");
  console.error("🔧 Please set these variables in your Railway project:");
  console.error("   1. Go to your Railway project dashboard");
  console.error("   2. Click on your service");
  console.error("   3. Go to the 'Variables' tab");
  console.error("   4. Add the missing variables");
  console.error("");
  console.error(
    "📋 For DATABASE_URL, you can create a PostgreSQL database in Railway"
  );
  console.error("📋 For SESSION_SECRET, use a long random string");
  process.exit(1);
}

// Add connection error handling
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle client", err);
  process.exit(-1);
});

// Test the connection
pool
  .query("SELECT NOW()")
  .then(() => console.log("✅ Database connection successful"))
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
    console.error("");
    console.error("🔧 Please check your DATABASE_URL in Railway:");
    console.error("   1. Ensure the database is running");
    console.error("   2. Verify the connection string is correct");
    console.error("   3. Check if the database credentials are valid");
    process.exit(-1);
  });

export { pool };
export const db = drizzle({ client: pool, schema });
