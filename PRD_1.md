# PRD: Job Tracker

## What is it?
A standalone job-application tracking product — users track every application through its pipeline stage, optimize resumes against job descriptions with AI, prep for interviews based on the actual job, and get nudged (with AI-found HR contacts) to follow up on applications that have gone quiet.

## Who is it for?
General job seekers — **multi-user, multi-tenant product**, not a personal tool. Each user has their own isolated account, applications, resumes, and data. Standalone — does **not** integrate with any personal infra (no JobHunter, no Selenium bot, no Notion). Built to work for anyone who signs up.

## Pages needed
- [ ] Page 1 — Dashboard (Home)
- [ ] Page 2 — Pipeline / Kanban Board
- [ ] Page 3 — ATS Resume Builder
- [ ] Page 4 — Interview Prep
- [ ] Page 5 — Action Center (Follow-ups)

## Primary action visitors must take
Sign up, add applications, and move them forward through pipeline stages without letting one go silent unfollowed-up.

## Design System

**Theme:** Clean Modern SaaS (Stripe & Craft inspired) — trustworthy, crisp, bright neutrals, tactile micro-interactions. This replaces the earlier placeholder "Minimalist Dark Tech" direction — the product now uses a **light, bright canvas**, not dark mode.

**Typography:**
- Headings & UI: `General Sans`
- Body & metadata: `Inter Tight`
- Tabular/numeric (salaries, dates, %): `JetBrains Mono`

**Core palette:**
- Canvas `#F8FAFC` / Cards `#FFFFFF` / Borders `#E2E8F0`
- Text: primary `#0F172A`, secondary `#475569`, muted `#94A3B8` ⚠️
- Primary action: `#2563EB` (royal blue)
- Semantic accents: emerald `#059669` (offers/success), amber `#D97706` (screening/urgent), violet `#7C3AED` (interviews/AI), rose `#E11D48` (rejections/destructive)

**⚠️ Contrast flag (checked via WCAG formula, verify on realtimecolors before lock):** `--text-muted` (`#94A3B8`) only hits **2.45–2.56:1** against the canvas/card backgrounds — fails WCAG AA outright (needs 3:1 minimum even for large text). Fine for pure decoration, but don't use it for anything a user actually needs to read (e.g. a stage timestamp that matters). Consider darkening to ~`#7C8896` if it needs to carry real information. All other text/background and button-label combinations pass at least AA; full ratio table available on request.

**Pipeline stage colors (maps directly onto Page 2's 6 columns):**
| Stage | Color | Notes |
|---|---|---|
| Wishlist | `#64748B` slate | neutral, not-yet-committed |
| Applied | `#2563EB` blue | matches primary action color |
| Screening | `#D97706` amber | urgency signal |
| Interviewing | `#7C3AED` violet | also used for AI-related badges |
| Offer Received | `#059669` emerald | success/positive |
| Archived / Rejected | `#71717A` / `#E11D48` | archived = neutral gray, rejected = rose |

Each stage renders as a soft pastel pill (8–10% opacity tint of the stage color) with a solid-color status dot — not a solid-fill badge, to keep the board visually calm at a glance.

**Signature components already spec'd:** tactile buttons (spring transitions, `cubic-bezier(0.16, 1, 0.3, 1)`), soft-spring Kanban cards (hover lift + shadow), segmented tab switcher (Craft-style), stat cards with icon + sparkline, and a 520px slide-over drawer for job detail (Overview / Timeline / Interview Prep / Documents tabs) — this drawer effectively **replaces the separate detail-modal concept** mentioned earlier in Page 2; use the drawer, not a centered modal.

**Keyboard shortcuts to build in:** `Cmd/Ctrl+K` command bar, `N` quick-add, `B` toggle Kanban/List view, `Esc` dismiss.

**Motion implementation:** CSS-only for static micro-interactions (button press, card hover lift) using the `--transition-spring` token directly — no JS needed there. For stateful animation (drawer mount/unmount, command bar, Kanban drag-reorder, staggered dashboard reveals), use `motion/react` (Framer Motion) — its real spring physics match this system's `cubic-bezier(0.16, 1, 0.3, 1)` feel better than plain CSS transitions can for anything involving enter/exit or layout shifts. Pair with `dnd-kit` specifically for the cross-column Kanban drag (Framer's own `Reorder` is single-list only). Every animated component must respect `prefers-reduced-motion` — wrap the app in Framer's `MotionConfig reducedMotion="user"` rather than handling it ad hoc per component. Bake micro-interactions (buttons, card hover) into each page's own build phase, not deferred to the Phase 10 polish pass — only the larger orchestrated moments (page-load stagger, drawer choreography) belong in Phase 10.

