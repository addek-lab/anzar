import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(_req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  // Check if user is a provider
  const { data: pp } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  let data, error

  if (pp) {
    // Provider: fetch jobs where provider_id = provider profile id
    ;({ data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        service_request:service_requests(category_id, description, category:categories(name_fr, name_ar, icon)),
        offer:offers(price_mad, description),
        customer:profiles!jobs_customer_id_fkey(full_name, phone)
      `)
      .eq('provider_id', pp.id)
      .order('created_at', { ascending: false }))
  } else {
    // Customer: fetch jobs where customer_id = user.id
    ;({ data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        service_request:service_requests(category_id, description, category:categories(name_fr, name_ar, icon)),
        offer:offers(price_mad, description),
        provider:provider_profiles!jobs_provider_id_fkey(business_name, slug)
      `)
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false }))
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
