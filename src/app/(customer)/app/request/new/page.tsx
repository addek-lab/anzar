'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import type { Category, City, Neighborhood } from '@/types'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

export default function NewRequestPage() {
  const router = useRouter()
  const { locale, isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const [step, setStep] = useState<Step>(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])

  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [budgetText, setBudgetText] = useState('')
  const [cityId, setCityId] = useState('')
  const [neighborhoodId, setNeighborhoodId] = useState('')
  const [urgency, setUrgency] = useState<'urgent' | 'soon' | 'flexible'>('soon')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/v1/categories').then(r => r.json()).then(setCategories)
    fetch('/api/v1/cities').then(r => r.json()).then(setCities)
  }, [])

  useEffect(() => {
    if (cityId) fetch(`/api/v1/neighborhoods?city_id=${cityId}`).then(r => r.json()).then(setNeighborhoods)
  }, [cityId])

  const catName = (c: Category) => locale === 'ar' ? c.name_ar : c.name_fr
  const cityName = (c: City) => locale === 'ar' ? c.name_ar : c.name_fr
  const nbName = (n: Neighborhood) => locale === 'ar' ? n.name_ar : n.name_fr

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/v1/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category_id: categoryId, city_id: cityId, neighborhood_id: neighborhoodId || null, description, budget_text: budgetText || null, urgency }),
    })
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Erreur'); setSubmitting(false); return }
    const data = await res.json()
    router.push(`/app/requests/${data.id}?new=1`)
  }

  const canNext: Record<Step, boolean> = {
    1: !!categoryId, 2: description.trim().length >= 10, 3: !!cityId, 4: !!urgency, 5: true,
  }

  const stepTitles: Record<Step, string> = {
    1: isRTL ? 'ما الخدمة التي تبحث عنها؟' : 'Quel service cherchez-vous ?',
    2: isRTL ? 'صف حاجتك' : 'Décrivez votre besoin',
    3: isRTL ? 'أين تقع؟' : 'Où êtes-vous ?',
    4: isRTL ? 'ما مدى الاستعجال؟' : "Quelle est l'urgence ?",
    5: isRTL ? 'ملخص الطلب' : 'Récapitulatif',
  }

  const urgencyOptions = [
    { id: 'urgent' as const, emoji: '🚨', label_fr: "Urgent — aujourd'hui / demain", label_ar: 'عاجل — اليوم أو الغد' },
    { id: 'soon' as const, emoji: '📅', label_fr: 'Bientôt — cette semaine', label_ar: 'قريباً — هذا الأسبوع' },
    { id: 'flexible' as const, emoji: '🕐', label_fr: 'Flexible — pas pressé', label_ar: 'مرن — غير مستعجل' },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="px-5 pt-14 pb-5 border-b border-gray-50">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => step === 1 ? router.back() : setStep(s => (s - 1) as Step)}
            className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center"
          >
            <BackIcon size={18} className="text-gray-600" />
          </button>
          <div className="flex-1 flex gap-1.5">
            {[1,2,3,4,5].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${s <= step ? 'bg-[#1A6B4A]' : 'bg-gray-100'}`} />
            ))}
          </div>
          <span className="text-xs text-gray-400 font-medium w-10 text-end">
            {step}/5
          </span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{stepTitles[step]}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {/* Step 1: Category */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`p-5 rounded-3xl border-2 text-center transition-all duration-200 ${
                  categoryId === cat.id
                    ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 shadow-md shadow-[#1A6B4A]/10'
                    : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                }`}
              >
                <div className="text-4xl mb-3">{cat.icon}</div>
                <p className="text-sm font-semibold text-gray-800">{catName(cat)}</p>
                {categoryId === cat.id && (
                  <div className="w-5 h-5 bg-[#1A6B4A] rounded-full flex items-center justify-center mx-auto mt-2">
                    <Check size={11} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Description */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {isRTL ? 'الوصف *' : 'Description *'}
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder={isRTL ? 'صف مشكلتك أو حاجتك بالتفصيل...' : 'Décrivez votre problème ou besoin en détail...'}
                className="w-full h-36 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base resize-none"
                autoFocus
              />
              <p className="text-xs text-gray-400 mt-1.5 text-end">{description.length}/2000</p>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {isRTL ? 'الميزانية (اختياري)' : 'Budget (optionnel)'}
              </label>
              <input
                value={budgetText}
                onChange={e => setBudgetText(e.target.value)}
                placeholder={isRTL ? 'مثلاً: ~500 درهم، مرن...' : 'Ex: ~500 MAD, budget flexible...'}
                className="w-full h-13 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base"
              />
            </div>
          </div>
        )}

        {/* Step 3: Location */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-2">
              {cities.map(city => (
                <button
                  key={city.id}
                  onClick={() => { setCityId(city.id); setNeighborhoodId('') }}
                  className={`w-full p-4 rounded-2xl border-2 text-start font-semibold transition-all ${
                    cityId === city.id ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 text-[#1A6B4A]' : 'border-gray-100 bg-gray-50 text-gray-700'
                  }`}
                >
                  {cityName(city)}
                </button>
              ))}
            </div>
            {cityId && neighborhoods.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {isRTL ? 'الحي (اختياري)' : 'Quartier (optionnel)'}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto no-scrollbar">
                  {neighborhoods.map(nb => (
                    <button
                      key={nb.id}
                      onClick={() => setNeighborhoodId(neighborhoodId === nb.id ? '' : nb.id)}
                      className={`p-3 rounded-2xl border-2 text-sm text-start transition-all ${
                        neighborhoodId === nb.id ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 text-[#1A6B4A] font-medium' : 'border-gray-100 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {nbName(nb)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Urgency */}
        {step === 4 && (
          <div className="space-y-3">
            {urgencyOptions.map(u => (
              <button
                key={u.id}
                onClick={() => setUrgency(u.id)}
                className={`w-full p-5 rounded-3xl border-2 text-start transition-all duration-200 ${
                  urgency === u.id
                    ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 shadow-md shadow-[#1A6B4A]/10'
                    : 'border-gray-100 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{u.emoji}</span>
                  <p className="font-semibold text-gray-900 flex-1">
                    {isRTL ? u.label_ar : u.label_fr}
                  </p>
                  {urgency === u.id && (
                    <div className="w-6 h-6 bg-[#1A6B4A] rounded-full flex items-center justify-center">
                      <Check size={13} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-3xl p-5 space-y-4">
              {[
                { label: isRTL ? 'الخدمة' : 'Service', value: catName(categories.find(c => c.id === categoryId)!) },
                { label: isRTL ? 'الوصف' : 'Description', value: description },
                { label: isRTL ? 'المدينة' : 'Ville', value: cityName(cities.find(c => c.id === cityId)!) },
                { label: isRTL ? 'الاستعجال' : 'Urgence', value: isRTL ? urgencyOptions.find(u => u.id === urgency)?.label_ar : urgencyOptions.find(u => u.id === urgency)?.label_fr },
                ...(budgetText ? [{ label: isRTL ? 'الميزانية' : 'Budget', value: budgetText }] : []),
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
                </div>
              ))}
            </div>
            {error && (
              <div className="bg-red-50 rounded-2xl p-4">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 pb-10 pt-4 border-t border-gray-50">
        {step < 5 ? (
          <button
            onClick={() => setStep(s => (s + 1) as Step)}
            disabled={!canNext[step]}
            className="w-full bg-[#1A6B4A] text-white h-14 rounded-2xl font-semibold text-base shadow-lg shadow-[#1A6B4A]/25 hover:bg-[#155c3e] active:scale-[0.98] transition-all disabled:opacity-40 disabled:shadow-none"
          >
            {isRTL ? 'التالي →' : 'Suivant →'}
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#1A6B4A] text-white h-14 rounded-2xl font-semibold text-base shadow-lg shadow-[#1A6B4A]/25 hover:bg-[#155c3e] active:scale-[0.98] transition-all disabled:opacity-40"
          >
            {submitting ? '...' : (isRTL ? 'نشر الطلب ✓' : 'Publier ma demande ✓')}
          </button>
        )}
      </div>
    </div>
  )
}
