'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/hooks/useLocale'
import { Home, Wrench, ArrowRight, ArrowLeft } from 'lucide-react'

export default function UserTypePage() {
  const router = useRouter()
  const { isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const [selected, setSelected] = useState<'customer' | 'provider' | null>(null)
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleContinue() {
    if (!selected || fullName.trim().length < 2) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session) {
      setError('Session expirée. Veuillez vous reconnecter.')
      setLoading(false)
      router.push('/auth/phone')
      return
    }

    const res = await fetch('/api/v1/auth/set-type', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ user_type: selected, full_name: fullName.trim() }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.message ?? data.error ?? 'Erreur inconnue')
      return
    }

    if (selected === 'customer') router.push('/app')
    else router.push('/pro/onboarding')
  }

  const types = [
    {
      id: 'customer' as const,
      icon: Home,
      title: isRTL ? 'أبحث عن حرفي' : 'Je cherche un artisan',
      desc: isRTL ? 'انشر طلبك واستقبل عروضاً من محترفين موثوقين' : 'Publiez une demande, recevez des offres de pros vérifiés',
      color: 'from-[#1A6B4A]/10 to-[#1A6B4A]/5',
      iconBg: 'bg-[#1A6B4A]/10',
      iconColor: 'text-[#1A6B4A]',
    },
    {
      id: 'provider' as const,
      icon: Wrench,
      title: isRTL ? 'أنا حرفي' : 'Je suis artisan',
      desc: isRTL ? 'ابحث عن عملاء وطور نشاطك المهني' : 'Trouvez des clients et développez votre activité',
      color: 'from-[#E8A838]/10 to-[#E8A838]/5',
      iconBg: 'bg-[#E8A838]/10',
      iconColor: 'text-[#E8A838]',
    },
  ]

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center gap-4 px-5 pt-14 pb-4">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <BackIcon size={18} className="text-gray-600" />
        </button>
        <div className="flex gap-1.5">
          {[1, 2].map(s => (
            <div key={s} className={`h-1 w-8 rounded-full ${s === 1 ? 'bg-[#1A6B4A]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pb-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {isRTL ? 'كيف ستستخدم أنظار؟' : 'Comment utilisez-vous Anzar ?'}
          </h1>
          <p className="text-gray-400 mt-2">
            {isRTL ? 'اختر ما يناسبك' : 'Choisissez votre profil'}
          </p>
        </div>

        <div className="space-y-3 mb-8">
          {types.map(type => {
            const Icon = type.icon
            const isSelected = selected === type.id
            return (
              <button
                key={type.id}
                onClick={() => setSelected(type.id)}
                className={`w-full text-start p-5 rounded-3xl border-2 transition-all duration-200 bg-gradient-to-br ${type.color} ${
                  isSelected ? 'border-[#1A6B4A] shadow-md' : 'border-transparent hover:border-gray-100'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${type.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon size={22} className={type.iconColor} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-lg">{type.title}</p>
                    <p className="text-sm text-gray-500 mt-1 leading-relaxed">{type.desc}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                    isSelected ? 'border-[#1A6B4A] bg-[#1A6B4A]' : 'border-gray-200'
                  }`}>
                    {isSelected && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="animate-in slide-in-from-bottom-4 duration-300">
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              {isRTL ? 'الاسم الكامل' : 'Votre nom complet'}
            </label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder={isRTL ? 'مثال: محمد أمين' : 'Ex: Mohamed Amine'}
              className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base"
              autoFocus
            />
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-100 rounded-2xl p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>

      <div className="px-6 pb-10">
        <button
          onClick={handleContinue}
          disabled={!selected || fullName.trim().length < 2 || loading}
          className="w-full bg-[#1A6B4A] text-white h-14 rounded-2xl font-semibold text-base shadow-lg shadow-[#1A6B4A]/25 hover:bg-[#155c3e] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {loading ? '...' : (isRTL ? 'متابعة ←' : 'Continuer →')}
        </button>
      </div>
    </div>
  )
}
