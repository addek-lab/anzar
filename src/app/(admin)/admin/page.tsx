import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: pendingProviders },
    { count: openRequests },
    { count: pendingReviews },
  ] = await Promise.all([
    supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const stats = [
    { label: 'Vérifications en attente', value: pendingProviders ?? 0, href: '/admin/verify', color: 'bg-amber-100 text-amber-700' },
    { label: 'Demandes ouvertes', value: openRequests ?? 0, href: '/admin/requests', color: 'bg-blue-100 text-blue-700' },
    { label: 'Avis à modérer', value: pendingReviews ?? 0, href: '/admin/reviews', color: 'bg-purple-100 text-purple-700' },
  ]

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">Tableau de bord</h2>
      <div className="grid grid-cols-1 gap-3">
        {stats.map(stat => (
          <Link key={stat.href} href={stat.href}>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition">
              <p className="font-medium text-gray-700">{stat.label}</p>
              <span className={`text-xl font-bold px-3 py-1 rounded-full ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
