import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  // Fetch job with provider profile info to check participation
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select(`
      id,
      status,
      customer_id,
      provider_id,
      request_id,
      provider_profiles!jobs_provider_id_fkey(
        id,
        profile_id
      )
    `)
    .eq('id', id)
    .single()

  if (jobError || !job) return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 })

  const providerProfile = (job as any).provider_profiles
  const providerProfileId = providerProfile?.profile_id

  const isCustomer = job.customer_id === user.id
  const isProvider = providerProfileId === user.id

  if (!isCustomer && !isProvider) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  if (job.status !== 'active') {
    return NextResponse.json({ error: 'JOB_NOT_ACTIVE' }, { status: 409 })
  }

  const now = new Date().toISOString()

  // Update job to completed
  const { error: updateError } = await supabase
    .from('jobs')
    .update({ status: 'completed', completed_at: now, updated_at: now })
    .eq('id', id)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Update service_request status to completed
  await supabase
    .from('service_requests')
    .update({ status: 'completed', updated_at: now })
    .eq('id', job.request_id)

  // Increment provider jobs_completed
  if (job.provider_id) {
    const { data: pp } = await supabase
      .from('provider_profiles')
      .select('jobs_completed')
      .eq('id', job.provider_id)
      .single()

    if (pp) {
      await supabase
        .from('provider_profiles')
        .update({
          jobs_completed: (pp.jobs_completed ?? 0) + 1,
          updated_at: now,
        })
        .eq('id', job.provider_id)
    }
  }

  // Notify the other party
  const notifyUserId = isCustomer ? providerProfileId : job.customer_id
  if (notifyUserId) {
    await supabase.from('notifications').insert({
      user_id: notifyUserId,
      type: 'job_completed',
      title_fr: 'Travail terminé',
      title_ar: 'اكتمل العمل',
      body_fr: 'Le travail a été marqué comme terminé.',
      body_ar: 'تم تمييز العمل على أنه مكتمل.',
      data: { job_id: id },
    })
  }

  return NextResponse.json({ success: true })
}
