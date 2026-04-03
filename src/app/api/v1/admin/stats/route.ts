import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  // Verify admin using service role for security
  const adminClient = await createAdminClient()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') {
    return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 })
  }

  const [
    { count: total_users },
    { count: total_customers },
    { count: total_providers },
    { count: pending_providers },
    { count: verified_providers },
    { count: total_requests },
    { count: open_requests },
    { count: completed_requests },
    { count: total_jobs },
    { count: active_jobs },
    { count: completed_jobs },
    { count: pending_reviews },
    { count: approved_reviews },
    { count: total_conversations },
  ] = await Promise.all([
    adminClient.from('profiles').select('*', { count: 'exact', head: true }),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'customer'),
    adminClient.from('profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'provider'),
    adminClient.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    adminClient.from('service_requests').select('*', { count: 'exact', head: true }),
    adminClient.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    adminClient.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    adminClient.from('jobs').select('*', { count: 'exact', head: true }),
    adminClient.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    adminClient.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    adminClient.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    adminClient.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    adminClient.from('conversations').select('*', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    total_users,
    total_customers,
    total_providers,
    pending_providers,
    verified_providers,
    total_requests,
    open_requests,
    completed_requests,
    total_jobs,
    active_jobs,
    completed_jobs,
    pending_reviews,
    approved_reviews,
    total_conversations,
  })
}
