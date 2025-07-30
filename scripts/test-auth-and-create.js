const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: "../.env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase URL or Anon Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuthAndCreate() {
  console.log("Testing authentication and project creation...\n");

  try {
    // Check current auth session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return;
    }

    if (!session) {
      console.log("No active session. Please sign in first.");
      return;
    }

    console.log("Current session:", {
      user_id: session.user.id,
      email: session.user.email,
      provider: session.user.app_metadata?.provider,
    });

    // Try to create a test project
    console.log("\nAttempting to create a test project...");

    const projectData = {
      user_id: session.user.id,
      name: "Test Project",
      domain: "https://test.example.com",
      embed_token: crypto.randomUUID(),
    };

    console.log("Project data:", projectData);

    const { data, error } = await supabase
      .from("projects")
      .insert(projectData)
      .select();

    if (error) {
      console.error("\nError creating project:");
      console.error("Message:", error.message);
      console.error("Details:", error.details);
      console.error("Hint:", error.hint);
      console.error("Code:", error.code);
      console.error("Full error:", JSON.stringify(error, null, 2));
    } else {
      console.log("\nProject created successfully:", data);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

testAuthAndCreate();
