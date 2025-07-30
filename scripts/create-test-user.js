const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  console.log("Creating test user through Supabase Auth API...\n");

  try {
    // Create user with Admin API
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: "test@activeset.co",
        password: "testpassword123",
        email_confirm: true,
        user_metadata: {
          name: "Test User",
        },
      });

    if (authError) {
      console.error("❌ Failed to create auth user:", authError);
      return;
    }

    console.log("✅ Auth user created successfully!");
    console.log("User ID:", authData.user.id);
    console.log("Email:", authData.user.email);

    // Create corresponding user in public.users table
    const { data: publicUser, error: publicError } = await supabase
      .from("users")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        name: "Test User",
        '"emailVerified"': new Date().toISOString(),
      })
      .select()
      .single();

    if (publicError) {
      console.error("❌ Failed to create public user:", publicError);
      // Clean up auth user if public user creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return;
    }

    console.log("✅ Public user created successfully!");
    console.log("\nTest user credentials:");
    console.log("Email: test@activeset.co");
    console.log("Password: testpassword123");
    console.log("\nYou can now test authentication with these credentials.");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the script
createTestUser();
