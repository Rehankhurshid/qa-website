const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

async function testConnection() {
  console.log("Testing Supabase connection...");
  console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Key exists:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Test query to check if tables exist
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("*")
      .limit(1);

    if (usersError) {
      console.error("Error querying users table:", usersError);
    } else {
      console.log("✓ Users table accessible");
    }

    const { data: accounts, error: accountsError } = await supabase
      .from("accounts")
      .select("*")
      .limit(1);

    if (accountsError) {
      console.error("Error querying accounts table:", accountsError);
    } else {
      console.log("✓ Accounts table accessible");
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .limit(1);

    if (sessionsError) {
      console.error("Error querying sessions table:", sessionsError);
    } else {
      console.log("✓ Sessions table accessible");
    }
  } catch (error) {
    console.error("Connection error:", error);
  }
}

testConnection();
