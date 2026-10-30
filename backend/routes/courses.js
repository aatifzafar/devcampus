const express = require('express');
const router = express.Router();
const { getAllCourses, getCourseById, updateCourseProgress } = require('../models/courseModel');

// GET /api/courses
router.get('/', (req, res) => {
  try {
    const courses = getAllCourses();
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/courses/:id
router.get('/:id', (req, res) => {
  try {
    const course = getCourseById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/courses/:id/progress
router.post('/:id/progress', (req, res) => {
  try {
    const { delta = 5 } = req.body;
    const course = updateCourseProgress(req.params.id, delta);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

