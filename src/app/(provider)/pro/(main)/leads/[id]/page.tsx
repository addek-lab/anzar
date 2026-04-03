import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import LeadDetailActions from '@/components/provider/LeadDetailActions'
import { ChevronLeft, ChevronRight, MapPin, Clock, Banknote } from 'lucide-react'
import Link from 'next/link'

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const locale = await getLocale()
  const isRTL = locale === 'ar'
  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: providerProfile } = await supabase
    .from('provider_profiles')
    .select('id')
    .eq('profile_id', user!.id)
    .single()

  if (!providerProfile) redirect('/pro/onboarding')

  const { data: match } = await supabase
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
    .eq('id', id)
    .eq('provider_id', providerProfile.id)
    .single()

  if (!match) notFound()

  // Mark as viewed
  if (match.status === 'notified') {
    await supabase
      .from('matches')
      .update({ status: 'viewed' })
      .eq('id', id)
  }

  const request = match.request
  const catName = isRTL ? request?.category?.name_ar : request?.category?.name_fr
  const cityName = isRTL ? request?.city?.name_ar : request?.city?.name_fr
  const nbName = isRTL ? request?.neighborhood?.name_ar : request?.neighborhood?.name_fr

  const urgencyLabels = {
    urgent: isRTL ? '🚨 عاجل' : '🚨 Urgent',
    soon: isRTL ? '📅 قريباً' : '📅 Bientôt',
    flexible: isRTL ? '🕐 مرن' : '🕐 Flexible',
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/pro">
            <BackIcon size={22} className="text-gray-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{request?.category?.icon}</span>
              <h1 className="text-lg font-bold text-gray-900">{catName}</h1>
            </div>
            <p className="text-sm text-gray-500">{cityName}{nbName ? ` · ${nbName}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-xl p-4 space-y-4">
          <div className="flex gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-[#1A6B4A]" />
              {cityName}{nbName ? `, ${nbName}` : ''}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-[#1A6B4A]" />
              {urgencyLabels[request?.urgency as keyof typeof urgencyLabels]}
            </span>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-gray-800">{request?.description}</p>
          </div>

          {request?.budget_text && (
            <div className="flex items-center gap-2">
              <Banknote size={16} className="text-[#E8A838]" />
              <span className="text-sm font-medium text-gray-700">{request.budget_text}</span>
            </div>
          )}
        </div>

        <div className="bg-amber-50 rounded-xl p-4">
          <p className="text-sm text-amber-800 font-medium">
            {isRTL
              ? '📍 العميل: مقيم في ' + (nbName ?? cityName)
              : '📍 Client : résidant à ' + (nbName ?? cityName)}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            {isRTL
              ? 'سيتم الكشف عن معلومات الاتصال بعد قبول عرضك'
              : 'Les coordonnées seront révélées après acceptation de votre offre'}
          </p>
        </div>

        {match.status !== 'declined' && (
          <LeadDetailActions matchId={id} locale={locale} />
        )}

        {match.status === 'declined' && (
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <p className="text-gray-500 text-sm">
              {isRTL ? 'لقد رفضت هذه المهمة' : 'Vous avez décliné cette mission'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
