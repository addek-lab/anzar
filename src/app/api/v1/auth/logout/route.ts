import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()

  // Invalidate the session on Supabase's side
  await supabase.auth.signOut()

  // ✅ SECURITY: Return a redirect to /auth and explicitly expire the auth
  // cookie so the browser doesn't cache a stale session. This matters because
  // signOut() alone modifies the cookie but some clients hold it in memory.
  const response = NextResponse.redirect(
    new URL('/auth', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
    { status: 302 }
  )

  // Belt-and-suspenders: explicitly clear the Supabase auth cookie
  // The cookie name follows Supabase's naming convention: sb-<project-ref>-auth-token
  response.cookies.set('sb-access-token', '', { maxAge: 0, path: '/' })
  response.cookies.set('sb-refresh-token', '', { maxAge: 0, path: '/' })

  return response
}
