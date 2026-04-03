import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const cityId = req.nextUrl.searchParams.get('city_id')
  const supabase = await createClient()

  let query = supabase.from('neighborhoods').select('*').order('name_fr')
  if (cityId) query = query.eq('city_id', cityId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
