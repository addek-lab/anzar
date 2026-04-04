import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import RequestStatusBadge from '@/components/shared/RequestStatusBadge'
import ProviderCard from '@/components/customer/ProviderCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function RequestDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ new?: string }>
}) {
  const { id } = await params
  const { new: isNew } = await searchParams
  const t = await getTranslations()
  const locale = await getLocale()
  const isRTL = locale === 'ar'
  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: request } = await supabase
    .from('service_requests')
    .select(`
      *,
      category:categories(name_fr, name_ar, icon),
      city:cities(name_fr, name_ar),
      neighborhood:neighborhoods(name_fr, name_ar)
    `)
    .eq('id', id)
    .eq('customer_id', user!.id)
    .single()

  if (!request) notFound()

  const { data: matches } = await supabase
    .from('matches')
    .select(`
      *,
      provider_profile:provider_profiles(
        *,
        profile:profiles(full_name, phone)
      )
    `)
    .eq('request_id', id)
    .not('status', 'eq', 'declined')
    .order('score', { ascending: false })

  const catName = locale === 'ar' ? request.category?.name_ar : request.category?.name_fr
  const cityName = locale === 'ar' ? request.city?.name_ar : request.city?.name_fr
  const nbName = locale === 'ar' ? request.neighborhood?.name_ar : request.neighborhood?.name_fr

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/app/requests">
            <BackIcon size={22} className="text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{request.category?.icon}</span>
              <h1 className="text-lg font-bold text-gray-900">{catName}</h1>
            </div>
            <p className="text-sm text-gray-500">{cityName}{nbName ? ` · ${nbName}` : ''}</p>
          </div>
          <div className="ms-auto">
            <RequestStatusBadge status={request.status} />
          </div>
        </div>
      </div>

      {isNew === '1' && (
        <div className="mx-4 mt-4 bg-green-50 border border-green-200 rounded-2xl p-5">
          <div className="text-center mb-5">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-green-800 font-bold text-lg">{t('request.success')}</p>
            <p className="text-green-600 text-sm mt-1">{t('request.successHint')}</p>
          </div>

          {/* What happens next — timeline */}
          <div className="space-y-0">
            {/* Step 1 — done */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <div className="w-0.5 h-6 bg-green-300 mt-1" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-green-800">
                  {isRTL ? 'تم نشر طلبك' : 'Demande publiée'}
                </p>
                <p className="text-xs text-green-600 mt-0.5">
                  {isRTL ? 'وصل طلبك إلى الحرفيين المتاحين' : 'Votre demande a été transmise aux artisans disponibles'}
                </p>
              </div>
            </div>

            {/* Step 2 — in progress */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <span className="text-amber-600 text-xs">🔍</span>
                </div>
                <div className="w-0.5 h-6 bg-gray-200 mt-1" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-semibold text-gray-800">
                  {isRTL ? 'جارٍ البحث عن الحرفيين' : 'Recherche d\'artisans en cours'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isRTL ? 'نطابق طلبك مع الحرفيين المؤهلين' : 'Nous matchons votre demande avec les artisans qualifiés'}
                </p>
              </div>
            </div>

            {/* Step 3 — pending */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 text-xs">📩</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  {isRTL ? 'ستصلك العروض قريباً' : 'Vous recevrez les offres bientôt'}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isRTL ? 'عادةً خلال بضع ساعات' : 'Généralement dans quelques heures'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 space-y-3">
          <h2 className="font-semibold text-gray-900">Détails</h2>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Description</p>
            <p className="text-sm text-gray-800 mt-1">{request.description}</p>
          </div>
          {request.budget_text && (
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{t('request.budgetLabel')}</p>
              <p className="text-sm text-gray-800 mt-1">{request.budget_text}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{t('request.urgency.urgent').split(' ')[0]}</p>
            <p className="text-sm text-gray-800 mt-1">{t(`request.urgency.${request.urgency}`)}</p>
          </div>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 mb-3">{t('request.matchedProviders')}</h2>
          {matches && matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match: any) => (
                <ProviderCard
                  key={match.id}
                  match={match}
                  requestId={id}
                  locale={locale}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="font-medium text-gray-700">{t('request.noMatches')}</p>
              <p className="text-sm text-gray-500 mt-1">{t('request.noMatchesHint')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
