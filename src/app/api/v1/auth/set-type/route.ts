import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  user_type: z.enum(['customer', 'provider']),
  full_name: z.string().min(2).max(100),
})

export async function POST(req: NextRequest) {
  // Verify bearer token — works regardless of cookies
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: 'No token' }, { status: 401 })
  }

  const admin = createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error: authError } = await admin.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'UNAUTHORIZED', message: authError?.message ?? 'Invalid token' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', message: parsed.error.flatten() }, { status: 400 })
  }

  // Use service role — bypasses RLS entirely
  const { error: profileError } = await admin.from('profiles').upsert({
    id: user.id,
    user_type: parsed.data.user_type,
    full_name: parsed.data.full_name,
    updated_at: new Date().toISOString(),
  })

  if (profileError) {
    return NextResponse.json({ error: 'PROFILE_FAILED', message: profileError.message }, { status: 500 })
  }

  if (parsed.data.user_type === 'customer') {
    const { error: cpError } = await admin.from('customer_profiles').upsert({
      profile_id: user.id,
    })
    if (cpError) {
      return NextResponse.json({ error: 'CUSTOMER_PROFILE_FAILED', message: cpError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, user_type: parsed.data.user_type })
}
