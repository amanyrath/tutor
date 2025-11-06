/**
 * No-Show Predictor
 * 
 * Uses AI to analyze historical patterns and predict which sessions
 * are at high risk of no-shows.
 */

import { prisma } from '@/lib/db'
import { predictNoShowRisk } from '../ai/pattern-analyzer'

export interface NoShowRiskAssessment {
  sessionId?: string
  tutorId: string
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high'
  riskFactors: Array<{
    factor: string
    weight: number
    explanation: string
  }>
  mitigation: string
  historicalContext: {
    tutorNoShowRate: number
    tutorRescheduleRate: number
    recentReliability: number
  }
}

/**
 * Calculate simple no-show risk score based on historical data
 */
export async function calculateNoShowRisk(tutorId: string): Promise<NoShowRiskAssessment> {
  // Get tutor history
  const tutor = await prisma.tutor.findUnique({
    where: { tutorId },
    include: {
      aggregates: true,
      sessions: {
        where: {
          sessionDatetime: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        },
        orderBy: {
          sessionDatetime: 'desc'
        }
      }
    }
  })

  if (!tutor) {
    throw new Error(`Tutor ${tutorId} not found`)
  }

  // Calculate historical metrics
  const recentSessions = tutor.sessions
  const noShowCount = recentSessions.filter(s => !s.tutorShowed).length
  const rescheduleCount = recentSessions.filter(s => s.sessionCompleted === false && s.tutorShowed).length
  const completedCount = recentSessions.filter(s => s.sessionCompleted).length

  const noShowRate = recentSessions.length > 0 ? noShowCount / recentSessions.length : 0
  const rescheduleRate = recentSessions.length > 0 ? rescheduleCount / recentSessions.length : 0
  const completionRate = recentSessions.length > 0 ? completedCount / recentSessions.length : 1

  // Calculate risk score (0-1)
  let riskScore = 0

  // Factor 1: Historical no-show rate (40% weight)
  riskScore += noShowRate * 0.4

  // Factor 2: Reschedule rate (20% weight)
  riskScore += rescheduleRate * 0.2

  // Factor 3: Low reliability score (20% weight)
  riskScore += (1 - tutor.reliabilityScore) * 0.2

  // Factor 4: Churn risk (20% weight)
  if (tutor.aggregates) {
    riskScore += tutor.aggregates.churnProbability * 0.2
  }

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high'
  if (riskScore > 0.6) {
    riskLevel = 'high'
  } else if (riskScore > 0.3) {
    riskLevel = 'medium'
  } else {
    riskLevel = 'low'
  }

  // Identify risk factors
  const riskFactors: Array<{ factor: string; weight: number; explanation: string }> = []

  if (noShowRate > 0.1) {
    riskFactors.push({
      factor: 'Historical no-shows',
      weight: noShowRate,
      explanation: `Has ${(noShowRate * 100).toFixed(1)}% no-show rate in last 30 days`
    })
  }

  if (rescheduleRate > 0.15) {
    riskFactors.push({
      factor: 'High reschedule rate',
      weight: rescheduleRate,
      explanation: `Reschedules ${(rescheduleRate * 100).toFixed(1)}% of sessions`
    })
  }

  if (tutor.reliabilityScore < 0.7) {
    riskFactors.push({
      factor: 'Low reliability score',
      weight: 1 - tutor.reliabilityScore,
      explanation: `Reliability score of ${(tutor.reliabilityScore * 100).toFixed(0)}%`
    })
  }

  if (tutor.aggregates && tutor.aggregates.churnRiskLevel === 'High') {
    riskFactors.push({
      factor: 'High churn risk',
      weight: tutor.aggregates.churnProbability,
      explanation: `${(tutor.aggregates.churnProbability * 100).toFixed(0)}% churn probability`
    })
  }

  // Generate mitigation strategy
  let mitigation = 'Monitor session attendance'
  if (riskLevel === 'high') {
    mitigation = 'Send reminder 24h and 1h before session. Follow up if no confirmation.'
  } else if (riskLevel === 'medium') {
    mitigation = 'Send reminder 24h before session and verify availability.'
  }

  return {
    tutorId,
    riskScore,
    riskLevel,
    riskFactors,
    mitigation,
    historicalContext: {
      tutorNoShowRate: noShowRate,
      tutorRescheduleRate: rescheduleRate,
      recentReliability: completionRate
    }
  }
}

/**
 * Predict no-show risk for upcoming sessions using AI
 */
