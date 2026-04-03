'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface Props {
  matchId: string
  locale: string
}

export default function LeadDetailActions({ matchId, locale }: Props) {
  const router = useRouter()
  const isRTL = locale === 'ar'
  const [showOffer, setShowOffer] = useState(false)
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [loading, setLoading] = useState<'offer' | 'decline' | null>(null)

  async function handleDecline() {
    setLoading('decline')
    await fetch(`/api/v1/leads/${matchId}/decline`, { method: 'POST' })
    setLoading(null)
    router.push('/pro')
    router.refresh()
  }

  async function handleSendOffer() {
    if (!price || !description) return
    setLoading('offer')
    const res = await fetch(`/api/v1/leads/${matchId}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        price_mad: parseFloat(price),
        description,
        estimated_duration: duration || null,
      }),
    })
    setLoading(null)
    if (res.ok) {
      const data = await res.json()
      router.push(`/pro/messages/${data.conversation_id}`)
    }
  }

  if (showOffer) {
    return (
      <div className="bg-white rounded-xl p-4 space-y-4">
        <h3 className="font-semibold text-gray-900">
          {isRTL ? 'إرسال عرض' : 'Envoyer une offre'}
        </h3>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            {isRTL ? 'السعر (درهم) *' : 'Prix (MAD) *'}
          </label>
          <Input
            type="number"
            value={price}
            onChange={e => setPrice(e.target.value)}
            placeholder="500"
            className="h-12 rounded-xl"
            autoFocus
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            {isRTL ? 'وصف العرض *' : 'Description de votre offre *'}
          </label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={isRTL ? 'أصف ما ستقوم به وكيف...' : 'Décrivez ce que vous allez faire et comment...'}
            className="rounded-xl resize-none"
            rows={3}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 block mb-2">
            {isRTL ? 'المدة المقدرة' : 'Durée estimée'}
          </label>
          <Input
            value={duration}
            onChange={e => setDuration(e.target.value)}
            placeholder={isRTL ? '2-3 ساعات' : '2-3 heures'}
            className="h-12 rounded-xl"
          />
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowOffer(false)}
            variant="outline"
            className="flex-1 h-12 rounded-xl"
          >
            {isRTL ? 'إلغاء' : 'Annuler'}
          </Button>
          <Button
            onClick={handleSendOffer}
            disabled={!price || !description || !!loading}
            className="flex-1 bg-[#1A6B4A] hover:bg-[#155c3e] text-white h-12 rounded-xl font-semibold"
          >
            {loading === 'offer' ? '...' : (isRTL ? 'إرسال العرض' : "Envoyer l'offre")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <Button
        onClick={handleDecline}
        disabled={!!loading}
        variant="outline"
        className="flex-1 h-12 rounded-xl border-red-200 text-red-600 hover:bg-red-50 font-semibold"
      >
        {loading === 'decline' ? '...' : (isRTL ? 'رفض' : 'Décliner')}
      </Button>
      <Button
        onClick={() => setShowOffer(true)}
        className="flex-2 flex-grow-[2] bg-[#1A6B4A] hover:bg-[#155c3e] text-white h-12 rounded-xl font-semibold"
      >
        {isRTL ? 'إرسال عرض ✉️' : 'Envoyer une offre ✉️'}
      </Button>
    </div>
  )
}
