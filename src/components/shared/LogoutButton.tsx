'use client'

import { useRouter } from 'next/navigation'

export default function LogoutButton({ locale }: { locale: string }) {
  const router = useRouter()
  const isRTL = locale === 'ar'

  async function handleLogout() {
    await fetch('/api/v1/auth/logout', { method: 'POST' })
    router.push('/auth')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full bg-white rounded-xl p-4 text-red-500 font-medium text-start shadow-sm border border-gray-100"
    >
      {isRTL ? '← تسجيل الخروج' : '← Déconnexion'}
    </button>
  )
}
