/**
 * Authentication Routes for RENTAMOTO
 *
 * Provides user registration and login endpoints using Supabase Auth.
 * Supports role-based registration (admin/customer).
 *
 * Routes:
 * - POST /auth/signup - User registration with email and password
 * - POST /auth/login - User login and JWT token generation
 */

const express = require("express");
const { body, validationResult } = require("express-validator");
const { asyncHandler } = require("../middleware/errorHandler");
const authService = require("../services/authService");

const router = express.Router();

/**
 * @route   POST /auth/signup
 * @desc    Register a new user with email, password, and role
 * @access  Public
 * @body    { email, password, name, role? }
 */
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Name must be between 2 and 100 characters"),
    body("role")
      .optional()
      .isIn(["admin", "customer"])
      .withMessage("Role must be either admin or customer"),
    body("phone")
      .optional()
      .isMobilePhone()
      .withMessage("Valid phone number is required"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: errors.array(),
      });
    }

    const { email, password, name, role = "customer", phone } = req.body;

    try {
      const result = await authService.signUp({
        email,
        password,
        name,
        role,
        phone,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: result.user,
          profile: result.profile,
        },
      });
    } catch (error) {
      // Handle specific Supabase auth errors
      if (error.message.includes("already registered")) {
        return res.status(409).json({
          error: "User already exists",
          message: "An account with this email already exists",
        });
      }

      throw error;
    }
  })
);

/**
 * @route   POST /auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 * @body    { email, password }
 */
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  asyncHandler(async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      const result = await authService.signIn({ email, password });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            name: result.profile.name,
            role: result.profile.role,
          },
          session: {
            access_token: result.session.access_token,
            expires_at: result.session.expires_at,
            expires_in: result.session.expires_in,
          },
        },
      });
    } catch (error) {
      // Handle specific authentication errors
      if (error.message.includes("Invalid login credentials")) {
        return res.status(401).json({
          error: "Authentication failed",
          message: "Invalid email or password",
        });
      }

      if (error.message.includes("Email not confirmed")) {
        return res.status(401).json({
          error: "Email not confirmed",
          message: "Please check your email and click the confirmation link",
        });
      }

      throw error;
    }
  })
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user (invalidate token)
 * @access  Private
 */
router.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(200).json({
        success: true,
        message: "Logout successful",
      });
    }

    const token = authHeader.substring(7);

    try {
      await authService.signOut(token);

      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      // Even if logout fails, return success to prevent client issues
      console.error("Logout error:", error);
      res.json({
        success: true,
        message: "Logout successful",
      });
    }
  })
);

/**
 * @route   POST /auth/refresh
 * @desc    Refresh JWT token
 * @access  Public (requires refresh token)
 * @body    { refresh_token }
 */
router.post(
  "/refresh",
  [body("refresh_token").notEmpty().withMessage("Refresh token is required")],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid input data",
        details: errors.array(),
      });
    }

    const { refresh_token } = req.body;

    try {
      const result = await authService.refreshToken(refresh_token);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          session: {
            access_token: result.session.access_token,
            refresh_token: result.session.refresh_token,
            expires_at: result.session.expires_at,
            expires_in: result.session.expires_in,
          },
        },
      });
    } catch (error) {
      if (error.message.includes("Invalid refresh token")) {
        return res.status(401).json({
          error: "Invalid refresh token",
          message: "Please login again",
        });
      }

      throw error;
    }
  })
);

/**
 * @route   GET /auth/me
 * @desc    Get current user profile
 * @access  Private
 */
const { authenticateUser } = require("../middleware/auth");

router.get(
  "/me",
  authenticateUser,
  asyncHandler(async (req, res) => {
    try {
      const profile = await authService.getUserProfile(req.user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: req.user.id,
            email: req.user.email,
            name: profile.name,
            role: profile.role,
            phone: profile.phone,
            created_at: profile.created_at,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

module.exports = router;
