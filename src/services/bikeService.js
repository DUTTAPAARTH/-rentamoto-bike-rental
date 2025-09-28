/**
 * Bike Service for RENTAMOTO
 *
 * Handles all bike-related business logic and database operations.
 * Manages bike inventory, availability, location-based searches, and CRUD operations.
 */

const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const config = require("../config/config");

class BikeService {
  /**
   * Get bikes with filters and location-based search
   *
   * @param {Object} filters - Search filters
   * @param {boolean} filters.available - Filter by availability
   * @param {number} filters.latitude - Search latitude
   * @param {number} filters.longitude - Search longitude
   * @param {number} filters.radius - Search radius in km
   * @param {string} filters.brand - Filter by brand
   * @param {number} filters.limit - Results limit
   * @param {number} filters.offset - Results offset
   * @param {boolean} filters.isAdmin - Is admin user
   * @returns {Promise<Object>} Bikes and total count
   */
  async getBikes(filters = {}) {
    try {
      let query = supabaseAdmin.from("bikes").select("*", { count: "exact" });

      // Apply filters
      if (filters.available !== undefined) {
        query = query.eq("is_available", filters.available);
      } else if (!filters.isAdmin) {
        // Non-admin users only see available bikes by default
        query = query.eq("is_available", true);
      }

      if (filters.brand) {
        query = query.ilike("brand", `%${filters.brand}%`);
      }

      // Location-based search using PostgreSQL PostGIS functions
      if (filters.latitude && filters.longitude && filters.radius) {
        const radius = Math.min(
          filters.radius,
          config.business.maxSearchRadius
        );

        query = query
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .lte(
            "earth_distance(ll_to_earth(latitude, longitude), ll_to_earth($1, $2))",
            radius * 1000 // Convert km to meters
          );
      }

      // Apply pagination
      query = query.range(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || 20) - 1
      );

      // Order by creation date (newest first)
      query = query.order("created_at", { ascending: false });

      const { data: bikes, error, count } = await query;

      if (error) {
        console.error("Get bikes error:", error);
        throw new AppError("Failed to retrieve bikes", 500);
      }

      // Calculate distance if location search was performed
      if (filters.latitude && filters.longitude && bikes) {
        bikes.forEach((bike) => {
          if (bike.latitude && bike.longitude) {
            bike.distance = this.calculateDistance(
              filters.latitude,
              filters.longitude,
              bike.latitude,
              bike.longitude
            );
          }
        });

        // Sort by distance if location search
        bikes.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        );
      }

