// Study rooms, stored in PostgreSQL (table study_rooms, one JSON document per room).
const express = require('express');
const { query } = require('../db');
const { requireAuth, ah } = require('../lib/auth');
const { getUser } = require('../lib/users');
const { broadcast } = require('../lib/events');

const router = express.Router();
router.use(requireAuth);

const load = async (id) => (await query('SELECT data FROM study_rooms WHERE id = $1', [id])).rows[0]?.data || null;
const save = (room) => query('UPDATE study_rooms SET data = $2, updated_at = now() WHERE id = $1', [room.id, room]);
const notFound = (res) => res.status(404).json({ success: false, message: 'Study room not found' });

// GET /api/studygroups
router.get('/', ah(async (req, res) => {
  const { rows } = await query('SELECT data FROM study_rooms ORDER BY created_at DESC');
  res.json({ success: true, count: rows.length, data: rows.map((r) => r.data) });
}));

// GET /api/studygroups/:id
router.get('/:id', ah(async (req, res) => {
  const room = await load(req.params.id);
  if (!room) return notFound(res);
  res.json({ success: true, data: room });
}));

// POST /api/studygroups
router.post('/', ah(async (req, res) => {
  const title = req.body?.title || req.body?.name;
  const { courseCode, courseName, topic, maxPeers, pomodoroMinutes } = req.body || {};
  if (!title || !courseCode) return res.status(400).json({ success: false, message: 'Title and courseCode are required' });
  const me = await getUser(req.user.id);
  const minutes = parseInt(pomodoroMinutes, 10) || 25;
  const now = Date.now();
  const room = {
    id: `room_${now}`,
    title,
    courseCode,
    courseName: courseName || courseCode,
    topic: topic || 'Collaborative Session',
    host: me.full_name,
    activePeersCount: 1,
    maxPeers: parseInt(maxPeers, 10) || 6,
    isLive: true,
    pomodoro: { mode: 'work', durationMinutes: minutes, secondsRemaining: minutes * 60, isRunning: false, cyclesCompleted: 0 },
    peers: [{ id: `p_${me.id}`, name: `${me.full_name} (You)`, avatar: me.avatar_url, role: 'Host', status: 'Leading discussion', micOn: true, camOn: true }],
    scratchpad: `# ${title}\nWelcome to our live study room! Write down shared notes, key formulas, or code snippets here.`,
    messages: [{ id: `msg_init_${now}`, sender: me.full_name, avatar: me.avatar_url, time: 'Just now', text: `Room created for ${courseCode}! Let's focus and get this done.` }],
  };
  await query('INSERT INTO study_rooms (id, data, created_by) VALUES ($1,$2,$3)', [room.id, room, me.id]);
  broadcast('rooms');
  res.status(201).json({ success: true, data: room });
}));

// PATCH /api/studygroups/:id/scratchpad
router.patch('/:id/scratchpad', ah(async (req, res) => {
  const room = await load(req.params.id);
  if (!room) return notFound(res);
  room.scratchpad = String(req.body?.content ?? '');
  await save(room);
  broadcast('rooms');
  res.json({ success: true, data: { scratchpad: room.scratchpad } });
}));

// POST /api/studygroups/:id/messages
router.post('/:id/messages', ah(async (req, res) => {
  const text = String(req.body?.message || '').trim();
  if (!text) return res.status(400).json({ success: false, message: 'Message cannot be empty' });
  const room = await load(req.params.id);
  if (!room) return notFound(res);
  const me = await getUser(req.user.id);
  const msg = { id: `msg_${Date.now()}`, sender: me.full_name, avatar: me.avatar_url, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }), text };
  room.messages = [...(room.messages || []), msg];
  await save(room);
  broadcast('rooms');
  res.status(201).json({ success: true, data: msg });
}));

// PATCH /api/studygroups/:id/pomodoro
router.patch('/:id/pomodoro', ah(async (req, res) => {
  const room = await load(req.params.id);
  if (!room) return notFound(res);
  room.pomodoro = { ...room.pomodoro, ...(req.body || {}) };
  await save(room);
  res.json({ success: true, data: room.pomodoro });
}));

module.exports = router;
