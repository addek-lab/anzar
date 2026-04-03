'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LanguagePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<'fr' | 'ar'>('fr')

  async function handleContinue() {
    document.cookie = `locale=${selected}; path=/; max-age=${60 * 60 * 24 * 365}`
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('user_type').eq('id', user.id).single()
      if (profile?.user_type === 'customer') router.push('/app')
      else if (profile?.user_type === 'provider') router.push('/pro')
      else if (profile?.user_type === 'admin') router.push('/admin')
      else router.push('/auth/type')
    } else {
      router.push('/auth/phone')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero top */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        {/* Logo */}
        <div className="mb-10 text-center">
          <Image src="/logo.png" alt="Anzar" width={320} height={175} className="h-28 w-auto object-contain mx-auto" priority />
          <p className="text-gray-400 text-sm mt-3">La plateforme des artisans · منصة الحرفيين</p>
        </div>

        {/* Language cards */}
        <div className="w-full max-w-xs space-y-3">
          <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Choisissez votre langue · اختر لغتك
          </p>

          {[
            { code: 'fr' as const, flag: '🇫🇷', name: 'Français', sub: 'Langue principale' },
            { code: 'ar' as const, flag: '🇲🇦', name: 'العربية', sub: 'اللغة العربية', rtl: true },
          ].map(lang => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              dir={lang.rtl ? 'rtl' : 'ltr'}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 ${
                selected === lang.code
                  ? 'border-[#1A6B4A] bg-[#1A6B4A]/5 shadow-sm'
                  : 'border-gray-100 bg-gray-50 hover:border-gray-200'
              }`}
            >
              <span className="text-3xl">{lang.flag}</span>
              <div className="text-start">
                <p className="font-semibold text-gray-900">{lang.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{lang.sub}</p>
              </div>
              <div className={`ms-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selected === lang.code ? 'border-[#1A6B4A] bg-[#1A6B4A]' : 'border-gray-200'
              }`}>
                {selected === lang.code && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10">
        <button
          onClick={handleContinue}
          className="w-full bg-[#1A6B4A] text-white h-14 rounded-2xl font-semibold text-base shadow-lg shadow-[#1A6B4A]/25 hover:bg-[#155c3e] active:scale-[0.98] transition-all"
        >
          {selected === 'ar' ? 'متابعة ←' : 'Continuer →'}
        </button>
        <p className="text-center text-xs text-gray-400 mt-4">
          {selected === 'ar' ? 'بالمتابعة توافق على شروط الاستخدام' : 'En continuant, vous acceptez les CGU'}
        </p>
      </div>
    </div>
  )
}
