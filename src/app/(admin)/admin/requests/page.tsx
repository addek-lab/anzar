import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { FileText, MapPin, Clock, AlertTriangle } from 'lucide-react'

const STATUS_TABS = [
  { key: 'all', label: 'Tout' },
  { key: 'open', label: 'Ouvert' },
  { key: 'in_progress', label: 'En cours' },
  { key: 'completed', label: 'Terminé' },
  { key: 'expired', label: 'Expiré' },
]

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  open: { label: 'Ouvert', className: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'En cours', className: 'bg-amber-100 text-amber-700' },
  completed: { label: 'Terminé', className: 'bg-emerald-100 text-emerald-700' },
  expired: { label: 'Expiré', className: 'bg-gray-100 text-gray-500' },
  cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-600' },
}

const URGENCY_MAP: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  urgent: { label: 'Urgent', icon: AlertTriangle, className: 'bg-red-100 text-red-600' },
  normal: { label: 'Normal', icon: Clock, className: 'bg-gray-100 text-gray-600' },
  flexible: { label: 'Flexible', icon: Clock, className: 'bg-gray-100 text-gray-500' },
}

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status: statusParam, page: pageParam } = await searchParams
  const activeStatus = statusParam && statusParam !== 'all' ? statusParam : null
  const page = parseInt(pageParam ?? '0', 10)
  const limit = 20

  const supabase = await createClient()

  let query = supabase
    .from('service_requests')
    .select(`
      id,
      status,
      urgency,
      description,
      created_at,
      customer:profiles!service_requests_customer_id_fkey(full_name, phone),
      category:categories(name_fr, icon),
      city:cities(name_fr),
      neighborhood:neighborhoods(name_fr)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * limit, page * limit + limit - 1)

  if (activeStatus) {
    query = query.eq('status', activeStatus)
  }

  const { data: requests, count } = await query

  const totalPages = Math.ceil((count ?? 0) / limit)

  const tabStatus = statusParam ?? 'all'

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Demandes de service</h1>
          <p className="text-sm text-gray-500 mt-1">
            {count ?? 0} demande{(count ?? 0) !== 1 ? 's' : ''} au total
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-100 px-4 flex gap-1 overflow-x-auto">
          {STATUS_TABS.map(tab => (
            <Link
              key={tab.key}
              href={`/admin/requests?status=${tab.key}`}
              className={`text-sm font-medium px-4 py-3 border-b-2 whitespace-nowrap transition-colors ${
                tabStatus === tab.key
                  ? 'border-[#1A6B4A] text-[#1A6B4A]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Catégorie</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Client</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ville</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Urgence</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Statut</th>
                <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests && requests.length > 0 ? (
                requests.map((req: any, idx: number) => {
                  const status = STATUS_MAP[req.status] ?? { label: req.status, className: 'bg-gray-100 text-gray-500' }
                  const urgency = URGENCY_MAP[req.urgency] ?? URGENCY_MAP.normal
                  return (
                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-xs text-gray-400 font-mono">
                        {page * limit + idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{req.category?.icon ?? '🔧'}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {req.category?.name_fr ?? '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-medium text-gray-900">{req.customer?.full_name ?? '—'}</p>
                        <p className="text-xs text-gray-400">{req.customer?.phone ?? ''}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span>{req.city?.name_fr ?? '—'}</span>
                        </div>
                        {req.neighborhood?.name_fr && (
                          <p className="text-xs text-gray-400 ml-4">{req.neighborhood.name_fr}</p>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${urgency.className}`}>
                          {urgency.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString('fr-MA', {
                          day: '2-digit', month: 'short', year: 'numeric'
                        })}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Aucune demande trouvée</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden divide-y divide-gray-50">
          {requests && requests.length > 0 ? (
            requests.map((req: any) => {
              const status = STATUS_MAP[req.status] ?? { label: req.status, className: 'bg-gray-100 text-gray-500' }
              const urgency = URGENCY_MAP[req.urgency] ?? URGENCY_MAP.normal
              return (
                <div key={req.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{req.category?.icon ?? '🔧'}</span>
                      <p className="font-semibold text-gray-900 text-sm">{req.category?.name_fr ?? '—'}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-500">
                    <p>{req.customer?.full_name ?? '—'} · {req.customer?.phone ?? ''}</p>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {req.city?.name_fr ?? '—'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-full ${urgency.className}`}>
                        {urgency.label}
                      </span>
                    </div>
                    <p className="text-gray-400">{new Date(req.created_at).toLocaleDateString('fr-MA')}</p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="px-4 py-12 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Aucune demande trouvée</p>
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
                href={`/admin/requests?status=${tabStatus}&page=${page - 1}`}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                ← Précédent
              </Link>
            )}
            {page < totalPages - 1 && (
              <Link
                href={`/admin/requests?status=${tabStatus}&page=${page + 1}`}
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
