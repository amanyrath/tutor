/**
 * Reschedule Analysis Engine
 * 
 * Analyzes reschedule patterns, correlations with other metrics,
 * and time-of-day patterns to identify reliability issues.
 */

import { prisma } from '@/lib/db'

export interface RescheduleMetrics {
  tutorId: string
  rescheduleRate: number
  rescheduleCount: number
  totalSessions: number
  avgRatingWhenRescheduled: number | null
  avgRatingOverall: number
  technicalIssueCorrelation: number
  churnCorrelation: number
  timeOfDayPattern: {
    morning: number // 6am-12pm
    afternoon: number // 12pm-6pm
    evening: number // 6pm-12am
    night: number // 12am-6am
  }
  dayOfWeekPattern: {
    [key: string]: number // day name -> reschedule rate
  }
  isHighRisk: boolean
  recommendations: string[]
}

export interface RescheduleCorrelation {
  metric: string
  correlation: number
  strength: 'strong' | 'moderate' | 'weak' | 'none'
  insight: string
}

export interface ReliabilityAnalysis {
  highRescheduleTutors: RescheduleMetrics[]
  correlations: RescheduleCorrelation[]
  overallMetrics: {
    avgRescheduleRate: number
    tutorsAboveThreshold: number
    totalTutorsAnalyzed: number
  }
  timeOfDayInsights: {
    peakRescheduleTime: string
    lowestRescheduleTime: string
    pattern: Record<string, number>
  }
}

/**
 * Calculate reschedule metrics for a specific tutor
 */
