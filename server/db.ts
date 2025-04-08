import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Log environment for troubleshooting
console.log("Database environment settings:");
console.log("  NODE_ENV:", process.env.NODE_ENV);
console.log("  DATABASE_URL available:", !!process.env.DATABASE_URL);
console.log("  PGHOST available:", !!process.env.PGHOST);
console.log("  PGUSER available:", !!process.env.PGUSER);
console.log("  PGPASSWORD available:", !!process.env.PGPASSWORD);
console.log("  PGDATABASE available:", !!process.env.PGDATABASE);
console.log("  PGPORT available:", !!process.env.PGPORT);

// Try to construct DATABASE_URL from individual PG environment variables if needed
if (
  !process.env.DATABASE_URL &&
  process.env.PGHOST &&
  process.env.PGUSER &&
  process.env.PGPASSWORD &&
  process.env.PGDATABASE
) {
  const port = process.env.PGPORT || "5432";
  // Note: We explicitly check if PGHOST is an IP address (common in production)
  // This helps determine if we should add SSL parameters
  const isProductionHost = 
    /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(process.env.PGHOST) || 
    process.env.PGHOST.includes('.amazonaws.com') || 
    process.env.PGHOST.includes('.neon.tech');
  
  let connectionString = `postgres://${process.env.PGUSER}:${encodeURIComponent(process.env.PGPASSWORD)}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  
  // Add SSL parameters for production environments
  if (process.env.NODE_ENV === 'production' || isProductionHost) {
    connectionString += '?sslmode=require';
  }
  
  process.env.DATABASE_URL = connectionString;
  console.log(
    `Constructed DATABASE_URL from individual PG variables (${isProductionHost ? 'Production host detected' : 'Local host detected'}).`,
  );
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is missing.");
  console.error(
    "For development: This should be set automatically by running the database.",
  );
  console.error(
    "For deployment: You need to add DATABASE_URL as a secret in your Replit deployment settings.",
  );
  console.error("1. Go to your Replit project");
  console.error("2. Click on 'Secrets' in the tools panel");
  console.error("3. Add DATABASE_URL with your PostgreSQL connection string");
  console.error(
    "Or add individual connection parameters: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT",
  );

  throw new Error(
    "Database connection information is missing. Please configure either DATABASE_URL or individual PG variables before running.",
  );
}

// Configure database pool with resilience settings
const poolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 20,                     // Maximum number of clients
  idleTimeoutMillis: 30000,    // How long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // Timeout for establishing connections
  // Add retry logic for transient network issues
  max_retries: 5,
  retry_interval: 200, // milliseconds
};

// Log that we're connecting to the database
console.log("Connecting to PostgreSQL database...");

export const pool = new Pool(poolConfig);

// Add connection error handler
pool.on('error', (err) => {
  console.error('Unexpected error on idle database client', err);
});

// Test the connection
pool.query('SELECT NOW()')
  .then(() => console.log('Database connection established successfully'))
  .catch(err => console.error('Database connection error:', err.message));

export const db = drizzle({ client: pool, schema });
