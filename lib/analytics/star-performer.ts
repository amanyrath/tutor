/**
 * Star Performer Analysis Engine
 * 
 * Identifies top-performing tutors and analyzes what differentiates them
 * from average and low-performing tutors using statistical analysis.
 */

import { prisma } from '@/lib/db'

export interface TutorPerformanceMetrics {
  tutorId: string
  compositeScore: number
  engagementScore: number
  empathyScore: number
  clarityScore: number
  satisfactionScore: number
  studentRating: number
  firstSessionRating: number | null
  recommendationRate: number
  reliabilityScore: number
  sessionsCompleted: number
  churnProbability: number
  technicalIssueRate: number
  rescheduleRate: number
  noShowCount: number
  
  // Additional context
  monthsExperience: number
  primarySubject: string
  certificationLevel: string
}

export interface PerformerSegment {
  name: 'star' | 'average' | 'lagging'
  tutors: TutorPerformanceMetrics[]
  count: number
  avgCompositeScore: number
  percentile: { min: number; max: number }
}

export interface DifferentiatingFactor {
  metric: string
  starAvg: number
  averageAvg: number
  laggingAvg: number
  effectSize: number // Cohen's d
  pValue: number
  significance: 'high' | 'medium' | 'low' | 'not_significant'
  insight: string
}

export interface StarPerformerAnalysis {
  segments: {
    star: PerformerSegment
    average: PerformerSegment
    lagging: PerformerSegment
  }
  differentiatingFactors: DifferentiatingFactor[]
  summary: {
    totalTutors: number
    starPerformers: number
    avgPerformers: number
    laggingPerformers: number
  }
}

/**
 * Calculate composite performance score
 */
function calculateCompositeScore(tutor: any): number {
  const weights = {
    engagement: 0.20,
    empathy: 0.15,
    clarity: 0.15,
    satisfaction: 0.15,
    rating: 0.20,
    reliability: 0.10,
    recommendation: 0.05
  }

  const normalizedRating = (tutor.avgRating30d / 5) * 10 // Convert to 0-10 scale
  const reliabilityPenalty = tutor.technicalIssueRate + tutor.rescheduleRate

  const score = (
    weights.engagement * tutor.avgEngagementScore +
    weights.empathy * tutor.avgEmpathyScore +
    weights.clarity * tutor.avgClarityScore +
    weights.satisfaction * tutor.avgStudentSatisfaction +
    weights.rating * normalizedRating +
    weights.reliability * (tutor.reliabilityScore * 10) +
    weights.recommendation * (tutor.recommendationRate * 10)
  ) - reliabilityPenalty

  return Math.max(0, Math.min(10, score)) // Clamp between 0-10
}

/**
 * Get all tutor performance metrics
 */
export async function getTutorPerformanceMetrics(): Promise<TutorPerformanceMetrics[]> {
  const tutors = await prisma.tutor.findMany({
    where: {
      activeStatus: true
    },
    include: {
      aggregates: true
    }
  })

  return tutors
    .filter(t => t.aggregates) // Only include tutors with aggregate data
    .map(t => {
      const agg = t.aggregates!
      const compositeScore = calculateCompositeScore(agg)

      return {
        tutorId: t.tutorId,
        compositeScore,
        engagementScore: agg.avgEngagementScore,
        empathyScore: agg.avgEmpathyScore,
        clarityScore: agg.avgClarityScore,
        satisfactionScore: agg.avgStudentSatisfaction,
        studentRating: agg.avgRating30d,
        firstSessionRating: agg.firstSessionAvgRating,
        recommendationRate: agg.recommendationRate,
        reliabilityScore: t.reliabilityScore,
        sessionsCompleted: agg.totalSessions30d,
        churnProbability: agg.churnProbability,
        technicalIssueRate: agg.technicalIssueRate,
        rescheduleRate: t.rescheduleRate,
        noShowCount: t.noShowCount,
        monthsExperience: t.monthsExperience,
        primarySubject: t.primarySubject,
        certificationLevel: t.certificationLevel
      }
    })
}

/**
 * Segment tutors into star, average, and lagging performers
 */
