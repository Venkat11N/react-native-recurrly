import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pg from "pg";

// Load .env from server directory
const envPath = path.join(process.cwd(), ".env");
console.log("Loading .env from:", envPath);
console.log(".env file exists:", fs.existsSync(envPath));

const result = dotenv.config({ path: envPath, override: true });
if (result.error) {
  console.error("Error loading .env:", result.error);
}

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set!");
  console.error("Please set DATABASE_URL in your .env file");
  process.exit(1);
}

// Mask password for logging
const maskedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@");
console.log("Connecting to PostgreSQL:", maskedUrl);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
});

// Test database connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  // Log error but don't force exit - let application handle it
});

// Test connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to PostgreSQL database:", err.message);
    console.error("Full error:", err);
    console.error(
      "Please check your DATABASE_URL and ensure PostgreSQL is running",
    );
    console.error(
      "Try running: psql -U postgres -d recurrly to test connection manually",
    );
    process.exit(1);
  }
  console.log("Successfully connected to PostgreSQL database");
  release();
});

export default pool;
