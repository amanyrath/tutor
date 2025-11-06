'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface TutorMetricsGridProps {
  tutor: {
    aggregates: {
      totalSessions30d: number
      totalSessions7d: number
      avgRating30d: number
      avgRating7d: number | null
      avgEngagementScore: number
      avgEmpathyScore: number
      avgClarityScore: number
      avgStudentSatisfaction: number
      recommendationRate: number
      technicalIssueRate: number
      firstSessionCount: number
      firstSessionAvgRating: number | null
      poorFirstSessionFlag: boolean
      sentimentTrend7d: number | null
    } | null
  }
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
}: {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {trend && (
            <div>
              {trend === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
              {trend === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
              {trend === 'neutral' && <Minus className="h-5 w-5 text-gray-400" />}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function TutorMetricsGrid({ tutor }: TutorMetricsGridProps) {
  if (!tutor.aggregates) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-gray-500">No aggregate data available</p>
        </CardContent>
      </Card>
    )
  }

  const agg = tutor.aggregates

  // Determine rating trend
  const getRatingTrend = () => {
    if (!agg.avgRating7d) return 'neutral'
    const diff = agg.avgRating7d - agg.avgRating30d
    if (diff > 0.1) return 'up'
    if (diff < -0.1) return 'down'
    return 'neutral'
  }

  const getSentimentTrend = () => {
    if (!agg.sentimentTrend7d) return 'neutral'
    if (agg.sentimentTrend7d > 0.05) return 'up'
    if (agg.sentimentTrend7d < -0.05) return 'down'
    return 'neutral'
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Performance Metrics</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Sessions (30d)"
          value={agg.totalSessions30d}
          subtitle={`${agg.totalSessions7d} in last 7 days`}
        />
        <MetricCard
          title="Avg Rating (30d)"
          value={agg.avgRating30d.toFixed(2)}
          subtitle={agg.avgRating7d ? `${agg.avgRating7d.toFixed(2)} in last 7d` : undefined}
          trend={getRatingTrend()}
        />
        <MetricCard
          title="Engagement Score"
          value={agg.avgEngagementScore.toFixed(1)}
          subtitle="Out of 10"
        />
        <MetricCard
          title="Empathy Score"
          value={agg.avgEmpathyScore.toFixed(1)}
          subtitle="Out of 10"
        />
        <MetricCard
          title="Clarity Score"
          value={agg.avgClarityScore.toFixed(1)}
          subtitle="Out of 10"
        />
        <MetricCard
          title="Student Satisfaction"
          value={agg.avgStudentSatisfaction.toFixed(1)}
          subtitle="Out of 10"
        />
        <MetricCard
          title="Recommendation Rate"
          value={`${(agg.recommendationRate * 100).toFixed(0)}%`}
          subtitle="Would recommend"
        />
        <MetricCard
          title="Technical Issues"
          value={`${(agg.technicalIssueRate * 100).toFixed(1)}%`}
          subtitle="Of sessions"
        />
        <MetricCard
          title="First Sessions"
          value={agg.firstSessionCount}
          subtitle={
            agg.firstSessionAvgRating
              ? `Avg ${agg.firstSessionAvgRating.toFixed(1)} rating`
              : 'No ratings yet'
          }
          trend={agg.poorFirstSessionFlag ? 'down' : 'neutral'}
        />
      </div>

      {agg.sentimentTrend7d !== null && (
        <div className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Sentiment Trend (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {agg.sentimentTrend7d > 0 ? '+' : ''}
                    {agg.sentimentTrend7d.toFixed(3)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {agg.sentimentTrend7d > 0
                      ? 'Improving sentiment'
                      : agg.sentimentTrend7d < 0
                      ? 'Declining sentiment'
                      : 'Stable sentiment'}
                  </p>
                </div>
                <div>{getSentimentTrend() === 'up' && <TrendingUp className="h-5 w-5 text-green-500" />}
                  {getSentimentTrend() === 'down' && <TrendingDown className="h-5 w-5 text-red-500" />}
                  {getSentimentTrend() === 'neutral' && <Minus className="h-5 w-5 text-gray-400" />}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

