'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  Clock,
  XCircle,
  CheckCircle2,
  Activity
} from 'lucide-react'
import { ReliabilityHeatmap } from '@/components/dashboard/reliability-heatmap'
import { NoShowRiskCard } from '@/components/dashboard/noshow-risk-card'

interface RescheduleMetrics {
  tutorId: string
  rescheduleRate: number
  rescheduleCount: number
  totalSessions: number
  avgRatingWhenRescheduled: number | null
  avgRatingOverall: number
  technicalIssueCorrelation: number
  churnCorrelation: number
  timeOfDayPattern: {
    morning: number
    afternoon: number
    evening: number
    night: number
  }
  dayOfWeekPattern: {
    [key: string]: number
  }
  isHighRisk: boolean
  recommendations: string[]
}

interface RescheduleCorrelation {
  metric: string
  correlation: number
  strength: 'strong' | 'moderate' | 'weak' | 'none'
  insight: string
}

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

interface HighRiskTutor {
  tutorId: string
  rescheduleRate: number
  noShowRate: number
  combinedRisk: number
  urgency: 'critical' | 'high' | 'medium'
}

interface ReliabilityAnalysis {
  highRescheduleTutors: RescheduleMetrics[]
  correlations: RescheduleCorrelation[]
  overallMetrics: {
    avgRescheduleRate: number
    tutorsAboveThreshold: number
    totalTutorsAnalyzed: number
  }
  timeOfDayInsights: {
    peakRescheduleTime: string
    lowestRescheduleTime: string
    pattern: Record<string, number>
  }
  highRiskTutors: HighRiskTutor[]
  upcomingHighRiskSessions: NoShowRiskAssessment[]
  summary: {
    avgRescheduleRate: number
    tutorsAboveThreshold: number
    totalTutorsAnalyzed: number
    criticalTutors: number
    highRiskTutors: number
    upcomingRiskySessions: number
  }
}

