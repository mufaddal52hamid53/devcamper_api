const express = require('express');
const { getCourses } = require('../controllers/courses');
const Bootcamp = require('../models/Bootcamp');
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampUploadPhoto,
} = require('./../controllers/bootcamps');

const courseRouter = require('./courses');
const advancedResults = require('./../middleware/advancedResults');

const router = express.Router();

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

router.route('/:id/photo').put(bootcampUploadPhoto);

router.route('/radius/:zipCode/:distance').get(getBootcampsInRadius);

router.use('/:bootcampId/courses', courseRouter);

module.exports = router;