export async function predictUpcomingNoShows(
  tutorId: string,
  upcomingSessions: any[]
): Promise<NoShowRiskAssessment[]> {
  // Get tutor history and historical no-shows
  const tutor = await prisma.tutor.findUnique({
    where: { tutorId },
    include: {
      aggregates: true,
      sessions: {
        where: {
          tutorShowed: false
        },
        orderBy: {
          sessionDatetime: 'desc'
        },
        take: 20
      }
    }
  })

  if (!tutor) {
    throw new Error(`Tutor ${tutorId} not found`)
  }

  try {
    // Use AI to predict
    const prediction = await predictNoShowRisk({
      tutorHistory: {
        tutorId: tutor.tutorId,
        noShowCount: tutor.noShowCount,
        rescheduleRate: tutor.rescheduleRate,
        reliabilityScore: tutor.reliabilityScore,
        monthsExperience: tutor.monthsExperience,
        churnProbability: tutor.aggregates?.churnProbability || 0
      },
      upcomingSessions,
      historicalNoShows: tutor.sessions
    })

    // Convert AI predictions to our format
    return prediction.high_risk_sessions.map(session => ({
      sessionId: session.session_id,
      tutorId,
      riskScore: session.risk_score,
      riskLevel: session.risk_score > 0.6 ? 'high' : session.risk_score > 0.3 ? 'medium' : 'low',
      riskFactors: prediction.risk_factors,
      mitigation: session.mitigation,
      historicalContext: {
        tutorNoShowRate: tutor.noShowCount / Math.max(tutor.totalSessions, 1),
        tutorRescheduleRate: tutor.rescheduleRate,
        recentReliability: tutor.reliabilityScore
      }
    }))

  } catch (error) {
    console.error('AI prediction failed, falling back to rule-based:', error)
    
    // Fallback to simple calculation
    const baseRisk = await calculateNoShowRisk(tutorId)
    
    return upcomingSessions.map(session => ({
      ...baseRisk,
      sessionId: session.id
    }))
  }
}

/**
 * Get all high-risk upcoming sessions
 */
export async function getHighRiskSessions(
  daysAhead: number = 7
): Promise<NoShowRiskAssessment[]> {
  const startDate = new Date()
  const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)

  // Get upcoming sessions
  const upcomingSessions = await prisma.session.findMany({
    where: {
      sessionDatetime: {
        gte: startDate,
        lt: endDate
      },
      sessionCompleted: false
    },
    include: {
      tutor: {
        include: {
          aggregates: true
        }
      }
    }
  })

  const riskAssessments: NoShowRiskAssessment[] = []

  // Group by tutor
  const sessionsByTutor = new Map<string, any[]>()
  for (const session of upcomingSessions) {
    if (!sessionsByTutor.has(session.tutorId)) {
      sessionsByTutor.set(session.tutorId, [])
    }
    sessionsByTutor.get(session.tutorId)!.push(session)
  }

  // Calculate risk for each tutor
  for (const [tutorId, sessions] of sessionsByTutor) {
    try {
      const tutorRisk = await calculateNoShowRisk(tutorId)
      
      // Apply risk to each session
      for (const session of sessions) {
        riskAssessments.push({
          ...tutorRisk,
          sessionId: session.sessionId
        })
      }
    } catch (error) {
      console.error(`Error calculating risk for tutor ${tutorId}:`, error)
    }
  }

  // Return only high-risk sessions
  return riskAssessments.filter(r => r.riskLevel === 'high' || r.riskLevel === 'medium')
}

/**
 * Generate proactive alerts for high-risk sessions
 */
export async function generateNoShowAlerts(): Promise<number> {
  const highRiskSessions = await getHighRiskSessions(3) // Next 3 days

  let alertsCreated = 0

  for (const risk of highRiskSessions) {
    if (risk.riskLevel !== 'high') continue

    // Check if alert already exists
    const existingAlert = await prisma.alert.findFirst({
      where: {
        tutorId: risk.tutorId,
        category: 'reliability',
        metric: 'noshow_risk',
        isResolved: false,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })

    if (existingAlert) continue

    // Create alert
    await prisma.alert.create({
      data: {
        tutorId: risk.tutorId,
        severity: 'high',
        category: 'reliability',
        title: 'High No-Show Risk Detected',
        message: `Tutor ${risk.tutorId} has ${(risk.riskScore * 100).toFixed(0)}% risk of no-show. ${risk.mitigation}`,
        metric: 'noshow_risk',
        metricValue: risk.riskScore,
        threshold: 0.6
      }
    })

    alertsCreated++
  }

  return alertsCreated
}

