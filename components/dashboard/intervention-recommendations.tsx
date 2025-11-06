'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  MessageSquare, 
  BookOpen, 
  Video, 
  TrendingUp,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react'

interface Recommendation {
  id: string
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'engagement' | 'quality' | 'technical' | 'retention' | 'first-impression'
  title: string
  description: string
  action: string
  icon: React.ReactNode
}

interface InterventionRecommendationsProps {
  tutor: {
    tutorId: string
    monthsExperience: number
    totalSessions: number
    noShowCount: number
    rescheduleRate: number
  }
  aggregates: {
    churnProbability: number
    churnRiskLevel: string
    churnSignalsDetected: number
    avgEngagementScore: number
    avgEmpathyScore: number
    avgClarityScore: number
    avgStudentSatisfaction: number
    avgRating30d: number
    avgRating7d: number | null
    technicalIssueRate: number
    poorFirstSessionFlag: boolean
    firstSessionAvgRating: number | null
    recommendationRate: number
    sentimentTrend7d: number | null
  }
}

export function InterventionRecommendations({ tutor, aggregates }: InterventionRecommendationsProps) {
  const recommendations: Recommendation[] = []

  // Critical: High churn risk
  if (aggregates.churnRiskLevel === 'High') {
    recommendations.push({
      id: 'churn-critical',
      priority: 'critical',
      category: 'retention',
      title: 'Critical Churn Risk Detected',
      description: `This tutor has a ${(aggregates.churnProbability * 100).toFixed(0)}% probability of churning with ${aggregates.churnSignalsDetected} warning signals.`,
      action: 'Schedule immediate 1-on-1 check-in to understand concerns and provide support.',
      icon: <AlertTriangle className="h-5 w-5" />,
    })
  }

  // High: Poor first session performance
  if (aggregates.poorFirstSessionFlag) {
    recommendations.push({
      id: 'first-session',
      priority: 'high',
      category: 'first-impression',
      title: 'Poor First Session Performance',
      description: aggregates.firstSessionAvgRating
        ? `Average first session rating of ${aggregates.firstSessionAvgRating.toFixed(1)} is below threshold.`
        : 'First sessions are flagged as underperforming.',
      action: 'Provide training on creating strong first impressions and establishing rapport quickly.',
      icon: <Users className="h-5 w-5" />,
    })
  }

  // High: Low engagement
  if (aggregates.avgEngagementScore < 6.0) {
    recommendations.push({
      id: 'low-engagement',
      priority: 'high',
      category: 'engagement',
      title: 'Low Student Engagement',
      description: `Engagement score of ${aggregates.avgEngagementScore.toFixed(1)}/10 is below target.`,
      action: 'Share interactive teaching strategies and tools to boost student participation.',
      icon: <TrendingUp className="h-5 w-5" />,
    })
  }

  // Medium: Technical issues
  if (aggregates.technicalIssueRate > 0.15) {
    recommendations.push({
      id: 'technical-issues',
      priority: 'medium',
      category: 'technical',
      title: 'Frequent Technical Issues',
      description: `${(aggregates.technicalIssueRate * 100).toFixed(0)}% of sessions have technical problems.`,
      action: 'Provide technical troubleshooting guide and equipment recommendations.',
      icon: <Video className="h-5 w-5" />,
    })
  }

  // Medium: Low empathy score
  if (aggregates.avgEmpathyScore < 6.5) {
    recommendations.push({
      id: 'low-empathy',
      priority: 'medium',
      category: 'quality',
      title: 'Empathy Score Needs Improvement',
      description: `Empathy score of ${aggregates.avgEmpathyScore.toFixed(1)}/10 could be higher.`,
      action: 'Recommend empathy and active listening training modules.',
      icon: <MessageSquare className="h-5 w-5" />,
    })
  }

  // Medium: Low clarity score
  if (aggregates.avgClarityScore < 6.5) {
    recommendations.push({
      id: 'low-clarity',
      priority: 'medium',
      category: 'quality',
      title: 'Communication Clarity Needs Work',
      description: `Clarity score of ${aggregates.avgClarityScore.toFixed(1)}/10 suggests explanations could be clearer.`,
      action: 'Share best practices for breaking down complex concepts into simpler steps.',
      icon: <BookOpen className="h-5 w-5" />,
    })
  }

  // Medium: Declining ratings
  if (aggregates.avgRating7d && aggregates.avgRating7d < aggregates.avgRating30d - 0.3) {
    recommendations.push({
      id: 'declining-ratings',
      priority: 'medium',
      category: 'quality',
      title: 'Recent Rating Decline',
      description: `7-day rating (${aggregates.avgRating7d.toFixed(1)}) is significantly lower than 30-day average (${aggregates.avgRating30d.toFixed(1)}).`,
      action: 'Check in to see if the tutor is facing any challenges or burnout.',
      icon: <TrendingUp className="h-5 w-5" />,
    })
  }

  // Low: Negative sentiment trend
  if (aggregates.sentimentTrend7d && aggregates.sentimentTrend7d < -0.1) {
    recommendations.push({
      id: 'negative-sentiment',
      priority: 'low',
      category: 'quality',
      title: 'Declining Sentiment Detected',
      description: 'Session sentiment has been trending downward over the past week.',
      action: 'Monitor closely and consider checking in if trend continues.',
      icon: <MessageSquare className="h-5 w-5" />,
    })
  }

  // Low: High no-show count
  if (tutor.noShowCount > 5) {
    recommendations.push({
      id: 'high-noshow',
      priority: 'low',
      category: 'retention',
      title: 'Multiple No-Shows',
      description: `${tutor.noShowCount} no-shows may indicate scheduling or commitment issues.`,
      action: 'Discuss scheduling preferences and any barriers to consistent attendance.',
      icon: <Clock className="h-5 w-5" />,
    })
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'default'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  if (recommendations.length === 0) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-green-900">No Interventions Needed</CardTitle>
          </div>
          <CardDescription className="text-green-700">
            This tutor is performing well across all metrics. Continue monitoring and providing regular feedback.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Interventions</CardTitle>
        <CardDescription>
          {recommendations.length} action{recommendations.length !== 1 ? 's' : ''} recommended based on performance data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="border rounded-lg p-4 space-y-3 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{rec.icon}</div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{rec.title}</h4>
                    <Badge variant={getPriorityColor(rec.priority) as any}>
                      {rec.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{rec.description}</p>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="text-sm font-medium text-blue-900">
                      <span className="text-blue-600">Recommended Action:</span> {rec.action}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

