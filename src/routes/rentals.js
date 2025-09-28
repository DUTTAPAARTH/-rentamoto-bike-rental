/**
 * Rental Workflow Routes for RENTAMOTO
 *
 * Handles bike rental operations including booking, returning, and viewing bookings.
 * Implements business logic for rental duration, cost calculation, and availability management.
 *
 * Routes:
 * - POST /rent - Book a bike
 * - POST /return - Return a bike
 * - GET /my-bookings - Get user's bookings
 */

const express = require("express");
const { body, query, validationResult } = require("express-validator");
const { asyncHandler } = require("../middleware/errorHandler");
const { authenticateUser, requireCustomer } = require("../middleware/auth");
const rentalService = require("../services/rentalService");

const router = express.Router();

/**
 * @route   POST /rent
 * @desc    Book a bike for rental
 * @access  Customer/Admin
 * @body    { bike_id, start_latitude?, start_longitude? }
 */
router.post(
  "/rent",
  authenticateUser,
  requireCustomer,
  [
    body("bike_id")
      .isInt({ min: 1 })
      .withMessage("Bike ID must be a positive integer"),
    body("start_latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Start latitude must be between -90 and 90"),
    body("start_longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Start longitude must be between -180 and 180"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 250 })
      .withMessage("Notes must be 250 characters or less"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid rental request data",
        details: errors.array(),
      });
    }

    const rentalData = {
      user_id: req.user.id,
      bike_id: parseInt(req.body.bike_id),
      start_latitude: req.body.start_latitude
        ? parseFloat(req.body.start_latitude)
        : null,
      start_longitude: req.body.start_longitude
        ? parseFloat(req.body.start_longitude)
        : null,
      notes: req.body.notes,
    };

    try {
      const booking = await rentalService.rentBike(rentalData);

      res.status(201).json({
        success: true,
        message: "Bike rented successfully",
        data: {
          booking,
          instructions: {
            message: "Enjoy your ride! Remember to return the bike when done.",
            return_endpoint: "/return",
            booking_id: booking.booking_id,
          },
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   POST /return
 * @desc    Return a rented bike
 * @access  Customer/Admin
 * @body    { booking_id, end_latitude?, end_longitude?, notes? }
 */
router.post(
  "/return",
  authenticateUser,
  requireCustomer,
  [
    body("booking_id")
      .isInt({ min: 1 })
      .withMessage("Booking ID must be a positive integer"),
    body("end_latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("End latitude must be between -90 and 90"),
    body("end_longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("End longitude must be between -180 and 180"),
    body("notes")
      .optional()
      .trim()
      .isLength({ max: 250 })
      .withMessage("Notes must be 250 characters or less"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid return request data",
        details: errors.array(),
      });
    }

    const returnData = {
      booking_id: parseInt(req.body.booking_id),
      user_id: req.user.id,
      end_latitude: req.body.end_latitude
        ? parseFloat(req.body.end_latitude)
        : null,
      end_longitude: req.body.end_longitude
        ? parseFloat(req.body.end_longitude)
        : null,
      notes: req.body.notes,
    };

    try {
      const result = await rentalService.returnBike(returnData);

      res.json({
        success: true,
        message: "Bike returned successfully",
        data: {
          booking: result.booking,
          rental_summary: {
            duration_hours: result.durationHours,
            total_cost: result.booking.total_cost,
            bike_model: result.bikeModel,
          },
          thank_you: "Thank you for using RENTAMOTO! Rate your experience.",
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /my-bookings
 * @desc    Get current user's bookings
 * @access  Customer/Admin
 * @query   { status?, limit?, offset?, start_date?, end_date? }
 */
router.get(
  "/my-bookings",
  authenticateUser,
  requireCustomer,
  [
    query("status")
      .optional()
      .isIn(["active", "completed", "cancelled"])
      .withMessage("Status must be active, completed, or cancelled"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be 0 or greater"),
    query("start_date")
      .optional()
      .isISO8601()
      .withMessage("Start date must be a valid ISO date"),
    query("end_date")
      .optional()
      .isISO8601()
      .withMessage("End date must be a valid ISO date"),
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
      user_id: req.user.id,
      status: req.query.status,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
    };

    try {
      const result = await rentalService.getUserBookings(filters);

      res.json({
        success: true,
        message: "Bookings retrieved successfully",
        data: result.bookings,
        meta: {
          total: result.total,
          count: result.bookings.length,
          limit: filters.limit,
          offset: filters.offset,
          summary: {
            total_bookings: result.total,
            active_bookings: result.bookings.filter(
              (b) => b.status === "active"
            ).length,
            completed_bookings: result.bookings.filter(
              (b) => b.status === "completed"
            ).length,
            total_spent: result.bookings
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
 * @route   GET /bookings/:id
 * @desc    Get specific booking details
 * @access  Customer/Admin (own bookings only, admin can see all)
 * @params  { id }
 */
router.get(
  "/bookings/:id",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const bookingId = parseInt(req.params.id);

    if (!bookingId || bookingId < 1) {
      return res.status(400).json({
        error: "Validation error",
        message: "Booking ID must be a positive integer",
      });
    }

    try {
      const booking = await rentalService.getBookingById(
        bookingId,
        req.user.id,
        req.user.role === "admin"
      );

      res.json({
        success: true,
        message: "Booking retrieved successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   PUT /bookings/:id/cancel
 * @desc    Cancel an active booking
 * @access  Customer/Admin
 * @params  { id }
 * @body    { reason? }
 */
router.put(
  "/bookings/:id/cancel",
  authenticateUser,
  requireCustomer,
  [
    body("reason")
      .optional()
      .trim()
      .isLength({ max: 250 })
      .withMessage("Cancellation reason must be 250 characters or less"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid cancellation data",
        details: errors.array(),
      });
    }

    const bookingId = parseInt(req.params.id);

    if (!bookingId || bookingId < 1) {
      return res.status(400).json({
        error: "Validation error",
        message: "Booking ID must be a positive integer",
      });
    }

    try {
      const booking = await rentalService.cancelBooking({
        booking_id: bookingId,
        user_id: req.user.id,
        reason: req.body.reason,
        isAdmin: req.user.role === "admin",
      });

      res.json({
        success: true,
        message: "Booking cancelled successfully",
        data: booking,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /active-rental
 * @desc    Get user's current active rental
 * @access  Customer/Admin
 */
router.get(
  "/active-rental",
  authenticateUser,
  requireCustomer,
  asyncHandler(async (req, res) => {
    try {
      const activeRental = await rentalService.getActiveRental(req.user.id);

      if (!activeRental) {
        return res.json({
          success: true,
          message: "No active rental found",
          data: null,
        });
      }

      res.json({
        success: true,
        message: "Active rental retrieved successfully",
        data: activeRental,
      });
    } catch (error) {
      throw error;
    }
  })
);

module.exports = router;
