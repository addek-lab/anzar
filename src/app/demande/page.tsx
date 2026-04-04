'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ChevronLeft, Loader2, Check,
  Zap, Droplets, Paintbrush, Wind, Wrench, Hammer, CheckCircle,
} from 'lucide-react'

// ─── Static data ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  { id: '00000000-0000-0000-0000-000000000001', label: 'Électricien',   Icon: Zap,       iconCls: 'text-yellow-500', bgCls: 'bg-yellow-50' },
  { id: '00000000-0000-0000-0000-000000000002', label: 'Plombier',      Icon: Droplets,  iconCls: 'text-blue-500',   bgCls: 'bg-blue-50'   },
  { id: '00000000-0000-0000-0000-000000000003', label: 'Peinture',      Icon: Paintbrush,iconCls: 'text-pink-500',   bgCls: 'bg-pink-50'   },
  { id: '00000000-0000-0000-0000-000000000004', label: 'Climatisation', Icon: Wind,      iconCls: 'text-cyan-500',   bgCls: 'bg-cyan-50'   },
  { id: '00000000-0000-0000-0000-000000000005', label: 'Carrelage',     Icon: Wrench,    iconCls: 'text-orange-500', bgCls: 'bg-orange-50' },
  { id: '00000000-0000-0000-0000-000000000006', label: 'Bricolage',     Icon: Hammer,    iconCls: 'text-green-600',  bgCls: 'bg-green-50'  },
]

const CITY_ID = '10000000-0000-0000-0000-000000000001' // Casablanca

type Step = 1 | 2 | 3 | 4 | 5
type Urgency = 'urgent' | 'soon' | 'flexible'