export function segmentPerformers(
  tutors: TutorPerformanceMetrics[]
): StarPerformerAnalysis['segments'] {
  // Sort by composite score
  const sorted = [...tutors].sort((a, b) => b.compositeScore - a.compositeScore)

  // Define segments: top 10%, middle 80%, bottom 10%
  const starCount = Math.max(1, Math.ceil(sorted.length * 0.10))
  const laggingCount = Math.max(1, Math.ceil(sorted.length * 0.10))

  const starTutors = sorted.slice(0, starCount)
  const laggingTutors = sorted.slice(-laggingCount)
  const averageTutors = sorted.slice(starCount, sorted.length - laggingCount)

  return {
    star: {
      name: 'star',
      tutors: starTutors,
      count: starTutors.length,
      avgCompositeScore: starTutors.reduce((sum, t) => sum + t.compositeScore, 0) / starTutors.length,
      percentile: { min: 90, max: 100 }
    },
    average: {
      name: 'average',
      tutors: averageTutors,
      count: averageTutors.length,
      avgCompositeScore: averageTutors.reduce((sum, t) => sum + t.compositeScore, 0) / averageTutors.length,
      percentile: { min: 10, max: 90 }
    },
    lagging: {
      name: 'lagging',
      tutors: laggingTutors,
      count: laggingTutors.length,
      avgCompositeScore: laggingTutors.reduce((sum, t) => sum + t.compositeScore, 0) / laggingTutors.length,
      percentile: { min: 0, max: 10 }
    }
  }
}

/**
 * Calculate Cohen's d effect size
 */
function calculateCohenD(group1: number[], group2: number[]): number {
  const mean1 = group1.reduce((sum, v) => sum + v, 0) / group1.length
  const mean2 = group2.reduce((sum, v) => sum + v, 0) / group2.length

  const variance1 = group1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / (group1.length - 1)
  const variance2 = group2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / (group2.length - 1)

  const pooledStdDev = Math.sqrt((variance1 + variance2) / 2)

  return (mean1 - mean2) / pooledStdDev
}

/**
 * Perform t-test and calculate p-value
 * Simplified implementation - for production, use a statistics library
 */
function performTTest(group1: number[], group2: number[]): number {
  const mean1 = group1.reduce((sum, v) => sum + v, 0) / group1.length
  const mean2 = group2.reduce((sum, v) => sum + v, 0) / group2.length

  const variance1 = group1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / (group1.length - 1)
  const variance2 = group2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / (group2.length - 1)

  const standardError = Math.sqrt(variance1 / group1.length + variance2 / group2.length)
  const tStatistic = Math.abs((mean1 - mean2) / standardError)

  // Rough approximation of p-value from t-statistic
  // For more accurate results, use a proper statistics library
  if (tStatistic > 3.0) return 0.001
  if (tStatistic > 2.5) return 0.01
  if (tStatistic > 2.0) return 0.05
  if (tStatistic > 1.5) return 0.1
  return 0.5
}

/**
 * Analyze differentiating factors between performer segments
 */
