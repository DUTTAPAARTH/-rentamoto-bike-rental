/**
 * Admin Routes for RENTAMOTO
 *
 * Provides administrative endpoints for system management, analytics, and reporting.
 * All routes require admin authentication and authorization.
 *
 * Routes:
 * - GET /bookings - Get all bookings with filters
 * - GET /revenue - Get revenue analytics and reports
 * - GET /analytics - Get system analytics dashboard
 * - GET /users - Get user management data
 */

const express = require("express");
const { query, validationResult } = require("express-validator");
const { asyncHandler } = require("../middleware/errorHandler");
const { authenticateUser, requireAdmin } = require("../middleware/auth");
const adminService = require("../services/adminService");

const router = express.Router();

/**
 * @route   GET /bookings
 * @desc    Get all bookings (admin only)
 * @access  Admin only
 * @query   { status?, user_id?, bike_id?, start_date?, end_date?, limit?, offset? }
 */
router.get(
  "/bookings",
  authenticateUser,
  requireAdmin,
  [
    query("status")
      .optional()
      .isIn(["active", "completed", "cancelled"])
      .withMessage("Status must be active, completed, or cancelled"),
    query("user_id")
      .optional()
      .isUUID()
      .withMessage("User ID must be a valid UUID"),
    query("bike_id")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Bike ID must be a positive integer"),
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO date"),
    query("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO date"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 500 })
      .withMessage("Limit must be between 1 and 500"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be 0 or greater"),
    query("sort")
      .optional()
      .isIn(["created_at", "start_time", "total_cost", "user_name"])
      .withMessage(
        "Sort field must be created_at, start_time, total_cost, or user_name"
      ),
    query("order")
      .optional()
      .isIn(["asc", "desc"])
      .withMessage("Order must be asc or desc"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: errors.array(),
      });
    }

    const filters = {
      status: req.query.status,
      user_id: req.query.user_id,
      bike_id: req.query.bike_id ? parseInt(req.query.bike_id) : undefined,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      sort: req.query.sort || "created_at",
      order: req.query.order || "desc",
    };

    try {
      const result = await adminService.getAllBookings(filters);

      res.json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result.bookings,
        meta: {
          total: result.total,
          count: result.bookings.length,
          limit: filters.limit,
          offset: filters.offset,
          filters: filters,
          summary: {
            active_bookings: result.bookings.filter(
              (b) => b.status === "active"
            ).length,
            completed_bookings: result.bookings.filter(
              (b) => b.status === "completed"
            ).length,
            cancelled_bookings: result.bookings.filter(
              (b) => b.status === "cancelled"
            ).length,
            total_revenue: result.bookings
              .filter((b) => b.total_cost)
              .reduce((sum, b) => sum + parseFloat(b.total_cost), 0),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /revenue
 * @desc    Get revenue analytics and financial reports
 * @access  Admin only
 * @query   { period?, start_date?, end_date?, group_by? }
 */
router.get(
  "/revenue",
  authenticateUser,
  requireAdmin,
  [
    query("period")
      .optional()
      .isIn(["today", "week", "month", "year", "custom"])
      .withMessage("Period must be today, week, month, year, or custom"),
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO date"),
    query("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO date"),
    query("group_by")
      .optional()
      .isIn(["day", "week", "month"])
      .withMessage("Group by must be day, week, or month"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: errors.array(),
      });
    }

    const filters = {
      period: req.query.period || "month",
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      group_by: req.query.group_by || "day",
    };

    try {
      const result = await adminService.getRevenueAnalytics(filters);

      res.json({
        success: true,
        message: "Revenue analytics retrieved successfully",
        data: result,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /analytics
 * @desc    Get comprehensive system analytics dashboard
 * @access  Admin only
 */
router.get(
  "/analytics",
  authenticateUser,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const analytics = await adminService.getSystemAnalytics();

      res.json({
        success: true,
        message: "System analytics retrieved successfully",
        data: analytics,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /users
 * @desc    Get user management data and statistics
 * @access  Admin only
 * @query   { role?, active?, limit?, offset?, search? }
 */
router.get(
  "/users",
  authenticateUser,
  requireAdmin,
  [
    query("role")
      .optional()
      .isIn(["admin", "customer"])
      .withMessage("Role must be admin or customer"),
    query("active")
      .optional()
      .isBoolean()
      .withMessage("Active must be true or false"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 200 })
      .withMessage("Limit must be between 1 and 200"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be 0 or greater"),
    query("search")
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage("Search query must be 100 characters or less"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: errors.array(),
      });
    }

    const filters = {
      role: req.query.role,
      active: req.query.active,
      limit: req.query.limit ? parseInt(req.query.limit) : 50,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      search: req.query.search,
    };

    try {
      const result = await adminService.getUsers(filters);

      res.json({
        success: true,
        message: "Users retrieved successfully",
        data: result.users,
        meta: {
          total: result.total,
          count: result.users.length,
          limit: filters.limit,
          offset: filters.offset,
          filters: filters,
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /stats/overview
 * @desc    Get quick overview statistics for admin dashboard
 * @access  Admin only
 */
router.get(
  "/stats/overview",
  authenticateUser,
  requireAdmin,
  asyncHandler(async (req, res) => {
    try {
      const stats = await adminService.getOverviewStats();

      res.json({
        success: true,
        message: "Overview statistics retrieved successfully",
        data: stats,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /bikes/usage
 * @desc    Get bike usage analytics and performance metrics
 * @access  Admin only
 * @query   { period?, limit? }
 */
router.get(
  "/bikes/usage",
  authenticateUser,
  requireAdmin,
  [
    query("period")
      .optional()
      .isIn(["week", "month", "year"])
      .withMessage("Period must be week, month, or year"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: errors.array(),
      });
    }

    const filters = {
      period: req.query.period || "month",
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
    };

    try {
      const result = await adminService.getBikeUsageAnalytics(filters);

      res.json({
        success: true,
        message: "Bike usage analytics retrieved successfully",
        data: result,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /export/bookings
 * @desc    Export bookings data as CSV
 * @access  Admin only
 * @query   { start_date?, end_date?, format? }
 */
router.get(
  "/export/bookings",
  authenticateUser,
  requireAdmin,
  [
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO date"),
    query("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO date"),
    query("format")
      .optional()
      .isIn(["csv", "json"])
      .withMessage("Format must be csv or json"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid query parameters",
        details: errors.array(),
      });
    }

    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      format: req.query.format || "csv",
    };

    try {
      const result = await adminService.exportBookings(filters);

      if (filters.format === "csv") {
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          'attachment; filename="bookings.csv"'
        );
        res.send(result);
      } else {
        res.json({
          success: true,
          message: "Bookings exported successfully",
          data: result,
        });
      }
    } catch (error) {
      throw error;
    }
  })
);

module.exports = router;
