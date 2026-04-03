'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Star, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

type Job = {
  id: string
  status: 'active' | 'completed' | 'disputed' | 'cancelled'
  created_at: string
  completed_at: string | null
  customer_id: string
  service_request: {
    description: string
    category: { name_fr: string; name_ar: string; icon: string } | null
    city: { name_fr: string; name_ar: string } | null
    neighborhood: { name_fr: string; name_ar: string } | null
  } | null
  offer: {
    price_mad: number
    description: string
    estimated_duration: string | null
    status: string
  } | null
  provider: {
    id: string
    business_name: string | null
    avg_rating: number
    review_count: number
    jobs_completed: number
    bio_fr: string | null
    bio_ar: string | null
  } | null
}

const statusConfig = {
  active:    { label_fr: 'En cours',  label_ar: 'جارٍ',     color: 'bg-blue-50 text-blue-600' },
  completed: { label_fr: 'Terminé',   label_ar: 'مكتمل',    color: 'bg-green-50 text-green-600' },
  disputed:  { label_fr: 'Litige',    label_ar: 'نزاع',     color: 'bg-red-50 text-red-600' },
  cancelled: { label_fr: 'Annulé',    label_ar: 'ملغى',     color: 'bg-gray-100 text-gray-500' },
}

function Skeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
    </div>
  )
}

export default function CustomerJobDetailPage() {
  const params = useParams()
  const jobId = params.id as string
  const router = useRouter()
  const { isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setToken(session.access_token)
      try {
        const res = await fetch(`/api/v1/jobs/${jobId}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
        if (!res.ok) throw new Error('not_found')
        const data = await res.json()
        setJob(data)
      } catch {
        setError(isRTL ? 'تعذر تحميل المهمة' : 'Impossible de charger la mission')
      } finally {
        setLoading(false)
      }
    })
  }, [jobId, router, isRTL])

  async function handleComplete() {
    if (!token || completing) return
    setCompleting(true)
    try {
      const res = await fetch(`/api/v1/jobs/${jobId}/complete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success(isRTL ? '✅ تم تمييز العمل كمكتمل' : '✅ Travail marqué comme terminé')
        // Navigate to review page
        setTimeout(() => router.push(`/app/review/${jobId}`), 800)
      } else {
        const data = await res.json()
        toast.error(data.error || (isRTL ? 'خطأ' : 'Erreur'))
      }
    } catch {
      toast.error(isRTL ? 'خطأ في الشبكة' : 'Erreur réseau')
    } finally {
      setCompleting(false)
    }
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(isRTL ? 'ar-MA' : 'fr-MA', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F7F5]" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
            <BackIcon size={18} className="text-gray-600" />
          </button>
          <div className="h-5 bg-gray-100 rounded w-32 animate-pulse" />
        </div>
        <Skeleton />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
            <BackIcon size={18} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="bg-red-50 text-red-600 rounded-2xl p-6 text-center text-sm">
            {error || (isRTL ? 'مهمة غير موجودة' : 'Mission introuvable')}
          </div>
        </div>
      </div>
    )
  }

  const st = statusConfig[job.status] ?? statusConfig.active
  const catName = isRTL ? job.service_request?.category?.name_ar : job.service_request?.category?.name_fr
  const cityName = isRTL ? job.service_request?.city?.name_ar : job.service_request?.city?.name_fr
  const nbName = isRTL ? job.service_request?.neighborhood?.name_ar : job.service_request?.neighborhood?.name_fr
  const providerBio = isRTL ? job.provider?.bio_ar : job.provider?.bio_fr

  return (
    <div className="min-h-screen bg-[#F7F7F5]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-14 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
            <BackIcon size={18} className="text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">{job.service_request?.category?.icon ?? '🔧'}</span>
              <h1 className="text-lg font-bold text-gray-900 truncate">{catName ?? '—'}</h1>
            </div>
            {(cityName || nbName) && (
              <p className="text-xs text-gray-400 mt-0.5">
                {cityName}{nbName ? ` · ${nbName}` : ''}
              </p>
            )}
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${st.color}`}>
            {isRTL ? st.label_ar : st.label_fr}
          </span>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4 pb-10">
        {/* Description */}
        {job.service_request?.description && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1.5">
              {isRTL ? 'وصف الطلب' : 'Description de la demande'}
            </p>
            <p className="text-sm text-gray-800 leading-relaxed">{job.service_request.description}</p>
          </div>
        )}

        {/* Offer */}
        {job.offer && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1A6B4A]/10">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              {isRTL ? 'تفاصيل العرض' : "Détails de l'offre"}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-[#1A6B4A]">{job.offer.price_mad}</span>
              <span className="text-sm text-gray-500 font-medium">MAD</span>
            </div>
            <p className="text-sm text-gray-700">{job.offer.description}</p>
            {job.offer.estimated_duration && (
              <p className="text-xs text-gray-400 mt-2">
                ⏱ {isRTL ? 'المدة المتوقعة:' : 'Durée estimée :'} {job.offer.estimated_duration}
              </p>
            )}
          </div>
        )}

        {/* Provider */}
        {job.provider && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">
              {isRTL ? 'الحرفي' : "L'artisan"}
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#1A6B4A] font-bold">
                  {(job.provider.business_name ?? '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">
                  {job.provider.business_name ?? (isRTL ? 'حرفي' : 'Artisan')}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  {job.provider.avg_rating > 0 && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Star size={12} fill="currentColor" />
                      {job.provider.avg_rating.toFixed(1)}
                      <span className="text-gray-400">({job.provider.review_count})</span>
                    </span>
                  )}
                  {job.provider.jobs_completed > 0 && (
                    <span className="text-xs text-gray-400">
                      {job.provider.jobs_completed} {isRTL ? 'مهمة' : 'missions'}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {providerBio && (
              <p className="text-xs text-gray-500 mt-3 leading-relaxed">{providerBio}</p>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-2.5">
          <p className="text-xs text-gray-400 uppercase tracking-wide">
            {isRTL ? 'التواريخ' : 'Dates'}
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">{isRTL ? 'تاريخ البدء' : 'Démarrage'}</span>
            <span className="font-medium text-gray-800">{formatDate(job.created_at)}</span>
          </div>
          {job.completed_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{isRTL ? 'تاريخ الانتهاء' : 'Terminé le'}</span>
              <span className="font-medium text-gray-800">{formatDate(job.completed_at)}</span>
            </div>
          )}
        </div>

        {/* Complete button */}
        {job.status === 'active' && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full bg-[#1A6B4A] text-white rounded-2xl py-4 text-base font-bold shadow-lg shadow-[#1A6B4A]/20 disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            {completing ? (
              <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={20} />
                {isRTL ? 'تمييز كمكتمل' : 'Marquer comme terminé'}
              </>
            )}
          </button>
        )}

        {/* Already completed — go to review */}
        {job.status === 'completed' && (
          <button
            onClick={() => router.push(`/app/review/${jobId}`)}
            className="w-full border-2 border-[#1A6B4A] text-[#1A6B4A] rounded-2xl py-3.5 text-base font-semibold active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Star size={18} />
            {isRTL ? 'ترك تقييم' : 'Laisser un avis'}
          </button>
        )}
      </div>
    </div>
  )
}
