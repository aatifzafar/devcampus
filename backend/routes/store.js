// Everything faculty share with students, and what students send back.
//
//   GET    /api/store                         all data visible to the signed-in user
//   POST   /api/store/:collection             faculty: create (assignments, tests, qbank, materials, announcements, pyqs)
//   PUT    /api/store/:collection/:id         faculty: update
//   DELETE /api/store/:collection/:id         faculty: delete
//   PUT    /api/store/testOverrides/:id       faculty: open a sample test early ({ start })
//   PUT    /api/store/published/:id           faculty: publish test results
//   PUT    /api/store/grades/:assignmentId/:roll   faculty: marks and feedback
//   POST   /api/store/live/start|poll|end     faculty: live class
//   POST   /api/store/live/join|vote          student: join / answer a poll
const express = require('express');
const { query, transaction } = require('../db');
const { requireAuth, requireRole, ah } = require('../lib/auth');
const { getUser, facultySubjects } = require('../lib/users');
const { broadcast } = require('../lib/events');

const router = express.Router();
router.use(requireAuth);

const iso = (d) => (d ? new Date(d).toISOString() : null);
const arr = (v) => (Array.isArray(v) ? v.map(String) : []);
const bad = (res, message) => res.status(400).json({ success: false, message });

/* ---------------------------------------------------------------------- */
/* Row <-> app shape                                                       */
/* ---------------------------------------------------------------------- */

const COLLECTIONS = {
  assignments: {
    table: 'assignments',
    toApp: (r) => ({ id: r.id, code: r.subject_code, sections: r.sections, title: r.title, type: r.type, details: r.details, due: iso(r.due_at), marks: r.marks, createdAt: iso(r.created_at) }),
    toRow: (x) => ({ subject_code: x.code, sections: arr(x.sections), title: x.title, type: x.type || 'Assignment', details: x.details || null, due_at: x.due, marks: Number(x.marks) || 10 }),
    validate: (x) => (!x.title?.trim() ? 'Add a title' : !x.due || Number.isNaN(Date.parse(x.due)) ? 'Add a valid deadline' : null),
  },
  tests: {
    table: 'tests',
    toApp: (r) => ({ id: r.id, code: r.subject_code, sections: r.sections, title: r.title, syllabus: r.syllabus, start: iso(r.start_at), minutes: r.minutes, marks: r.marks, proctored: r.proctored, showScore: r.show_score, customQuestions: r.questions, createdAt: iso(r.created_at) }),
    toRow: (x) => ({ subject_code: x.code, sections: arr(x.sections), title: x.title, syllabus: x.syllabus || null, start_at: x.start, minutes: Number(x.minutes) || 30, marks: Number(x.marks) || (x.customQuestions || []).length, proctored: x.proctored !== false, show_score: x.showScore !== false, questions: JSON.stringify(x.customQuestions || []) }),
    validate: (x) => (!x.title?.trim() ? 'Give the test a title' : !x.start || Number.isNaN(Date.parse(x.start)) ? 'Add a valid start time' : !Array.isArray(x.customQuestions) || !x.customQuestions.length ? 'Pick at least one question' : null),
  },
  qbank: {
    table: 'question_bank',
    toApp: (r) => ({ id: r.id, code: r.subject_code, text: r.text, options: r.options, answer: r.answer, explain: r.explain, topic: r.topic }),
    toRow: (x) => ({ subject_code: x.code, text: x.text, options: JSON.stringify(x.options || []), answer: Number(x.answer) || 0, explain: x.explain || null, topic: x.topic || null }),
    validate: (x) => (!x.text?.trim() ? 'Write the question' : !Array.isArray(x.options) || x.options.length < 2 ? 'Add at least two options' : null),
  },
  materials: {
    table: 'materials',
    toApp: (r) => ({ id: r.id, code: r.subject_code, sections: r.sections, unit: r.unit, type: r.type, title: r.title, meta: r.meta, note: r.note, url: r.url, fileId: r.file_id, fileName: r.file_name, sharedAt: iso(r.shared_at) }),
    toRow: (x) => ({ subject_code: x.code, sections: arr(x.sections), unit: Number(x.unit) || 1, type: x.type, title: x.title, meta: x.meta || null, note: x.note || null, url: x.url || null, file_id: x.fileId || null, file_name: x.fileName || null }),
    validate: (x) => (!x.title?.trim() ? 'Give the material a title' : !x.type ? 'Choose a type' : null),
  },
  announcements: {
    table: 'announcements',
    toApp: (r) => ({ id: r.id, code: r.subject_code, sections: r.sections, title: r.title, text: r.body || '', at: iso(r.created_at) }),
    toRow: (x) => ({ subject_code: x.code, sections: arr(x.sections), title: x.title, body: x.text || null }),
    validate: (x) => (!x.title?.trim() ? 'Add a title' : null),
  },
  pyqs: {
    table: 'pyqs',
    toApp: (r) => ({ id: r.id, code: r.subject_code, sections: r.sections, year: r.year, exam: r.exam, examId: r.exam_id, fileId: r.file_id, fileName: r.file_name, size: r.file_size === null ? null : Number(r.file_size), uploadedAt: iso(r.uploaded_at) }),
    toRow: (x) => ({ subject_code: x.code, sections: arr(x.sections), year: Number(x.year), exam: x.exam, exam_id: x.examId || null, file_id: x.fileId || null, file_name: x.fileName || null, file_size: x.size || null }),
    validate: (x) => (!x.year || !x.exam ? 'Choose the year and exam' : null),
  },
};

