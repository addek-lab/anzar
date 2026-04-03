import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') redirect('/app')

  return (
    <div className="min-h-screen bg-[#F7F7F5] flex">
      {/* Desktop Sidebar */}
      <AdminSidebar adminName={profile?.full_name ?? 'Admin'} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-[#1A6B4A] rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-sm">Anzar Admin</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <span className="bg-[#1A6B4A]/10 text-[#1A6B4A] text-xs font-semibold px-2.5 py-1 rounded-full">
              Admin
            </span>
            <div className="w-8 h-8 bg-[#1A6B4A] rounded-full flex items-center justify-center text-white text-sm font-bold">
              {(profile?.full_name ?? 'A').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile nav tabs */}
        <div className="lg:hidden bg-white border-b border-gray-200 overflow-x-auto">
          <div className="flex px-4 py-2 gap-1 min-w-max">
            {[
              { label: 'Dashboard', href: '/admin' },
              { label: 'Vérif.', href: '/admin/verify' },
              { label: 'Demandes', href: '/admin/requests' },
              { label: 'Avis', href: '/admin/reviews' },
              { label: 'Utilisateurs', href: '/admin/users' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className="text-xs font-medium text-gray-600 hover:text-[#1A6B4A] px-3 py-1.5 rounded-lg hover:bg-[#1A6B4A]/5 whitespace-nowrap transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
