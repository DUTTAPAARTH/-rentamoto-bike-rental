/**
 * Bike Management Routes for RENTAMOTO
 *
 * Provides CRUD operations for bike inventory management.
 * Admin-only endpoints for bike creation, updating, and deletion.
 * Public endpoints for viewing available bikes.
 *
 * Routes:
 * - GET /bikes - Get all bikes (public/admin)
 * - GET /bikes/:id - Get specific bike (public)
 * - POST /bikes - Create new bike (admin only)
 * - PUT /bikes/:id - Update bike (admin only)
 * - DELETE /bikes/:id - Delete bike (admin only)
 */

const express = require("express");
const { body, param, query, validationResult } = require("express-validator");
const { asyncHandler } = require("../middleware/errorHandler");
const {
  authenticateUser,
  requireAdmin,
  optionalAuth,
} = require("../middleware/auth");
const bikeService = require("../services/bikeService");

const router = express.Router();

/**
 * @route   GET /bikes
 * @desc    Get all bikes with optional filters
 * @access  Public (shows available only) / Admin (shows all)
 * @query   { available?, latitude?, longitude?, radius?, brand?, limit?, offset? }
 */
router.get(
  "/",
  [
    query("available")
      .optional()
      .isBoolean()
      .withMessage("Available must be true or false"),
    query("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    query("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
    query("radius")
      .optional()
      .isFloat({ min: 0.1, max: 50 })
      .withMessage("Radius must be between 0.1 and 50 km"),
    query("brand")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Brand must be 50 characters or less"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("offset")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Offset must be 0 or greater"),
  ],
  optionalAuth,
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
      available: req.query.available,
      latitude: req.query.latitude ? parseFloat(req.query.latitude) : undefined,
      longitude: req.query.longitude
        ? parseFloat(req.query.longitude)
        : undefined,
      radius: req.query.radius ? parseFloat(req.query.radius) : undefined,
      brand: req.query.brand,
      limit: req.query.limit ? parseInt(req.query.limit) : 20,
      offset: req.query.offset ? parseInt(req.query.offset) : 0,
      isAdmin: req.user?.role === "admin",
    };

    try {
      const result = await bikeService.getBikes(filters);

      res.json({
        success: true,
        message: "Bikes retrieved successfully",
        data: result.bikes,
        meta: {
          total: result.total,
          count: result.bikes.length,
          limit: filters.limit,
          offset: filters.offset,
          ...(filters.latitude &&
            filters.longitude && {
              location: {
                latitude: filters.latitude,
                longitude: filters.longitude,
                radius: filters.radius || 10,
              },
            }),
        },
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /bikes/:id
 * @desc    Get specific bike by ID
 * @access  Public (available bikes only) / Admin (any bike)
 * @params  { id }
 */
router.get(
  "/:id",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Bike ID must be a positive integer"),
  ],
  optionalAuth,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid bike ID",
        details: errors.array(),
      });
    }

    const bikeId = parseInt(req.params.id);
    const isAdmin = req.user?.role === "admin";

    try {
      const bike = await bikeService.getBikeById(bikeId, isAdmin);

      res.json({
        success: true,
        message: "Bike retrieved successfully",
        data: bike,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   POST /bikes
 * @desc    Create a new bike
 * @access  Admin only
 * @body    { model, brand?, price_per_hour, latitude?, longitude?, description?, image_url?, battery_level? }
 */
router.post(
  "/",
  authenticateUser,
  requireAdmin,
  [
    body("model")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Model must be between 2 and 100 characters"),
    body("brand")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Brand must be 50 characters or less"),
    body("price_per_hour")
      .isFloat({ min: 0.01 })
      .withMessage("Price per hour must be greater than 0"),
    body("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    body("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be 500 characters or less"),
    body("image_url")
      .optional()
      .isURL()
      .withMessage("Image URL must be a valid URL"),
    body("battery_level")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Battery level must be between 0 and 100"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid bike data",
        details: errors.array(),
      });
    }

    const bikeData = {
      model: req.body.model,
      brand: req.body.brand,
      price_per_hour: parseFloat(req.body.price_per_hour),
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : null,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : null,
      description: req.body.description,
      image_url: req.body.image_url,
      battery_level: req.body.battery_level
        ? parseInt(req.body.battery_level)
        : null,
    };

    try {
      const bike = await bikeService.createBike(bikeData);

      res.status(201).json({
        success: true,
        message: "Bike created successfully",
        data: bike,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   PUT /bikes/:id
 * @desc    Update existing bike
 * @access  Admin only
 * @params  { id }
 * @body    { model?, brand?, price_per_hour?, latitude?, longitude?, description?, image_url?, is_available?, battery_level? }
 */
router.put(
  "/:id",
  authenticateUser,
  requireAdmin,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Bike ID must be a positive integer"),
    body("model")
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Model must be between 2 and 100 characters"),
    body("brand")
      .optional()
      .trim()
      .isLength({ max: 50 })
      .withMessage("Brand must be 50 characters or less"),
    body("price_per_hour")
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage("Price per hour must be greater than 0"),
    body("latitude")
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage("Latitude must be between -90 and 90"),
    body("longitude")
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage("Longitude must be between -180 and 180"),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be 500 characters or less"),
    body("image_url")
      .optional()
      .isURL()
      .withMessage("Image URL must be a valid URL"),
    body("is_available")
      .optional()
      .isBoolean()
      .withMessage("is_available must be true or false"),
    body("battery_level")
      .optional()
      .isInt({ min: 0, max: 100 })
      .withMessage("Battery level must be between 0 and 100"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid update data",
        details: errors.array(),
      });
    }

    const bikeId = parseInt(req.params.id);

    const updateData = {};
    if (req.body.model !== undefined) updateData.model = req.body.model;
    if (req.body.brand !== undefined) updateData.brand = req.body.brand;
    if (req.body.price_per_hour !== undefined)
      updateData.price_per_hour = parseFloat(req.body.price_per_hour);
    if (req.body.latitude !== undefined)
      updateData.latitude = req.body.latitude
        ? parseFloat(req.body.latitude)
        : null;
    if (req.body.longitude !== undefined)
      updateData.longitude = req.body.longitude
        ? parseFloat(req.body.longitude)
        : null;
    if (req.body.description !== undefined)
      updateData.description = req.body.description;
    if (req.body.image_url !== undefined)
      updateData.image_url = req.body.image_url;
    if (req.body.is_available !== undefined)
      updateData.is_available = req.body.is_available;
    if (req.body.battery_level !== undefined)
      updateData.battery_level = req.body.battery_level
        ? parseInt(req.body.battery_level)
        : null;

    try {
      const bike = await bikeService.updateBike(bikeId, updateData);

      res.json({
        success: true,
        message: "Bike updated successfully",
        data: bike,
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   DELETE /bikes/:id
 * @desc    Delete bike (soft delete by marking as unavailable)
 * @access  Admin only
 * @params  { id }
 */
router.delete(
  "/:id",
  authenticateUser,
  requireAdmin,
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Bike ID must be a positive integer"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid bike ID",
        details: errors.array(),
      });
    }

    const bikeId = parseInt(req.params.id);

    try {
      await bikeService.deleteBike(bikeId);

      res.json({
        success: true,
        message: "Bike deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  })
);

/**
 * @route   GET /bikes/:id/availability
 * @desc    Check bike availability status
 * @access  Public
 * @params  { id }
 */
router.get(
  "/:id/availability",
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Bike ID must be a positive integer"),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation error",
        message: "Invalid bike ID",
        details: errors.array(),
      });
    }

    const bikeId = parseInt(req.params.id);

    try {
      const availability = await bikeService.checkAvailability(bikeId);

      res.json({
        success: true,
        message: "Availability checked successfully",
        data: availability,
      });
    } catch (error) {
      throw error;
    }
  })
);

module.exports = router;
