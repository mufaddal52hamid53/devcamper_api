const path = require('path');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

const User = require('./../models/User');

// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({ name, email, password, role });

  const token = user.getSignedJwtToken();

  sendTokenResponse(user, 200, res);
});

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and pass
  if (!email || !password) return next(new ErrorResponse('Please provide an email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user) return next(new ErrorResponse('Invalid credentials', 401));

  const isMatch = await user.matchPassword(password);

  if (!isMatch) return next(new ErrorResponse('Invalid credentials', 401));

  const token = user.getSignedJwtToken();

  sendTokenResponse(user, 200, res);
});

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res
    .status(statusCode)
    .cookie('token', token, { expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRE) * 24 * 60 * 60 * 1000), httpOnly: true })
    .json({ status: true, token });
};

// @desc    Get current logged in user
// @route   POST /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    data: user,
  });
});
