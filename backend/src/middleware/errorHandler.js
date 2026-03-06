const AppError = require('../utils/appError');
const logger = require('../utils/logger');

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  logger.error('Request failed', {
    requestId: req.requestId,
    path: req.originalUrl,
    method: req.method,
    statusCode,
    error: err.message,
    details: err.details,
  });

  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      details: err.details || null,
    },
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
