/**
 * Rental Service for RENTAMOTO
 *
 * Handles all rental-related business logic including bike booking, return,
 * cost calculation, and booking management.
 */

const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const config = require("../config/config");
const bikeService = require("./bikeService");

class RentalService {
  /**
   * Rent a bike - Create a new booking and mark bike as unavailable
   *
   * @param {Object} rentalData - Rental request data
   * @param {string} rentalData.user_id - User ID
   * @param {number} rentalData.bike_id - Bike ID
   * @param {number} rentalData.start_latitude - Start location latitude
   * @param {number} rentalData.start_longitude - Start location longitude
   * @param {string} rentalData.notes - Rental notes
   * @returns {Promise<Object>} Created booking
   */
  async rentBike(rentalData) {
    try {
      // Check if user has an active rental
      const activeRental = await this.getActiveRental(rentalData.user_id);
      if (activeRental) {
        throw new AppError(
          "You already have an active rental. Please return your current bike before renting another.",
          400
        );
      }

      // Check if bike is available
      const bike = await bikeService.getBikeById(rentalData.bike_id, false);
      if (!bike) {
        throw new AppError("Bike not found or unavailable", 404);
      }

      if (!bike.is_available) {
        throw new AppError("Bike is currently unavailable", 400);
      }

      // Check if bike has active booking
      const hasActiveBooking = await bikeService.hasActiveBooking(
        rentalData.bike_id
      );
      if (hasActiveBooking) {
        throw new AppError("Bike is currently rented by another user", 400);
      }

      // Start transaction-like operations
      const startTime = new Date().toISOString();

      // Create booking record
      const { data: booking, error: bookingError } = await supabaseAdmin
        .from("bookings")
        .insert({
          user_id: rentalData.user_id,
          bike_id: rentalData.bike_id,
          start_time: startTime,
          status: "active",
          start_latitude: rentalData.start_latitude,
          start_longitude: rentalData.start_longitude,
          notes: rentalData.notes,
        })
        .select(
          `
          *,
          bikes (
            id, model, brand, price_per_hour, latitude, longitude
          )
        `
        )
        .single();

      if (bookingError) {
        console.error("Create booking error:", bookingError);
        throw new AppError("Failed to create booking", 500);
      }

      // Mark bike as unavailable
      try {
        await bikeService.updateAvailability(rentalData.bike_id, false);
      } catch (availabilityError) {
        // If we can't mark bike as unavailable, cancel the booking
        await supabaseAdmin
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("booking_id", booking.booking_id);

        throw new AppError("Failed to reserve bike. Please try again.", 500);
      }

      return booking;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Rent bike error:", error);
      throw new AppError("Failed to rent bike", 500);
    }
  }

