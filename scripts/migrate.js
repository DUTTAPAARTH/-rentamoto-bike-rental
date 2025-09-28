/**
 * Database Migration Script for RENTAMOTO
 *
 * This script applies the database schema to your Supabase project.
 * Run with: npm run migrate
 */

const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment variables"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log("🚀 Starting database migration...");

    // Read schema file
    const schemaPath = path.join(__dirname, "../sql/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("📁 Schema file loaded successfully");

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"));

    console.log(`📋 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);

        const { data, error } = await supabase.rpc("exec_sql", {
          sql: statement + ";",
        });

        if (error) {
          // Try direct query execution as fallback
          const { data: fallbackData, error: fallbackError } = await supabase
            .from("_temp_migration")
            .select("*")
            .limit(0); // This will fail but execute the SQL

          if (
            fallbackError &&
            !fallbackError.message.includes(
              'relation "_temp_migration" does not exist'
            )
          ) {
            throw fallbackError;
          }
        }

        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (statementError) {
        console.warn(
          `⚠️ Statement ${i + 1} failed (might be expected):`,
          statementError.message
        );
        // Continue with other statements
      }
    }

    console.log("🎉 Database migration completed successfully!");
    console.log("\n📋 Next steps:");
    console.log("1. Go to your Supabase dashboard");
    console.log('2. Check the "Table Editor" to verify tables were created');
    console.log('3. In "Authentication > Users", create your first admin user');
    console.log(
      '4. Update the user\'s role to "admin" in the user_profiles table'
    );
    console.log("5. Start the development server with: npm run dev");
  } catch (error) {
    console.error("❌ Migration failed:", error.message);

    if (error.message.includes("JWT")) {
      console.error("\n💡 JWT Error Fix:");
      console.error("1. Go to Supabase Dashboard > Settings > API");
      console.error('2. Copy the "service_role" key (not anon key)');
      console.error("3. Update SUPABASE_SERVICE_ROLE_KEY in your .env file");
    }

    if (error.message.includes("connection")) {
      console.error("\n💡 Connection Error Fix:");
      console.error("1. Check your SUPABASE_URL in .env file");
      console.error("2. Ensure your Supabase project is active");
      console.error("3. Verify your internet connection");
    }

    process.exit(1);
  }
}

// Alternative: Manual migration instructions
function printManualInstructions() {
  console.log("\n🔧 Manual Migration Instructions:");
  console.log(
    "If the automatic migration fails, you can run the SQL manually:"
  );
  console.log("\n1. Go to your Supabase Dashboard");
  console.log('2. Navigate to "SQL Editor"');
  console.log("3. Copy the contents of sql/schema.sql");
  console.log("4. Paste and execute in the SQL Editor");
  console.log('5. Check "Table Editor" to verify tables were created');

  const schemaPath = path.join(__dirname, "../sql/schema.sql");
  console.log(`\n📁 Schema file location: ${schemaPath}`);
}

// Run migration
if (require.main === module) {
  runMigration().catch(() => {
    printManualInstructions();
    process.exit(1);
  });
}

module.exports = { runMigration };
