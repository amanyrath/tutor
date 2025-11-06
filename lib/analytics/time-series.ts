/**
 * Time Series Analytics Library
 * 
 * Provides query-time analysis functions for engagement trends, moving averages,
 * seasonal patterns, and anomaly detection - all computed on-demand from the
 * sessions and engagement_events tables.
 */

import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export interface TimeSeriesDataPoint {
  date: Date
  value: number
  count?: number
}

export interface MovingAverageResult {
  date: Date
  value: number
  movingAverage: number
}

export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable'
  slope: number
  confidence: number
  summary: string
}

export interface AnomalyDetection {
  date: Date
  value: number
  isAnomaly: boolean
  severity: 'low' | 'medium' | 'high'
  expectedRange: { min: number; max: number }
}

/**
 * Get weekly engagement trends for a tutor or all tutors
 */
export async function getWeeklyEngagementTrends(options: {
  tutorId?: string
  days?: number
  metricType?: 'engagement' | 'empathy' | 'clarity' | 'satisfaction'
}): Promise<TimeSeriesDataPoint[]> {
  const {
    tutorId,
    days = 30,
    metricType = 'engagement'
  } = options

  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  const metricColumn = Prisma.raw(`${metricType}_score`)

  // Query sessions table and aggregate by date
  const results = await prisma.$queryRaw<Array<{date: Date, avg_value: number, count: bigint}>>(
    Prisma.sql`
    SELECT 
      DATE(session_datetime) as date,
      AVG(${metricColumn}) as avg_value,
      COUNT(*) as count
    FROM sessions
    WHERE session_completed = true
      AND session_datetime >= ${dateThreshold}
      AND ${metricColumn} IS NOT NULL
      ${tutorId ? Prisma.sql`AND tutor_id = ${tutorId}` : Prisma.empty}
    GROUP BY DATE(session_datetime)
    ORDER BY date ASC
  `)

  return results.map(r => ({
    date: r.date,
    value: Number(r.avg_value),
    count: Number(r.count)
  }))
}

/**
 * Calculate moving average for a time series
 */
export function calculateMovingAverage(
  data: TimeSeriesDataPoint[],
  windowSize: number = 7
): MovingAverageResult[] {
  if (data.length < windowSize) {
    return data.map(d => ({
      date: d.date,
      value: d.value,
      movingAverage: d.value
    }))
  }

  const results: MovingAverageResult[] = []

  for (let i = 0; i < data.length; i++) {
    const startIdx = Math.max(0, i - windowSize + 1)
    const window = data.slice(startIdx, i + 1)
    const avg = window.reduce((sum, d) => sum + d.value, 0) / window.length

    results.push({
      date: data[i].date,
      value: data[i].value,
      movingAverage: avg
    })
  }

  return results
}

/**
 * Analyze trend direction using linear regression
 */
export function analyzeTrend(data: TimeSeriesDataPoint[]): TrendAnalysis {
  if (data.length < 2) {
    return {
      direction: 'stable',
      slope: 0,
      confidence: 0,
      summary: 'Insufficient data for trend analysis'
    }
  }

  // Simple linear regression
  const n = data.length
  const xValues = data.map((_, i) => i)
  const yValues = data.map(d => d.value)

  const sumX = xValues.reduce((a, b) => a + b, 0)
  const sumY = yValues.reduce((a, b) => a + b, 0)
  const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0)
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  
  // Calculate R² for confidence
  const meanY = sumY / n
  const ssTotal = yValues.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0)
  const predictedY = xValues.map(x => slope * x + (sumY - slope * sumX) / n)
  const ssResidual = yValues.reduce((sum, y, i) => sum + Math.pow(y - predictedY[i], 2), 0)
  const rSquared = 1 - (ssResidual / ssTotal)

  // Determine direction
  let direction: 'increasing' | 'decreasing' | 'stable'
  const threshold = 0.01 // Minimum slope to consider as a trend

  if (Math.abs(slope) < threshold) {
    direction = 'stable'
  } else if (slope > 0) {
    direction = 'increasing'
  } else {
    direction = 'decreasing'
  }

  // Create summary
  const changePercent = Math.abs((slope * (n - 1) / meanY) * 100).toFixed(1)
  let summary: string

  if (direction === 'stable') {
    summary = `Stable trend with minimal change (${changePercent}%)`
  } else if (direction === 'increasing') {
    summary = `Increasing trend with ${changePercent}% growth over period`
  } else {
    summary = `Decreasing trend with ${changePercent}% decline over period`
  }

  return {
    direction,
    slope,
    confidence: rSquared,
    summary
  }
}

/**
 * Detect anomalies using standard deviation method
 */
export function detectAnomalies(
  data: TimeSeriesDataPoint[],
  sensitivity: number = 2.0
): AnomalyDetection[] {
  if (data.length < 3) {
    return data.map(d => ({
      date: d.date,
      value: d.value,
      isAnomaly: false,
      severity: 'low' as const,
      expectedRange: { min: d.value, max: d.value }
    }))
  }

  // Calculate mean and standard deviation
  const values = data.map(d => d.value)
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
  const stdDev = Math.sqrt(variance)

  // Detect anomalies
  return data.map(d => {
    const zScore = Math.abs((d.value - mean) / stdDev)
    const isAnomaly = zScore > sensitivity

    let severity: 'low' | 'medium' | 'high'
    if (zScore > sensitivity * 1.5) {
      severity = 'high'
    } else if (zScore > sensitivity) {
      severity = 'medium'
    } else {
      severity = 'low'
    }

    return {
      date: d.date,
      value: d.value,
      isAnomaly,
      severity,
      expectedRange: {
        min: mean - sensitivity * stdDev,
        max: mean + sensitivity * stdDev
      }
    }
  })
}

