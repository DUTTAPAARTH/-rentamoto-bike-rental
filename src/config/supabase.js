/**
 * Supabase Client Configuration for RENTAMOTO
 *
 * Provides configured Supabase clients for different use cases:
 * - supabaseAdmin: Service role client for admin operations
 * - getSupabaseUser: Client with user context for RLS policies
 */

const { createClient } = require("@supabase/supabase-js");
const config = require("./config");

// Admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create a client with user context (for RLS)
function getSupabaseUser(accessToken) {
  return createClient(config.supabase.url, config.supabase.anonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Public client (anonymous access)
const supabasePublic = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

module.exports = {
  supabaseAdmin,
  getSupabaseUser,
  supabasePublic,
};
