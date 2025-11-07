import { prisma } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { alertId } = body

    if (!alertId) {
      return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })
    }

    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        isAcknowledged: true,
        acknowledgedAt: new Date(),
        // In a real app, you'd get this from the authenticated user session
        acknowledgedBy: 'system',
      },
    })

    return NextResponse.json({
      success: true,
      alert: updatedAlert,
    })
  } catch (error) {
    console.error('Error acknowledging alert:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

