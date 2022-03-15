const colors = require('colors');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  // Log to console for dev
  console.log(`${err.stack}`.red);

  console.log(err.name);

  // Mongoose bad ObjectID
  if (err.name === 'CastError') {
    const message = `Bootcamp id "${err.value}" is invalid`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if (err.code == 11000) {
    const message = `Duplicate field value entered`;
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name == 'ValidationError') {
    const message = Object.values(err.errors)
      .map((v) => v.message)
      .join('\n');
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({ success: false, error: error.message || 'Internal Server Error' });
};

module.exports = errorHandler;
