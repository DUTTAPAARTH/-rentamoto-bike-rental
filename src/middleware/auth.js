/**
 * Authentication Middleware for RENTAMOTO
 *
 * Provides JWT token verification and user authentication using Supabase Auth.
 * Extracts user information from JWT tokens and adds to request context.
 */

const jwt = require("jsonwebtoken");
const { supabaseAdmin } = require("../config/supabase");
const config = require("../config/config");

/**
 * Middleware to authenticate requests using Supabase JWT tokens
 *
 * Expects Authorization header in format: "Bearer <jwt_token>"
 * Adds user info to req.user if token is valid
 */
async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied",
        message:
          "No token provided. Include Authorization header with Bearer token.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      return res.status(401).json({
        error: "Access denied",
        message: "Token is required",
      });
    }

    try {
      // Check if this is a development token
      if (token.startsWith("dev.")) {
        console.log("🧪 Processing development token");
        
        try {
          // Extract payload from dev token (base64 decode)
          const payload = JSON.parse(Buffer.from(token.substring(4), 'base64').toString());
          console.log("🧪 Token payload:", JSON.stringify(payload, null, 2));
          
          // Check if token is expired
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            console.log("🧪 Token is expired");
            return res.status(401).json({
              error: "Token expired",
              message: "Development token has expired",
            });
          }

          console.log("🧪 Looking for profile with ID:", payload.sub);
          // Get user profile from database
          const { data: profile, error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .eq("id", payload.sub)
            .single();

          if (profileError || !profile) {
            console.error("🧪 Dev profile fetch error:", profileError);
            return res.status(401).json({
              error: "Invalid token",
              message: "User profile not found",
            });
          }

          console.log("🧪 Profile found:", JSON.stringify(profile, null, 2));

          // Add user info to request
          req.user = {
            id: profile.id,
            email: payload.user_metadata?.email || "dev@example.com",
            role: profile.role || "customer",
            name: profile.name || "Dev User",
            profile: profile,
          };

          console.log("🧪 Set req.user:", JSON.stringify(req.user, null, 2));

          // Add token for downstream usage
          req.token = token;

          return next();
        } catch (devTokenError) {
          console.error("🧪 Dev token processing error:", devTokenError);
          return res.status(401).json({
            error: "Invalid token",
            message: "Development token verification failed",
          });
        }
      }

      // Production token verification with Supabase
      console.log("🔐 Processing production token");
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (error || !user) {
        return res.status(401).json({
          error: "Invalid token",
          message: "Token verification failed",
        });
      }

      // Get user profile with role information
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        return res.status(500).json({
          error: "Profile error",
          message: "Failed to fetch user profile",
        });
      }

      // Add user info to request
      req.user = {
        id: user.id,
        email: user.email,
        role: profile?.role || "customer",
        name: profile?.name || "User",
        profile: profile,
      };

      // Add token for downstream usage
      req.token = token;

      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({
        error: "Invalid token",
        message: "Token verification failed",
      });
    }
  } catch (error) {
    console.error("Authentication middleware error:", error);
    return res.status(500).json({
      error: "Authentication error",
      message: "Internal server error during authentication",
    });
  }
}

/**
 * Middleware to require admin role
 * Must be used after authenticateUser middleware
 */
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Must be authenticated to access this resource",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      error: "Admin access required",
      message: "This resource requires admin privileges",
    });
  }

  next();
}

/**
 * Middleware to require customer role (or admin)
 * Must be used after authenticateUser middleware
 */
function requireCustomer(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Must be authenticated to access this resource",
    });
  }

  if (!["customer", "admin"].includes(req.user.role)) {
    return res.status(403).json({
      error: "Customer access required",
      message: "This resource requires customer or admin privileges",
    });
  }

  next();
}

/**
 * Optional authentication middleware
 * Adds user info if token is present but doesn't require authentication
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(); // Continue without user info
    }

    const token = authHeader.substring(7);

    if (!token) {
      return next(); // Continue without user info
    }

    try {
      // Check if this is a development token
      if (token.startsWith("dev.")) {
        try {
          // Extract payload from dev token (base64 decode)
          const payload = JSON.parse(Buffer.from(token.substring(4), 'base64').toString());
          
          // Check if token is expired (but don't reject, just continue without auth)
          if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
            return next();
          }

          // Get user profile from database
          const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .eq("id", payload.sub)
            .single();

          if (profile) {
            req.user = {
              id: profile.id,
              email: payload.user_metadata?.email || "dev@example.com",
              role: profile.role || "customer",
              name: profile.name || "Dev User",
              profile: profile,
            };
            req.token = token;
          }
        } catch (error) {
          console.log("Optional dev auth failed (continuing):", error.message);
        }
        return next();
      }

      // Production token handling
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(token);

      if (!error && user) {
        // Get user profile
        const { data: profile } = await supabaseAdmin
          .from("user_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        req.user = {
          id: user.id,
          email: user.email,
          role: profile?.role || "customer",
          name: profile?.name || "User",
          profile: profile,
        };

        req.token = token;
      }
    } catch (error) {
      // Continue without user info if token is invalid
      console.log("Optional auth failed (continuing):", error.message);
    }

    next();
  } catch (error) {
    // Continue without user info on any error
    next();
  }
}

/**
 * Middleware to validate user owns resource
 * Expects req.params.userId or uses req.user.id
 */
function requireOwnership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: "Authentication required",
      message: "Must be authenticated to access this resource",
    });
  }

  // Admin can access any resource
  if (req.user.role === "admin") {
    return next();
  }

  // Check if user owns the resource
  const resourceUserId =
    req.params.userId || req.body.user_id || req.query.user_id;

  if (resourceUserId && resourceUserId !== req.user.id) {
    return res.status(403).json({
      error: "Access denied",
      message: "You can only access your own resources",
    });
  }

  next();
}

module.exports = {
  authenticateUser,
  requireAdmin,
  requireCustomer,
  optionalAuth,
  requireOwnership,
};
