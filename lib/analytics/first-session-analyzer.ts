/**
 * First Session Analysis Engine
 * 
 * Compares tutors who had poor first sessions with the overall population
 * to identify differentiating factors and provide targeted interventions.
 */

import { prisma } from '@/lib/db'

export interface FirstSessionMetrics {
  tutorId: string
  firstSessionCount: number
  firstSessionAvgRating: number | null
  poorFirstSession: boolean
  
  // Demographic factors
  monthsExperience: number
  certificationLevel: string
  primarySubject: string
  
  // Behavioral metrics
  avgEngagement: number
  avgEmpathy: number
  avgClarity: number
  avgSatisfaction: number
  
  // Technical factors
  technicalIssueRate: number
  avgCameraOnPct: number
  avgSpeakRatio: number
  avgScreenSharePct: number
  
  // Historical performance
  overallAvgRating: number
  reliabilityScore: number
  rescheduleRate: number
}

export interface CohortComparison {
  metric: string
  poorFirstSessionAvg: number
  overallPopulationAvg: number
  difference: number
  percentDifference: number
  pValue: number
  significance: 'high' | 'medium' | 'low' | 'not_significant'
  insight: string
}

export interface FirstSessionAnalysis {
  poorFirstSessionCohort: {
    tutors: FirstSessionMetrics[]
    count: number
    avgMetrics: Record<string, number>
  }
  overallPopulation: {
    tutors: FirstSessionMetrics[]
    count: number
    avgMetrics: Record<string, number>
  }
  comparisons: CohortComparison[]
  recommendations: string[]
}

/**
 * Get first session metrics for all tutors
 */
export async function getFirstSessionMetrics(): Promise<FirstSessionMetrics[]> {
  const tutors = await prisma.tutor.findMany({
    where: {
      activeStatus: true
    },
    include: {
      aggregates: true,
      sessions: {
        where: {
          isFirstSession: true,
          sessionCompleted: true
        },
        select: {
          studentRating: true,
          engagementScore: true,
          empathyScore: true,
          clarityScore: true,
          studentSatisfaction: true,
          tutorCameraOnPct: true,
          tutorSpeakRatio: true,
          screenSharePct: true,
          hadTechnicalIssues: true
        }
      }
    }
  })

  return tutors
    .filter(t => t.aggregates && t.sessions.length > 0)
    .map(t => {
      const agg = t.aggregates!
      const firstSessions = t.sessions

      // Calculate averages from first sessions
      const validSessions = firstSessions.filter(s => 
        s.engagementScore !== null && 
        s.empathyScore !== null &&
        s.clarityScore !== null
      )

      const avgEngagement = validSessions.length > 0
        ? validSessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / validSessions.length
        : agg.avgEngagementScore

      const avgEmpathy = validSessions.length > 0
        ? validSessions.reduce((sum, s) => sum + (s.empathyScore || 0), 0) / validSessions.length
        : agg.avgEmpathyScore

      const avgClarity = validSessions.length > 0
        ? validSessions.reduce((sum, s) => sum + (s.clarityScore || 0), 0) / validSessions.length
        : agg.avgClarityScore

      const avgSatisfaction = validSessions.length > 0
        ? validSessions.reduce((sum, s) => sum + (s.studentSatisfaction || 0), 0) / validSessions.length
        : agg.avgStudentSatisfaction

      const techIssueSessions = firstSessions.filter(s => s.hadTechnicalIssues === true).length
      const technicalIssueRate = firstSessions.length > 0 ? techIssueSessions / firstSessions.length : 0

      const cameraOnSessions = firstSessions.filter(s => s.tutorCameraOnPct !== null)
      const avgCameraOnPct = cameraOnSessions.length > 0
        ? cameraOnSessions.reduce((sum, s) => sum + (s.tutorCameraOnPct || 0), 0) / cameraOnSessions.length
        : 0

      const speakRatioSessions = firstSessions.filter(s => s.tutorSpeakRatio !== null)
      const avgSpeakRatio = speakRatioSessions.length > 0
        ? speakRatioSessions.reduce((sum, s) => sum + (s.tutorSpeakRatio || 0), 0) / speakRatioSessions.length
        : 0.5

      const screenShareSessions = firstSessions.filter(s => s.screenSharePct !== null)
      const avgScreenSharePct = screenShareSessions.length > 0
        ? screenShareSessions.reduce((sum, s) => sum + (s.screenSharePct || 0), 0) / screenShareSessions.length
        : 0

      return {
        tutorId: t.tutorId,
        firstSessionCount: agg.firstSessionCount,
        firstSessionAvgRating: agg.firstSessionAvgRating,
        poorFirstSession: agg.poorFirstSessionFlag,
        monthsExperience: t.monthsExperience,
        certificationLevel: t.certificationLevel,
        primarySubject: t.primarySubject,
        avgEngagement,
        avgEmpathy,
        avgClarity,
        avgSatisfaction,
        technicalIssueRate,
        avgCameraOnPct,
        avgSpeakRatio,
        avgScreenSharePct,
        overallAvgRating: agg.avgRating30d,
        reliabilityScore: t.reliabilityScore,
        rescheduleRate: t.rescheduleRate
      }
    })
}

