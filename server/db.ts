import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

// Log environment for troubleshooting
console.log('Environment settings:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  Database connection config available:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is missing.");
  console.error("For development: This should be set automatically by running the database.");
  console.error("For deployment: You need to add DATABASE_URL as a secret in your Replit deployment settings.");
  console.error("1. Go to your Replit project");
  console.error("2. Click on 'Secrets' in the tools panel");
  console.error("3. Add DATABASE_URL with your PostgreSQL connection string");
  
  throw new Error(
    "DATABASE_URL environment variable is missing. Please configure it before running the application.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
