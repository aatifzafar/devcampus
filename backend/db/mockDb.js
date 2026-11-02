// In-memory resilient mock database for Alliance.ai (EDUX 2.0)
// Pre-seeded with Alliance University faculty, students, curriculum, discussions, and study rooms.
// Automatically activates if PostgreSQL is not installed or unreachable.

const bcrypt = require('bcryptjs');
const path = require('path');
const seedData = require('./seed-data.json');
const { getAllRooms } = require('../models/studyGroupModel');

const DEMO_PASSWORD = 'Alliance@123';
const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);

class MockDatabase {
  constructor() {
    this.init();
  }

  init() {
    // 1. Users
    this.users = [
      {
        id: 1,
        email: 'demoteacher@alliance.edu.in',
        password_hash: passwordHash,
        role: 'faculty',
        full_name: 'Demo Teacher',
        designation: 'Assistant Professor',
        department: 'Computer Science and Engineering',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        created_at: new Date('2026-01-01').toISOString(),
        last_login_at: new Date().toISOString()
      },
      {
        id: 2,
        email: 'alex.sharma@alliance.edu.in',
        password_hash: passwordHash,
        role: 'student',
        full_name: 'Alex Sharma',
        roll_no: '2411021061234',
        section: '5J',
        semester: 5,
        program: 'B.Tech Computer Science and Engineering',
        department: 'Alliance School of Advanced Computing',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        created_at: new Date('2026-01-01').toISOString(),
        last_login_at: new Date().toISOString()
      },
      {
        id: 3,
        email: 'demostudent@alliance.edu.in',
        password_hash: passwordHash,
        role: 'student',
        full_name: 'Demo Student',
        roll_no: '2411021062201',
        section: '5K',
        semester: 5,
        program: 'B.Tech Computer Science and Engineering',
        department: 'Alliance School of Advanced Computing',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=250',
        created_at: new Date('2026-01-01').toISOString(),
        last_login_at: new Date().toISOString()
      }
    ];

    // 2. Subjects & Course Sections
    this.subjects = (seedData.subjects || []).map(s => ({ ...s }));
    this.course_sections = (seedData.sections || []).map(sec => ({
      ...sec,
      subject_code: sec.code,
      faculty_id: 1
    }));

    // 3. Threads & Replies
    this.threads = [];
    this.thread_replies = [];
    (seedData.threads || []).forEach(t => {
      this.threads.push({
        id: t.id,
        subject_code: t.code,
        title: t.title,
        body: t.body || null,
        author_name: t.author,
        votes: t.votes || 0,
        created_at: t.at || new Date().toISOString()
      });
      (t.replies || []).forEach((rep, i) => {
        this.thread_replies.push({
          id: `${t.id}_r${i}`,
          thread_id: t.id,
          position: i,
          author_name: rep.author,
          author_id: rep.role === 'faculty' ? 1 : null,
          role: rep.role || 'student',
          body: rep.body,
          votes: rep.votes || 0,
          accepted: Boolean(rep.accepted),
          created_at: rep.at || new Date().toISOString()
        });
      });
    });

    // 4. Study Rooms
    this.study_rooms = (getAllRooms() || []).map(r => ({
      id: r.id,
      data: r,
      created_by: 2,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // 5. Store Collections (Faculty shared content)
    this.assignments = [
      {
        id: 'asg_1',
        subject_code: 'CSE303',
        sections: ['5J', '5K'],
        title: 'DFA Minimisation & Pumping Lemma',
        type: 'Assignment',
        details: 'Construct minimal DFAs using Myhill-Nerode equivalence classes.',
        due_at: new Date(Date.now() + 4 * 86400000).toISOString(),
        marks: 10,
        created_by: 1,
        created_at: new Date().toISOString()
      },
      {
        id: 'asg_2',
        subject_code: 'CSE302',
        sections: ['5J'],
        title: 'ER to Relational Schema Mapping',
        type: 'Assignment',
        details: 'Map complex cardinality relationships and multi-valued attributes to 3NF tables.',
        due_at: new Date(Date.now() + 6 * 86400000).toISOString(),
        marks: 15,
        created_by: 1,
        created_at: new Date().toISOString()
      }
    ];

    this.tests = [
      {
        id: 't_toc_mid',
        subject_code: 'CSE303',
        sections: ['5J', '5K'],
        title: 'TOC Mid-Semester Proctored Test',
        syllabus: 'Unit 1 & Unit 2: Regular expressions, NFA/DFA, Grammars',
        start_at: new Date(Date.now() + 2 * 3600000).toISOString(),
        minutes: 45,
        marks: 25,
        proctored: true,
        show_score: true,
        questions: [
          { text: "Which language cannot be accepted by a finite automaton?", options: ["a*b*", "a^n b^n (n>=0)", "(ab)^n", "a+b"], answer: 1, marks: 5 }
        ],
        created_by: 1,
        created_at: new Date().toISOString()
      }
    ];

    this.question_bank = [
      {
        id: 'qb_1',
        subject_code: 'CSE303',
        text: 'What is the language of strings where number of 0s is divisible by 3?',
        options: ['Regular', 'Context-Free only', 'Turing Recognizable only', 'Non-recursive'],
        answer: 0,
        explain: 'Can be modeled by a 3-state DFA counting modulo 3.',
        topic: 'DFA State Counters'
      }
    ];

    this.materials = [
      {
        id: 'mat_1',
        subject_code: 'CSE303',
        sections: ['5J', '5K'],
        unit: 1,
        type: 'Notes',
        title: 'Unit 1 Complete Notes: Regular Languages & DFAs',
        meta: 'PDF • 24 Pages',
        note: 'Demo Teacher lecture slides',
        url: null,
        file_id: null,
        file_name: 'CSE303_Unit1_Notes.pdf',
        faculty: 'Demo Teacher',
        shared_at: new Date().toISOString()
      }
    ];

    this.announcements = [
      {
        id: 'ann_1',
        subject_code: 'CSE303',
        sections: ['5J', '5K'],
        title: 'Mid-term revision session tomorrow 4:00 PM',
        text: 'Bring your doubts on Pumping Lemma and closure properties.',
        at: new Date().toISOString(),
        created_by: 1
      }
    ];

    this.pyqs = [
      {
        id: 'pyq_1',
        subject_code: 'CSE303',
        sections: ['5J', '5K'],
        year: 2024,
        exam: 'MSE',
        exam_id: 'mse_2024',
        file_id: null,
        file_name: 'CSE303_MSE_2024.pdf',
        uploaded_at: new Date().toISOString()
      }
    ];

    // 6. Dynamic State
    this.user_state = new Map();
    this.files = new Map();
    this.submissions = new Map();
    this.test_attempts = new Map();
    this.test_overrides = new Map();
    this.results_published = new Set();
    this.live_sessions = [];
    this.live_votes = [];
  }

  async execute(sqlText, params = []) {
    const sql = sqlText.trim().replace(/\s+/g, ' ');
    const lower = sql.toLowerCase();

    // 1. Health check: SELECT 1 FROM users LIMIT 1
    if (lower.startsWith('select 1 from users')) {
      return { rows: [{ '?column?': 1 }], rowCount: 1 };
    }

    // 2. User Authentication & Profile Lookups
    if (lower.startsWith('select * from users where lower(email) = $1')) {
      const email = String(params[0] || '').toLowerCase();
      const user = this.users.find(u => u.email.toLowerCase() === email || (u.roll_no && u.roll_no.toLowerCase() === email));
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (lower.startsWith('select * from users where id = $1')) {
      const id = Number(params[0]);
      const user = this.users.find(u => u.id === id);
      return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
    }

    if (lower.includes('from users where role = \'student\' and roll_no is not null')) {
      const rows = this.users.filter(u => u.role === 'student' && u.roll_no).map(u => ({ roll_no: u.roll_no }));
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select id from users where roll_no = $1')) {
      const user = this.users.find(u => u.roll_no === params[0]);
      return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
    }

    if (lower.startsWith('select id from users where email =')) {
      const user = this.users.find(u => u.email === 'demoteacher@alliance.edu.in');
      return { rows: user ? [{ id: user.id }] : [], rowCount: user ? 1 : 0 };
    }

    if (lower.startsWith('update users set last_login_at = now() where id = $1')) {
      const id = Number(params[0]);
      const user = this.users.find(u => u.id === id);
      if (user) user.last_login_at = new Date().toISOString();
      return { rows: [], rowCount: user ? 1 : 0 };
    }

    if (lower.startsWith('update users set password_hash = $2 where id = $1')) {
      const user = this.users.find(u => u.id === Number(params[0]));
      if (user) user.password_hash = params[1];
      return { rows: [], rowCount: user ? 1 : 0 };
    }

    // 3. Course Sections & Teaching Subjects
    if (lower.includes('from course_sections where faculty_id = $1')) {
      const facultyId = Number(params[0]);
      const codes = [...new Set(this.course_sections.filter(c => c.faculty_id === facultyId).map(c => c.subject_code))];
      return { rows: codes.map(c => ({ subject_code: c })), rowCount: codes.length };
    }

    if (lower.startsWith('select section from course_sections where id = $1')) {
      const sec = this.course_sections.find(c => c.id === params[0]);
      return { rows: sec ? [{ section: sec.section }] : [], rowCount: sec ? 1 : 0 };
    }

    if (lower.includes('from course_sections where faculty_id =') && lower.includes('any(sections)')) {
      return { rows: [{ '1': 1 }], rowCount: 1 };
    }

    // 4. User State
    if (lower.startsWith('select key, value from user_state where user_id = $1')) {
      const uid = Number(params[0]);
      const rows = [];
      for (const [k, v] of this.user_state.entries()) {
        if (v.user_id === uid) rows.push({ key: v.key, value: v.value });
      }
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select value from user_state where user_id = $1 and key = $2')) {
      const uid = Number(params[0]);
      const key = params[1];
      const entry = this.user_state.get(`${uid}:${key}`);
      return { rows: entry ? [{ value: entry.value }] : [], rowCount: entry ? 1 : 0 };
    }

    if (lower.startsWith('insert into user_state (user_id, key, value, updated_at)')) {
      const [uid, key, val] = params;
      this.user_state.set(`${uid}:${key}`, { user_id: Number(uid), key, value: val, updated_at: new Date() });
      return { rows: [], rowCount: 1 };
    }

    if (lower.startsWith('delete from user_state where user_id = $1 and key = $2')) {
      const [uid, key] = params;
      this.user_state.delete(`${uid}:${key}`);
      return { rows: [], rowCount: 1 };
    }

    // 5. Study Groups
    if (lower.startsWith('select data from study_rooms order by created_at desc')) {
      const rows = this.study_rooms.map(r => ({ data: r.data }));
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select data from study_rooms where id = $1')) {
      const r = this.study_rooms.find(x => x.id === params[0]);
      return { rows: r ? [{ data: r.data }] : [], rowCount: r ? 1 : 0 };
    }

    if (lower.startsWith('insert into study_rooms (id, data, created_by) values ($1,$2,$3)')) {
      const [id, data, created_by] = params;
      this.study_rooms.unshift({ id, data, created_by, created_at: new Date().toISOString() });
      return { rows: [], rowCount: 1 };
    }

    if (lower.startsWith('update study_rooms set data = $2, updated_at = now() where id = $1')) {
      const [id, data] = params;
      const r = this.study_rooms.find(x => x.id === id);
      if (r) {
        r.data = data;
        r.updated_at = new Date().toISOString();
      }
      return { rows: [], rowCount: r ? 1 : 0 };
    }

    // 6. Store Collections (Assignments, Tests, Materials, Announcements, PYQs, QBank)
    const tables = ['assignments', 'tests', 'materials', 'announcements', 'pyqs', 'question_bank'];
    for (const t of tables) {
      if (lower.includes(`from ${t}`)) {
        let items = this[t] || [];
        // Filtering by subject_code
        if (params.length > 0 && typeof params[0] === 'string') {
          const code = params[0];
          items = items.filter(x => !x.subject_code || x.subject_code === code);
        }
        return { rows: items, rowCount: items.length };
      }
    }

    if (lower.startsWith('select test_id, start_at from test_overrides')) {
      const rows = Array.from(this.test_overrides.entries()).map(([test_id, start_at]) => ({ test_id, start_at }));
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select test_id from results_published')) {
      const rows = Array.from(this.results_published).map(test_id => ({ test_id }));
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select * from submissions')) {
      let rows = Array.from(this.submissions.values());
      if (params[0]) rows = rows.filter(s => s.student_roll === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select * from test_attempts')) {
      let rows = Array.from(this.test_attempts.values());
      if (params[0]) rows = rows.filter(a => a.student_roll === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('select * from live_sessions')) {
      const active = this.live_sessions.filter(s => !s.ended_at);
      return { rows: active, rowCount: active.length };
    }

    if (lower.startsWith('select student_roll, choice from live_votes')) {
      return { rows: this.live_votes, rowCount: this.live_votes.length };
    }

    // 7. Threads & Community Discussions
    if (lower.startsWith('select * from threads')) {
      return { rows: this.threads, rowCount: this.threads.length };
    }

    if (lower.startsWith('select * from thread_replies')) {
      let rows = this.thread_replies;
      if (params[0]) rows = rows.filter(r => r.thread_id === params[0]);
      return { rows, rowCount: rows.length };
    }

    if (lower.startsWith('insert into threads')) {
      const [id, code, title, body, author, votes, at] = params;
      this.threads.unshift({ id, subject_code: code, title, body, author_name: author, votes: votes || 0, created_at: at || new Date().toISOString() });
      return { rows: [], rowCount: 1 };
    }

    if (lower.startsWith('insert into thread_replies')) {
      const [tId, pos, author, author_id, role, body, votes, accepted, at] = params;
      this.thread_replies.push({ id: `${tId}_r_${Date.now()}`, thread_id: tId, position: pos, author_name: author, author_id, role, body, votes: votes || 0, accepted, created_at: at });
      return { rows: [], rowCount: 1 };
    }

    if (lower.startsWith('update thread_replies set votes =')) {
      const [id, votes, accepted] = params;
      const rep = this.thread_replies.find(r => r.id === id);
      if (rep) {
        rep.votes = votes;
        rep.accepted = accepted;
      }
      return { rows: [], rowCount: 1 };
    }

    // 8. Files
    if (lower.startsWith('select 1 from files where id = $1')) {
      const exists = this.files.has(params[0]);
      return { rows: exists ? [{ '?column?': 1 }] : [], rowCount: exists ? 1 : 0 };
    }

    if (lower.startsWith('select * from files where id = $1')) {
      const f = this.files.get(params[0]);
      return { rows: f ? [f] : [], rowCount: f ? 1 : 0 };
    }

    if (lower.startsWith('insert into files')) {
      const [id, orig, mime, size, storage, uid] = params;
      this.files.set(id, { id, original_name: orig, mime_type: mime, size_bytes: size, storage_path: storage, uploaded_by: uid, created_at: new Date().toISOString() });
      return { rows: [], rowCount: 1 };
    }

    // Default catch-all for upserts and general executions
    return { rows: [], rowCount: 1 };
  }
}

const mockDbInstance = new MockDatabase();

module.exports = {
  mockDb: mockDbInstance,
  DEMO_PASSWORD
};
