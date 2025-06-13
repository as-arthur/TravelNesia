const logger = require('./logger');
const responseFormatter = require('./response');

// Global error handler untuk Express
const errorHandler = (err, req, res, next) => {

  logger.error(`${err.name}: ${err.message} - Stack: ${err.stack}`);

  switch (err.name) {
    case 'SequelizeValidationError':
      return responseFormatter.error(
        res,
        'Validation error',
        400,
        err.errors.map(e => ({ field: e.path, message: e.message }))
      );
      
    case 'SequelizeUniqueConstraintError':
      return responseFormatter.error(
        res,
        'Data already exists',
        409,
        err.errors.map(e => ({ field: e.path, message: e.message }))
      );
      
    case 'JsonWebTokenError':
      return responseFormatter.error(res, 'Invalid token', 401);
      
    case 'TokenExpiredError':
      return responseFormatter.error(res, 'Token expired', 401);
      
    case 'NotFoundError':
      return responseFormatter.error(res, err.message, 404);
      
    case 'UnauthorizedError':
      return responseFormatter.error(res, err.message, 401);
      
    case 'ForbiddenError':
      return responseFormatter.error(res, err.message, 403);
      
    default:
      const statusCode = err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      return responseFormatter.error(res, message, statusCode);
  }
};

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

module.exports = {
  errorHandler,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError
};