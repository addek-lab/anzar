import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Demo login endpoint — only active in non-production environments.
 * Signs in with a seeded demo account and redirects to the right dashboard.
 *
 * GET /api/v1/auth/demo?role=customer   → /app
 * GET /api/v1/auth/demo?role=provider   → /pro
 */
export async function GET(req: NextRequest) {
  // Hard-disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const role = req.nextUrl.searchParams.get('role') ?? 'customer'
  const isProvider = role === 'provider'

  const email = isProvider
    ? '212661000001@demo.anzar.ma'   // Hassan Chakir — Électricien ⭐4.9
    : '212612000001@demo.anzar.ma'   // Karim Benali — Customer

  const destination = isProvider ? '/pro' : '/app'

  // Build response first so we can attach session cookies to it
  const response = NextResponse.redirect(new URL(destination, req.url))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: 'Demo1234!',
  })

  if (error) {
    console.error('[demo-login] signInWithPassword failed:', error.message)
    return NextResponse.redirect(new URL('/auth?error=demo_failed', req.url))
  }

  return response
}
