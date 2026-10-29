# InternHub – REST API and Persistent Data

## Project Overview

InternHub is a responsive internship board with a REST API backend built using Node.js, Express.js, and SQLite.

The backend supports internship record management, input validation, pagination, and persistent data storage.

## Technologies Used

- Node.js
- Express.js
- SQLite
- better-sqlite3
- JavaScript

## Features

- View all internships
- View internship details by ID
- Create new internship records
- Update existing internship records
- Delete internship records
- Pagination support
- Input validation
- Consistent HTTP status codes and JSON error responses
- Persistent SQLite database

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API status |
| GET | `/api/internships` | List internships |
| GET | `/api/internships/:id` | Get internship by ID |
| POST | `/api/internships` | Create internship |
| PUT | `/api/internships/:id` | Update internship |
| DELETE | `/api/internships/:id` | Delete internship |

## Pagination

Example:

`GET /api/internships?page=1&limit=5`

## Installation and Setup

1. Clone the repository.
2. Open the `backend` folder in the terminal.
3. Install dependencies:

   `npm install`

4. Add the sample internship records:

   `node seed.js`

5. Start the backend server:

   `node server.js`

6. Open:

   `http://localhost:3000/api/internships`

The SQLite database is initialized automatically by `database.js`.

## Internship Data Model

Each internship record contains:

- `id`
- `title`
- `domain`
- `mode`
- `location`
- `skills`
- `openings`

## HTTP Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Internship created |
| 400 | Invalid input |
| 404 | Internship not found |
| 409 | Duplicate internship ID |
| 500 | Internal server error |

## Database

SQLite stores internship records in `internhub.db`.

The database file is excluded from GitHub using `.gitignore`. Run `node seed.js` to populate the sample data.

## Project

**InternHub – Responsive Internship Board**

EdVyro Full Stack Development Internship – REST API and Persistent Data Milestone.