export function analyzeDifferentiatingFactors(
  segments: StarPerformerAnalysis['segments']
): DifferentiatingFactor[] {
  const metrics: Array<{
    key: keyof TutorPerformanceMetrics
    label: string
    higherIsBetter: boolean
  }> = [
    { key: 'engagementScore', label: 'Engagement Score', higherIsBetter: true },
    { key: 'empathyScore', label: 'Empathy Score', higherIsBetter: true },
    { key: 'clarityScore', label: 'Clarity Score', higherIsBetter: true },
    { key: 'satisfactionScore', label: 'Student Satisfaction', higherIsBetter: true },
    { key: 'studentRating', label: 'Student Rating', higherIsBetter: true },
    { key: 'recommendationRate', label: 'Recommendation Rate', higherIsBetter: true },
    { key: 'reliabilityScore', label: 'Reliability Score', higherIsBetter: true },
    { key: 'firstSessionRating', label: 'First Session Rating', higherIsBetter: true },
    { key: 'technicalIssueRate', label: 'Technical Issue Rate', higherIsBetter: false },
    { key: 'rescheduleRate', label: 'Reschedule Rate', higherIsBetter: false },
    { key: 'noShowCount', label: 'No-Show Count', higherIsBetter: false },
    { key: 'monthsExperience', label: 'Months of Experience', higherIsBetter: true }
  ]

  const factors: DifferentiatingFactor[] = []

  for (const metric of metrics) {
    // Extract values for each segment
    const starValues = segments.star.tutors
      .map(t => t[metric.key])
      .filter(v => v !== null && v !== undefined) as number[]
    
    const averageValues = segments.average.tutors
      .map(t => t[metric.key])
      .filter(v => v !== null && v !== undefined) as number[]
    
    const laggingValues = segments.lagging.tutors
      .map(t => t[metric.key])
      .filter(v => v !== null && v !== undefined) as number[]

    if (starValues.length === 0 || averageValues.length === 0) continue

    // Calculate averages
    const starAvg = starValues.reduce((sum, v) => sum + v, 0) / starValues.length
    const averageAvg = averageValues.reduce((sum, v) => sum + v, 0) / averageValues.length
    const laggingAvg = laggingValues.length > 0
      ? laggingValues.reduce((sum, v) => sum + v, 0) / laggingValues.length
      : averageAvg

    // Calculate effect size (Cohen's d)
    const effectSize = calculateCohenD(starValues, averageValues)

    // Calculate p-value
    const pValue = performTTest(starValues, averageValues)

    // Determine significance
    let significance: DifferentiatingFactor['significance']
    if (pValue < 0.01 && Math.abs(effectSize) > 0.8) {
      significance = 'high'
    } else if (pValue < 0.05 && Math.abs(effectSize) > 0.5) {
      significance = 'medium'
    } else if (pValue < 0.1) {
      significance = 'low'
    } else {
      significance = 'not_significant'
    }

    // Generate insight
    const diff = Math.abs(starAvg - averageAvg)
    const percentDiff = ((starAvg - averageAvg) / averageAvg * 100).toFixed(1)
    
    let insight: string
    if (significance === 'not_significant') {
      insight = `${metric.label} shows no significant difference between star and average performers`
    } else {
      const direction = metric.higherIsBetter 
        ? (starAvg > averageAvg ? 'higher' : 'lower')
        : (starAvg < averageAvg ? 'lower' : 'higher')
      
      insight = `Star performers have ${percentDiff}% ${direction} ${metric.label} (effect size: ${effectSize.toFixed(2)})`
    }

    factors.push({
      metric: metric.label,
      starAvg,
      averageAvg,
      laggingAvg,
      effectSize,
      pValue,
      significance,
      insight
    })
  }

  // Sort by significance and effect size
  factors.sort((a, b) => {
    const sigOrder = { high: 0, medium: 1, low: 2, not_significant: 3 }
    const sigDiff = sigOrder[a.significance] - sigOrder[b.significance]
    if (sigDiff !== 0) return sigDiff
    return Math.abs(b.effectSize) - Math.abs(a.effectSize)
  })

  return factors
}

/**
 * Perform complete star performer analysis
 */
export async function performStarPerformerAnalysis(): Promise<StarPerformerAnalysis> {
  // Get all tutor metrics
  const tutors = await getTutorPerformanceMetrics()

  // Segment performers
  const segments = segmentPerformers(tutors)

  // Analyze differentiating factors
  const differentiatingFactors = analyzeDifferentiatingFactors(segments)

  return {
    segments,
    differentiatingFactors,
    summary: {
      totalTutors: tutors.length,
      starPerformers: segments.star.count,
      avgPerformers: segments.average.count,
      laggingPerformers: segments.lagging.count
    }
  }
}

/**
 * Get targeted recommendations for a specific tutor segment
 */
export function getSegmentRecommendations(
  segment: 'star' | 'average' | 'lagging',
  differentiatingFactors: DifferentiatingFactor[]
): string[] {
  const recommendations: string[] = []

  // Get top 3 most significant differentiating factors
  const topFactors = differentiatingFactors
    .filter(f => f.significance === 'high' || f.significance === 'medium')
    .slice(0, 3)

  switch (segment) {
    case 'star':
      recommendations.push('Continue current best practices')
      recommendations.push('Consider mentoring other tutors')
      recommendations.push('Share successful strategies with team')
      break

    case 'average':
      for (const factor of topFactors) {
        if (factor.starAvg > factor.averageAvg) {
          recommendations.push(`Focus on improving ${factor.metric} to match star performers`)
        }
      }
      if (recommendations.length === 0) {
        recommendations.push('Maintain current performance levels')
      }
      break

    case 'lagging':
      recommendations.push('Immediate intervention required')
      for (const factor of topFactors) {
        if (factor.laggingAvg < factor.averageAvg) {
          recommendations.push(`Critical: Address ${factor.metric} performance gap`)
        }
      }
      recommendations.push('Consider additional training and support')
      break
  }

  return recommendations
}


