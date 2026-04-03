import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Use min(1) instead of .uuid() — seed data uses version-0 UUIDs (e.g. 00000000-0000-0000-0000-000000000001)
// which Zod v4's strict uuid() validator rejects. The DB FK constraints provide real validation.
const uuidLike = z.string().min(1)
const schema = z.object({
  full_name: z.string().min(2).max(100),
  business_name: z.string().max(100).optional().nullable(),
  bio_fr: z.string().min(5).max(1000),
  bio_ar: z.string().min(5).max(1000).optional().nullable(),
  city_id: uuidLike,
  neighborhood_ids: z.array(uuidLike).max(10).default([]),
  trade_ids: z.array(uuidLike).min(1).max(3),
  years_experience: z.number().int().min(0).max(60).default(0),
})

export async function POST(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const admin = createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: { user }, error: authError } = await admin.auth.getUser(token)
  if (authError || !user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors
    const first = Object.entries(fields).map(([k, v]) => `${k}: ${v?.[0]}`).join(', ')
    return NextResponse.json({ error: 'INVALID_INPUT', message: first }, { status: 400 })
  }

  const slugBase = parsed.data.full_name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const slug = `${slugBase}-${Math.random().toString(36).slice(2, 7)}`

  await admin.from('profiles').update({
    full_name: parsed.data.full_name,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id)

  const { data: providerProfile, error } = await admin
    .from('provider_profiles')
    .upsert({
      profile_id: user.id,
      slug,
      business_name: parsed.data.business_name ?? null,
      bio_fr: parsed.data.bio_fr,
      bio_ar: parsed.data.bio_ar ?? null,
      city_id: parsed.data.city_id,
      neighborhood_ids: parsed.data.neighborhood_ids,
      trade_ids: parsed.data.trade_ids,
      years_experience: parsed.data.years_experience,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'profile_id' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(providerProfile, { status: 201 })
}
