const express = require('express');
const { getCourses, getCourse, addCourse, updateCourses, deleteCourses } = require('../controllers/courses');
const advancedResults = require('../middleware/advancedResults');
const Course = require('../models/Course');

const router = express.Router({ mergeParams: true });

router.route('/').get(advancedResults(Course, 'bootcamp', 'name description'), getCourses).post(addCourse);

router.route('/:id').get(getCourse).put(updateCourses).delete(deleteCourses);

module.exports = router;
