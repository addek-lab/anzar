import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireJson } from '@/lib/api-guard'

const schema = z.object({
  // ✅ SECURITY: Re-validate phone format server-side.
  // Never trust a value that came from sessionStorage — it can be tampered with.
  phone: z.string().regex(/^\+212[5-7]\d{8}$/, 'Numéro invalide'),
  token: z.string().length(6).regex(/^\d{6}$/, 'Code invalide'),
})

export async function POST(req: NextRequest) {
  // Content-Type guard
  const ctError = requireJson(req)
  if (ctError) return ctError

  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', message: 'Données invalides' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    phone: parsed.data.phone,
    token: parsed.data.token,
    type: 'sms',
  })

  if (error) {
    const isUserError =
      error.message.includes('expired') || error.message.includes('invalid')
    return NextResponse.json(
      { error: 'OTP_INVALID', message: 'Code incorrect ou expiré' },
      // 400 for wrong code, 500 for unexpected Supabase error
      { status: isUserError ? 400 : 500 }
    )
  }

  if (!data.user) {
    return NextResponse.json({ error: 'AUTH_FAILED' }, { status: 500 })
  }

  // Fetch profile to determine where to send the user
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', data.user.id)
    .single()

  const userType = profile?.user_type ?? null

  // ✅ SECURITY: For returning users, ensure app_metadata.role is synced.
  // This backfills users who registered before app_metadata was introduced,
  // so the middleware can enforce role-based routing for them too.
  if (userType && userType !== 'admin') {
    const existingRole = data.user.app_metadata?.role as string | undefined
    if (existingRole !== userType) {
      const admin = createAdminSupabase(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )
      await admin.auth.admin
        .updateUserById(data.user.id, {
          app_metadata: { role: userType },
        })
        .catch((e) =>
          console.error('[verify-otp] app_metadata backfill failed:', e)
        )
    }
  }

  return NextResponse.json({ success: true, userType })
}
