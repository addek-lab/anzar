import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  // Fetch offer with conversation to verify customer ownership
  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select(`
      id,
      status,
      conversation_id,
      conversation:conversations!inner(
        customer_id
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

  const { error } = await supabase
    .from('offers')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
