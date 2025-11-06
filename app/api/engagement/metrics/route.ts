import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tutorId = searchParams.get('tutorId')
    const metricType = searchParams.get('metricType') || 'engagement'
    const period = parseInt(searchParams.get('period') || '30')

    // Calculate date thresholds
    const currentPeriodEnd = new Date()
    const currentPeriodStart = new Date()
    currentPeriodStart.setDate(currentPeriodStart.getDate() - period)

    const previousPeriodEnd = new Date(currentPeriodStart)
    const previousPeriodStart = new Date(previousPeriodEnd)
    previousPeriodStart.setDate(previousPeriodStart.getDate() - period)

    // Build where clause
    const baseWhere: any = {
      sessionCompleted: true
    }
    if (tutorId) {
      baseWhere.tutorId = tutorId
    }

    // Determine which field to query
    let metricField: string
    let isRating = false
    
    switch (metricType) {
      case 'engagement':
        metricField = 'engagementScore'
        break
      case 'empathy':
        metricField = 'empathyScore'
        break
      case 'clarity':
        metricField = 'clarityScore'
        break
      case 'satisfaction':
        metricField = 'studentSatisfaction'
        break
      case 'rating':
        metricField = 'studentRating'
        isRating = true
        break
      default:
        metricField = 'engagementScore'
    }

    // Get current period sessions
    const currentSessions = await prisma.session.findMany({
      where: {
        ...baseWhere,
        sessionDatetime: {
          gte: currentPeriodStart,
          lte: currentPeriodEnd
        },
        [metricField]: {
          not: null
        }
      },
      select: {
        [metricField]: true
      }
    })

    // Get previous period sessions
    const previousSessions = await prisma.session.findMany({
      where: {
        ...baseWhere,
        sessionDatetime: {
          gte: previousPeriodStart,
          lt: currentPeriodStart
        },
        [metricField]: {
          not: null
        }
      },
      select: {
        [metricField]: true
      }
    })

    // Calculate averages
    const currentValue = currentSessions.length > 0
      ? currentSessions.reduce((sum, s) => sum + (s[metricField as keyof typeof s] as number), 0) / currentSessions.length
      : 0

    const previousValue = previousSessions.length > 0
      ? previousSessions.reduce((sum, s) => sum + (s[metricField as keyof typeof s] as number), 0) / previousSessions.length
      : null

    // Calculate trend
    let trend: 'up' | 'down' | 'stable' = 'stable'
    let percentChange = 0

    if (previousValue !== null && previousValue > 0) {
      percentChange = ((currentValue - previousValue) / previousValue) * 100
      
      if (Math.abs(percentChange) < 2) {
        trend = 'stable'
      } else if (percentChange > 0) {
        trend = 'up'
      } else {
        trend = 'down'
      }
    }

    return NextResponse.json({
      value: currentValue,
      previousValue,
      trend,
      percentChange,
      currentPeriodCount: currentSessions.length,
      previousPeriodCount: previousSessions.length
    })
  } catch (error) {
    console.error('Error fetching engagement metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement metrics' },
      { status: 500 }
    )
  }
}
