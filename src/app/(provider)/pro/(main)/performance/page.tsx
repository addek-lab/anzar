import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import { CheckCircle2, Circle, TrendingUp, Star, MessageSquare, Briefcase, User } from 'lucide-react'

export default async function PerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const { data: pp } = await supabase.from('provider_profiles')
    .select('*')
    .eq('profile_id', user!.id)
    .single()

  // Compute response rate from leads data (offers sent vs leads received)
  const { count: leadsCount } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', pp?.id ?? '')

  const { count: offersCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', pp?.id ?? '')

  const { count: acceptedOffersCount } = await supabase
    .from('offers')
    .select('id', { count: 'exact', head: true })
    .eq('provider_id', pp?.id ?? '')
    .eq('status', 'accepted')

  const computedResponseRate = leadsCount && leadsCount > 0
    ? Math.round(((offersCount ?? 0) / leadsCount) * 100)
    : null

  const conversionRate = offersCount && offersCount > 0
    ? Math.round(((acceptedOffersCount ?? 0) / offersCount) * 100)
    : null

  // Use DB-stored response_rate if available, otherwise computed
  const responseRate = pp?.response_rate
    ? Math.round(pp.response_rate * 100)
    : computedResponseRate

  const stats = isRTL
    ? [
        { label: 'متوسط التقييم', value: pp?.avg_rating ? `${pp.avg_rating.toFixed(1)}` : '—', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', suffix: '★' },
        { label: 'عدد التقييمات', value: String(pp?.review_count ?? 0), icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', suffix: '' },
        { label: 'معدل الرد', value: responseRate !== null ? `${responseRate}%` : '—', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', suffix: '' },
        { label: 'معدل التحويل', value: conversionRate !== null ? `${conversionRate}%` : '—', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', suffix: '' },
        { label: 'مهام مكتملة', value: String(pp?.jobs_completed ?? 0), icon: Briefcase, color: 'text-[#1A6B4A]', bg: 'bg-[#1A6B4A]/8', suffix: '' },
        { label: 'عروض مقدمة', value: String(offersCount ?? 0), icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', suffix: '' },
      ]
    : [
        { label: 'Note moyenne', value: pp?.avg_rating ? `${pp.avg_rating.toFixed(1)}` : '—', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50', suffix: '★' },
        { label: 'Avis reçus', value: String(pp?.review_count ?? 0), icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50', suffix: '' },
        { label: 'Taux de réponse', value: responseRate !== null ? `${responseRate}%` : '—', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', suffix: '' },
        { label: 'Taux de conversion', value: conversionRate !== null ? `${conversionRate}%` : '—', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50', suffix: '' },
        { label: 'Missions complétées', value: String(pp?.jobs_completed ?? 0), icon: Briefcase, color: 'text-[#1A6B4A]', bg: 'bg-[#1A6B4A]/8', suffix: '' },
        { label: 'Offres soumises', value: String(offersCount ?? 0), icon: MessageSquare, color: 'text-indigo-600', bg: 'bg-indigo-50', suffix: '' },
      ]

  // Profile strength checklist
  const checklistItems = isRTL
    ? [
        { label: 'اسم كامل', done: !!pp?.business_name || true },
        { label: 'صورة الملف الشخصي', done: !!pp?.avatar_url },
        { label: 'نبذة عنك', done: !!pp?.bio_fr || !!pp?.bio_ar },
        { label: 'تخصص واحد على الأقل', done: (pp?.trade_ids?.length ?? 0) > 0 },
        { label: 'منطقة العمل', done: !!pp?.city_id },
        { label: 'تقييم واحد على الأقل', done: (pp?.review_count ?? 0) > 0 },
      ]
    : [
        { label: 'Nom complet', done: true },
        { label: 'Photo de profil', done: !!pp?.avatar_url },
        { label: 'Présentation renseignée', done: !!pp?.bio_fr || !!pp?.bio_ar },
        { label: 'Au moins une spécialité', done: (pp?.trade_ids?.length ?? 0) > 0 },
        { label: 'Zone d\'intervention', done: !!pp?.city_id },
        { label: 'Au moins un avis', done: (pp?.review_count ?? 0) > 0 },
      ]

  const completedItems = checklistItems.filter(i => i.done).length
  const profileStrength = Math.round((completedItems / checklistItems.length) * 100)

  return (
    <div className="max-w-lg mx-auto pb-16" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white px-5 pt-16 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? 'الأداء' : 'Performances'}</h1>
        <p className="text-sm text-gray-400 mt-1">
          {isRTL ? 'إحصائياتك ومستوى ملفك الشخصي' : 'Vos statistiques et la qualité de votre profil'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="p-4 grid grid-cols-2 gap-3">
        {stats.map(s => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
              <div className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4.5 h-4.5 ${s.color}`} strokeWidth={2} size={18} />
              </div>
              <p className={`text-2xl font-bold text-gray-900 ${s.suffix ? 'flex items-baseline gap-1' : ''}`}>
                {s.value}
                {s.suffix && <span className={`text-lg ${s.color}`}>{s.suffix}</span>}
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-tight">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Profile strength */}
      <div className="mx-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#1A6B4A]" />
            <h2 className="font-bold text-gray-900 text-sm">
              {isRTL ? 'قوة الملف الشخصي' : 'Force du profil'}
            </h2>
          </div>
          <span className={`text-sm font-bold ${profileStrength >= 80 ? 'text-[#1A6B4A]' : profileStrength >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
            {profileStrength}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              profileStrength >= 80 ? 'bg-[#1A6B4A]' : profileStrength >= 50 ? 'bg-amber-500' : 'bg-red-400'
            }`}
            style={{ width: `${profileStrength}%` }}
          />
        </div>

        {/* Checklist */}
        <div className="space-y-2.5">
          {checklistItems.map(item => (
            <div key={item.label} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="w-5 h-5 text-[#1A6B4A] flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-300 flex-shrink-0" />
              )}
              <span className={`text-sm ${item.done ? 'text-gray-700' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {!item.done && (
                <span className="ms-auto text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                  {isRTL ? 'ناقص' : 'À compléter'}
                </span>
              )}
            </div>
          ))}
        </div>

        {profileStrength < 100 && (
          <p className="text-xs text-gray-400 mt-4 leading-relaxed">
            {isRTL
              ? 'الملفات الكاملة تحصل على 3 أضعاف الطلبات'
              : 'Les profils complets reçoivent 3× plus de demandes'}
          </p>
        )}
      </div>
    </div>
  )
}
