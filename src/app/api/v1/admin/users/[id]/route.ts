import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  action: z.enum(['suspend', 'unsuspend']),
  reason: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const adminClient = await createAdminClient()
  const { data: adminProfile } = await adminClient
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (adminProfile?.user_type !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })

  // Fetch target profile to check if provider
  const { data: targetProfile } = await adminClient
    .from('profiles')
    .select('id, user_type')
    .eq('id', id)
    .single()

  if (!targetProfile) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  // For providers, update provider_profiles status
  if (targetProfile.user_type === 'provider') {
    const newStatus = parsed.data.action === 'suspend' ? 'suspended' : 'verified'

    const { error: ppError } = await adminClient
      .from('provider_profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('profile_id', id)

    if (ppError) return NextResponse.json({ error: ppError.message }, { status: 500 })
  }

  // Log admin action
  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    action: parsed.data.action === 'suspend' ? 'suspend_user' : 'unsuspend_user',
    target_type: 'profile',
    target_id: id,
    reason: parsed.data.reason ?? null,
  })

  return NextResponse.json({ success: true })
}
