import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getTranslations, getLocale } from 'next-intl/server'
import { Plus, ChevronRight, Search } from 'lucide-react'

const statusConfig: Record<string, { label_fr: string; label_ar: string; color: string; dot: string }> = {
  open:        { label_fr: 'En attente',         label_ar: 'في الانتظار',       color: 'bg-amber-50 text-amber-600',   dot: 'bg-amber-400' },
  matched:     { label_fr: 'Artisans trouvés',   label_ar: 'تم العثور على حرفيين', color: 'bg-green-50 text-green-600',  dot: 'bg-green-400' },
  in_progress: { label_fr: 'En cours',           label_ar: 'جارٍ التنفيذ',      color: 'bg-blue-50 text-blue-600',    dot: 'bg-blue-400' },
  completed:   { label_fr: 'Terminé',            label_ar: 'مكتمل',             color: 'bg-gray-100 text-gray-500',   dot: 'bg-gray-400' },
  expired:     { label_fr: 'Expiré',             label_ar: 'منتهي',             color: 'bg-red-50 text-red-500',      dot: 'bg-red-400' },
  cancelled:   { label_fr: 'Annulé',             label_ar: 'ملغى',              color: 'bg-gray-100 text-gray-400',   dot: 'bg-gray-300' },
}

export default async function CustomerHomePage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const isRTL = locale === 'ar'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles').select('full_name').eq('id', user!.id).single()

  const { data: requests } = await supabase
    .from('service_requests')
    .select('*, category:categories(name_fr, name_ar, icon), neighborhood:neighborhoods(name_fr, name_ar)')
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const firstName = profile?.full_name?.split(' ')[0] ?? ''
  const activeRequests = requests?.filter(r => ['open','matched','in_progress'].includes(r.status)) ?? []
  const pastRequests = requests?.filter(r => ['completed','expired','cancelled'].includes(r.status)) ?? []

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#1A6B4A] px-5 pt-16 pb-24 relative overflow-hidden">
        <div className="absolute -top-10 -end-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -start-8 w-48 h-48 bg-white/5 rounded-full" />
        <p className="text-white/60 text-sm relative">
          {isRTL ? 'مرحباً،' : 'Bonjour,'}
        </p>
        <h1 className="text-white text-2xl font-bold mt-0.5 relative">
          {firstName || (isRTL ? 'مرحباً' : 'Bienvenue')} 👋
        </h1>
        <p className="text-white/50 text-sm mt-1 relative">
          {activeRequests.length > 0
            ? (isRTL ? `لديك ${activeRequests.length} طلب نشط` : `${activeRequests.length} demande${activeRequests.length > 1 ? 's' : ''} active${activeRequests.length > 1 ? 's' : ''}`)
            : (isRTL ? 'ليس لديك طلبات نشطة' : 'Aucune demande active')}
        </p>
      </div>

      <div className="px-4 -mt-12 pb-6 space-y-4">
        {/* New request CTA */}
        <Link href="/app/request/new">
          <div className="bg-white rounded-3xl p-5 shadow-xl shadow-black/5 border border-gray-50 hover:shadow-2xl hover:shadow-black/8 transition-all active:scale-[0.99]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#1A6B4A] to-[#155c3e] rounded-2xl flex items-center justify-center shadow-lg shadow-[#1A6B4A]/30 flex-shrink-0">
                <Plus size={24} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-base">{t('customer.newRequest')}</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {isRTL ? 'كهربائي، سباك، دهان...' : 'Électricien, Plombier, Peintre...'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center">
                <ChevronRight size={16} className={`text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </div>
        </Link>

        {/* Active requests */}
        {activeRequests.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="font-bold text-gray-900">{isRTL ? 'الطلبات النشطة' : 'Demandes actives'}</p>
              <Link href="/app/requests" className="text-sm text-[#1A6B4A] font-medium">
                {isRTL ? 'الكل' : 'Tout voir'}
              </Link>
            </div>
            <div className="space-y-2.5">
              {activeRequests.map((req: any) => {
                const st = statusConfig[req.status]
                const catName = isRTL ? req.category?.name_ar : req.category?.name_fr
                const nbName = isRTL ? req.neighborhood?.name_ar : req.neighborhood?.name_fr
                return (
                  <Link key={req.id} href={`/app/requests/${req.id}`}>
                    <div className="bg-white rounded-2xl p-4 shadow-sm shadow-black/3 border border-gray-50 hover:shadow-md transition-all active:scale-[0.99]">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
                          {req.category?.icon ?? '🔧'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 text-sm">{catName}</p>
                          {nbName && <p className="text-xs text-gray-400 mt-0.5">{nbName}</p>}
                        </div>
                        <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {isRTL ? st.label_ar : st.label_fr}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {(!requests || requests.length === 0) && (
          <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-gray-50">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center mb-4">
              <Search size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-900">{t('customer.noRequests')}</p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">{t('customer.noRequestsHint')}</p>
          </div>
        )}

        {/* Past requests */}
        {pastRequests.length > 0 && (
          <div>
            <p className="font-bold text-gray-900 mb-3 px-1">{isRTL ? 'السابقة' : 'Historique'}</p>
            <div className="space-y-2">
              {pastRequests.slice(0, 3).map((req: any) => {
                const st = statusConfig[req.status]
                const catName = isRTL ? req.category?.name_ar : req.category?.name_fr
                return (
                  <Link key={req.id} href={`/app/requests/${req.id}`}>
                    <div className="bg-white/60 rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                      <span className="text-xl">{req.category?.icon ?? '🔧'}</span>
                      <p className="text-sm text-gray-500 flex-1">{catName}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                        {isRTL ? st.label_ar : st.label_fr}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
