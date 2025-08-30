#!/usr/bin/env tsx

/**
 * Database initialization script
 * Run this to set up the database schema and sample data
 */

import "dotenv/config";
import { pool } from "../lib/database";
import { readFileSync } from "fs";
import { join } from "path";

async function initializeDatabase() {
  console.log("🚀 Initializing XC3 Database...");

  try {
    // Read and execute the migration SQL
    const migrationPath = join(__dirname, "../migrations/001_initial_schema.sql");
    const migrationSQL = readFileSync(migrationPath, "utf8");

    console.log("📄 Executing database migration...");
    await pool.query(migrationSQL);

    console.log("✅ Database initialized successfully!");
    console.log("\n📊 Sample data created:");
    console.log("- 3 demo projects");
    console.log("- 1 carbon credit minted");
    console.log("- Activity log entries");
    
    // Test database connection
    const result = await pool.query("SELECT COUNT(*) as project_count FROM projects");
    console.log(`- ${result.rows[0].project_count} projects in database`);

    console.log("\n🔗 Database connection successful!");
    console.log("Your XC3 platform is ready to use.");

  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the initialization
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
