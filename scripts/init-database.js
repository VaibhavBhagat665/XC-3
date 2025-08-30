#!/usr/bin/env node

/**
 * XC3 Database Initialization Script
 * Sets up the complete database schema with sample data
 */

import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:password@localhost:5432/xc3",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

const initializeDatabase = async () => {
  console.log("�� Initializing XC3 Database...");

  try {
    // Test connection first
    console.log("📡 Testing database connection...");
    const testResult = await pool.query("SELECT NOW()");
    console.log("✅ Database connected successfully");

    // Read and execute schema
    console.log("📄 Creating database schema...");
    const schemaSQL = fs.readFileSync(
      path.join(
        __dirname,
        "..",
        "server",
        "migrations",
        "001_initial_schema.sql",
      ),
      "utf8",
    );

    await pool.query(schemaSQL);
    console.log("✅ Database schema created");

    // Verify tables were created
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("📊 Created tables:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // Check sample data
    const projectsCount = await pool.query("SELECT COUNT(*) FROM projects");
    console.log(
      `\n💾 Sample data: ${projectsCount.rows[0].count} projects loaded`,
    );

    console.log("\n🎉 Database initialization complete!");
    console.log("\n🔗 Your XC3 platform is ready with:");
    console.log("  ✅ Complete database schema");
    console.log("  ✅ Sample carbon credit projects");
    console.log("  ✅ Activity logs and metrics");
    console.log("  ✅ Market and lending tables");
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);

    if (error.code === "ECONNREFUSED") {
      console.log(
        "\n💡 Connection refused. Make sure your database is running and DATABASE_URL is correct.",
      );
      console.log(
        "   For Neon: Get your connection string from https://console.neon.tech",
      );
      console.log(
        "   For local: Ensure PostgreSQL is running on localhost:5432",
      );
    }

    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase();
}

export { initializeDatabase };
