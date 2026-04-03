import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Star, Clock, MapPin, CheckCircle2 } from 'lucide-react'

export default async function ArtisanProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ request_id?: string }>
}) {
  const { slug } = await params
  const { request_id } = await searchParams
  const locale = await getLocale()
  const isRTL = locale === 'ar'
  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      profile:profiles(full_name),
      city:cities(name_fr, name_ar)
    `)
    .eq('slug', slug)
    .single()

  if (!provider) notFound()

  // Get trade names
  let tradeNames: string[] = []
  if (provider.trade_ids?.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('name_fr, name_ar, icon')
      .in('id', provider.trade_ids)
    tradeNames = cats?.map((c: any) => (isRTL ? c.name_ar : c.name_fr)) ?? []
  }

  // Check for existing conversation for this request
  let conversationId: string | null = null
  if (request_id && user) {
    const { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('request_id', request_id)
      .eq('provider_id', provider.id)
      .eq('customer_id', user.id)
      .single()
    conversationId = conv?.id ?? null
  }

  const name = provider.profile?.full_name ?? (isRTL ? 'حرفي' : 'Artisan')
  const cityName = isRTL ? provider.city?.name_ar : provider.city?.name_fr
  const bio = isRTL ? provider.bio_ar : provider.bio_fr

  return (
    <div className="min-h-screen bg-gray-50" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#1A6B4A] px-4 pt-14 pb-16 relative overflow-hidden">
        <div className="absolute -top-8 -end-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-12 -start-6 w-40 h-40 bg-white/5 rounded-full" />
        <div className="flex items-center gap-3 relative">
          {request_id ? (
            <Link href={`/app/requests/${request_id}`}>
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <BackIcon size={18} className="text-white" />
              </div>
            </Link>
          ) : (
            <Link href="/app">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <BackIcon size={18} className="text-white" />
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Profile card */}
      <div className="px-4 -mt-8 relative">
        <div className="bg-white rounded-3xl p-5 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-[#1A6B4A]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-[#1A6B4A]">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 truncate">{name}</h1>
                {provider.status === 'verified' && (
                  <CheckCircle2 size={18} className="text-[#1A6B4A] flex-shrink-0" />
                )}
              </div>
              {provider.business_name && (
                <p className="text-sm text-gray-500 mt-0.5">{provider.business_name}</p>
              )}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                {cityName && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={11} />
                    {cityName}
                  </span>
                )}
                {provider.years_experience > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={11} />
                    {provider.years_experience}+ {isRTL ? 'سنوات' : 'ans'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating */}
          {provider.review_count > 0 && (
            <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 rounded-2xl">
              <Star size={16} className="text-amber-500 fill-amber-500" />
              <span className="font-bold text-gray-900">{provider.avg_rating.toFixed(1)}</span>
              <span className="text-sm text-gray-500">
                ({provider.review_count} {isRTL ? 'تقييم' : 'avis'})
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Trades */}
        {tradeNames.length > 0 && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              {isRTL ? 'التخصصات' : 'Spécialités'}
            </p>
            <div className="flex flex-wrap gap-2">
              {tradeNames.map(t => (
                <span key={t} className="bg-[#1A6B4A]/8 text-[#1A6B4A] text-sm font-medium px-3 py-1 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {bio && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {isRTL ? 'نبذة' : 'Présentation'}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{bio}</p>
          </div>
        )}

        {/* CTA */}
        {conversationId ? (
          <Link href={`/app/messages/${conversationId}`}>
            <div className="bg-[#1A6B4A] text-white rounded-2xl p-4 flex items-center justify-center gap-2 shadow-lg shadow-[#1A6B4A]/25">
              <span className="text-xl">💬</span>
              <span className="font-semibold">
                {isRTL ? 'فتح المحادثة' : 'Ouvrir la conversation'}
              </span>
            </div>
          </Link>
        ) : (
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
            <p className="text-amber-800 text-sm font-medium">
              {isRTL ? '⏳ في انتظار عرض من هذا الحرفي' : "⏳ En attente d'une offre de cet artisan"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
