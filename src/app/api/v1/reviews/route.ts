import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  job_id: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().nullable(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'INVALID_INPUT', details: parsed.error.flatten() }, { status: 400 })
  }

  const { job_id, rating, comment } = parsed.data

  // Fetch job and verify customer
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select(`
      id,
      status,
      customer_id,
      provider_id,
      provider_profiles!jobs_provider_id_fkey(profile_id)
    `)
    .eq('id', job_id)
    .single()

  if (jobError || !job) return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 })

  if (job.customer_id !== user.id) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  if (job.status !== 'completed') {
    return NextResponse.json({ error: 'JOB_NOT_COMPLETED' }, { status: 409 })
  }

  const providerProfile = (job as any).provider_profiles
  const reviewedId = providerProfile?.profile_id

  if (!reviewedId) {
    return NextResponse.json({ error: 'PROVIDER_NOT_FOUND' }, { status: 404 })
  }

  // Check for existing review from this reviewer for this job
  const { data: existing } = await supabase
    .from('reviews')
    .select('id')
    .eq('job_id', job_id)
    .eq('reviewer_id', user.id)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'REVIEW_ALREADY_EXISTS' }, { status: 409 })
  }

  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .insert({
      job_id,
      reviewer_id: user.id,
      reviewed_id: reviewedId,
      rating,
      comment: comment ?? null,
      status: 'pending',
    })
    .select()
    .single()

  if (reviewError) return NextResponse.json({ error: reviewError.message }, { status: 500 })

  // Notify provider
  await supabase.from('notifications').insert({
    user_id: reviewedId,
    type: 'review_received',
    title_fr: 'Nouvel avis reçu',
    title_ar: 'تقييم جديد',
    body_fr: `Un client vous a laissé un avis de ${rating}/5.`,
    body_ar: `ترك لك أحد العملاء تقييماً ${rating}/5.`,
    data: { review_id: review.id, job_id },
  })

  return NextResponse.json({ success: true, review_id: review.id }, { status: 201 })
}
