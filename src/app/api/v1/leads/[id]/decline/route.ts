import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })

  const { data: pp } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!pp) return NextResponse.json({ error: 'NOT_PROVIDER' }, { status: 403 })

  const { error } = await supabase
    .from('matches')
    .update({ status: 'declined', responded_at: new Date().toISOString() })
    .eq('id', id)
    .eq('provider_id', pp.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
