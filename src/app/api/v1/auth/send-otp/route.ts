import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  phone: z.string().regex(/^\+212[5-7]\d{8}$/, 'Numéro invalide'),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_PHONE', message: 'Numéro de téléphone invalide' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.data.phone,
  })

  if (error) {
    if (error.message.includes('rate')) {
      return NextResponse.json(
        { error: 'RATE_LIMITED', message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
        { status: 429 }
      )
    }
    return NextResponse.json(
      { error: 'OTP_SEND_FAILED', message: error.message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
