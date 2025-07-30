const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use service role key for admin operations
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createTestUser() {
  console.log("Creating test user with admin privileges...\n");

  try {
    // Create a new user using the admin API
    const { data: authUser, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email: "admin@activeset.co",
        password: "adminpassword123",
        email_confirm: true,
        user_metadata: {
          name: "Admin User",
        },
      });

    if (authError) {
      console.error("Failed to create auth user:", authError.message);
      return;
    }

    console.log("✅ Successfully created auth user");
    console.log("User ID:", authUser.user.id);
    console.log("Email:", authUser.user.email);

    // The trigger should automatically create the user in public.users
    // Let's verify it exists
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second for trigger

    const { data: publicUser, error: publicError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authUser.user.id)
      .single();

    if (publicError) {
      console.error("❌ User not found in public.users:", publicError.message);
    } else {
      console.log("✅ User found in public.users:", publicUser);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

createTestUser();
