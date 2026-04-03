import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireJson } from '@/lib/api-guard'

const schema = z.object({
  phone: z.string().regex(/^\+212[5-7]\d{8}$/, 'Numéro invalide'),
})

export async function POST(req: NextRequest) {
  const ctError = requireJson(req)
  if (ctError) return ctError

  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_PHONE', message: 'Numéro de téléphone invalide (+212 6/7 XX XX XX XX)' },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithOtp({
    phone: parsed.data.phone,
  })

  if (error) {
    if (error.message.includes('rate') || error.message.includes('quota')) {
      return NextResponse.json(
        { error: 'RATE_LIMITED', message: 'Trop de tentatives. Réessayez dans 15 minutes.' },
        { status: 429 }
      )
    }
    // ✅ SECURITY: Don't expose raw Supabase error text in production
    return NextResponse.json(
      { error: 'OTP_SEND_FAILED', message: 'Impossible d\'envoyer le code. Réessayez.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
