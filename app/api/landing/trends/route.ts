import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get engagement trends for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get daily aggregates
    const sessions = await prisma.session.groupBy({
      by: ['sessionDatetime'],
      where: {
        sessionCompleted: true,
        sessionDatetime: {
          gte: thirtyDaysAgo
        }
      },
      _avg: {
        engagementScore: true,
        studentRating: true,
        studentSatisfaction: true,
      },
      _count: {
        sessionId: true
      }
    })

    // Format data by date
    const trendData = sessions.map(s => ({
      date: s.sessionDatetime.toISOString().split('T')[0],
      engagement: s._avg.engagementScore || 0,
      rating: (s._avg.studentRating || 0) * 2, // Normalize to 10 scale
      satisfaction: s._avg.studentSatisfaction || 0,
      sessions: s._count.sessionId
    }))

    // Group by date and average
    const groupedByDate = trendData.reduce((acc, item) => {
      if (!acc[item.date]) {
        acc[item.date] = {
          date: item.date,
          engagement: [],
          rating: [],
          satisfaction: [],
          sessions: 0
        }
      }
      acc[item.date].engagement.push(item.engagement)
      acc[item.date].rating.push(item.rating)
      acc[item.date].satisfaction.push(item.satisfaction)
      acc[item.date].sessions += item.sessions
      return acc
    }, {} as Record<string, any>)

    const trends = Object.values(groupedByDate).map((day: any) => ({
      date: day.date,
      engagement: day.engagement.reduce((a: number, b: number) => a + b, 0) / day.engagement.length,
      rating: day.rating.reduce((a: number, b: number) => a + b, 0) / day.rating.length,
      satisfaction: day.satisfaction.reduce((a: number, b: number) => a + b, 0) / day.satisfaction.length,
      sessions: day.sessions
    })).sort((a, b) => a.date.localeCompare(b.date))

    return NextResponse.json({ trends })
  } catch (error) {
    console.error('Error fetching trends:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trends', trends: [] },
      { status: 500 }
    )
  }
}


