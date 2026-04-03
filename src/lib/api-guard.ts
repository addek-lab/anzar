/**
 * Shared API security helpers — import in every route handler.
 */
import { NextRequest, NextResponse } from 'next/server'

// ─── Content-Type guard ───────────────────────────────────────────────────────
/** Returns a 415 response if the request isn't JSON, or null if it's fine. */
export function requireJson(req: NextRequest): NextResponse | null {
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return NextResponse.json(
      { error: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content-Type must be application/json' },
      { status: 415 }
    )
  }
  return null
}

// ─── Safe error serialisation ─────────────────────────────────────────────────
/**
 * Never expose raw DB / Supabase error text to the client in production.
 * In dev, pass through the full message so it's easy to debug.
 */
export function safeError(
  code: string,
  internalMessage?: string,
  status = 500
): NextResponse {
  const body =
    process.env.NODE_ENV === 'production'
      ? { error: code }
      : { error: code, detail: internalMessage }
  return NextResponse.json(body, { status })
}

// ─── Admin-only guard ─────────────────────────────────────────────────────────
/**
 * Call this in admin API routes to double-check the caller is really an admin.
 * Uses app_metadata.role from the JWT — no extra DB round-trip.
 *
 * Returns the user object or a 401/403 NextResponse.
 */
import { createClient } from '@/lib/supabase/server'

export async function requireAdmin(
  _req: NextRequest
): Promise<{ user: import('@supabase/supabase-js').User } | NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const role = user.app_metadata?.role as string | undefined

  // Fast path: role in JWT
  if (role && role !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  // Slow-path fallback for users created before app_metadata was synced
  if (!role) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (profile?.user_type !== 'admin') {
      return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
    }
  }

  return { user }
}
