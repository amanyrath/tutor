/**
 * Reliability Analytics API
 * 
 * GET /api/analytics/reliability
 * - Returns complete reliability analysis including reschedule patterns,
 *   correlations, and no-show risk assessments
 */

import { NextRequest, NextResponse } from 'next/server'
import { 
  performReliabilityAnalysis,
  getHighRiskReliabilityTutors
} from '@/lib/analytics/reschedule-analyzer'
import { 
  getHighRiskSessions 
} from '@/lib/analytics/noshow-predictor'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const threshold = parseFloat(searchParams.get('threshold') || '0.15')
    const daysAhead = parseInt(searchParams.get('daysAhead') || '7')

    // Perform reliability analysis
    const reliabilityAnalysis = await performReliabilityAnalysis(threshold)

    // Get high-risk tutors (combined reschedule + no-show risk)
    const highRiskTutors = await getHighRiskReliabilityTutors()

    // Get upcoming high-risk sessions
    const highRiskSessions = await getHighRiskSessions(daysAhead)

    // Combine the data
    const response = {
      ...reliabilityAnalysis,
      highRiskTutors,
      upcomingHighRiskSessions: highRiskSessions.slice(0, 20), // Limit to 20
      summary: {
        ...reliabilityAnalysis.overallMetrics,
        criticalTutors: highRiskTutors.filter(t => t.urgency === 'critical').length,
        highRiskTutors: highRiskTutors.length,
        upcomingRiskySessions: highRiskSessions.length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error in reliability analytics:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate reliability analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

