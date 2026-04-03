/**
 * Email + password login — DEVELOPMENT ONLY.
 *
 * This route exists so engineers can test the app locally without needing
 * a real Moroccan SIM card to receive OTP SMS messages.
 *
 * ✅ SECURITY: The route is completely disabled in production. Any request
 * in production receives a 404, making the endpoint invisible to scanners.
 */
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireJson } from '@/lib/api-guard'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

function getAdminClient() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  // ✅ SECURITY: Hard-disable in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })
  }

  const ctError = requireJson(req)
  if (ctError) return ctError

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })
  }

  const supabase = await createClient()

  // Try sign in first
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (!signInError && signInData.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', signInData.user.id)
      .single()

    return NextResponse.json({ success: true, userType: profile?.user_type ?? null })
  }

  // New dev user — auto sign-up
  if (signInError?.message.includes('Invalid login credentials')) {
    const admin = getAdminClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (signUpError || !signUpData.user) {
      return NextResponse.json({ error: 'AUTH_FAILED' }, { status: 400 })
    }

    await admin.from('profiles').upsert({
      id: signUpData.user.id,
      phone: null,
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, userType: null })
  }

  return NextResponse.json({ error: 'AUTH_FAILED' }, { status: 400 })
}
