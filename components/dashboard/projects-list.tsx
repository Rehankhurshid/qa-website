"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Code, ExternalLink, Trash, BarChart } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { ScanResults } from "./scan-results"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Project {
  id: string
  name: string
  domain: string
  embed_token: string
  created_at: string
}

interface ProjectsListProps {
  userId: string
}

export function ProjectsList({ userId }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

  useEffect(() => {
    fetchProjects()
  }, [userId])

  async function fetchProjects() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
      toast.error("Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  async function deleteProject(projectId: string) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId)

      if (error) throw error
      
      toast.success("Project deleted successfully")
      fetchProjects()
    } catch (error) {
      console.error("Error deleting project:", error)
      toast.error("Failed to delete project")
    }
  }

  function getEmbedScript(project: Project) {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    return `<script src="${baseUrl}/widget.js" data-token="${project.embed_token}"></script>`
  }

  function getEmbedInstructions(project: Project) {
    return `// Add this script to your website's HTML, preferably before the closing </body> tag
${getEmbedScript(project)}

// The widget will automatically:
// - Scan the page on first load for non-authenticated users
// - Show a manual trigger button for @activeset.co users
// - Track scan sessions to prevent repeated auto-scans`
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <p className="text-sm text-muted-foreground">
            Create your first project to start monitoring website quality
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {project.name}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteProject(project.id)}
                className="h-8 w-8"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription className="flex items-center gap-1">
              <ExternalLink className="h-3 w-3" />
              {project.domain}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Code className="mr-2 h-4 w-4" />
                    Get Embed Code
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Embed Code for {project.name}</DialogTitle>
                    <DialogDescription>
                      Add this script to your website to enable QA detection
                    </DialogDescription>
                  </DialogHeader>
                  <Tabs defaultValue="script" className="mt-4">
                    <TabsList>
                      <TabsTrigger value="script">Script Tag</TabsTrigger>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="script" className="mt-4">
                      <div className="relative">
                        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
                          <code className="text-sm">{getEmbedScript(project)}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            navigator.clipboard.writeText(getEmbedScript(project))
                            toast.success("Copied to clipboard")
                          }}
                        >
                          Copy
                        </Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="instructions" className="mt-4">
                      <div className="relative">
                        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto">
                          <code className="text-sm whitespace-pre-wrap">{getEmbedInstructions(project)}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            navigator.clipboard.writeText(getEmbedInstructions(project))
                            toast.success("Copied to clipboard")
                          }}
                        >
                          Copy All
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedProjectId(project.id)}
                  >
                    <BarChart className="mr-2 h-4 w-4" />
                    View Scans
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Scan Results for {project.name}</DialogTitle>
                    <DialogDescription>
                      Recent QA scan results for your website
                    </DialogDescription>
                  </DialogHeader>
                  {selectedProjectId && <ScanResults projectId={selectedProjectId} />}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
