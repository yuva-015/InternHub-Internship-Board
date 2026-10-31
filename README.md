# InternHub – Full Stack Internship Portal

**EdVyro Full Stack Development Internship | TASK-4: Production-Ready Capstone**

InternHub is a responsive full-stack internship portal that allows students to discover internship opportunities, filter listings, view internship details, and submit applications.

The project demonstrates frontend-backend integration, REST API development, SQLite database persistence, input validation, API security, health monitoring, and responsive user interface design.

## Live Website

**Frontend Demo:** https://yuva-015.github.io/InternHub-Internship-Board/

**GitHub Repository:** https://github.com/yuva-015/InternHub-Internship-Board

**Note:** The GitHub Pages website is a frontend deployment and does not host the Node.js backend or SQLite database. To test the complete application, follow the local setup instructions below.

## Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | SQLite with better-sqlite3 |
| Security | Helmet, express-rate-limit, input validation, parameterized SQL |
| Version Control | Git and GitHub |
| Frontend Hosting | GitHub Pages |

## Key Features

- Internship listings loaded from the REST API
- Keyword search and domain filtering
- Work-mode filtering
- Internship details dialog
- Internship application form
- Client-side and server-side validation
- Persistent SQLite application storage
- Duplicate application prevention
- Loading, empty, error, and retry states
- Responsive interface for desktop, tablet, and mobile
- Keyboard-accessible interactions
- Backend request logging
- API and database health monitoring

## User Journey

1. Open the InternHub portal.
2. Browse available internships.
3. Search or filter by domain and work mode.
4. Select an internship to view its details.
5. Click Apply Now.
6. Complete the application form.
7. Submit the application.
8. Receive a success message or a clear validation error.

## Project Structure

```text
Internship-Board/
  index.html
  css/
    style.css
  js/
    script.js
  data/
    internships.json
  assets/
    screenshots/
  backend/
    server.js
    database.js
    seed.js
    package.json
    package-lock.json
    README.md
  TASK3_TEST_REPORT.md
  README.md
```

The SQLite database and installed dependencies are excluded from Git tracking.

## Local Setup

### Prerequisites

- Node.js
- npm
- Git
- Modern web browser

### Installation

Clone the repository:

```bash
git clone https://github.com/yuva-015/InternHub-Internship-Board.git
cd InternHub-Internship-Board
```

Install backend dependencies:

```bash
npm install --prefix backend
```

Initialize the database and seed internship records when setting up a fresh copy:

```bash
node backend/seed.js
```

Start the application:

```bash
node backend/server.js
```

Open:

http://localhost:3000

## REST API

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Check API and database health |
| GET | /api/internships | List internships with pagination |
| GET | /api/internships/:id | Get internship details |
| POST | /api/internships | Create an internship (restricted) |
| PUT | /api/internships/:id | Update an internship (restricted) |
| DELETE | /api/internships/:id | Delete an internship (restricted) |
| POST | /api/applications | Submit an internship application |

Administrative write operations are disabled by default and are not available for public use.

## Security Features

- Helmet HTTP security headers
- API rate limiting
- Application submission rate limiting
- Input validation on the frontend and backend
- Parameterized SQLite queries
- Duplicate application protection
- Restricted administrative write endpoints
- SQLite database excluded from publicly served frontend files
- SQLite database excluded from Git tracking
- Request logging without application form contents

**Security limitation:** The project has not completed a production security audit. Proper administrator authentication, authorization, and production deployment hardening remain future improvements.

## Health Monitoring and Logging

The `/api/health` endpoint checks both the API and SQLite database connectivity.

Example successful response:

```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "message": "InternHub API is running"
}
```

Example backend log:

```text
[API] GET /api/health 200 26ms
```

The log records the request method, path, response status, and duration.

## Engineering Decisions

**Vanilla JavaScript:** Used to keep the frontend lightweight and beginner-friendly.

**Express.js:** Provides REST API routing and middleware integration.

**SQLite:** Provides simple persistent storage without requiring a separate database server.

**Parameterized SQL:** Helps protect database operations against SQL injection.

**Rate limiting:** Reduces excessive API requests.

**Restricted static file serving:** Prevents backend files and the SQLite database from being publicly downloadable.

**Health checks:** Help identify API and database availability problems.

## Quality Assurance

Previously completed TASK-3 tests are documented in `TASK3_TEST_REPORT.md`.

TASK-4 additionally includes accessibility, mobile responsiveness, performance, security, and regression verification. Results will be documented separately after testing.

## Known Limitations

- GitHub Pages hosts the frontend only.
- The complete full-stack application currently runs locally.
- Administrative authentication and authorization are not implemented.
- Production deployment and independent security review are pending.

## Future Improvements

- Secure administrator authentication
- Application status tracking
- Email notifications
- Cloud database and backend deployment
- Automated integration tests

## Author

**Yuvathi**

EdVyro Full Stack Development Internship