import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Log environment for troubleshooting
console.log('Database environment settings:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL available:', !!process.env.DATABASE_URL);
console.log('  PGHOST available:', !!process.env.PGHOST);
console.log('  PGUSER available:', !!process.env.PGUSER);
console.log('  PGPASSWORD available:', !!process.env.PGPASSWORD);
console.log('  PGDATABASE available:', !!process.env.PGDATABASE);
console.log('  PGPORT available:', !!process.env.PGPORT);

// Try to construct DATABASE_URL from individual PG environment variables if needed
if (!process.env.DATABASE_URL && process.env.PGHOST && process.env.PGUSER && 
    process.env.PGPASSWORD && process.env.PGDATABASE) {
  const port = process.env.PGPORT || '5432';
  process.env.DATABASE_URL = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  console.log('Constructed DATABASE_URL from individual PG environment variables.');
}

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is missing.");
  console.error("For development: This should be set automatically by running the database.");
  console.error("For deployment: You need to add DATABASE_URL as a secret in your Replit deployment settings.");
  console.error("1. Go to your Replit project");
  console.error("2. Click on 'Secrets' in the tools panel");
  console.error("3. Add DATABASE_URL with your PostgreSQL connection string");
  console.error("Or add individual connection parameters: PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT");
  
  throw new Error(
    "Database connection information is missing. Please configure either DATABASE_URL or individual PG variables before running.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
