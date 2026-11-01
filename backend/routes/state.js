// Each user's saved data, keyed the same way the app names it.
//
//   GET /api/state          every saved key for the signed-in user
//   PUT /api/state/:key     save one key ({ value })
//
// Most keys (to-dos, resume, settings, chat...) are stored as-is in user_state.
// Three keys are shared with other people, so they live in real tables:
//   alliance-assignments    a student's submissions   -> submissions
//   alliance-test-attempts  a student's test attempts -> test_attempts
//   alliance-threads        discussions and doubts    -> threads, thread_replies
const express = require('express');
const { query, transaction } = require('../db');
const { requireAuth, ah } = require('../lib/auth');
const { getUser } = require('../lib/users');
const { broadcast } = require('../lib/events');

const router = express.Router();
router.use(requireAuth);

const KEY_RE = /^alliance-[a-z0-9-]{1,60}$/;
const iso = (d) => (d ? new Date(d).toISOString() : null);

/* Submissions ------------------------------------------------------------ */

async function readSubmissions(me) {
  if (!me.roll_no) return {};
  const { rows } = await query('SELECT * FROM submissions WHERE student_roll = $1', [me.roll_no]);
  const out = {};
  rows.forEach((r) => {
    out[r.assignment_id] = {
      status: r.status, fileId: r.file_id, fileName: r.file_name, size: r.file_size === null ? undefined : Number(r.file_size),
      note: r.note || '', submittedAt: iso(r.submitted_at), score: r.score === null ? undefined : Number(r.score), feedback: r.feedback || undefined,
    };
  });
  return out;
}

async function writeSubmissions(me, value) {
  if (me.role !== 'student' || !value || typeof value !== 'object') return false;
  let changed = false;
  for (const [aid, s] of Object.entries(value)) {
    if (!s || s.status !== 'submitted' || !s.submittedAt) continue;
    // Students can submit or replace a file until it is graded; marks are faculty-only.
    const r = await query(
      `INSERT INTO submissions (assignment_id, student_roll, student_id, status, file_id, file_name, file_size, note, submitted_at)
       VALUES ($1,$2,$3,'submitted',$4,$5,$6,$7,$8)
       ON CONFLICT (assignment_id, student_roll) DO UPDATE
         SET file_id = EXCLUDED.file_id, file_name = EXCLUDED.file_name, file_size = EXCLUDED.file_size,
             note = EXCLUDED.note, submitted_at = EXCLUDED.submitted_at
         WHERE submissions.status = 'submitted' AND submissions.submitted_at IS DISTINCT FROM EXCLUDED.submitted_at`,
      [aid, me.roll_no, me.id, s.fileId || null, s.fileName || null, s.size || null, s.note || null, s.submittedAt]
    );
    changed = changed || r.rowCount > 0;
  }
  return changed;
}

/* Test attempts ---------------------------------------------------------- */

async function readAttempts(me) {
  if (!me.roll_no) return {};
  const { rows } = await query('SELECT test_id, data FROM test_attempts WHERE student_roll = $1', [me.roll_no]);
  return Object.fromEntries(rows.map((r) => [r.test_id, r.data]));
}

async function writeAttempts(me, value) {
  if (me.role !== 'student' || !value || typeof value !== 'object') return false;
  let changed = false;
  for (const [tid, a] of Object.entries(value)) {
    if (!a || typeof a !== 'object') continue;
    // Once submitted, an attempt can't be changed.
    const r = await query(
      `INSERT INTO test_attempts (test_id, student_roll, student_id, data, started_at, submitted_at)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (test_id, student_roll) DO UPDATE SET data = EXCLUDED.data, submitted_at = EXCLUDED.submitted_at
         WHERE test_attempts.submitted_at IS NULL AND test_attempts.data IS DISTINCT FROM EXCLUDED.data`,
      [tid, me.roll_no, me.id, JSON.stringify(a), a.startedAt || new Date().toISOString(), a.submittedAt || null]
    );
    changed = changed || r.rowCount > 0;
  }
  return changed;
}

/* Discussions ------------------------------------------------------------ */

async function readThreads(me) {
  const t = await query('SELECT * FROM threads ORDER BY created_at DESC');
  const r = await query('SELECT * FROM thread_replies ORDER BY thread_id, position');
  const replies = {};
  r.rows.forEach((x) => {
    (replies[x.thread_id] ||= []).push({
      author: x.author_id === me.id ? 'You' : x.author_name, role: x.role, at: iso(x.created_at), votes: x.votes, accepted: x.accepted, body: x.body,
    });
  });
  return t.rows.map((x) => ({
    id: x.id, code: x.subject_code, title: x.title, body: x.body || '', author: x.author_id === me.id ? 'You' : x.author_name,
    at: iso(x.created_at), votes: x.votes, mine: x.author_id === me.id, replies: replies[x.id] || [],
  }));
}

