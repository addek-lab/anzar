import ProviderNav from '@/components/provider/ProviderNav'

export default function ProviderMainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F7F7F5]">
      <main className="pb-28">{children}</main>
      <ProviderNav />
    </div>
  )
}
