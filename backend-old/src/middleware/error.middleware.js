const logger = require('../utils/logger');

class ErrorHandler extends Error {
  constructor(statusCode, message, details = null) {
    super();
    this.statusCode = statusCode;
    this.message = message;
    this.details = details;
  }
}

const handleError = (err, req, res, next) => {
  const { statusCode = 500, message, details } = err;
  
  // Log the error with additional context
  const errorLog = {
    statusCode,
    message: err.message,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    ...(req.user && { userId: req.user.id }),
    ...(details && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Log the error with appropriate level
  if (statusCode >= 500) {
    logger.error('Server Error', errorLog);
  } else if (statusCode >= 400) {
    logger.warn('Client Error', errorLog);
  } else {
    logger.info('Application Error', errorLog);
  }

  // Don't leak error details in production
  const errorResponse = {
    status: 'error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 
      ? 'Internal server error' 
      : message
  };

  // Include validation errors if present
  if (details && Array.isArray(details)) {
    errorResponse.errors = details;
  }

  // Send the error response
  res.status(statusCode).json(errorResponse);
};

const notFound = (req, res, next) => {
  const error = new ErrorHandler(404, `Not Found - ${req.originalUrl}`);
  next(error);
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err);
  process.exit(1);
});

module.exports = {
  ErrorHandler,
  handleError,
  notFound
};
