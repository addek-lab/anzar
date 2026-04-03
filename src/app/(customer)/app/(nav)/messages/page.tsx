import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import Link from 'next/link'

export default async function CustomerMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const { data: conversations } = await supabase
    .from('conversations')
    .select(`
      *,
      request:service_requests(*, category:categories(name_fr, name_ar, icon)),
      provider_profile:provider_profiles(*, profile:profiles(full_name))
    `)
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {isRTL ? 'الرسائل' : 'Messages'}
        </h1>
      </div>

      <div className="p-4 space-y-2">
        {conversations && conversations.length > 0 ? (
          conversations.map((conv: any) => {
            const catName = isRTL ? conv.request?.category?.name_ar : conv.request?.category?.name_fr
            const providerName = conv.provider_profile?.profile?.full_name ?? (isRTL ? 'حرفي' : 'Artisan')
            return (
              <Link key={conv.id} href={`/app/messages/${conv.id}`}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-[#1A6B4A]">
                        {providerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{providerName}</p>
                      <p className="text-sm text-gray-500">{conv.request?.category?.icon} {catName}</p>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="font-medium text-gray-600">
              {isRTL ? 'لا توجد رسائل بعد' : 'Aucun message pour le moment'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
