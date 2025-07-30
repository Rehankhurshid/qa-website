import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import crypto from 'crypto'

// Add CORS headers to response
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  return response
}

export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 200 }))
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return corsHeaders(
        NextResponse.json({ error: 'Email is required' }, { status: 400 })
      )
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return corsHeaders(
        NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
      )
    }

    // Check if the email matches the authenticated user
    if (user.email !== email) {
      return corsHeaders(
        NextResponse.json({ error: 'Email mismatch' }, { status: 403 })
      )
    }

    // Generate a unique token for this project
    const token = crypto.randomBytes(32).toString('hex')
    
    // Get existing project or create one if it doesn't exist
    const { data: existingProject, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('name', 'Default Project')
      .single()

    let project;
    
    if (fetchError && fetchError.code === 'PGRST116') {
      // Project doesn't exist, create it
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: 'Default Project',
          domain: new URL(request.headers.get('referer') || 'http://localhost').hostname,
          token,
          settings: {
            accessibility_enabled: true,
            spelling_enabled: true,
            html_validation_enabled: true,
            notifications_enabled: true
          }
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating project:', createError)
        return corsHeaders(
          NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
        )
      }

      project = newProject
    } else if (existingProject) {
      // Update existing project with new token if needed
      if (!existingProject.token) {
        const { data: updatedProject, error: updateError } = await supabase
          .from('projects')
          .update({ token })
          .eq('id', existingProject.id)
          .select()
          .single()

        if (updateError) {
          console.error('Error updating project:', updateError)
          return corsHeaders(
            NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
          )
        }

        project = updatedProject
      } else {
        project = existingProject
      }
    } else {
      return corsHeaders(
        NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
      )
    }

    return corsHeaders(
      NextResponse.json({
        success: true,
        token: project.token,
        projectId: project.id
      })
    )
  } catch (error) {
    console.error('Error verifying token:', error)
    return corsHeaders(
      NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    )
  }
}
