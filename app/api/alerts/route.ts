import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  acknowledgeAlert,
  resolveAlert,
  getTutorAlerts,
  getHighPriorityAlerts,
  getAlertStatistics
} from '@/lib/alerts/generator'

export const runtime = 'nodejs'

// GET - Fetch alerts with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const tutorId = searchParams.get('tutorId')
    const severity = searchParams.get('severity')
    const category = searchParams.get('category')
    const acknowledged = searchParams.get('acknowledged')
    const resolved = searchParams.get('resolved')
    const limit = parseInt(searchParams.get('limit') || '50')
    const highPriority = searchParams.get('highPriority') === 'true'
    const stats = searchParams.get('stats') === 'true'

    // Return statistics
    if (stats) {
      const statistics = await getAlertStatistics(7)
      return NextResponse.json(statistics)
    }

    // Return high priority alerts
    if (highPriority) {
      const alerts = await getHighPriorityAlerts(limit)
      return NextResponse.json({ alerts })
    }

    // Return alerts for specific tutor
    if (tutorId) {
      const alerts = await getTutorAlerts(tutorId, {
        includeResolved: resolved === 'true',
        limit
      })
      return NextResponse.json({ alerts })
    }

    // Build where clause for general query
    const whereClause: any = {}
    
    if (severity) whereClause.severity = severity
    if (category) whereClause.category = category
    if (acknowledged === 'true') whereClause.isAcknowledged = true
    if (acknowledged === 'false') whereClause.isAcknowledged = false
    if (resolved === 'true') whereClause.isResolved = true
    if (resolved === 'false') whereClause.isResolved = false

    // Fetch alerts
    const alerts = await prisma.alert.findMany({
      where: whereClause,
      include: {
        tutor: {
          select: {
            tutorId: true,
            primarySubject: true,
            monthsExperience: true,
            certificationLevel: true
          }
        }
      },
      orderBy: [
        { severity: 'asc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    return NextResponse.json({ alerts, count: alerts.length })

  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// PATCH - Acknowledge or resolve alerts
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId, action, acknowledgedBy } = body

    if (!alertId || !action) {
      return NextResponse.json(
        { error: 'alertId and action are required' },
        { status: 400 }
      )
    }

    if (action === 'acknowledge') {
      if (!acknowledgedBy) {
        return NextResponse.json(
          { error: 'acknowledgedBy is required for acknowledge action' },
          { status: 400 }
        )
      }
      await acknowledgeAlert(alertId, acknowledgedBy)
      return NextResponse.json({ success: true, action: 'acknowledged' })
    }

    if (action === 'resolve') {
      await resolveAlert(alertId)
      return NextResponse.json({ success: true, action: 'resolved' })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "acknowledge" or "resolve"' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    )
  }
}
