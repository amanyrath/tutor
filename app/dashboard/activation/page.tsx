/**
 * Activation Dashboard Page
 * 
 * Displays tutor activation metrics and engagement timelines
 */

import { Suspense } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ActivationTimeline } from '@/components/dashboard/activation-timeline'
import { EngagementHeatmap } from '@/components/dashboard/engagement-heatmap'
import { ActivationMetricCard } from '@/components/dashboard/activation-metric-card'

export default function ActivationPage() {
  // For demo, using a sample tutorId. In production, this would come from URL params or context
  const sampleTutorId = 'T0001'

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tutor Activation</h1>
          <p className="text-gray-600 mt-2">
            Monitor engagement patterns and activation metrics
          </p>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <ActivationMetricCard
          title="Active Tutors (7d)"
          value="156"
          subtitle="Last 7 days"
          icon="users"
          status="good"
          trend={{
            direction: 'up',
            value: '+12%'
          }}
        />
        <ActivationMetricCard
          title="Total Engagement Events"
          value="2,847"
          subtitle="Last 7 days"
          icon="activity"
          status="good"
          trend={{
            direction: 'up',
            value: '+8%'
          }}
        />
        <ActivationMetricCard
          title="Avg. Time Since Login"
          value="2.3 days"
          subtitle="Active tutors"
          icon="clock"
          status="warning"
          trend={{
            direction: 'neutral',
            value: 'No change'
          }}
        />
        <ActivationMetricCard
          title="Sessions Scheduled"
          value="423"
          subtitle="Last 7 days"
          icon="calendar"
          status="good"
          trend={{
            direction: 'up',
            value: '+15%'
          }}
        />
      </div>

      {/* Engagement Heatmap */}
      <Suspense fallback={<LoadingSkeleton title="Activity Heatmap" />}>
        <EngagementHeatmap days={30} />
      </Suspense>

      {/* Sample Tutor Timeline */}
      <Suspense fallback={<LoadingSkeleton title="Activity Timeline" />}>
        <ActivationTimeline tutorId={sampleTutorId} days={30} />
      </Suspense>
    </div>
  )
}

function LoadingSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Loading...</CardDescription>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-64 w-full" />
      </CardContent>
    </Card>
  )
}


