import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase-server"

// Add CORS headers to response
function corsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  return response
}

export async function OPTIONS() {
  return corsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return corsHeaders(NextResponse.json({ authenticated: false }))
    }

    return corsHeaders(NextResponse.json({
      authenticated: true,
      email: user.email,
      name: user.user_metadata?.full_name || user.email?.split('@')[0],
    }))
  } catch (error) {
    console.error("Error checking auth:", error)
    return corsHeaders(NextResponse.json({ authenticated: false }))
  }
}