export async function analyzeTutorReliability(tutorId: string): Promise<RescheduleMetrics> {
  const tutor = await prisma.tutor.findUnique({
    where: { tutorId },
    include: {
      aggregates: true,
      sessions: {
        orderBy: {
          sessionDatetime: 'desc'
        },
        take: 100 // Last 100 sessions
      }
    }
  })

  if (!tutor) {
    throw new Error(`Tutor ${tutorId} not found`)
  }

  const sessions = tutor.sessions
  const totalSessions = sessions.length
  
  // Calculate reschedule patterns
  const rescheduledSessions = sessions.filter((s: typeof sessions[number]) => s.sessionCompleted === false && s.tutorShowed)
  const rescheduleCount = rescheduledSessions.length
  const rescheduleRate = totalSessions > 0 ? rescheduleCount / totalSessions : 0

  // Average ratings
  const rescheduledRatings = rescheduledSessions
    .map((s: typeof rescheduledSessions[number]) => s.studentRating)
    .filter((r: number | null) => r !== null) as number[]
  const avgRatingWhenRescheduled = rescheduledRatings.length > 0
    ? rescheduledRatings.reduce((sum: number, r: typeof rescheduledRatings[number]) => sum + r, 0) / rescheduledRatings.length
    : null

  const allRatings = sessions
    .map((s: typeof sessions[number]) => s.studentRating)
    .filter((r: number | null) => r !== null) as number[]
  const avgRatingOverall = allRatings.length > 0
    ? allRatings.reduce((sum: number, r: typeof allRatings[number]) => sum + r, 0) / allRatings.length
    : 0

  // Time of day pattern
  const timeOfDayPattern = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  }

  const timeOfDayCounts = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  }

  for (const session of sessions) {
    const hour = session.sessionDatetime.getHours()
    let timeOfDay: keyof typeof timeOfDayPattern
    
    if (hour >= 6 && hour < 12) {
      timeOfDay = 'morning'
    } else if (hour >= 12 && hour < 18) {
      timeOfDay = 'afternoon'
    } else if (hour >= 18 && hour < 24) {
      timeOfDay = 'evening'
    } else {
      timeOfDay = 'night'
    }

    timeOfDayCounts[timeOfDay]++
    if (!session.sessionCompleted && session.tutorShowed) {
      timeOfDayPattern[timeOfDay]++
    }
  }

  // Convert to rates
  for (const key in timeOfDayPattern) {
    const k = key as keyof typeof timeOfDayPattern
    timeOfDayPattern[k] = timeOfDayCounts[k] > 0 
      ? timeOfDayPattern[k] / timeOfDayCounts[k] 
      : 0
  }

  // Day of week pattern
  const dayOfWeekPattern: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0
  }

  const dayOfWeekCounts: Record<string, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  for (const session of sessions) {
    const dayName = dayNames[session.sessionDatetime.getDay()]
    dayOfWeekCounts[dayName]++
    if (!session.sessionCompleted && session.tutorShowed) {
      dayOfWeekPattern[dayName]++
    }
  }

  // Convert to rates
  for (const day in dayOfWeekPattern) {
    dayOfWeekPattern[day] = dayOfWeekCounts[day] > 0 
      ? dayOfWeekPattern[day] / dayOfWeekCounts[day] 
      : 0
  }

  // Calculate correlations
  const technicalIssueSessions = sessions.filter((s: typeof sessions[number]) => s.hadTechnicalIssues).length
  const technicalIssueRate = totalSessions > 0 ? technicalIssueSessions / totalSessions : 0
  const technicalIssueCorrelation = calculateCorrelation(
    sessions.map((s: typeof sessions[number]) => (s.sessionCompleted === false && s.tutorShowed ? 1 : 0)),
    sessions.map((s: typeof sessions[number]) => (s.hadTechnicalIssues ? 1 : 0))
  )

  const churnCorrelation = tutor.aggregates 
    ? tutor.aggregates.churnProbability * rescheduleRate
    : 0

  // Determine if high risk
  const isHighRisk = rescheduleRate > 0.15 // More than 15% reschedule rate

  // Generate recommendations
  const recommendations: string[] = []
  if (isHighRisk) {
    recommendations.push(`High reschedule rate detected (${(rescheduleRate * 100).toFixed(1)}%) - investigate root causes`)
  }
  
  if (technicalIssueCorrelation > 0.5) {
    recommendations.push('Technical issues strongly correlated with reschedules - provide technical support')
  }

  const highestTimeOfDay = Object.entries(timeOfDayPattern)
    .sort(([, a], [, b]) => b - a)[0]
  if (highestTimeOfDay[1] > 0.2) {
    recommendations.push(`Reschedules peak during ${highestTimeOfDay[0]} - consider scheduling adjustments`)
  }

  const highestDay = Object.entries(dayOfWeekPattern)
    .sort(([, a], [, b]) => b - a)[0]
  if (highestDay[1] > 0.2) {
    recommendations.push(`Reschedules peak on ${highestDay[0]} - monitor availability patterns`)
  }

  if (avgRatingWhenRescheduled !== null && avgRatingWhenRescheduled < avgRatingOverall - 0.5) {
    recommendations.push('Ratings significantly lower when rescheduling - improve communication')
  }

  return {
    tutorId,
    rescheduleRate,
    rescheduleCount,
    totalSessions,
    avgRatingWhenRescheduled,
    avgRatingOverall,
    technicalIssueCorrelation,
    churnCorrelation,
    timeOfDayPattern,
    dayOfWeekPattern,
    isHighRisk,
    recommendations
  }
}

/**
 * Simple correlation calculation (Pearson correlation coefficient)
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0

  const n = x.length
  const sumX = x.reduce((sum, val) => sum + val, 0)
  const sumY = y.reduce((sum, val) => sum + val, 0)
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0)
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0)
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0)

  const numerator = n * sumXY - sumX * sumY
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

  if (denominator === 0) return 0
  return numerator / denominator
}

/**
 * Analyze correlations between reschedules and other metrics
 */
