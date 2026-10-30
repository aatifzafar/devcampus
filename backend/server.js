const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const pyqRoutes = require('./routes/pyq');
const alumniRoutes = require('./routes/alumni');
const chatbotRoutes = require('./routes/chatbot');
const studyGroupRoutes = require('./routes/studyGroups');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Route Mounts
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/pyq', pyqRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/studygroups', studyGroupRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Alliance.ai (EDUX 2.0)',
    university: 'Alliance University',
    timestamp: new Date().toISOString()
  });
});

// Root friendly greeting
app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to Alliance.ai (EDUX 2.0) API Gateway',
    documentation: '/api/health',
    version: '2.0.0'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Alliance.ai (EDUX 2.0) Backend running at http://localhost:${PORT}`);
});

