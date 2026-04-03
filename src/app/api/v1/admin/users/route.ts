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
  const type = searchParams.get('type') // 'customer' | 'provider' | 'admin'
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') ?? '0', 10)
  const limit = 20
  const offset = page * limit

  // Determine select based on whether we need provider info
  const selectFields = type === 'provider' || !type
    ? `
      *,
      provider_profiles(
        id,
        status,
        avg_rating,
        jobs_completed,
        business_name,
        slug
      )
    `
    : '*'

  let query = adminClient
    .from('profiles')
    .select(selectFields, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) {
    query = query.eq('user_type', type)
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%`)
  }

  const { data: users, count, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ users: users ?? [], total: count ?? 0 })
}
