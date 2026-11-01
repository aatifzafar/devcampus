// Sign-in tokens (JWT) and route guards.
const jwt = require('jsonwebtoken');

const DEV_SECRET = 'alliance-dev-secret-change-me';
const SECRET = process.env.JWT_SECRET || DEV_SECRET;
if (SECRET === DEV_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: set JWT_SECRET in backend/.env before deploying.');
}

const sign = (user) => jwt.sign({ sub: user.id, role: user.role }, SECRET, { expiresIn: '7d' });

function readToken(req) {
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return req.query.token || null; // EventSource can't send headers
}

// Adds req.user ({ id, role }) or answers 401.
function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ success: false, message: 'Please sign in.' });
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Your session has expired. Please sign in again.' });
  }
}

const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user?.role) ? next() : res.status(403).json({ success: false, message: 'You do not have permission to do that.' });

// Wrap async route handlers so errors reach the error middleware.
const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { sign, requireAuth, requireRole, ah };
