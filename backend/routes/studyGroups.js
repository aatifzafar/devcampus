const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  getRoomById,
  createRoom,
  updateScratchpad,
  postMessage,
  updatePomodoro
} = require('../models/studyGroupModel');

// GET /api/studygroups
router.get('/', (req, res) => {
  try {
    const rooms = getAllRooms();
    res.json({ success: true, count: rooms.length, data: rooms });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/studygroups/:id
router.get('/:id', (req, res) => {
  try {
    const room = getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Study room not found" });
    }
    res.json({ success: true, data: room });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/studygroups
router.post('/', (req, res) => {
  try {
    const { title, courseCode, courseName, topic, maxPeers, pomodoroMinutes } = req.body;
    if (!title || !courseCode) {
      return res.status(400).json({
        success: false,
        message: "Title and courseCode are required"
      });
    }
    const newRoom = createRoom({
      title,
      courseCode,
      courseName: courseName || courseCode,
      topic: topic || "Collaborative Session",
      maxPeers: parseInt(maxPeers, 10) || 6,
      pomodoroMinutes: parseInt(pomodoroMinutes, 10) || 25
    });
    res.status(201).json({ success: true, data: newRoom });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/studygroups/:id/scratchpad
router.patch('/:id/scratchpad', (req, res) => {
  try {
    const { content } = req.body;
    const room = updateScratchpad(req.params.id, content);
    if (!room) {
      return res.status(404).json({ success: false, message: "Study room not found" });
    }
    res.json({ success: true, data: { scratchpad: room.scratchpad } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/studygroups/:id/messages
router.post('/:id/messages', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }
    const newMsg = postMessage(req.params.id, message);
    if (!newMsg) {
      return res.status(404).json({ success: false, message: "Study room not found" });
    }
    res.status(201).json({ success: true, data: newMsg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/studygroups/:id/pomodoro
router.patch('/:id/pomodoro', (req, res) => {
  try {
    const pomodoro = updatePomodoro(req.params.id, req.body);
    if (!pomodoro) {
      return res.status(404).json({ success: false, message: "Study room not found" });
    }
    res.json({ success: true, data: pomodoro });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

