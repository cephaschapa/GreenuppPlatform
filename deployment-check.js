// This script checks if the deployment environment has all the necessary configuration
// Run it during the deployment process to verify settings
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Configure WebSocket for Neon
neonConfig.webSocketConstructor = ws;

console.log('=== DEPLOYMENT ENVIRONMENT CHECK ===');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Check for database configuration
console.log('\n=== DATABASE CONFIGURATION ===');
console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('PGHOST present:', !!process.env.PGHOST);
console.log('PGUSER present:', !!process.env.PGUSER);
console.log('PGPASSWORD present:', !!process.env.PGPASSWORD);
console.log('PGDATABASE present:', !!process.env.PGDATABASE);
console.log('PGPORT present:', !!process.env.PGPORT);

// If we have PostgreSQL config values but no DATABASE_URL, construct it
if (!process.env.DATABASE_URL && process.env.PGHOST && process.env.PGUSER && 
    process.env.PGPASSWORD && process.env.PGDATABASE) {
  const port = process.env.PGPORT || '5432';
  process.env.DATABASE_URL = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  console.log('Constructed DATABASE_URL from individual PG variables:', 
    process.env.DATABASE_URL.replace(/:[^:]*@/, ':****@')); // Hide password in logs
}

// Try to connect to the database
async function checkDatabaseConnection() {
  if (process.env.DATABASE_URL) {
    // Test database connection
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    console.log('\n=== TESTING DATABASE CONNECTION ===');
    console.log('Attempting to connect to database...');
    
    try {
      const result = await pool.query('SELECT NOW()');
      console.log('Database connection successful!');
      console.log('Server time:', result.rows[0].now);
      console.log('\n=== ALL CHECKS PASSED ===');
      return true;
    } catch (err) {
      console.error('Database connection failed:');
      console.error(err.message);
      console.error('\n=== CHECK FAILED ===');
      return false;
    }
  } else {
    console.error('\nERROR: No database connection information available.');
    console.error('Make sure to set DATABASE_URL or individual PostgreSQL environment variables.');
    console.error('\n=== CHECK FAILED ===');
    return false;
  }
}

// Execute the check
checkDatabaseConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Unexpected error during database check:', error);
    process.exit(1);
  });