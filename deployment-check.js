// deployment-check.js
// This script checks database connectivity during deployment
import pg from 'pg';
const { Pool } = pg;

console.log('Checking database connection for deployment...');

// Output all environment variables (without secrets)
console.log('Environment variables being used:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('PGHOST exists:', !!process.env.PGHOST);
console.log('PGDATABASE exists:', !!process.env.PGDATABASE);
console.log('PGUSER exists:', !!process.env.PGUSER);
console.log('PGPASSWORD exists:', !!process.env.PGPASSWORD);
console.log('PGPORT exists:', !!process.env.PGPORT);

// Exit with an error if DATABASE_URL is missing
if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is missing in deployment configuration.');
  console.error('Please add the DATABASE_URL environment variable to your deployment configuration in Replit.');
  console.error('Instructions:');
  console.error('1. Go to your Replit project');
  console.error('2. Click on "Secrets" in the tools panel');
  console.error('3. Add a new secret with the key "DATABASE_URL" and the database connection string as the value');
  process.exit(1);
}

console.log('Database URL environment variable is configured.');

// Try to connect to the database to verify it works
try {
  console.log('Attempting to connect to the database...');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  // Test connection with a simple query
  pool.query('SELECT NOW()', (err, res) => {
    if (err) {
      console.error('Database connection test failed:', err.message);
      process.exit(1);
    } else {
      console.log('Database connection successful! Current time:', res.rows[0].now);
      pool.end();
    }
  });
} catch (error) {
  console.error('Failed to connect to database:', error.message);
  process.exit(1);
}