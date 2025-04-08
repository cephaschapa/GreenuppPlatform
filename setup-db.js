// setup-db.js
import pg from 'pg';

// Try to construct DATABASE_URL from individual PG environment variables if needed
if (!process.env.DATABASE_URL && process.env.PGHOST && process.env.PGUSER && 
    process.env.PGPASSWORD && process.env.PGDATABASE) {
  const port = process.env.PGPORT || '5432';
  process.env.DATABASE_URL = `postgres://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  console.log('Constructed DATABASE_URL from individual PG environment variables.');
}

// Using the environment variable
const connectionString = process.env.DATABASE_URL;

console.log('Starting database setup...');
console.log('Database configuration:');
console.log('- DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('- PGHOST exists:', !!process.env.PGHOST);
console.log('- PGDATABASE exists:', !!process.env.PGDATABASE);
console.log('- PGUSER exists:', !!process.env.PGUSER);
console.log('- PGPASSWORD exists:', !!process.env.PGPASSWORD);
console.log('- PGPORT exists:', !!process.env.PGPORT);

// Verify we have what we need
if (!connectionString) {
  console.error('ERROR: No database connection string available. Cannot continue setup.');
  console.error('Please set either DATABASE_URL or all PostgreSQL connection variables.');
  process.exit(1);
}

async function main() {
  console.log('Setting up database...');
  
  // Create the SQL connection
  const client = new pg.Client({
    connectionString: connectionString
  });
  
  try {
    await client.connect();
    console.log('Connected to database');
    
    // Create tables based on our schema
    console.log('Creating tables...');
    
    // Create tables for users
    await client.query(`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'farmer',
      first_name TEXT,
      last_name TEXT,
      profile_image TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    
    // Create tables for farmer profiles
    await client.query(`CREATE TABLE IF NOT EXISTS farmer_profiles (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      farm_name TEXT,
      farm_location TEXT,
      farm_size TEXT,
      farm_type TEXT,
      bio TEXT,
      contact_phone TEXT,
      main_crops TEXT[],
      established_year INTEGER,
      settings JSONB,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    
    // Create enum type for crop status
    await client.query(`DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'crop_status') THEN
        CREATE TYPE crop_status AS ENUM ('planning', 'planted', 'growing', 'harvesting', 'completed', 'failed');
      END IF;
    END$$;`);
    
    // Create contact inquiries table
    await client.query(`CREATE TABLE IF NOT EXISTS contact_inquiries (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL,
      farm_type TEXT NOT NULL,
      message TEXT NOT NULL,
      newsletter BOOLEAN DEFAULT FALSE,
      timestamp TIMESTAMP DEFAULT NOW() NOT NULL
    )`);
    
    // Create fields table
    await client.query(`CREATE TABLE IF NOT EXISTS fields (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      location TEXT,
      size DECIMAL(10, 2),
      size_unit TEXT DEFAULT 'hectares',
      soil_type TEXT,
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    
    // Create crops table
    await client.query(`CREATE TABLE IF NOT EXISTS crops (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      variety TEXT,
      status TEXT NOT NULL DEFAULT 'planning',
      field_id INTEGER REFERENCES fields(id),
      planting_date DATE,
      expected_harvest_date DATE,
      actual_harvest_date DATE,
      expected_yield DECIMAL(10, 2),
      actual_yield DECIMAL(10, 2),
      yield_unit TEXT DEFAULT 'kg',
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    
    // Create crop activities table
    await client.query(`CREATE TABLE IF NOT EXISTS crop_activities (
      id SERIAL PRIMARY KEY,
      crop_id INTEGER NOT NULL REFERENCES crops(id),
      activity_type TEXT NOT NULL,
      activity_date DATE NOT NULL,
      description TEXT NOT NULL,
      cost DECIMAL(10, 2),
      notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )`);
    
    // Create session table for express-session
    await client.query(`CREATE TABLE IF NOT EXISTS "session" (
      "sid" varchar NOT NULL COLLATE "default",
      "sess" json NOT NULL,
      "expire" timestamp(6) NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    )`);
    
    console.log('Tables created successfully!');
    
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

main().catch(err => {
  console.error('Database setup failed:', err);
  process.exit(1);
});