
"use strict";

const express = require("express");
const path = require("path");
const helmet = require("helmet");
const { rateLimit } = require("express-rate-limit");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
// TASK-4: Request logging
app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    // Log only API requests; avoid personal application data.
    if (req.path.startsWith("/api")) {
      console.log(
        `[API] ${req.method} ${req.path} ${res.statusCode} ${duration}ms`
      );
    }
  });

  next();
});
// Security middleware
app.use(helmet());
app.use(express.json({ limit: "20kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests. Please try again later."
  }
});

const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many applications. Please try again later."
  }
});

app.use("/api", apiLimiter);

// IMPORTANT:
// Admin authentication is not implemented yet.
// Keep write endpoints disabled by default.
// Enable only for trusted local development.
const allowLocalAdmin =
  process.env.ENABLE_LOCAL_ADMIN === "true" &&
  process.env.NODE_ENV !== "production";

function requireLocalAdmin(req, res, next) {
  const ip = req.ip || "";
  const isLocal =
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip === "::ffff:127.0.0.1";

  if (!allowLocalAdmin || !isLocal) {
    return res.status(403).json({
      success: false,
      error: "Administrative access is disabled."
    });
  }

  next();
}

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateInternship(body) {
  const title = cleanString(body.title);
  const domain = cleanString(body.domain);
  const mode = cleanString(body.mode);
  const location = cleanString(body.location);
  const openings = body.openings;
  const skills = body.skills;

  if (!title || title.length > 150) {
    return "Valid internship title is required.";
  }

  if (!domain || domain.length > 100) {
    return "Valid domain is required.";
  }

  if (!mode || mode.length > 50) {
    return "Valid work mode is required.";
  }

  if (!location || location.length > 150) {
    return "Valid location is required.";
  }

  if (
    !Number.isInteger(openings) ||
    openings < 0 ||
    openings > 100000
  ) {
    return "Openings must be a non-negative integer.";
  }

  if (
    !Array.isArray(skills) ||
    skills.length > 30 ||
    !skills.every(
      skill =>
        typeof skill === "string" &&
        skill.trim().length > 0 &&
        skill.length <= 100
    )
  ) {
    return "Skills must be an array of valid strings.";
  }

  return null;
}

function formatInternship(row) {
  return {
    ...row,
    skills: JSON.parse(row.skills)
  };
}

// TASK-4: API and database health check
app.get("/api/health", (req, res) => {
  try {
    db.prepare("SELECT 1 AS healthy").get();

    res.json({
      success: true,
      status: "healthy",
      database: "connected",
      message: "InternHub API is running"
    });
  } catch (error) {
    console.error("[HEALTH] Database check failed");

    res.status(503).json({
      success: false,
      status: "unhealthy",
      database: "unavailable",
      message: "Service temporarily unavailable"
    });
  }
});

