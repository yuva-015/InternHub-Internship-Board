
"use strict";

const express = require("express");
const bcrypt = require("bcryptjs");
const { rateLimit } = require("express-rate-limit");
const db = require("./database");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many attempts. Please try again later."
  }
});

function validEmail(email) {
  return (
    email.length <= 254 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  );
}

// Student signup
router.post("/signup", authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body || {};

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

    if (cleanName.length < 2 || cleanName.length > 100) {
      return res.status(400).json({
        success: false,
        error: "Name must contain 2 to 100 characters."
      });
    }

    if (!validEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        error: "Enter a valid email address."
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 12 ||
      Buffer.byteLength(password, "utf8") > 72
    ) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 12 characters and no more than 72 bytes."
      });
    }

    const existing = db.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).get(cleanEmail);

    if (existing) {
      return res.status(409).json({
        success: false,
        error: "This email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = db.prepare(`
      INSERT INTO users (name, email, password_hash)
      VALUES (?, ?, ?)
    `).run(cleanName, cleanEmail, passwordHash);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      data: {
        id: result.lastInsertRowid,
        name: cleanName,
        email: cleanEmail
      }
    });
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(409).json({
        success: false,
        error: "This email is already registered."
      });
    }
    next(error);
  }
});

// Student login
router.post("/login", authLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    const cleanEmail = typeof email === "string"
      ? email.trim().toLowerCase()
      : "";

    if (
      !validEmail(cleanEmail) ||
      typeof password !== "string"
    ) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password."
      });
    }

    const user = db.prepare(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?"
    ).get(cleanEmail);

    const valid = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid email or password."
      });
    }

    if (!req.session) {
      return res.status(503).json({
        success: false,
        error: "Login sessions are not configured."
      });
    }

    req.session.regenerate(error => {
      if (error) return next(error);

      req.session.userId = user.id;

      req.session.save(error => {
        if (error) return next(error);

        return res.json({
          success: true,
          message: "Login successful!",
          data: {
            id: user.id,
            name: user.name,
            email: user.email
          }
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

// Current logged-in student
router.get("/me", (req, res) => {
  if (!req.session?.userId) {
    return res.status(401).json({
      success: false,
      error: "Please log in."
    });
  }

  const user = db.prepare(
    "SELECT id, name, email FROM users WHERE id = ?"
  ).get(req.session.userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      error: "Session is no longer valid."
    });
  }

  return res.json({
    success: true,
    data: user
  });
});

// Student logout
router.post("/logout", (req, res, next) => {
  if (!req.session) {
    return res.status(503).json({
      success: false,
      error: "Login sessions are not configured."
    });
  }

  req.session.destroy(error => {
    if (error) return next(error);

    res.clearCookie("internhub.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    });

    return res.json({
      success: true,
      message: "Logged out successfully."
    });
  });
});

module.exports = router;
