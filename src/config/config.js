/**
 * Configuration Module for RENTAMOTO Backend
 *
 * Centralizes all environment variables and configuration settings.
 * Validates required environment variables and provides defaults.
 */

require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
];

// Check for missing or placeholder values
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);
const placeholderEnvVars = requiredEnvVars.filter((envVar) => {
  const value = process.env[envVar];
  return (
    value &&
    (value.includes("your_supabase") ||
      value.includes("your-project") ||
      value === "your_supabase_project_url" ||
      value === "your_supabase_anon_key" ||
      value === "your_supabase_service_role_key")
  );
});

if (missingEnvVars.length > 0 || placeholderEnvVars.length > 0) {
  console.error("❌ Supabase configuration error:");

  if (missingEnvVars.length > 0) {
    console.error("\n🔍 Missing environment variables:");
    missingEnvVars.forEach((envVar) => {
      console.error(`   - ${envVar}`);
    });
  }

  if (placeholderEnvVars.length > 0) {
    console.error(
      "\n� Placeholder values detected (need real Supabase credentials):"
    );
    placeholderEnvVars.forEach((envVar) => {
      console.error(`   - ${envVar}: ${process.env[envVar]}`);
    });
  }

  console.error("\n🚀 Quick Setup Guide:");
  console.error("1. Go to https://supabase.com and create a project");
  console.error("2. Get your credentials from Settings > API");
  console.error("3. Update your .env file with real values:");
  console.error("   SUPABASE_URL=https://your-project-id.supabase.co");
  console.error("   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...");
  console.error("   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...");
  console.error("\n📖 See SETUP.md for detailed instructions");
  process.exit(1);
}

const config = {
  // Server Configuration
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,

  // Supabase Configuration
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    jwtSecret: process.env.SUPABASE_JWT_SECRET,
  },

  // Database Configuration (if using direct Postgres connection)
  database: {
    url: process.env.DATABASE_URL,
  },

  // JWT Configuration (for custom JWT if needed)
  jwt: {
    secret: process.env.JWT_SECRET || "fallback-secret-change-in-production",
    expiresIn: process.env.JWT_EXPIRE || "24h",
  },

  // CORS Configuration
  allowedOrigins:
    process.env.ALLOWED_ORIGINS ||
    "http://localhost:3000,http://localhost:3001",

  // Rate Limiting
  rateLimitRequests: process.env.RATE_LIMIT_REQUESTS || 100,
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW || 15, // minutes

  // Logging
  logLevel: process.env.LOG_LEVEL || "info",

  // Business Logic Configuration
  business: {
    // Minimum rental duration in minutes
    minRentalDuration: 60,
    // Maximum rental duration in hours
    maxRentalDuration: 24,
    // Late return penalty per hour
    lateReturnPenalty: 5.0,
    // Maximum search radius for bikes in kilometers
    maxSearchRadius: 10,
  },
};

// Validate Supabase URL format
if (config.supabase.url && !config.supabase.url.startsWith("https://")) {
  console.error("❌ SUPABASE_URL must start with https://");
  process.exit(1);
}

// Warn about development environment
if (config.nodeEnv === "development") {
  console.log("🔧 Running in development mode");
  if (config.jwt.secret === "fallback-secret-change-in-production") {
    console.warn(
      "⚠️  Using default JWT secret. Set JWT_SECRET in .env for production"
    );
  }
} else {
  // Production validations
  if (config.jwt.secret === "fallback-secret-change-in-production") {
    console.error("❌ JWT_SECRET must be set in production");
    process.exit(1);
  }
}

module.exports = config;
