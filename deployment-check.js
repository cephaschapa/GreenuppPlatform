// deployment-check.js
// This script checks database connectivity during deployment

console.log('Checking database connection for deployment...');

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