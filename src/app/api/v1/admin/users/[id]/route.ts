import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAdmin, requireJson, safeError } from '@/lib/api-guard'

const schema = z.object({
  action: z.enum(['suspend', 'unsuspend']),
  reason: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const auth = await requireAdmin(req)
  if (auth instanceof NextResponse) return auth
  const { user } = auth

  const ctError = requireJson(req)
  if (ctError) return ctError

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'INVALID_INPUT' }, { status: 400 })

  const db = await createAdminClient()

  const { data: targetProfile } = await db
    .from('profiles')
    .select('id, user_type')
    .eq('id', id)
    .single()

  if (!targetProfile) {
    return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 })
  }

  if (targetProfile.user_type === 'provider') {
    const newStatus = parsed.data.action === 'suspend' ? 'suspended' : 'verified'

    const { error: ppError } = await db
      .from('provider_profiles')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('profile_id', id)

    if (ppError) return safeError('UPDATE_FAILED', ppError.message)
  }

  await db.from('admin_actions').insert({
    admin_id: user.id,
    action: parsed.data.action === 'suspend' ? 'suspend_user' : 'unsuspend_user',
    target_type: 'profile',
    target_id: id,
    reason: parsed.data.reason ?? null,
  })

  return NextResponse.json({ success: true })
}
