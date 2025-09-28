/**
 * Admin Service for RENTAMOTO
 *
 * Handles administrative operations including analytics, reporting,
 * user management, and system monitoring.
 */

const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");

class AdminService {
  /**
   * Get all bookings with filters (admin only)
   *
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Bookings and metadata
   */
  async getAllBookings(filters) {
    try {
      let query = supabaseAdmin.from("bookings").select(
        `
          *,
          bikes (
            id, model, brand, price_per_hour, image_url
          ),
          user_profiles!bookings_user_id_fkey (
            name
          )
        `,
        { count: "exact" }
      );

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }

      if (filters.bike_id) {
        query = query.eq("bike_id", filters.bike_id);
      }

      if (filters.start_date) {
        query = query.gte("created_at", filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte("created_at", filters.end_date);
      }

      // Apply sorting and pagination
      const ascending = filters.order === "asc";
      query = query
        .order(filters.sort, { ascending })
        .range(filters.offset, filters.offset + filters.limit - 1);

      const { data: bookings, error, count } = await query;

      if (error) {
        console.error("Get all bookings error:", error);
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

      console.error("Get all bookings error:", error);
      throw new AppError("Failed to retrieve bookings", 500);
    }
  }

  /**
   * Get revenue analytics with time-based grouping
   *
   * @param {Object} filters - Analytics filters
   * @returns {Promise<Object>} Revenue analytics data
   */
  async getRevenueAnalytics(filters) {
    try {
      let startDate, endDate;

      // Calculate date range based on period
      const now = new Date();
      switch (filters.period) {
        case "today":
          startDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
          endDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1
          );
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          endDate = now;
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear() + 1, 0, 1);
          break;
        case "custom":
          startDate = filters.start_date
            ? new Date(filters.start_date)
            : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          endDate = filters.end_date ? new Date(filters.end_date) : now;
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      }

      // Get revenue data
      const { data: revenueData, error } = await supabaseAdmin
        .from("bookings")
        .select("total_cost, created_at, status")
        .eq("status", "completed")
        .gte("created_at", startDate.toISOString())
        .lte("created_at", endDate.toISOString())
        .not("total_cost", "is", null)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Get revenue data error:", error);
        throw new AppError("Failed to retrieve revenue data", 500);
      }

      // Group data by time period
      const groupedData = this.groupRevenueByPeriod(
        revenueData,
        filters.group_by
      );

      // Calculate totals
      const totalRevenue = revenueData.reduce(
        (sum, booking) => sum + parseFloat(booking.total_cost),
        0
      );
      const totalBookings = revenueData.length;
      const averageBookingValue =
        totalBookings > 0 ? totalRevenue / totalBookings : 0;

