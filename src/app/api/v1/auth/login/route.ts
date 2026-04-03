import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

  // New user — sign up
  if (signInError?.message.includes('Invalid login credentials')) {
    const admin = getAdminClient()

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
    })

    if (signUpError) {
      return NextResponse.json({ error: 'AUTH_FAILED', message: signUpError.message }, { status: 400 })
    }

    if (signUpData.user) {
      // Create profile using service role (bypasses RLS)
      await admin.from('profiles').upsert({
        id: signUpData.user.id,
        phone: null,
        updated_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, userType: null })
  }

  return NextResponse.json({ error: 'AUTH_FAILED', message: signInError?.message }, { status: 400 })
}
