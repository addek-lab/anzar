import { createClient as createServerClientDirect } from '@supabase/supabase-js'

const MAX_MATCHES = 3
const MAX_ACTIVE_LEADS = 5

function createAdminSupabase() {
  return createServerClientDirect(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function scoreProvider(provider: any): number {
  // Response rate score (0-100), new providers get 60
  const responseRate = provider.response_rate ?? 0
  const responseRateScore = provider.review_count === 0 ? 60 : responseRate * 100

  // Quality score based on avg_rating (0-5 → 0-100)
  const qualityScore = (provider.avg_rating ?? 0) * 20

  // Recency score: jobs completed in last 30 days (capped at 10)
  const recentJobs = Math.min(provider.jobs_completed ?? 0, 10)
  const recencyScore = recentJobs * 10

  // Profile completeness (0-100)
  let completeness = 0
  if (provider.bio_fr) completeness += 30
  if (provider.identity_doc_url) completeness += 30
  if ((provider.neighborhood_ids?.length ?? 0) > 0) completeness += 20
  if ((provider.years_experience ?? 0) > 0) completeness += 20

  const score =
    responseRateScore * 0.30 +
    qualityScore * 0.25 +
    recencyScore * 0.20 +
    completeness * 0.10

  return Math.round(score * 100) / 100
}

export async function runMatchingEngine(requestId: string): Promise<void> {
  const supabase = createAdminSupabase()

  // 1. Get the request
  const { data: request, error: reqError } = await supabase
    .from('service_requests')
    .select('*')
    .eq('id', requestId)
    .single()

  if (reqError || !request) {
    console.error('[matching] Request not found:', requestId)
    return
  }

  // 2. Get eligible providers
  const { data: providers, error: provError } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      profile:profiles(id, full_name, phone)
    `)
    .eq('status', 'verified')
    .eq('city_id', request.city_id)
    .contains('trade_ids', [request.category_id])

  if (provError || !providers) {
    console.error('[matching] Error fetching providers:', provError)
    return
  }

  // 3. Filter out providers with too many active leads
  const { data: activeCounts } = await supabase
    .from('matches')
    .select('provider_id, count')
    .in('status', ['pending', 'notified', 'viewed'])
    .in('provider_id', providers.map((p: any) => p.id))

  const activeCountMap = new Map<string, number>()
  if (activeCounts) {
    for (const row of activeCounts as any[]) {
      activeCountMap.set(row.provider_id, parseInt(row.count))
    }
  }

  const eligible = providers.filter((p: any) => {
    const active = activeCountMap.get(p.id) ?? 0
    return active < MAX_ACTIVE_LEADS
  })

  if (eligible.length === 0) {
    console.log('[matching] No eligible providers for request:', requestId)
    return
  }

  // 4. Score and sort
  const scored = eligible
    .map((p: any) => ({ provider: p, score: scoreProvider(p) }))
    .sort((a: any, b: any) => {
      if (b.score !== a.score) return b.score - a.score
      // Tie-break: older provider first (more experienced on platform)
      return new Date(a.provider.created_at).getTime() - new Date(b.provider.created_at).getTime()
    })
    .slice(0, MAX_MATCHES)

  // 5. Create match records
  const matchInserts = scored.map(({ provider, score }: any) => ({
    request_id: requestId,
    provider_id: provider.id,
    score,
    status: 'pending',
    notified_at: new Date().toISOString(),
  }))

  const { error: matchError } = await supabase
    .from('matches')
    .insert(matchInserts)

  if (matchError) {
    console.error('[matching] Failed to insert matches:', matchError)
    return
  }

  // 6. Update request status to 'matched'
  await supabase
    .from('service_requests')
    .update({ status: 'matched' })
    .eq('id', requestId)

  // 7. Create notifications for matched providers
  const notifications = scored.map(({ provider }: any) => ({
    user_id: provider.profile.id,
    type: 'new_lead',
    title_fr: 'Nouvelle mission disponible',
    title_ar: 'مهمة جديدة متاحة',
    body_fr: `Une nouvelle mission de ${request.category_id} est disponible dans votre zone.`,
    body_ar: 'مهمة جديدة متاحة في منطقتك.',
    data: { request_id: requestId },
  }))

  await supabase.from('notifications').insert(notifications)

  console.log(`[matching] Matched ${scored.length} providers for request ${requestId}`)
}
