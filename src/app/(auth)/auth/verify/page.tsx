'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useLocale } from '@/hooks/useLocale'

export default function VerifyPage() {
  const t = useTranslations()
  const router = useRouter()
  const { isRTL } = useLocale()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [phone, setPhone] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('anzar_phone')
    if (!storedPhone) {
      router.replace('/auth/phone')
      return
    }
    setPhone(storedPhone)

    const timer = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(timer); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  function handleInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    if (newCode.every(d => d !== '')) {
      handleVerify(newCode.join(''))
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleVerify(token?: string) {
    const finalToken = token || code.join('')
    if (finalToken.length !== 6) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/v1/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, token: finalToken }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(t('auth.otpInvalid'))
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
      return
    }

    if (data.userType === 'customer') router.push('/app')
    else if (data.userType === 'provider') router.push('/pro')
    else if (data.userType === 'admin') router.push('/admin')
    else router.push('/auth/type')
  }

  async function handleResend() {
    if (resendTimer > 0) return
    await fetch('/api/v1/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    setResendTimer(60)
    setCode(['', '', '', '', '', ''])
    inputRefs.current[0]?.focus()
  }

  const maskedPhone = phone.replace(/(\+212)(\d{1})(\d{4})(\d{4})/, '$1 $2 XXXX $4')

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#1A6B4A]/10 rounded-2xl mx-auto flex items-center justify-center mb-4">
            <span className="text-2xl">💬</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('auth.enterCode')}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {t('auth.codeHint')} <span className="font-medium text-gray-700">{maskedPhone}</span>
          </p>
        </div>

        <div className="flex gap-2 justify-center">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all focus:border-[#1A6B4A] border-gray-200"
              autoFocus={i === 0}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <Button
          onClick={() => handleVerify()}
          disabled={loading || code.some(d => d === '')}
          className="w-full bg-[#1A6B4A] hover:bg-[#155c3e] text-white h-12 text-base font-semibold rounded-xl"
        >
          {loading ? t('common.loading') : t('auth.verify')}
        </Button>

        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className="text-sm text-gray-500 disabled:opacity-50 hover:text-[#1A6B4A]"
          >
            {resendTimer > 0
              ? t('auth.resendIn', { seconds: resendTimer })
              : t('auth.resend')}
          </button>
        </div>
      </div>
    </div>
  )
}
