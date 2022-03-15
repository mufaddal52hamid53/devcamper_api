const path = require('path');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const geocoder = require('../utils/geocoder');
const Bootcamp = require('./../models/Bootcamp');

// @desc    Get all Bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
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
  req.body.user = req.user.id;

  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user ${req.user.name} has already published a bootcamp`, 400));
  }

  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({ success: true, data: bootcamp });
});

// @desc    Update bootcamps
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  let bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp was not found with id of ${req.params.id}`, 404));
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role != 'admin') {
    return next(new ErrorResponse(`${req.user.name} is not authorized to update this bootcamp`, 401));
  }
  bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

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
  if (bootcamp.user.toString() !== req.user.id && req.user.role != 'admin') {
    return next(new ErrorResponse(`${req.user.name} is not authorized to delete this bootcamp`, 401));
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

// @desc    Upload photo for bootcamp
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
exports.bootcampUploadPhoto = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp was not found with id of ${req.params.id}`, 404));
  }

  if (bootcamp.user.toString() !== req.user.id && req.user.role != 'admin') {
    return next(new ErrorResponse(`${req.user.name} is not authorized to update this bootcamp`, 401));
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(new ErrorResponse(`Please upload a image less than ${process.env.MAX_FILE_UPLOAD}`, 400));
  }

  file.name = `bootcamp_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({ success: true, data: file.name });
  });
});
