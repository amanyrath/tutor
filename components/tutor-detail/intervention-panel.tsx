import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  AlertTriangle, 
  TrendingDown, 
  Calendar, 
  Video, 
  Heart,
  Trophy,
  CheckCircle
} from 'lucide-react'

interface Tutor {
  tutorId: string
  rescheduleRate: number
  reliabilityScore: number
}

interface TutorAggregate {
  avgEngagementScore: number
  avgEmpathyScore: number
  poorFirstSessionFlag: boolean
  firstSessionAvgRating: number | null
  recommendationRate: number
  technicalIssueRate: number
  churnProbability: number
  churnSignalsDetected: number
}

interface InterventionPanelProps {
  tutor: Tutor
  aggregates: TutorAggregate
}

interface Intervention {
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'POSITIVE'
  title: string
  message: string
  action: string
  icon: React.ReactNode
}

export function InterventionPanel({ tutor, aggregates }: InterventionPanelProps) {
  const interventions: Intervention[] = []

  // 1. First Session Training (HIGH PRIORITY)
  if (aggregates.poorFirstSessionFlag) {
    interventions.push({
      priority: 'HIGH',
      title: 'First Session Training Required',
      message: `Average first session rating: ${aggregates.firstSessionAvgRating?.toFixed(1) || 'N/A'}. This is below the 3.5 threshold and indicates 24% churn risk.`,
      action: 'Assign "First Session Excellence" training module',
      icon: <AlertTriangle className="h-5 w-5" />,
    })
  }

  // 2. Scheduling Reliability (MEDIUM PRIORITY)
  if (tutor.rescheduleRate > 0.15) {
    interventions.push({
      priority: 'MEDIUM',
      title: 'Scheduling Reliability Issue',
      message: `${Math.round(tutor.rescheduleRate * 100)}% reschedule rate (target: <10%). This impacts student experience and platform reliability.`,
      action: 'Review scheduling practices with manager',
      icon: <Calendar className="h-5 w-5" />,
    })
  }

  // 3. Engagement Coaching (MEDIUM PRIORITY)
  if (aggregates.avgEngagementScore < 5.5) {
    interventions.push({
      priority: 'MEDIUM',
      title: 'Engagement Improvement Needed',
      message: `Engagement score of ${aggregates.avgEngagementScore.toFixed(1)} indicates students show low attention during sessions.`,
      action: 'Focus on interactive teaching techniques',
      icon: <Video className="h-5 w-5" />,
    })
  }

  // 4. Technical Support (LOW PRIORITY)
  if (aggregates.technicalIssueRate > 0.12) {
    interventions.push({
      priority: 'LOW',
      title: 'Technical Issues Detected',
      message: `${Math.round(aggregates.technicalIssueRate * 100)}% of sessions have technical problems (target: <8%).`,
      action: 'IT support for equipment upgrade or training',
      icon: <Video className="h-5 w-5" />,
    })
  }

  // 5. Empathy Development (MEDIUM PRIORITY)
  if (aggregates.avgEmpathyScore < 5.0) {
    interventions.push({
      priority: 'MEDIUM',
      title: 'Empathy Skills Development',
      message: `Empathy score of ${aggregates.avgEmpathyScore.toFixed(1)} suggests students may feel unheard or misunderstood.`,
      action: 'Enroll in active listening workshop',
      icon: <Heart className="h-5 w-5" />,
    })
  }

  // 6. Positive Reinforcement (ALWAYS SHOW if high performer)
  if (
    aggregates.recommendationRate > 0.80 &&
    aggregates.avgEngagementScore > 7.5 &&
    aggregates.churnProbability < 0.3
  ) {
    interventions.push({
      priority: 'POSITIVE',
      title: 'High Performer Recognition',
      message: `Exceptional performance with ${Math.round(aggregates.recommendationRate * 100)}% recommendation rate and strong engagement.`,
      action: 'Consider for Tutor of the Month or mentor role',
      icon: <Trophy className="h-5 w-5" />,
    })
  }

  // Sort by priority
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, POSITIVE: 3 }
  interventions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500 bg-red-50'
      case 'MEDIUM':
        return 'border-l-yellow-500 bg-yellow-50'
      case 'LOW':
        return 'border-l-blue-500 bg-blue-50'
      case 'POSITIVE':
        return 'border-l-green-500 bg-green-50'
      default:
        return 'border-l-gray-500'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive">{priority}</Badge>
      case 'MEDIUM':
        return <Badge className="bg-yellow-500">{priority}</Badge>
      case 'LOW':
        return <Badge variant="secondary">{priority}</Badge>
      case 'POSITIVE':
        return <Badge className="bg-green-500">RECOGNITION</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  if (interventions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            No Interventions Needed
          </CardTitle>
          <CardDescription>
            This tutor is performing well with no critical issues detected.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold mb-2">Intervention Recommendations</h2>
        <p className="text-sm text-gray-600">
          AI-generated coaching suggestions based on detected patterns and performance data
        </p>
      </div>

      <div className="grid gap-4">
        {interventions.map((intervention, index) => (
          <Alert
            key={index}
            className={`border-l-4 ${getPriorityColor(intervention.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1">{intervention.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTitle className="mb-0">{intervention.title}</AlertTitle>
                    {getPriorityBadge(intervention.priority)}
                  </div>
                  <AlertDescription className="text-sm mb-3">
                    {intervention.message}
                  </AlertDescription>
                  <div className="bg-white border rounded p-3 text-sm">
                    <strong>Recommended Action:</strong> {intervention.action}
                  </div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="ml-4">
                Mark as Addressed
              </Button>
            </div>
          </Alert>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These recommendations are generated based on tutor performance data 
            and industry benchmarks. Track completion and outcomes to measure impact over time.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

