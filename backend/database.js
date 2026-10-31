
"use strict";

const Database = require("better-sqlite3");
const path = require("path");

// Connect to existing SQLite database
const db = new Database(
  path.join(__dirname, "internhub.db")
);

// Enable foreign key relationships
db.pragma("foreign_keys = ON");

// Internships table
db.exec(`
  CREATE TABLE IF NOT EXISTS internships (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    domain TEXT NOT NULL,
    mode TEXT NOT NULL,
    location TEXT NOT NULL,
    skills TEXT NOT NULL DEFAULT '[]',
    openings INTEGER NOT NULL CHECK(openings >= 0)
  )
`);

// Applications table
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    internship_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    college TEXT NOT NULL,
    skills TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Submitted',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (internship_id)
      REFERENCES internships(id)
      ON DELETE RESTRICT,

    UNIQUE(internship_id, email)
  )
`);

// TASK-5: Student authentication users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

// TASK-5: Link applications to student accounts
// Existing guest applications remain unchanged
const applicationColumns = db
  .prepare("PRAGMA table_info(applications)")
  .all();

const hasUserId = applicationColumns.some(
  (column) => column.name === "user_id"
);

// Safe database migration
if (!hasUserId) {
  db.exec(`
    ALTER TABLE applications
    ADD COLUMN user_id INTEGER REFERENCES users(id)
  `);

  console.log(
    "Applications user_id column added successfully!"
  );
}

// Index for faster student application tracking
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_applications_user_id
  ON applications(user_id)
`);

console.log(
  "InternHub database initialized successfully!"
);

module.exports = db;
