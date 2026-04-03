import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'

export default async function ProviderMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const { data: pp } = await supabase.from('provider_profiles').select('id').eq('profile_id', user!.id).single()

  const { data: conversations } = pp ? await supabase
    .from('conversations')
    .select('*, request:service_requests(*, category:categories(name_fr, name_ar, icon)), customer:profiles!conversations_customer_id_fkey(full_name)')
    .eq('provider_id', pp.id)
    .order('created_at', { ascending: false }) : { data: [] }

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white px-5 pt-16 pb-5 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">{isRTL ? 'الرسائل' : 'Messages'}</h1>
      </div>
      <div className="p-4 space-y-2">
        {conversations && conversations.length > 0 ? conversations.map((conv: any) => {
          const catName = isRTL ? conv.request?.category?.name_ar : conv.request?.category?.name_fr
          const customerName = conv.customer?.full_name ?? (isRTL ? 'عميل' : 'Client')
          return (
            <Link key={conv.id} href={`/pro/messages/${conv.id}`}>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex items-center gap-3">
                <div className="w-11 h-11 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-bold text-[#1A6B4A]">{customerName.charAt(0)}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{customerName}</p>
                  <p className="text-sm text-gray-400">{conv.request?.category?.icon} {catName}</p>
                </div>
              </div>
            </Link>
          )
        }) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-semibold text-gray-700">{isRTL ? 'لا توجد رسائل' : 'Aucun message'}</p>
            <p className="text-sm text-gray-400 mt-1">{isRTL ? 'ستظهر هنا محادثاتك مع العملاء' : 'Vos conversations avec les clients apparaîtront ici'}</p>
          </div>
        )}
      </div>
    </div>
  )
}
