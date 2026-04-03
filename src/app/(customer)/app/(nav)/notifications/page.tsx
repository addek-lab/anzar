'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/hooks/useLocale'
import { createClient } from '@/lib/supabase/client'
import { Bell, CheckCheck } from 'lucide-react'
import { toast } from 'sonner'

type Notification = {
  id: string
  type: string
  title_fr: string
  title_ar: string
  body_fr: string
  body_ar: string
  read_at: string | null
  created_at: string
}

const TYPE_ICONS: Record<string, string> = {
  new_lead: '🔔',
  offer_received: '💼',
  offer_accepted: '✅',
  offer_declined: '❌',
  message_received: '💬',
  job_completed: '🎉',
  review_received: '⭐',
  verification_approved: '✅',
  verification_rejected: '❌',
  request_expired: '⏰',
}

export default function NotificationsPage() {
  const { isRTL } = useLocale()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setToken(session.access_token)
    })
  }, [])

  const load = async (t: string) => {
    const res = await fetch('/api/v1/notifications', {
      headers: { Authorization: `Bearer ${t}` },
    })
    if (res.ok) {
      const data = await res.json()
      setNotifications(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    if (!token) return
    load(token)
  }, [token])

  const markAllRead = async () => {
    if (!token) return
    await fetch('/api/v1/notifications/read', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({}),
    })
    setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })))
    toast.success(isRTL ? 'تم تحديد الكل كمقروء' : 'Tout marqué comme lu')
  }

  const formatTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return isRTL ? 'الآن' : 'À l\'instant'
    if (mins < 60) return isRTL ? `منذ ${mins}د` : `Il y a ${mins}min`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return isRTL ? `منذ ${hrs}س` : `Il y a ${hrs}h`
    const days = Math.floor(hrs / 24)
    return isRTL ? `منذ ${days} أيام` : `Il y a ${days}j`
  }

  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-5 pt-14 pb-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {isRTL ? `${unreadCount} غير مقروءة` : `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-sm text-[#1A6B4A] font-medium"
          >
            <CheckCheck size={16} />
            {isRTL ? 'قراءة الكل' : 'Tout lire'}
          </button>
        )}
      </div>

      <div className="pb-28 px-4 pt-3 space-y-2">
        {loading && (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-11 h-11 bg-gray-100 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded-full w-3/4" />
                  <div className="h-3 bg-gray-100 rounded-full w-full" />
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-50 rounded-3xl mx-auto flex items-center justify-center mb-4">
              <Bell size={28} className="text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700">
              {isRTL ? 'لا توجد إشعارات' : 'Aucune notification'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {isRTL ? 'ستظهر إشعاراتك هنا' : 'Vos notifications apparaîtront ici'}
            </p>
          </div>
        )}

        {notifications.map(n => {
          const isUnread = !n.read_at
          const icon = TYPE_ICONS[n.type] ?? '🔔'
          const title = isRTL ? n.title_ar : n.title_fr
          const body = isRTL ? n.body_ar : n.body_fr

          return (
            <div
              key={n.id}
              className={`rounded-2xl p-4 transition-all ${
                isUnread ? 'bg-white shadow-sm border border-[#1A6B4A]/10' : 'bg-white/60 border border-gray-100'
              }`}
            >
              <div className="flex gap-3 items-start">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                  isUnread ? 'bg-[#1A6B4A]/10' : 'bg-gray-50'
                }`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-semibold leading-snug ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                      {title}
                    </p>
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-[#1A6B4A] flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{body}</p>
                  <p className="text-xs text-gray-300 mt-1.5">{formatTime(n.created_at)}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
