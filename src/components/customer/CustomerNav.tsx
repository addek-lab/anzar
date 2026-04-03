'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Home, FileText, MessageSquare, Briefcase, Bell } from 'lucide-react'

export default function CustomerNav() {
  const pathname = usePathname()
  const t = useTranslations('nav')

  const links = [
    { href: '/app', icon: Home, label: t('home') },
    { href: '/app/requests', icon: FileText, label: t('requests') },
    { href: '/app/jobs', icon: Briefcase, label: t('jobs') },
    { href: '/app/messages', icon: MessageSquare, label: t('messages') },
    { href: '/app/notifications', icon: Bell, label: t('notifications') },
  ]

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50">
      <div className="mx-3 mb-4 bg-white rounded-3xl shadow-xl shadow-black/10 border border-gray-100/80 px-2">
        <div className="flex">
          {links.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/app' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs transition-all ${
                  isActive ? 'text-[#1A6B4A]' : 'text-gray-300'
                }`}
              >
                <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-[#1A6B4A]/10' : ''}`}>
                  <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className={`font-medium transition-all text-[10px] ${isActive ? 'text-[#1A6B4A]' : 'text-gray-400'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
