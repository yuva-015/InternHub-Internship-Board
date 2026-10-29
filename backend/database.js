
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(
  path.join(__dirname, "internhub.db")
);

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

console.log("InternHub database initialized successfully!");

module.exports = db;
