import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, Clock, CheckCircle2, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react'

export const revalidate = 300

export default async function PublicArtisanProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const locale = await getLocale()
  const isRTL = locale === 'ar'
  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  const supabase = await createAdminClient()

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      profile:profiles(full_name),
      city:cities(name_fr, name_ar)
    `)
    .eq('slug', slug)
    .eq('status', 'verified')
    .single()

  if (!provider) notFound()

  // Get trade categories
  let trades: Array<{ name_fr: string; name_ar: string; icon: string }> = []
  if (provider.trade_ids?.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('name_fr, name_ar, icon')
      .in('id', provider.trade_ids)
    trades = cats ?? []
  }

  // Get recent reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      rating,
      comment,
      created_at,
      customer:profiles(full_name)
    `)
    .eq('provider_id', provider.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const name = (provider.profile as any)?.full_name ?? (isRTL ? 'حرفي' : 'Artisan')
  const cityName = isRTL ? (provider.city as any)?.name_ar : (provider.city as any)?.name_fr
  const bio = isRTL ? provider.bio_ar : provider.bio_fr

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F7F7F5]">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBEBEB]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/artisans" className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
              <BackIcon className="w-4 h-4 text-gray-600" />
            </Link>
            <Link href="/" className="flex items-center">
              <Image src="/logo.png" alt="Anzar" width={120} height={65} className="h-8 w-auto object-contain" />
            </Link>
          </div>
          <Link
            href="/auth"
            className="bg-[#1A6B4A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#155c3e] transition-colors shadow-sm"
          >
            {isRTL ? 'تسجيل الدخول' : 'Connexion'}
          </Link>
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div className="bg-gradient-to-br from-[#1A6B4A] to-[#155c3e] px-4 sm:px-6 pt-10 pb-20 relative overflow-hidden">
        <div className="absolute -top-8 -end-8 w-48 h-48 bg-white/5 rounded-full" aria-hidden="true" />
        <div className="absolute -bottom-12 -start-6 w-48 h-48 bg-white/5 rounded-full" aria-hidden="true" />
        <div className="max-w-3xl mx-auto relative">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-white/50 text-xs mb-6">
            <Link href="/" className="hover:text-white transition-colors">{isRTL ? 'الرئيسية' : 'Accueil'}</Link>
            <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
            <Link href="/artisans" className="hover:text-white transition-colors">{isRTL ? 'الحرفيون' : 'Artisans'}</Link>
            <ChevronRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-white/80">{name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-12 pb-12 space-y-5">

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-[#EBEBEB]">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 bg-[#1A6B4A] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
              <span className="text-3xl font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isRTL ? 'موثق' : 'Vérifié'}
                </span>
              </div>
              {provider.business_name && (
                <p className="text-sm text-gray-500 mt-1">{provider.business_name}</p>
              )}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {cityName && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {cityName}
                  </span>
                )}
                {provider.years_experience > 0 && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {provider.years_experience}+ {isRTL ? 'سنوات خبرة' : 'ans d\'expérience'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Rating row */}
          {provider.review_count > 0 && (
            <div className="flex items-center gap-3 mt-5 p-3.5 bg-amber-50 rounded-2xl border border-amber-100">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.round(provider.avg_rating ?? 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-200 fill-gray-200'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-gray-900">{(provider.avg_rating ?? 0).toFixed(1)}</span>
              <span className="text-sm text-gray-500">
                {provider.review_count} {isRTL ? 'تقييم' : 'avis'}
              </span>
              {provider.jobs_completed > 0 && (
                <span className="ms-auto text-xs text-gray-400">
                  {provider.jobs_completed} {isRTL ? 'مهمة مكتملة' : 'missions'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* ── SPECIALTIES ── */}
        {trades.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-[#EBEBEB]">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              {isRTL ? 'التخصصات' : 'Spécialités'}
            </h2>
            <div className="flex flex-wrap gap-2">
              {trades.map((t) => (
                <span
                  key={t.name_fr}
                  className="inline-flex items-center gap-1.5 bg-[#1A6B4A]/8 text-[#1A6B4A] text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  <span>{t.icon}</span>
                  {isRTL ? t.name_ar : t.name_fr}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── BIO ── */}
        {bio && (
          <div className="bg-white rounded-2xl p-5 border border-[#EBEBEB]">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              {isRTL ? 'نبذة عنه' : 'Présentation'}
            </h2>
            <p className="text-gray-700 text-sm leading-relaxed">{bio}</p>
          </div>
        )}

        {/* ── REVIEWS ── */}
        {reviews && reviews.length > 0 && (
          <div className="bg-white rounded-2xl p-5 border border-[#EBEBEB]">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
              {isRTL ? 'التقييمات' : 'Avis clients'}
            </h2>
            <div className="space-y-4">
              {reviews.map((review, i) => (
                <div key={i} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200 fill-gray-200'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400 ms-auto">
                      {new Date(review.created_at).toLocaleDateString(isRTL ? 'ar-MA' : 'fr-MA', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{review.comment}&rdquo;</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    — {(review.customer as any)?.full_name ?? (isRTL ? 'مستخدم' : 'Utilisateur')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA ── */}
        <div className="bg-gradient-to-br from-[#1A6B4A] to-[#155c3e] rounded-3xl p-6 text-center">
          <MessageCircle className="w-10 h-10 text-white/80 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-1">
            {isRTL ? 'هل تريد التواصل مع هذا الحرفي؟' : 'Vous souhaitez contacter cet artisan ?'}
          </h2>
          <p className="text-white/65 text-sm mb-5">
            {isRTL
              ? 'سجّل الدخول أو أنشئ حساباً مجانياً للتواصل مباشرة'
              : 'Connectez-vous ou créez un compte gratuit pour le contacter'}
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-[#E8A838] hover:bg-[#d4952e] text-white font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-[#E8A838]/30 hover:-translate-y-0.5 text-sm"
          >
            {isRTL ? 'Contacter' : 'Contacter'}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>
    </div>
  )
}
