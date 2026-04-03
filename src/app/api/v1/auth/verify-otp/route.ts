import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  phone: z.string(),
  token: z.string().length(6),
})

export async function POST(req: NextRequest) {
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
    if (error.message.includes('expired') || error.message.includes('invalid')) {
      return NextResponse.json(
        { error: 'OTP_INVALID', message: 'Code incorrect ou expiré' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'VERIFY_FAILED', message: error.message },
      { status: 500 }
    )
  }

  // Check if profile exists
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', data.user.id)
      .single()

    return NextResponse.json({
      success: true,
      userType: profile?.user_type ?? null,
    })
  }

  return NextResponse.json({ success: true, userType: null })
}
