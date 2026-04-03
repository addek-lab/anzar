import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: job, error } = await supabase
    .from('jobs')
    .select(`
      *,
      service_request:service_requests(
        *,
        category:categories(id, name_fr, name_ar, icon),
        city:cities(id, name_fr, name_ar),
        neighborhood:neighborhoods(id, name_fr, name_ar)
      ),
      offer:offers(
        id,
        price_mad,
        description,
        estimated_duration,
        status,
        created_at
      ),
      provider:provider_profiles!jobs_provider_id_fkey(
        id,
        profile_id,
        business_name,
        slug,
        avg_rating,
        review_count,
        jobs_completed,
        bio_fr,
        bio_ar
      ),
      customer:profiles!jobs_customer_id_fkey(
        id,
        full_name,
        phone
      )
    `)
    .eq('id', id)
    .single()

  if (error || !job) return NextResponse.json({ error: 'JOB_NOT_FOUND' }, { status: 404 })

  // Verify caller is a participant
  const provider = (job as any).provider
  const isCustomer = job.customer_id === user.id
  const isProvider = provider?.profile_id === user.id

  if (!isCustomer && !isProvider) {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  return NextResponse.json(job)
}
