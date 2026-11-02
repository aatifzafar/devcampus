// Sign-in and the signed-in user's profile.
//
//   POST /api/auth/login     { email, password } -> { token, user }
//   GET  /api/auth/me        the signed-in user
//   GET  /api/auth/profile   same, in the shape the app's pages use
//   POST /api/auth/password  { current, next } change your password
const express = require('express');
const bcrypt = require('bcryptjs');
const { query } = require('../db');
const { sign, requireAuth, ah } = require('../lib/auth');
const { getUser, publicProfile } = require('../lib/users');

const router = express.Router();

// Slow down password guessing: 10 failed tries per email+IP per 15 minutes.
const failures = new Map();
const tooMany = (key) => {
  const f = failures.get(key);
  return f && f.count >= 10 && Date.now() - f.first < 15 * 60000;
};
const fail = (key) => {
  const f = failures.get(key);
  if (!f || Date.now() - f.first > 15 * 60000) failures.set(key, { count: 1, first: Date.now() });
  else f.count += 1;
};

router.post('/login', ah(async (req, res) => {
  const email = String(req.body?.email || req.body?.identifier || req.body?.rollNo || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  if (!email || !password) return res.status(400).json({ success: false, message: 'Enter your email and password.' });
  const key = `${email}|${req.ip}`;
  if (tooMany(key)) return res.status(429).json({ success: false, message: 'Too many attempts. Wait 15 minutes and try again.' });
  const user = (await query('SELECT * FROM users WHERE lower(email) = $1', [email])).rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    fail(key);
    return res.status(401).json({ success: false, message: 'That email and password don’t match.' });
  }
  failures.delete(key);
  await query('UPDATE users SET last_login_at = now() WHERE id = $1', [user.id]);
  res.json({ success: true, token: sign(user), user: publicProfile(user) });
}));

router.get('/me', requireAuth, ah(async (req, res) => {
  const user = await getUser(req.user.id);
  if (!user) return res.status(401).json({ success: false, message: 'Account not found. Please sign in again.' });
  res.json({ success: true, data: publicProfile(user) });
}));

router.get('/profile', requireAuth, ah(async (req, res) => {
  const user = await getUser(req.user.id);
  if (!user) return res.status(401).json({ success: false, message: 'Account not found. Please sign in again.' });
  res.json({ success: true, data: publicProfile(user) });
}));

router.post('/password', requireAuth, ah(async (req, res) => {
  const { current, next } = req.body || {};
  if (!next || String(next).length < 8) return res.status(400).json({ success: false, message: 'Use at least 8 characters.' });
  const user = await getUser(req.user.id);
  if (!(await bcrypt.compare(String(current || ''), user.password_hash))) return res.status(401).json({ success: false, message: 'Your current password is wrong.' });
  await query('UPDATE users SET password_hash = $2 WHERE id = $1', [user.id, await bcrypt.hash(String(next), 10)]);
  res.json({ success: true });
}));

// Kept for the older dashboard widget.
router.patch('/submissions/:id/toggle', requireAuth, (req, res) => res.json({ success: true, data: [] }));

module.exports = router;
