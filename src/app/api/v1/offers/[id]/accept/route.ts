import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  // Fetch offer with conversation to verify ownership
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select(`
      id,
      status,
      provider_id,
      conversation_id,
      conversation:conversations!inner(
        id,
        customer_id,
        request_id,
        match_id,
        provider_profiles!conversations_provider_id_fkey(profile_id)
      )
    `)
    .eq('id', id)
    .single()

  if (offerError || !offer) return NextResponse.json({ error: 'OFFER_NOT_FOUND' }, { status: 404 })

  const conv = offer.conversation as any
  if (conv.customer_id !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  if (offer.status !== 'pending') {
    return NextResponse.json({ error: 'OFFER_NOT_PENDING' }, { status: 409 })
  }

  // Accept this offer
  const { error: acceptError } = await supabase
    .from('offers')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (acceptError) return NextResponse.json({ error: acceptError.message }, { status: 500 })

  // Decline all other pending offers in the same conversation
  await supabase
    .from('offers')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('conversation_id', offer.conversation_id)
    .neq('id', id)
    .eq('status', 'pending')

  // Create the job record
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .insert({
      request_id: conv.request_id,
      offer_id: id,
      customer_id: conv.customer_id,
      provider_id: offer.provider_id,
      status: 'active',
    })
    .select()
    .single()

  if (jobError) return NextResponse.json({ error: jobError.message }, { status: 500 })

  // Update service_request status to in_progress
  await supabase
    .from('service_requests')
    .update({ status: 'in_progress', updated_at: new Date().toISOString() })
    .eq('id', conv.request_id)

  // Update match status to responded
  if (conv.match_id) {
    await supabase
      .from('matches')
      .update({ status: 'responded', responded_at: new Date().toISOString() })
      .eq('id', conv.match_id)
  }

  // Notify provider
  const providerProfileId = conv.provider_profiles?.profile_id
  if (providerProfileId) {
    await supabase.from('notifications').insert({
      user_id: providerProfileId,
      type: 'offer_accepted',
      title_fr: 'Offre acceptée !',
      title_ar: 'تم قبول عرضك!',
      body_fr: 'Un client a accepté votre offre. Le chantier peut commencer.',
      body_ar: 'قبل أحد العملاء عرضك. يمكن البدء بالعمل.',
      data: { job_id: job.id, offer_id: id, conversation_id: offer.conversation_id },
    })
  }

  return NextResponse.json({ success: true, job_id: job.id }, { status: 200 })
}
