const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testPasswordAuth() {
  console.log("Testing password authentication with test user...\n");

  try {
    // Sign in with password
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "test@activeset.co",
        password: "testpassword123",
      });

    if (authError) {
      console.error("❌ Authentication failed:", authError);
      return;
    }

    console.log("✅ Authentication successful!");
    console.log("User ID:", authData.user.id);
    console.log("Email:", authData.user.email);
    console.log("Session:", authData.session ? "Active" : "None");

    // Test creating a project
    console.log("\nTesting project creation...");

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: "Test Project from Script",
        domain: "https://test.example.com",
      })
      .select()
      .single();

    if (projectError) {
      console.error("❌ Project creation failed:", projectError);
    } else {
      console.log("✅ Project created successfully!");
      console.log("Project ID:", project.id);
      console.log("Project Name:", project.name);
      console.log("API Key:", project.api_key);

      // Clean up - delete the test project
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (!deleteError) {
        console.log("\n✅ Test project cleaned up");
      }
    }

    // Sign out
    await supabase.auth.signOut();
    console.log("\n✅ Signed out successfully");
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

// Run the test
testPasswordAuth();
