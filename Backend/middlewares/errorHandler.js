/**
 * Error handling middleware
 * This middleware catches errors and returns appropriate responses
 */

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  // Set default error status and message
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`Error: ${message}`);
  console.error(err.stack);

  // Return error response
  res.status(statusCode).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;