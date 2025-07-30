import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createServerSupabaseClient()
    
    // Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if the user's email domain is @activeset.co
      const email = data.user.email
      if (email && !email.endsWith('@activeset.co')) {
        // Sign out the user if they don't have the correct email domain
        await supabase.auth.signOut()
        
        // Redirect to login with error
        return NextResponse.redirect(
          `${requestUrl.origin}/login?error=access_denied`
        )
      }
      
      // Create or update user in the public.users table
      try {
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            image: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
            emailVerified: data.user.email_confirmed_at ? new Date(data.user.email_confirmed_at) : null
          }, {
            onConflict: 'id'
          })
        
        if (upsertError) {
          console.error('Error upserting user:', upsertError)
          // Continue anyway - the user is authenticated, just might have issues with projects
        }
      } catch (err) {
        console.error('Unexpected error creating user record:', err)
      }
      
      // Valid user, redirect to the requested page
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
    
    // Error during code exchange
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_error`
    )
  }

  // No code present, redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`)
}