      return {
        bikes: bikes || [],
        total: count || 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get bikes error:", error);
      throw new AppError("Failed to retrieve bikes", 500);
    }
  }

  /**
   * Get bike by ID
   *
   * @param {number} bikeId - Bike ID
   * @param {boolean} isAdmin - Is admin user
   * @returns {Promise<Object>} Bike data
   */
  async getBikeById(bikeId, isAdmin = false) {
    try {
      let query = supabaseAdmin
        .from("bikes")
        .select("*")
        .eq("id", bikeId)
        .single();

      // Non-admin users can only see available bikes
      if (!isAdmin) {
        query = query.eq("is_available", true);
      }

      const { data: bike, error } = await query;

      if (error) {
        if (error.code === "PGRST116") {
          throw new AppError("Bike not found", 404);
        }
        console.error("Get bike error:", error);
        throw new AppError("Failed to retrieve bike", 500);
      }

      return bike;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get bike error:", error);
      throw new AppError("Failed to retrieve bike", 500);
    }
  }

  /**
   * Create new bike
   *
   * @param {Object} bikeData - Bike data
   * @returns {Promise<Object>} Created bike
   */
  async createBike(bikeData) {
    try {
      // Generate QR code identifier
      const qrCode = `RENT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const { data: bike, error } = await supabaseAdmin
        .from("bikes")
        .insert({
          ...bikeData,
          qr_code: qrCode,
          is_available: true,
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          throw new AppError("Bike with this QR code already exists", 409);
        }
        console.error("Create bike error:", error);
        throw new AppError("Failed to create bike", 500);
      }

      return bike;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Create bike error:", error);
      throw new AppError("Failed to create bike", 500);
    }
  }

  /**
   * Update existing bike
   *
   * @param {number} bikeId - Bike ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated bike
   */
  async updateBike(bikeId, updateData) {
    try {
      // First check if bike exists
      const existingBike = await this.getBikeById(bikeId, true);

      if (!existingBike) {
        throw new AppError("Bike not found", 404);
      }

      // Check if bike is currently rented (has active booking)
      if (
        updateData.is_available === false ||
        updateData.latitude ||
        updateData.longitude
      ) {
        const hasActiveBooking = await this.hasActiveBooking(bikeId);

        if (hasActiveBooking && updateData.is_available === false) {
          throw new AppError(
            "Cannot mark bike as unavailable while it has an active booking",
            400
          );
        }
      }

      const { data: bike, error } = await supabaseAdmin
        .from("bikes")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bikeId)
        .select()
        .single();

      if (error) {
        console.error("Update bike error:", error);
        throw new AppError("Failed to update bike", 500);
      }

      return bike;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Update bike error:", error);
      throw new AppError("Failed to update bike", 500);
    }
  }

  /**
   * Delete bike (soft delete by marking as unavailable)
   *
   * @param {number} bikeId - Bike ID
   * @returns {Promise<void>}
   */
  async deleteBike(bikeId) {
    try {
      // Check if bike has active bookings
      const hasActiveBooking = await this.hasActiveBooking(bikeId);

      if (hasActiveBooking) {
        throw new AppError("Cannot delete bike with active bookings", 400);
      }

      // Soft delete by marking as unavailable
      const { error } = await supabaseAdmin
        .from("bikes")
        .update({
          is_available: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bikeId);

      if (error) {
        console.error("Delete bike error:", error);
        throw new AppError("Failed to delete bike", 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Delete bike error:", error);
      throw new AppError("Failed to delete bike", 500);
    }
  }

  /**
   * Check bike availability
   *
   * @param {number} bikeId - Bike ID
   * @returns {Promise<Object>} Availability status
   */
  async checkAvailability(bikeId) {
    try {
      const bike = await this.getBikeById(bikeId, false);

      if (!bike) {
        throw new AppError("Bike not found", 404);
      }

      // Check for active bookings
      const hasActiveBooking = await this.hasActiveBooking(bikeId);

      return {
        bike_id: bikeId,
        is_available: bike.is_available && !hasActiveBooking,
        has_active_booking: hasActiveBooking,
        battery_level: bike.battery_level,
        location:
          bike.latitude && bike.longitude
            ? {
                latitude: bike.latitude,
                longitude: bike.longitude,
              }
            : null,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Check availability error:", error);
      throw new AppError("Failed to check availability", 500);
    }
  }

  /**
   * Update bike availability status
   *
   * @param {number} bikeId - Bike ID
   * @param {boolean} isAvailable - Availability status
   * @returns {Promise<Object>} Updated bike
   */
  async updateAvailability(bikeId, isAvailable) {
    try {
      const { data: bike, error } = await supabaseAdmin
        .from("bikes")
        .update({
          is_available: isAvailable,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bikeId)
        .select()
        .single();

      if (error) {
        console.error("Update availability error:", error);
        throw new AppError("Failed to update bike availability", 500);
      }

      return bike;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Update availability error:", error);
      throw new AppError("Failed to update bike availability", 500);
    }
  }

  /**
   * Check if bike has active booking
   *
   * @param {number} bikeId - Bike ID
   * @returns {Promise<boolean>} Has active booking
   */
  async hasActiveBooking(bikeId) {
    try {
      const { data: bookings, error } = await supabaseAdmin
        .from("bookings")
        .select("booking_id")
        .eq("bike_id", bikeId)
        .eq("status", "active")
        .is("end_time", null)
        .limit(1);

      if (error) {
        console.error("Check active booking error:", error);
        return false;
      }

      return bookings && bookings.length > 0;
    } catch (error) {
      console.error("Check active booking error:", error);
      return false;
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   *
   * @param {number} lat1 - First latitude
   * @param {number} lon1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lon2 - Second longitude
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   *
   * @param {number} degrees - Degrees
   * @returns {number} Radians
   */
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
}

module.exports = new BikeService();
