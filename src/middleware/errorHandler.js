/**
 * Global Error Handler Middleware for RENTAMOTO
 *
 * Centralized error handling with proper logging and user-friendly responses.
 * Handles different types of errors (validation, database, authentication, etc.)
 */

const config = require("../config/config");

/**
 * Global error handling middleware
 * Must be the last middleware in the application
 */
function errorHandler(error, req, res, next) {
  // Log error details
  console.error("Error occurred:", {
    message: error.message,
    stack: config.nodeEnv === "development" ? error.stack : undefined,
    url: req.url,
    method: req.method,
    userAgent: req.get("User-Agent"),
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let status = error.status || error.statusCode || 500;
  let message = "Internal server error";
  let details = null;

  // Handle specific error types
  if (error.name === "ValidationError") {
    status = 400;
    message = "Validation error";
    details = error.details || error.message;
  } else if (error.name === "CastError") {
    status = 400;
    message = "Invalid data format";
    details = error.message;
  } else if (error.code === "ENOTFOUND") {
    status = 503;
    message = "Service unavailable";
    details = "Database connection failed";
  } else if (error.message && error.message.includes("duplicate key")) {
    status = 409;
    message = "Resource already exists";
    details = "Duplicate entry detected";
  } else if (error.message && error.message.includes("foreign key")) {
    status = 400;
    message = "Invalid reference";
    details = "Referenced resource does not exist";
  } else if (error.message && error.message.includes("JWT")) {
    status = 401;
    message = "Authentication failed";
    details = "Invalid or expired token";
  } else if (error.message && error.message.includes("permission")) {
    status = 403;
    message = "Permission denied";
    details = "Insufficient privileges";
  } else if (status === 500) {
    message =
      config.nodeEnv === "development"
        ? error.message
        : "Internal server error";
  } else {
    message = error.message || message;
  }

  // Supabase-specific errors
  if (error.code) {
    switch (error.code) {
      case "23505": // Unique violation
        status = 409;
        message = "Resource already exists";
        details = "Duplicate entry detected";
        break;
      case "23503": // Foreign key violation
        status = 400;
        message = "Invalid reference";
        details = "Referenced resource does not exist";
        break;
      case "23502": // Not null violation
        status = 400;
        message = "Missing required field";
        details = "Required field cannot be empty";
        break;
      case "42P01": // Undefined table
        status = 500;
        message = "Database error";
        details =
          config.nodeEnv === "development"
            ? "Table not found"
            : "Internal error";
        break;
      default:
        if (error.code.startsWith("23")) {
          status = 400;
          message = "Data constraint violation";
        }
    }
  }

  // Express-validator errors
  if (error.array && typeof error.array === "function") {
    status = 400;
    message = "Validation error";
    details = error.array();
  }

  // Rate limit errors
  if (error.message && error.message.includes("Too many requests")) {
    status = 429;
    message = "Too many requests";
    details = "Rate limit exceeded. Please try again later.";
  }

  // Build error response
  const errorResponse = {
    error: true,
    message,
    status,
    ...(details && { details }),
    ...(config.nodeEnv === "development" && {
      stack: error.stack,
      originalError: error.message,
    }),
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  };

  // Send error response
  res.status(status).json(errorResponse);
}

/**
 * 404 Not Found handler
 * Should be placed before the global error handler
 */
function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

/**
 * Async error wrapper for route handlers
 * Catches async errors and passes them to error handler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Create application error with status code
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
};
