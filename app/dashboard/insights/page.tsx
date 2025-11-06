'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InsightCard } from '@/components/dashboard/insight-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Sparkles,
  RefreshCw,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PatternInsight {
  id: string
  patternType: string
  title: string
  description: string
  affectedTutorIds: string[]
  affectedTutorCount: number
  correlations: Record<string, number> | null
  statisticalSignificance: number | null
  confidenceScore: number
  aiGeneratedRecommendation: string
  aiModel: string | null
  analyzedPeriodStart: Date
  analyzedPeriodEnd: Date
  status: string
  actionTaken: string | null
  actionTakenAt: Date | null
  discoveredAt: Date
}

interface InsightsStats {
  total: number
  byType: Record<string, number>
  avgConfidence: number
  totalAffectedTutors: number
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<PatternInsight[]>([])
  const [stats, setStats] = useState<InsightsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Filters
  const [patternTypeFilter, setPatternTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('active')
  const [minConfidence, setMinConfidence] = useState<number>(0)
  const [searchQuery, setSearchQuery] = useState<string>('')

  const fetchInsights = async () => {
    try {
      const params = new URLSearchParams({
        status: statusFilter,
        minConfidence: minConfidence.toString(),
      })

      if (patternTypeFilter !== 'all') {
        params.append('patternType', patternTypeFilter)
      }

      const response = await fetch(`/api/insights?${params.toString()}`)
      const data = await response.json()

      setInsights(data.insights || [])
      setStats(data.stats || null)
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [patternTypeFilter, statusFilter, minConfidence])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchInsights()
  }

  const handleArchive = async (id: string) => {
    try {
      const response = await fetch(`/api/insights?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setInsights((prev) =>
          prev.map((insight) =>
            insight.id === id ? { ...insight, status: 'archived' } : insight
          )
        )
      }
    } catch (error) {
      console.error('Error archiving insight:', error)
    }
  }

  const handleMarkImplemented = async (id: string) => {
    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: 'implemented',
          actionTakenAt: new Date().toISOString(),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setInsights((prev) =>
          prev.map((insight) =>
            insight.id === id ? data.insight : insight
          )
        )
      }
    } catch (error) {
      console.error('Error marking insight as implemented:', error)
    }
  }

  // Client-side search filter
  const filteredInsights = insights.filter((insight) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        insight.title.toLowerCase().includes(query) ||
        insight.description.toLowerCase().includes(query) ||
        insight.aiGeneratedRecommendation.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Get unique pattern types for filter
  const patternTypes = Array.from(new Set(insights.map((i) => i.patternType)))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 bg-gray-800/50" />
        <Skeleton className="h-96 bg-gray-800/50" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cyan-500/20 pb-4">
        <h1 className="text-3xl font-bold tracking-tight text-cyan-400 font-mono uppercase">
          AI Pattern Insights
        </h1>
        <p className="text-gray-400 mt-1">
          Discover patterns and trends identified by AI analysis
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="mission-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Insights
              </CardTitle>
              <Lightbulb className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400 font-mono">
                {stats.total}
              </div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Avg Confidence
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400 font-mono">
                {(stats.avgConfidence * 100).toFixed(0)}%
              </div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Affected Tutors
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {stats.totalAffectedTutors}
              </div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">
                Pattern Types
              </CardTitle>
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400 font-mono">
                {Object.keys(stats.byType).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pattern Type Distribution */}
      {stats && Object.keys(stats.byType).length > 0 && (
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono">Pattern Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Breakdown by pattern type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.byType).map(([type, count]) => (
                <Badge
                  key={type}
                  variant="outline"
                  className={cn(
                    'text-sm',
                    type.includes('increase') || type.includes('improvement')
                      ? 'bg-green-900/30 text-green-400 border-green-500/50'
                      : type.includes('decrease') || type.includes('churn')
                      ? 'bg-red-900/30 text-red-400 border-red-500/50'
                      : 'bg-blue-900/30 text-blue-400 border-blue-500/50'
                  )}
                >
                  {type.replace(/_/g, ' ')}: {count}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mission-card-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-cyan-400 font-mono uppercase tracking-wide flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription className="text-gray-400">
                Refine insights by type, status, and confidence
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
            >
              <RefreshCw className={cn('h-4 w-4 mr-1', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-2 block">Pattern Type</label>
              <Select value={patternTypeFilter} onValueChange={setPatternTypeFilter}>
                <SelectTrigger className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                  <SelectItem value="all">All Types</SelectItem>
                  {patternTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1419] border-cyan-500/30">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="implemented">Implemented</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">
                Min Confidence ({(minConfidence * 100).toFixed(0)}%)
              </label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="bg-[#1a1f2e] border-cyan-500/30"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Search</label>
              <Input
                type="text"
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1f2e] border-cyan-500/30 text-gray-200"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights List */}
      {filteredInsights.length === 0 ? (
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="text-cyan-400 font-mono">No Insights Found</CardTitle>
            <CardDescription className="text-gray-400">
              {insights.length === 0
                ? 'No pattern insights have been discovered yet. Run the pattern discovery script to generate insights.'
                : 'No insights match your current filters. Try adjusting your search criteria.'}
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-200">
              {filteredInsights.length} Insight{filteredInsights.length !== 1 ? 's' : ''}
            </h2>
          </div>

          <div className="space-y-4">
            {filteredInsights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onArchive={handleArchive}
                onMarkImplemented={handleMarkImplemented}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

