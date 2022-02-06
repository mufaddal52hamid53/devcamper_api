const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('./../models/Bootcamp');

// @desc    Get all Bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  console.log(req.query);

  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'limit', 'page'];

  removeFields.forEach((p) => delete reqQuery[p]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let query = Bootcamp.find(JSON.parse(queryStr)).populate('courses');

  if (req.query.select) {
    const fields = req.query.select.replace(/\,/g, ' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    query = query.sort(req.query.sort.replace(/\,/g, ' '));
  } else {
    query = query.sort('-createdAt');
  }

  const limit = parseInt(req.query.limit) || 25;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.limit(limit).skip(startIndex);

  const bootcamps = await query;

  const pagination = {};

  if (startIndex > 0) {
    pagination.previous = { page: page - 1, limit: limit };
  }
  pagination.current = { limit: limit, page: page };
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit: limit };
  }

  res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps });
});

// @desc    Get single Bootcamps
// @route   GET /api/v1/bootcamps/:id
// @access  Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp was not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Create new bootcamps
// @route   POST /api/v1/bootcamps
// @access  Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp was not found with id of ${req.params.id}`, 404));
  }
  res.status(200).json({ success: true, data: bootcamp });
});

// @desc    Delete bootcamps
// @route   DELETE /api/v1/bootcamps/:id
// @access  Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp was not found with id of ${req.params.id}`, 404));
  }
  bootcamp.remove();
  res.status(200).json({ success: true, message: 'Deleted Successfully' });
});

// @desc    Get bootcamp withing the radius
// @route   DELETE /api/v1/bootcamps/radius/:zipcode/:distance (in km)
// @access  Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipCode, distance } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipCode);
  console.log(loc);
  // return;
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // Calc radius using radians
  // Earth radius = 6378 km

  const radius = distance / 6378;

  const bootcamps = await Bootcamp.find({ location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } });
  res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps });
});