// GET all internships with pagination
app.get("/api/internships", (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 10);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      success: false,
      error: "Invalid pagination parameters."
    });
  }

  const total = db
    .prepare("SELECT COUNT(*) AS total FROM internships")
    .get().total;

  const offset = (page - 1) * limit;

  const rows = db
    .prepare(
      "SELECT * FROM internships ORDER BY id LIMIT ? OFFSET ?"
    )
    .all(limit, offset);

  res.json({
    success: true,
    data: rows.map(formatInternship),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

// GET internship by ID
app.get("/api/internships/:id", (req, res) => {
  const row = db
    .prepare("SELECT * FROM internships WHERE id = ?")
    .get(req.params.id);

  if (!row) {
    return res.status(404).json({
      success: false,
      error: "Internship not found"
    });
  }

  res.json({
    success: true,
    data: formatInternship(row)
  });
});

// CREATE internship - local admin only
app.post("/api/internships", requireLocalAdmin, (req, res) => {
  const error = validateInternship(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error
    });
  }

  const id = cleanString(req.body.id);

  if (!/^INT-\d+$/.test(id)) {
    return res.status(400).json({
      success: false,
      error: "Invalid internship ID."
    });
  }

  const existing = db
    .prepare("SELECT id FROM internships WHERE id = ?")
    .get(id);

  if (existing) {
    return res.status(409).json({
      success: false,
      error: "Internship already exists."
    });
  }

  const internship = {
    id,
    title: cleanString(req.body.title),
    domain: cleanString(req.body.domain),
    mode: cleanString(req.body.mode),
    location: cleanString(req.body.location),
    skills: req.body.skills.map(skill => skill.trim()),
    openings: req.body.openings
  };

  db.prepare(`
    INSERT INTO internships
    (id, title, domain, mode, location, skills, openings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    internship.id,
    internship.title,
    internship.domain,
    internship.mode,
    internship.location,
    JSON.stringify(internship.skills),
    internship.openings
  );

  res.status(201).json({
    success: true,
    data: internship
  });
});

// UPDATE internship - local admin only
app.put("/api/internships/:id", requireLocalAdmin, (req, res) => {
  const error = validateInternship(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error
    });
  }

  const internship = {
    id: req.params.id,
    title: cleanString(req.body.title),
    domain: cleanString(req.body.domain),
    mode: cleanString(req.body.mode),
    location: cleanString(req.body.location),
    skills: req.body.skills.map(skill => skill.trim()),
    openings: req.body.openings
  };

  const result = db.prepare(`
    UPDATE internships
    SET title = ?,
        domain = ?,
        mode = ?,
        location = ?,
        skills = ?,
        openings = ?
    WHERE id = ?
  `).run(
    internship.title,
    internship.domain,
    internship.mode,
    internship.location,
    JSON.stringify(internship.skills),
    internship.openings,
    internship.id
  );

  if (result.changes === 0) {
    return res.status(404).json({
      success: false,
      error: "Internship not found"
    });
  }

  res.json({
    success: true,
    data: internship
  });
});

// DELETE internship - local admin only
app.delete("/api/internships/:id", requireLocalAdmin, (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM internships WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        error: "Internship not found"
      });
    }

    res.json({
      success: true,
      message: "Internship deleted successfully"
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_FOREIGNKEY") {
      return res.status(409).json({
        success: false,
        error: "Cannot delete an internship with applications."
      });
    }

    throw error;
  }
});

// Application submission
app.post("/api/applications", applicationLimiter, (req, res) => {
  const internshipId = cleanString(req.body.internshipId);
  const name = cleanString(req.body.name);
  const email = cleanString(req.body.email).toLowerCase();
  const college = cleanString(req.body.college);
  const skills = cleanString(req.body.skills);

  if (!/^INT-\d+$/.test(internshipId)) {
    return res.status(400).json({
      success: false,
      error: "Valid internship ID is required."
    });
  }

  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({
      success: false,
      error: "Name must contain 2 to 100 characters."
    });
  }

  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({
      success: false,
      error: "Valid email address is required."
    });
  }

  if (college.length < 2 || college.length > 150) {
    return res.status(400).json({
      success: false,
      error: "College must contain 2 to 150 characters."
    });
  }

  if (skills.length < 2 || skills.length > 500) {
    return res.status(400).json({
      success: false,
      error: "Skills must contain 2 to 500 characters."
    });
  }

  const internship = db
    .prepare("SELECT id, openings FROM internships WHERE id = ?")
    .get(internshipId);

  if (!internship) {
    return res.status(404).json({
      success: false,
      error: "Internship not found."
    });
  }

  if (internship.openings <= 0) {
    return res.status(409).json({
      success: false,
      error: "No openings are currently available."
    });
  }

  try {
    const result = db.prepare(`
      INSERT INTO applications
      (internship_id, name, email, college, skills)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      internshipId,
      name,
      email,
      college,
      skills
    );

    res.status(201).json({
      success: true,
      message: "Application submitted successfully!",
      data: {
        id: result.lastInsertRowid,
        internshipId,
        name,
        email,
        status: "Submitted"
      }
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        error: "You have already applied for this internship."
      });
    }

    throw error;
  }
});

// Secure frontend serving
// Never expose the backend folder or SQLite database.
const frontendPath = path.join(__dirname, "..");

app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.get("/index.html", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use("/css", express.static(path.join(frontendPath, "css")));
app.use("/js", express.static(path.join(frontendPath, "js")));
app.use("/assets", express.static(path.join(frontendPath, "assets")));

// Unknown API endpoints
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "API endpoint not found."
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error("Server error:", error.message);

  res.status(500).json({
    success: false,
    error: "Internal server error."
  });
});

app.listen(PORT, () => {
  console.log(`InternHub running at http://localhost:${PORT}`);
  console.log("Backend database files are not publicly served.");
});
