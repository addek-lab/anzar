import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type !== 'admin') redirect('/app')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-[#1A6B4A] text-white px-4 py-4">
        <h1 className="font-bold text-lg">Anzar Admin</h1>
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
