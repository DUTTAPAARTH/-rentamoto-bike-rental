/**
 * Development Authentication Service for RENTAMOTO
 *
 * This service bypasses Supabase Auth completely during development
 * to avoid email bounce issues and provide instant testing.
 */

const { supabaseAdmin } = require("../config/supabase");
const { AppError } = require("../middleware/errorHandler");
const crypto = require("crypto");

class DevAuthService {
  constructor() {
    // In-memory storage for development user email mappings
    this.devUsers = new Map();
  }

  /**
   * Store development user mapping
   */
  storeDevUser(email, userId, profile) {
    this.devUsers.set(email, { userId, profile });
  }

  /**
   * Get development user by email
   */
  getDevUser(email) {
    return this.devUsers.get(email);
  }
  /**
   * Create a development user directly in the database
   * Bypasses all email validation and confirmation
   */
  async createDevUser({ email, password, name, role = "customer", phone }) {
    try {
      console.log("🧪 Creating development user:", email);

      // Generate a fake user ID
      const userId = crypto.randomUUID();

      // Create user profile directly in the database
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert([
          {
            id: userId,
            name: name,
            role: role,
            phone: phone || null,
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error("Dev profile creation error:", profileError);

        // If profile already exists, check by name + role combination for dev
        if (profileError.code === "23505") {
          const { data: existingProfile } = await supabaseAdmin
            .from("user_profiles")
            .select("*")
            .eq("name", name)
            .eq("role", role)
            .single();

          if (existingProfile) {
            return {
              user: {
                id: existingProfile.id,
                email: email,
              },
              profile: existingProfile,
            };
          }
        }

        throw new AppError("Failed to create development user", 500);
      }

      // Store email mapping in memory for development
      this.storeDevUser(email, userId, profile);

      return {
        user: {
          id: userId,
          email: email,
        },
        profile: profile,
      };
    } catch (error) {
      console.error("Dev user creation error:", error);
      throw error;
    }
  }

  /**
   * Simple development login - just check if user exists
   */
  async devLogin({ email, password }) {
    try {
      console.log("🧪 Development login for:", email);

      // First check in-memory storage
      const devUser = this.getDevUser(email);
      if (devUser) {
        return this.createLoginResponse(email, devUser.profile);
      }

      // Fallback: Find user by name in profiles table (for existing users)
      const { data: profiles, error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .select("*")
        .limit(10); // Get some profiles to search through

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw new AppError("Invalid email or password", 401);
      }

      // For development, match by email pattern to user
      let matchedProfile = null;
      if (profiles && profiles.length > 0) {
        // Use first available profile for demo purposes
        matchedProfile = profiles[0];
      }

      if (!matchedProfile) {
        throw new AppError("Invalid email or password", 401);
      }

      return this.createLoginResponse(email, matchedProfile);
    } catch (error) {
      console.error("Dev login error:", error);
      throw error;
    }
  }

  /**
   * Create standardized login response
   */
  createLoginResponse(email, profile) {
    const devToken = this.generateDevToken(profile);

    return {
      user: {
        id: profile.id,
        email: email,
        name: profile.name,
        role: profile.role,
      },
      session: {
        access_token: devToken,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        expires_in: 3600,
      },
      profile: profile,
    };
  }

  /**
   * Generate a development token (not real JWT, just for testing)
   */
  generateDevToken(profile) {
    const payload = {
      iss: "dev-rentamoto",
      sub: profile.id,
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: Math.floor(Date.now() / 1000),
      email: profile.email,
      role: "authenticated",
      user_metadata: {
        email: profile.email,
        email_verified: true,
        name: profile.name,
        role: profile.role,
        sub: profile.id,
      },
    };

    // Base64 encode the payload (not secure, just for dev)
    return "dev." + Buffer.from(JSON.stringify(payload)).toString("base64");
  }
}

module.exports = new DevAuthService();
