/**
 * Error handling Middleware
 * - pass operational async errors down to our global error handling middleware
 * - send relevant error messages back to the client depending on type of error that occurred
 * - distinguishes between dev and prod
 */

const AppError = require('../utils/appError');

// Transform Mongoose error into operational error
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 404);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
    // Programming or other unknown error: don't leak error details
  } else {
    // 1) Log error
    console.error(`ERROR 🤯: ${err}`);

    // 2) Send generic error message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

// specifying 4 parameters tells express this is error handling
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    // If we get a Mongoose generated 'CastError', transform it into an operational error, otherwise client will jsut get our generic "something went wrong" error
    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }

    // Handle MongoDB Duplicate Fields Error
    // - generated from MongoDB not Mongoose, so there's no err.name
    if (error.code === 11000) {
      error = handleDuplicateFieldsDB(error);
    }

    // Handle Mongoose Validation Error
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }

    // Handle error on invalid JWT
    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    // Handle error on expired JWT
    if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }

    sendErrorProd(error, res);
  }
};
