import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { TutorProfileCard } from '@/components/dashboard/tutor-profile-card'
import { TutorMetricsGrid } from '@/components/dashboard/tutor-metrics-grid'
import { TutorPerformanceChart } from '@/components/dashboard/tutor-performance-chart'
import { SessionHistoryTable } from '@/components/dashboard/session-history-table'
import { InterventionRecommendations } from '@/components/dashboard/intervention-recommendations'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface TutorDetailPageProps {
  params: Promise<{
    tutorId: string
  }>
}

async function getTutorDetails(tutorId: string) {
  try {
    const tutor = await prisma.tutor.findUnique({
      where: { tutorId },
      include: {
        aggregates: true,
      },
    })

    if (!tutor) {
      return null
    }

    return tutor
  } catch (error) {
    console.error('Error fetching tutor:', error)
    return null
  }
}

async function getTutorSessions(tutorId: string) {
  try {
    const sessions = await prisma.session.findMany({
      where: { tutorId },
      orderBy: { sessionDatetime: 'desc' },
      take: 50,
    })

    return sessions
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return []
  }
}

async function getTutorPerformanceData(tutorId: string) {
  try {
    // Get last 30 days of sessions for charting
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sessions = await prisma.session.findMany({
      where: {
        tutorId,
        sessionDatetime: { gte: thirtyDaysAgo },
        sessionCompleted: true,
      },
      select: {
        sessionDatetime: true,
        studentRating: true,
        engagementScore: true,
        empathyScore: true,
        clarityScore: true,
        studentSatisfaction: true,
      },
      orderBy: { sessionDatetime: 'asc' },
    })

    // Group by date
    const dailyData: Record<string, {
      ratings: number[]
      engagement: number[]
      empathy: number[]
      clarity: number[]
      satisfaction: number[]
    }> = {}

    sessions.forEach((session) => {
      const dateKey = session.sessionDatetime.toISOString().split('T')[0]
      
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          ratings: [],
          engagement: [],
          empathy: [],
          clarity: [],
          satisfaction: [],
        }
      }

      if (session.studentRating) dailyData[dateKey].ratings.push(session.studentRating)
      if (session.engagementScore) dailyData[dateKey].engagement.push(session.engagementScore)
      if (session.empathyScore) dailyData[dateKey].empathy.push(session.empathyScore)
      if (session.clarityScore) dailyData[dateKey].clarity.push(session.clarityScore)
      if (session.studentSatisfaction) dailyData[dateKey].satisfaction.push(session.studentSatisfaction)
    })

    // Calculate averages
    const chartData = Object.entries(dailyData).map(([date, metrics]) => ({
      date,
      avgRating: metrics.ratings.length > 0 
        ? metrics.ratings.reduce((a, b) => a + b, 0) / metrics.ratings.length 
        : null,
      avgEngagement: metrics.engagement.length > 0
        ? metrics.engagement.reduce((a, b) => a + b, 0) / metrics.engagement.length
        : null,
      avgEmpathy: metrics.empathy.length > 0
        ? metrics.empathy.reduce((a, b) => a + b, 0) / metrics.empathy.length
        : null,
      avgClarity: metrics.clarity.length > 0
        ? metrics.clarity.reduce((a, b) => a + b, 0) / metrics.clarity.length
        : null,
      avgSatisfaction: metrics.satisfaction.length > 0
        ? metrics.satisfaction.reduce((a, b) => a + b, 0) / metrics.satisfaction.length
        : null,
    }))

    return chartData
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return []
  }
}

export default async function TutorDetailPage({ params }: TutorDetailPageProps) {
  const { tutorId } = await params
  const [tutor, sessions, performanceData] = await Promise.all([
    getTutorDetails(tutorId),
    getTutorSessions(tutorId),
    getTutorPerformanceData(tutorId),
  ])

  if (!tutor) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tutors">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutors
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Tutor {tutor.tutorId}
          </h1>
          <p className="text-gray-500 mt-1">
            {tutor.primarySubject} Specialist
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <TutorProfileCard tutor={tutor} />
          </Suspense>
        </div>
        <div className="md:col-span-2">
          <Suspense fallback={<Skeleton className="h-[400px]" />}>
            <TutorMetricsGrid tutor={tutor} />
          </Suspense>
        </div>
      </div>

      {tutor.aggregates && (
        <Suspense fallback={<Skeleton className="h-[300px]" />}>
          <InterventionRecommendations 
            tutor={tutor}
            aggregates={tutor.aggregates}
          />
        </Suspense>
      )}

      <Suspense fallback={<Skeleton className="h-[400px]" />}>
        <TutorPerformanceChart data={performanceData} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[600px]" />}>
        <SessionHistoryTable sessions={sessions} />
      </Suspense>
    </div>
  )
}
