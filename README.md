<div align="center">

# Alliance.ai — EDUX 2.0

### AI-Powered Student Learning Platform

**Your Campus. Your Knowledge. Connected.**

Alliance University · DevCampus 2026 — Campus Innovation Challenge

[![React 19](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-runtime-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-4169e1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?logo=threedotjs&logoColor=white)](https://threejs.org/)

Alliance.ai is a connected academic ecosystem for Alliance University that brings learning resources, guided AI assistance, collaboration, assessment workflows, alumni connections and career-readiness tools into one student-centred experience.

</div>

<p align="center">
  <img src="Screenshots/HOME_SS.png" alt="Alliance.ai student home dashboard" width="100%">
</p>
<p align="center"><em>Alliance.ai student home dashboard.</em></p>

---

## Contents

- [About the project](#about-the-project)
- [Problem statement](#problem-statement)
- [Our solution](#our-solution)
- [Product screenshots](#product-screenshots)
- [Feature overview](#feature-overview)
- [What makes EDUX 2.0 different](#what-makes-edux-20-different)
- [System architecture](#system-architecture)
- [Technology stack](#technology-stack)
- [User roles and workflows](#user-roles-and-workflows)
- [AI integration](#ai-integration)
- [Database architecture](#database-architecture)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [API documentation](#api-documentation)
- [Security considerations](#security-considerations)
- [Installation and setup](#installation-and-setup)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

## About the project

Alliance.ai (EDUX 2.0) is a full-stack learning platform developed for Alliance University and presented at DevCampus 2026. It is designed to complement—not replace—the university's existing learning systems by connecting the everyday academic workflows that students and faculty use around them.

The platform combines:

- Academic subjects, notes, assignments, tests, grades and announcements.
- Previous-year question paper discovery and downloads.
- Ask Alliance AI with academic context and Socratic guidance.
- Interactive Three.js/WebGL learning scenes.
- Peer study rooms with messages, scratchpads and Pomodoro sessions.
- Alumni discovery and mentorship requests.
- Resume editing with printable PDF export.
- Faculty sharing, section targeting, grading and live polls.
- Persistent user state for planner, preferences, resume and other app data.

The backend can use PostgreSQL for persistence. In environments where PostgreSQL is unavailable, the repository includes a seeded in-memory fallback so the application can still be demonstrated locally.

## Problem statement

University learning is often distributed across separate channels: course material in one place, question papers in another, peer advice in informal groups and career guidance in disconnected conversations. This makes useful knowledge difficult to discover and valuable experience easy to lose between batches.

Students also need more than a document repository:

- Complex technical topics are difficult to understand through text alone.
- Peer learning needs structured spaces rather than ad-hoc messaging.
- Faculty workflows include section-specific sharing, assessment and live interaction.
- Senior guidance and project lessons are valuable, but are not always preserved.

## Our solution

EDUX 2.0 provides one connected interface for academic discovery, guided learning, collaboration and career preparation. It preserves the university context around resources while keeping the experience practical for students and faculty:

1. Students discover subjects, notes, tests, PYQs and schedules from a single dashboard.
2. Ask Alliance AI provides guided answers using conversation context and the Alliance knowledge file.
3. Faculty share resources and assessments with targeted sections.
4. Study rooms support peer interaction with shared tools.
5. Alumni and resume modules connect learning with future opportunities.

## Product screenshots

The screenshots below are the five application views currently stored in [`Screenshots/`](Screenshots/). The homepage is shown first at full width; the remaining views use a two-column layout.

<table>
<tr>
<td width="50%" valign="top">
<h3>Previous-year question papers</h3>
<img src="Screenshots/PYQ%27s_SS.png" alt="Alliance.ai previous-year question papers archive" width="100%">
<p><em>Searchable PYQ archive with subject, year and examination filters.</em></p>
</td>
<td width="50%" valign="top">
<h3>Alumni directory</h3>
<img src="Screenshots/ALUMINI_SS.png" alt="Alliance.ai alumni directory" width="100%">
<p><em>Alumni profiles with experience, skills and advice availability.</em></p>
</td>
</tr>
<tr>
<td width="50%" valign="top">
<h3>Resume builder</h3>
<img src="Screenshots/RESUME_SS.png" alt="Alliance.ai resume builder and preview" width="100%">
<p><em>Profile-backed resume editor with classic and modern layouts and PDF printing.</em></p>
</td>
<td width="50%" valign="top">
<h3>3D learning</h3>
<img src="Screenshots/3D_SS.png" alt="Alliance.ai interactive 3D learning scene" width="100%">
<p><em>Interactive Three.js scene with built-in engineering and computing models.</em></p>
</td>
</tr>
</table>

## Feature overview

### AI-powered learning

**Implemented:** Ask Alliance AI accepts conversation turns, keeps the latest bounded context, loads [`backend/data/alliance-knowledge.md`](backend/data/alliance-knowledge.md), and uses a Socratic system prompt. Gemini is the primary external provider, Anthropic is supported as a secondary provider, and an offline rule-based Socratic engine is available when no key is configured. AI-generated 3D scenes use the same provider path with JSON validation.

### Previous-year question papers

**Implemented:** The PYQ route supports listing, filtering, opening paper metadata and recording downloads. The frontend provides subject, year and examination filters and uses the file service for paper access.

### Interactive 3D learning

**Implemented:** The frontend renders Three.js/WebGL learning scenes. Built-in models include a binary search tree, OSI reference model, TCP handshake, CPU pipeline, DFA and neural network. The backend can request generated scene JSON from the configured AI provider.

### Learn with friends and study rooms

**Implemented:** Authenticated users can list and open study rooms, create rooms, update a scratchpad, send messages and manage Pomodoro state. The frontend also exposes peer-learning and discussion experiences.

### Alumni connect

**Implemented:** Alumni profiles can be listed and opened. Students can create mentorship requests and view their own mentorship sessions. The visible directory is currently backed by the application's data layer and demo data.

### Resume builder

**Implemented:** The resume feature edits profile-backed content, supports classic and modern layouts, persists state through the user-state API and uses the browser print flow for PDF export.

### Academic management

**Implemented:** The backend exposes academic store data for subjects, materials, assignments, submissions, tests, announcements, PYQs, grades and live sessions. Faculty mutations are section-aware and role-protected.

### Faculty portal

**Implemented:** Faculty can create and update shared collections, change test overrides, publish results, grade assignments, start and end live sessions, launch polls and receive student votes.

### Progress and motivation

**Implemented in the frontend data model:** The dashboard includes XP, streak, progress and achievement-oriented UI. These experiences are supported by the application's seeded/demo data and persisted user state where applicable.

### Events and campus life

**Implemented in the frontend:** Events and clubs are presented through the feature modules and application data. They are currently primarily application data/UI experiences rather than dedicated PostgreSQL entities.

### Planned knowledge features

**Planned:** “Campus Memory” and “Project DNA” are product directions for preserving cross-generational notes, project architectures, implementation lessons and senior guidance. They should not be interpreted as completed backend modules in the current repository.

## What makes EDUX 2.0 different

| Differentiator | How it appears in the current product |
|---|---|
| Context-aware academic assistance | AI prompts include the Alliance knowledge file and use guided, Socratic responses. |
| Interactive technical learning | Three.js scenes let students inspect concepts visually instead of relying only on prose. |
| Connected campus ecosystem | Academic resources, collaboration, alumni and career-readiness modules share one application shell. |
| Student-centred workflows | Student and faculty views are separated while common academic data remains connected. |
| Cross-generational knowledge preservation | PYQs, notes and alumni guidance establish the foundation for future Campus Memory work. |
| Project DNA vision | A proposed archive for project ideas, technical decisions and lessons learned. |

## System architecture

```mermaid
flowchart LR
    U[Students and Faculty] --> UI

    subgraph P[Presentation layer]
        UI[React 19 + Vite frontend]
        UI --> S[Session and API utilities]
        UI --> T[Three.js learning views]
    end

    subgraph A[Application layer]
        API[Express 5 API]
        AUTH[JWT authentication and role guards]
        MOD[Academic, state, files, courses, PYQ, alumni and study-group routes]
        API --> AUTH
        API --> MOD
    end

    subgraph AI[AI integration layer]
        AIR[AI chat and scene routes]
        G[Google Gemini]
        C[Anthropic Claude]
        F[Offline Socratic fallback]
        AIR --> G
        AIR --> C
        AIR --> F
    end

    subgraph D[Data layer]
        PG[(PostgreSQL)]
        MEM[(Seeded in-memory fallback)]
        FS[(backend/uploads file storage)]
        STATE[(Persistent user_state)]
    end

    UI --> API
    MOD --> PG
    MOD --> MEM
    MOD --> FS
    MOD --> STATE
    API --> AIR
    API -.->|Server-Sent Events| UI
```

The browser communicates with the Express API through REST endpoints. JWTs identify the user and role. PostgreSQL is used when `DATABASE_URL` is configured and reachable; the database adapter switches to a seeded in-memory implementation when it is not. Uploaded bytes are stored under `backend/uploads/`, while metadata is stored in the database layer. Live updates are delivered through an authenticated Server-Sent Events stream.

## Technology stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React 19 | Component-based application UI. |
| Frontend tooling | Vite 8 | Development server and production bundling. |
| Styling | Tailwind CSS 4 and project CSS tokens | Layout, responsive styling and visual system. |
| 3D | Three.js | Interactive WebGL learning scenes. |
| Backend | Node.js and Express 5 | REST API, middleware and route composition. |
| Database | PostgreSQL 14+ | Relational persistence for academic and user data. |
| Fallback data | Repository in-memory mock database | Seeded demo operation without PostgreSQL. |
| Authentication | JSON Web Tokens and bcryptjs | Signed sessions and password hashing. |
| Files | Local filesystem plus metadata records | Upload and download handling. |
| AI | Google Gemini, Anthropic Claude | Chat and generated 3D scene providers. |
| Live updates | Server-Sent Events | Authenticated update stream. |
| Validation and observability | Express JSON limits and Morgan | Request parsing, upload limits and HTTP logging. |

## User roles and workflows

### Student

Students sign in, view their dashboard, explore subjects and materials, take tests, submit work, ask AI questions, browse PYQs, join study rooms, connect with alumni and maintain a resume.

### Faculty

Faculty sign in to share materials, announcements, assignments and tests with sections; grade submissions; manage test visibility; publish results; and run live sessions and polls.

### Authentication workflow

```mermaid
sequenceDiagram
    participant B as Browser
    participant A as /api/auth/login
    participant DB as Data layer
    B->>A: email + password
    A->>DB: Find user by email
    A->>A: bcrypt compare and rate-limit check
    A-->>B: JWT + public profile
    B->>A: Bearer token on protected requests
    A-->>B: Authorized response or 401/403
```

### Student learning workflow

```mermaid
flowchart LR
    L[Student login] --> H[Dashboard]
    H --> C[Subjects and materials]
    H --> Q[Tests and PYQs]
    H --> AI[Ask Alliance AI]
    H --> R[Study rooms]
    H --> M[Alumni and resume]
```

### Faculty resource and assessment workflow

```mermaid
flowchart LR
    F[Faculty login] --> S[Select sections]
    S --> R[Share resources and announcements]
    S --> A[Create assignments and tests]
    A --> G[Review submissions and grades]
    A --> P[Publish results or run live polls]
```

## AI integration

The implementation is provider-based prompt orchestration, not a RAG pipeline. It reads the local Alliance knowledge file, includes it in the system context, cleans and bounds conversation messages, and then calls an external provider when a key is available.

| Capability | Current behavior |
|---|---|
| Primary provider | Google Gemini using `GEMINI_API_KEY` and `GEMINI_MODEL`. |
| Secondary provider | Anthropic Claude using `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`. |
| Offline mode | Built-in Gemini Socratic Engine fallback when no provider key is available. |
| Context | Alliance handbook/knowledge file plus bounded recent conversation turns. |
| Chat style | Socratic guidance and academic assistance through system prompts. |
| Scene generation | JSON-only generation followed by response parsing and validation. |
| Key handling | Server environment keys, with supported per-request Gemini/Anthropic key inputs. |
| Error handling | Provider errors are surfaced and provider/model fallback paths are attempted where supported. |

```mermaid
sequenceDiagram
    participant S as Student UI
    participant R as Express AI route
    participant K as Knowledge file
    participant P as Gemini / Claude
    S->>R: Chat or scene request
    R->>K: Read Alliance context
    R->>R: Clean messages and build prompt
    alt Provider key configured
        R->>P: Generate response
        P-->>R: Text or JSON response
    else No provider key
        R->>R: Offline Socratic engine
    end
    R-->>S: Processed response
```

## Database architecture

The PostgreSQL schema in [`backend/db/schema.sql`](backend/db/schema.sql) defines the following entities:

| Entity group | Tables |
|---|---|
| Identity and curriculum | `users`, `subjects`, `course_sections` |
| Files and academic resources | `files`, `materials`, `announcements`, `pyqs` |
| Assessment | `assignments`, `submissions`, `tests`, `test_overrides`, `results_published`, `test_attempts`, `question_bank` |
| Live learning | `live_sessions`, `live_votes` |
| Community | `threads`, `thread_replies`, `study_rooms` |
| Personal state | `user_state` |

```mermaid
erDiagram
    USERS ||--o{ COURSE_SECTIONS : teaches
    SUBJECTS ||--o{ COURSE_SECTIONS : contains
    USERS ||--o{ ASSIGNMENTS : creates
    SUBJECTS ||--o{ ASSIGNMENTS : has
    ASSIGNMENTS ||--o{ SUBMISSIONS : receives
    USERS ||--o{ SUBMISSIONS : makes
    FILES ||--o{ SUBMISSIONS : attaches
    SUBJECTS ||--o{ TESTS : has
    TESTS ||--o{ TEST_ATTEMPTS : receives
    SUBJECTS ||--o{ MATERIALS : contains
    FILES ||--o{ MATERIALS : attaches
    SUBJECTS ||--o{ PYQS : contains
    FILES ||--o{ PYQS : stores
    SUBJECTS ||--o{ LIVE_SESSIONS : hosts
    LIVE_SESSIONS ||--o{ LIVE_VOTES : receives
    USERS ||--o{ USER_STATE : owns
    USERS ||--o{ THREADS : starts
    THREADS ||--o{ THREAD_REPLIES : contains
    USERS ||--o{ STUDY_ROOMS : creates
```

Primary keys are defined per entity, with foreign keys connecting subjects, users, files, assessments and live sessions. Faculty-shared records carry section arrays, allowing the store routes to filter content for a student's section. `user_state` stores user-owned application state such as planner, resume and preferences.

## Project structure

```text
Alliance.ai/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── data/
│   │   └── alliance-knowledge.md
│   ├── db/
│   │   ├── index.js
│   │   ├── mockDb.js
│   │   ├── schema.sql
│   │   ├── seed-data.json
│   │   ├── seed.js
│   │   └── setup.js
│   ├── lib/
│   ├── models/
│   ├── routes/
│   ├── test/
│   └── uploads/
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── faculty/
│       │   ├── features/
│       │   └── pages/
│       ├── data/
│       ├── styles/
│       └── utils/
├── Screenshots/
└── README.md
```

`backend/routes/` contains API modules, `backend/models/` contains domain data access helpers, `frontend/src/components/` contains the student, faculty and feature views, and `frontend/src/utils/` contains API, session, file and document helpers.

## Environment variables

Copy [`backend/.env.example`](backend/.env.example) to `backend/.env`. Never commit real credentials.

| Variable | Required | Purpose | Example |
|---|---:|---|---|
| `PORT` | No | Express port. | `5000` |
| `JWT_SECRET` | Recommended | Signs authentication tokens. | `replace-with-a-long-random-secret` |
| `DATABASE_URL` | No | PostgreSQL connection string. Omit to use the in-memory fallback. | `postgres://user:password@localhost:5432/alliance_ai` |
| `GEMINI_API_KEY` | No | Primary external AI provider key. | `your-gemini-key` |
| `GEMINI_MODEL` | No | Gemini model preference. | `gemini-3.8-flash` |
| `ANTHROPIC_API_KEY` | No | Secondary AI provider key. | `your-anthropic-key` |
| `ANTHROPIC_MODEL` | No | Claude model preference. | `claude-3-5-sonnet-20241022` |
| `MAX_UPLOAD_MB` | No | Maximum upload size in megabytes. | `50` |

For a local demo without PostgreSQL or AI credentials, configure `PORT`, `JWT_SECRET` and `MAX_UPLOAD_MB`, then start the backend. The fallback database and offline AI engine are available automatically.

## API documentation

All paths below are mounted below `/api`. Protected routes require `Authorization: Bearer <token>` unless noted otherwise. Faculty routes additionally require the `faculty` role.

### Health and live updates

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Reports API and database/fallback status. |
| `GET` | `/api/stream` | Authenticated | Opens the Server-Sent Events update stream; query-token support exists for `EventSource`. |

### Authentication

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates by email/identifier/roll number and returns a JWT and public profile. |
| `GET` | `/api/auth/me` | Authenticated | Returns the current user. |
| `GET` | `/api/auth/profile` | Authenticated | Returns the current profile in the application shape. |
| `POST` | `/api/auth/password` | Authenticated | Changes the password using `current` and `next`. |
| `PATCH` | `/api/auth/submissions/:id/toggle` | Authenticated | Compatibility endpoint for the older dashboard widget. |

### Academic store and courses

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/store` | Authenticated | Loads section-filtered academic collections and user-facing store data. |
| `POST` | `/api/store/:collection` | Faculty | Creates a faculty-managed collection item. |
| `PUT` | `/api/store/:collection/:id` | Faculty | Updates a faculty-managed item. |
| `DELETE` | `/api/store/:collection/:id` | Faculty | Deletes a faculty-managed item. |
| `PUT` | `/api/store/testOverrides/:id` | Faculty | Changes the opening time of a test. |
| `PUT` | `/api/store/published/:id` | Faculty | Publishes test results. |
| `PUT` | `/api/store/grades/:assignmentId/:roll` | Faculty | Grades a student's assignment submission. |
| `GET` | `/api/courses` | Public | Lists available courses. |
| `GET` | `/api/courses/:id` | Public | Returns one course. |
| `POST` | `/api/courses/:id/progress` | Authenticated | Records course progress. |

### PYQs, files and state

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/pyq` | Public | Lists question papers with query filters. |
| `GET` | `/api/pyq/:id` | Public | Returns one paper. |
| `POST` | `/api/pyq/:id/download` | Public | Records a paper download. |
| `POST` | `/api/files/:id` | Authenticated | Uploads bytes for an existing file record. |
| `GET` | `/api/files/:id` | Authenticated | Downloads or streams a file. |
| `DELETE` | `/api/files/:id` | Authenticated | Deletes an uploaded file. |
| `GET` | `/api/state` | Authenticated | Reads the user's saved state. |
| `GET` | `/api/state/:key` | Authenticated | Reads one state key. |
| `PUT` | `/api/state/:key` | Authenticated | Replaces one state key. |

### Alumni and study groups

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/alumni` | Public | Lists alumni profiles. |
| `GET` | `/api/alumni/:id` | Public | Returns one alumni profile. |
| `POST` | `/api/alumni/mentorship` | Public | Creates a mentorship request. |
| `GET` | `/api/alumni/mentorship/my-sessions` | Public | Lists mentorship sessions for the current request context. |
| `GET` | `/api/studygroups` | Authenticated | Lists study rooms. |
| `GET` | `/api/studygroups/:id` | Authenticated | Returns one room. |
| `POST` | `/api/studygroups` | Authenticated | Creates a room. |
| `PATCH` | `/api/studygroups/:id/scratchpad` | Authenticated | Updates room scratchpad content. |
| `POST` | `/api/studygroups/:id/messages` | Authenticated | Adds a room message. |
| `PATCH` | `/api/studygroups/:id/pomodoro` | Authenticated | Updates Pomodoro state. |

### Live classes

| Method | Path | Access | Description |
|---|---|---|---|
| `POST` | `/api/store/live/start` | Faculty | Starts a live session. |
| `POST` | `/api/store/live/poll` | Faculty | Launches or updates a live poll. |
| `POST` | `/api/store/live/end` | Faculty | Ends a live session. |
| `POST` | `/api/store/live/join` | Student | Joins a live session. |
| `POST` | `/api/store/live/vote` | Student | Submits a live poll vote. |

### AI and chatbot

| Method | Path | Access | Description |
|---|---|---|---|
| `GET` | `/api/ai/status` | Public | Reports configured provider and active model status. |
| `POST` | `/api/ai/validate-key` | Public | Validates an AI key/model configuration. |
| `POST` | `/api/ai/save-key` | Public | Updates the runtime Gemini key. |
| `DELETE` | `/api/ai/key` | Public | Removes the runtime Gemini key. |
| `POST` | `/api/ai/chat` | Public | Generates an academic chat response. |
| `POST` | `/api/ai/scene` | Public | Generates structured 3D learning scene data. |
| `GET` | `/api/chatbot/topics` | Public | Lists chatbot topics. |
| `POST` | `/api/chatbot/query` | Public | Answers a chatbot query through the chatbot module. |

The exact request and response shapes are defined in the corresponding route files under [`backend/routes/`](backend/routes/). The route tables above intentionally summarize only endpoints verified in source.

## Security considerations

### Implemented controls

- Passwords are compared and stored with `bcryptjs`.
- Sessions use signed JWTs with a seven-day expiry.
- Protected routes use `requireAuth`; faculty and student actions use role guards.
- Login failures are rate-limited per email and IP for a fifteen-minute window.
- Database access uses parameterized PostgreSQL queries.
- JSON request bodies and uploads have explicit size limits.
- Environment files are ignored by Git and secrets are read from environment variables.
- Generic authentication and database errors are returned without exposing password data.

### Recommended hardening

- Replace the development JWT fallback secret before any deployment.
- Add production HTTPS, secure cookie/token policy and a durable distributed rate limiter.
- Add MIME/content inspection and malware scanning for untrusted uploads.
- Restrict runtime client-provided AI key handling for production deployments.
- Add schema validation for every public request body and query parameter.
- Use a managed object store and access-controlled download URLs for production file storage.

## Installation and setup

### Prerequisites

- Node.js and npm.
- PostgreSQL 14+ for persistent mode.
- Git.

### 1. Clone the repository

```powershell
git clone https://github.com/aatifzafar/devcampus.git
Set-Location .\devcampus
```

### 2. Install backend dependencies and configure environment

```powershell
Set-Location .\backend
Copy-Item .env.example .env
npm install
```

Edit `backend/.env`. For PostgreSQL mode, set `DATABASE_URL` and run:

```powershell
npm run db:setup
```

The setup script creates the database schema and seeds development data. If PostgreSQL is not available, omit `DATABASE_URL` and use the built-in in-memory fallback.

### 3. Start the backend

```powershell
npm run dev
# or
npm start
```

The API listens on `http://localhost:5000` by default. Verify it with:

```powershell
Invoke-WebRequest http://localhost:5000/api/health
```

### 4. Install and start the frontend

Open a second terminal:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

The Vite development server uses port `5185` and proxies `/api` requests to the backend.

### Development accounts

Seeded development accounts are defined in [`backend/db/seed-data.json`](backend/db/seed-data.json). Use the current seed file as the source of truth for credentials; do not use demo credentials in production.

### Verification commands

```powershell
Set-Location .\frontend
npm run lint
npm run build

Set-Location ..\backend
npm test
```

The backend API tests expect the API server to be running.

## Roadmap

| Status | Direction |
|---|---|
| Implemented | Academic store, authentication, section-aware faculty sharing, files, PYQs, study rooms, alumni, resume, AI chat, 3D scenes and live updates. |
| In progress | Continue consolidating feature data and persistence behavior across the product modules. |
| Planned | Campus Memory archive for cross-generational academic knowledge. |
| Planned | Project DNA archive for project ideas, architecture decisions and implementation lessons. |
| Planned | Semantic academic search and PYQ topic-frequency analytics. |
| Planned | Faculty verification workflows and stronger university identity integration. |
| Planned | Senior–junior knowledge networks and advanced learning analytics. |

## Contributing

1. Fork the repository.
2. Create a focused branch: `git switch -c feature/your-change`.
3. Make the smallest complete change that fits the existing architecture.
4. Run the relevant frontend lint/build and backend tests.
5. Keep credentials and uploaded files out of commits.
6. Open a pull request describing behavior changes, validation performed and any follow-up work.

Please avoid changing application behavior in documentation-only pull requests and keep new claims in the README grounded in source code.

## Acknowledgements

Alliance.ai — EDUX 2.0 is developed for Alliance University and presented at **DevCampus 2026 — Campus Innovation Challenge**. The project acknowledges the campus innovation ecosystem involving:

- Alliance University
- Google Developer Groups on Campus
- Special Interest Group (SIG)

The repository currently contains no dedicated Alliance University logo asset, so the README uses text branding and verified repository screenshots rather than an invented or externally sourced logo.

---

<div align="center">

**Alliance.ai — EDUX 2.0**
*Your Campus. Your Knowledge. Connected.*

</div>