const submissionToApp = (r) => ({
  status: r.status,
  fileId: r.file_id,
  fileName: r.file_name,
  size: r.file_size === null ? undefined : Number(r.file_size),
  note: r.note || '',
  submittedAt: iso(r.submitted_at),
  score: r.score === null ? undefined : Number(r.score),
  feedback: r.feedback || undefined,
});

/* ---------------------------------------------------------------------- */
/* Read                                                                    */
/* ---------------------------------------------------------------------- */

async function liveFor(user, codes) {
  const sql =
    user.role === 'faculty'
      ? ['SELECT * FROM live_sessions WHERE ended_at IS NULL AND faculty_id = $1 ORDER BY started_at DESC LIMIT 1', [user.id]]
      : ['SELECT * FROM live_sessions WHERE ended_at IS NULL AND $1 = ANY(sections) ORDER BY started_at DESC LIMIT 1', [user.section]];
  const s = (await query(...sql)).rows[0];
  if (!s || (user.role === 'faculty' && codes && !codes.includes(s.subject_code))) return null;
  const votes = {};
  if (s.poll?.launchedAt) {
    const v = await query('SELECT student_roll, choice FROM live_votes WHERE session_id = $1 AND poll_key = $2', [s.id, s.poll.launchedAt]);
    v.rows.forEach((r) => { votes[r.student_roll] = r.choice; });
  }
  const cs = s.course_section_id ? (await query('SELECT section FROM course_sections WHERE id = $1', [s.course_section_id])).rows[0] : null;
  return { id: s.id, courseId: s.course_section_id, code: s.subject_code, section: cs?.section || s.sections[0], sections: s.sections, startedAt: iso(s.started_at), poll: s.poll, votes, demoJoined: s.demo_joined };
}

router.get('/', ah(async (req, res) => {
  const me = await getUser(req.user.id);
  if (!me) return res.status(401).json({ success: false, message: 'Account not found. Please sign in again.' });
  const faculty = me.role === 'faculty';
  const codes = faculty ? await facultySubjects(me.id) : null;
  const filter = faculty ? ['subject_code = ANY($1)', [codes]] : ['$1 = ANY(sections)', [me.section]];

  const out = { attendance: [], grades: {} };
  for (const [name, c] of Object.entries(COLLECTIONS)) {
    if (name === 'qbank' && !faculty) { out.qbank = []; continue; }
    const where = name === 'qbank' ? ['subject_code = ANY($1)', [codes]] : filter;
    const order = { assignments: 'due_at', tests: 'start_at', qbank: 'created_at', materials: 'shared_at', announcements: 'created_at DESC', pyqs: 'uploaded_at DESC' }[name];
    const { rows } = await query(`SELECT * FROM ${c.table} WHERE ${where[0]} ORDER BY ${order}`, where[1]);
    out[name] = rows.map(c.toApp);
  }

  out.testOverrides = {};
  (await query('SELECT test_id, start_at FROM test_overrides')).rows.forEach((r) => { out.testOverrides[r.test_id] = { start: iso(r.start_at) }; });
  out.published = {};
  (await query('SELECT test_id FROM results_published')).rows.forEach((r) => { out.published[r.test_id] = true; });

  // Submissions and attempts: faculty see everyone's, students only their own.
  const subs = faculty
    ? await query('SELECT * FROM submissions')
    : await query('SELECT * FROM submissions WHERE student_roll = $1', [me.roll_no]);
  out.submissions = {};
  subs.rows.forEach((r) => { (out.submissions[r.assignment_id] ||= {})[r.student_roll] = submissionToApp(r); });
  const att = faculty
    ? await query('SELECT * FROM test_attempts')
    : await query('SELECT * FROM test_attempts WHERE student_roll = $1', [me.roll_no]);
  out.attempts = {};
  att.rows.forEach((r) => { (out.attempts[r.test_id] ||= {})[r.student_roll] = r.data; });

  out.accounts = faculty ? (await query("SELECT roll_no FROM users WHERE role = 'student' AND roll_no IS NOT NULL")).rows.map((r) => r.roll_no) : [];
  out.live = await liveFor(me, codes);
  res.json({ success: true, data: out });
}));