  /**
   * Return a bike - Complete booking and calculate cost
   *
   * @param {Object} returnData - Return request data
   * @param {number} returnData.booking_id - Booking ID
   * @param {string} returnData.user_id - User ID
   * @param {number} returnData.end_latitude - Return location latitude
   * @param {number} returnData.end_longitude - Return location longitude
   * @param {string} returnData.notes - Return notes
   * @returns {Promise<Object>} Completed booking and summary
   */
  async returnBike(returnData) {
    try {
      // Get booking details
      const { data: booking, error: fetchError } = await supabaseAdmin
        .from("bookings")
        .select(
          `
          *,
          bikes (
            id, model, brand, price_per_hour, latitude, longitude
          )
        `
        )
        .eq("booking_id", returnData.booking_id)
        .single();

      if (fetchError || !booking) {
        throw new AppError("Booking not found", 404);
      }

      // Verify ownership (unless admin)
      if (booking.user_id !== returnData.user_id) {
        throw new AppError("You can only return your own rentals", 403);
      }

      // Check if booking is active
      if (booking.status !== "active") {
        throw new AppError(
          `Cannot return bike. Booking is ${booking.status}`,
          400
        );
      }

      if (booking.end_time) {
        throw new AppError("Booking has already been completed", 400);
      }

      // Calculate rental duration and cost
      const endTime = new Date();
      const startTime = new Date(booking.start_time);
      const durationMs = endTime.getTime() - startTime.getTime();
      const durationHours = Math.max(durationMs / (1000 * 60 * 60), 1); // Minimum 1 hour
      const totalCost =
        Math.round(
          durationHours * parseFloat(booking.bikes.price_per_hour) * 100
        ) / 100;

      // Update booking with return information
      const { data: updatedBooking, error: updateError } = await supabaseAdmin
        .from("bookings")
        .update({
          end_time: endTime.toISOString(),
          total_cost: totalCost,
          status: "completed",
          end_latitude: returnData.end_latitude,
          end_longitude: returnData.end_longitude,
          notes: returnData.notes
            ? `${booking.notes || ""}\nReturn: ${returnData.notes}`.trim()
            : booking.notes,
        })
        .eq("booking_id", returnData.booking_id)
        .select(
          `
          *,
          bikes (
            id, model, brand, price_per_hour, latitude, longitude
          )
        `
        )
        .single();

      if (updateError) {
        console.error("Update booking error:", updateError);
        throw new AppError("Failed to complete booking", 500);
      }

      // Mark bike as available
      try {
        await bikeService.updateAvailability(booking.bike_id, true);

        // Update bike location if provided
        if (returnData.end_latitude && returnData.end_longitude) {
          await bikeService.updateBike(booking.bike_id, {
            latitude: returnData.end_latitude,
            longitude: returnData.end_longitude,
          });
        }
      } catch (availabilityError) {
        console.error("Update bike availability error:", availabilityError);
        // Don't throw error here as booking is already completed
      }

      return {
        booking: updatedBooking,
        durationHours: Math.round(durationHours * 100) / 100,
        bikeModel: booking.bikes.model,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Return bike error:", error);
      throw new AppError("Failed to return bike", 500);
    }
  }

  /**
   * Get user's bookings with filters
   *
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Bookings and total count
   */
  async getUserBookings(filters) {
    try {
      let query = supabaseAdmin
        .from("bookings")
        .select(
          `
          *,
          bikes (
            id, model, brand, price_per_hour, image_url
          )
        `,
          { count: "exact" }
        )
        .eq("user_id", filters.user_id);

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.start_date) {
        query = query.gte("created_at", filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte("created_at", filters.end_date);
      }

      // Apply pagination and ordering
      query = query
        .order("created_at", { ascending: false })
        .range(filters.offset, filters.offset + filters.limit - 1);

      const { data: bookings, error, count } = await query;

      if (error) {
        console.error("Get user bookings error:", error);
        throw new AppError("Failed to retrieve bookings", 500);
      }

      return {
        bookings: bookings || [],
        total: count || 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get user bookings error:", error);
      throw new AppError("Failed to retrieve bookings", 500);
    }
  }

  /**
   * Get booking by ID
   *
   * @param {number} bookingId - Booking ID
   * @param {string} userId - User ID (for ownership check)
   * @param {boolean} isAdmin - Is admin user
   * @returns {Promise<Object>} Booking details
   */
  async getBookingById(bookingId, userId, isAdmin = false) {
    try {
      let query = supabaseAdmin
        .from("bookings")
        .select(
          `
          *,
          bikes (
            id, model, brand, price_per_hour, image_url, latitude, longitude
          ),
          user_profiles!bookings_user_id_fkey (
            name
          )
        `
        )
        .eq("booking_id", bookingId);

      // Non-admin users can only see their own bookings
      if (!isAdmin) {
        query = query.eq("user_id", userId);
      }

      const { data: booking, error } = await query.single();

      if (error) {
        if (error.code === "PGRST116") {
          throw new AppError("Booking not found", 404);
        }
        console.error("Get booking error:", error);
        throw new AppError("Failed to retrieve booking", 500);
      }

      return booking;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get booking error:", error);
      throw new AppError("Failed to retrieve booking", 500);
    }
  }

  /**
   * Cancel an active booking
   *
   * @param {Object} cancelData - Cancellation data
   * @returns {Promise<Object>} Cancelled booking
   */
  async cancelBooking(cancelData) {
    try {
      // Get booking details
      const booking = await this.getBookingById(
        cancelData.booking_id,
        cancelData.user_id,
        cancelData.isAdmin
      );

      if (booking.status !== "active") {
        throw new AppError(
          `Cannot cancel booking. Status is ${booking.status}`,
          400
        );
      }

      if (booking.end_time) {
        throw new AppError("Cannot cancel completed booking", 400);
      }

      // Update booking status
      const { data: updatedBooking, error } = await supabaseAdmin
        .from("bookings")
        .update({
          status: "cancelled",
          notes: cancelData.reason
            ? `${booking.notes || ""}\nCancelled: ${cancelData.reason}`.trim()
            : `${booking.notes || ""}\nCancelled by user`.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("booking_id", cancelData.booking_id)
        .select()
        .single();

      if (error) {
        console.error("Cancel booking error:", error);
        throw new AppError("Failed to cancel booking", 500);
      }

      // Mark bike as available
      try {
        await bikeService.updateAvailability(booking.bike_id, true);
      } catch (availabilityError) {
        console.error(
          "Update bike availability after cancellation error:",
          availabilityError
        );
        // Don't throw error as booking is already cancelled
      }

      return updatedBooking;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Cancel booking error:", error);
      throw new AppError("Failed to cancel booking", 500);
    }
  }

  /**
   * Get user's active rental
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object|null>} Active rental or null
   */
  async getActiveRental(userId) {
    try {
      const { data: booking, error } = await supabaseAdmin
        .from("bookings")
        .select(
          `
          *,
          bikes (
            id, model, brand, price_per_hour, image_url, latitude, longitude, battery_level
          )
        `
        )
        .eq("user_id", userId)
        .eq("status", "active")
        .is("end_time", null)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null; // No active rental found
        }
        console.error("Get active rental error:", error);
        throw new AppError("Failed to check active rental", 500);
      }

      // Calculate current duration and estimated cost
      const currentTime = new Date();
      const startTime = new Date(booking.start_time);
      const currentDurationHours =
        (currentTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      const estimatedCost =
        Math.round(
          Math.max(currentDurationHours, 1) *
            parseFloat(booking.bikes.price_per_hour) *
            100
        ) / 100;

      return {
        ...booking,
        current_duration_hours: Math.round(currentDurationHours * 100) / 100,
        estimated_cost: estimatedCost,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get active rental error:", error);
      throw new AppError("Failed to check active rental", 500);
    }
  }

  /**
   * Get rental statistics for a user
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User rental statistics
   */
  async getUserStats(userId) {
    try {
      const { data: stats, error } = await supabaseAdmin
        .from("bookings")
        .select("status, total_cost, start_time, end_time")
        .eq("user_id", userId);

      if (error) {
        console.error("Get user stats error:", error);
        throw new AppError("Failed to get user statistics", 500);
      }

      const totalBookings = stats.length;
      const completedBookings = stats.filter(
        (b) => b.status === "completed"
      ).length;
      const totalSpent = stats
        .filter((b) => b.total_cost)
        .reduce((sum, b) => sum + parseFloat(b.total_cost), 0);

      let totalRideTime = 0;
      stats.forEach((booking) => {
        if (booking.start_time && booking.end_time) {
          const duration =
            new Date(booking.end_time).getTime() -
            new Date(booking.start_time).getTime();
          totalRideTime += duration;
        }
      });

      return {
        total_bookings: totalBookings,
        completed_bookings: completedBookings,
        cancelled_bookings: stats.filter((b) => b.status === "cancelled")
          .length,
        active_bookings: stats.filter((b) => b.status === "active").length,
        total_spent: Math.round(totalSpent * 100) / 100,
        total_ride_time_hours:
          Math.round((totalRideTime / (1000 * 60 * 60)) * 100) / 100,
        average_booking_cost:
          completedBookings > 0
            ? Math.round((totalSpent / completedBookings) * 100) / 100
            : 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get user stats error:", error);
      throw new AppError("Failed to get user statistics", 500);
    }
  }
}

module.exports = new RentalService();
