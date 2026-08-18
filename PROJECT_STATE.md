# JobTracker Project State

> **Project Name**: JobTracker  
> **PRD Source**: [PRD_1.md](file:///Users/nikhildhankar/jobtracker/PRD_1.md)  
> **Roadmap**: [ROADMAP.md](file:///Users/nikhildhankar/jobtracker/ROADMAP.md)  
> **Design System**: [DESIGN_SYSTEM.md](file:///Users/nikhildhankar/jobtracker/DESIGN_SYSTEM.md)  
> **Multi-Tenancy Rule**: [.agents/rules/multi-tenancy.md](file:///Users/nikhildhankar/jobtracker/.agents/rules/multi-tenancy.md)  
> **Current Status**: Phase 1 Planning — Locked Architecture Decisions

---

## 1. Locked Phase 1 Decisions

1. **Backend Architecture**: **Single Unified Node.js + Express (TypeScript) Backend**  
   - All CRUD, custom session authentication, and AI/LLM orchestration run inside a single, high-performance Node.js service.
   - Eliminates inter-service HTTP overhead and deployment split for v1.
2. **Database Architecture**: **MongoDB (via Mongoose / Native Driver)**  
   - Unified document persistence: `users`, `sessions`, `applications` (with embedded `stage_history`), `resumes`, `interview_preps`, and `followups`.
   - Native JSON structure fits job descriptions, structured resume sections, and AI responses perfectly.
3. **Database Environment**: Direct connection strings (Local MongoDB / MongoDB Atlas).
4. **AI & LLM Provider**: **Google Gemini API** (`gemini-2.0-flash` / `gemini-1.5-flash`) via the official `@google/genai` SDK.

---

## 2. Updated Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite + Vanilla CSS Tokens + `@dnd-kit` + `motion/react` |
| **Backend** | Node.js + Express (TypeScript) |
| **Database** | MongoDB (Mongoose ORM / Driver) |
| **AI / LLM** | Google Gemini API (`@google/genai`) |
| **Auth** | Custom Cryptographic Session Token + `httpOnly` Cookie |
| **Validation** | `zod` |

---

## 3. Phase Status Matrix

| Phase | Description | Status |
| :--- | :--- | :--- |
| **Phase 1** | Backend Scaffold (Node.js/Express + MongoDB + Gemini Service Skeleton) | 🟢 **Completed** |
| **Phase 2** | Custom Session Auth & Multi-Tenancy Enforcement | 🟢 **Completed** |
| **Phase 3** | Design System & Frontend Application Shell | 🟢 **Completed** |
| **Phase 4** | Dashboard (Page 1 — Overview & Analytics) | 🟢 **Completed** |
| **Phase 5** | Pipeline Kanban (Page 2 — Drag-and-Drop & Slide-Over Drawer) | 🟢 **Completed** |
| **Phase 6** | ATS Resume Builder (Page 3 — Gemini AI Gap Analysis & Rewriter) | 🟢 **Completed** |
| **Phase 7** | AI Interview Prep (Page 4 — Per-Job Coaching & Answer Bank) | 🟢 **Completed** |
| **Phase 8** | Action Center (Page 5 — Stale Detection & AI Follow-up Drafter) | 🟢 **Completed** |
| **Phase 9** | CI/CD via GitHub Actions & Production Deployment | 🟢 **Completed** |
| **Phase 10** | Motion Polish, Playwright E2E & Mobile QA | 🟢 **Completed** |
