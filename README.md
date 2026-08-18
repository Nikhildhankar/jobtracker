<div align="center">

# 🚀 JobTracker

### Your AI-Powered Career Pipeline — Track, Analyze & Land More Offers

[![CI/CD Pipeline](https://github.com/Nikhildhankar/jobtracker/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Nikhildhankar/jobtracker/actions/workflows/ci-cd.yml)
[![Deploy to GitHub Pages](https://github.com/Nikhildhankar/jobtracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/Nikhildhankar/jobtracker/actions/workflows/deploy.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

**[🌐 Live Demo](https://nikhildhankar.github.io/jobtracker/)** · **[📋 Report a Bug](https://github.com/Nikhildhankar/jobtracker/issues)** · **[💡 Request a Feature](https://github.com/Nikhildhankar/jobtracker/issues)**

</div>

---

## ✨ Features

JobTracker is a full-stack web application that brings AI to your job search — helping you track every application, optimise your resume, and prep for interviews, all in one place.

### 📊 Smart Dashboard
- Real-time pipeline analytics with response rate, avg. days to reply, and stage funnel visualisation
- Activity feed tracking every stage change across all your applications
- At-a-glance attention items — stale applications and upcoming interviews

### 📌 Kanban Pipeline
- Drag-and-drop Kanban board across 6 stages: **Wishlist → Applied → Screening → Interviewing → Offer → Archived**
- Full application detail cards with salary, work model, location, and contact info
- Complete stage history timeline for every application

### 🤖 AI Resume & ATS Analyser
- Paste any job description and get an instant **ATS match score**
- Identifies missing keywords and required skills vs. your resume
- AI-powered **bullet point rewriter** to close skill gaps with one click

### 🎤 Interview Prep Suite
- Auto-generates **role-specific interview questions** from the job description
- **STAR answer builder** with AI critique — Situation, Task, Action, Result
- Persistent **Answer Bank** to save and review your best answers

### ⚡ Action Center
- Automatically surfaces applications that have gone stale (no activity in 7+ days)
- One-click **AI follow-up email drafter** personalised to the company and contact
- Mark followed-up to keep your pipeline fresh

### 🔐 Secure Authentication
- Custom session-based auth with **HTTP-only cookies** (no JWT in localStorage)
- Email verification flow with tokenised links
- Forgot / reset password with secure time-limited tokens
- Full **multi-tenancy** — complete data isolation between users

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript 6, Vite 8, Motion (Framer) |
| **Backend** | Node.js 22, Express 5, TypeScript |
| **Database** | MongoDB 7 + Mongoose 9 |
| **AI** | Google Gemini API (graceful fallback mode) |
| **Drag & Drop** | dnd-kit |
| **Validation** | Zod |
| **Linting** | OxLint |
| **CI/CD** | GitHub Actions |
| **Containerisation** | Docker + Docker Compose |

---

## 🏗️ Project Structure

```
jobtracker/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   │   ├── action/             # Action Center components
│   │   ├── ats/                # ATS & Resume Editor
│   │   ├── dashboard/          # Stats & Funnel charts
│   │   ├── interview/          # STAR Builder & Answer Bank
│   │   ├── kanban/             # Drag-and-drop board
│   │   ├── shell/              # Navbar, Sidebar, AppLayout
│   │   └── ui/                 # Button, Badge, Drawer, Tabs
│   ├── context/                # React Context + hooks
│   ├── pages/                  # Top-level page components
│   ├── services/               # api.ts — all fetch calls
│   └── styles/                 # Design tokens (CSS variables)
│
├── server/                     # Express backend
│   ├── config/                 # env.ts — Zod-validated env
│   ├── controllers/            # Request handlers
│   ├── db/                     # MongoDB connection
│   ├── middleware/             # Auth, rate limiter
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # Express routers
│   └── services/               # Gemini AI service
│
├── test/                       # Integration test suites
│   ├── health.test.ts          # Phase 1 — scaffold
│   ├── auth.test.ts            # Phase 2 — auth & multi-tenancy
│   ├── dashboard.test.ts       # Phase 4 — analytics
│   ├── applications.test.ts    # Phase 5 — CRUD & pipeline
│   ├── ats.test.ts             # Phase 6 — resume & ATS
│   ├── interviewPrep.test.ts   # Phase 7 — interview AI
│   └── actionCenter.test.ts    # Phase 8 — stale detection
│
├── .github/workflows/
│   ├── ci-cd.yml               # Lint → Tests → Build → Docker
│   └── deploy.yml              # GitHub Pages live demo
│
├── Dockerfile                  # Production container
└── docker-compose.yml          # Full-stack local orchestration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 22+**
- **MongoDB** (local install or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google Gemini API key** (optional — app works in fallback mode without it)

### Local Development

**1. Clone the repository**
```bash
git clone https://github.com/Nikhildhankar/jobtracker.git
cd jobtracker
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment**

Create a `.env` file in the project root:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/jobtracker
SESSION_SECRET=replace_with_random_32_byte_secret   # see tip below
GEMINI_API_KEY=your_gemini_api_key_here              # optional
```

> 💡 **Generate a secure `SESSION_SECRET`:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

**4. Start the backend server**
```bash
npm run dev:server
```

**5. Start the frontend dev server** (in a new terminal)
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### 🐳 Docker (Full-Stack)

Run the entire application with one command:
```bash
docker compose up --build
```

This starts:
- **Frontend + Backend** on `http://localhost:5000`
- **MongoDB** container on port `27017`

---

## 🧪 Running Tests

```bash
# Run all integration test suites sequentially
npm run test:all

# Run individual suites
npm run test:backend     # Phase 1 — scaffold & env
npm run test:auth        # Phase 2 — auth, sessions, multi-tenancy
npm run test:dashboard   # Phase 4 — analytics endpoints
npm run test:apps        # Phase 5 — application CRUD & stage pipeline
npm run test:ats         # Phase 6 — resume & ATS AI
npm run test:prep        # Phase 7 — interview prep & answer bank
npm run test:action      # Phase 8 — action center & email drafter
```

> Tests use **in-memory MongoDB** (via `mongodb-memory-server`) automatically when no local MongoDB is available — no extra setup required.

---

## 🔄 CI/CD Pipeline

Every push to `main` triggers a three-stage pipeline:

```
Push to main
    │
    ▼
┌─────────────────────┐
│  Lint & Typecheck   │  OxLint + tsc -b (Node 22)
└─────────┬───────────┘
          │ ✅
          ▼
┌─────────────────────┐
│ Integration Tests   │  All 7 test suites against live MongoDB 7.0
└─────────┬───────────┘
          │ ✅
          ▼
┌─────────────────────┐
│  Build + Docker     │  Vite prod build + Docker image sanity check
└─────────────────────┘
```

A separate **Deploy workflow** publishes the static frontend to **GitHub Pages** on every push to `main`.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register new user |
| `POST` | `/api/auth/login` | Login + set session cookie |
| `POST` | `/api/auth/logout` | Revoke session |
| `GET` | `/api/auth/me` | Get authenticated user profile |
| `GET` | `/api/auth/verify-email` | Verify email with token |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset with token |
| `GET` | `/api/dashboard/stats` | Pipeline analytics |
| `GET` | `/api/dashboard/attention` | Stale + upcoming interviews |
| `GET` | `/api/dashboard/activity` | Stage change activity feed |
| `GET` | `/api/applications` | List all applications |
| `POST` | `/api/applications` | Create application |
| `PATCH` | `/api/applications/:id` | Update application |
| `PATCH` | `/api/applications/:id/stage` | Move stage (records history) |
| `DELETE` | `/api/applications/:id` | Delete application |
| `PUT` | `/api/resumes/base` | Save base resume sections |
| `POST` | `/api/ats/analyze` | ATS job description analysis |
| `POST` | `/api/ats/rewrite-bullet` | AI bullet point rewriter |
| `POST` | `/api/interview-prep/generate` | Generate interview questions |
| `POST` | `/api/interview-prep/review-star` | AI STAR answer critique |
| `GET` | `/api/interview-prep` | Fetch saved answer bank |
| `POST` | `/api/interview-prep/save` | Save answer to bank |
| `GET` | `/api/action-center/items` | Get stale & upcoming items |
| `POST` | `/api/action-center/draft-email` | AI follow-up email draft |
| `POST` | `/api/action-center/mark-followed-up` | Mark application followed-up |
| `GET` | `/api/health` | Server + DB + AI status check |

---

## 🌐 Live Demo

The frontend is deployed to **GitHub Pages** at:

**[https://nikhildhankar.github.io/jobtracker/](https://nikhildhankar.github.io/jobtracker/)**

> **Note:** The live demo is a static frontend only. To use authenticated features (dashboard, pipeline, ATS, etc.) you need to run the backend locally and point the frontend to it.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by [Nikhil Dhankar](https://github.com/Nikhildhankar)

⭐ **Star this repo if you find it useful!**

</div>
