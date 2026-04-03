import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
  AlertCircle,
  Star,
  FileText,
  Briefcase,
  ArrowUpRight,
  Activity,
} from 'lucide-react'

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendLabel,
  href,
}: {
  label: string
  value: number
  icon: React.ElementType
  iconBg: string
  iconColor: string
  trend?: string
  trendLabel?: string
  href?: string
}) {
  const content = (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {href && (
          <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString('fr-MA')}</p>
      <p className="text-sm text-gray-500">{label}</p>
      {trend && (
        <div className="flex items-center gap-1 mt-2">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span className="text-xs text-emerald-600 font-medium">{trend}</span>
          <span className="text-xs text-gray-400">{trendLabel}</span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="group block">
        {content}
      </Link>
    )
  }
  return content
}

function AlertCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  href,
  count,
}: {
  icon: React.ElementType
  iconBg: string
  iconColor: string
  title: string
  description: string
  href: string
  count: number
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl p-4 border-l-4 border-[#E8A838] shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
        <span className="bg-[#E8A838] text-white text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0">
          {count}
        </span>
      </div>
    </Link>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    open: { label: 'Ouvert', className: 'bg-blue-100 text-blue-700' },
    in_progress: { label: 'En cours', className: 'bg-amber-100 text-amber-700' },
    completed: { label: 'Terminé', className: 'bg-emerald-100 text-emerald-700' },
    expired: { label: 'Expiré', className: 'bg-gray-100 text-gray-500' },
    cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-600' },
  }
  const info = map[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${info.className}`}>
      {info.label}
    </span>
  )
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [
    { count: totalProviders },
    { count: pendingProviders },
    { count: verifiedProviders },
    { count: totalRequests },
    { count: openRequests },
    { count: completedRequests },
    { count: totalJobs }, // eslint-disable-line @typescript-eslint/no-unused-vars
    { count: pendingReviews },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('provider_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('provider_profiles').select('*', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'open'),
    supabase.from('service_requests').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  // Recent data
  const { data: recentRequests } = await supabase
    .from('service_requests')
    .select(`
      id,
      status,
      urgency,
      created_at,
      customer:profiles!service_requests_customer_id_fkey(full_name),
      category:categories(name_fr, icon)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const { data: recentProviders } = await supabase
    .from('provider_profiles')
    .select(`
      id,
      status,
      created_at,
      profile:profiles(full_name, phone)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const now = new Date()
  const dateStr = now.toLocaleDateString('fr-MA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">{dateStr}</p>
      </div>

      {/* Alert cards */}
      {((pendingProviders ?? 0) > 0 || (pendingReviews ?? 0) > 0) && (
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions requises</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(pendingProviders ?? 0) > 0 && (
              <AlertCard
                icon={AlertCircle}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
                title="Artisans en attente de vérification"
                description="Profils soumis nécessitant une revue manuelle"
                href="/admin/verify"
                count={pendingProviders ?? 0}
              />
            )}
            {(pendingReviews ?? 0) > 0 && (
              <AlertCard
                icon={Star}
                iconBg="bg-purple-50"
                iconColor="text-purple-600"
                title="Avis en attente de modération"
                description="Évaluations soumises à approuver ou rejeter"
                href="/admin/reviews"
                count={pendingReviews ?? 0}
              />
            )}
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Vue d&apos;ensemble</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total artisans"
            value={totalProviders ?? 0}
            icon={Users}
            iconBg="bg-[#1A6B4A]/10"
            iconColor="text-[#1A6B4A]"
            trend="+12%"
            trendLabel="ce mois"
            href="/admin/users"
          />
          <StatCard
            label="En attente vérif."
            value={pendingProviders ?? 0}
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            href="/admin/verify"
          />
          <StatCard
            label="Demandes actives"
            value={openRequests ?? 0}
            icon={FileText}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            trend="+5%"
            trendLabel="cette semaine"
            href="/admin/requests"
          />
          <StatCard
            label="Missions terminées"
            value={completedRequests ?? 0}
            icon={Briefcase}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            trend="+18%"
            trendLabel="ce mois"
          />
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-4 h-4 text-[#1A6B4A]" />
            <span className="text-xs font-medium text-gray-500">Artisans vérifiés</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{verifiedProviders ?? 0}</p>
          {(totalProviders ?? 0) > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(((verifiedProviders ?? 0) / (totalProviders ?? 1)) * 100)}% du total
            </p>
          )}
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500">Total demandes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalRequests ?? 0}</p>
          <p className="text-xs text-gray-400 mt-1">Toutes périodes</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-500">Avis à modérer</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingReviews ?? 0}</p>
          <Link href="/admin/reviews" className="text-xs text-[#1A6B4A] hover:underline mt-1 inline-block">
            Voir les avis →
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Utilisateurs</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalUsers ?? 0}</p>
          <Link href="/admin/users" className="text-xs text-[#1A6B4A] hover:underline mt-1 inline-block">
            Gérer →
          </Link>
        </div>
      </div>

      {/* Recent activity tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Dernières demandes</h3>
            <Link href="/admin/requests" className="text-xs text-[#1A6B4A] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentRequests && recentRequests.length > 0 ? (
              recentRequests.map((req: any) => (
                <div key={req.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 text-sm">
                    {req.category?.icon ?? '🔧'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {req.category?.name_fr ?? 'Catégorie inconnue'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {req.customer?.full_name ?? 'Client inconnu'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <StatusBadge status={req.status} />
                    <span className="text-[10px] text-gray-400">
                      {new Date(req.created_at).toLocaleDateString('fr-MA')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                Aucune demande récente
              </div>
            )}
          </div>
        </div>

        {/* Recent provider signups */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Dernières inscriptions artisans</h3>
            <Link href="/admin/verify" className="text-xs text-[#1A6B4A] hover:underline font-medium">
              Vérifier →
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentProviders && recentProviders.length > 0 ? (
              recentProviders.map((p: any) => (
                <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#1A6B4A]">
                    {(p.profile?.full_name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {p.profile?.full_name ?? 'Nom inconnu'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.profile?.phone ?? ''}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {p.status === 'pending' && (
                      <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        En attente
                      </span>
                    )}
                    {p.status === 'verified' && (
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Vérifié
                      </span>
                    )}
                    {p.status === 'rejected' && (
                      <span className="bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        Rejeté
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400">
                      {new Date(p.created_at).toLocaleDateString('fr-MA')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                Aucune inscription récente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
