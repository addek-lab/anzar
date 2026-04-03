'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLocale } from '@/hooks/useLocale'
import { ArrowLeft, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (!signInError && signInData.user) {
      const { data: profile } = await supabase.from('profiles').select('user_type').eq('id', signInData.user.id).single()
      setLoading(false)
      if (profile?.user_type === 'customer') router.push('/app')
      else if (profile?.user_type === 'provider') router.push('/pro')
      else if (profile?.user_type === 'admin') router.push('/admin')
      else router.push('/auth/type')
      return
    }

    if (signInError?.message.includes('Invalid login credentials')) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email, password })
      setLoading(false)
      if (signUpError) { setError(signUpError.message); return }
      if (signUpData.user) router.push('/auth/type')
      return
    }

    setLoading(false)
    setError(signInError?.message || 'Une erreur est survenue')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-4 px-5 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <BackIcon size={18} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1 px-6 pb-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {isRTL ? 'أهلاً بك' : 'Bon retour'}
          </h1>
          <p className="text-gray-400 mt-2 text-base">
            {isRTL ? 'سجّل دخولك أو أنشئ حساباً جديداً' : 'Connectez-vous ou créez un compte'}
          </p>
        </div>

        <div className="space-y-4">
          {/* Email */}
          <div className="relative">
            <div className="absolute inset-y-0 start-4 flex items-center pointer-events-none">
              <Mail size={18} className="text-gray-400" />
            </div>
            <input
              type="email"
              placeholder={isRTL ? 'البريد الإلكتروني' : 'Adresse email'}
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl ps-12 pe-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute inset-y-0 start-4 flex items-center pointer-events-none">
              <Lock size={18} className="text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder={isRTL ? 'كلمة المرور (6 أحرف)' : 'Mot de passe (6 caractères min.)'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full h-14 bg-gray-50 border border-gray-100 rounded-2xl ps-12 pe-12 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute inset-y-0 end-4 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
            <p className="text-xs text-blue-600">
              {isRTL
                ? '💡 إذا كان هذا أول تسجيل لك، سيتم إنشاء حساب جديد تلقائياً'
                : '💡 Première fois ? Un compte sera créé automatiquement avec ce mot de passe'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="px-6 pb-10">
        <button
          onClick={handleLogin}
          disabled={loading || !email || password.length < 6}
          className="w-full bg-[#1A6B4A] text-white h-14 rounded-2xl font-semibold text-base shadow-lg shadow-[#1A6B4A]/25 hover:bg-[#155c3e] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? (isRTL ? 'جارٍ التحميل...' : 'Chargement...')
            : (isRTL ? 'دخول / إنشاء حساب' : 'Connexion / Créer un compte')}
        </button>
      </div>
    </div>
  )
}
