
"use strict";

const Database = require("better-sqlite3");
const path = require("path");

// Connect to existing SQLite database
const db = new Database(
  path.join(__dirname, "internhub.db")
);

// Enable foreign key relationships
db.pragma("foreign_keys = ON");

// Existing internships table
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

// New applications table
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

console.log(
  "InternHub database initialized successfully!"
);

module.exports = db;
