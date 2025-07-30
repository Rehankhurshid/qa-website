const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function testProjectCreation() {
  console.log("Testing Supabase project creation...\n");

  // Test with anon key (what the browser uses)
  const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

  // Test with service key (admin access)
  const supabaseService = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // First, let's check if we can read from the projects table
    console.log("1. Testing READ access to projects table...");
    const { data: readData, error: readError } = await supabaseAnon
      .from("projects")
      .select("*")
      .limit(1);

    if (readError) {
      console.error("❌ Read error:", readError);
    } else {
      console.log("✅ Read access successful");
    }

    // Check table structure first
    console.log("\n2. Checking table structure...");
    const { data: tableInfo, error: tableError } = await supabaseService
      .rpc("get_table_info", { table_name: "projects" })
      .single();

    if (tableError) {
      // Try a different approach
      const { data: columns, error: columnsError } = await supabaseService
        .from("projects")
        .select()
        .limit(0);

      console.log("✅ Table exists, columns can be inferred from empty select");
    } else {
      console.log("✅ Table info retrieved");
    }

    // Try to insert with anon key (simulating browser behavior)
    console.log("\n3. Testing INSERT with anon key...");
    // Generate a valid UUID for testing
    const testUserId = "550e8400-e29b-41d4-a716-446655440000"; // Valid UUID v4
    const testData = {
      user_id: testUserId,
      name: "Test Project",
      domain: "https://test.example.com",
      embed_token: "test-token-123",
    };

    const { data: insertData, error: insertError } = await supabaseAnon
      .from("projects")
      .insert(testData)
      .select();

    if (insertError) {
      console.error("❌ Insert error (anon key):", {
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint,
      });
    } else {
      console.log("✅ Insert successful with anon key:", insertData);

      // Clean up test data
      if (insertData && insertData[0]) {
        await supabaseService
          .from("projects")
          .delete()
          .eq("id", insertData[0].id);
        console.log("   Cleaned up test data");
      }
    }

    // Try with service key to see if it's a permission issue
    console.log("\n4. Testing INSERT with service key...");
    const { data: serviceInsertData, error: serviceInsertError } =
      await supabaseService.from("projects").insert(testData).select();

    if (serviceInsertError) {
      console.error("❌ Insert error (service key):", {
        message: serviceInsertError.message,
        code: serviceInsertError.code,
        details: serviceInsertError.details,
        hint: serviceInsertError.hint,
      });
    } else {
      console.log("✅ Insert successful with service key:", serviceInsertData);

      // Clean up test data
      if (serviceInsertData && serviceInsertData[0]) {
        await supabaseService
          .from("projects")
          .delete()
          .eq("id", serviceInsertData[0].id);
        console.log("   Cleaned up test data");
      }
    }

    // Check RLS policies
    console.log("\n5. Checking RLS policies...");
    // First check if RLS is enabled
    const { data: rlsStatus, error: rlsError } = await supabaseService
      .rpc("check_rls_enabled", { table_name: "projects" })
      .single();

    if (rlsError) {
      console.log(
        "⚠️  Cannot check RLS status directly, assuming it's enabled"
      );

      // Try to list policies using a different approach
      console.log("\n6. Testing authentication requirement...");
      // Create a client without auth
      const unauthClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });

      const { data: unauthRead, error: unauthError } = await unauthClient
        .from("projects")
        .select("*")
        .limit(1);

      if (unauthError) {
        console.log(
          "✅ RLS appears to be working - unauthenticated read blocked"
        );
      } else {
        console.log(
          "⚠️  RLS may not be properly configured - unauthenticated read succeeded"
        );
      }
    } else {
      console.log(`RLS enabled: ${rlsStatus?.enabled}`);
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
}

testProjectCreation();
