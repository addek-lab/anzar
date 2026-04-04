'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import {
  ChevronLeft, ChevronRight, Loader2, Check,
  Zap, Droplets, Paintbrush, Wind, Wrench, Hammer, CheckCircle,
} from 'lucide-react'

// ─── Static category data (IDs are stable DB values) ─────────────────────────
const CATEGORY_DEFS = [
  { id: '00000000-0000-0000-0000-000000000001', key: 'cat_electricien' as const, Icon: Zap,        iconCls: 'text-yellow-500', bgCls: 'bg-yellow-50' },
  { id: '00000000-0000-0000-0000-000000000002', key: 'cat_plombier'    as const, Icon: Droplets,   iconCls: 'text-blue-500',   bgCls: 'bg-blue-50'   },
  { id: '00000000-0000-0000-0000-000000000003', key: 'cat_peinture'    as const, Icon: Paintbrush, iconCls: 'text-pink-500',   bgCls: 'bg-pink-50'   },
  { id: '00000000-0000-0000-0000-000000000004', key: 'cat_clim'        as const, Icon: Wind,       iconCls: 'text-cyan-500',   bgCls: 'bg-cyan-50'   },
  { id: '00000000-0000-0000-0000-000000000005', key: 'cat_carreleur'   as const, Icon: Wrench,     iconCls: 'text-orange-500', bgCls: 'bg-orange-50' },
  { id: '00000000-0000-0000-0000-000000000006', key: 'cat_bricoleur'   as const, Icon: Hammer,     iconCls: 'text-green-600',  bgCls: 'bg-green-50'  },
]

const CITY_ID = '10000000-0000-0000-0000-000000000001'

type Step = 1 | 2 | 3 | 4 | 5
type Urgency = 'urgent' | 'soon' | 'flexible'

