// server/src/db/database.js
/**
 * ============================================================================
 * DATABASE INITIALIZATION & CONNECTION (SQLite via better-sqlite3)
 * ============================================================================
 * Why SQLite with better-sqlite3 for Portfolio & Interview Demonstration?
 * 1. Zero-Friction Setup: No need to install and configure heavy database daemons
 *    like Docker or Postgres for the interviewer to run and evaluate your project.
 * 2. ACID Compliant & Production-Tested: Uses Write-Ahead Logging (WAL) for
 *    fast, concurrent reads and synchronous writes.
 * 3. Clean Separation: We apply the Repository Pattern on top of this layer,
 *    meaning migrating to PostgreSQL only requires changing the SQL driver/queries
 *    inside the repository files, leaving business controllers untouched!
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('../config');

// Ensure parent directory for database file exists
const dbDir = path.dirname(config.DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Open SQLite connection
const db = new Database(config.DB_PATH, {
  // verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// Enable Write-Ahead Logging (WAL) for high performance and concurrency
db.pragma('journal_mode = WAL');
// Enforce relational foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

module.exports = db;
