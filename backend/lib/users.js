// Loading users and shaping them for the app.
const { query } = require('../db');

async function getUser(id) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] || null;
}

// Subjects a faculty member teaches (from course_sections).
async function facultySubjects(userId) {
  const { rows } = await query('SELECT DISTINCT subject_code FROM course_sections WHERE faculty_id = $1', [userId]);
  return rows.map((r) => r.subject_code);
}

// The profile object the frontend expects (Navbar, Home, Ask AI...).
function publicProfile(u) {
  const first = u.full_name.replace(/^(Dr|Prof|Mr|Ms|Mrs)\.?\s+/i, '').split(' ')[0];
  const base = {
    id: u.id,
    role: u.role,
    email: u.email,
    name: first,
    fullName: u.full_name,
    avatar: u.avatar_url,
    department: u.department,
    university: 'Alliance University',
  };
  if (u.role === 'faculty') return { ...base, designation: u.designation };
  return {
    ...base,
    rollNo: u.roll_no,
    section: u.section,
    semester: u.semester,
    program: u.program,
    // Engagement figures shown on Home (sample values until tracking is built).
    streakDays: 7,
    cgpa: 9.24,
    skillRank: { current: 10, total: 50, certificates: 14, achievements: 4380, xpPoints: 2450 },
  };
}

module.exports = { getUser, facultySubjects, publicProfile };