export default function ReliabilityDashboard() {
  const [analysis, setAnalysis] = useState<ReliabilityAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'overview' | 'tutors' | 'patterns' | 'risks'>('overview')
  const [threshold, setThreshold] = useState(0.15)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.append('threshold', threshold.toString())
        params.append('daysAhead', '7')

        const response = await fetch(`/api/analytics/reliability?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch reliability analysis')
        }

        const data = await response.json()
        setAnalysis(data)
      } catch (err) {
        console.error('Error fetching analysis:', err)
        setError('Failed to load reliability analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [threshold])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error || 'Failed to load analysis'}</p>
        </div>
      </div>
    )
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'high':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getCorrelationStrengthColor = (strength: string) => {
    switch (strength) {
      case 'strong':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'moderate':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
      case 'weak':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30'
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-cyan-400 font-mono uppercase">
          Reliability Analysis
        </h1>
        <p className="text-gray-400 mt-1">
          Monitor reschedule patterns, no-show risks, and tutor reliability metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="mission-card border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-300">Avg Reschedule Rate</p>
                <p className="text-3xl font-bold text-cyan-400 font-mono">
                  {(analysis.summary.avgRescheduleRate * 100).toFixed(1)}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-cyan-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card border-red-500/50 glow-critical">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-300">Critical Tutors</p>
                <p className="text-3xl font-bold text-red-400 font-mono">{analysis.summary.criticalTutors}</p>
                <p className="text-xs text-red-400/70 mt-1">30%+ combined risk</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card border-amber-500/50 glow-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-300">High Risk Tutors</p>
                <p className="text-3xl font-bold text-amber-400 font-mono">{analysis.summary.tutorsAboveThreshold}</p>
                <p className="text-xs text-amber-400/70 mt-1">15%+ reschedule rate</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-300">Risky Sessions</p>
                <p className="text-3xl font-bold text-yellow-400 font-mono">{analysis.summary.upcomingRiskySessions}</p>
                <p className="text-xs text-yellow-400/70 mt-1">Next 7 days</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-400/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={selectedView === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('overview')}
          className={selectedView === 'overview' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}
        >
          <Activity className="h-4 w-4 mr-2" />
          Overview
        </Button>
        <Button
          variant={selectedView === 'tutors' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('tutors')}
          className={selectedView === 'tutors' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}
        >
          <Users className="h-4 w-4 mr-2" />
          High-Risk Tutors
        </Button>
        <Button
          variant={selectedView === 'patterns' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('patterns')}
          className={selectedView === 'patterns' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}
        >
          <Clock className="h-4 w-4 mr-2" />
          Time Patterns
        </Button>
        <Button
          variant={selectedView === 'risks' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('risks')}
          className={selectedView === 'risks' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}
        >
          <Calendar className="h-4 w-4 mr-2" />
          Upcoming Risks
        </Button>
      </div>

      {/* Overview View */}
      {selectedView === 'overview' && (
        <div className="space-y-6">
          {/* Key Insights */}
          <Card className="mission-card border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400">Key Insights</CardTitle>
              <CardDescription className="text-gray-400">Time of day and correlation analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mission-card-glow p-4">
                  <p className="text-sm font-medium text-cyan-300 mb-2">Peak Reschedule Time</p>
                  <p className="text-2xl font-bold text-cyan-400 capitalize font-mono">
                    {analysis.timeOfDayInsights.peakRescheduleTime}
                  </p>
                  <p className="text-xs text-cyan-400/70 mt-1">
                    {(analysis.timeOfDayInsights.pattern[analysis.timeOfDayInsights.peakRescheduleTime] * 100).toFixed(1)}% reschedule rate
                  </p>
                </div>
                <div className="bg-[#1a1f2e] rounded-lg p-4 border border-green-500/30">
                  <p className="text-sm font-medium text-green-300 mb-2">Best Reliability Time</p>
                  <p className="text-2xl font-bold text-green-400 capitalize font-mono">
                    {analysis.timeOfDayInsights.lowestRescheduleTime}
                  </p>
                  <p className="text-xs text-green-400/70 mt-1">
                    {(analysis.timeOfDayInsights.pattern[analysis.timeOfDayInsights.lowestRescheduleTime] * 100).toFixed(1)}% reschedule rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Correlations */}
          <Card className="mission-card border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400">Metric Correlations</CardTitle>
              <CardDescription className="text-gray-400">
                How reschedules relate to other performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.correlations.slice(0, 6).map((corr, idx) => (
                  <div key={idx} className="bg-[#1a1f2e] border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={getCorrelationStrengthColor(corr.strength)}>
                          {corr.strength.toUpperCase()}
                        </Badge>
                        <h4 className="font-semibold text-gray-200">{corr.metric}</h4>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium font-mono text-cyan-400">
                          r = {corr.correlation.toFixed(3)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400">{corr.insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* High-Risk Tutors View */}
      {selectedView === 'tutors' && (
        <Card className="mission-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Tutors Requiring Attention</CardTitle>
            <CardDescription className="text-gray-400">
              Tutors with combined reschedule and no-show risk above threshold
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-compact">
                <thead className="bg-[#1a1f2e] border-b border-cyan-500/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-cyan-300">Tutor ID</th>
                    <th className="px-4 py-3 text-center font-medium text-cyan-300">Urgency</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">Combined Risk</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">Reschedule Rate</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">No-Show Rate</th>
                    <th className="px-4 py-3 text-center font-medium text-cyan-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {analysis.highRiskTutors.map((tutor) => (
                    <tr key={tutor.tutorId} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-200 font-mono">{tutor.tutorId}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={getUrgencyColor(tutor.urgency)}>
                          {tutor.urgency.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={tutor.combinedRisk > 0.3 ? 'text-red-400 font-semibold font-mono' : 'text-gray-300 font-mono'}>
                          {(tutor.combinedRisk * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono">
                        {(tutor.rescheduleRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono">
                        {(tutor.noShowRate * 100).toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button size="sm" variant="outline" className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {analysis.highRiskTutors.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">No high-risk tutors detected!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Time Patterns View */}
      {selectedView === 'patterns' && (
        <div className="space-y-6">
          <ReliabilityHeatmap
            timeOfDayPattern={analysis.timeOfDayInsights.pattern as any}
            dayOfWeekPattern={analysis.highRescheduleTutors[0]?.dayOfWeekPattern}
          />

          {/* Individual Tutor Patterns */}
          <Card className="mission-card border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-cyan-400">Individual Tutor Patterns</CardTitle>
              <CardDescription className="text-gray-400">
                Detailed time-of-day patterns for high-risk tutors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.highRescheduleTutors.slice(0, 5).map((tutor) => (
                  <div key={tutor.tutorId} className="bg-[#1a1f2e] border border-cyan-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-200 font-mono">{tutor.tutorId}</h4>
                      <Badge variant="outline" className="border-amber-500/50 text-amber-400">
                        {(tutor.rescheduleRate * 100).toFixed(0)}% reschedule rate
                      </Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(tutor.timeOfDayPattern).map(([time, rate]) => (
                        <div key={time} className="text-center bg-[#0f1419] rounded p-2 border border-cyan-500/10">
                          <p className="text-xs text-cyan-300 capitalize">{time}</p>
                          <p className="text-sm font-bold text-gray-200 font-mono">
                            {(rate * 100).toFixed(0)}%
                          </p>
                        </div>
                      ))}
                    </div>
                    
                    {tutor.recommendations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-cyan-500/20">
                        <p className="text-xs font-medium text-cyan-300 mb-1">Recommendations:</p>
                        <ul className="space-y-1">
                          {tutor.recommendations.map((rec, idx) => (
                            <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                              <span className="text-cyan-400 mt-0.5">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upcoming Risks View */}
      {selectedView === 'risks' && (
        <NoShowRiskCard 
          sessions={analysis.upcomingHighRiskSessions}
          onTakeAction={(session) => {
            console.log('Take action on session:', session)
            // TODO: Implement intervention action
          }}
        />
      )}
    </div>
  )
}

