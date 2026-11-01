// Demo data: accounts, subjects, who teaches what, sample discussions and
// study rooms. Uses ON CONFLICT so running it again changes nothing.
const bcrypt = require('bcryptjs');
const data = require('./seed-data.json');

const DEMO_PASSWORD = 'Alliance@123';

const USERS = [
  {
    email: 'devika@alliance.edu.in', role: 'faculty', full_name: 'Dr. Devika P',
    department: 'Computer Science and Engineering', designation: 'Assistant Professor',
  },
  {
    email: 'anna.sharma@alliance.edu.in', role: 'student', full_name: 'Anna Sharma',
    roll_no: '2411021061234', section: '5J', semester: 5, program: 'B.Tech Computer Science and Engineering',
    department: 'Alliance School of Advanced Computing',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  },
  {
    email: 'kabir.das@alliance.edu.in', role: 'student', full_name: 'Kabir Das',
    roll_no: '2411021062201', section: '5K', semester: 5, program: 'B.Tech Computer Science and Engineering',
    department: 'Alliance School of Advanced Computing',
  },
];

async function seed(db) {
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  let users = 0;
  for (const u of USERS) {
    const r = await db.query(
      `INSERT INTO users (email, password_hash, role, full_name, roll_no, section, semester, program, department, designation, avatar_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT (email) DO NOTHING`,
      [u.email, hash, u.role, u.full_name, u.roll_no || null, u.section || null, u.semester || null, u.program || null, u.department || null, u.designation || null, u.avatar_url || null]
    );
    users += r.rowCount;
  }
  const faculty = (await db.query(`SELECT id FROM users WHERE email = 'devika@alliance.edu.in'`)).rows[0];

  for (const s of data.subjects) {
    await db.query(
      `INSERT INTO subjects (code, name, semester, credits, type, color) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (code) DO NOTHING`,
      [s.code, s.name, s.semester, s.credits, s.type, s.color || null]
    );
  }
  for (const c of data.sections) {
    await db.query(
      `INSERT INTO course_sections (id, subject_code, section, faculty_id) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING`,
      [c.id, c.code, c.section, faculty?.id || null]
    );
  }

  let threads = 0;
  for (const t of data.threads) {
    const r = await db.query(
      `INSERT INTO threads (id, subject_code, title, body, author_name, votes, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (id) DO NOTHING`,
      [t.id, t.code, t.title, t.body || null, t.author, t.votes || 0, t.at]
    );
    if (r.rowCount) {
      threads += 1;
      for (const [i, rep] of (t.replies || []).entries()) {
        await db.query(
          `INSERT INTO thread_replies (thread_id, position, author_name, author_id, role, body, votes, accepted, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [t.id, i, rep.author, rep.role === 'faculty' ? faculty?.id || null : null, rep.role || 'student', rep.body, rep.votes || 0, Boolean(rep.accepted), rep.at]
        );
      }
    }
  }

  // Study rooms: start from the rooms the app shipped with.
  const { getAllRooms } = require('../models/studyGroupModel');
  let rooms = 0;
  for (const room of getAllRooms()) {
    const r = await db.query(`INSERT INTO study_rooms (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`, [room.id, room]);
    rooms += r.rowCount;
  }

  return `Seeded: ${users} new accounts, ${data.subjects.length} subjects, ${data.sections.length} course sections, ${threads} new discussions, ${rooms} new study rooms.`;
}

module.exports = { seed, DEMO_PASSWORD };