interface FormState {
  categoryId: string
  categoryKey: string
  description: string
  neighborhoodId: string
  budgetText: string
  urgency: Urgency | ''
  email: string
  fullName: string
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function DemandePage() {
  const locale = useLocale()
  const t = useTranslations('demande')
  const isRTL = locale === 'ar'
  const BackIcon = isRTL ? ChevronRight : ChevronLeft

  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>({
    categoryId: '',
    categoryKey: '',
    description: '',
    neighborhoodId: '',
    budgetText: '',
    urgency: '',
    email: '',
    fullName: '',
  })
  const [neighborhoods, setNeighborhoods] = useState<Array<{ id: string; name_fr: string; name_ar: string }>>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    fetch(`/api/v1/neighborhoods?city_id=${CITY_ID}`)
      .then(r => r.json())
      .then(d => setNeighborhoods(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  function selectCategory(cat: typeof CATEGORY_DEFS[0]) {
    setForm(f => ({ ...f, categoryId: cat.id, categoryKey: cat.key }))
    setTimeout(() => setStep(2), 180)
  }

  function canProceed(): boolean {
    if (step === 1) return form.categoryId !== ''
    if (step === 2) return form.description.length >= 20
    if (step === 3) return true
    if (step === 4) return form.urgency !== ''
    if (step === 5) return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
    return false
  }

  async function handleSubmit() {
    if (!canProceed() || loading) return
    setLoading(true)
    setApiError('')
    try {
      const res = await fetch('/api/v1/public/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id:     form.categoryId,
          city_id:         CITY_ID,
          neighborhood_id: form.neighborhoodId || null,
          description:     form.description,
          budget_text:     form.budgetText || null,
          urgency:         form.urgency,
          email:           form.email,
          full_name:       form.fullName || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erreur inattendue')
      setSubmitted(true)
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <SuccessScreen
        email={form.email}
        categoryLabel={form.categoryKey ? t(form.categoryKey) : ''}
        t={t}
        isRTL={isRTL}
      />
    )
  }

  const totalSteps = 5
  const progress = (step / totalSteps) * 100
  const nbName = (nb: { name_fr: string; name_ar: string }) =>
    isRTL ? nb.name_ar : nb.name_fr

  return (
    <div className="min-h-screen bg-[#F7F7F5]" dir={isRTL ? 'rtl' : 'ltr'}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Anzar" width={140} height={76} className="h-10 w-auto object-contain" priority />
          </Link>
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <a
              href={t('langToggleHref')}
              className="text-sm font-semibold text-gray-500 hover:text-[#1A6B4A] px-3 py-1.5 rounded-lg hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              {t('langToggle')}
            </a>
            <span className="text-sm text-gray-400 font-medium">
              {t('stepIndicator', { step, total: totalSteps })}
            </span>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className={`h-full bg-[#1A6B4A] transition-all duration-500 ease-out ${isRTL ? 'mr-0' : 'ml-0'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Step 1 — Category ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {t('step1Title')}
            </h1>
            <p className="text-gray-500 mb-8">{t('step1Sub')}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORY_DEFS.map(cat => {
                const isSelected = form.categoryId === cat.id
                const Icon = cat.Icon
                return (
                  <button
                    key={cat.id}
                    onClick={() => selectCategory(cat)}
                    className={`
                      relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200
                      ${isSelected
                        ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 shadow-md'
                        : 'border-gray-200 bg-white hover:border-[#1A6B4A]/50 hover:shadow-md'}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2.5 end-2.5 w-5 h-5 bg-[#1A6B4A] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 ${cat.bgCls} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${cat.iconCls}`} strokeWidth={1.75} />
                    </div>
                    <span className={`font-semibold text-sm text-center leading-tight ${isSelected ? 'text-[#1A6B4A]' : 'text-gray-700'}`}>
                      {t(cat.key)}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Trust row */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-gray-400">
              <span>✅ {t('trustFree')}</span>
              <span>🔨 {t('trustVerified')}</span>
              <span>⭐ {t('trustReviews')}</span>
            </div>
          </div>
        )}

        {/* ── Step 2 — Description ──────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <BackBtn label={t('back')} Icon={BackIcon} onClick={() => setStep(1)} />
            <div className="mb-8">
              {form.categoryKey && (
                <span className="inline-flex items-center gap-2 bg-[#1A6B4A]/8 text-[#1A6B4A] px-3 py-1 rounded-full text-sm font-semibold mb-4">
                  {t(form.categoryKey as Parameters<typeof t>[0])}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('step2Title')}</h1>
              <p className="text-gray-500">{t('step2Sub')}</p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#1A6B4A] transition-colors p-4">
              <textarea
                autoFocus
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="..."
                rows={6}
                maxLength={2000}
                className="w-full resize-none text-gray-900 placeholder-gray-400 text-sm leading-relaxed focus:outline-none"
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <div className={`flex mt-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                <span className={`text-xs ${form.description.length < 20 ? 'text-gray-400' : 'text-[#1A6B4A] font-medium'}`}>
                  {form.description.length < 20
                    ? t('step2MinHint', { n: 20 - form.description.length })
                    : t('step2Count', { n: form.description.length })}
                </span>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">💡 {t('step2TipTitle')}</p>
              <p className="text-xs text-amber-700 leading-relaxed">{t('step2Tip')}</p>
            </div>
          </div>
        )}

        {/* ── Step 3 — Location ─────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <BackBtn label={t('back')} Icon={BackIcon} onClick={() => setStep(2)} />
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('step3Title')}</h1>
              <p className="text-gray-500">{t('step3Sub')}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('step3CityLabel')}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span className="font-semibold text-gray-900">{t('step3CityName')}</span>
                  <span className="ms-auto text-xs text-[#1A6B4A] bg-[#1A6B4A]/8 px-2 py-0.5 rounded-full font-medium">
                    {t('step3CityBadge')}
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('step3NeighborhoodLabel')}</p>
                <select
                  value={form.neighborhoodId}
                  onChange={e => setForm(f => ({ ...f, neighborhoodId: e.target.value }))}
                  className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <option value="">{t('step3AllCity')}</option>
                  {neighborhoods.map(nb => (
                    <option key={nb.id} value={nb.id}>{nbName(nb)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4 — Budget + Urgency ─────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <BackBtn label={t('back')} Icon={BackIcon} onClick={() => setStep(3)} />
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('step4Title')}</h1>
              <p className="text-gray-500">{t('step4Sub')}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('step4BudgetLabel')}</label>
                <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#1A6B4A] transition-colors p-4">
                  <input
                    type="text"
                    value={form.budgetText}
                    onChange={e => setForm(f => ({ ...f, budgetText: e.target.value }))}
                    placeholder={t('step4BudgetPlaceholder')}
                    className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                    dir={isRTL ? 'rtl' : 'ltr'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t('step4UrgencyLabel')}</label>
                <div className="space-y-2">
                  {([
                    { value: 'urgent',   emoji: '🔴', labelKey: 'urgentLabel',   descKey: 'urgentDesc'   },
                    { value: 'soon',     emoji: '🟡', labelKey: 'soonLabel',     descKey: 'soonDesc'     },
                    { value: 'flexible', emoji: '🟢', labelKey: 'flexibleLabel', descKey: 'flexibleDesc' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, urgency: opt.value }))}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-150 text-start
                        ${form.urgency === opt.value
                          ? 'border-[#1A6B4A] bg-[#1A6B4A]/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{opt.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{t(opt.labelKey)}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{t(opt.descKey)}</p>
                        </div>
                      </div>
                      {form.urgency === opt.value && (
                        <div className="w-5 h-5 bg-[#1A6B4A] rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 5 — Email ────────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <BackBtn label={t('back')} Icon={BackIcon} onClick={() => setStep(4)} />
            <div className="mb-8">
              <div className="w-14 h-14 bg-[#1A6B4A]/10 rounded-2xl flex items-center justify-center mb-5 text-3xl">
                📬
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('step5Title')}</h1>
              <p className="text-gray-500 leading-relaxed">{t('step5Sub')}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#1A6B4A] transition-colors p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('step5NameLabel')}</p>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder={t('step5NamePlaceholder')}
                  className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              <div className={`bg-white rounded-2xl border-2 p-4 transition-colors ${
                form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                  ? 'border-red-300'
                  : form.email
                  ? 'border-[#1A6B4A]'
                  : 'border-gray-200 focus-within:border-[#1A6B4A]'
              }`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('step5EmailLabel')}</p>
                <input
                  type="email"
                  autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder={t('step5EmailPlaceholder')}
                  className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  dir="ltr"
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                />
              </div>

              <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                🔒 {t('step5Privacy')}
              </p>

              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                  {apiError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Nav button (not on step 1 which auto-advances) ────────────────── */}
        {step !== 1 && (
          <div className="mt-8">
            {step === 5 ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="w-full bg-[#1A6B4A] text-white font-semibold py-4 rounded-2xl hover:bg-[#155c3e] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A6B4A]/25 flex items-center justify-center gap-2.5 text-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t('publishingBtn')}
                  </>
                ) : (
                  <>
                    {t('publishBtn')}
                    <span className="text-xl">🚀</span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={() => setStep(s => (s + 1) as Step)}
                disabled={!canProceed()}
                className="w-full bg-[#1A6B4A] text-white font-semibold py-4 rounded-2xl hover:bg-[#155c3e] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#1A6B4A]/25 text-base"
              >
                {t('continue')} {isRTL ? '←' : '→'}
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function BackBtn({
  label,
  Icon,
  onClick,
}: {
  label: string
  Icon: typeof ChevronLeft
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-gray-400 hover:text-gray-700 mb-6 transition-colors text-sm font-medium"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function SuccessScreen({
  email,
  categoryLabel,
  t,
  isRTL,
}: {
  email: string
  categoryLabel: string
  t: ReturnType<typeof useTranslations<'demande'>>
  isRTL: boolean
}) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center">
          <Link href="/">
            <Image src="/logo.png" alt="Anzar" width={140} height={76} className="h-10 w-auto object-contain" priority />
          </Link>
        </div>
        <div className="h-1 bg-[#1A6B4A]" />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#1A6B4A]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            {t('successTitle')}
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            {t('successSub', { category: categoryLabel })}{' '}
            {t('successNotified')}{' '}
            <strong className="text-gray-700">{email}</strong>{' '}
            {t('successContact')}
          </p>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-start mb-8 space-y-0">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#1A6B4A] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="w-0.5 h-6 bg-[#1A6B4A]/20 mt-1" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-sm text-gray-900">{t('successStep1Label')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('successStep1Sub')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                  <span className="text-sm">🔍</span>
                </div>
                <div className="w-0.5 h-6 bg-gray-200 mt-1" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-sm text-gray-900">{t('successStep2Label')}</p>
                <p className="text-xs text-gray-500 mt-0.5">{t('successStep2Sub')}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center shrink-0">
                <span className="text-sm text-gray-400">📬</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-500">{t('successStep3Label')}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t('successStep3Sub')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/artisans"
              className="inline-flex items-center justify-center gap-2 bg-[#1A6B4A] text-white font-semibold px-6 py-3 rounded-2xl hover:bg-[#155c3e] transition-colors text-sm shadow-lg shadow-[#1A6B4A]/20"
            >
              {t('seeArtisans')} {isRTL ? '←' : '→'}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-gray-500 font-medium px-6 py-3 rounded-2xl hover:bg-gray-100 transition-colors text-sm"
            >
              {t('goHome')}
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
