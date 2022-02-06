const express = require('express');
const { getCourses, getCourse, addCourse, updateCourses, deleteCourses } = require('../controllers/courses');

const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses).post(addCourse);

router.route('/:id').get(getCourse).put(updateCourses).delete(deleteCourses);

module.exports = router;
