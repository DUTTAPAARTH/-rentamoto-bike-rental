/**
 * Authentication Service for RENTAMOTO
 *
 * Handles user authentication operations using Supabase Auth.
 * Manages user registration, login, logout, and profile operations.
 */

const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const devAuthService = require("./devAuthService");

// Check if we should use development mode to avoid email bounces
const USE_DEV_MODE =
  process.env.NODE_ENV === "development" &&
  (process.env.SKIP_EMAIL_CONFIRMATION === "true" ||
    process.env.USE_FAKE_EMAILS === "true");

class AuthService {
  /**
   * Register a new user with Supabase Auth and create profile
   *
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   * @param {string} userData.name - User full name
   * @param {string} userData.role - User role (admin/customer)
   * @param {string} userData.phone - User phone number (optional)
   * @returns {Promise<Object>} Created user and profile data
   */
  async signUp({ email, password, name, role = "customer", phone }) {
    try {
      console.log("📧 Attempting signup with email:", email);

      // Use development mode to avoid Supabase email bounce issues
      if (USE_DEV_MODE) {
        console.log("🧪 Using development authentication mode");
        return await devAuthService.createDevUser({
          email,
          password,
          name,
          role,
          phone,
        });
      }

      console.log(
        "📧 Email validation - length:",
        email.length,
        "includes @:",
        email.includes("@")
      );

      // Create user with Supabase Auth
      const { data, error } = await supabaseAdmin.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation for dev
          data: {
            name,
            role,
            phone,
          },
        },
      });

      console.log("🔍 Supabase signup response:", {
        data: !!data,
        error: error?.message,
      });

      if (error) {
        console.error("🚫 Supabase signup error:", error);
        // Handle user already exists error
        if (
          error.message.includes("already been registered") ||
          error.message.includes("already registered")
        ) {
          throw new AppError("User with this email already exists", 409);
        }
        throw new AppError(error.message, 400);
      }

      if (!data.user) {
        throw new AppError("Failed to create user", 500);
      }

      // Auto-confirm user for development (bypass email confirmation)
      if (process.env.NODE_ENV === "development") {
        const { error: confirmError } =
          await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            email_confirm: true,
          });

        if (confirmError) {
          console.warn("Failed to auto-confirm user:", confirmError.message);
        } else {
          console.log("✅ Auto-confirmed user for development");
        }
      }

      // Create user profile manually (bypass RLS policy issues)
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert([
          {
            id: data.user.id,
            name: name,
            role: role,
            phone: phone || null,
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // If profile already exists, fetch it instead of failing
        if (profileError.code === "23505") {
          // duplicate key error
          const { data: existingProfile, error: fetchError } =
            await supabaseAdmin
              .from("user_profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

          if (fetchError) {
            throw new AppError("Failed to create or fetch user profile", 500);
          }

          return {
            user: {
              id: data.user.id,
              email: data.user.email,
              email_confirmed_at: data.user.email_confirmed_at,
            },
            profile: existingProfile,
          };
        }
        throw new AppError("Failed to create user profile", 500);
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
        },
        profile: profile || { name, role, phone },
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      // Handle specific Supabase errors
      if (error.message.includes("already registered")) {
        throw new AppError("User with this email already exists", 409);
      }

      console.error("SignUp error:", error);
      throw new AppError("Failed to create user account", 500);
    }
  }

  /**
   * Authenticate user with email and password
   *
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} User, session, and profile data
   */
  async signIn({ email, password }) {
    try {
      // Use development mode to avoid Supabase email bounce issues
      if (USE_DEV_MODE) {
        console.log("🧪 Using development authentication mode for login");
        return await devAuthService.devLogin({ email, password });
      }

      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new AppError(error.message, 401);
      }

      if (!data.user || !data.session) {
        throw new AppError("Authentication failed", 401);
      }

      // Fetch user profile using admin client to bypass RLS issues
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        // Create minimal profile if fetch fails
        const fallbackProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.name || "User",
          role: data.user.user_metadata?.role || "customer",
          phone: data.user.user_metadata?.phone || null,
        };
        console.log("Using fallback profile:", fallbackProfile);

        return {
          user: {
            id: data.user.id,
            email: data.user.email,
            email_confirmed_at: data.user.email_confirmed_at,
          },
          session: data.session,
          profile: fallbackProfile,
        };
      }

      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
        },
        session: data.session,
        profile,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("SignIn error:", error);
      throw new AppError("Authentication failed", 401);
    }
  }

  /**
   * Sign out user and invalidate session
   *
   * @param {string} accessToken - User's access token
   * @returns {Promise<void>}
   */
  async signOut(accessToken) {
    try {
      const { error } = await supabaseAdmin.auth.signOut(accessToken);

      if (error) {
        console.error("SignOut error:", error);
        // Don't throw error for logout, just log it
      }
    } catch (error) {
      console.error("SignOut error:", error);
      // Don't throw error for logout
    }
  }

  /**
   * Refresh user's access token
   *
   * @param {string} refreshToken - User's refresh token
   * @returns {Promise<Object>} New session data
   */
  async refreshToken(refreshToken) {
    try {
      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) {
        throw new AppError(error.message, 401);
      }

      if (!data.session) {
        throw new AppError("Failed to refresh token", 401);
      }

      return data;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Refresh token error:", error);
      throw new AppError("Failed to refresh token", 401);
    }
  }

  /**
   * Get user profile by ID
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(userId) {
    try {
      const { data: profile, error } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Get profile error:", error);
        throw new AppError("Failed to fetch user profile", 500);
      }

      if (!profile) {
        throw new AppError("User profile not found", 404);
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Get profile error:", error);
      throw new AppError("Failed to fetch user profile", 500);
    }
  }

  /**
   * Update user profile
   *
   * @param {string} userId - User ID
   * @param {Object} updates - Profile updates
   * @returns {Promise<Object>} Updated profile data
   */
  async updateUserProfile(userId, updates) {
    try {
      // Remove fields that shouldn't be updated directly
      const { id, created_at, ...allowedUpdates } = updates;

      const { data: profile, error } = await supabaseAdmin
        .from("user_profiles")
        .update({
          ...allowedUpdates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Update profile error:", error);
        throw new AppError("Failed to update user profile", 500);
      }

      return profile;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Update profile error:", error);
      throw new AppError("Failed to update user profile", 500);
    }
  }

  /**
   * Delete user account and all associated data
   *
   * @param {string} userId - User ID
   * @returns {Promise<void>}
   */
  async deleteUser(userId) {
    try {
      // Delete user from Supabase Auth (this will cascade to profile due to foreign key)
      const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (error) {
        console.error("Delete user error:", error);
        throw new AppError("Failed to delete user account", 500);
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error("Delete user error:", error);
      throw new AppError("Failed to delete user account", 500);
    }
  }
}

module.exports = new AuthService();
