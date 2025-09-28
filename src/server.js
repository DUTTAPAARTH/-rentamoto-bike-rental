/**
 * RENTAMOTO Backend Server
 *
 * Main entry point for the bike rental management backend.
 * Powered by Supabase (PostgreSQL + Auth + APIs) and Express.js
 *
 * Features:
 * - Supabase Auth integration
 * - Role-based access control (admin/customer)
 * - Bike management and rental workflow
 * - Revenue tracking and analytics
 * - Production-ready security and logging
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

// Import routes
const authRoutes = require("./routes/auth");
const bikeRoutes = require("./routes/bikes");
const rentalRoutes = require("./routes/rentals");
const adminRoutes = require("./routes/admin");

// Import configuration
const config = require("./config/config");

const app = express();

// Trust proxy (important for Heroku, Vercel, etc.)
app.set("trust proxy", 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(config.rateLimitWindow) * 60 * 1000, // 15 minutes default
  max: parseInt(config.rateLimitRequests), // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = config.allowedOrigins.split(",");
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        const msg =
          "The CORS policy for this site does not allow access from the specified origin.";
        return callback(new Error(msg), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Apply rate limiting
app.use(limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (config.nodeEnv === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    version: "1.0.0",
  });
});

// API Routes
app.use("/auth", authRoutes);
app.use("/bikes", bikeRoutes);
app.use("/", rentalRoutes); // /rent, /return, /my-bookings
app.use("/", adminRoutes); // /bookings, /revenue

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Welcome to RENTAMOTO API",
    version: "1.0.0",
    documentation: "See README.md for API documentation",
    health: "/health",
    endpoints: {
      auth: "/auth/signup, /auth/login",
      bikes: "/bikes (GET, POST, PUT, DELETE)",
      rentals: "/rent, /return, /my-bookings",
      admin: "/bookings, /revenue",
    },
  });
});

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port || 3000;
app.listen(PORT, () => {
  console.log(`🚀 RENTAMOTO Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);

  if (config.nodeEnv === "development") {
    console.log(`📚 API Base: http://localhost:${PORT}`);
    console.log(`🔐 Auth endpoints: /auth/signup, /auth/login`);
    console.log(`🚲 Bikes endpoints: /bikes`);
    console.log(`📅 Rental endpoints: /rent, /return, /my-bookings`);
    console.log(`👑 Admin endpoints: /bookings, /revenue`);
  }
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
