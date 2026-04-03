import { createClient } from '@/lib/supabase/server'
import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'
import LeadCard from '@/components/provider/LeadCard'

export default async function ProviderHomePage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const isRTL = locale === 'ar'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get provider profile
  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('*')
    .eq('profile_id', user!.id)
    .single()

  // Redirect to onboarding if no profile
  if (!providerProfile) redirect('/pro/onboarding')

  // Redirect to pending screen if not verified
  if (providerProfile.status === 'pending') redirect('/pro/onboarding/pending')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user!.id)
    .single()

  // Get active leads (matched but not responded)
  const { data: leads } = await supabase
    .from('matches')
    .select(`
      *,
      request:service_requests(
        *,
        category:categories(name_fr, name_ar, icon),
        city:cities(name_fr, name_ar),
        neighborhood:neighborhoods(name_fr, name_ar)
      )
    `)
    .eq('provider_id', providerProfile.id)
    .in('status', ['pending', 'notified', 'viewed'])
    .order('created_at', { ascending: false })

  const firstName = profile?.full_name?.split(' ')[0] ?? ''

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-[#1A6B4A] px-5 pt-14 pb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">{isRTL ? 'مرحباً،' : 'Bonjour,'}</p>
            <h1 className="text-white text-2xl font-bold mt-0.5">{firstName} 👋</h1>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-1.5 text-center">
            <p className="text-white text-xs">{isRTL ? 'تقييمك' : 'Note'}</p>
            <p className="text-white font-bold">
              {providerProfile.avg_rating > 0 ? `⭐ ${providerProfile.avg_rating.toFixed(1)}` : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">
            {t('provider.leads.title')}
            {leads && leads.length > 0 && (
              <span className="ms-2 bg-[#1A6B4A] text-white text-xs rounded-full px-2 py-0.5">
                {leads.length}
              </span>
            )}
          </h2>

          {leads && leads.length > 0 ? (
            <div className="space-y-3">
              {leads.map((lead: any) => (
                <LeadCard key={lead.id} lead={lead} locale={locale} providerId={providerProfile.id} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">📭</div>
              <p className="font-medium text-gray-600">{t('provider.leads.empty')}</p>
              <p className="text-sm text-gray-400 mt-1">{t('provider.leads.emptyHint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
