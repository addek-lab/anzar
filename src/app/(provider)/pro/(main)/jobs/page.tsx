'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import { createClient } from '@/lib/supabase/client'
import { Briefcase, CheckCircle2, Clock } from 'lucide-react'
import { toast } from 'sonner'

type Job = {
  id: string
  status: 'active' | 'completed' | 'disputed' | 'cancelled'
  created_at: string
  completed_at: string | null
  offer: { price_mad: number } | null
  service_request: {
    description: string
    category: { name_fr: string; name_ar: string; icon: string } | null
  } | null
  customer_profile: { full_name: string | null } | null
}

export default function ProviderJobsPage() {
  const router = useRouter()
  const { isRTL } = useLocale()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setToken(session.access_token)
    })
  }, [router])

  const load = async (t: string) => {
    const res = await fetch('/api/v1/jobs', {
      headers: { Authorization: `Bearer ${t}` },
    })
    if (res.ok) setJobs(await res.json())
    setLoading(false)
  }

  useEffect(() => {
    if (!token) return
    load(token)
  }, [token])

  const markComplete = async (jobId: string) => {
    if (!token || completing) return
    setCompleting(jobId)
    const res = await fetch(`/api/v1/jobs/${jobId}/complete`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      toast.success(isRTL ? '🎉 تم إكمال المهمة!' : '🎉 Mission terminée !')
      load(token)
    } else {
      toast.error(isRTL ? 'حدث خطأ' : 'Une erreur est survenue')
    }
    setCompleting(null)
  }

  const active = jobs.filter(j => j.status === 'active')
  const done = jobs.filter(j => j.status !== 'active')

  const JobCard = ({ job }: { job: Job }) => {
    const catName = isRTL ? job.service_request?.category?.name_ar : job.service_request?.category?.name_fr
    const icon = job.service_request?.category?.icon ?? '🔧'

    return (
      <div className={`bg-white rounded-2xl p-4 shadow-sm border ${
        job.status === 'active' ? 'border-blue-100' : 'border-gray-50'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
            job.status === 'active' ? 'bg-blue-50' : 'bg-gray-50'
          }`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm">{catName}</p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {job.customer_profile?.full_name ?? (isRTL ? 'عميل' : 'Client')}
            </p>
            {job.offer?.price_mad && (
              <p className="text-sm font-bold text-[#1A6B4A] mt-1">{job.offer.price_mad} MAD</p>
            )}
          </div>
          <div className="flex-shrink-0">
            {job.status === 'active' ? (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
                <Clock size={11} /> {isRTL ? 'نشط' : 'Actif'}
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-600 flex items-center gap-1">
                <CheckCircle2 size={11} /> {isRTL ? 'مكتمل' : 'Terminé'}
              </span>
            )}
          </div>
        </div>

        {job.status === 'active' && (
          <button
            onClick={() => markComplete(job.id)}
            disabled={completing === job.id}
            className="mt-3 w-full bg-[#1A6B4A] text-white rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-all"
          >
            {completing === job.id
              ? (isRTL ? 'جارٍ...' : 'En cours...')
              : (isRTL ? '✅ تحديد كمكتمل' : '✅ Marquer comme terminé')}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto pb-28" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-[#1A6B4A] px-5 pt-14 pb-6">
        <h1 className="text-white text-xl font-bold">
          {isRTL ? 'مهامي' : 'Mes missions'}
        </h1>
        <p className="text-white/60 text-sm mt-0.5">
          {active.length > 0
            ? (isRTL ? `${active.length} مهمة نشطة` : `${active.length} mission${active.length > 1 ? 's' : ''} active${active.length > 1 ? 's' : ''}`)
            : (isRTL ? 'لا توجد مهام نشطة' : 'Aucune mission active')}
        </p>
      </div>

      <div className="px-4 -mt-2 pt-4 space-y-5">
        {loading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 animate-pulse h-24" />
            ))}
          </div>
        )}

        {!loading && active.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3 px-1">
              {isRTL ? 'المهام النشطة' : 'Missions en cours'}
            </p>
            <div className="space-y-2.5">
              {active.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          </div>
        )}

        {!loading && active.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-50">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl mx-auto flex items-center justify-center mb-3">
              <Briefcase size={24} className="text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700">
              {isRTL ? 'لا توجد مهام نشطة' : 'Aucune mission en cours'}
            </p>
          </div>
        )}

        {!loading && done.length > 0 && (
          <div>
            <p className="text-sm font-bold text-gray-900 mb-3 px-1">
              {isRTL ? 'المهام المكتملة' : 'Missions terminées'}
            </p>
            <div className="space-y-2">
              {done.map(j => <JobCard key={j.id} job={j} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
