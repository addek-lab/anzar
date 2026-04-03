import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const adminClient = await createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })

  const newStatus = parsed.data.action === 'approve' ? 'approved' : 'rejected'

  const { error: updateError } = await adminClient
    .from('reviews')
    .update({ status: newStatus })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Log admin action
  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    action: parsed.data.action === 'approve' ? 'approve_review' : 'reject_review',
    target_type: 'review',
    target_id: id,
    reason: parsed.data.reason ?? null,
  })

  return NextResponse.json({ success: true })
}
