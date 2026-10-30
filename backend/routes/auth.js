const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile, toggleSubmission } = require('../models/userModel');

// GET /api/auth/profile
router.get('/profile', (req, res) => {
  try {
    const profile = getUserProfile();
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/auth/submissions/:id/toggle
router.patch('/submissions/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const updatedSubmissions = toggleSubmission(id);
    res.json({ success: true, data: updatedSubmissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/login (mock login)
router.post('/login', (req, res) => {
  const profile = getUserProfile();
  res.json({
    success: true,
    message: "Logged in successfully as " + profile.name,
    token: "mock-jwt-alliance-anna-2026",
    user: profile
  });
});

module.exports = router;

