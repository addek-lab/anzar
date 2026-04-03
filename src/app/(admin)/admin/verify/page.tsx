import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function VerificationQueuePage() {
  const supabase = await createClient()

  const { data: providers } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      profile:profiles(full_name, phone, created_at)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900">
        File de vérification
        {providers && providers.length > 0 && (
          <span className="ms-2 bg-amber-100 text-amber-700 text-sm px-2 py-0.5 rounded-full">
            {providers.length}
          </span>
        )}
      </h2>

      {providers && providers.length > 0 ? (
        <div className="space-y-3">
          {providers.map((p: any) => (
            <Link key={p.id} href={`/admin/verify/${p.id}`}>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{p.profile?.full_name}</p>
                    <p className="text-sm text-gray-500">{p.profile?.phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Soumis le {new Date(p.created_at).toLocaleDateString('fr-MA')}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                    En attente
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-8 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-gray-600 font-medium">File vide</p>
          <p className="text-sm text-gray-400 mt-1">Tous les profils ont été traités.</p>
        </div>
      )}
    </div>
  )
}
