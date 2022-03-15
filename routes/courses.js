const express = require('express');
const { getCourses, getCourse, addCourse, updateCourses, deleteCourses } = require('../controllers/courses');
const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course');
const { protect, authorize } = require('./../middleware/auth');

const router = express.Router({ mergeParams: true });

router.route('/').get(advancedResults(Course, 'bootcamp', 'name description'), getCourses).post(protect, authorize('publisher', 'admin'), addCourse);

router
  .route('/:id')
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourses)
  .delete(protect, authorize('publisher', 'admin'), deleteCourses);

module.exports = router;