export async function analyzeRescheduleCorrelations(): Promise<RescheduleCorrelation[]> {
  const tutors = await prisma.tutor.findMany({
    where: {
      activeStatus: true
    },
    include: {
      aggregates: true
    }
  })

  // Extract data arrays
  const rescheduleRates = tutors.map((t: typeof tutors[number]) => t.rescheduleRate)
  const churnProbs = tutors.map((t: typeof tutors[number]) => t.aggregates?.churnProbability || 0)
  const ratings = tutors.map((t: typeof tutors[number]) => t.aggregates?.avgRating30d || 0)
  const reliabilityScores = tutors.map((t: typeof tutors[number]) => t.reliabilityScore)
  const technicalIssueRates = tutors.map((t: typeof tutors[number]) => t.aggregates?.technicalIssueRate || 0)
  const empathyScores = tutors.map((t: typeof tutors[number]) => t.aggregates?.avgEmpathyScore || 0)
  const engagementScores = tutors.map((t: typeof tutors[number]) => t.aggregates?.avgEngagementScore || 0)

  const correlations: RescheduleCorrelation[] = []

  // Churn correlation
  const churnCorr = calculateCorrelation(rescheduleRates, churnProbs)
  correlations.push({
    metric: 'Churn Probability',
    correlation: churnCorr,
    strength: getCorrelationStrength(churnCorr),
    insight: `Reschedules ${churnCorr > 0 ? 'positively' : 'negatively'} correlated with churn risk (r=${churnCorr.toFixed(2)})`
  })

  // Rating correlation
  const ratingCorr = calculateCorrelation(rescheduleRates, ratings)
  correlations.push({
    metric: 'Student Rating',
    correlation: ratingCorr,
    strength: getCorrelationStrength(ratingCorr),
    insight: `Reschedules ${ratingCorr < 0 ? 'negatively' : 'positively'} correlated with ratings (r=${ratingCorr.toFixed(2)})`
  })

  // Reliability correlation
  const reliabilityCorr = calculateCorrelation(rescheduleRates, reliabilityScores)
  correlations.push({
    metric: 'Reliability Score',
    correlation: reliabilityCorr,
    strength: getCorrelationStrength(reliabilityCorr),
    insight: `Reschedules ${reliabilityCorr < 0 ? 'inversely' : 'positively'} correlated with reliability (r=${reliabilityCorr.toFixed(2)})`
  })

  // Technical issues correlation
  const techCorr = calculateCorrelation(rescheduleRates, technicalIssueRates)
  correlations.push({
    metric: 'Technical Issues',
    correlation: techCorr,
    strength: getCorrelationStrength(techCorr),
    insight: `Reschedules ${techCorr > 0 ? 'positively' : 'negatively'} correlated with technical issues (r=${techCorr.toFixed(2)})`
  })

  // Empathy correlation
  const empathyCorr = calculateCorrelation(rescheduleRates, empathyScores)
  correlations.push({
    metric: 'Empathy Score',
    correlation: empathyCorr,
    strength: getCorrelationStrength(empathyCorr),
    insight: `Reschedules ${empathyCorr < 0 ? 'negatively' : 'positively'} correlated with empathy (r=${empathyCorr.toFixed(2)})`
  })

  // Engagement correlation
  const engagementCorr = calculateCorrelation(rescheduleRates, engagementScores)
  correlations.push({
    metric: 'Engagement Score',
    correlation: engagementCorr,
    strength: getCorrelationStrength(engagementCorr),
    insight: `Reschedules ${engagementCorr < 0 ? 'negatively' : 'positively'} correlated with engagement (r=${engagementCorr.toFixed(2)})`
  })

  // Sort by absolute correlation strength
  correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation))

  return correlations
}

/**
 * Get correlation strength label
 */
function getCorrelationStrength(r: number): 'strong' | 'moderate' | 'weak' | 'none' {
  const abs = Math.abs(r)
  if (abs > 0.7) return 'strong'
  if (abs > 0.4) return 'moderate'
  if (abs > 0.2) return 'weak'
  return 'none'
}

/**
 * Perform complete reliability analysis
 */
