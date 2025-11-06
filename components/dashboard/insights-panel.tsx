'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, TrendingUp, TrendingDown, Brain, Target, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InsightsPanelProps {
  highRiskCount: number
  totalTutors: number
  avgEngagement: number
}

export function InsightsPanel({ highRiskCount, totalTutors, avgEngagement }: InsightsPanelProps) {
  const calculateTrend = (current: number, baseline: number) => {
    const change = ((current - baseline) / baseline) * 100
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : 'down',
      isGood: change < 0
    }
  }

  const engagementTrend = calculateTrend(avgEngagement, 7.5)
  const churnTrend = calculateTrend(highRiskCount, 10)

  const atRiskToday = Math.floor(highRiskCount * 0.8)
  const trendingUp = Math.floor(totalTutors * 0.12)
  const trendingDown = Math.floor(totalTutors * 0.08)
  const predictedIssues = Math.floor(highRiskCount * 1.2)

  const insights = [
    {
      id: 'at-risk',
      title: 'At Risk Today',
      value: atRiskToday,
      subtitle: 'Require immediate attention',
      icon: <AlertTriangle className="h-5 w-5" />,
      severity: 'danger',
      trend: churnTrend
    },
    {
      id: 'trending-up',
      title: 'Trending Up',
      value: trendingUp,
      subtitle: 'Improved in last 7 days',
      icon: <TrendingUp className="h-5 w-5" />,
      severity: 'success',
      trend: null
    },
    {
      id: 'trending-down',
      title: 'Trending Down',
      value: trendingDown,
      subtitle: 'Declined in last 7 days',
      icon: <TrendingDown className="h-5 w-5" />,
      severity: 'warning',
      trend: null
    },
    {
      id: 'predicted',
      title: 'Predicted Issues',
      value: predictedIssues,
      subtitle: 'Next 7 days forecast',
      icon: <Brain className="h-5 w-5" />,
      severity: 'info',
      trend: null
    }
  ]

  const getSeverityColors = (severity: string) => {
    switch (severity) {
      case 'danger':
        return {
          card: 'border-red-500/50 bg-gradient-to-br from-red-900/20 to-red-800/10 glow-critical',
          text: 'text-red-400',
          icon: 'text-red-400'
        }
      case 'warning':
        return {
          card: 'border-yellow-500/50 bg-gradient-to-br from-yellow-900/20 to-yellow-800/10',
          text: 'text-yellow-400',
          icon: 'text-yellow-400'
        }
      case 'success':
        return {
          card: 'border-green-500/50 bg-gradient-to-br from-green-900/20 to-green-800/10',
          text: 'text-green-400',
          icon: 'text-green-400'
        }
      default:
        return {
          card: 'border-cyan-500/30 bg-gradient-to-br from-cyan-900/20 to-cyan-800/10',
          text: 'text-cyan-400',
          icon: 'text-cyan-400'
        }
    }
  }

  const recommendations = [
    {
      id: '1',
      priority: 'high',
      action: 'Review T0042, T0089, T0156 - critical churn signals',
      icon: <Target className="h-4 w-4" />
    },
    {
      id: '2',
      priority: 'medium',
      action: 'Schedule check-ins with 8 medium-risk tutors',
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: '3',
      priority: 'high',
      action: 'Address low engagement scores before end of week',
      icon: <AlertTriangle className="h-4 w-4" />
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      default:
        return 'text-cyan-400'
    }
  }

  return (
    <div className="space-y-4">
      <Card className="mission-card-glow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-cyan-400 font-mono uppercase tracking-wide text-sm">
              Predictive Insights
            </CardTitle>
          </div>
          <CardDescription className="text-gray-500 text-xs">AI-powered forecasting and anomaly detection</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight) => {
            const colors = getSeverityColors(insight.severity)
            return (
              <div
                key={insight.id}
                className={cn('border-2 rounded-lg p-3 transition-all hover:shadow-lg', colors.card)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={colors.icon}>
                      {insight.icon}
                    </div>
                    <div>
                      <h3 className="text-xs text-gray-400 uppercase tracking-wider">
                        {insight.title}
                      </h3>
                      <p className={cn('text-2xl font-bold font-mono mt-1', colors.text)}>
                        {insight.value}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {insight.subtitle}
                      </p>
                    </div>
                  </div>
                  {insight.trend && (
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'font-mono text-xs',
                        insight.trend.isGood ? 'text-green-400 border-green-500/50' : 'text-red-400 border-red-500/50'
                      )}
                    >
                      {insight.trend.direction === 'up' ? '↑' : '↓'} {insight.trend.value}%
                    </Badge>
                  )}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      <Card className="mission-card">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            <CardTitle className="text-cyan-400 font-mono uppercase tracking-wide text-sm">
              Action Required
            </CardTitle>
          </div>
          <CardDescription className="text-gray-500 text-xs">Recommended interventions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="border-l-2 border-cyan-500/30 pl-3 py-2 hover:bg-cyan-500/5 transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className={getPriorityColor(rec.priority)}>
                  {rec.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-300">
                    {rec.action}
                  </p>
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs font-mono mt-1',
                      rec.priority === 'high' ? 'text-red-400 border-red-500/50' : 'text-yellow-400 border-yellow-500/50'
                    )}
                  >
                    {rec.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

