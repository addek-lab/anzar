'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function ReviewActions({
  reviewId,
  currentStatus,
}: {
  reviewId: string
  currentStatus: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [done, setDone] = useState(false)

  if (done || currentStatus !== 'pending') {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        {currentStatus === 'approved' || done ? (
          <span className="flex items-center gap-1 text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" /> Approuvé
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-500">
            <XCircle className="w-3.5 h-3.5" /> Rejeté
          </span>
        )}
      </div>
    )
  }

  async function handleAction(action: 'approve' | 'reject') {
    setLoading(action)
    try {
      const res = await fetch(`/api/v1/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        setDone(true)
        router.refresh()
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleAction('approve')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === 'approve' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <CheckCircle className="w-3.5 h-3.5" />
        )}
        Approuver
      </button>
      <button
        onClick={() => handleAction('reject')}
        disabled={!!loading}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
      >
        {loading === 'reject' ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <XCircle className="w-3.5 h-3.5" />
        )}
        Rejeter
      </button>
    </div>
  )
}
