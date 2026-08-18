# JobTracker

[![CI/CD Pipeline](https://github.com/Nikhildhankar/jobtracker/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Nikhildhankar/jobtracker/actions/workflows/ci-cd.yml)
[![Deployment](https://github.com/Nikhildhankar/jobtracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nikhildhankar/jobtracker/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**JobTracker** is an enterprise-grade career management platform designed to streamline job search workflows, optimize applicant tracking system (ATS) resume compatibility, and provide AI-assisted interview preparation and recruiter communication.

🌐 **Live Application**: [https://nikhildhankar.github.io/jobtracker/](https://nikhildhankar.github.io/jobtracker/)

---

## Key Capabilities

### 1. Unified Pipeline Management
- **Dual View Modes**: Seamless toggle between a high-density tabular view (Simplify-inspired) and an interactive drag-and-drop Kanban board.
- **Dynamic Search & Filtering**: Multi-parameter search across companies, roles, and locations with live stage filter chips and multi-key sorting.
- **1-Click Stage Transitions**: Status pills allowing instantaneous status updates across pipeline stages with historical timestamp auditing.

### 2. Job Search Analytics & Insights
- **KPI Metrics**: Real-time tracking of active pipeline volume, active interview loops, conversion timelines, and recruiter response rates.
- **Conversion Funnel**: Stacked progress visualizer reflecting distribution across application milestones (*Wishlist*, *Applied*, *Screening*, *Interviewing*, *Offer*, *Archived*).
- **Activity & Audit Trail**: Chronological logging of stage movements, recruiter correspondence, and timeline history.

### 3. AI-Powered ATS Resume Optimization
- **Keyword Gap Analysis**: Automatic extraction and comparison of target job description requirements against candidate resumes.
- **Truthful Bullet Rewriting**: AI-assisted bullet point suggestions quantifying achievements while maintaining authentic experience.

### 4. Structured Interview Preparation & STAR Coach
- **Targeted Question Generation**: Context-aware technical and behavioral question generation tailored to company and role profiles.
- **STAR Method Builder**: Structured editor for crafting Situation, Task, Action, and Result responses.
- **AI Answer Evaluation**: Rubric-based scoring and actionable critique with a persistent Answer Bank.

### 5. Proactive Action Center & Recruiter Follow-ups
- **Stale Application Alerts**: Automated detection of applications exceeding response thresholds (7+ days).
- **AI Email Drafting**: One-click generation of professional recruiter follow-up emails customized to specific interview loops.

### 6. Secure Authentication & Session Management
- Custom opaque session tokens stored in secure, `HTTP-only` cookies with SHA-256 server-side indexing.
- Multi-tenant data isolation with cryptographic password hashing (bcrypt, 12 salt rounds).
- Self-contained offline/demo fallback mode for decoupled static environments.

---

## Technical Architecture

| Component | Specification |
| :--- | :--- |
| **Frontend** | React 19, TypeScript 6, Vite 8, Framer Motion, Vanilla CSS Design System |
| **Backend** | Node.js 22 LTS, Express 5, TypeScript |
| **Database** | MongoDB 7.0, Mongoose 9 ODM |
| **AI Services** | Google Gemini API (Structured JSON generation & deterministic fallback) |
| **Security** | Opaque Session Tokens, HTTP-only Cookies, Zod Schema Validation |
| **Quality & CI/CD** | OxLint, TypeScript Compiler, In-Memory Mongo Integration Tests, Docker, GitHub Actions |

---

## Getting Started

### Prerequisites
- **Node.js**: `v22.0.0` or higher
- **MongoDB**: `v7.0.0` or higher (local or MongoDB Atlas connection)

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Nikhildhankar/jobtracker.git
   cd jobtracker
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/jobtracker
   SESSION_SECRET=your-32-byte-hex-session-secret
   GEMINI_API_KEY=your-gemini-api-key-optional
   ```

4. **Start the development servers**:
   ```bash
   npm run dev:server   # Starts Express API server on http://localhost:5000
   npm run dev          # Starts Vite development server on http://localhost:5173
   ```

---

## Docker Deployment

To build and run the entire application using Docker Compose:

```bash
docker compose up --build -d
```

Services exposed:
- **Web Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **MongoDB Instance**: `localhost:27017`

---

## Verification & Test Suite

The repository contains automated integration test suites covering authentication, session management, multi-tenancy isolation, application CRUD, ATS analysis, and AI services.

```bash
npm run test:all       # Executes all integration test suites sequentially
npm run test:backend   # Scaffold & AI service validation
npm run test:auth      # Session creation, verification, and logout
npm run test:apps      # Application CRUD and pipeline stages
npm run test:ats       # Resume parsing and keyword gap analysis
npm run test:prep      # Interview question generation and STAR evaluation
npm run test:action    # Stale alert triggers and email drafting
```

*Note: Integration tests automatically utilize an isolated in-memory MongoDB instance when a local instance is unavailable.*

---

## Continuous Integration & Deployment (CI/CD)

All commits pushed to the `main` branch trigger a multi-stage GitHub Actions pipeline:

1. **Static Analysis & Type Checking**: Code quality verification via `oxlint` and full compilation via `tsc -b`.
2. **Automated Integration Testing**: Execution of all test suites against a containerized MongoDB service.
3. **Production Build & Container Verification**: Production bundle generation and Docker build validation.
4. **Automated Deployment**: Seamless publication of client assets to GitHub Pages.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Nikhil Dhankar.
