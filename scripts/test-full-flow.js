const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testFullFlow() {
  console.log("Testing full authentication and project creation flow...\n");

  try {
    // 1. Sign in with test user
    console.log("1. Signing in with test user...");
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: "admin@activeset.co",
        password: "adminpassword123",
      });

    if (authError) {
      console.error("Authentication failed:", authError.message);
      return;
    }

    console.log("✅ Successfully authenticated");
    console.log("User ID:", authData.user.id);
    console.log("Email:", authData.user.email);

    // 2. Check if user exists in public.users
    console.log("\n2. Checking if user exists in public.users table...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single();

    if (userError) {
      console.error("❌ User not found in public.users:", userError.message);
    } else {
      console.log("✅ User found in public.users:", userData);
    }

    // 3. Try to create a project
    console.log("\\n3. Creating a test project...");
    const projectData = {
      name: "Test Project",
      domain: "example.com",
      user_id: authData.user.id,
    };

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert([projectData])
      .select()
      .single();

    if (projectError) {
      console.error("❌ Failed to create project:", projectError.message);
      console.error("Error details:", projectError);
    } else {
      console.log("✅ Successfully created project:", project);
    }

    // 4. List all projects for the user
    console.log("\n4. Listing all projects for user...");
    const { data: projects, error: listError } = await supabase
      .from("projects")
      .select("*")
      .eq("user_id", authData.user.id);

    if (listError) {
      console.error("❌ Failed to list projects:", listError.message);
    } else {
      console.log(`✅ Found ${projects.length} projects:`, projects);
    }

    // 5. Sign out
    console.log("\n5. Signing out...");
    await supabase.auth.signOut();
    console.log("✅ Signed out successfully");
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

testFullFlow();
