import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ProviderLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (!profile?.user_type) redirect('/auth/type')
  if (profile.user_type !== 'provider') redirect('/app')

  return <>{children}</>
}
