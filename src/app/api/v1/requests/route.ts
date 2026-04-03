import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { runMatchingEngine } from '@/lib/matching'

const createSchema = z.object({
  category_id: z.string().uuid(),
  city_id: z.string().uuid(),
  neighborhood_id: z.string().uuid().nullable().optional(),
  description: z.string().min(10).max(2000),
  budget_text: z.string().max(200).nullable().optional(),
  urgency: z.enum(['urgent', 'soon', 'flexible']),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 })
  }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (parsed.data.urgency === 'flexible' ? 60 : 30))

  const { data: request, error } = await supabase
    .from('service_requests')
    .insert({
      customer_id: user.id,
      ...parsed.data,
      status: 'open',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Run matching asynchronously (non-blocking)
  runMatchingEngine(request.id).catch(console.error)

  return NextResponse.json(request, { status: 201 })
}

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      category:categories(id, name_fr, name_ar, icon),
      city:cities(name_fr, name_ar),
      neighborhood:neighborhoods(name_fr, name_ar)
    `)
    .eq('customer_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
