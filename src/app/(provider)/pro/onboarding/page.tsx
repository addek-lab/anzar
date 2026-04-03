'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import { createClient } from '@/lib/supabase/client'
import type { Category, City, Neighborhood } from '@/types'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

export default function ProviderOnboardingPage() {
  const router = useRouter()
  const { locale, isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const [step, setStep] = useState<Step>(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])

  const [fullName, setFullName] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [bioFr, setBioFr] = useState('')
  const [tradeIds, setTradeIds] = useState<string[]>([])
  const [cityId, setCityId] = useState('')
  const [neighborhoodIds, setNeighborhoodIds] = useState<string[]>([])
  const [yearsExp, setYearsExp] = useState(0)
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
  const nbName = (n: Neighborhood) => locale === 'ar' ? n.name_ar : n.name_fr

  function toggleTrade(id: string) {
    setTradeIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : prev.length < 3 ? [...prev, id] : prev)
  }
  function toggleNeighborhood(id: string) {
    setNeighborhoodIds(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id])
  }

  const canNext: Record<Step, boolean> = {
    1: fullName.trim().length >= 2,
    2: tradeIds.length >= 1,
    3: !!cityId,
    4: bioFr.trim().length >= 5,
    5: true,
  }

  const stepTitles: Record<Step, string> = {
    1: isRTL ? 'المعلومات الشخصية' : 'Informations personnelles',
    2: isRTL ? 'مهنك (حتى 3)' : 'Vos métiers (max 3)',
    3: isRTL ? 'منطقة العمل' : "Zone d'intervention",
    4: isRTL ? 'تجربتك' : 'Votre expérience',
    5: isRTL ? 'ملخص' : 'Récapitulatif',
  }

  async function handleSubmit() {
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setError('Session expirée'); setSubmitting(false); router.push('/auth/phone'); return }

    const res = await fetch('/api/v1/provider/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
      body: JSON.stringify({
        full_name: fullName,
        business_name: businessName || null,
        bio_fr: bioFr,
        trade_ids: tradeIds,
        city_id: cityId,
        neighborhood_ids: neighborhoodIds,
        years_experience: yearsExp,
      }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.message ?? data.error ?? 'Erreur')
      return
    }

    router.push('/pro/onboarding/pending')
  }

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
          <span className="text-xs text-gray-400 font-medium">{step}/5</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{stepTitles[step]}</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 pb-32">

        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {isRTL ? 'الاسم الكامل *' : 'Nom complet *'}
              </label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Mohamed Amine"
                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base"
                autoFocus
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {isRTL ? 'الاسم التجاري (اختياري)' : 'Nom commercial (optionnel)'}
              </label>
              <input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder="Élec Pro Casa"
                className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base"
              />
            </div>
          </div>
        )}

        {/* Step 2: Trades */}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-3">
            {categories.map(cat => {
              const selected = tradeIds.includes(cat.id)
              const disabled = !selected && tradeIds.length >= 3
              return (
                <button
                  key={cat.id}
                  onClick={() => !disabled && toggleTrade(cat.id)}
                  className={`p-5 rounded-3xl border-2 text-center transition-all ${
                    selected ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 shadow-md' : 'border-gray-100 bg-gray-50'
                  } ${disabled ? 'opacity-30' : ''}`}
                >
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <p className="text-sm font-semibold text-gray-800">{catName(cat)}</p>
                  {selected && (
                    <div className="w-5 h-5 bg-[#1A6B4A] rounded-full flex items-center justify-center mx-auto mt-2">
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Step 3: City + neighborhoods */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {isRTL ? 'المدينة *' : 'Ville *'}
              </p>
              {cities.map(city => (
                <button
                  key={city.id}
                  onClick={() => { setCityId(city.id); setNeighborhoodIds([]) }}
                  className={`w-full p-4 rounded-2xl border-2 text-start font-semibold transition-all ${
                    cityId === city.id ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 text-[#1A6B4A]' : 'border-gray-100 bg-gray-50 text-gray-700'
                  }`}
                >
                  {locale === 'ar' ? city.name_ar : city.name_fr}
                </button>
              ))}
            </div>
            {cityId && neighborhoods.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  {isRTL ? 'الأحياء (اختياري)' : 'Quartiers desservis (optionnel)'}
                </p>
                <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto no-scrollbar">
                  {neighborhoods.map(nb => (
                    <button
                      key={nb.id}
                      onClick={() => toggleNeighborhood(nb.id)}
                      className={`p-3 rounded-2xl border-2 text-sm text-start transition-all ${
                        neighborhoodIds.includes(nb.id) ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 text-[#1A6B4A] font-medium' : 'border-gray-100 bg-gray-50 text-gray-600'
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

        {/* Step 4: Experience + bio */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">
                {isRTL ? 'سنوات الخبرة' : "Années d'expérience"}
              </p>
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3, 5, 7, 10, 15, 20].map(y => (
                  <button
                    key={y}
                    onClick={() => setYearsExp(y)}
                    className={`px-4 py-2.5 rounded-2xl border-2 text-sm font-semibold transition-all ${
                      yearsExp === y ? 'border-[#1A6B4A] bg-[#1A6B4A] text-white' : 'border-gray-100 bg-gray-50 text-gray-700'
                    }`}
                  >
                    {y === 0 ? (isRTL ? 'مبتدئ' : 'Débutant') : `${y}+`}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                {isRTL ? 'نبذة عنك *' : 'Présentation *'}
              </label>
              <textarea
                value={bioFr}
                onChange={e => setBioFr(e.target.value)}
                placeholder={isRTL ? 'صف خبرتك وتخصصاتك...' : 'Décrivez votre expérience et vos spécialités...'}
                className="w-full h-36 bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base resize-none"
              />
              <p className="text-xs text-gray-400 mt-1 text-end">{bioFr.length}/1000</p>
            </div>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-3xl p-5 space-y-4">
              {[
                { label: isRTL ? 'الاسم' : 'Nom', value: fullName },
                { label: isRTL ? 'المهن' : 'Métiers', value: tradeIds.map(id => catName(categories.find(c => c.id === id)!)).join(', ') },
                { label: isRTL ? 'المدينة' : 'Ville', value: (() => { const c = cities.find(c => c.id === cityId); return c ? (isRTL ? c.name_ar : c.name_fr) : '' })() },
                { label: isRTL ? 'الخبرة' : 'Expérience', value: yearsExp === 0 ? (isRTL ? 'مبتدئ' : 'Débutant') : `${yearsExp}+ ${isRTL ? 'سنوات' : 'ans'}` },
                { label: isRTL ? 'نبذة' : 'Présentation', value: bioFr },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-medium text-gray-900 mt-1 line-clamp-3">{value}</p>
                </div>
              ))}
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
              <p className="text-sm text-amber-800">
                {isRTL ? '⏳ سيتم مراجعة ملفك خلال 24-48 ساعة.' : '⏳ Votre profil sera vérifié sous 24-48h.'}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-50 px-5 py-4">
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
            {submitting ? '...' : (isRTL ? 'إرسال للتحقق ✓' : 'Soumettre pour vérification ✓')}
          </button>
        )}
      </div>
    </div>
  )
}
