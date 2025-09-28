/**
 * 404 Not Found Middleware for RENTAMOTO
 *
 * Handles requests to non-existent routes with user-friendly error responses.
 */

function notFound(req, res, next) {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;

  res.status(404).json({
    error: true,
    message: "Route not found",
    status: 404,
    details: `The requested endpoint ${req.method} ${req.originalUrl} does not exist`,
    timestamp: new Date().toISOString(),
    availableEndpoints: {
      auth: "/auth/signup, /auth/login",
      bikes: "/bikes (GET, POST, PUT, DELETE)",
      rentals: "/rent, /return, /my-bookings",
      admin: "/bookings, /revenue",
      health: "/health",
    },
  });
}

module.exports = notFound;
