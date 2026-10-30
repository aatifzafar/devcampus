const express = require('express');
const router = express.Router();
const {
  getAllAlumni,
  getAlumniById,
  bookMentorship,
  getMentorshipBookings
} = require('../models/alumniModel');

// GET /api/alumni
router.get('/', (req, res) => {
  try {
    const { industry, graduationYear, mentorshipOnly, search } = req.query;
    const list = getAllAlumni({ industry, graduationYear, mentorshipOnly, search });
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/alumni/mentorship/my-sessions
router.get('/mentorship/my-sessions', (req, res) => {
  try {
    const bookings = getMentorshipBookings();
    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/alumni/:id
router.get('/:id', (req, res) => {
  try {
    const person = getAlumniById(req.params.id);
    if (!person) {
      return res.status(404).json({ success: false, message: "Alumni profile not found" });
    }
    res.json({ success: true, data: person });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/alumni/mentorship
router.post('/mentorship', (req, res) => {
  try {
    const { alumniId, alumniName, topic, dateTime, note } = req.body;
    if (!alumniId || !topic || !dateTime) {
      return res.status(400).json({
        success: false,
        message: "alumniId, topic, and dateTime are required"
      });
    }
    const booking = bookMentorship({ alumniId, alumniName, topic, dateTime, note });
    res.status(201).json({
      success: true,
      message: "Mentorship session confirmed successfully!",
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