Full CSS token file, shadow scale, radii scale, and component specs are in the design system doc — hand that directly to GSD during `/gsd-plan-phase` for Phase 3 (frontend shell) rather than re-deriving it.

## Must NOT look like
No centered hero blobs. No 3-equal-card layouts for the dashboard stats. No dark-mode gradient "AI product" clichés — this system is intentionally light/bright, not dark tech. Don't deviate from the specified font pairing (no Inter-everywhere default) or invent new accent colors outside the 4 semantic ones defined above.

---

## Tech Stack

| Layer | Choice |
| :--- | :--- |
| **Frontend** | HTML, CSS, JavaScript, React (Vite + React, not Next.js — plain SPA) |
| **Core Backend** | Node.js + Express — handles auth, sessions, CRUD for users/applications/pipeline |
| **AI/ML Backend** | Python API (FastAPI) — separate service for AI-heavy work: resume parsing, keyword extraction, ATS scoring, email-pattern/deliverability checks. Python's NLP/AI ecosystem is the reason for splitting this out rather than doing it in Node. |
| **Relational DB** | SQL (PostgreSQL recommended over MySQL — better JSON column support for semi-structured fields like `stage_history`) — stores Users, Sessions, Applications, Pipeline stage history: anything with strict relationships and needing transactions |
| **Document DB** | MongoDB — stores loosely-structured / large-text content: job description text, resume versions (structured JSON per version), AI-generated interview questions, AI-generated follow-up drafts. This content doesn't need relational joins and varies in shape, which is why it's split from the SQL store rather than forced into it |
| **Deployment** | GitHub — source control + GitHub Actions for CI/CD (lint, test, build on every PR). Actual hosting: frontend → Vercel/Netlify (static SPA build), Node backend → Render/Railway, Python/FastAPI service → Render/Railway (separate service), Postgres + MongoDB → managed instances (e.g. Railway/Supabase for Postgres, MongoDB Atlas for Mongo). GitHub itself hosts code + runs CI; it isn't the live host for a stateful full-stack app with two databases — flagging this now so it's not a surprise at Step 10 |

**Why two databases:** this is a deliberate polyglot-persistence split, not accidental complexity — SQL for anything transactional and relationship-heavy (a user has many applications, applications have stage history), MongoDB for content that's document-shaped and doesn't need joins (a full JD text blob, a resume version, a batch of AI-generated questions). If this feels like too much operational surface for v1, the alternative is Postgres-only using JSONB columns for the document-shaped data — flagged as an open decision below since it's a real tradeoff (two DBs = more ops, one DB = simpler but less natural fit for the unstructured content).

**Why two backend services:** Node/Express is fast for CRUD + session auth; Python/FastAPI is the natural fit for AI/NLP work (calling the LLM, keyword extraction, resume parsing libraries). They talk over an internal REST API. If you'd rather keep this to one language for v1, the alternative is doing everything in Node (calling the LLM directly from Express, skipping Python) — also flagged below, since running two backend services is real added deployment complexity for a first version.

---

## Layout / Navigation

**Global shell:** Top navbar (persistent) + collapsible left sidebar (opens on click).

- **Navbar:** Logo, global search, quick-add button ("+ New Application"), account menu (profile, logout).
- **Sidebar (toggle):** Links to all 5 pages — Dashboard, Pipeline, ATS Builder, Interview Prep, Action Center. Live count badge per pipeline stage and an "Action Needed" badge on Action Center.

---

## Page 1 — Dashboard

- Stats strip: Total active applications, applications this week, response rate, avg. days-to-response
- Pipeline funnel visualization (Wishlist → Applied → Screening → Interviewing → Offer/Archived counts)
- "Needs attention today" widget — pulls from Action Center logic
- Recent activity feed (last 10 status changes)

---

## Page 2 — Pipeline (Kanban Board)

**Columns (in order):**
1. **Wishlist**
2. **Applied**
3. **Screening**
4. **Interviewing**
5. **Offer Received**
6. **Archived / Rejected**

**Card contents:** Company name + logo, role title, applied date, days-in-current-stage (highlight red if stale), source, quick tags (Remote/Hybrid/Onsite).

**Interactions:** Drag card between columns to update status (writes to SQL `stage_history`). Click card → detail modal (JD text pulled from MongoDB, notes, contact person, resume version used, timeline).

---

## Page 3 — ATS Resume Builder (AI)

**Purpose:** Take a job description + a user's base resume, produce an ATS-optimized, tailored version with a visible score.

