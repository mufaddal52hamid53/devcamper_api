const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const User = require('./../models/User');

// @desc    Get all users
// @route   GET /api/v1/auth/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single users
// @route   GET /api/v1/auth/users/:id
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  const user = User.findById(req.user._id);
  res.status(200).json(res.advancedResults);
});
