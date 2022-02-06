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
const { protect, authorize } = require('./../middleware/auth');
const courseRouter = require('./courses');
const advancedResults = require('./../middleware/advancedResults');

const router = express.Router();

router.route('/').get(advancedResults(Bootcamp, 'courses'), getBootcamps).post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampUploadPhoto);

router.route('/radius/:zipCode/:distance').get(getBootcampsInRadius);

router.use('/:bootcampId/courses', courseRouter);

module.exports = router;
