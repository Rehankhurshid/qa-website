require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getProjectTokens() {
  console.log("Fetching all projects and their embed tokens...\n");

  try {
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching projects:", error.message);
      return;
    }

    if (!projects || projects.length === 0) {
      console.log("No projects found. Please create a project first by:");
      console.log("1. Running: npm run dev");
      console.log("2. Visiting: http://localhost:3000");
      console.log("3. Signing in and creating a new project\n");
      return;
    }

    console.log(`Found ${projects.length} project(s):\n`);

    projects.forEach((project, index) => {
      console.log(`${index + 1}. ${project.name}`);
      console.log(`   Domain: ${project.domain}`);
      console.log(`   Token: ${project.embed_token}`);
      console.log(
        `   Created: ${new Date(project.created_at).toLocaleString()}`
      );
      console.log("");
    });

    console.log("\nTo use the widget, add this to your HTML:");
    console.log(
      `<script src="http://localhost:3000/widget.js" data-token="${projects[0].embed_token}"></script>`
    );
    console.log(
      "\nFor production, replace http://localhost:3000 with your production URL."
    );
  } catch (error) {
    console.error("❌ Unexpected error:", error);
  }
}

getProjectTokens();
