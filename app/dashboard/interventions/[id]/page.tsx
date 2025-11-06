import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Mail, User, Calendar, Eye, MousePointerClick, MessageSquare, TrendingUp, TrendingDown } from 'lucide-react'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

async function getInterventionDetails(interventionId: string) {
  try {
    const intervention = await prisma.intervention.findUnique({
      where: { id: interventionId },
      include: {
        tutor: {
          select: {
            tutorId: true,
            primarySubject: true,
            monthsExperience: true,
            activeStatus: true,
            lastLogin: true,
            aggregates: true,
          },
        },
      },
    })

    return intervention
  } catch (error) {
    console.error('Error fetching intervention:', error)
    return null
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return { color: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50', label: 'Pending' }
    case 'sent':
      return { color: 'bg-blue-900/30 text-blue-400 border-blue-500/50', label: 'Sent' }
    case 'delivered':
      return { color: 'bg-green-900/30 text-green-400 border-green-500/50', label: 'Delivered' }
    case 'opened':
      return { color: 'bg-cyan-900/30 text-cyan-400 border-cyan-500/50', label: 'Opened' }
    case 'clicked':
      return { color: 'bg-purple-900/30 text-purple-400 border-purple-500/50', label: 'Clicked' }
    case 'responded':
      return { color: 'bg-green-900/30 text-green-400 border-green-500/50', label: 'Responded' }
    case 'failed':
      return { color: 'bg-red-900/30 text-red-400 border-red-500/50', label: 'Failed' }
    default:
      return { color: 'bg-gray-800/50 text-gray-400 border-gray-600/50', label: status }
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function InterventionDetailPage({ params }: PageProps) {
  const { id } = await params
  const intervention = await getInterventionDetails(id)

  if (!intervention) {
    notFound()
  }

  const statusBadge = getStatusBadge(intervention.status)

  // Calculate time metrics
  const timeToOpen = intervention.sentAt && intervention.openedAt
    ? ((intervention.openedAt.getTime() - intervention.sentAt.getTime()) / (1000 * 60 * 60)).toFixed(1)
    : null

  const timeToClick = intervention.openedAt && intervention.clickedAt
    ? ((intervention.clickedAt.getTime() - intervention.openedAt.getTime()) / (1000 * 60)).toFixed(0)
    : null

  const timeToRespond = intervention.sentAt && intervention.respondedAt
    ? ((intervention.respondedAt.getTime() - intervention.sentAt.getTime()) / (1000 * 60 * 60)).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/interventions">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-cyan-400">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-cyan-400 font-mono uppercase">
                Intervention Details
              </h1>
              <Badge variant="outline" className={`${statusBadge.color}`}>
                {statusBadge.label}
              </Badge>
            </div>
            <p className="text-gray-400 mt-1">
              {intervention.subject || 'Untitled Intervention'}
            </p>
          </div>
        </div>
      </div>

      {/* Status & Timeline */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Sent
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intervention.sentAt ? (
              <>
                <div className="text-lg font-bold text-cyan-400">
                  {new Date(intervention.sentAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(intervention.sentAt).toLocaleTimeString()}
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-gray-500">Not sent</div>
            )}
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Opened
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intervention.openedAt ? (
              <>
                <div className="text-lg font-bold text-cyan-400">
                  {new Date(intervention.openedAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {timeToOpen && `${timeToOpen} hours after send`}
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-gray-500">Not opened</div>
            )}
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <MousePointerClick className="h-4 w-4" />
              Clicked
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intervention.clickedAt ? (
              <>
                <div className="text-lg font-bold text-cyan-400">
                  {new Date(intervention.clickedAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {timeToClick && `${timeToClick} min after open`}
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-gray-500">No clicks</div>
            )}
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Responded
            </CardTitle>
          </CardHeader>
          <CardContent>
            {intervention.respondedAt ? (
              <>
                <div className="text-lg font-bold text-cyan-400">
                  {new Date(intervention.respondedAt).toLocaleDateString()}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {timeToRespond && `${timeToRespond} hours after send`}
                </p>
              </>
            ) : (
              <div className="text-lg font-bold text-gray-500">No response</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Email Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Content */}
          <Card className="mission-card-glow">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono text-lg">Email Content</CardTitle>
              <CardDescription className="text-gray-400">
                The intervention sent to the tutor
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 uppercase tracking-wide">Subject</label>
                <p className="text-gray-200 font-semibold mt-1">{intervention.subject}</p>
              </div>

              <div className="border-t border-cyan-500/20 pt-4">
                <label className="text-xs text-gray-500 uppercase tracking-wide">Message</label>
                <div className="bg-gray-900 rounded-lg p-4 mt-2 border border-cyan-500/20">
                  <pre className="text-sm text-gray-200 whitespace-pre-wrap font-sans">
                    {intervention.content}
                  </pre>
                </div>
              </div>

              {intervention.errorMessage && (
                <div className="border-t border-red-500/20 pt-4">
                  <label className="text-xs text-red-400 uppercase tracking-wide">Error</label>
                  <p className="text-sm text-red-300 mt-1">{intervention.errorMessage}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Success Metrics */}
          {(intervention.engagementBefore !== null || intervention.sessionsBeforeCount !== null) && (
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="text-cyan-400 font-mono text-lg">Success Metrics</CardTitle>
                <CardDescription className="text-gray-400">
                  Tutor behavior before and after intervention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {intervention.engagementBefore !== null && intervention.engagementAfter !== null && (
                    <div>
                      <label className="text-xs text-gray-500">Engagement Score</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-gray-400">
                          {intervention.engagementBefore.toFixed(1)}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="text-lg font-bold text-cyan-400">
                          {intervention.engagementAfter.toFixed(1)}
                        </span>
                        {intervention.engagementAfter > intervention.engagementBefore ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {intervention.engagementAfter > intervention.engagementBefore ? '+' : ''}
                        {(intervention.engagementAfter - intervention.engagementBefore).toFixed(1)} change
                      </p>
                    </div>
                  )}

                  {intervention.sessionsBeforeCount !== null && intervention.sessionsAfterCount !== null && (
                    <div>
                      <label className="text-xs text-gray-500">Session Count (7d)</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-lg font-bold text-gray-400">
                          {intervention.sessionsBeforeCount}
                        </span>
                        <span className="text-gray-500">→</span>
                        <span className="text-lg font-bold text-cyan-400">
                          {intervention.sessionsAfterCount}
                        </span>
                        {intervention.sessionsAfterCount > intervention.sessionsBeforeCount ? (
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        ) : intervention.sessionsAfterCount < intervention.sessionsBeforeCount ? (
                          <TrendingDown className="h-4 w-4 text-red-400" />
                        ) : null}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {intervention.sessionsAfterCount > intervention.sessionsBeforeCount ? '+' : ''}
                        {intervention.sessionsAfterCount - intervention.sessionsBeforeCount} sessions
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Tutor Info & Metadata */}
        <div className="space-y-6">
          {/* Tutor Info */}
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Tutor Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Tutor ID</label>
                <Link href={`/dashboard/tutors/${intervention.tutor.tutorId}`}>
                  <p className="text-sm text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer">
                    {intervention.tutor.tutorId}
                  </p>
                </Link>
              </div>

              <div>
                <label className="text-xs text-gray-500">Subject</label>
                <p className="text-sm text-gray-200">{intervention.tutor.primarySubject}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Experience</label>
                <p className="text-sm text-gray-200">{intervention.tutor.monthsExperience} months</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Status</label>
                <div className="mt-1">
                  <Badge className={intervention.tutor.activeStatus 
                    ? 'bg-green-900/30 text-green-400 border-green-500/50' 
                    : 'bg-gray-800/50 text-gray-400 border-gray-600/50'
                  }>
                    {intervention.tutor.activeStatus ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {intervention.tutor.lastLogin && (
                <div>
                  <label className="text-xs text-gray-500">Last Login</label>
                  <p className="text-sm text-gray-200">
                    {new Date(intervention.tutor.lastLogin).toLocaleDateString()}
                  </p>
                </div>
              )}

              {intervention.tutor.aggregates && (
                <>
                  <div className="border-t border-cyan-500/20 pt-3">
                    <label className="text-xs text-gray-500">Engagement Score</label>
                    <p className="text-sm text-gray-200 font-mono">
                      {intervention.tutor.aggregates.avgEngagementScore.toFixed(1)}/10
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Rating (30d)</label>
                    <p className="text-sm text-gray-200 font-mono">
                      {intervention.tutor.aggregates.avgRating30d.toFixed(1)}/5
                    </p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Churn Risk</label>
                    <div className="mt-1">
                      <Badge className={
                        intervention.tutor.aggregates.churnRiskLevel === 'High' 
                          ? 'bg-red-900/30 text-red-400 border-red-500/50'
                          : intervention.tutor.aggregates.churnRiskLevel === 'Medium'
                          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50'
                          : 'bg-green-900/30 text-green-400 border-green-500/50'
                      }>
                        {intervention.tutor.aggregates.churnRiskLevel}
                      </Badge>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="text-cyan-400 font-mono text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Metadata
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-xs text-gray-500">Type</label>
                <div className="mt-1">
                  <Badge className="bg-purple-900/30 text-purple-400 border-purple-500/50">
                    {intervention.interventionType}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Channel</label>
                <p className="text-sm text-gray-200">{intervention.channel}</p>
              </div>

              {intervention.templateId && (
                <div>
                  <label className="text-xs text-gray-500">Template ID</label>
                  <p className="text-sm text-gray-200 font-mono">{intervention.templateId}</p>
                </div>
              )}

              {intervention.experimentId && (
                <>
                  <div className="border-t border-cyan-500/20 pt-3">
                    <label className="text-xs text-gray-500">Experiment ID</label>
                    <p className="text-sm text-gray-200 font-mono">{intervention.experimentId}</p>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">Variant</label>
                    <div className="mt-1">
                      <Badge className="bg-blue-900/30 text-blue-400 border-blue-500/50">
                        {intervention.experimentVariant}
                      </Badge>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t border-cyan-500/20 pt-3">
                <label className="text-xs text-gray-500">Created</label>
                <p className="text-sm text-gray-200">
                  {new Date(intervention.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Last Updated</label>
                <p className="text-sm text-gray-200">
                  {new Date(intervention.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

