import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runMatchingEngine } from '@/lib/matching'

const schema = z.object({
  category_id:     z.string().min(1),
  city_id:         z.string().min(1),
  neighborhood_id: z.string().min(1).nullable().optional(),
  description:     z.string().min(20).max(2000),
  budget_text:     z.string().max(200).nullable().optional(),
  urgency:         z.enum(['urgent', 'soon', 'flexible']),
  email:           z.string().email(),
  full_name:       z.string().max(100).nullable().optional(),
})

/**
 * POST /api/v1/public/request
 *
 * Public endpoint — no auth required.
 * Creates (or finds) a customer account by email, then posts a service request.
 * Used by the /demande wizard (MyHammer-style flow).
 */
export async function POST(req: NextRequest) {
  // Validate content type
  if (!req.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'INVALID_CONTENT_TYPE' }, { status: 415 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'INVALID_JSON' }, { status: 400 })

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'INVALID_INPUT', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { email, full_name, ...requestData } = parsed.data

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // ── 1. Find or create user via magic link generation ─────────────────────
  // generateLink creates the user if they don't exist, returns existing if they do.
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    'https://anzar-teal.vercel.app'

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${appUrl}/app` },
  })

  if (linkError || !linkData?.user) {
    console.error('[public/request] generateLink error:', linkError?.message)
    return NextResponse.json({ error: 'USER_CREATE_FAILED' }, { status: 500 })
  }

  const userId = linkData.user.id
  const existingRole = linkData.user.app_metadata?.role as string | undefined

  // ── 2. Set role to customer (don't demote an existing provider/admin) ────
  if (!existingRole || existingRole === 'unknown') {
    await admin.auth.admin.updateUserById(userId, {
      app_metadata: { role: 'customer' },
    })
  }

  // ── 3. Upsert profile ─────────────────────────────────────────────────────
  const displayName = full_name?.trim() || email.split('@')[0]
  await admin.from('profiles').upsert(
    {
      id: userId,
      full_name: displayName,
      user_type: existingRole === 'provider' || existingRole === 'admin' ? existingRole : 'customer',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  )

  // ── 4. Ensure customer_profile row exists (skip for providers / admins) ───
  const effectiveRole = existingRole ?? 'customer'
  if (effectiveRole !== 'provider' && effectiveRole !== 'admin') {
    await admin
      .from('customer_profiles')
      .upsert({ profile_id: userId }, { onConflict: 'profile_id', ignoreDuplicates: true })
  }

  // ── 5. Create service request ──────────────────────────────────────────────
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (requestData.urgency === 'flexible' ? 60 : 30))

  const { data: request, error: reqError } = await admin
    .from('service_requests')
    .insert({
      customer_id:     userId,
      category_id:     requestData.category_id,
      city_id:         requestData.city_id,
      neighborhood_id: requestData.neighborhood_id ?? null,
      description:     requestData.description,
      budget_text:     requestData.budget_text ?? null,
      urgency:         requestData.urgency,
      status:          'open',
      expires_at:      expiresAt.toISOString(),
    })
    .select()
    .single()

  if (reqError) {
    console.error('[public/request] insert error:', reqError.message)
    return NextResponse.json({ error: reqError.message }, { status: 500 })
  }

  // ── 6. Run matching engine (non-blocking) ─────────────────────────────────
  runMatchingEngine(request.id).catch(console.error)

  // ── 7. Magic link is in linkData.properties.action_link ──────────────────
  // TODO: send via Resend once email Edge Function is deployed.
  // For now Supabase's built-in SMTP handles it if email confirmations are on.

  return NextResponse.json({ success: true, requestId: request.id }, { status: 201 })
}