/**
 * Simple t-test implementation
 */
function calculateTTest(group1: number[], group2: number[]): number {
  if (group1.length < 2 || group2.length < 2) return 1.0

  const mean1 = group1.reduce((sum, v) => sum + v, 0) / group1.length
  const mean2 = group2.reduce((sum, v) => sum + v, 0) / group2.length

  const variance1 = group1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / (group1.length - 1)
  const variance2 = group2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / (group2.length - 1)

  const standardError = Math.sqrt(variance1 / group1.length + variance2 / group2.length)
  if (standardError === 0) return 1.0

  const tStatistic = Math.abs((mean1 - mean2) / standardError)

  // Rough p-value approximation
  if (tStatistic > 3.0) return 0.001
  if (tStatistic > 2.5) return 0.01
  if (tStatistic > 2.0) return 0.05
  if (tStatistic > 1.5) return 0.1
  return 0.5
}

/**
 * Compare poor first session cohort with overall population
 */
export function compareFirstSessionCohorts(
  poorCohort: FirstSessionMetrics[],
  overallPopulation: FirstSessionMetrics[]
): CohortComparison[] {
  const metrics: Array<{
    key: keyof FirstSessionMetrics
    label: string
    lowerIsBetter: boolean
  }> = [
    { key: 'monthsExperience', label: 'Months of Experience', lowerIsBetter: false },
    { key: 'avgEngagement', label: 'Engagement Score', lowerIsBetter: false },
    { key: 'avgEmpathy', label: 'Empathy Score', lowerIsBetter: false },
    { key: 'avgClarity', label: 'Clarity Score', lowerIsBetter: false },
    { key: 'avgSatisfaction', label: 'Student Satisfaction', lowerIsBetter: false },
    { key: 'technicalIssueRate', label: 'Technical Issue Rate', lowerIsBetter: true },
    { key: 'avgCameraOnPct', label: 'Camera On Percentage', lowerIsBetter: false },
    { key: 'avgSpeakRatio', label: 'Tutor Speak Ratio', lowerIsBetter: false },
    { key: 'avgScreenSharePct', label: 'Screen Share Usage', lowerIsBetter: false },
    { key: 'reliabilityScore', label: 'Reliability Score', lowerIsBetter: false },
    { key: 'rescheduleRate', label: 'Reschedule Rate', lowerIsBetter: true }
  ]

  const comparisons: CohortComparison[] = []

  for (const metric of metrics) {
    const poorValues = poorCohort
      .map(t => t[metric.key])
      .filter(v => typeof v === 'number' && !isNaN(v)) as number[]
    
    const overallValues = overallPopulation
      .map(t => t[metric.key])
      .filter(v => typeof v === 'number' && !isNaN(v)) as number[]

    if (poorValues.length === 0 || overallValues.length === 0) continue

    const poorAvg = poorValues.reduce((sum, v) => sum + v, 0) / poorValues.length
    const overallAvg = overallValues.reduce((sum, v) => sum + v, 0) / overallValues.length

    const difference = poorAvg - overallAvg
    const percentDifference = (difference / overallAvg) * 100

    const pValue = calculateTTest(poorValues, overallValues)

    let significance: CohortComparison['significance']
    if (pValue < 0.01 && Math.abs(percentDifference) > 15) {
      significance = 'high'
    } else if (pValue < 0.05 && Math.abs(percentDifference) > 10) {
      significance = 'medium'
    } else if (pValue < 0.1) {
      significance = 'low'
    } else {
      significance = 'not_significant'
    }

    let insight: string
    if (significance === 'not_significant') {
      insight = `${metric.label} is similar between cohorts`
    } else {
      const direction = metric.lowerIsBetter
        ? (poorAvg < overallAvg ? 'better' : 'worse')
        : (poorAvg > overallAvg ? 'better' : 'worse')
      
      insight = `Poor first session cohort has ${Math.abs(percentDifference).toFixed(1)}% ${direction} ${metric.label}`
    }

    comparisons.push({
      metric: metric.label,
      poorFirstSessionAvg: poorAvg,
      overallPopulationAvg: overallAvg,
      difference,
      percentDifference,
      pValue,
      significance,
      insight
    })
  }

  // Sort by significance and difference
  comparisons.sort((a, b) => {
    const sigOrder = { high: 0, medium: 1, low: 2, not_significant: 3 }
    const sigDiff = sigOrder[a.significance] - sigOrder[b.significance]
    if (sigDiff !== 0) return sigDiff
    return Math.abs(b.percentDifference) - Math.abs(a.percentDifference)
  })

  return comparisons
}

