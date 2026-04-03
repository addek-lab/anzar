import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireJson, safeError } from '@/lib/api-guard'

const schema = z.object({
  user_type: z.enum(['customer', 'provider']),
  full_name: z.string().min(2).max(100),
})

export async function POST(req: NextRequest) {
  // Content-Type guard
  const ctError = requireJson(req)
  if (ctError) return ctError

  // Verify bearer token — works regardless of cookies
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'No token' }, { status: 401 })
  }

  const admin = createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const {
    data: { user },
    error: authError,
  } = await admin.auth.getUser(token)

  if (authError || !user) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const { user_type, full_name } = parsed.data

  // 1. Upsert public profile (service role bypasses RLS)
  const { error: profileError } = await admin.from('profiles').upsert({
    id: user.id,
    user_type,
    full_name,
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    return safeError('PROFILE_FAILED', profileError.message)
  }

  // 2. Create role-specific sub-profile
  if (user_type === 'customer') {
    const { error: cpError } = await admin.from('customer_profiles').upsert({
      profile_id: user.id,
    })
    if (cpError) {
      return safeError('CUSTOMER_PROFILE_FAILED', cpError.message)
    }
  }

  // 3. ✅ SECURITY: Store role in JWT app_metadata so middleware can enforce
  //    role-based routing without a DB round-trip on every request.
  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { role: user_type },
  })

  if (metaError) {
    // Non-fatal — profile was saved, role will fall back to DB check
    console.error('[set-type] app_metadata sync failed:', metaError.message)
  }

  return NextResponse.json({ success: true, user_type })
}