      return {
        summary: {
          total_revenue: Math.round(totalRevenue * 100) / 100,
          total_bookings: totalBookings,
          average_booking_value: Math.round(averageBookingValue * 100) / 100,
          period: filters.period,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
        },
        timeline: groupedData,
        period_comparison: await this.getPeriodComparison(
          startDate,
          endDate,
          filters.period
        ),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get revenue analytics error:", error);
      throw new AppError("Failed to retrieve revenue analytics", 500);
    }
  }

  /**
   * Get comprehensive system analytics
   *
   * @returns {Promise<Object>} System analytics
   */
  async getSystemAnalytics() {
    try {
      const [overviewStats, bikeStats, userStats, revenueStats] =
        await Promise.all([
          this.getOverviewStats(),
          this.getBikeStats(),
          this.getUserStats(),
          this.getRevenueStats(),
        ]);

      return {
        overview: overviewStats,
        bikes: bikeStats,
        users: userStats,
        revenue: revenueStats,
        generated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Get system analytics error:", error);
      throw new AppError("Failed to retrieve system analytics", 500);
    }
  }

  /**
   * Get overview statistics for dashboard
   *
   * @returns {Promise<Object>} Overview stats
   */
  async getOverviewStats() {
    try {
      // Get counts using parallel queries
      const [
        { count: totalUsers },
        { count: totalBikes },
        { count: totalBookings },
        { count: activeRentals },
      ] = await Promise.all([
        supabaseAdmin
          .from("user_profiles")
          .select("*", { count: "exact", head: true }),
        supabaseAdmin.from("bikes").select("*", { count: "exact", head: true }),
        supabaseAdmin
          .from("bookings")
          .select("*", { count: "exact", head: true }),
        supabaseAdmin
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .eq("status", "active")
          .is("end_time", null),
      ]);

      // Get today's stats
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );

      const { data: todayBookings, count: todayBookingsCount } =
        await supabaseAdmin
          .from("bookings")
          .select("total_cost", { count: "exact" })
          .gte("created_at", todayStart.toISOString())
          .eq("status", "completed");

      const todayRevenue = todayBookings
        ? todayBookings.reduce(
            (sum, b) => sum + (parseFloat(b.total_cost) || 0),
            0
          )
        : 0;

      return {
        total_users: totalUsers || 0,
        total_bikes: totalBikes || 0,
        total_bookings: totalBookings || 0,
        active_rentals: activeRentals || 0,
        today: {
          bookings: todayBookingsCount || 0,
          revenue: Math.round(todayRevenue * 100) / 100,
        },
      };
    } catch (error) {
      console.error("Get overview stats error:", error);
      throw new AppError("Failed to retrieve overview statistics", 500);
    }
  }

  /**
   * Get users with filters and stats
   *
   * @param {Object} filters - User filters
   * @returns {Promise<Object>} Users and metadata
   */
  async getUsers(filters) {
    try {
      let query = supabaseAdmin
        .from("user_profiles")
        .select("*", { count: "exact" });

      // Apply filters
      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%`);
      }

      // Apply pagination and ordering
      query = query
        .order("created_at", { ascending: false })
        .range(filters.offset, filters.offset + filters.limit - 1);

      const { data: users, error, count } = await query;

      if (error) {
        console.error("Get users error:", error);
        throw new AppError("Failed to retrieve users", 500);
      }

      // Add booking stats for each user
      const usersWithStats = await Promise.all(
        (users || []).map(async (user) => {
          const { count: bookingCount } = await supabaseAdmin
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id);

          const { data: revenueData } = await supabaseAdmin
            .from("bookings")
            .select("total_cost")
            .eq("user_id", user.id)
            .eq("status", "completed");

          const totalSpent = revenueData
            ? revenueData.reduce(
                (sum, b) => sum + (parseFloat(b.total_cost) || 0),
                0
              )
            : 0;

          return {
            ...user,
            stats: {
              total_bookings: bookingCount || 0,
              total_spent: Math.round(totalSpent * 100) / 100,
            },
          };
        })
      );

      return {
        users: usersWithStats,
        total: count || 0,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get users error:", error);
      throw new AppError("Failed to retrieve users", 500);
    }
  }

  /**
   * Get bike usage analytics
   *
   * @param {Object} filters - Analytics filters
   * @returns {Promise<Object>} Bike usage data
   */
  async getBikeUsageAnalytics(filters) {
    try {
      // Calculate date range
      const now = new Date();
      let startDate;

      switch (filters.period) {
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Get bike usage data with SQL aggregation
      const { data: bikeUsage, error } = await supabaseAdmin.rpc(
        "get_bike_usage_stats",
        {
          start_date: startDate.toISOString(),
          end_date: now.toISOString(),
          limit_count: filters.limit,
        }
      );

      if (error && !error.message.includes("function")) {
        // Fallback if custom function doesn't exist
        return await this.getBikeUsageFallback(startDate, now, filters.limit);
      }

      return {
        period: filters.period,
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
        bikes: bikeUsage || [],
      };
    } catch (error) {
      console.error("Get bike usage analytics error:", error);
      throw new AppError("Failed to retrieve bike usage analytics", 500);
    }
  }

  /**
   * Export bookings data
   *
   * @param {Object} filters - Export filters
   * @returns {Promise<string|Array>} CSV string or JSON array
   */
  async exportBookings(filters) {
    try {
      let query = supabaseAdmin.from("bookings").select(`
          booking_id,
          created_at,
          start_time,
          end_time,
          status,
          total_cost,
          notes,
          bikes (
            model, brand, price_per_hour
          ),
          user_profiles!bookings_user_id_fkey (
            name
          )
        `);

      if (filters.start_date) {
        query = query.gte("created_at", filters.start_date);
      }

      if (filters.end_date) {
        query = query.lte("created_at", filters.end_date);
      }

      query = query.order("created_at", { ascending: false });

      const { data: bookings, error } = await query;

      if (error) {
        console.error("Export bookings error:", error);
        throw new AppError("Failed to export bookings", 500);
      }

      if (filters.format === "csv") {
        return this.convertToCSV(bookings);
      }

      return bookings || [];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Export bookings error:", error);
      throw new AppError("Failed to export bookings", 500);
    }
  }

  // Helper methods

  /**
   * Group revenue data by time period
   */
  groupRevenueByPeriod(data, groupBy) {
    const groups = {};

    data.forEach((booking) => {
      const date = new Date(booking.created_at);
      let key;

      switch (groupBy) {
        case "day":
          key = date.toISOString().split("T")[0];
          break;
        case "week":
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split("T")[0];
          break;
        case "month":
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
            2,
            "0"
          )}`;
          break;
        default:
          key = date.toISOString().split("T")[0];
      }

      if (!groups[key]) {
        groups[key] = { revenue: 0, bookings: 0 };
      }

      groups[key].revenue += parseFloat(booking.total_cost);
      groups[key].bookings += 1;
    });

    return Object.entries(groups)
      .map(([date, stats]) => ({
        date,
        revenue: Math.round(stats.revenue * 100) / 100,
        bookings: stats.bookings,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get period comparison data
   */
  async getPeriodComparison(currentStart, currentEnd, period) {
    try {
      const duration = currentEnd.getTime() - currentStart.getTime();
      const previousStart = new Date(currentStart.getTime() - duration);
      const previousEnd = new Date(currentStart.getTime());

      const [current, previous] = await Promise.all([
        this.getRevenueForPeriod(currentStart, currentEnd),
        this.getRevenueForPeriod(previousStart, previousEnd),
      ]);

      const revenueChange = current.revenue - previous.revenue;
      const bookingsChange = current.bookings - previous.bookings;

      return {
        current,
        previous,
        changes: {
          revenue: revenueChange,
          revenue_percentage:
            previous.revenue > 0 ? (revenueChange / previous.revenue) * 100 : 0,
          bookings: bookingsChange,
          bookings_percentage:
            previous.bookings > 0
              ? (bookingsChange / previous.bookings) * 100
              : 0,
        },
      };
    } catch (error) {
      console.error("Get period comparison error:", error);
      return null;
    }
  }

  /**
   * Get revenue for specific period
   */
  async getRevenueForPeriod(startDate, endDate) {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("total_cost")
      .eq("status", "completed")
      .gte("created_at", startDate.toISOString())
      .lte("created_at", endDate.toISOString())
      .not("total_cost", "is", null);

    if (error) {
      throw error;
    }

    const revenue = data
      ? data.reduce((sum, b) => sum + parseFloat(b.total_cost), 0)
      : 0;
    const bookings = data ? data.length : 0;

    return { revenue, bookings };
  }

  /**
   * Convert bookings data to CSV format
   */
  convertToCSV(bookings) {
    const headers = [
      "Booking ID",
      "User Name",
      "Bike Model",
      "Bike Brand",
      "Start Time",
      "End Time",
      "Status",
      "Total Cost",
      "Created At",
    ];

    const csvRows = [headers.join(",")];

    bookings.forEach((booking) => {
      const row = [
        booking.booking_id,
        booking.user_profiles?.name || "N/A",
        booking.bikes?.model || "N/A",
        booking.bikes?.brand || "N/A",
        booking.start_time,
        booking.end_time || "N/A",
        booking.status,
        booking.total_cost || "N/A",
        booking.created_at,
      ];

      csvRows.push(row.join(","));
    });

    return csvRows.join("\n");
  }

  /**
   * Fallback method for bike usage when custom SQL function is not available
   */
  async getBikeUsageFallback(startDate, endDate, limit) {
    // Implementation would go here for manual aggregation
    return {
      period: "month",
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      bikes: [],
    };
  }

  /**
   * Get bike statistics
   */
  async getBikeStats() {
    const { count: available } = await supabaseAdmin
      .from("bikes")
      .select("*", { count: "exact", head: true })
      .eq("is_available", true);

    const { count: unavailable } = await supabaseAdmin
      .from("bikes")
      .select("*", { count: "exact", head: true })
      .eq("is_available", false);

    return {
      total: (available || 0) + (unavailable || 0),
      available: available || 0,
      unavailable: unavailable || 0,
    };
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const { count: customers } = await supabaseAdmin
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "customer");

    const { count: admins } = await supabaseAdmin
      .from("user_profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");

    return {
      total: (customers || 0) + (admins || 0),
      customers: customers || 0,
      admins: admins || 0,
    };
  }

  /**
   * Get revenue statistics
   */
  async getRevenueStats() {
    const { data: revenueData } = await supabaseAdmin
      .from("bookings")
      .select("total_cost")
      .eq("status", "completed")
      .not("total_cost", "is", null);

    const totalRevenue = revenueData
      ? revenueData.reduce((sum, b) => sum + parseFloat(b.total_cost), 0)
      : 0;

    return {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      completed_bookings: revenueData ? revenueData.length : 0,
    };
  }
}

module.exports = new AdminService();
