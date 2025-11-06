import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

interface TrackEventRequest {
  tutorId: string
  eventType: 'login' | 'session_completed' | 'session_scheduled' | 'profile_updated' | 'message_sent' | 'first_session' | 'rating_received'
  eventData?: Record<string, any>
  timestamp?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: TrackEventRequest = await request.json()

    // Validate required fields
    if (!body.tutorId || !body.eventType) {
      return NextResponse.json(
        { error: 'tutorId and eventType are required' },
        { status: 400 }
      )
    }

    // Check if tutor exists
    const tutor = await prisma.tutor.findUnique({
      where: { tutorId: body.tutorId }
    })

    if (!tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      )
    }

    // Create engagement event
    const event = await prisma.engagementEvent.create({
      data: {
        tutorId: body.tutorId,
        eventType: body.eventType,
        eventData: body.eventData || {},
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date()
      }
    })

    // Update lastLogin on the tutor if this is a login event
    if (body.eventType === 'login') {
      await prisma.tutor.update({
        where: { tutorId: body.tutorId },
        data: { lastLogin: event.timestamp }
      })
    }

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        tutorId: event.tutorId,
        eventType: event.eventType,
        timestamp: event.timestamp
      }
    })

  } catch (error) {
    console.error('Error tracking engagement event:', error)
    return NextResponse.json(
      { error: 'Failed to track engagement event' },
      { status: 500 }
    )
  }
}

