import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

function getAdmin() {
  return createAdminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUser(req: NextRequest) {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!token) return null
  const admin = getAdmin()
  const { data: { user } } = await admin.auth.getUser(token)
  return user
}


export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const conversationId = req.nextUrl.searchParams.get('conversation_id')
  if (!conversationId) return NextResponse.json({ error: 'MISSING_PARAM' }, { status: 400 })

  const admin = getAdmin()

  // Verify participant via conversation lookup
  const { data: conv } = await admin
    .from('conversations')
    .select('id, customer_id, provider_profiles!conversations_provider_id_fkey(profile_id)')
    .eq('id', conversationId)
    .single()

  if (!conv) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const providerProfileId = (conv as any).provider_profiles?.profile_id
  if (conv.customer_id !== user.id && providerProfileId !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const { data: messages, error } = await admin
    .from('messages')
    .select('*, offer:offers(id, price_mad, description, status, estimated_duration)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(messages)
}

const sendSchema = z.object({
  conversation_id: z.string().min(1),
  content: z.string().min(1).max(2000),
})

export async function POST(req: NextRequest) {
  const user = await getUser(req)
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })

  const admin = getAdmin()

  // Verify participant
  const { data: conv } = await admin
    .from('conversations')
    .select('id, customer_id, provider_profiles!conversations_provider_id_fkey(profile_id)')
    .eq('id', parsed.data.conversation_id)
    .single()

  if (!conv) return NextResponse.json({ error: 'NOT_FOUND' }, { status: 404 })

  const providerProfileId = (conv as any).provider_profiles?.profile_id
  if (conv.customer_id !== user.id && providerProfileId !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const { data: message, error } = await admin
    .from('messages')
    .insert({
      conversation_id: parsed.data.conversation_id,
      sender_id: user.id,
      content: parsed.data.content,
      message_type: 'text',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(message, { status: 201 })
}