/**
 * Detect seasonal patterns (day of week effects)
 */
export async function detectSeasonalPatterns(options: {
  tutorId?: string
  days?: number
}): Promise<{ dayOfWeek: number; avgValue: number; label: string }[]> {
  const { tutorId, days = 90 } = options

  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  const results = await prisma.$queryRaw<Array<{day_of_week: number, avg_engagement: number, count: bigint}>>(
    Prisma.sql`
    SELECT 
      EXTRACT(DOW FROM session_datetime)::int as day_of_week,
      AVG(engagement_score) as avg_engagement,
      COUNT(*) as count
    FROM sessions
    WHERE session_completed = true
      AND session_datetime >= ${dateThreshold}
      AND engagement_score IS NOT NULL
      ${tutorId ? Prisma.sql`AND tutor_id = ${tutorId}` : Prisma.empty}
    GROUP BY EXTRACT(DOW FROM session_datetime)
    ORDER BY day_of_week ASC
  `)

  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return results.map(r => ({
    dayOfWeek: Number(r.day_of_week),
    avgValue: Number(r.avg_engagement),
    label: dayLabels[Number(r.day_of_week)]
  }))
}

/**
 * Get cohort engagement trends (compare different tutor segments)
 */
export async function getCohortEngagementTrends(options: {
  cohortField: 'primarySubject' | 'certificationLevel' | 'churnRiskLevel'
  days?: number
}): Promise<Record<string, TimeSeriesDataPoint[]>> {
  const { cohortField, days = 30 } = options

  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  let field: string
  switch (cohortField) {
    case 'primarySubject':
      field = 't.primary_subject'
      break
    case 'certificationLevel':
      field = 't.certification_level'
      break
    case 'churnRiskLevel':
      field = 'ta.churn_risk_level'
      break
  }

  const fieldRaw = Prisma.raw(field)

  const results = await prisma.$queryRaw<Array<{
    cohort: string
    date: Date
    avg_engagement: number
    count: bigint
  }>>(
    Prisma.sql`
    SELECT 
      ${fieldRaw} as cohort,
      DATE(s.session_datetime) as date,
      AVG(s.engagement_score) as avg_engagement,
      COUNT(*) as count
    FROM sessions s
    JOIN tutors t ON s.tutor_id = t.tutor_id
    ${cohortField === 'churnRiskLevel' ? Prisma.sql`LEFT JOIN tutor_aggregates ta ON t.tutor_id = ta.tutor_id` : Prisma.empty}
    WHERE s.session_completed = true
      AND s.session_datetime >= ${dateThreshold}
      AND s.engagement_score IS NOT NULL
    GROUP BY ${fieldRaw}, DATE(s.session_datetime)
    ORDER BY cohort, date ASC
  `)

  // Group by cohort
  const cohorts: Record<string, TimeSeriesDataPoint[]> = {}

  results.forEach(r => {
    if (!cohorts[r.cohort]) {
      cohorts[r.cohort] = []
    }
    cohorts[r.cohort].push({
      date: r.date,
      value: Number(r.avg_engagement),
      count: Number(r.count)
    })
  })

  return cohorts
}

/**
 * Calculate retention curve (how many tutors remain active over time)
 */
export async function calculateRetentionCurve(options: {
  cohortStartDate: Date
  periodDays?: number
}): Promise<{ daysSinceStart: number; activeCount: number; retentionRate: number }[]> {
  const { cohortStartDate, periodDays = 90 } = options

  const cohortEndDate = new Date(cohortStartDate)
  cohortEndDate.setDate(cohortEndDate.getDate() + 1)

  // Get tutors who were active on the cohort start date
  const cohortTutors = await prisma.tutor.findMany({
    where: {
      createdAt: {
        gte: cohortStartDate,
        lt: cohortEndDate
      }
    },
    select: {
      tutorId: true
    }
  })

  const cohortSize = cohortTutors.length
  const tutorIds = cohortTutors.map(t => t.tutorId)

  if (cohortSize === 0) {
    return []
  }

  // Check activity for each week after cohort start
  const results = []
  const weeksToCheck = Math.ceil(periodDays / 7)

  for (let week = 0; week <= weeksToCheck; week++) {
    const checkDate = new Date(cohortStartDate)
    checkDate.setDate(checkDate.getDate() + week * 7)

    const weekStart = new Date(checkDate)
    const weekEnd = new Date(checkDate)
    weekEnd.setDate(weekEnd.getDate() + 7)

    // Count how many cohort tutors had sessions in this week
    const activeTutorCount = await prisma.session.groupBy({
      by: ['tutorId'],
      where: {
        tutorId: { in: tutorIds },
        sessionDatetime: {
          gte: weekStart,
          lt: weekEnd
        },
        sessionCompleted: true
      }
    })

    results.push({
      daysSinceStart: week * 7,
      activeCount: activeTutorCount.length,
      retentionRate: (activeTutorCount.length / cohortSize) * 100
    })
  }

  return results
}