/* ---------------------------------------------------------------------- */
/* Faculty writes                                                          */
/* ---------------------------------------------------------------------- */

const faculty = requireRole('faculty', 'admin');

async function checkSubject(req, res, code) {
  if (req.user.role === 'admin') return true;
  const codes = await facultySubjects(req.user.id);
  if (!codes.includes(code)) {
    res.status(403).json({ success: false, message: `You don't teach ${code}.` });
    return false;
  }
  return true;
}

function upsertSql(table, row, id, userId, insert) {
  const cols = Object.keys(row);
  const vals = Object.values(row);
  if (insert) {
    const ownerCol = { pyqs: 'uploaded_by' }[table] || 'created_by';
    const all = ['id', ...cols, ownerCol];
    return [`INSERT INTO ${table} (${all.join(', ')}) VALUES (${all.map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`, [id, ...vals, userId]];
  }
  return [`UPDATE ${table} SET ${cols.map((c, i) => `${c} = $${i + 2}`).join(', ')} WHERE id = $1 RETURNING *`, [id, ...vals]];
}

// Keep the special routes ahead of the generic "/:collection" ones.
router.put('/testOverrides/:id', faculty, ah(async (req, res) => {
  if (!req.body.start || Number.isNaN(Date.parse(req.body.start))) return bad(res, 'Send a valid start time');
  await query(
    `INSERT INTO test_overrides (test_id, start_at, updated_by) VALUES ($1,$2,$3)
     ON CONFLICT (test_id) DO UPDATE SET start_at = EXCLUDED.start_at, updated_by = EXCLUDED.updated_by, updated_at = now()`,
    [req.params.id, req.body.start, req.user.id]
  );
  broadcast('store');
  res.json({ success: true });
}));

router.put('/published/:id', faculty, ah(async (req, res) => {
  await query('INSERT INTO results_published (test_id, published_by) VALUES ($1,$2) ON CONFLICT (test_id) DO NOTHING', [req.params.id, req.user.id]);
  broadcast('store');
  res.json({ success: true });
}));

router.put('/grades/:assignmentId/:roll', faculty, ah(async (req, res) => {
  const score = Number(req.body.score);
  if (req.body.score === '' || req.body.score === undefined || Number.isNaN(score) || score < 0) return bad(res, 'Enter valid marks');
  const student = (await query('SELECT id FROM users WHERE roll_no = $1', [req.params.roll])).rows[0];
  await query(
    `INSERT INTO submissions (assignment_id, student_roll, student_id, status, score, feedback, graded_by, graded_at, file_name, submitted_at)
     VALUES ($1,$2,$3,'graded',$4,$5,$6,now(),$7,$8)
     ON CONFLICT (assignment_id, student_roll) DO UPDATE
       SET status = 'graded', score = EXCLUDED.score, feedback = EXCLUDED.feedback, graded_by = EXCLUDED.graded_by, graded_at = now()`,
    [req.params.assignmentId, req.params.roll, student?.id || null, score, req.body.feedback || null, req.user.id, req.body.fileName || null, req.body.submittedAt || null]
  );
  broadcast('store');
  broadcast('state:alliance-assignments');
  res.json({ success: true });
}));

/* Live class ------------------------------------------------------------ */

router.post('/live/start', faculty, ah(async (req, res) => {
  const { courseId, code, sections } = req.body;
  if (!code || !arr(sections).length) return bad(res, 'Choose at least one section');
  if (!(await checkSubject(req, res, code))) return;
  await transaction(async (db) => {
    await db.query('UPDATE live_sessions SET ended_at = now() WHERE faculty_id = $1 AND ended_at IS NULL', [req.user.id]);
    await db.query('INSERT INTO live_sessions (course_section_id, subject_code, sections, faculty_id) VALUES ($1,$2,$3,$4)', [courseId || null, code, arr(sections), req.user.id]);
  });
  broadcast('store');
  res.json({ success: true });
}));

