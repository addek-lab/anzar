import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
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

  const searchParams = req.nextUrl.searchParams
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = page * limit

  let query = adminClient
    .from('service_requests')
    .select(`
      *,
      customer:profiles!service_requests_customer_id_fkey(full_name, phone),
      category:categories(name_fr, name_ar, icon),
      city:cities(name_fr),
      neighborhood:neighborhoods(name_fr)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: requests, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ requests: requests ?? [], total: count ?? 0 })
}
