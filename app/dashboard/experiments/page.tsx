import { prisma } from '@/lib/db'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ExperimentsList } from '@/components/dashboard/experiments-list'
import { ExperimentsPageClient, StatusFilter } from '@/components/dashboard/experiments-page-client'

async function getExperimentsData(status?: string) {
  try {
    const where: any = {}
    if (status && status !== 'all') {
      where.status = status
    }
    
    const [experiments, stats] = await Promise.all([
      prisma.experiment.findMany({
        where,
        include: {
          _count: {
            select: {
              assignments: true
            }
          }
        },
        orderBy: status === 'active'
          ? { startDate: 'desc' }
          : { createdAt: 'desc' },
        take: 50,
      }),
      prisma.experiment.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])
    
    const statusCount = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)
    
    return {
      experiments,
      statusCount,
      metrics: {
        total: experiments.length,
        active: statusCount['active'] || 0,
        draft: statusCount['draft'] || 0,
        completed: statusCount['completed'] || 0,
        paused: statusCount['paused'] || 0,
        archived: statusCount['archived'] || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching experiments:', error)
    return {
      experiments: [],
      statusCount: {},
      metrics: {
        total: 0,
        active: 0,
        draft: 0,
        completed: 0,
        paused: 0,
        archived: 0,
      },
    }
  }
}

export default async function ExperimentsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status || 'all'
  const { experiments, metrics } = await getExperimentsData(status)
  
  return (
    <div className="space-y-6">
      <div className="border-b border-indigo-500/20 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-indigo-400 font-mono uppercase">
              Experiments Dashboard
            </h1>
            <p className="text-gray-400 mt-1">
              Manage A/B tests and analyze intervention effectiveness
            </p>
          </div>
          <ExperimentsPageClient />
        </div>
      </div>
      
      {/* Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Experiments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-400 font-mono">{metrics.total}</div>
            <p className="text-xs text-gray-500 mt-1">All experiments</p>
          </CardContent>
        </Card>
        
        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400 font-mono">{metrics.active}</div>
            <p className="text-xs text-gray-500 mt-1">Running now</p>
          </CardContent>
        </Card>
        
        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-400 font-mono">{metrics.draft}</div>
            <p className="text-xs text-gray-500 mt-1">Not started</p>
          </CardContent>
        </Card>
        
        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400 font-mono">{metrics.completed}</div>
            <p className="text-xs text-gray-500 mt-1">Finished</p>
          </CardContent>
        </Card>
        
        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Paused</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400 font-mono">{metrics.paused}</div>
            <p className="text-xs text-gray-500 mt-1">Temporarily stopped</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Experiments List */}
      <Card className="mission-card-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-indigo-400 font-mono uppercase tracking-wide">
                Experiments
              </CardTitle>
              <CardDescription className="text-gray-400">
                {experiments.length} experiment{experiments.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
            <Suspense fallback={<div className="w-[180px] h-10 bg-[#1a1f2e] rounded-md animate-pulse" />}>
              <StatusFilter currentStatus={status} />
            </Suspense>
          </div>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ExperimentsListSkeleton />}>
            <ExperimentsList experiments={experiments} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}


function ExperimentsListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full bg-[#1a1f2e]" />
      ))}
    </div>
  )
}

