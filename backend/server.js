
const express = require("express");
const db = require("./database");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Convert database record into API response
function formatInternship(row) {
  return {
    ...row,
    skills: JSON.parse(row.skills)
  };
}

// Validate internship data
function validateInternship(data, requireId = false) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return "Request body must be a JSON object";
  }

  const { id, title, domain, mode, location, skills, openings } = data;

  if (requireId && (
    typeof id !== "string" ||
    !/^INT-\d+$/.test(id)
  )) {
    return "ID must follow the format INT-101";
  }

  if (typeof title !== "string" || !title.trim()) {
    return "Valid title is required";
  }

  if (typeof domain !== "string" || !domain.trim()) {
    return "Valid domain is required";
  }

  if (!["Remote", "Hybrid", "On-site"].includes(mode)) {
    return "Mode must be Remote, Hybrid, or On-site";
  }

  if (typeof location !== "string" || !location.trim()) {
    return "Valid location is required";
  }

  if (
    !Array.isArray(skills) ||
    !skills.every(
      skill => typeof skill === "string" && skill.trim()
    )
  ) {
    return "Skills must be an array of non-empty strings";
  }

  if (!Number.isInteger(openings) || openings < 0) {
    return "Openings must be a non-negative integer";
  }

  return null;
}

// HOME API
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "InternHub API is running successfully!"
  });
});

// GET ALL INTERNSHIPS + PAGINATION
app.get("/api/internships", (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);

  if (
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      success: false,
      error: "Page must be >= 1 and limit must be between 1 and 100"
    });
  }

  const offset = (page - 1) * limit;

  const rows = db.prepare(`
    SELECT * FROM internships
    ORDER BY id
    LIMIT ? OFFSET ?
  `).all(limit, offset);

  const total = db.prepare(
    "SELECT COUNT(*) AS count FROM internships"
  ).get().count;

  res.status(200).json({
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

// GET INTERNSHIP BY ID
app.get("/api/internships/:id", (req, res) => {
  const internship = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  if (!internship) {
    return res.status(404).json({
      success: false,
      error: "Internship not found"
    });
  }

  res.status(200).json({
    success: true,
    data: formatInternship(internship)
  });
});

// POST - CREATE INTERNSHIP
app.post("/api/internships", (req, res) => {
  const error = validateInternship(req.body, true);

  if (error) {
    return res.status(400).json({
      success: false,
      error
    });
  }

  const { id, title, domain, mode, location, skills, openings } = req.body;

  const existing = db.prepare(
    "SELECT id FROM internships WHERE id = ?"
  ).get(id);

  if (existing) {
    return res.status(409).json({
      success: false,
      error: "Internship ID already exists"
    });
  }

  db.prepare(`
    INSERT INTO internships
    (id, title, domain, mode, location, skills, openings)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title.trim(),
    domain.trim(),
    mode,
    location.trim(),
    JSON.stringify(skills),
    openings
  );

  const created = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(id);

  res.status(201).json({
    success: true,
    data: formatInternship(created)
  });
});

// PUT - UPDATE INTERNSHIP
app.put("/api/internships/:id", (req, res) => {
  const existing = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: "Internship not found"
    });
  }

  const error = validateInternship(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      error
    });
  }

  const { title, domain, mode, location, skills, openings } = req.body;

  db.prepare(`
    UPDATE internships
    SET title = ?, domain = ?, mode = ?,
        location = ?, skills = ?, openings = ?
    WHERE id = ?
  `).run(
    title.trim(),
    domain.trim(),
    mode,
    location.trim(),
    JSON.stringify(skills),
    openings,
    req.params.id
  );

  const updated = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  res.status(200).json({
    success: true,
    data: formatInternship(updated)
  });
});

// DELETE - REMOVE INTERNSHIP
app.delete("/api/internships/:id", (req, res) => {
  const existing = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(req.params.id);

  if (!existing) {
    return res.status(404).json({
      success: false,
      error: "Internship not found"
    });
  }

  db.prepare(
    "DELETE FROM internships WHERE id = ?"
  ).run(req.params.id);

  res.status(200).json({
    success: true,
    message: "Internship deleted successfully",
    data: {
      id: req.params.id
    }
  });
});

// Handle unknown API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found"
  });
});

// Handle invalid JSON and unexpected errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      error: "Invalid JSON request body"
    });
  }

  console.error(err);

  res.status(500).json({
    success: false,
    error: "Internal server error"
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`InternHub API running at http://localhost:${PORT}`);
});