/**
 * Generate recommendations based on first session analysis
 */
export function generateFirstSessionRecommendations(
  comparisons: CohortComparison[]
): string[] {
  const recommendations: string[] = []
  const significantDiffs = comparisons.filter(c => 
    c.significance === 'high' || c.significance === 'medium'
  )

  for (const comp of significantDiffs.slice(0, 5)) {
    if (comp.metric.includes('Experience') && comp.poorFirstSessionAvg < comp.overallPopulationAvg) {
      recommendations.push('Provide enhanced onboarding for new tutors with <6 months experience')
    } else if (comp.metric.includes('Engagement') && comp.poorFirstSessionAvg < comp.overallPopulationAvg) {
      recommendations.push('Train tutors on first session engagement techniques and ice-breakers')
    } else if (comp.metric.includes('Technical') && comp.poorFirstSessionAvg > comp.overallPopulationAvg) {
      recommendations.push('Conduct technical checks before first sessions and provide IT support')
    } else if (comp.metric.includes('Camera') && comp.poorFirstSessionAvg < comp.overallPopulationAvg) {
      recommendations.push('Mandate camera usage during first sessions to build rapport')
    } else if (comp.metric.includes('Empathy') && comp.poorFirstSessionAvg < comp.overallPopulationAvg) {
      recommendations.push('Focus on empathy and active listening skills in first session training')
    } else if (comp.metric.includes('Clarity') && comp.poorFirstSessionAvg < comp.overallPopulationAvg) {
      recommendations.push('Provide clear communication guidelines and examples for first sessions')
    }
  }

  // Add general recommendations
  if (recommendations.length === 0) {
    recommendations.push('Continue monitoring first session performance')
  }

  recommendations.push('Implement first session preparation checklist for all tutors')
  recommendations.push('Follow up with tutors within 24 hours after their first session')

  return [...new Set(recommendations)] // Remove duplicates
}

/**
 * Perform complete first session analysis
 */
export async function performFirstSessionAnalysis(): Promise<FirstSessionAnalysis> {
  const allTutors = await getFirstSessionMetrics()

  const poorCohort = allTutors.filter(t => t.poorFirstSession)
  const overallPopulation = allTutors

  // Calculate average metrics for each cohort
  const calculateAvgMetrics = (tutors: FirstSessionMetrics[]): Record<string, number> => {
    if (tutors.length === 0) return {}

    return {
      avgExperience: tutors.reduce((sum, t) => sum + t.monthsExperience, 0) / tutors.length,
      avgEngagement: tutors.reduce((sum, t) => sum + t.avgEngagement, 0) / tutors.length,
      avgEmpathy: tutors.reduce((sum, t) => sum + t.avgEmpathy, 0) / tutors.length,
      avgClarity: tutors.reduce((sum, t) => sum + t.avgClarity, 0) / tutors.length,
      avgSatisfaction: tutors.reduce((sum, t) => sum + t.avgSatisfaction, 0) / tutors.length,
      avgTechnicalIssueRate: tutors.reduce((sum, t) => sum + t.technicalIssueRate, 0) / tutors.length,
      avgFirstSessionRating: tutors.reduce((sum, t) => sum + (t.firstSessionAvgRating || 0), 0) / tutors.length
    }
  }

  const comparisons = compareFirstSessionCohorts(poorCohort, overallPopulation)
  const recommendations = generateFirstSessionRecommendations(comparisons)

  return {
    poorFirstSessionCohort: {
      tutors: poorCohort,
      count: poorCohort.length,
      avgMetrics: calculateAvgMetrics(poorCohort)
    },
    overallPopulation: {
      tutors: overallPopulation,
      count: overallPopulation.length,
      avgMetrics: calculateAvgMetrics(overallPopulation)
    },
    comparisons,
    recommendations
  }
}


