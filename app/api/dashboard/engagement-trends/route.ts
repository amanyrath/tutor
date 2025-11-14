import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get sessions from the last 30 days, grouped by date
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const sessions = await prisma.session.findMany({
      where: {
        sessionDatetime: {
          gte: thirtyDaysAgo,
        },
        sessionCompleted: true,
      },
      select: {
        sessionDatetime: true,
        engagementScore: true,
        empathyScore: true,
        clarityScore: true,
        studentSatisfaction: true,
      },
      orderBy: {
        sessionDatetime: 'asc',
      },
    })

    // Group sessions by date and calculate daily averages
    const dailyData: Record<
      string,
      {
        engagement: number[]
        empathy: number[]
        clarity: number[]
        satisfaction: number[]
      }
    > = {}

    sessions.forEach((session: typeof sessions[number]) => {
      const dateKey = session.sessionDatetime.toISOString().split('T')[0]

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          engagement: [],
          empathy: [],
          clarity: [],
          satisfaction: [],
        }
      }

      if (session.engagementScore !== null) {
        dailyData[dateKey].engagement.push(session.engagementScore)
      }
      if (session.empathyScore !== null) {
        dailyData[dateKey].empathy.push(session.empathyScore)
      }
      if (session.clarityScore !== null) {
        dailyData[dateKey].clarity.push(session.clarityScore)
      }
      if (session.studentSatisfaction !== null) {
        dailyData[dateKey].satisfaction.push(session.studentSatisfaction)
      }
    })

    // Calculate averages and format the response
    const trendsData = Object.entries(dailyData)
      .map(([date, metrics]) => ({
        date,
        avgEngagement:
          metrics.engagement.length > 0
            ? metrics.engagement.reduce((a, b) => a + b, 0) / metrics.engagement.length
            : 0,
        avgEmpathy:
          metrics.empathy.length > 0
            ? metrics.empathy.reduce((a, b) => a + b, 0) / metrics.empathy.length
            : 0,
        avgClarity:
          metrics.clarity.length > 0
            ? metrics.clarity.reduce((a, b) => a + b, 0) / metrics.clarity.length
            : 0,
        avgSatisfaction:
          metrics.satisfaction.length > 0
            ? metrics.satisfaction.reduce((a, b) => a + b, 0) / metrics.satisfaction.length
            : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({
      success: true,
      data: trendsData,
    })
  } catch (error) {
    console.error('Error fetching engagement trends:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