**How it works:**

1. **Input:** User selects a job from Pipeline or pastes JD text. Uploads/selects their base resume, stored as structured JSON in MongoDB (editable section by section: Summary, Skills, Experience bullets, Projects, Education).

2. **Keyword extraction (Python/FastAPI → LLM call):** Extract top 15-20 ATS-relevant keywords from the JD, categorized Required vs Nice-to-have. Cross-check with a cheap non-AI frequency/noun-phrase pass as a fallback.

3. **Gap analysis:** Compare JD keywords against the resume's current keyword set. Show match % and missing-but-plausible keywords — user confirms which are real before anything is added, so the AI never invents experience.

4. **Bullet rewriting (LLM call):** Rewrite bullets to naturally incorporate confirmed missing keywords only where truthful. Show original vs suggested side-by-side; user approves/rejects/edits each individually — never auto-applied.

5. **ATS format score (non-AI, rules-based):** Checks formatting issues that break ATS parsers (tables, text boxes, columns, images, inconsistent dates, non-chronological order). Score out of 100 with a checklist.

6. **Output:** Tailored resume version generated as downloadable .docx/PDF, versioned and linked back to the Pipeline card. Resume JSON + version history lives in MongoDB.

---

## Page 4 — Interview Prep (AI, per-job)

1. **Input:** Select a job card (needs JD text). Optionally set interview round type (Phone / Technical / System Design / HR / Final).

2. **Tech stack detection (LLM call via Python service):** Parse JD to extract tech stack, tools, responsibilities.

3. **Question generation (LLM call):** 5-8 technical questions scoped to the detected stack, 3-5 behavioral questions (STAR-format) mapped to JD responsibilities, 2-3 "why this company/role" questions.

4. **Company research pull (optional, web search):** Light auto-pull of company info if a search tool is connected.

5. **User answer bank:** Per-question text area to draft/save answers, stored in MongoDB per job, reviewed before the actual call.

6. **DSA/System Design checklist (static):** Surfaced when round type = Technical/System Design.

---

## Page 5 — Action Center (Follow-ups, AI-assisted)

1. **Stale detection (rules-based, SQL query, daily cron or on page load):** Flag applications in "Applied"/"Screening" where `today - applied_date >= 7 days` with no stage change.

2. **HR/recruiter contact discovery (Python service + web search):**
   - Check if a contact was already captured on the card.
   - If not, search "[Company] recruiter [role] LinkedIn" or guess common email patterns against the company domain.
   - Flag as "best guess, verify before sending" — never auto-send to an unverified address.

3. **Email deliverability verification (Python service):**
   - MX record check first (free, filters obvious junk).
   - SMTP handshake probe (free but unreliable on Gmail/Outlook, which block this).
   - Third-party verification API (Hunter.io, ZeroBounce, NeverBounce, Abstract API) for a reliable confidence score.
   - Show as a badge: 🟢 Verified / 🟡 Risky / 🔴 Unverified. Never auto-send to 🔴.

4. **Follow-up email drafting (LLM call):** Short, non-pushy follow-up referencing a specific JD detail. Editable draft, never auto-sent.

5. **Send/track:** "Open in email client" (mailto: link) or connect user's own email provider later. Logged as a timeline event, resets stale-timer.

6. **Interview reminders:** Upcoming interviews in next 48 hours surfaced as a secondary list.

---

## Backend & Auth

**Which backend handles what:**
- **Node/Express:** signup, login, logout, session middleware, CRUD for Users/Applications/Pipeline stages (SQL), serving MongoDB content reads/writes for JD text and resume/question data.
- **Python/FastAPI:** all LLM calls (keyword extraction, bullet rewriting, question generation, follow-up drafting), email pattern guessing, MX/SMTP/third-party email verification. Called internally by the Node backend, never directly by the frontend.

**Auth model — session token, not JWT, fully custom (no Auth0/Clerk/Supabase Auth):**
- On login, Node backend creates a session record in Postgres: `sessions(id, user_id, expires_at, created_at, ip, device)`.
- `id` is a cryptographically random opaque string (e.g. `crypto.randomUUID()` or 32-byte random hex) — not a decodable JWT.
- Sent to the browser as an **httpOnly, Secure, SameSite=Strict cookie** — never localStorage.
- Every request: middleware reads cookie → looks up session in Postgres → checks `expires_at` → attaches `user_id`, or 401.
- Logout = delete the session row (instant server-side revocation).
- Sliding expiry on activity, hard max lifetime (e.g. 30 days) forcing re-login eventually.

