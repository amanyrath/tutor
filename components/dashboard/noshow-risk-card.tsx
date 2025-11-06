/**
 * No-Show Risk Card Component
 * 
 * Displays upcoming sessions at high risk of no-shows
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Calendar, Clock, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoShowRiskAssessment {
  sessionId?: string
  tutorId: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: Array<{
    factor: string
    weight: number
    explanation: string
  }>
  mitigation: string
  historicalContext: {
    tutorNoShowRate: number
    tutorRescheduleRate: number
    recentReliability: number
  }
}

interface NoShowRiskCardProps {
  sessions: NoShowRiskAssessment[]
  onTakeAction?: (session: NoShowRiskAssessment) => void
}

export function NoShowRiskCard({ sessions, onTakeAction }: NoShowRiskCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <AlertTriangle className="h-5 w-5 text-red-400" />
      case 'medium':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      default:
        return <AlertTriangle className="h-5 w-5 text-green-400" />
    }
  }

  // Sort by risk level (high first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const riskOrder = { high: 0, medium: 1, low: 2 }
    return riskOrder[a.riskLevel] - riskOrder[b.riskLevel]
  })

  return (
    <Card className="mission-card border-cyan-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-cyan-400">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          High-Risk Sessions
        </CardTitle>
        <CardDescription className="text-gray-400">
          Upcoming sessions with elevated no-show or reschedule risk
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="rounded-full bg-green-500/20 w-16 h-16 flex items-center justify-center mx-auto mb-3 border border-green-500/30">
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
            <p className="text-gray-300 font-medium">No high-risk sessions detected</p>
            <p className="text-sm text-gray-500 mt-1">All upcoming sessions look good!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSessions.slice(0, 10).map((session, idx) => (
              <div
                key={session.sessionId || idx}
                className="bg-[#1a1f2e] border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getRiskIcon(session.riskLevel)}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRiskColor(session.riskLevel)}>
                          {session.riskLevel.toUpperCase()} RISK
                        </Badge>
                        <span className="text-sm text-gray-400 font-mono">
                          {(session.riskScore * 100).toFixed(0)}% risk score
                        </span>
                      </div>
                      {session.sessionId && (
                        <p className="text-xs text-gray-500 mt-1 font-mono">Session ID: {session.sessionId}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-200 flex items-center gap-1 font-mono">
                      <User className="h-3 w-3" />
                      {session.tutorId}
                    </p>
                  </div>
                </div>

                {/* Risk Factors */}
                {session.riskFactors.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-cyan-300 mb-2">Risk Factors:</p>
                    <div className="space-y-1">
                      {session.riskFactors.slice(0, 3).map((factor, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs">
                          <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0"></div>
                          <div>
                            <span className="font-medium text-gray-300">{factor.factor}:</span>{' '}
                            <span className="text-gray-400">{factor.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Historical Context */}
                <div className="mb-3 bg-[#0f1419] rounded p-2 border border-cyan-500/10">
                  <p className="text-xs font-medium text-cyan-300 mb-1">Historical Context:</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">No-Show Rate</p>
                      <p className="font-semibold text-gray-200 font-mono">
                        {(session.historicalContext.tutorNoShowRate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reschedule Rate</p>
                      <p className="font-semibold text-gray-200 font-mono">
                        {(session.historicalContext.tutorRescheduleRate * 100).toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reliability</p>
                      <p className="font-semibold text-gray-200 font-mono">
                        {(session.historicalContext.recentReliability * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mitigation */}
                <div className="mb-3">
                  <p className="text-xs font-medium text-cyan-300 mb-1">Recommended Action:</p>
                  <p className="text-sm text-gray-300 bg-cyan-500/10 rounded p-2 border border-cyan-500/20">
                    {session.mitigation}
                  </p>
                </div>

                {/* Action Button */}
                {onTakeAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTakeAction(session)}
                    className="w-full border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                  >
                    Take Action
                  </Button>
                )}
              </div>
            ))}

            {sortedSessions.length > 10 && (
              <div className="text-center pt-2">
                <p className="text-sm text-gray-500">
                  Showing 10 of {sortedSessions.length} high-risk sessions
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