router.post('/live/poll', faculty, ah(async (req, res) => {
  const poll = req.body.poll;
  if (poll && (!poll.q || !Array.isArray(poll.options) || poll.options.length < 2)) return bad(res, 'A poll needs a question and two options');
  const r = await query('UPDATE live_sessions SET poll = $2 WHERE faculty_id = $1 AND ended_at IS NULL RETURNING id', [req.user.id, poll ? JSON.stringify({ ...poll, launchedAt: poll.launchedAt || new Date().toISOString() }) : null]);
  if (!r.rowCount) return res.status(404).json({ success: false, message: 'No live class is running.' });
  broadcast('store');
  res.json({ success: true });
}));

router.post('/live/end', faculty, ah(async (req, res) => {
  await query('UPDATE live_sessions SET ended_at = now() WHERE faculty_id = $1 AND ended_at IS NULL', [req.user.id]);
  broadcast('store');
  res.json({ success: true });
}));

router.post('/live/join', requireRole('student'), ah(async (req, res) => {
  const me = await getUser(req.user.id);
  await query('UPDATE live_sessions SET demo_joined = true WHERE ended_at IS NULL AND $1 = ANY(sections)', [me.section]);
  broadcast('store');
  res.json({ success: true });
}));

router.post('/live/vote', requireRole('student'), ah(async (req, res) => {
  const me = await getUser(req.user.id);
  const live = (await query('SELECT * FROM live_sessions WHERE ended_at IS NULL AND $1 = ANY(sections) ORDER BY started_at DESC LIMIT 1', [me.section])).rows[0];
  if (!live?.poll) return res.status(404).json({ success: false, message: 'There is no poll right now.' });
  const choice = Number(req.body.choice);
  if (!Number.isInteger(choice) || choice < 0 || choice >= live.poll.options.length) return bad(res, 'Pick one of the options');
  await query(
    `INSERT INTO live_votes (session_id, poll_key, student_roll, student_id, choice) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (session_id, poll_key, student_roll) DO NOTHING`,
    [live.id, live.poll.launchedAt, me.roll_no, me.id, choice]
  );
  broadcast('store');
  res.json({ success: true });
}));

/* Generic collections --------------------------------------------------- */

const collection = (req, res) => {
  const c = COLLECTIONS[req.params.collection];
  if (!c) res.status(404).json({ success: false, message: `Unknown collection ${req.params.collection}` });
  return c;
};

router.post('/:collection', faculty, ah(async (req, res) => {
  const c = collection(req, res);
  if (!c) return;
  const x = req.body || {};
  if (!x.id) return bad(res, 'Missing id');
  const problem = c.validate(x);
  if (problem) return bad(res, problem);
  if (!(await checkSubject(req, res, x.code))) return;
  const exists = (await query(`SELECT 1 FROM ${c.table} WHERE id = $1`, [x.id])).rowCount;
  const { rows } = await query(...upsertSql(c.table, c.toRow(x), x.id, req.user.id, !exists));
  broadcast('store');
  res.status(exists ? 200 : 201).json({ success: true, data: c.toApp(rows[0]) });
}));

router.put('/:collection/:id', faculty, ah(async (req, res) => {
  const c = collection(req, res);
  if (!c) return;
  const x = { ...req.body, id: req.params.id };
  const problem = c.validate(x);
  if (problem) return bad(res, problem);
  if (!(await checkSubject(req, res, x.code))) return;
  const exists = (await query(`SELECT 1 FROM ${c.table} WHERE id = $1`, [x.id])).rowCount;
  const { rows } = await query(...upsertSql(c.table, c.toRow(x), x.id, req.user.id, !exists));
  broadcast('store');
  res.json({ success: true, data: c.toApp(rows[0]) });
}));

router.delete('/:collection/:id', faculty, ah(async (req, res) => {
  const c = collection(req, res);
  if (!c) return;
  const row = (await query(`SELECT subject_code FROM ${c.table} WHERE id = $1`, [req.params.id])).rows[0];
  if (!row) return res.json({ success: true });
  if (!(await checkSubject(req, res, row.subject_code))) return;
  await query(`DELETE FROM ${c.table} WHERE id = $1`, [req.params.id]);
  broadcast('store');
  res.json({ success: true });
}));

module.exports = router;
