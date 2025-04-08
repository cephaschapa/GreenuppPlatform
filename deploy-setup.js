#!/usr/bin/env node
// deploy-setup.js - This script is used during the deployment process

console.log('Running deployment setup');

// Import setup-db.js to ensure the database is set up properly
import('./setup-db.js')
  .then(() => {
    console.log('Database setup completed successfully');
  })
  .catch((error) => {
    console.error('Failed to set up database:', error);
    process.exit(1);
  });