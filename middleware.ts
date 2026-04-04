import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() validates the JWT server-side — never trust getSession() alone
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── 1. Unauthenticated users: allow only public routes ─────────────────────
  const isAuthRoute = pathname.startsWith('/auth')
  const isPublicPage = pathname === '/'
  const isApiAuth = pathname.startsWith('/api/v1/auth')
  const isStaticAsset = pathname.startsWith('/api/v1/categories') ||
    pathname.startsWith('/api/v1/cities') ||
    pathname.startsWith('/api/v1/neighborhoods')
  const isPublicDirectory = pathname.startsWith('/artisans') || pathname.startsWith('/demande')
  const isPublicApi = pathname.startsWith('/api/v1/public/')

  if (!user && !isAuthRoute && !isPublicPage && !isApiAuth && !isStaticAsset && !isPublicDirectory && !isPublicApi) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // ── 2. Authenticated users: enforce role-based routing ────────────────────
  if (user) {
    // Role is stored in app_metadata so we never need an extra DB call here.
    // Falls back to 'unknown' — layouts will do a DB check for legacy users.
    const role = (user.app_metadata?.role as string | undefined) ?? 'unknown'

    // Redirect logged-in user away from auth pages to the right dashboard
    if (isAuthRoute) {
      const dest = roleDashboard(role)
      return NextResponse.redirect(new URL(dest, request.url))
    }

    // /admin/* — only admins allowed
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/v1/admin')) {
      if (role !== 'admin' && role !== 'unknown') {
        // Known non-admin: hard 403 for API, redirect for pages
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
        }
        return NextResponse.redirect(new URL(roleDashboard(role), request.url))
      }
    }

    // /pro/* — only providers allowed
    if (pathname.startsWith('/pro') && !pathname.startsWith('/api/')) {
      if (role !== 'provider' && role !== 'unknown') {
        return NextResponse.redirect(new URL(roleDashboard(role), request.url))
      }
    }

    // /app/* — only customers allowed
    if (pathname.startsWith('/app') && !pathname.startsWith('/api/')) {
      if (role !== 'customer' && role !== 'unknown') {
        return NextResponse.redirect(new URL(roleDashboard(role), request.url))
      }
    }
  }

  return supabaseResponse
}

function roleDashboard(role: string): string {
  if (role === 'admin') return '/admin'
  if (role === 'provider') return '/pro'
  return '/app' // customer + unknown both land here
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
