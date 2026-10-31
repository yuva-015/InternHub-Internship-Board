# InternHub – TASK-4 Test Report

**Project:** InternHub – Full Stack Internship Portal  
**Internship:** EdVyro Full Stack Development  
**Milestone:** TASK-4 – Production-Ready Capstone  
**Author:** Yuvathi  
**Test Date:** 31 October 2026  
**Environment:** Localhost (Node.js, Express.js, SQLite, Chrome)

## 1. Test Summary

The following manual tests were completed to verify the application's functionality, mobile responsiveness, accessibility, API behavior, and basic security controls.

| Test Case | Result |
|---|---|
| API health check | PASS |
| SQLite database health check | PASS |
| API request logging | PASS |
| Mobile internship details popup | PASS |
| Mobile application form layout | PASS |
| Required field validation | PASS |
| Keyboard focus navigation | PASS |
| Lighthouse mobile performance | PASS – 100/100 |
| Lighthouse mobile accessibility | PASS – 100/100 |
| Lighthouse mobile best practices | PASS – 100/100 |
| Lighthouse mobile SEO | PASS – 100/100 |
| Backend database file access restriction | PASS |
| Invalid internship ID handling | PASS |
| Internship keyword search | PASS |
| Domain filtering | PASS |
| Clear filters | PASS |
| Work mode filtering | PASS |
| Application submission | PASS |
| Duplicate application prevention | PASS |

## 2. API Health Check

**Endpoint:** `GET /api/health`

Observed response:

```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "message": "InternHub API is running"
}
```

**Result:** PASS

## 3. Request Logging

Observed terminal output:

```text
[API] GET /api/health 200 26ms
```

**Result:** PASS

## 4. Mobile Responsiveness

Tested using Chrome DevTools mobile emulation at 375 × 667 pixels.

Verified:

- Mobile search and filter controls displayed within the preview.
- Internship details popup opened successfully.
- Apply Now button was visible.
- Application form fields and submission button were visible.
- Empty form submission triggered required-field validation.

**Result:** PASS for the tested mobile screens.

## 5. Accessibility

Keyboard Tab navigation showed visible focus on interactive controls.

Chrome Lighthouse mobile audit scores, as observed during testing:

| Category | Score |
|---|---|
| Performance | 100/100 |
| Accessibility | 100/100 |
| Best Practices | 100/100 |
| SEO | 100/100 |

**Screenshot:** `assets/screenshots/task4-lighthouse-mobile.png`

**Note:** Lighthouse results reflect the tested local page and are not a substitute for a full accessibility or security audit.

## 6. Security Checks

### Database File Access

Requested:

`GET /backend/internhub.db`

Observed:

```text
Cannot GET /backend/internhub.db
```

**Result:** PASS – database file was not served through the tested URL.

### Invalid Internship ID

Requested:

`GET /api/internships/INT-999`

Observed:

```json
{
  "success": false,
  "error": "Internship not found"
}
```

**Result:** PASS

## 7. Regression Testing

Verified:

- Searching for `Frontend` returned the matching internship.
- Selecting `Full Stack Development` filtered the internship list.
- Clear Filters restored all five original internship cards.
- Selecting `Remote` displayed remote internships.
- Submitting a test application returned a success confirmation.
- Repeating the same application returned a duplicate application error.

**Result:** PASS for all listed manual regression tests.

## 8. Limitations

- Testing was primarily manual.
- Mobile layout was checked through Chrome device emulation rather than a physical phone.
- Full automated accessibility testing and security penetration testing were not performed.
- The full-stack application was tested locally; public backend deployment was not verified.
- Production authentication and authorization require further development.

## 9. Conclusion

The tested InternHub user journey, API health monitoring, request logging, mobile screens, filtering, and application submission features behaved as expected during TASK-4 verification.

The project is ready for milestone evidence review, with the documented limitations and future improvements.