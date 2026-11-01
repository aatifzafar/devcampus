-- Alliance.ai database schema (PostgreSQL 14+).
-- Safe to run more than once: every statement is "IF NOT EXISTS".

-- People ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
  full_name       TEXT NOT NULL,
  roll_no         TEXT UNIQUE,                 -- students only
  section         TEXT,                        -- students only, e.g. 5J
  semester        INT,
  program         TEXT,
  department      TEXT,
  designation     TEXT,                        -- faculty only
  avatar_url      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at   TIMESTAMPTZ
);

-- Curriculum --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS subjects (
  code      TEXT PRIMARY KEY,                  -- CSE303
  name      TEXT NOT NULL,
  semester  INT,
  credits   INT,
  type      TEXT,                              -- Theory | Lab | Project
  color     TEXT
);

-- Which faculty member teaches which subject to which section.
CREATE TABLE IF NOT EXISTS course_sections (
  id            TEXT PRIMARY KEY,              -- toc-5j
  subject_code  TEXT NOT NULL REFERENCES subjects(code),
  section       TEXT NOT NULL,
  faculty_id    INT REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE (subject_code, section)
);

-- Uploaded files (stored on disk in backend/uploads, metadata here) ----------

CREATE TABLE IF NOT EXISTS files (
  id             TEXT PRIMARY KEY,
  original_name  TEXT NOT NULL,
  mime_type      TEXT,
  size_bytes     BIGINT NOT NULL DEFAULT 0,
  storage_path   TEXT NOT NULL,
  uploaded_by    INT REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Things faculty share. "sections" lists who receives it (e.g. {5J,5K}). ----

CREATE TABLE IF NOT EXISTS assignments (
  id            TEXT PRIMARY KEY,
  subject_code  TEXT NOT NULL REFERENCES subjects(code),
  sections      TEXT[] NOT NULL DEFAULT '{}',
  title         TEXT NOT NULL,
  type          TEXT NOT NULL DEFAULT 'Assignment',
  details       TEXT,
  due_at        TIMESTAMPTZ NOT NULL,
  marks         INT NOT NULL DEFAULT 10,
  created_by    INT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- A student's submission and its grade. assignment_id may also point at one
-- of the app's built-in sample assignments, so it has no foreign key.
-- Students are matched by roll number so the sample class roster can be
-- graded too; student_id is set for students who have an account.
CREATE TABLE IF NOT EXISTS submissions (
  id             SERIAL PRIMARY KEY,
  assignment_id  TEXT NOT NULL,
  student_roll   TEXT NOT NULL,
  student_id     INT REFERENCES users(id) ON DELETE CASCADE,
  status         TEXT NOT NULL CHECK (status IN ('submitted', 'graded')),
  file_id        TEXT REFERENCES files(id) ON DELETE SET NULL,
  file_name      TEXT,
  file_size      BIGINT,
  note           TEXT,
  submitted_at   TIMESTAMPTZ,
  score          NUMERIC(6, 2),
  feedback       TEXT,
  graded_by      INT REFERENCES users(id) ON DELETE SET NULL,
  graded_at      TIMESTAMPTZ,
  UNIQUE (assignment_id, student_roll)
);

CREATE TABLE IF NOT EXISTS tests (
  id            TEXT PRIMARY KEY,
  subject_code  TEXT NOT NULL REFERENCES subjects(code),
  sections      TEXT[] NOT NULL DEFAULT '{}',
  title         TEXT NOT NULL,
  syllabus      TEXT,
  start_at      TIMESTAMPTZ NOT NULL,
  minutes       INT NOT NULL DEFAULT 30,
  marks         INT NOT NULL DEFAULT 0,
  proctored     BOOLEAN NOT NULL DEFAULT true,
  show_score    BOOLEAN NOT NULL DEFAULT true,
  questions     JSONB NOT NULL DEFAULT '[]',  -- [{ text, options[], answer, explain, topic }]
  created_by    INT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- "Open now" on a built-in sample test moves its start time.
CREATE TABLE IF NOT EXISTS test_overrides (
  test_id     TEXT PRIMARY KEY,
  start_at    TIMESTAMPTZ NOT NULL,
  updated_by  INT REFERENCES users(id) ON DELETE SET NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS results_published (
  test_id       TEXT PRIMARY KEY,
  published_by  INT REFERENCES users(id) ON DELETE SET NULL,
  published_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS test_attempts (
  test_id       TEXT NOT NULL,
  student_roll  TEXT NOT NULL,
  student_id    INT REFERENCES users(id) ON DELETE CASCADE,
  data          JSONB NOT NULL,                -- answers, warnings, timings
  started_at    TIMESTAMPTZ,
  submitted_at  TIMESTAMPTZ,
  PRIMARY KEY (test_id, student_roll)
);

CREATE TABLE IF NOT EXISTS question_bank (
  id            TEXT PRIMARY KEY,
  subject_code  TEXT NOT NULL REFERENCES subjects(code),
  text          TEXT NOT NULL,
  options       JSONB NOT NULL,
  answer        INT NOT NULL,
  explain       TEXT,
  topic         TEXT,
  created_by    INT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS materials (
  id            TEXT PRIMARY KEY,
  subject_code  TEXT NOT NULL REFERENCES subjects(code),
  sections      TEXT[] NOT NULL DEFAULT '{}',
  unit          INT NOT NULL,
  type          TEXT NOT NULL,                 -- notes | slides | video | questions | link | code
  title         TEXT NOT NULL,
  meta          TEXT,
  note          TEXT,
  url           TEXT,
  file_id       TEXT REFERENCES files(id) ON DELETE SET NULL,
  file_name     TEXT,
  created_by    INT REFERENCES users(id) ON DELETE SET NULL,
  shared_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcements (
  id            TEXT PRIMARY KEY,
  subject_code  TEXT NOT NULL REFERENCES subjects(code),
  sections      TEXT[] NOT NULL DEFAULT '{}',
  title         TEXT NOT NULL,
  body          TEXT,
  created_by    INT REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pyqs (
  id            TEXT PRIMARY KEY,
  subject_code  TEXT NOT NULL REFERENCES subjects(code),
  sections      TEXT[] NOT NULL DEFAULT '{}',
  year          INT NOT NULL,
  exam          TEXT NOT NULL,
  exam_id       TEXT,
  file_id       TEXT REFERENCES files(id) ON DELETE SET NULL,
  file_name     TEXT,
  file_size     BIGINT,
  uploaded_by   INT REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Live classes and in-class polls ------------------------------------------

CREATE TABLE IF NOT EXISTS live_sessions (
  id                 SERIAL PRIMARY KEY,
  course_section_id  TEXT REFERENCES course_sections(id) ON DELETE SET NULL,
  subject_code       TEXT NOT NULL REFERENCES subjects(code),
  sections           TEXT[] NOT NULL DEFAULT '{}',
  faculty_id         INT REFERENCES users(id) ON DELETE SET NULL,
  started_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at           TIMESTAMPTZ,
  poll               JSONB,                    -- { q, options[], answer, launchedAt }
  demo_joined        BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS live_sessions_open ON live_sessions (ended_at) WHERE ended_at IS NULL;

CREATE TABLE IF NOT EXISTS live_votes (
  session_id    INT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  poll_key      TEXT NOT NULL,                 -- poll.launchedAt, so each poll has fresh votes
  student_roll  TEXT NOT NULL,
  student_id    INT REFERENCES users(id) ON DELETE CASCADE,
  choice        INT NOT NULL,
  voted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (session_id, poll_key, student_roll)
);

-- Discussions and doubts ---------------------------------------------------

CREATE TABLE IF NOT EXISTS threads (
  id            TEXT PRIMARY KEY,
  subject_code  TEXT REFERENCES subjects(code),
  title         TEXT NOT NULL,
  body          TEXT,
  author_name   TEXT NOT NULL,
  author_id     INT REFERENCES users(id) ON DELETE SET NULL,
  votes         INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thread_replies (
  id            SERIAL PRIMARY KEY,
  thread_id     TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
  position      INT NOT NULL,
  author_name   TEXT NOT NULL,
  author_id     INT REFERENCES users(id) ON DELETE SET NULL,
  role          TEXT,                          -- faculty | student
  body          TEXT NOT NULL,
  votes         INT NOT NULL DEFAULT 0,
  accepted      BOOLEAN NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (thread_id, position)
);

-- Study rooms (whole room kept as one JSON document) ------------------------

CREATE TABLE IF NOT EXISTS study_rooms (
  id          TEXT PRIMARY KEY,
  data        JSONB NOT NULL,
  created_by  INT REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Each user's own saved data: to-dos, resume, settings, chat history,
-- event registrations, practice progress and so on.
CREATE TABLE IF NOT EXISTS user_state (
  user_id     INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key         TEXT NOT NULL,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, key)
);

-- Helpful indexes -----------------------------------------------------------

CREATE INDEX IF NOT EXISTS assignments_subject  ON assignments (subject_code);
CREATE INDEX IF NOT EXISTS tests_subject        ON tests (subject_code);
CREATE INDEX IF NOT EXISTS materials_subject    ON materials (subject_code);
CREATE INDEX IF NOT EXISTS announcements_time   ON announcements (created_at DESC);
CREATE INDEX IF NOT EXISTS submissions_student  ON submissions (student_roll);
CREATE INDEX IF NOT EXISTS attempts_student     ON test_attempts (student_roll);
CREATE INDEX IF NOT EXISTS replies_thread       ON thread_replies (thread_id);
