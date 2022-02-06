const express = require('express');
const { getCourses } = require('../controllers/courses');
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, deleteBootcamp, getBootcampsInRadius } = require('./../controllers/bootcamps');

const courseRouter = require('./courses');

const router = express.Router();

router.route('/').get(getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route('/radius/:zipCode/:distance').get(getBootcampsInRadius);

router.use('/:bootcampId/courses', courseRouter);

module.exports = router;
