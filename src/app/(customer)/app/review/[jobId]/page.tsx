'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { toast } from 'sonner'

type JobInfo = {
  provider_name: string
  category_name: string
  category_icon: string
}

export default function ReviewPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const router = useRouter()
  const { isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const [token, setToken] = useState<string | null>(null)
  const [jobInfo, setJobInfo] = useState<JobInfo | null>(null)
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setToken(session.access_token)

      // Load job info
      const { data: job } = await supabase
        .from('jobs')
        .select(`
          service_requests(category:categories(name_fr, name_ar, icon)),
          provider_profiles(profile:profiles(full_name), business_name)
        `)
        .eq('id', jobId)
        .single()

      if (job) {
        const req = (job as any).service_requests
        const pp = (job as any).provider_profiles
        setJobInfo({
          provider_name: pp?.business_name || pp?.profile?.full_name || (isRTL ? 'الحرفي' : 'L\'artisan'),
          category_name: isRTL ? req?.category?.name_ar : req?.category?.name_fr,
          category_icon: req?.category?.icon ?? '🔧',
        })
      }

      // Check if already reviewed
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('job_id', jobId)
        .eq('reviewer_id', session.user.id)
        .single()

      if (existing) setAlreadyReviewed(true)
    })
  }, [jobId, router, isRTL])

  const submit = async () => {
    if (!token || rating === 0 || submitting) return
    setSubmitting(true)
    const res = await fetch('/api/v1/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ job_id: jobId, rating, comment: comment.trim() || undefined }),
    })
    if (res.ok) {
      toast.success(isRTL ? '🌟 شكراً على تقييمك!' : '🌟 Merci pour votre avis !')
      router.push('/app')
    } else {
      const err = await res.json()
      toast.error(err.error || (isRTL ? 'حدث خطأ' : 'Une erreur est survenue'))
    }
    setSubmitting(false)
  }

  if (alreadyReviewed) {
    return (
      <div className="min-h-screen bg-[#F7F7F5] flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full shadow-sm">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-xl font-bold text-gray-900">
            {isRTL ? 'لقد قيّمت بالفعل' : 'Avis déjà soumis'}
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            {isRTL ? 'لقد أرسلت تقييمك لهذه المهمة' : 'Vous avez déjà laissé un avis pour cette mission.'}
          </p>
          <button
            onClick={() => router.push('/app')}
            className="mt-6 w-full bg-[#1A6B4A] text-white rounded-2xl py-3.5 font-semibold"
          >
            {isRTL ? 'الرئيسية' : 'Retour à l\'accueil'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5]" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50"
        >
          <BackIcon size={18} className="text-gray-600" />
        </button>
        <h1 className="font-bold text-gray-900">
          {isRTL ? 'تقييم الخدمة' : 'Évaluer la prestation'}
        </h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Provider info */}
        {jobInfo && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50 text-center">
            <div className="w-16 h-16 bg-[#1A6B4A]/10 rounded-full mx-auto flex items-center justify-center text-3xl mb-3">
              {jobInfo.category_icon}
            </div>
            <p className="font-bold text-gray-900 text-lg">{jobInfo.provider_name}</p>
            <p className="text-sm text-gray-400 mt-0.5">{jobInfo.category_name}</p>
          </div>
        )}

        {/* Stars */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
          <p className="text-center font-semibold text-gray-700 mb-5">
            {isRTL ? 'كيف كانت الخدمة؟' : 'Comment s\'est passée la prestation ?'}
          </p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="transition-transform active:scale-90"
              >
                <Star
                  size={44}
                  className={`transition-colors ${
                    star <= (hovered || rating)
                      ? 'fill-[#E8A838] text-[#E8A838]'
                      : 'fill-gray-100 text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-center mt-3 text-sm font-medium text-gray-500">
              {rating === 1 ? (isRTL ? 'سيء' : 'Mauvais') :
               rating === 2 ? (isRTL ? 'مقبول' : 'Passable') :
               rating === 3 ? (isRTL ? 'جيد' : 'Bien') :
               rating === 4 ? (isRTL ? 'جيد جداً' : 'Très bien') :
               (isRTL ? 'ممتاز!' : 'Excellent !')}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            {isRTL ? 'تعليق (اختياري)' : 'Commentaire (optionnel)'}
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder={isRTL ? 'شاركنا تجربتك...' : 'Partagez votre expérience...'}
            rows={4}
            maxLength={500}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all resize-none"
          />
          <p className="text-xs text-gray-300 mt-1 text-end">{comment.length}/500</p>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={rating === 0 || submitting}
          className="w-full bg-[#1A6B4A] text-white rounded-2xl py-4 font-bold text-base disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-[#1A6B4A]/20"
        >
          {submitting
            ? (isRTL ? 'جارٍ الإرسال...' : 'Envoi en cours...')
            : (isRTL ? 'إرسال التقييم' : 'Envoyer mon avis')}
        </button>

        <p className="text-center text-xs text-gray-400">
          {isRTL
            ? 'تقييمك يساعد الحرفيين على تحسين خدماتهم'
            : 'Votre avis aide les artisans à s\'améliorer'}
        </p>
      </div>
    </div>
  )
}
