import { createClient } from '@/lib/supabase/server'
import { getTranslations, getLocale } from 'next-intl/server'
import Link from 'next/link'
import RequestStatusBadge from '@/components/shared/RequestStatusBadge'
import type { RequestStatus } from '@/types'

export default async function RequestsPage() {
  const t = await getTranslations()
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: requests } = await supabase
    .from('service_requests')
    .select(`
      *,
      category:categories(name_fr, name_ar, icon),
      city:cities(name_fr, name_ar),
      neighborhood:neighborhoods(name_fr, name_ar)
    `)
    .eq('customer_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">{t('customer.myRequests')}</h1>
      </div>

      <div className="p-4 space-y-3">
        <Link
          href="/app/request/new"
          className="flex items-center justify-center gap-2 w-full bg-[#1A6B4A] text-white rounded-xl py-3.5 font-semibold"
        >
          + {t('customer.newRequest')}
        </Link>

        {requests && requests.length > 0 ? (
          requests.map((req: any) => {
            const catName = isRTL ? req.category?.name_ar : req.category?.name_fr
            const cityName = isRTL ? req.city?.name_ar : req.city?.name_fr
            const nbName = isRTL ? req.neighborhood?.name_ar : req.neighborhood?.name_fr
            return (
              <Link key={req.id} href={`/app/requests/${req.id}`}>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{req.category?.icon ?? '🔧'}</span>
                      <div>
                        <p className="font-semibold text-gray-900">{catName}</p>
                        <p className="text-sm text-gray-500">{cityName}{nbName ? ` · ${nbName}` : ''}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(req.created_at).toLocaleDateString(isRTL ? 'ar-MA' : 'fr-MA')}
                        </p>
                      </div>
                    </div>
                    <RequestStatusBadge status={req.status as RequestStatus} />
                  </div>
                </div>
              </Link>
            )
          })
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-5xl mb-3">📋</div>
            <p className="font-medium text-gray-900">{t('customer.noRequests')}</p>
            <p className="text-sm text-gray-500 mt-1">{t('customer.noRequestsHint')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
