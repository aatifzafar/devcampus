# Alliance.ai (EDUX 2.0) — AI-Powered Student Learning Platform
### Official Academic Platform for Alliance University

A production-ready, full-stack educational web platform designed with high-density bento grid aesthetics, syllabus-grounded Socratic AI tutoring, peer collaboration rooms, past year question archives, alumni mentorship networks, and interactive 3D WebGL engineering simulations.

---

## Architecture

```
├── backend/                          Express 5 API on PostgreSQL
│   ├── server.js                     API gateway, health check, live-update stream
│   ├── .env.example                  copy to .env and fill in (DATABASE_URL, JWT_SECRET, ...)
│   ├── db/
│   │   ├── schema.sql                every table (users, subjects, assignments, submissions, tests, ...)
│   │   ├── setup.js                  npm run db:setup  (creates DB + tables + demo data)
│   │   ├── seed.js / seed-data.json  demo accounts, subjects, sections, discussions, study rooms
│   │   └── index.js                  connection pool
│   ├── lib/                          sign-in tokens, live updates, user helpers
│   ├── routes/
│   │   ├── auth.js                   sign in, profile, change password
│   │   ├── store.js                  assignments, tests, notes, announcements, PYQs, grades, live classes
│   │   ├── state.js                  each user's saved data, submissions, test attempts, discussions
│   │   ├── files.js                  uploads (bytes in backend/uploads, details in the files table)
│   │   ├── studyGroups.js            study rooms
│   │   └── ai.js                     Ask Alliance AI and 3D learning (Claude API, key in .env)
│   ├── uploads/                      uploaded files (created automatically, not in git)
│   └── test/api.test.js              npm test (backend must be running)
│
└── frontend/                         React 19 + Vite + Tailwind v4
    └── src/
        ├── App.jsx                   sign-in, loading the user's data, live updates
        ├── utils/session.js          token, API calls, saved data, live-update stream
        ├── data/store.js             shared data cache, sends every change to the API
        ├── components/faculty/       faculty portal
        ├── components/pages/         student pages
        └── components/features/      Learn with friends, PYQ, alumni, events, resume, AI, 3D
```

### Database tables

| Table | What it holds |
|---|---|
| users | students and faculty (bcrypt passwords, roll number, section) |
| subjects, course_sections | curriculum, and which faculty teaches which section |
| assignments, submissions | work set by faculty; each student's file, marks and feedback |
| tests, test_attempts, test_overrides, results_published, question_bank | tests, answers, early opening, published results |
| materials, announcements, pyqs, files | notes, notices, question papers, uploaded files |
| live_sessions, live_votes | live classes and in-class polls |
| threads, thread_replies | discussions and doubts |
| study_rooms | study rooms (JSON document per room) |
| user_state | each user's own saved data (to-dos, resume, settings, chat, events...) |

Items faculty share carry a `sections` list (for example `{5J,5K}`), and students only receive items for their own section.

---

## Design System & Tokens
- **Background**: Warm Alabaster / Stone (`#F6F5F0` / `#F7F6F2`)
- **Card Surfaces**: Crisp White (`#FFFFFF`) with 1px hairline borders (`#E4E4E7`) and zero heavy shadows
- **Primary Accents**: Midnight Indigo (`#4F46E5`) and Royal Purple (`#6D28D9`)
- **Bento Accent Cards**:
  - Task Completed: Soft Peach/Coral (`#FFEADB`) with filled coral progress pills
  - Skill Rank: Butter Yellow (`#FEF7D6`) with achievement milestones
  - Upcoming Submissions: Soft Periwinkle Blue (`#E9F2FE`)
  - University Calendar: Sage Green (`#EBF7EE`) with selected day circle
- **Typography**:
  - Editorial Serif Italic (`Newsreader` / `Instrument Serif`) for greetings and headings
  - `Inter` for clean body text
  - `JetBrains Mono` for course codes, dates, and metadata tags

---

## Running the application

### 1. Database (PostgreSQL 14 or newer)
PostgreSQL must be installed and running. Then:

```bash
cd backend
copy .env.example .env        # Windows (use "cp" on Mac/Linux)
# edit .env: put your PostgreSQL password in DATABASE_URL
npm install
npm run db:setup              # creates the alliance_ai database, tables and demo accounts
```
`npm run db:setup` is safe to run again. `npm run db:reset` deletes all data and starts fresh.

### 2. Backend
```bash
cd backend
npm start                     # http://localhost:5000 , check http://localhost:5000/api/health
npm test                      # optional: API tests (with the backend running)
```

### 3. Frontend
```bash
cd frontend
npm run dev                   # http://localhost:5185
```

### Demo accounts (password `Alliance@123`)
| Role | Email |
|---|---|
| Faculty | devika@alliance.edu.in |
| Student, section 5J | anna.sharma@alliance.edu.in |
| Student, section 5K | kabir.das@alliance.edu.in |

Sign in as faculty in one browser (or device) and as a student in another: anything faculty share appears for the student straight away.