**Password handling:** `bcrypt` or `argon2` hashing, never plaintext, never a custom hash.

**Account verification ("ID verification") — signup flow:**
1. Signup with email + password. Account created `unverified`.
2. Node backend sends a verification email with a signed, expiring link (token hashed in DB, ~24h validity).
3. Account flips to `verified` only after the link is clicked. Restrict Page 5's email-sending features (and optionally the whole app) until verified — this confirms the user owns the email on their account.
4. Optional Phase-2 addition: phone OTP as a second factor (Twilio/MSG91) — not required for v1 given the added cost/complexity for a first release.

**Multi-tenancy note (new, since this is no longer single-user):** every table with user data (`applications`, `sessions`, and the MongoDB collections) must be scoped by `user_id`/`userId` on every single query — this is the #1 thing to get right early, since a missing `WHERE user_id = ?` clause is how one user's data leaks into another's view. Worth writing this as an explicit rule in `.agents/rules/` so the AI never forgets it while building CRUD endpoints.

**Security additions from multi-tenancy:**
- Rate-limit `/login`, `/signup`, `/forgot-password` (per-IP and per-account) — now genuinely needed since real strangers can hit signup, not just you.
- CSRF protection on state-changing routes (SameSite=Strict cookie covers most of it for a single-origin app; add a double-submit token if frontend and backend end up on different domains).
- Input validation/sanitization on every endpoint (e.g. `zod` on Node, `pydantic` on FastAPI) — mandatory now that untrusted users are hitting these endpoints directly.

---

## Data model (rough shape)

**PostgreSQL (relational, transactional):**
```
users {
  id, email, password_hash, is_verified: bool,
  verification_token_hash, verification_expires_at,
  created_at
}

sessions {
  id (opaque token), user_id, expires_at, created_at, ip, device
}

applications {
  id, user_id, company_name, role_title, source,
  stage: Wishlist | Applied | Screening | Interviewing | Offer | Archived,
  applied_date, mongo_jd_ref, mongo_resume_version_ref,
  contact: {name, email, verification_status: verified | risky | unverified}
}

stage_history {
  id, application_id, stage, timestamp
}
```

**MongoDB (document, content-heavy):**
```
job_descriptions { _id, application_id, user_id, raw_text, extracted_keywords[] }

resume_versions { _id, user_id, application_id, version_label, sections: {summary, skills[], experience[], projects[], education[]}, ats_score }

interview_prep { _id, application_id, user_id, round_type, tech_stack_detected[], questions: [{type, text, user_answer}] }

followup_drafts { _id, application_id, user_id, draft_text, sent: bool, sent_at }
```

---

## Build phases (suggested ROADMAP shape for GSD)

```
Phase 1: Backend scaffold — Node/Express + Postgres schema + Python/FastAPI service skeleton + internal service-to-service calls working
Phase 2: Session-token auth — signup, email verification, login, logout, session middleware, multi-tenant scoping rule enforced
Phase 3: Design system + frontend shell (navbar, sidebar, dark theme tokens, Vite+React setup)
Phase 4: Dashboard (Page 1)
Phase 5: Pipeline Kanban (Page 2) — Postgres CRUD + drag-drop + MongoDB JD storage
Phase 6: ATS Resume Builder (Page 3) — Python AI integration
Phase 7: Interview Prep (Page 4) — Python AI integration
Phase 8: Action Center (Page 5) — stale detection + email verification + AI follow-up drafting
Phase 9: CI/CD via GitHub Actions + deploy all services (frontend, Node backend, Python backend, both DBs)
Phase 10: Motion polish + Playwright tests + mobile QA
```

## Open decisions to lock before Phase 1 (bring these to `/gsd-discuss-phase 1`)
- **Two backends vs one:** confirmed split (Node for CRUD/auth, Python for AI) — or collapse to Node-only for v1 and add Python later if AI work outgrows it? Two services means two things to deploy, monitor, and keep talking to each other correctly.
- **Two databases vs one:** confirmed split (Postgres + MongoDB) — or Postgres-only with JSONB columns for the document-shaped content, to cut ops overhead for v1?
- **Hosting targets:** which providers for frontend (Vercel/Netlify), Node backend, Python backend, Postgres, and MongoDB (Atlas)? Pick concrete providers now so Phase 9 isn't a scramble.
- **Email verification API for Page 5:** Hunter.io, ZeroBounce, NeverBounce, or Abstract API — check free-tier limits.
- **Transactional email sending** (signup verification link, follow-up emails): SendGrid, Resend, or SMTP via a connected provider?
- **AI provider:** which LLM API for the Python service calls?
