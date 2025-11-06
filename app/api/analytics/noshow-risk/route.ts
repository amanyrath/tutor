import { NextRequest, NextResponse } from 'next/server'
import {
  calculateNoShowRisk,
  getHighRiskSessions,
  generateNoShowAlerts
} from '@/lib/analytics/noshow-predictor'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const tutorId = searchParams.get('tutorId')
    const daysAhead = parseInt(searchParams.get('daysAhead') || '7')
    const generateAlerts = searchParams.get('generateAlerts') === 'true'

    // Generate alerts for high-risk sessions
    if (generateAlerts) {
      const alertsCreated = await generateNoShowAlerts()
      return NextResponse.json({
        success: true,
        alertsCreated
      })
    }

    // Get risk for specific tutor
    if (tutorId) {
      const risk = await calculateNoShowRisk(tutorId)
      return NextResponse.json({ risk })
    }

    // Get all high-risk sessions
    const highRiskSessions = await getHighRiskSessions(daysAhead)

    // Group by risk level
    const byRiskLevel = {
      high: highRiskSessions.filter(s => s.riskLevel === 'high'),
      medium: highRiskSessions.filter(s => s.riskLevel === 'medium'),
      low: highRiskSessions.filter(s => s.riskLevel === 'low')
    }

    return NextResponse.json({
      summary: {
        totalHighRisk: byRiskLevel.high.length,
        totalMediumRisk: byRiskLevel.medium.length,
        totalLowRisk: byRiskLevel.low.length,
        daysAhead
      },
      highRiskSessions: byRiskLevel.high.slice(0, 20), // Top 20
      mediumRiskSessions: byRiskLevel.medium.slice(0, 10)
    })

  } catch (error) {
    console.error('Error in no-show prediction:', error)
    return NextResponse.json(
      { error: 'Failed to predict no-shows', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}


