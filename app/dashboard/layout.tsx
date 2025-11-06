import { Navbar } from '@/components/dashboard/navbar'
import { SystemStatusBar } from '@/components/dashboard/system-status-bar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] mission-grid">
      <SystemStatusBar />
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}

