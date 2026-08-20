# JobTracker — Problem Statement & Architectural Solutions (PROBLEMS.md)

This document outlines the core problem statement, architectural challenges, engineering trade-offs, and technical solutions implemented in **JobTracker**.

---

## 1. Problem Statement

Modern job seekers manage dozens of concurrent applications across various portals (LinkedIn, Greenhouse, Lever, Workday), leading to fragmented tracking, missed follow-ups, and unoptimized applications:

1. **Pipeline Disorganization**: Applications are lost across email inboxes and spreadsheets, leading to missed interview loops and stale leads.
2. **ATS Rejection**: Candidates submit generic resumes that fail Applicant Tracking System (ATS) keyword parsing and semantic alignment.
3. **Unstructured Interview Prep**: Candidates lack targeted technical and behavioral preparation tailored to the specific role and company.
4. **Recruiter Silence**: High-potential leads go cold without structured, professional follow-up nudges.
5. **Privacy & Data Security**: Candidates' sensitive employment histories and personal contacts must remain strictly private and isolated.

---

## 2. Engineering Problems Solved

### Problem 1: React Context Infinite Re-render Cascades (CPU Lag & Crashes)
- **Symptom**: High CPU usage, browser tab freezing, and max call stack errors upon opening Dashboard or Pipeline pages.
- **Root Cause**: State update functions in `UIContext` (e.g. `updateStageCounts`) were unmemoized. Calling them inside page `useEffect` hooks created new function references on every render, triggering infinite re-fetch loops.
- **Solution**:
  - Wrapped all state mutation handlers (`updateStageCounts`, `openDrawer`, `closeDrawer`, `toggleSidebar`) in `useCallback`.
  - Memoized the `UIContext.Provider` value with `useMemo`.
  - Stabilized `useEffect` dependency graphs across all page components.

---

### Problem 2: Static Hosting Decoupling vs Stateful Full-Stack Backend
- **Symptom**: Static deployments (e.g., GitHub Pages) returned `404 Not Found (HTML)` for `/api/auth/login` and `/api/auth/signup`, causing generic "Signup failed" errors on the frontend.
- **Root Cause**: GitHub Pages is a static file host with no running Node.js/Express server.
- **Solution**:
  - Implemented dual-mode authentication in `AuthContext.tsx`.
  - When connecting to a live Express API server (`http://localhost:5000`), real MongoDB sessions and HTTP-only cookies are utilized.
  - When running in decoupled static mode (GitHub Pages or offline), the client automatically provisions a local session (`localStorage`) with rich sample seed data (Stripe, OpenAI, Google, Vercel, Figma) so the full UI remains 100% interactive and testable.

---

### Problem 3: Multi-Tenant Data Isolation & Cross-Account Leaks
- **Symptom**: Risk of User A reading or modifying User B's job applications, resumes, or interview questions.
- **Solution**:
  - Implemented strict middleware authorization (`requireAuth`) extracting the authenticated user ID from opaque session tokens.
  - Enforced `{ userId: req.user.id }` scoping on **every single MongoDB query** across all models (`Application`, `Resume`, `AnswerBank`).
  - Added dedicated integration tests in `test/applications.test.ts` and `test/ats.test.ts` verifying that cross-tenant access attempts return `404 Not Found` or `401 Unauthorized`.

---

### Problem 4: Session Security vs JWT Vulnerabilities
- **Symptom**: JWTs stored in `localStorage` are susceptible to XSS token theft, while stateless JWTs cannot be immediately revoked upon password reset or logout.
- **Solution**:
  - Adopted custom opaque session tokens (32 cryptographically random bytes via `crypto.randomBytes(32)`).
  - Sessions are indexed server-side in MongoDB with automated TTL expiration.
  - Session cookies are set with strict security attributes:
    ```ts
    res.cookie('jobtracker_session', sessionId, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: env.NODE_ENV === 'production' ? 'strict' : 'lax',
      expires: expiresAt,
      path: '/',
    });
    ```
  - Immediate server-side session deletion on logout and password reset.

---

### Problem 5: ATS Keyword Gap Analysis & Anti-Slop Truthful Rewriting
- **Symptom**: Generic LLM prompts produce exaggerated or fabricated candidate bullet points, risking interview disqualification.
- **Solution**:
  - Built a deterministic ATS scoring engine analyzing exact keyword frequency, hard skill overlap, and length metrics.
  - Constrained AI bullet rewriting to quantify existing accomplishments and embed missing keywords without inventing fictitious roles or certifications.
  - Structured prompt outputs using Zod schemas with fallback JSON parsing.

---

### Problem 6: CI/CD Test Process Hangs in Containerized Runners
- **Symptom**: GitHub Actions CI/CD pipeline hung indefinitely during integration test execution.
- **Root Cause**: Open Node.js event loops (active Mongoose connections and Express server listeners) prevented test runners from gracefully terminating.
- **Solution**:
  - Added explicit connection teardown (`mongoose.disconnect()`) and `process.exit(0)` upon successful assertion completion in all 7 integration test files (`test/*.test.ts`).
  - Replaced runner-specific MongoDB CLI tools (`mongosh`) with cross-platform TCP socket polling (`nc -z localhost 27017`) in `.github/workflows/ci-cd.yml`.

---

## 3. Developer & Operational Troubleshooting

| Issue | Cause | Resolution |
| :--- | :--- | :--- |
| **Local `/api` 404s** | Vite dev server running on `:5173` without reverse proxy. | Configured `server.proxy` in `vite.config.ts` targeting `http://localhost:5000`. |
| **Missing CSS Styling** | Vite compiler missing CSS pipeline integration. | Installed and configured `@tailwindcss/vite` and modular Vanilla CSS imports in `src/index.css`. |
| **MongoDB Not Found** | Local MongoDB daemon not running during test execution. | Automated in-memory database fallback (`mongodb-memory-server`) in test suites. |
| **Password Validation Error** | Password length `< 8` characters rejected by Zod schema. | Added human-readable error messages and frontend `minLength={8}` hints. |

---

## 4. Architectural Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    JobTracker Client (SPA)                   │
│   React 19 • Vite 8 • TypeScript 6 • Modular Vanilla CSS    │
└──────────────────────────────┬──────────────────────────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                               ▼
     [Local / Static Mode]            [Full-Stack Production]
  Client-Side Fallback Store       Express 5 API Server (:5000)
    (localStorage Mock Data)                   │
                                   ┌───────────┴───────────┐
                                   ▼                       ▼
                              MongoDB 7.0           Google Gemini
                         (Users, Apps, Resumes)     (ATS & Prep)
```
