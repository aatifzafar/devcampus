const express = require('express');
const router = express.Router();
const { getAllPYQs, getPYQById, recordDownload } = require('../models/pyqModel');

// GET /api/pyq
router.get('/', (req, res) => {
  try {
    const { semester, examType, courseCode, search } = req.query;
    const papers = getAllPYQs({ semester, examType, courseCode, search });
    res.json({
      success: true,
      count: papers.length,
      data: papers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/pyq/:id
router.get('/:id', (req, res) => {
  try {
    const paper = getPYQById(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Question paper not found" });
    }
    res.json({ success: true, data: paper });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/pyq/:id/download
router.post('/:id/download', (req, res) => {
  try {
    const paper = recordDownload(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Question paper not found" });
    }
    res.json({
      success: true,
      message: "Download started",
      downloadUrl: `/mock-papers/${paper.courseCode}_${paper.examType}.pdf`,
      downloads: paper.downloads
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

