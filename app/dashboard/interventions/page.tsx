import { prisma } from '@/lib/db'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Send, Eye, CheckCircle, Clock, XCircle, Mail } from 'lucide-react'

async function getInterventionsData() {
  try {
    const [interventions, stats] = await Promise.all([
      prisma.intervention.findMany({
        include: {
          tutor: {
            select: {
              tutorId: true,
              primarySubject: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.intervention.groupBy({
        by: ['status'],
        _count: true,
      }),
    ])

    const statusCount = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count
      return acc
    }, {} as Record<string, number>)

    // Calculate engagement metrics
    const sentInterventions = interventions.filter(i => i.sentAt)
    const openRate = sentInterventions.length > 0
      ? (interventions.filter(i => i.openedAt).length / sentInterventions.length) * 100
      : 0
    const clickRate = sentInterventions.length > 0
      ? (interventions.filter(i => i.clickedAt).length / sentInterventions.length) * 100
      : 0
    const responseRate = sentInterventions.length > 0
      ? (interventions.filter(i => i.respondedAt).length / sentInterventions.length) * 100
      : 0

    return {
      interventions,
      statusCount,
      metrics: {
        openRate,
        clickRate,
        responseRate,
        total: interventions.length,
        sent: sentInterventions.length,
        pending: statusCount['pending'] || 0,
      },
    }
  } catch (error) {
    console.error('Error fetching interventions:', error)
    return {
      interventions: [],
      statusCount: {},
      metrics: { openRate: 0, clickRate: 0, responseRate: 0, total: 0, sent: 0, pending: 0 },
    }
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return { icon: Clock, color: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50' }
    case 'sent':
      return { icon: Send, color: 'bg-blue-900/30 text-blue-400 border-blue-500/50' }
    case 'delivered':
      return { icon: CheckCircle, color: 'bg-green-900/30 text-green-400 border-green-500/50' }
    case 'opened':
      return { icon: Eye, color: 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50' }
    case 'clicked':
      return { icon: CheckCircle, color: 'bg-purple-900/30 text-purple-400 border-purple-500/50' }
    case 'responded':
      return { icon: CheckCircle, color: 'bg-green-900/30 text-green-400 border-green-500/50' }
    case 'failed':
      return { icon: XCircle, color: 'bg-red-900/30 text-red-400 border-red-500/50' }
    default:
      return { icon: Clock, color: 'bg-gray-800/50 text-gray-400 border-gray-600/50' }
  }
}

export default async function InterventionsPage() {
  const { interventions, statusCount, metrics } = await getInterventionsData()

  return (
    <div className="space-y-4">
      <div className="border-b border-cyan-500/20 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-cyan-400 font-mono uppercase">
              Intervention Campaigns
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Create and manage targeted intervention campaigns
            </p>
          </div>
          <Link href="/dashboard/interventions/new">
            <Button className="bg-cyan-600 hover:bg-cyan-500 text-white">
              <Plus className="h-4 w-4 mr-2" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        <Card className="mission-card">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-400">Total Interventions</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.total}</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.pending} pending
            </p>
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-400">Open Rate</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.openRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {metrics.sent} sent
            </p>
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-400">Click Rate</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.clickRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">
              Engagement tracking
            </p>
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2 pt-3 px-4">
            <CardTitle className="text-xs font-medium text-gray-400">Response Rate</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-2xl font-bold text-cyan-400 font-mono">{metrics.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-gray-500 mt-1">
              Tutor responses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Interventions List */}
      <Card className="mission-card-glow">
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm text-cyan-400 font-mono uppercase tracking-wide">
                Recent Interventions
              </CardTitle>
              <CardDescription className="text-xs text-gray-400 mt-1">
                {interventions.length} intervention{interventions.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {interventions.length === 0 ? (
            <div className="text-center py-10">
              <Mail className="h-10 w-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-400 mb-1">No interventions yet</h3>
              <p className="text-xs text-gray-500 mb-4">Create your first intervention campaign to get started</p>
              <Link href="/dashboard/interventions/new">
                <Button size="sm" className="bg-cyan-600 hover:bg-cyan-500 text-white">
                  <Plus className="h-3 w-3 mr-1.5" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {interventions.map((intervention) => {
                const statusBadge = getStatusBadge(intervention.status)
                const StatusIcon = statusBadge.icon

                return (
                  <div
                    key={intervention.id}
                    className="mission-card rounded-lg p-3 hover:bg-cyan-500/5 transition-all border border-cyan-500/20"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="text-sm font-semibold text-gray-200">{intervention.subject || 'Untitled Intervention'}</h3>
                          <Badge variant="outline" className={`text-xs px-2 py-0.5 ${statusBadge.color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {intervention.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-2 py-0.5 bg-purple-900/30 text-purple-400 border-purple-500/50">
                            {intervention.interventionType}
                          </Badge>
                          {intervention.experimentId && (
                            <Badge variant="outline" className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-400 border-blue-500/50">
                              A/B: {intervention.experimentVariant}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-300 line-clamp-2 mb-2">
                          {intervention.content.substring(0, 140)}...
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 font-mono flex-wrap">
                          <span>Tutor: <span className="text-cyan-400">{intervention.tutor.tutorId}</span></span>
                          <span>Subject: {intervention.tutor.primarySubject}</span>
                          <span>{new Date(intervention.createdAt).toLocaleDateString()}</span>
                          {intervention.sentAt && (
                            <span className="text-green-400">
                              Sent: {new Date(intervention.sentAt).toLocaleDateString()}
                            </span>
                          )}
                          {intervention.openedAt && (
                            <span className="text-cyan-400">
                              Opened: {new Date(intervention.openedAt).toLocaleDateString()}
                            </span>
                          )}
                          {intervention.clickedAt && (
                            <span className="text-purple-400">
                              Clicked: {new Date(intervention.clickedAt).toLocaleDateString()}
                            </span>
                          )}
                          {intervention.respondedAt && (
                            <span className="text-green-400">
                              Responded: {new Date(intervention.respondedAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Link href={`/dashboard/interventions/${intervention.id}`}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


