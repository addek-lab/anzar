import { createAdminClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'
import Image from 'next/image'
import { Star, MapPin, CheckCircle2, ChevronRight, Search } from 'lucide-react'

export const revalidate = 300 // revalidate every 5 minutes

// Category slug → DB category name mapping
const CATEGORY_SLUG_MAP: Record<string, string> = {
  electricien: 'Électricien',
  plombier: 'Plombier',
  peinture: 'Peinture',
  climatisation: 'Climatisation',
  carreleur: 'Carreleur',
  bricoleur: 'Bricoleur',
}

export default async function ArtisansDirectoryPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const supabase = await createAdminClient()

  // Fetch all verified providers with profile, city, and categories
  const { data: providers } = await supabase
    .from('provider_profiles')
    .select(`
      id,
      slug,
      business_name,
      bio_fr,
      bio_ar,
      avg_rating,
      review_count,
      jobs_completed,
      years_experience,
      trade_ids,
      status,
      profile:profiles(full_name),
      city:cities(name_fr, name_ar)
    `)
    .eq('status', 'verified')
    .order('avg_rating', { ascending: false })
    .limit(48)

  // Fetch categories for the filter bar
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_fr, name_ar, icon, slug')
    .order('name_fr')

  // Filter by category if provided
  let filteredProviders = providers ?? []
  let activeCategoryId: string | null = null
  if (category && categories) {
    // Find category by slug
    const matchedCat = categories.find(
      (c) => (c.slug ?? c.name_fr.toLowerCase().replace(/[éèê]/g, 'e').replace(/\s+/g, '-')) === category
        || CATEGORY_SLUG_MAP[category] === c.name_fr
    )
    if (matchedCat) {
      activeCategoryId = matchedCat.id
      filteredProviders = filteredProviders.filter(
        (p) => p.trade_ids && p.trade_ids.includes(matchedCat.id)
      )
    }
  }

  // Build category name lookup
  const catMap: Record<string, { name_fr: string; name_ar: string; icon: string; slug?: string }> = {}
  categories?.forEach((c) => {
    catMap[c.id] = c
  })

  const t = {
    title: isRTL ? 'الحرفيون الموثقون' : 'Artisans vérifiés',
    subtitle: isRTL
      ? 'اعثر على الحرفي المناسب لمشروعك في الدار البيضاء'
      : 'Trouvez l\'artisan qu\'il vous faut pour votre projet à Casablanca',
    allCategories: isRTL ? 'الكل' : 'Tous',
    noResults: isRTL ? 'لا يوجد حرفيون في هذه الفئة حالياً' : 'Aucun artisan disponible dans cette catégorie pour l\'instant',
    contactCta: isRTL ? 'Contacter' : 'Contacter',
    yearsExp: isRTL ? 'سنوات خبرة' : 'ans d\'expérience',
    reviews: isRTL ? 'تقييم' : 'avis',
    verified: isRTL ? 'موثق' : 'Vérifié',
    loginToContact: isRTL ? 'سجّل الدخول للتواصل' : 'Connectez-vous pour contacter',
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F7F7F5]">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#EBEBEB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center shrink-0">
            <Image src="/logo.png" alt="Anzar" width={160} height={87} className="h-10 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/auth"
              className="bg-[#1A6B4A] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#155c3e] transition-colors shadow-sm"
            >
              {isRTL ? 'تسجيل الدخول' : 'Connexion'}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HEADER ── */}
      <div className="bg-gradient-to-br from-[#1A6B4A] to-[#155c3e] px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <Link href="/" className="hover:text-white transition-colors">
              {isRTL ? 'الرئيسية' : 'Accueil'}
            </Link>
            <ChevronRight className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-white">{t.title}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-white/70 text-lg">{t.subtitle}</p>

          {/* Search hint */}
          <div className="mt-6 flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 max-w-md">
            <Search className="w-5 h-5 text-white/50 flex-shrink-0" />
            <span className="text-white/60 text-sm">
              {isRTL ? 'ابحث بالتخصص أو الاسم...' : 'Filtrez par spécialité ci-dessous'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* ── CATEGORY FILTER ── */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          <Link
            href="/artisans"
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
              !category
                ? 'bg-[#1A6B4A] text-white border-[#1A6B4A]'
                : 'bg-white text-gray-600 border-[#EBEBEB] hover:border-[#1A6B4A] hover:text-[#1A6B4A]'
            }`}
          >
            {t.allCategories}
          </Link>
          {categories?.map((cat) => {
            const catSlug = cat.slug ?? Object.entries(CATEGORY_SLUG_MAP).find(([, v]) => v === cat.name_fr)?.[0] ?? cat.id
            const isActive = activeCategoryId === cat.id
            return (
              <Link
                key={cat.id}
                href={`/artisans?category=${catSlug}`}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  isActive
                    ? 'bg-[#1A6B4A] text-white border-[#1A6B4A]'
                    : 'bg-white text-gray-600 border-[#EBEBEB] hover:border-[#1A6B4A] hover:text-[#1A6B4A]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{isRTL ? cat.name_ar : cat.name_fr}</span>
              </Link>
            )
          })}
        </div>

        {/* ── RESULTS COUNT ── */}
        <p className="text-sm text-gray-500 mb-5">
          {filteredProviders.length}{' '}
          {isRTL ? 'حرفي موثق' : `artisan${filteredProviders.length !== 1 ? 's' : ''} vérifié${filteredProviders.length !== 1 ? 's' : ''}`}
        </p>

        {/* ── PROVIDER GRID ── */}
        {filteredProviders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-[#EBEBEB]">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-700 font-semibold text-lg">{t.noResults}</p>
            <Link
              href="/artisans"
              className="inline-block mt-4 text-[#1A6B4A] text-sm font-medium hover:underline"
            >
              {isRTL ? 'عرض جميع الحرفيين' : 'Voir tous les artisans'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProviders.map((provider) => {
              const name = (provider.profile as any)?.full_name ?? (isRTL ? 'حرفي' : 'Artisan')
              const cityName = isRTL
                ? (provider.city as any)?.name_ar
                : (provider.city as any)?.name_fr
              const bio = isRTL ? provider.bio_ar : provider.bio_fr
              const tradeNames = provider.trade_ids
                ?.slice(0, 3)
                .map((id: string) => {
                  const cat = catMap[id]
                  return cat ? `${cat.icon} ${isRTL ? cat.name_ar : cat.name_fr}` : null
                })
                .filter(Boolean) ?? []

              return (
                <div
                  key={provider.id}
                  className="bg-white rounded-2xl border border-[#EBEBEB] hover:border-[#1A6B4A]/40 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col"
                >
                  {/* Card header */}
                  <div className="bg-gradient-to-br from-[#1A6B4A]/8 to-[#1A6B4A]/4 px-5 pt-5 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-[#1A6B4A] rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                        <span className="text-xl font-bold text-white">
                          {name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h2 className="font-bold text-gray-900 truncate">{name}</h2>
                          <CheckCircle2 className="w-4 h-4 text-[#1A6B4A] flex-shrink-0" />
                        </div>
                        {provider.business_name && (
                          <p className="text-xs text-gray-500 mt-0.5 truncate">{provider.business_name}</p>
                        )}
                        {cityName && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{cityName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4 flex-1 flex flex-col gap-3">
                    {/* Rating */}
                    {provider.review_count > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-[#E8A838] fill-[#E8A838]" />
                        <span className="font-semibold text-gray-900 text-sm">
                          {(provider.avg_rating ?? 0).toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({provider.review_count} {t.reviews})
                        </span>
                      </div>
                    )}

                    {/* Trades */}
                    {tradeNames.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tradeNames.map((trade: string) => (
                          <span
                            key={trade}
                            className="bg-[#1A6B4A]/8 text-[#1A6B4A] text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {trade}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bio */}
                    {bio && (
                      <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
                        {bio}
                      </p>
                    )}

                    {/* Experience */}
                    {provider.years_experience > 0 && (
                      <p className="text-xs text-gray-400">
                        {provider.years_experience}+ {t.yearsExp}
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="px-5 pb-5">
                    <Link
                      href="/auth"
                      className="w-full flex items-center justify-center gap-2 bg-[#1A6B4A] hover:bg-[#155c3e] text-white font-semibold py-3 rounded-xl transition-all duration-200 text-sm shadow-sm shadow-[#1A6B4A]/20"
                    >
                      {t.contactCta}
                      <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── BOTTOM CTA ── */}
        <div className="mt-12 bg-gradient-to-br from-[#1A6B4A] to-[#155c3e] rounded-3xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            {isRTL ? 'لم تجد ما تبحث عنه؟' : 'Vous ne trouvez pas ce qu\'il vous faut ?'}
          </h2>
          <p className="text-white/70 mb-6">
            {isRTL
              ? 'انشر طلبك ودع الحرفيين يتواصلون معك'
              : 'Publiez votre demande et laissez les artisans vous contacter'}
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-2 bg-[#E8A838] hover:bg-[#d4952e] text-white font-bold px-7 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-[#E8A838]/30"
          >
            {isRTL ? 'نشر طلب مجاناً' : 'Publier une demande gratuitement'}
            <ChevronRight className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="border-t border-[#EBEBEB] py-8 mt-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            {isRTL ? '← الرئيسية' : '← Retour à l\'accueil'}
          </Link>
          <p>{isRTL ? '© 2026 أنظار' : '© 2026 Anzar'}</p>
        </div>
      </footer>
    </div>
  )
}
