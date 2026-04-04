'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * Floating demo login widget — only shown outside production.
 * Provides one-click login as a demo customer or demo provider.
 */
export default function DemoLoginWidget() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState<'customer' | 'provider' | null>(null)

  async function login(role: 'customer' | 'provider') {
    setLoading(role)
    setOpen(false)
    // Navigate to the demo auth route — it sets cookies + redirects server-side
    router.push(`/api/v1/auth/demo?role=${role}`)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Popover */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Mode démo — connexion rapide
          </p>

          {/* Customer */}
          <button
            onClick={() => login('customer')}
            disabled={loading !== null}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-full bg-[#1A6B4A]/10 flex items-center justify-center shrink-0 text-lg group-hover:bg-[#1A6B4A]/15 transition-colors">
              👤
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Client</p>
              <p className="text-xs text-gray-400">Karim Benali · cherche artisan</p>
            </div>
            {loading === 'customer' && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 ms-auto" />
            )}
          </button>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2" />

          {/* Provider */}
          <button
            onClick={() => login('provider')}
            disabled={loading !== null}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left group disabled:opacity-60"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0 text-lg group-hover:bg-amber-100 transition-colors">
              🔨
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Artisan</p>
              <p className="text-xs text-gray-400">Hassan Chakir · Électricien ⭐4.9</p>
            </div>
            {loading === 'provider' && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400 ms-auto" />
            )}
          </button>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg font-semibold text-sm transition-all duration-200
          ${open
            ? 'bg-gray-800 text-white shadow-gray-800/30'
            : 'bg-white text-gray-700 border border-gray-200 hover:shadow-xl hover:-translate-y-0.5'
          }
        `}
      >
        <span className="text-base">🎭</span>
        <span>Demo</span>
        <span className={`text-gray-400 text-xs transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▲</span>
      </button>
    </div>
  )
}
