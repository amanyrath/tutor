import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const days = searchParams.get('days')
    const { tutorId } = await params

    // Build where clause
    const where: any = {
      tutorId: tutorId
    }

    // If days is provided, filter by date range
    if (days) {
      const daysNum = parseInt(days)
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysNum)
      where.timestamp = {
        gte: startDate
      }
    }

    // Fetch engagement events for the tutor
    const events = await prisma.engagementEvent.findMany({
      where,
      orderBy: {
        timestamp: 'desc'
      },
      take: days ? undefined : limit, // Only use limit if days is not specified
      select: {
        id: true,
        eventType: true,
        timestamp: true,
        eventData: true
      }
    })

    return NextResponse.json({
      events: events.map((e: typeof events[number]) => ({
        timestamp: e.timestamp.toISOString(),
        eventType: e.eventType,
        eventData: e.eventData
      })),
      count: events.length
    })
  } catch (error) {
    console.error('Error fetching engagement timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch engagement timeline' },
      { status: 500 }
    )
  }
}