// Merge what the client sends: new threads, new replies (matched by time and
// text so two people replying at once don't overwrite each other), votes and
// the accepted answer. Nothing is deleted.
async function writeThreads(me, value) {
  if (!Array.isArray(value)) return false;
  let changed = false;
  await transaction(async (db) => {
    for (const t of value) {
      if (!t?.id || !t.title) continue;
      const existing = (await db.query('SELECT votes FROM threads WHERE id = $1', [t.id])).rows[0];
      if (!existing) {
        await db.query(
          'INSERT INTO threads (id, subject_code, title, body, author_name, author_id, votes, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [t.id, t.code || null, String(t.title).slice(0, 300), t.body || null, me.full_name, me.id, Number(t.votes) || 0, t.at || new Date().toISOString()]
        );
        changed = true;
      } else if (Number(t.votes) !== existing.votes && Number.isFinite(Number(t.votes))) {
        await db.query('UPDATE threads SET votes = $2 WHERE id = $1', [t.id, Number(t.votes)]);
        changed = true;
      }
      const dbReplies = (await db.query('SELECT id, position, body, created_at, votes, accepted FROM thread_replies WHERE thread_id = $1 ORDER BY position', [t.id])).rows;
      const sig = (body, at) => `${new Date(at).getTime()}|${body}`;
      const known = new Map(dbReplies.map((r) => [sig(r.body, r.created_at), r]));
      let next = dbReplies.length ? Math.max(...dbReplies.map((r) => r.position)) + 1 : 0;
      for (const rep of t.replies || []) {
        if (!rep?.body || !rep.at) continue;
        const row = known.get(sig(rep.body, rep.at));
        if (!row) {
          await db.query(
            'INSERT INTO thread_replies (thread_id, position, author_name, author_id, role, body, votes, accepted, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',
            [t.id, next++, me.full_name, me.id, me.role === 'faculty' ? 'faculty' : 'student', String(rep.body).slice(0, 5000), Number(rep.votes) || 0, me.role === 'faculty' && Boolean(rep.accepted), rep.at]
          );
          changed = true;
        } else if (row.votes !== (Number(rep.votes) || 0) || (me.role === 'faculty' && row.accepted !== Boolean(rep.accepted))) {
          await db.query('UPDATE thread_replies SET votes = $2, accepted = $3 WHERE id = $1', [row.id, Number(rep.votes) || 0, me.role === 'faculty' ? Boolean(rep.accepted) : row.accepted]);
          changed = true;
        }
      }
    }
  });
  return changed;
}

/* Routes ----------------------------------------------------------------- */

const SPECIAL = {
  'alliance-assignments': [readSubmissions, writeSubmissions],
  'alliance-test-attempts': [readAttempts, writeAttempts],
  'alliance-threads': [readThreads, writeThreads],
};

router.get('/', ah(async (req, res) => {
  const me = await getUser(req.user.id);
  if (!me) return res.status(401).json({ success: false, message: 'Account not found. Please sign in again.' });
  const { rows } = await query('SELECT key, value FROM user_state WHERE user_id = $1', [me.id]);
  const data = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  for (const [key, [read]] of Object.entries(SPECIAL)) data[key] = await read(me);
  res.json({ success: true, data });
}));

router.get('/:key', ah(async (req, res) => {
  const me = await getUser(req.user.id);
  const key = req.params.key;
  if (SPECIAL[key]) return res.json({ success: true, data: await SPECIAL[key][0](me) });
  const row = (await query('SELECT value FROM user_state WHERE user_id = $1 AND key = $2', [me.id, key])).rows[0];
  res.json({ success: true, data: row ? row.value : null });
}));

router.put('/:key', ah(async (req, res) => {
  const key = req.params.key;
  if (!KEY_RE.test(key)) return res.status(400).json({ success: false, message: 'Invalid key' });
  if (!('value' in (req.body || {}))) return res.status(400).json({ success: false, message: 'Send { value }' });
  const me = await getUser(req.user.id);
  if (SPECIAL[key]) {
    const changed = await SPECIAL[key][1](me, req.body.value);
    if (changed) {
      broadcast(`state:${key}`);
      broadcast('store'); // faculty views read submissions/attempts from the store
    }
    return res.json({ success: true, data: await SPECIAL[key][0](me) });
  }
  await query(
    `INSERT INTO user_state (user_id, key, value) VALUES ($1,$2,$3)
     ON CONFLICT (user_id, key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`,
    [me.id, key, JSON.stringify(req.body.value)]
  );
  res.json({ success: true });
}));

module.exports = router;