interface FormState {
  categoryId: string
  categoryLabel: string
  description: string
  neighborhoodId: string
  budgetText: string
  urgency: Urgency | ''
  email: string
  fullName: string
}

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function DemandePage() {
  const [step, setStep] = useState<Step>(1)
  const [form, setForm] = useState<FormState>({
    categoryId: '',
    categoryLabel: '',
    description: '',
    neighborhoodId: '',
    budgetText: '',
    urgency: '',
    email: '',
    fullName: '',
  })
  const [neighborhoods, setNeighborhoods] = useState<Array<{ id: string; name_fr: string }>>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [apiError, setApiError] = useState('')

  useEffect(() => {
    fetch(`/api/v1/neighborhoods?city_id=${CITY_ID}`)
      .then(r => r.json())
      .then(d => setNeighborhoods(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  function selectCategory(cat: typeof CATEGORIES[0]) {
    setForm(f => ({ ...f, categoryId: cat.id, categoryLabel: cat.label }))
    setTimeout(() => setStep(2), 180) // brief visual feedback before advancing
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
          category_id: form.categoryId,
          city_id: CITY_ID,
          neighborhood_id: form.neighborhoodId || null,
          description: form.description,
          budget_text: form.budgetText || null,
          urgency: form.urgency,
          email: form.email,
          full_name: form.fullName || null,
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
    return <SuccessScreen email={form.email} categoryLabel={form.categoryLabel} />
  }

  const totalSteps = 5
  const progress = (step / totalSteps) * 100

  return (
    <div className="min-h-screen bg-[#F7F7F5]">

      {/* ── Header + progress bar ──────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Anzar" width={140} height={76} className="h-10 w-auto object-contain" priority />
          </Link>
          <span className="text-sm text-gray-400 font-medium">Étape {step} / {totalSteps}</span>
        </div>
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-[#1A6B4A] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">

        {/* ── Step 1 — Category ────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              De quel service avez-vous besoin ?
            </h1>
            <p className="text-gray-500 mb-8">
              Sélectionnez la catégorie qui correspond à votre besoin
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => {
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
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-[#1A6B4A] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <div className={`w-12 h-12 ${cat.bgCls} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${cat.iconCls}`} strokeWidth={1.75} />
                    </div>
                    <span className={`font-semibold text-sm text-center leading-tight ${isSelected ? 'text-[#1A6B4A]' : 'text-gray-700'}`}>
                      {cat.label}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Trust row */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">✅ Gratuit &amp; sans engagement</span>
              <span className="flex items-center gap-1.5">🔨 Artisans vérifiés</span>
              <span className="flex items-center gap-1.5">⭐ Avis authentiques</span>
            </div>
          </div>
        )}

        {/* ── Step 2 — Description ─────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <BackButton onClick={() => setStep(1)} />
            <div className="mb-8">
              <span className="inline-flex items-center gap-2 bg-[#1A6B4A]/8 text-[#1A6B4A] px-3 py-1 rounded-full text-sm font-semibold mb-4">
                {CATEGORIES.find(c => c.id === form.categoryId)?.Icon && (() => {
                  const cat = CATEGORIES.find(c => c.id === form.categoryId)!
                  const Icon = cat.Icon
                  return <Icon className={`w-4 h-4 ${cat.iconCls}`} />
                })()}
                {form.categoryLabel}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Décrivez votre besoin</h1>
              <p className="text-gray-500">Plus vous êtes précis, plus les artisans pourront vous faire des offres adaptées</p>
            </div>

            <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#1A6B4A] transition-colors p-4">
              <textarea
                autoFocus
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder={`Ex: ${form.categoryLabel === 'Électricien'
                  ? 'Prise électrique grillée dans le salon, odeur de brûlé. À réparer rapidement. Appartement au 3ème étage.'
                  : form.categoryLabel === 'Plombier'
                  ? 'Fuite sous l\'évier de la cuisine depuis 2 jours, dégâts sur le meuble. Intervention urgente.'
                  : 'Décrivez votre besoin en détail : nature du problème, surface, matériaux fournis ou non...'}`}
                rows={6}
                maxLength={2000}
                className="w-full resize-none text-gray-900 placeholder-gray-400 text-sm leading-relaxed focus:outline-none"
              />
              <div className="flex justify-end mt-2">
                <span className={`text-xs ${form.description.length < 20 ? 'text-gray-400' : 'text-[#1A6B4A] font-medium'}`}>
                  {form.description.length < 20
                    ? `Encore ${20 - form.description.length} caractères minimum`
                    : `${form.description.length} / 2000`}
                </span>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">💡 Conseil</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                Mentionnez : la nature du problème, la surface ou quantité si applicable, vos disponibilités, et si vous fournissez les matériaux.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 3 — Location ────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <BackButton onClick={() => setStep(2)} />
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Où se situe le chantier ?</h1>
              <p className="text-gray-500">Pour trouver les artisans disponibles près de chez vous</p>
            </div>

            <div className="space-y-3">
              {/* City — locked to Casablanca */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Ville</p>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span className="font-semibold text-gray-900">Casablanca</span>
                  <span className="ms-auto text-xs text-[#1A6B4A] bg-[#1A6B4A]/8 px-2 py-0.5 rounded-full font-medium">Disponible</span>
                </div>
              </div>

              {/* Neighborhood */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Quartier (optionnel)</p>
                <select
                  value={form.neighborhoodId}
                  onChange={e => setForm(f => ({ ...f, neighborhoodId: e.target.value }))}
                  className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
                >
                  <option value="">Tout Casablanca</option>
                  {neighborhoods.map(nb => (
                    <option key={nb.id} value={nb.id}>{nb.name_fr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4 — Budget + Urgency ─────────────────────────────────────── */}
        {step === 4 && (
          <div>
            <BackButton onClick={() => setStep(3)} />
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Budget et délai</h1>
              <p className="text-gray-500">Ces informations aident les artisans à préparer leur offre</p>
            </div>

            <div className="space-y-6">
              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Budget estimé (optionnel)</label>
                <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#1A6B4A] transition-colors p-4">
                  <input
                    type="text"
                    value={form.budgetText}
                    onChange={e => setForm(f => ({ ...f, budgetText: e.target.value }))}
                    placeholder="Ex: 500–800 MAD, Flexible, Je veux un devis"
                    className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Quand avez-vous besoin de l&apos;artisan ? *</label>
                <div className="space-y-2">
                  {([
                    { value: 'urgent', emoji: '🔴', label: 'Urgent', desc: 'Dans les 48h' },
                    { value: 'soon',   emoji: '🟡', label: 'Sous peu', desc: 'Dans les 2 semaines' },
                    { value: 'flexible', emoji: '🟢', label: 'Flexible', desc: 'Pas de contrainte de temps' },
                  ] as const).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setForm(f => ({ ...f, urgency: opt.value }))}
                      className={`
                        w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-150 text-left
                        ${form.urgency === opt.value
                          ? 'border-[#1A6B4A] bg-[#1A6B4A]/5'
                          : 'border-gray-200 bg-white hover:border-gray-300'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{opt.emoji}</span>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">{opt.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
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

        {/* ── Step 5 — Email ───────────────────────────────────────────────── */}
        {step === 5 && (
          <div>
            <BackButton onClick={() => setStep(4)} />
            <div className="mb-8">
              <div className="w-14 h-14 bg-[#1A6B4A]/10 rounded-2xl flex items-center justify-center mb-5 text-3xl">
                📬
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Où envoyer les offres ?
              </h1>
              <p className="text-gray-500">
                Les artisans vous contacteront via Anzar. Vous recevrez une notification par email dès qu&apos;une offre arrive.
              </p>
            </div>

            <div className="space-y-3">
              {/* Name */}
              <div className="bg-white rounded-2xl border-2 border-gray-200 focus-within:border-[#1A6B4A] transition-colors p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Prénom (optionnel)</p>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  placeholder="Ex: Karim"
                  className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                />
              </div>

              {/* Email */}
              <div className={`bg-white rounded-2xl border-2 p-4 transition-colors ${
                form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
                  ? 'border-red-300 focus-within:border-red-400'
                  : form.email
                  ? 'border-[#1A6B4A]'
                  : 'border-gray-200 focus-within:border-[#1A6B4A]'
              }`}>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Adresse email *</p>
                <input
                  type="email"
                  autoFocus
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="vous@exemple.com"
                  className="w-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                />
              </div>

              {/* Privacy */}
              <p className="text-xs text-gray-400 text-center px-4 leading-relaxed">
                🔒 Vos données sont sécurisées. Votre email ne sera jamais communiqué directement aux artisans.
              </p>

              {/* Error */}
              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                  {apiError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Next / Submit button (not on step 1 which auto-advances) ─────── */}
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
                    Publication en cours…
                  </>
                ) : (
                  <>
                    Publier ma demande
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
                Continuer →
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────────
function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 text-gray-400 hover:text-gray-700 mb-6 transition-colors text-sm font-medium"
    >
      <ChevronLeft className="w-4 h-4" /> Retour
    </button>
  )
}

function SuccessScreen({ email, categoryLabel }: { email: string; categoryLabel: string }) {
  return (
    <div className="min-h-screen bg-[#F7F7F5] flex flex-col">
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
          {/* Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-[#1A6B4A]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Votre demande est publiée !
          </h1>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Nous recherchons des artisans <strong className="text-gray-700">{categoryLabel}</strong> qualifiés.
            Vous serez notifié à{' '}
            <strong className="text-gray-700">{email}</strong>{' '}
            dès qu&apos;un artisan vous contacte.
          </p>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left mb-8 space-y-0">
            {/* Step 1 — done */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#1A6B4A] flex items-center justify-center shrink-0">
                  <Check className="w-4 h-4 text-white" />
                </div>
                <div className="w-0.5 h-6 bg-[#1A6B4A]/20 mt-1" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-sm text-gray-900">Demande publiée</p>
                <p className="text-xs text-gray-500 mt-0.5">Visible pour les artisans vérifiés de Casablanca</p>
              </div>
            </div>

            {/* Step 2 — in progress */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center shrink-0 animate-pulse">
                  <span className="text-sm">🔍</span>
                </div>
                <div className="w-0.5 h-6 bg-gray-200 mt-1" />
              </div>
              <div className="pb-4">
                <p className="font-semibold text-sm text-gray-900">Recherche d&apos;artisans</p>
                <p className="text-xs text-gray-500 mt-0.5">Nous identifions les meilleurs profils pour votre besoin</p>
              </div>
            </div>

            {/* Step 3 — pending */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center shrink-0">
                <span className="text-sm text-gray-400">📬</span>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-500">Offres à venir</p>
                <p className="text-xs text-gray-400 mt-0.5">Généralement dans les prochaines heures</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/artisans"
              className="inline-flex items-center justify-center gap-2 bg-[#1A6B4A] text-white font-semibold px-6 py-3 rounded-2xl hover:bg-[#155c3e] transition-colors text-sm shadow-lg shadow-[#1A6B4A]/20"
            >
              Voir les artisans →
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 text-gray-500 font-medium px-6 py-3 rounded-2xl hover:bg-gray-100 transition-colors text-sm"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
