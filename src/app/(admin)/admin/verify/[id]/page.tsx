import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import VerifyActions from '@/components/admin/VerifyActions'
import Link from 'next/link'

export default async function VerifyProviderPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      profile:profiles(full_name, phone, created_at),
      city:cities(name_fr),
      trades:categories(name_fr)
    `)
    .eq('id', id)
    .single()

  if (!provider) notFound()

  // Get trade names
  let tradeNames: string[] = []
  if (provider.trade_ids?.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('name_fr')
      .in('id', provider.trade_ids)
    tradeNames = cats?.map((c: any) => c.name_fr) ?? []
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <Link href="/admin/verify" className="text-sm text-[#1A6B4A] hover:underline">
        ← Retour à la file
      </Link>

      <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-[#1A6B4A]/10 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-[#1A6B4A]">
              {provider.profile?.full_name?.charAt(0)}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{provider.profile?.full_name}</h2>
            <p className="text-gray-500">{provider.profile?.phone}</p>
          </div>
        </div>

        {[
          { label: 'Nom commercial', value: provider.business_name },
          { label: 'Ville', value: provider.city?.name_fr },
          { label: 'Métiers', value: tradeNames.join(', ') },
          { label: "Années d'expérience", value: provider.years_experience ? `${provider.years_experience} ans` : '—' },
          { label: 'Bio', value: provider.bio_fr },
        ].map(({ label, value }) => value ? (
          <div key={label}>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-sm text-gray-800 mt-0.5">{value}</p>
          </div>
        ) : null)}

        {provider.identity_doc_url && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Pièce d&apos;identité</p>
            <img
              src={provider.identity_doc_url}
              alt="ID document"
              className="rounded-lg w-full object-cover max-h-48"
            />
          </div>
        )}
      </div>

      <VerifyActions providerId={id} />
    </div>
  )
}
