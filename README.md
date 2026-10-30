# Alliance.ai (EDUX 2.0) — AI-Powered Student Learning Platform
### Official Academic Platform for Alliance University

A production-ready, full-stack educational web platform designed with high-density bento grid aesthetics, syllabus-grounded Socratic AI tutoring, peer collaboration rooms, past year question archives, alumni mentorship networks, and interactive 3D WebGL engineering simulations.

---

## Architecture & File Structure

```
├── backend/
│   ├── server.js                      # Express API Gateway & middleware
│   ├── routes/
│   │   ├── auth.js                    # Profile, academic stats & submission toggling
│   │   ├── courses.js                 # Course syllabi, progression & modules
│   │   ├── pyq.js                     # Previous Year Question Papers repository
│   │   ├── alumni.js                  # Alumni directory & mentorship scheduling
│   │   ├── chatbot.js                 # EDUX AI Socratic Tutor queries & hints
│   │   └── studyGroups.js             # Live study rooms, scratchpad & Pomodoro sync
│   └── models/
│       ├── userModel.js               # Student profile (Anna Sharma, B.Tech CSE '26)
│       ├── courseModel.js             # Active courses (UI/UX, Frontend, Usability, DSA)
│       ├── pyqModel.js                # Official exam papers with marks & AI solutions
│       ├── alumniModel.js             # Alumni in Google, AWS, Atlassian, Razorpay, CRED
│       ├── studyGroupModel.js         # Virtual study rooms & peer presence
│       └── chatbotModel.js            # Socratic knowledge base & syllabi grounding
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Sidebar.jsx            # Sleek vertical navigation with custom brand mark
    │   │   ├── Navbar.jsx             # Top search bar, streak tracker, user profile pill
    │   │   ├── DashboardOverview.jsx  # Pixel-matched Bento grid (Hero, Chart, Skill, Table, Cal)
    │   │   ├── StudyGroups.jsx        # "Learn with Friends": Rooms, Pomodoro, Scratchpad
    │   │   ├── PYQPortal.jsx          # "PYQ": Past exams, official preview & 1-click download
    │   │   ├── AlumniDirectory.jsx    # "Connect with Alumni": Mentorship booking, LinkedIn/GitHub
    │   │   ├── AIChatbot.jsx          # "EDUX AI": Socratic Tutor with hint mode toggle
    │   │   ├── ThreeDViewer.jsx       # "3D Learning": Three.js WebGL (CPU, Neural Net, DNA)
    │   │   └── CoursesView.jsx        # Course modules & curriculum tracking
    │   ├── styles/
    │   │   ├── tokens.css             # Tailwind v4 theme, design tokens & typography
    │   │   └── index.css              # Global styles & hairline border utilities
    │   ├── utils/
    │   │   └── api.js                 # Centralized REST client with backend proxy
    │   ├── App.jsx                    # Root application orchestrator & floating AI drawer
    │   └── main.jsx                   # React root entry
    ├── vite.config.js                 # Vite + Tailwind v4 + Backend reverse proxy
    └── package.json
```

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

## Running the Application

### 1. Start Backend Gateway
```bash
cd backend
node server.js
# Runs on http://localhost:5000
```

### 2. Start Frontend Dev Server
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

