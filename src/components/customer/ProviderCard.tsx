'use client'

import Link from 'next/link'
import { Star, CheckCircle } from 'lucide-react'

interface Props {
  match: any
  requestId: string
  locale: string
}

export default function ProviderCard({ match, requestId, locale }: Props) {
  const provider = match.provider_profile
  const profile = provider?.profile
  const isRTL = locale === 'ar'
  const name = profile?.full_name ?? (isRTL ? 'حرفي موثق' : 'Artisan vérifié')
  const bio = locale === 'ar' ? provider?.bio_ar : provider?.bio_fr

  return (
    <Link href={`/app/artisan/${provider?.slug}?request_id=${requestId}`}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-[#1A6B4A]">
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 truncate">{name}</p>
              {provider?.status === 'verified' && (
                <CheckCircle size={16} className="text-[#1A6B4A] flex-shrink-0" />
              )}
            </div>
            {provider?.review_count > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <Star size={13} className="text-[#E8A838] fill-[#E8A838]" />
                <span className="text-sm font-medium text-gray-700">
                  {provider.avg_rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400">
                  ({provider.review_count} {isRTL ? 'تقييم' : 'avis'})
                </span>
              </div>
            )}
            {provider?.years_experience > 0 && (
              <p className="text-xs text-gray-500 mt-0.5">
                {provider.years_experience} {isRTL ? 'سنوات خبرة' : "ans d'expérience"}
              </p>
            )}
            {bio && (
              <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">{bio}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
