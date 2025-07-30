import { createServerSupabaseClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"
import { Navbar } from "@/components/dashboard/navbar"
import { ProjectsList } from "@/components/dashboard/projects-list"
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog"

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
            <p className="text-muted-foreground mt-2">
              Create and manage your QA detector projects
            </p>
          </div>
          <CreateProjectDialog userId={user.id} />
        </div>
        
        <ProjectsList userId={user.id} />
      </main>
    </div>
  )
}
