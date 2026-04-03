import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'

export default async function PerformancePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const { data: pp } = await supabase.from('provider_profiles')
    .select('avg_rating, review_count, response_rate, jobs_completed').eq('profile_id', user!.id).single()

  const stats = [
    { label: isRTL ? 'متوسط التقييم' : 'Note moyenne', value: pp?.avg_rating ? `⭐ ${pp.avg_rating.toFixed(1)}` : '—' },
    { label: isRTL ? 'عدد التقييمات' : 'Avis reçus', value: pp?.review_count ?? 0 },
    { label: isRTL ? 'معدل الرد' : 'Taux de réponse', value: pp?.response_rate ? `${Math.round(pp.response_rate * 100)}%` : '—' },
    { label: isRTL ? 'مهام مكتملة' : 'Missions complétées', value: pp?.jobs_completed ?? 0 },
  ]

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white px-5 pt-16 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? 'الأداء' : 'Performances'}</h1>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
