"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase-client"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface CreateProjectDialogProps {
  userId: string
}

export function CreateProjectDialog({ userId }: CreateProjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    domain: "",
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!formData.name || !formData.domain) {
      toast.error("Please fill in all fields")
      return
    }

    setLoading(true)

    try {
      // Generate a secure random token
      const embedToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '')
      const supabase = createClient()
      
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        console.error("No valid session found:", sessionError)
        toast.error("Your session has expired. Please sign in again.")
        router.push("/login")
        return
      }
      
      console.log("Creating project with data:", {
        user_id: userId,
        name: formData.name,
        domain: formData.domain,
        embed_token: embedToken,
      })
      
      const { data, error } = await supabase.from("projects").insert({
        user_id: userId,
        name: formData.name,
        domain: formData.domain,
        embed_token: embedToken,
      }).select()

      if (error) {
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        })
        throw error
      }

      console.log("Project created successfully:", data)
      toast.success("Project created successfully")
      setFormData({ name: "", domain: "" })
      setOpen(false)
      
      // Refresh the page to show the new project
      window.location.reload()
    } catch (error: any) {
      console.error("Error creating project:", error)
      
      // Extract error message with better error handling
      let errorMessage = "Failed to create project"
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.hint) {
        errorMessage = error.hint
      } else if (error?.code === 'PGRST301') {
        errorMessage = "Authentication required. Please sign in first."
        router.push("/login")
      } else if (error?.code === '23503') {
        errorMessage = "Database error: Invalid user reference. Please sign in again."
        router.push("/login")
      } else if (error?.code === '42501') {
        errorMessage = "Permission denied. Please check your database permissions."
      } else if (error?.code) {
        errorMessage = `Database error: ${error.code}`
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object') {
        // Try to stringify the error object for debugging
        try {
          const errorStr = JSON.stringify(error, null, 2)
          console.error("Full error object:", errorStr)
          errorMessage = errorStr.length > 100 ? "Unknown error occurred (check console)" : errorStr
        } catch {
          errorMessage = "Unknown error occurred"
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new project</DialogTitle>
            <DialogDescription>
              Add a new website to monitor with QA Detector
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                placeholder="My Website"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                type="url"
                placeholder="https://example.com"
                value={formData.domain}
                onChange={(e) =>
                  setFormData({ ...formData, domain: e.target.value })
                }
                required
              />
              <p className="text-sm text-muted-foreground">
                The domain where the QA widget will be embedded
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
