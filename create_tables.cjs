// const { Pool } = require("@neondatabase/serverless");
const { Pool } = require("pg");
const fs = require("fs");

// Load environment variables
require("dotenv").config();

async function createTables() {
  console.log("Starting table creation script...");
  console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
  console.log(
    "DATABASE_URL starts with:",
    process.env.DATABASE_URL
      ? process.env.DATABASE_URL.substring(0, 20) + "..."
      : "undefined"
  );

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL environment variable is not set!");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("Connecting to database...");

    // Test the connection
    await pool.query("SELECT NOW()");
    console.log("Database connection successful!");

    // Read the SQL file
    const sql = fs.readFileSync("create_plant_analyses.sql", "utf8");

    // Split by semicolon and execute each command separately
    const commands = sql.split(";").filter((cmd) => cmd.trim().length > 0);

    console.log(`Found ${commands.length} SQL commands to execute...`);

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i].trim();
      if (command) {
        try {
          console.log(
            `Executing command ${i + 1}/${commands.length}:`,
            command.substring(0, 50) + "..."
          );
          await pool.query(command);
          console.log(`Command ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === "42P07") {
            console.log(`Command ${i + 1} skipped - table already exists`);
          } else {
            console.error(`Error in command ${i + 1}:`, error.message);
          }
        }
      }
    }

    console.log("Table creation process completed!");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    await pool.end();
  }
}

createTables();
