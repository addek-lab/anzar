import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  action: z.enum(['approve', 'reject']),
  reason: z.string().optional(),
})

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: adminProfile } = await supabase
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

  const adminClient = await createAdminClient()
  const newStatus = parsed.data.action === 'approve' ? 'verified' : 'rejected'

  const { error } = await adminClient
    .from('provider_profiles')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get provider's profile_id to send notification
  const { data: pp } = await adminClient
    .from('provider_profiles')
    .select('profile_id')
    .eq('id', id)
    .single()

  if (pp?.profile_id) {
    await adminClient.from('notifications').insert({
      user_id: pp.profile_id,
      type: parsed.data.action === 'approve' ? 'verification_approved' : 'verification_rejected',
      title_fr: parsed.data.action === 'approve' ? 'Profil vérifié !' : 'Vérification refusée',
      title_ar: parsed.data.action === 'approve' ? 'تم التحقق من ملفك!' : 'تم رفض التحقق',
      body_fr: parsed.data.action === 'approve'
        ? 'Félicitations ! Votre profil a été vérifié. Vous pouvez maintenant recevoir des missions.'
        : `Votre dossier a été refusé. Motif: ${parsed.data.reason ?? 'Non précisé'}`,
      body_ar: parsed.data.action === 'approve'
        ? 'تهانينا! تم التحقق من ملفك. يمكنك الآن استقبال المهام.'
        : `تم رفض ملفك. السبب: ${parsed.data.reason ?? 'غير محدد'}`,
      data: { provider_profile_id: id },
    })
  }

  // Log admin action
  await adminClient.from('admin_actions').insert({
    admin_id: user.id,
    action: parsed.data.action === 'approve' ? 'verify_provider' : 'reject_provider',
    target_type: 'provider_profile',
    target_id: id,
    reason: parsed.data.reason ?? null,
  })

  return NextResponse.json({ success: true, status: newStatus })
}
