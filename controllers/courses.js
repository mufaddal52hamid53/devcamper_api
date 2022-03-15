const asyncHandler = require('../middleware/async');
const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const Course = require('./../models/Course');

// @desc    Get all Courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({ success: true, count: courses.length, data: courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single Course
// @route   GET /api/v1/courses/:id
// @access  Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate('bootcamp', 'name description');

  if (!course) {
    return next(new ErrorResponse(`No course found with the id ${req.params.id}`, 404));
  }

  res.status(200).json({ success: true, count: course.length, data: course });
});

// @desc    Get Add Course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(new ErrorResponse(`No bootcamp found with the id ${req.params.id}`, 404));
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`"${req.user.name}" is not authorized to add a course to bootcamp "${bootcamp.name}"`, 401));
  }

  const course = await Course.create(req.body);

  res.status(200).json({ success: true, data: course });
});

// @desc    Update Course
// @route   PUT /api/v1/courses/:id
// @access  Private
exports.updateCourses = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course found with the id ${req.params.id}`, 404));
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`"${req.user.name}" is not authorized to update the course "${course.title}"`, 401));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  res.status(200).json({ success: true, data: course });
});

// @desc    Delete Course
// @route   DELETE /api/v1/courses/:id
// @access  Private
exports.deleteCourses = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorResponse(`No course found with the id ${req.params.id}`, 404));
  }

  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse(`"${req.user.name}" is not authorized to delete the course "${course.title}"`, 401));
  }

  await course.remove();

  res.status(200).json({ success: true, data: course });
});
