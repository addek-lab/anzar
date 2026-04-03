import { createClient } from '@/lib/supabase/server'
import { getLocale } from 'next-intl/server'
import LogoutButton from '@/components/shared/LogoutButton'

export default async function CustomerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const locale = await getLocale()
  const isRTL = locale === 'ar'

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  return (
    <div className="max-w-lg mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-[#1A6B4A] px-5 pt-14 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {profile?.full_name?.charAt(0) ?? '?'}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{profile?.full_name}</h1>
            <p className="text-white/70 text-sm">{profile?.phone}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="bg-white rounded-xl p-4 space-y-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              {isRTL ? 'اللغة المفضلة' : 'Langue préférée'}
            </p>
            <p className="font-medium text-gray-900 mt-0.5">
              {profile?.preferred_locale === 'ar' ? 'العربية' : 'Français'}
            </p>
          </div>
        </div>

        <LogoutButton locale={locale} />
      </div>
    </div>
  )
}