export async function performReliabilityAnalysis(
  rescheduleThreshold: number = 0.15
): Promise<ReliabilityAnalysis> {
  // Get all active tutors
  const tutors = await prisma.tutor.findMany({
    where: {
      activeStatus: true
    },
    include: {
      aggregates: true
    }
  })

  // Calculate overall metrics
  const avgRescheduleRate = tutors.reduce((sum: number, t: typeof tutors[number]) => sum + t.rescheduleRate, 0) / tutors.length
  const tutorsAboveThreshold = tutors.filter((t: typeof tutors[number]) => t.rescheduleRate > rescheduleThreshold).length

  // Get high reschedule tutors
  const highRescheduleTutorIds = tutors
    .filter((t: typeof tutors[number]) => t.rescheduleRate > rescheduleThreshold)
    .map((t: typeof tutors[number]) => t.tutorId)

  const highRescheduleTutors: RescheduleMetrics[] = []
  for (const tutorId of highRescheduleTutorIds) {
    try {
      const metrics = await analyzeTutorReliability(tutorId)
      highRescheduleTutors.push(metrics)
    } catch (error) {
      console.error(`Error analyzing tutor ${tutorId}:`, error)
    }
  }

  // Sort by reschedule rate
  highRescheduleTutors.sort((a: typeof highRescheduleTutors[number], b: typeof highRescheduleTutors[number]) => b.rescheduleRate - a.rescheduleRate)

  // Get correlations
  const correlations = await analyzeRescheduleCorrelations()

  // Analyze time of day patterns across all high-risk tutors
  const timeOfDayAggregated = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0
  }

  for (const tutor of highRescheduleTutors) {
    timeOfDayAggregated.morning += tutor.timeOfDayPattern.morning
    timeOfDayAggregated.afternoon += tutor.timeOfDayPattern.afternoon
    timeOfDayAggregated.evening += tutor.timeOfDayPattern.evening
    timeOfDayAggregated.night += tutor.timeOfDayPattern.night
  }

  // Average the rates
  const count = highRescheduleTutors.length || 1
  for (const key in timeOfDayAggregated) {
    timeOfDayAggregated[key as keyof typeof timeOfDayAggregated] /= count
  }

  // Find peak and lowest times
  const timeEntries = Object.entries(timeOfDayAggregated)
  const peakTime = timeEntries.sort(([, a], [, b]) => b - a)[0]
  const lowestTime = timeEntries.sort(([, a], [, b]) => a - b)[0]

  return {
    highRescheduleTutors,
    correlations,
    overallMetrics: {
      avgRescheduleRate,
      tutorsAboveThreshold,
      totalTutorsAnalyzed: tutors.length
    },
    timeOfDayInsights: {
      peakRescheduleTime: peakTime[0],
      lowestRescheduleTime: lowestTime[0],
      pattern: timeOfDayAggregated
    }
  }
}

/**
 * Get tutors requiring immediate attention
 */
export async function getHighRiskReliabilityTutors(): Promise<{
  tutorId: string
  rescheduleRate: number
  noShowRate: number
  combinedRisk: number
  urgency: 'critical' | 'high' | 'medium'
}[]> {
  const tutors = await prisma.tutor.findMany({
    where: {
      activeStatus: true
    },
    include: {
      sessions: {
        orderBy: {
          sessionDatetime: 'desc'
        },
        take: 30 // Last 30 sessions
      }
    }
  })

  const riskTutors = []

  for (const tutor of tutors) {
    const sessions = tutor.sessions
    if (sessions.length === 0) continue

    const noShows = sessions.filter((s: typeof sessions[number]) => !s.tutorShowed).length
    const noShowRate = noShows / sessions.length

    const combinedRisk = (tutor.rescheduleRate + noShowRate) / 2

    if (combinedRisk > 0.15) {
      let urgency: 'critical' | 'high' | 'medium'
      if (combinedRisk > 0.30) {
        urgency = 'critical'
      } else if (combinedRisk > 0.20) {
        urgency = 'high'
      } else {
        urgency = 'medium'
      }

      riskTutors.push({
        tutorId: tutor.tutorId,
        rescheduleRate: tutor.rescheduleRate,
        noShowRate,
        combinedRisk,
        urgency
      })
    }
  }

  // Sort by combined risk
  riskTutors.sort((a, b) => b.combinedRisk - a.combinedRisk)

  return riskTutors
}


