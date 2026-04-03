'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from '@/hooks/useLocale'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Send } from 'lucide-react'
import { toast } from 'sonner'

type Message = {
  id: string
  sender_id: string
  content: string
  message_type: string
  created_at: string
  offer?: { id: string; price_mad: number; description: string; status: string; estimated_duration: string | null } | null
}

type ConvInfo = {
  provider_name: string
  category_icon: string
  category_name: string
}

export default function CustomerChatPage() {
  const params = useParams()
  const conversationId = params.id as string
  const router = useRouter()
  const { locale, isRTL } = useLocale()
  const BackIcon = isRTL ? ArrowRight : ArrowLeft

  const [messages, setMessages] = useState<Message[]>([])
  const [convInfo, setConvInfo] = useState<ConvInfo | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [offerLoading, setOfferLoading] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Get session + conversation info
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/auth'); return }
      setMyId(session.user.id)
      setToken(session.access_token)
    })
  }, [router])

  useEffect(() => {
    if (!token) return
    // Load conversation metadata
    const supabase = createClient()
    supabase
      .from('conversations')
      .select(`
        provider_profile:provider_profiles!conversations_provider_id_fkey(
          profile:profiles(full_name)
        ),
        request:service_requests(
          category:categories(name_fr, name_ar, icon)
        )
      `)
      .eq('id', conversationId)
      .single()
      .then(({ data }) => {
        if (!data) return
        const pp = (data as any).provider_profile
        const req = (data as any).request
        setConvInfo({
          provider_name: pp?.profile?.full_name ?? (isRTL ? 'حرفي' : 'Artisan'),
          category_icon: req?.category?.icon ?? '🔧',
          category_name: isRTL ? req?.category?.name_ar : req?.category?.name_fr,
        })
      })
  }, [token, conversationId, isRTL])

  const loadMessages = async () => {
    if (!token) return
    const res = await fetch(`/api/v1/messages?conversation_id=${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
  }

  useEffect(() => {
    if (!token) return
    loadMessages()
    const interval = setInterval(loadMessages, 4000)
    return () => clearInterval(interval)
  }, [token, conversationId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage() {
    if (!input.trim() || !token || sending) return
    setSending(true)
    const content = input.trim()
    setInput('')
    const res = await fetch('/api/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ conversation_id: conversationId, content }),
    })
    if (res.ok) await loadMessages()
    setSending(false)
  }

  async function handleAcceptOffer(offerId: string) {
    if (!token || offerLoading) return
    setOfferLoading(offerId)
    try {
      const res = await fetch(`/api/v1/offers/${offerId}/accept`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        toast.success(isRTL ? '✅ تم قبول العرض!' : '✅ Offre acceptée !')
        await loadMessages()
      } else {
        const data = await res.json()
        toast.error(data.error || (isRTL ? 'خطأ' : 'Erreur'))
      }
    } catch {
      toast.error(isRTL ? 'خطأ في الشبكة' : 'Erreur réseau')
    } finally {
      setOfferLoading(null)
    }
  }

  async function handleDeclineOffer(offerId: string) {
    if (!token || offerLoading) return
    setOfferLoading(offerId)
    try {
      const res = await fetch(`/api/v1/offers/${offerId}/decline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        await loadMessages()
      } else {
        const data = await res.json()
        toast.error(data.error || (isRTL ? 'خطأ' : 'Erreur'))
      }
    } catch {
      toast.error(isRTL ? 'خطأ في الشبكة' : 'Erreur réseau')
    } finally {
      setOfferLoading(null)
    }
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale === 'ar' ? 'ar-MA' : 'fr-MA', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 bg-white flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-3 flex items-center gap-3 flex-shrink-0">
        <button onClick={() => router.back()} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50">
          <BackIcon size={18} className="text-gray-600" />
        </button>
        <div className="w-10 h-10 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="font-bold text-[#1A6B4A] text-sm">
            {convInfo?.provider_name?.charAt(0).toUpperCase() ?? '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{convInfo?.provider_name}</p>
          <p className="text-xs text-gray-400 truncate">
            {convInfo?.category_icon} {convInfo?.category_name}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50">
        {messages.map(msg => {
          const isMe = msg.sender_id === myId
          if (msg.message_type === 'offer' && msg.offer) {
            const canAct = !isMe && msg.offer.status === 'pending'
            const isThisLoading = offerLoading === msg.offer.id
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-white border border-[#1A6B4A]/20 rounded-2xl p-4 max-w-xs w-full shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">💼</span>
                    <span className="font-bold text-[#1A6B4A] text-lg">{msg.offer.price_mad} MAD</span>
                  </div>
                  <p className="text-sm text-gray-700">{msg.offer.description}</p>
                  {msg.offer.estimated_duration && (
                    <p className="text-xs text-gray-400 mt-1">⏱ {msg.offer.estimated_duration}</p>
                  )}
                  <div className={`mt-2 text-xs font-medium px-2 py-0.5 rounded-full inline-block ${
                    msg.offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    msg.offer.status === 'declined' ? 'bg-red-100 text-red-600' :
                    'bg-amber-50 text-amber-700'
                  }`}>
                    {msg.offer.status === 'accepted' ? (isRTL ? '✅ مقبول' : '✅ Acceptée') :
                     msg.offer.status === 'declined' ? (isRTL ? '❌ مرفوض' : '❌ Refusée') :
                     (isRTL ? '⏳ في الانتظار' : '⏳ En attente')}
                  </div>

                  {/* Accept / Decline buttons for pending offers received by the customer */}
                  {canAct && (
                    <div className="mt-3 space-y-2">
                      <button
                        onClick={() => handleAcceptOffer(msg.offer!.id)}
                        disabled={!!offerLoading}
                        className="w-full bg-[#1A6B4A] text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {isThisLoading ? (
                          <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>✅ {isRTL ? 'قبول العرض' : "Accepter l'offre"}</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeclineOffer(msg.offer!.id)}
                        disabled={!!offerLoading}
                        className="w-full border border-red-300 text-red-600 rounded-xl py-2.5 text-sm font-medium disabled:opacity-50 active:scale-[0.98] transition-all"
                      >
                        {isRTL ? 'رفض' : 'Décliner'}
                      </button>
                    </div>
                  )}

                  <p className="text-xs text-gray-300 mt-2 text-end">{formatTime(msg.created_at)}</p>
                </div>
              </div>
            )
          }
          return (
            <div key={msg.id} className={`flex ${isMe ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                isMe
                  ? 'bg-[#1A6B4A] text-white rounded-br-sm'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-sm'
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'} text-end`}>
                  {formatTime(msg.created_at)}
                </p>
              </div>
            </div>
          )
        })}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-gray-400 text-sm">
              {isRTL ? 'ابدأ المحادثة' : 'Démarrez la conversation'}
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-end gap-3 flex-shrink-0 pb-8">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
          placeholder={isRTL ? 'اكتب رسالة...' : 'Tapez un message...'}
          rows={1}
          className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#1A6B4A] focus:bg-white transition-all resize-none leading-5 max-h-32"
          style={{ overflowY: 'auto' }}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          className="w-11 h-11 bg-[#1A6B4A] rounded-2xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 active:scale-95 transition-all"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </div>
  )
}
