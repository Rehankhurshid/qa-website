import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if we have a session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Allow public routes
  const isPublicRoute = 
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname.startsWith('/api/auth/callback') ||
    request.nextUrl.pathname.startsWith('/api/verify-token') ||
    request.nextUrl.pathname.startsWith('/api/scan') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname === '/favicon.ico'

  // If no user and trying to access protected route, redirect to login
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If user exists, check email domain for protected routes
  if (user && !isPublicRoute) {
    const email = user.email
    if (email && !email.endsWith('@activeset.co')) {
      // Sign out the user
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/login?error=access_denied', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
