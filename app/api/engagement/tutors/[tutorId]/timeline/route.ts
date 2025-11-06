import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tutorId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const { tutorId } = await params

    // Fetch engagement events for the tutor
    const events = await prisma.engagementEvent.findMany({
      where: {
        tutorId: tutorId
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: limit,
      select: {
        id: true,
        eventType: true,
        timestamp: true,
        eventData: true
      }
    })

    return NextResponse.json({
      events,
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
