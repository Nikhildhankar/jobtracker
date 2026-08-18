# JobTracker

[![CI/CD Pipeline](https://github.com/Nikhildhankar/jobtracker/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Nikhildhankar/jobtracker/actions/workflows/ci-cd.yml)
[![Deploy](https://github.com/Nikhildhankar/jobtracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nikhildhankar/jobtracker/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack job application tracking system with AI-powered resume analysis, interview preparation, and automated follow-up drafting.

**[Live Demo →](https://nikhildhankar.github.io/jobtracker/)**

---

## Features

- **Pipeline Management** — Drag-and-drop Kanban board across six stages with full stage history
- **Dashboard Analytics** — Response rate, funnel visualisation, activity feed, and attention alerts
- **ATS Resume Analyser** — Job description keyword matching, gap analysis, and AI bullet rewriter
- **Interview Prep** — Role-specific question generation, STAR answer builder with AI critique, and answer bank
- **Action Center** — Stale application detection and AI-drafted follow-up emails
- **Authentication** — Custom session-based auth with HTTP-only cookies, email verification, and password reset

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 19, TypeScript 6, Vite 8 |
| Backend | Node.js 22, Express 5, TypeScript |
| Database | MongoDB 7, Mongoose 9 |
| AI | Google Gemini API |
| Tooling | OxLint, Docker, GitHub Actions |

---

## Getting Started

**Prerequisites:** Node.js 22+, MongoDB

```bash
git clone https://github.com/Nikhildhankar/jobtracker.git
cd jobtracker
npm install
```

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/jobtracker
SESSION_SECRET=<generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
GEMINI_API_KEY=<optional>
```

Start both servers:

```bash
npm run dev:server   # Backend on :5000
npm run dev          # Frontend on :5173
```

### Docker

```bash
docker compose up --build
```

---

## Testing

```bash
npm run test:all       # Run all integration suites
npm run test:auth      # Auth & session tests
npm run test:apps      # Application CRUD tests
npm run test:ats       # ATS & resume tests
npm run test:prep      # Interview prep tests
npm run test:action    # Action center tests
```

Tests use an in-memory MongoDB instance automatically — no local database required.

---

## CI/CD

Every push to `main` runs a sequential pipeline:

1. **Lint & Typecheck** — OxLint + `tsc -b`
2. **Integration Tests** — All 7 suites against a live MongoDB 7.0 service container
3. **Build & Docker** — Vite production build + Docker image sanity check

A separate workflow deploys the frontend to GitHub Pages on every successful push.

---

## License

MIT © [Nikhil Dhankar](https://github.com/Nikhildhankar)
