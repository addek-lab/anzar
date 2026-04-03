'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import { Clock, MapPin } from 'lucide-react'

interface Props {
  lead: any
  locale: string
  providerId: string // reserved for future use
}

export default function LeadCard({ lead, locale, providerId: _providerId }: Props) {
  const request = lead.request
  const isRTL = locale === 'ar'
  const catName = isRTL ? request?.category?.name_ar : request?.category?.name_fr
  const cityName = isRTL ? request?.city?.name_ar : request?.city?.name_fr
  const nbName = isRTL ? request?.neighborhood?.name_ar : request?.neighborhood?.name_fr

  const timeAgo = formatDistanceToNow(new Date(request?.created_at), {
    locale: locale === 'ar' ? ar : fr,
    addSuffix: true,
  })

  const urgencyColors = {
    urgent: 'bg-red-100 text-red-600',
    soon: 'bg-orange-100 text-orange-600',
    flexible: 'bg-green-100 text-green-600',
  }

  return (
    <Link href={`/pro/leads/${lead.id}`}>
      <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{request?.category?.icon ?? '🔧'}</span>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-gray-900">{catName}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${urgencyColors[request?.urgency as keyof typeof urgencyColors] ?? ''}`}>
                {isRTL
                  ? { urgent: 'عاجل', soon: 'قريباً', flexible: 'مرن' }[request?.urgency as string] ?? ''
                  : { urgent: 'Urgent', soon: 'Bientôt', flexible: 'Flexible' }[request?.urgency as string] ?? ''}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {cityName}{nbName ? ` · ${nbName}` : ''}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={11} />
                {timeAgo}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{request?.description}</p>
          </div>
        </div>
      </div>
    </Link>
  )
}
