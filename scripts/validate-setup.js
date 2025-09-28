/**
 * Setup Validation Script for RENTAMOTO
 *
 * This script helps validate your Supabase configuration
 * and provides guidance for setup.
 *
 * Usage: node scripts/validate-setup.js
 */

require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

async function validateSetup() {
  console.log("🔍 Validating RENTAMOTO setup...\n");

  // Check environment variables
  const requiredVars = [
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  const missingVars = [];
  const placeholderVars = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];

    if (!value) {
      missingVars.push(varName);
    } else if (
      value.includes("your_supabase") ||
      value.includes("your-project")
    ) {
      placeholderVars.push({ name: varName, value });
    }
  }

  // Report missing variables
  if (missingVars.length > 0) {
    console.log("❌ Missing Environment Variables:");
    missingVars.forEach((varName) => {
      console.log(`   - ${varName}`);
    });
    console.log();
  }

  // Report placeholder variables
  if (placeholderVars.length > 0) {
    console.log("📝 Placeholder Values Detected:");
    placeholderVars.forEach(({ name, value }) => {
      console.log(`   - ${name}: ${value}`);
    });
    console.log();
  }

  // If there are issues, show setup instructions
  if (missingVars.length > 0 || placeholderVars.length > 0) {
    console.log("🚀 Setup Instructions:");
    console.log("1. Create a Supabase project at https://supabase.com");
    console.log("2. Go to Settings > API in your Supabase dashboard");
    console.log("3. Copy your Project URL and API keys");
    console.log("4. Update your .env file with real values");
    console.log("\n📖 See SETUP.md for detailed instructions\n");
    return false;
  }

  // Test Supabase connection
  console.log("🔌 Testing Supabase connection...");

  try {
    // Test with anon key
    const anonClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY
    );

    const { error: anonError } = await anonClient
      .from("test")
      .select("*")
      .limit(1);

    if (
      anonError &&
      !anonError.message.includes('relation "test" does not exist')
    ) {
      console.log("⚠️  Anon key test failed:", anonError.message);
    } else {
      console.log("✅ Anon key connection successful");
    }

    // Test with service role key
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { error: adminError } = await adminClient
      .from("test")
      .select("*")
      .limit(1);

    if (
      adminError &&
      !adminError.message.includes('relation "test" does not exist')
    ) {
      console.log("⚠️  Service role key test failed:", adminError.message);
    } else {
      console.log("✅ Service role key connection successful");
    }
  } catch (error) {
    console.log("❌ Supabase connection failed:", error.message);

    if (error.message.includes("Invalid URL")) {
      console.log(
        "💡 Check your SUPABASE_URL format (should start with https://)"
      );
    }

    return false;
  }

  // Check if database tables exist
  console.log("\n📊 Checking database schema...");

  try {
    const adminClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check for main tables
    const tables = ["user_profiles", "bikes", "bookings"];
    const tableStatuses = {};

    for (const table of tables) {
      try {
        const { error } = await adminClient.from(table).select("*").limit(1);
        tableStatuses[table] = error ? "❌" : "✅";

        if (
          error &&
          !error.message.includes("relation") &&
          !error.message.includes("does not exist")
        ) {
          console.log(`   ${table}: ⚠️  ${error.message}`);
        }
      } catch (err) {
        tableStatuses[table] = "❌";
      }
    }

    console.log("\n📋 Database Tables:");
    Object.entries(tableStatuses).forEach(([table, status]) => {
      console.log(`   ${status} ${table}`);
    });

    const allTablesExist = Object.values(tableStatuses).every(
      (status) => status === "✅"
    );

    if (!allTablesExist) {
      console.log("\n🔧 Some tables are missing. Run the migration:");
      console.log("   npm run migrate");
      console.log(
        "\nOr manually execute the SQL files in your Supabase dashboard."
      );
    }
  } catch (error) {
    console.log("⚠️  Could not check database schema:", error.message);
  }

  console.log("\n🎉 Basic setup validation complete!");
  console.log("\n🚀 Next steps:");
  console.log("1. Run migration: npm run migrate");
  console.log("2. Start development: npm run dev");
  console.log("3. Test API: curl http://localhost:3000/health");

  return true;
}

// Run validation if called directly
if (require.main === module) {
  validateSetup().catch((error) => {
    console.error("\n💥 Validation failed:", error.message);
    process.exit(1);
  });
}

module.exports = { validateSetup };
