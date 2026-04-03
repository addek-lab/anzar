import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import LogoutButton from '@/components/shared/LogoutButton'

export default async function ProviderProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const { data: pp } = await supabase.from('provider_profiles').select('*').eq('profile_id', user!.id).single()

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-[#1A6B4A] px-5 pt-16 pb-10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{profile?.full_name?.charAt(0) ?? '?'}</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile?.full_name}</h1>
            <p className="text-white/60 text-sm mt-0.5">
              {pp?.status === 'verified' ? (isRTL ? '✅ موثق' : '✅ Vérifié') : (isRTL ? '⏳ في انتظار التحقق' : '⏳ En attente de vérification')}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">
        <LogoutButton locale={locale} />
      </div>
    </div>
  )
}
