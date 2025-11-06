import { prisma } from '@/lib/db'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertsOverview } from '@/components/dashboard/alerts-overview'
import { AlertsList } from '@/components/dashboard/alerts-list'

async function getAlertsData() {
  try {
    const [alerts, stats] = await Promise.all([
      prisma.alert.findMany({
        include: {
          tutor: {
            select: {
              tutorId: true,
              primarySubject: true,
              activeStatus: true,
            },
          },
        },
        orderBy: [
          { isAcknowledged: 'asc' },
          { createdAt: 'desc' },
        ],
        take: 100,
      }),
      prisma.alert.groupBy({
        by: ['severity'],
        where: { isAcknowledged: false },
        _count: true,
      }),
    ])

    const severityCount = stats.reduce((acc, stat) => {
      acc[stat.severity] = stat._count
      return acc
    }, {} as Record<string, number>)

    return { alerts, severityCount }
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return { alerts: [], severityCount: {} }
  }
}

export default async function AlertsPage() {
  const { alerts, severityCount } = await getAlertsData()

  return (
    <div className="space-y-6">
      <div className="border-b border-cyan-500/20 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-cyan-400 font-mono uppercase">
          Alerts & Notifications
        </h1>
        <p className="text-gray-400 mt-1">
          Monitor and manage system alerts for tutor quality
        </p>
      </div>

      <Suspense fallback={<Skeleton className="h-32 bg-gray-800/50" />}>
        <AlertsOverview severityCount={severityCount} totalAlerts={alerts.length} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-96 bg-gray-800/50" />}>
        <AlertsList initialAlerts={alerts} />
      </Suspense>
    </div>
  )
}

