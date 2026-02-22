import Header from '~components/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header />
      <div className="mt-16">{children}</div>
    </>
  )
}
