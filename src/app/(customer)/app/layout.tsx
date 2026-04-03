import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function CustomerLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (!profile?.user_type) redirect('/auth/type')
  if (profile.user_type !== 'customer') redirect('/pro')

  return <div className="min-h-screen bg-[#F7F7F5]">{children}</div>
}
