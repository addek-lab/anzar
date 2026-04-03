'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from '@/hooks/useLocale'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, ChevronRight, ChevronLeft } from 'lucide-react'

type Job = {
  id: string
  status: 'active' | 'completed' | 'disputed' | 'cancelled'
  created_at: string
  completed_at: string | null
  offer: {
    price_mad: number
    description: string
  } | null
  provider_profile: {
    business_name: string | null
    profile: { full_name: string | null } | null
  } | null
  request: {
    category: { name_fr: string; name_ar: string; icon: string } | null
  } | null
}

const statusConfig = {
  active:    { label_fr: 'En cours',  label_ar: 'جارٍ',     color: 'bg-blue-50 text-blue-600',   dot: 'bg-blue-400' },
  completed: { label_fr: 'Terminé',   label_ar: 'مكتمل',    color: 'bg-green-50 text-green-600', dot: 'bg-green-400' },
  disputed:  { label_fr: 'Litige',    label_ar: 'نزاع',     color: 'bg-red-50 text-red-600',     dot: 'bg-red-400' },
  cancelled: { label_fr: 'Annulé',    label_ar: 'ملغى',     color: 'bg-gray-100 text-gray-500',  dot: 'bg-gray-400' },
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />
      ))}
    </div>
  )
}

export default function CustomerJobsPage() {
  const router = useRouter()
  const { isRTL } = useLocale()
  const ChevronEnd = isRTL ? ChevronLeft : ChevronRight

  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      const token = session.access_token
      try {
        const res = await fetch('/api/v1/jobs', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error('fetch_error')
        const data = await res.json()
        setJobs(data)
      } catch {
        setError(isRTL ? 'خطأ في تحميل المهام' : 'Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    })
  }, [router, isRTL])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(isRTL ? 'ar-MA' : 'fr-MA', { day: 'numeric', month: 'short' })

  return (
    <div className="min-h-screen bg-[#F7F7F5]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4">
        <h1 className="text-xl font-bold text-gray-900">
          {isRTL ? 'مهامي' : 'Mes missions'}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {isRTL ? 'تتبع أعمالك الجارية والمكتملة' : 'Suivez vos travaux en cours et terminés'}
        </p>
      </div>

      <div className="px-4 py-5">
        {loading ? (
          <Skeleton />
        ) : error ? (
          <div className="bg-red-50 text-red-600 rounded-2xl p-4 text-sm text-center">{error}</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-50 mt-4">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center mb-4">
              <Briefcase size={28} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-900">
              {isRTL ? 'لا توجد مهام بعد' : 'Aucune mission pour le moment'}
            </p>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              {isRTL
                ? 'قبول عرض من حرفي لبدء مهمة'
                : "Acceptez une offre d'un artisan pour démarrer une mission"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {jobs.map(job => {
              const st = statusConfig[job.status] ?? statusConfig.active
              const catName = isRTL
                ? job.request?.category?.name_ar
                : job.request?.category?.name_fr
              const providerName =
                job.provider_profile?.business_name ??
                job.provider_profile?.profile?.full_name ??
                (isRTL ? 'حرفي' : 'Artisan')

              return (
                <Link key={job.id} href={`/app/jobs/${job.id}`}>
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 hover:shadow-md transition-all active:scale-[0.99] flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center flex-shrink-0 text-2xl">
                      {job.request?.category?.icon ?? '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{catName ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{providerName}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {isRTL ? st.label_ar : st.label_fr}
                        </span>
                        {job.offer?.price_mad && (
                          <span className="text-xs text-gray-400">{job.offer.price_mad} MAD</span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <p className="text-xs text-gray-300">{formatDate(job.created_at)}</p>
                      <ChevronEnd size={16} className="text-gray-300" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
