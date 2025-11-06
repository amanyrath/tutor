'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertTriangle,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FirstSessionMetrics {
  tutorId: string
  firstSessionCount: number
  firstSessionAvgRating: number | null
  poorFirstSession: boolean
  monthsExperience: number
  certificationLevel: string
  primarySubject: string
  avgEngagement: number
  avgEmpathy: number
  avgClarity: number
  avgSatisfaction: number
  technicalIssueRate: number
  avgCameraOnPct: number
  avgSpeakRatio: number
  avgScreenSharePct: number
  overallAvgRating: number
  reliabilityScore: number
  rescheduleRate: number
}

interface CohortComparison {
  metric: string
  poorFirstSessionAvg: number
  overallPopulationAvg: number
  difference: number
  percentDifference: number
  pValue: number
  significance: 'high' | 'medium' | 'low' | 'not_significant'
  insight: string
}

interface FirstSessionAnalysis {
  poorFirstSessionCohort: {
    tutors: FirstSessionMetrics[]
    count: number
    avgMetrics: Record<string, number>
  }
  overallPopulation: {
    tutors: FirstSessionMetrics[]
    count: number
    avgMetrics: Record<string, number>
  }
  comparisons: CohortComparison[]
  recommendations: string[]
}

export default function FirstSessionsDashboard() {
  const [analysis, setAnalysis] = useState<FirstSessionAnalysis | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [selectedView, setSelectedView] = useState<'comparisons' | 'tutors'>('comparisons')

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (subjectFilter !== 'all') {
          params.append('subject', subjectFilter)
        }

        const response = await fetch(`/api/analytics/first-sessions?${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch first session analysis')
        }

        const data = await response.json()
        setAnalysis(data)
      } catch (err) {
        console.error('Error fetching analysis:', err)
        setError('Failed to load first session analysis')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()
  }, [subjectFilter])

  if (loading) {
    return (
      <div className="p-8 space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2 bg-gray-800/50" />
          <Skeleton className="h-4 w-96 bg-gray-800/50" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 bg-gray-800/50" />
          ))}
        </div>
        <Skeleton className="h-96 bg-gray-800/50" />
      </div>
    )
  }

  if (error || !analysis) {
    return (
      <div className="p-8">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4">
          <p className="text-red-400">{error || 'Failed to load analysis'}</p>
        </div>
      </div>
    )
  }

  const uniqueSubjects = Array.from(
    new Set(analysis.overallPopulation.tutors.map(t => t.primarySubject))
  ).sort()

  const getSignificanceColor = (sig: string) => {
    switch (sig) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getSignificanceBadge = (pValue: number) => {
    if (pValue < 0.01) return 'p < 0.01 ***'
    if (pValue < 0.05) return 'p < 0.05 **'
    if (pValue < 0.1) return 'p < 0.1 *'
    return 'not significant'
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-cyan-400 font-mono uppercase">First Session Analysis</h1>
        <p className="text-gray-400 mt-1">
          Compare tutors with poor first sessions to the overall population
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="mission-card border-cyan-500/30 hover:border-cyan-500/50 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-300">Total Tutors</p>
                <p className="text-3xl font-bold text-cyan-400 font-mono">{analysis.overallPopulation.count}</p>
              </div>
              <Users className="h-8 w-8 text-cyan-400/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card border-amber-500/50 glow-warning">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-300">Poor First Sessions</p>
                <p className="text-3xl font-bold text-amber-400 font-mono">{analysis.poorFirstSessionCohort.count}</p>
                <p className="text-xs text-amber-400/70 mt-1">
                  {((analysis.poorFirstSessionCohort.count / analysis.overallPopulation.count) * 100).toFixed(1)}% of total
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card border-green-500/50 glow-success">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">Good First Sessions</p>
                <p className="text-3xl font-bold text-green-400 font-mono">
                  {analysis.overallPopulation.count - analysis.poorFirstSessionCohort.count}
                </p>
                <p className="text-xs text-green-400/70 mt-1">
                  {(((analysis.overallPopulation.count - analysis.poorFirstSessionCohort.count) / analysis.overallPopulation.count) * 100).toFixed(1)}% success rate
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div>
          <label className="text-sm font-medium text-cyan-300 mb-2 block">Filter by Subject</label>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-48 bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
              <SelectValue placeholder="All subjects" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1419] border-cyan-500/30">
              <SelectItem value="all">All Subjects</SelectItem>
              {uniqueSubjects.map(subject => (
                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={selectedView === 'comparisons' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('comparisons')}
          className={selectedView === 'comparisons' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Metric Comparisons
        </Button>
        <Button
          variant={selectedView === 'tutors' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedView('tutors')}
          className={selectedView === 'tutors' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/30' : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-500/10'}
        >
          <Users className="h-4 w-4 mr-2" />
          Tutor List
        </Button>
      </div>

      {/* Metric Comparisons View */}
      {selectedView === 'comparisons' && (
        <Card className="mission-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Cohort Metric Comparisons</CardTitle>
            <CardDescription className="text-gray-400">
              Statistical comparison of tutors with poor first sessions vs overall population
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.comparisons.map((comp, idx) => (
                <div key={idx} className="bg-[#1a1f2e] border border-cyan-500/20 rounded-lg p-4 hover:border-cyan-500/40 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge className={getSignificanceColor(comp.significance)}>
                        {comp.significance.toUpperCase()}
                      </Badge>
                      <h4 className="font-semibold text-gray-200">{comp.metric}</h4>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-400">
                        {getSignificanceBadge(comp.pValue)}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">{comp.insight}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-amber-500/10 rounded p-3 border border-amber-500/30">
                      <p className="text-xs text-amber-300 font-medium mb-1">Poor First Session Cohort</p>
                      <p className="text-2xl font-bold text-amber-400 font-mono">
                        {comp.poorFirstSessionAvg.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-cyan-500/10 rounded p-3 border border-cyan-500/30">
                      <p className="text-xs text-cyan-300 font-medium mb-1">Overall Population</p>
                      <p className="text-2xl font-bold text-cyan-400 font-mono">
                        {comp.overallPopulationAvg.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-gray-400">
                      Difference: {comp.difference > 0 ? '+' : ''}{comp.difference.toFixed(2)}
                    </span>
                    <span className="font-medium text-gray-200 font-mono">
                      {comp.percentDifference > 0 ? '+' : ''}{comp.percentDifference.toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tutors List View */}
      {selectedView === 'tutors' && (
        <Card className="mission-card border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-cyan-400">Tutors with Poor First Sessions</CardTitle>
            <CardDescription className="text-gray-400">
              Detailed list of tutors who struggled with their first sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-compact">
                <thead className="bg-[#1a1f2e] border-b border-cyan-500/30">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-cyan-300">Tutor ID</th>
                    <th className="px-4 py-3 text-left font-medium text-cyan-300">Subject</th>
                    <th className="px-4 py-3 text-center font-medium text-cyan-300">First Sessions</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">Avg Rating</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">Engagement</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">Empathy</th>
                    <th className="px-4 py-3 text-right font-medium text-cyan-300">Tech Issues</th>
                    <th className="px-4 py-3 text-center font-medium text-cyan-300">Experience</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10">
                  {analysis.poorFirstSessionCohort.tutors.map((tutor) => (
                    <tr key={tutor.tutorId} className="hover:bg-cyan-500/5 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-200 font-mono">{tutor.tutorId}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-cyan-500/30">{tutor.primarySubject}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300 font-mono">
                        {tutor.firstSessionCount}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={tutor.firstSessionAvgRating && tutor.firstSessionAvgRating < 3 ? 'text-red-400 font-semibold font-mono' : 'text-gray-300 font-mono'}>
                          {tutor.firstSessionAvgRating?.toFixed(2) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono">
                        {tutor.avgEngagement.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-300 font-mono">
                        {tutor.avgEmpathy.toFixed(1)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={tutor.technicalIssueRate > 0.15 ? 'text-red-400 font-semibold font-mono' : 'text-gray-300 font-mono'}>
                          {(tutor.technicalIssueRate * 100).toFixed(0)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-gray-300 font-mono">
                        {tutor.monthsExperience}m
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {analysis.poorFirstSessionCohort.count === 0 && (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-400">No tutors with poor first sessions!</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      <Card className="mission-card border-cyan-500/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Info className="h-5 w-5" />
            Actionable Recommendations
          </CardTitle>
          <CardDescription className="text-gray-400">
            Based on statistical analysis of first session performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <CheckCircle2 className="h-5 w-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-200">{rec}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Summary */}
      <Card className="mission-card border-cyan-500/30">
        <CardHeader>
          <CardTitle className="text-cyan-400">Key Metrics Side-by-Side</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-cyan-300 mb-1">Avg First Session Rating</p>
              <div className="flex justify-center gap-4">
                <div>
                  <p className="text-lg font-bold text-amber-400 font-mono">
                    {analysis.poorFirstSessionCohort.avgMetrics.avgFirstSessionRating?.toFixed(2) || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Poor</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-cyan-400 font-mono">
                    {analysis.overallPopulation.avgMetrics.avgFirstSessionRating?.toFixed(2) || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">All</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-cyan-300 mb-1">Avg Engagement</p>
              <div className="flex justify-center gap-4">
                <div>
                  <p className="text-lg font-bold text-amber-400 font-mono">
                    {analysis.poorFirstSessionCohort.avgMetrics.avgEngagement?.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">Poor</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-cyan-400 font-mono">
                    {analysis.overallPopulation.avgMetrics.avgEngagement?.toFixed(1)}
                  </p>
                  <p className="text-xs text-gray-500">All</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-cyan-300 mb-1">Technical Issues</p>
              <div className="flex justify-center gap-4">
                <div>
                  <p className="text-lg font-bold text-amber-400 font-mono">
                    {(analysis.poorFirstSessionCohort.avgMetrics.avgTechnicalIssueRate * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">Poor</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-cyan-400 font-mono">
                    {(analysis.overallPopulation.avgMetrics.avgTechnicalIssueRate * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-500">All</p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-cyan-300 mb-1">Avg Experience</p>
              <div className="flex justify-center gap-4">
                <div>
                  <p className="text-lg font-bold text-amber-400 font-mono">
                    {analysis.poorFirstSessionCohort.avgMetrics.avgExperience?.toFixed(0)}m
                  </p>
                  <p className="text-xs text-gray-500">Poor</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-cyan-400 font-mono">
                    {analysis.overallPopulation.avgMetrics.avgExperience?.toFixed(0)}m
                  </p>
                  <p className="text-xs text-gray-500">All</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

