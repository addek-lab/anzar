import CustomerNav from '@/components/customer/CustomerNav'

export default function CustomerNavLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <CustomerNav />
    </>
  )
}
