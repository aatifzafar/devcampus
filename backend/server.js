const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });

const { pool, explainDbError } = require('./db');
const { requireAuth } = require('./lib/auth');
const { subscribe } = require('./lib/events');

const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/store');
const stateRoutes = require('./routes/state');
const fileRoutes = require('./routes/files');
const courseRoutes = require('./routes/courses');
const pyqRoutes = require('./routes/pyq');
const alumniRoutes = require('./routes/alumni');
const chatbotRoutes = require('./routes/chatbot');
const studyGroupRoutes = require('./routes/studyGroups');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({ exposedHeaders: ['X-File-Name'] }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev', { skip: (req) => req.path === '/api/stream' }));

// Health check: is the server up, and can it reach PostgreSQL?
app.get('/api/health', async (req, res) => {
  let database = 'connected';
  try {
    await pool.query('SELECT 1 FROM users LIMIT 1');
  } catch (err) {
    database = explainDbError(err);
  }
  res.status(database === 'connected' ? 200 : 503).json({
    status: database === 'connected' ? 'online' : 'database-unavailable',
    database,
    platform: 'Alliance.ai (EDUX 2.0)',
    university: 'Alliance University',
    timestamp: new Date().toISOString(),
  });
});

// Live updates (Server-Sent Events)
app.get('/api/stream', requireAuth, subscribe);

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/state', stateRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/studygroups', studyGroupRoutes);
app.use('/api/ai', aiRoutes);

// Root friendly greeting
app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to Alliance.ai (EDUX 2.0) API Gateway',
    documentation: '/api/health',
    version: '2.1.0',
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  if (err.type === 'entity.too.large') return res.status(413).json({ success: false, message: 'That file is too large.' });
  if (err.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'The request body is not valid JSON.' });
  const dbProblem = err.code && /^(ECONNREFUSED|28P01|3D000|42P01)$/.test(err.code);
  console.error('Internal Server Error:', err.message);
  res.status(dbProblem ? 503 : 500).json({ success: false, message: dbProblem ? explainDbError(err) : 'Something went wrong on the server.' });
});

app.listen(PORT, async () => {
  console.log(`🚀 Alliance.ai (EDUX 2.0) Backend running at http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1 FROM users LIMIT 1');
    console.log('✅ Connected to PostgreSQL');
  } catch (err) {
    console.error(`❌ PostgreSQL: ${explainDbError(err)}`);
  }
});
