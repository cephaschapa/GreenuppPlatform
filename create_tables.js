const { Pool } = require("@neondatabase/serverless");
const fs = require("fs");

async function createTables() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log("Connecting to database...");

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
