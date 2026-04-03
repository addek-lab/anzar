import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Star, CheckCircle, XCircle, Clock } from 'lucide-react'

const TYPE_TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'customer', label: 'Clients' },
  { key: 'provider', label: 'Artisans' },
  { key: 'admin', label: 'Admins' },
]

const TYPE_BADGE: Record<string, { label: string; className: string }> = {
  customer: { label: 'Client', className: 'bg-blue-100 text-blue-700' },
  provider: { label: 'Artisan', className: 'bg-[#1A6B4A]/10 text-[#1A6B4A]' },
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-700' },
}

const PROVIDER_STATUS_BADGE: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  pending: { label: 'En attente', icon: Clock, className: 'bg-amber-100 text-amber-700' },
  verified: { label: 'Vérifié', icon: CheckCircle, className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Rejeté', icon: XCircle, className: 'bg-red-100 text-red-600' },
  suspended: { label: 'Suspendu', icon: XCircle, className: 'bg-gray-100 text-gray-500' },
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>
}) {
  const { type: typeParam, page: pageParam } = await searchParams
  const activeType = typeParam ?? 'all'
  const page = parseInt(pageParam ?? '0', 10)
  const limit = 20

  const supabase = await createClient()

  let query = supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      phone,
      user_type,
      created_at,
      provider_profiles(
        id,
        status,
        rating,
        review_count,
        business_name
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * limit, page * limit + limit - 1)

  if (activeType !== 'all') {
    query = query.eq('user_type', activeType)
  }

  const { data: users, count } = await query

  const totalPages = Math.ceil((count ?? 0) / limit)

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <p className="text-sm text-gray-500 mt-1">
          {count ?? 0} utilisateur{(count ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-gray-200 flex gap-1 overflow-x-auto">
        {TYPE_TABS.map(tab => (
          <Link
            key={tab.key}
            href={`/admin/users?type=${tab.key}`}
            className={`text-sm font-medium px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
              activeType === tab.key
                ? 'border-[#1A6B4A] text-[#1A6B4A]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Desktop table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Utilisateur</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Téléphone</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut artisan</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Note</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Inscrit le</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users && users.length > 0 ? (
                users.map((user: any) => {
                  const typeBadge = TYPE_BADGE[user.user_type] ?? { label: user.user_type, className: 'bg-gray-100 text-gray-500' }
                  const provider = user.provider_profiles?.[0]
                  const providerStatus = provider ? PROVIDER_STATUS_BADGE[provider.status] : null

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#1A6B4A] flex-shrink-0">
                            {(user.full_name ?? '?').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.full_name ?? '—'}</p>
                            {provider?.business_name && (
                              <p className="text-xs text-gray-400">{provider.business_name}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">
                        {user.phone ?? '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeBadge.className}`}>
                          {typeBadge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {providerStatus ? (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${providerStatus.className}`}>
                            <providerStatus.icon className="w-3 h-3" />
                            {providerStatus.label}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {provider?.rating ? (
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-[#E8A838] fill-[#E8A838]" />
                            <span className="text-sm font-semibold text-gray-800">
                              {Number(provider.rating).toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-400">
                              ({provider.review_count ?? 0})
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString('fr-MA', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {provider && provider.status === 'pending' && (
                            <Link
                              href={`/admin/verify/${provider.id}`}
                              className="text-xs text-[#1A6B4A] hover:underline font-medium"
                            >
                              Vérifier
                            </Link>
                          )}
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-xs text-gray-400 hover:text-gray-600 font-medium"
                          >
                            Détails
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucun utilisateur trouvé</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-50">
          {users && users.length > 0 ? (
            users.map((user: any) => {
              const typeBadge = TYPE_BADGE[user.user_type] ?? { label: user.user_type, className: 'bg-gray-100 text-gray-500' }
              const provider = user.provider_profiles?.[0]
              const providerStatus = provider ? PROVIDER_STATUS_BADGE[provider.status] : null

              return (
                <div key={user.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center text-sm font-bold text-[#1A6B4A] flex-shrink-0">
                        {(user.full_name ?? '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{user.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-500">{user.phone ?? '—'}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${typeBadge.className}`}>
                      {typeBadge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    {providerStatus && (
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${providerStatus.className}`}>
                        <providerStatus.icon className="w-3 h-3" />
                        {providerStatus.label}
                      </span>
                    )}
                    {provider?.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-[#E8A838] fill-[#E8A838]" />
                        <span className="text-xs font-semibold text-gray-700">
                          {Number(provider.rating).toFixed(1)}
                        </span>
                      </div>
                    )}
                    <span className="text-xs text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('fr-MA')}
                    </span>
                    {provider && provider.status === 'pending' && (
                      <Link
                        href={`/admin/verify/${provider.id}`}
                        className="text-xs text-[#1A6B4A] hover:underline font-medium"
                      >
                        Vérifier →
                      </Link>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-4 py-12 text-center">
              <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page + 1} sur {totalPages} · {count} résultats
          </p>
          <div className="flex gap-2">
            {page > 0 && (
              <Link
                href={`/admin/users?type=${activeType}&page=${page - 1}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                ← Précédent
              </Link>
            )}
            {page < totalPages - 1 && (
              <Link
                href={`/admin/users?type=${activeType}&page=${page + 1}`}
                className="px-4 py-2 text-sm font-medium text-[#1A6B4A] bg-white border border-[#1A6B4A] rounded-xl hover:bg-[#1A6B4A]/5 transition"
              >
                Suivant →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
