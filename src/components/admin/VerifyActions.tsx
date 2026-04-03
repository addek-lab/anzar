'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export default function VerifyActions({ providerId }: { providerId: string }) {
  const router = useRouter()
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)

  async function handleAction(action: 'approve' | 'reject') {
    if (action === 'reject' && !reason.trim()) return
    setLoading(action)

    const res = await fetch(`/api/v1/admin/verify/${providerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason: reason || undefined }),
    })

    setLoading(null)
    if (res.ok) router.push('/admin/verify')
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
      <h3 className="font-semibold text-gray-900">Décision</h3>

      <div>
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Motif (obligatoire pour rejet)
        </label>
        <Textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Documents illisibles, informations incomplètes..."
          className="rounded-xl resize-none"
          rows={3}
        />
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => handleAction('approve')}
          disabled={!!loading}
          className="flex-1 bg-[#1A6B4A] hover:bg-[#155c3e] text-white h-12 rounded-xl font-semibold"
        >
          {loading === 'approve' ? '...' : '✅ Approuver'}
        </Button>
        <Button
          onClick={() => handleAction('reject')}
          disabled={!!loading || !reason.trim()}
          variant="outline"
          className="flex-1 h-12 rounded-xl border-red-300 text-red-600 hover:bg-red-50 font-semibold"
        >
          {loading === 'reject' ? '...' : '❌ Rejeter'}
        </Button>
      </div>
    </div>
  )
}
