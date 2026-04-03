import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  price_mad: z.number().positive(),
  description: z.string().min(10).max(1000),
  estimated_duration: z.string().max(100).nullable().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: pp } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!pp) return NextResponse.json({ error: 'NOT_PROVIDER' }, { status: 403 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })

  // Get match with request info
  const { data: match } = await supabase
    .from('matches')
    .select('*, request:service_requests(customer_id)')
    .eq('id', id)
    .eq('provider_id', pp.id)
    .single()

  if (!match) return NextResponse.json({ error: 'MATCH_NOT_FOUND' }, { status: 404 })

  // Get or create conversation
  let conversationId: string
  const { data: existingConv } = await supabase
    .from('conversations')
    .select('id')
    .eq('match_id', id)
    .single()

  if (existingConv) {
    conversationId = existingConv.id
  } else {
    const { data: newConv, error: convError } = await supabase
      .from('conversations')
      .insert({
        request_id: match.request_id,
        customer_id: match.request.customer_id,
        provider_id: pp.id,
        match_id: id,
      })
      .select()
      .single()

    if (convError) return NextResponse.json({ error: convError.message }, { status: 500 })
    conversationId = newConv.id
  }

  // Create offer
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .insert({
      conversation_id: conversationId,
      provider_id: pp.id,
      price_mad: parsed.data.price_mad,
      description: parsed.data.description,
      estimated_duration: parsed.data.estimated_duration ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (offerError) return NextResponse.json({ error: offerError.message }, { status: 500 })

  // Create system message for offer
  await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: `Offre: ${parsed.data.price_mad} MAD`,
    message_type: 'offer',
    offer_id: offer.id,
  })

  // Update match status
  await supabase
    .from('matches')
    .update({ status: 'responded', responded_at: new Date().toISOString() })
    .eq('id', id)

  // Notify customer
  await supabase.from('notifications').insert({
    user_id: match.request.customer_id,
    type: 'offer_received',
    title_fr: 'Nouvelle offre reçue !',
    title_ar: 'عرض جديد مستلم!',
    body_fr: `Un artisan vous a envoyé une offre de ${parsed.data.price_mad} MAD.`,
    body_ar: `أرسل لك حرفي عرضاً بـ ${parsed.data.price_mad} درهم.`,
    data: { conversation_id: conversationId, offer_id: offer.id },
  })

  return NextResponse.json({ conversation_id: conversationId, offer_id: offer.id }, { status: 201 })
}
