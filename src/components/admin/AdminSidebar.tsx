'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Shield,
  LayoutDashboard,
  CheckCircle,
  List,
  Star,
  Users,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { label: 'Vérifications', icon: CheckCircle, href: '/admin/verify' },
  { label: 'Demandes', icon: List, href: '/admin/requests' },
  { label: 'Avis', icon: Star, href: '/admin/reviews' },
  { label: 'Utilisateurs', icon: Users, href: '/admin/users' },
]

export default function AdminSidebar({ adminName }: { adminName: string }) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-white border-r border-gray-200 z-40">
      {/* Logo */}
      <div className="h-14 flex items-center gap-3 px-6 border-b border-gray-200">
        <div className="w-8 h-8 bg-[#1A6B4A] rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm leading-tight">Anzar Admin</p>
          <p className="text-[10px] text-gray-400 leading-tight">Panneau de gestion</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#1A6B4A] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <item.icon className={`w-4.5 h-4.5 flex-shrink-0 w-[18px] h-[18px] ${isActive ? 'text-white' : 'text-gray-400'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#1A6B4A] rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {adminName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{adminName}</p>
            <p className="text-xs text-[#1A6B4A] font-medium">Administrateur</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
