const express = require('express');
const router = express.Router();
const { universityKnowledgeBase, getSocraticResponse } = require('../models/chatbotModel');

// GET /api/chatbot/topics
router.get('/topics', (req, res) => {
  try {
    res.json({
      success: true,
      data: universityKnowledgeBase
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chatbot/query
router.post('/query', (req, res) => {
  try {
    const { query, courseCode = "CSE201", mode = "socratic" } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query text is required" });
    }

    const response = getSocraticResponse(query, courseCode, mode);
    res.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        query,
        courseCode,
        mode,
        ...response
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

