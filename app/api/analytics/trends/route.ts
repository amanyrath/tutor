import { NextRequest, NextResponse } from 'next/server'
import {
  getWeeklyEngagementTrends,
  calculateMovingAverage,
  analyzeTrend,
  detectAnomalies,
  detectSeasonalPatterns,
  getCohortEngagementTrends,
  calculateRetentionCurve
} from '@/lib/analytics/time-series'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse parameters
    const analysisType = searchParams.get('type') || 'engagement'
    const tutorId = searchParams.get('tutorId') || undefined
    const days = parseInt(searchParams.get('days') || '30')
    const metricType = (searchParams.get('metric') || 'engagement') as 'engagement' | 'empathy' | 'clarity' | 'satisfaction'
    const movingAverageWindow = parseInt(searchParams.get('maWindow') || '7')
    const cohortField = searchParams.get('cohortField') as 'primarySubject' | 'certificationLevel' | 'churnRiskLevel' | null
    const cohortStartDate = searchParams.get('cohortStartDate') ? new Date(searchParams.get('cohortStartDate')!) : null

    switch (analysisType) {
      case 'engagement': {
        // Get engagement trends
        const data = await getWeeklyEngagementTrends({
          tutorId,
          days,
          metricType
        })

        // Calculate moving average
        const withMA = calculateMovingAverage(data, movingAverageWindow)

        // Analyze trend
        const trendAnalysis = analyzeTrend(data)

        // Detect anomalies
        const anomalies = detectAnomalies(data).filter(a => a.isAnomaly)

        return NextResponse.json({
          analysisType: 'engagement',
          period: { days, metricType },
          data: withMA,
          trend: trendAnalysis,
          anomalies,
          summary: {
            dataPoints: data.length,
            avgValue: data.reduce((sum, d) => sum + d.value, 0) / data.length,
            minValue: Math.min(...data.map(d => d.value)),
            maxValue: Math.max(...data.map(d => d.value)),
            trend: trendAnalysis.direction,
            anomalyCount: anomalies.length
          }
        })
      }

      case 'seasonal': {
        // Detect seasonal patterns
        const patterns = await detectSeasonalPatterns({ tutorId, days })

        // Find best and worst days
        const sorted = [...patterns].sort((a, b) => b.avgValue - a.avgValue)
        const bestDay = sorted[0]
        const worstDay = sorted[sorted.length - 1]

        return NextResponse.json({
          analysisType: 'seasonal',
          period: { days },
          patterns,
          insights: {
            bestDay: {
              day: bestDay.label,
              avgEngagement: bestDay.avgValue
            },
            worstDay: {
              day: worstDay.label,
              avgEngagement: worstDay.avgValue
            },
            variance: Math.max(...patterns.map(p => p.avgValue)) - Math.min(...patterns.map(p => p.avgValue))
          }
        })
      }

      case 'cohort': {
        if (!cohortField) {
          return NextResponse.json(
            { error: 'cohortField is required for cohort analysis' },
            { status: 400 }
          )
        }

        // Get cohort trends
        const cohorts = await getCohortEngagementTrends({
          cohortField,
          days
        })

        // Analyze each cohort
        const cohortAnalysis = Object.entries(cohorts).map(([cohortName, data]) => {
          const trend = analyzeTrend(data)
          const avgValue = data.reduce((sum, d) => sum + d.value, 0) / data.length

          return {
            cohort: cohortName,
            avgValue,
            trend: trend.direction,
            dataPoints: data.length,
            summary: trend.summary
          }
        })

        // Sort by performance
        cohortAnalysis.sort((a, b) => b.avgValue - a.avgValue)

        return NextResponse.json({
          analysisType: 'cohort',
          period: { days, cohortField },
          cohorts,
          cohortAnalysis,
          topPerformer: cohortAnalysis[0],
          bottomPerformer: cohortAnalysis[cohortAnalysis.length - 1]
        })
      }

      case 'retention': {
        if (!cohortStartDate) {
          return NextResponse.json(
            { error: 'cohortStartDate is required for retention analysis' },
            { status: 400 }
          )
        }

        // Calculate retention curve
        const retentionData = await calculateRetentionCurve({
          cohortStartDate,
          periodDays: days
        })

        return NextResponse.json({
          analysisType: 'retention',
          cohortStartDate,
          periodDays: days,
          retentionData,
          summary: {
            initialSize: retentionData[0]?.activeCount || 0,
            currentRetention: retentionData[retentionData.length - 1]?.retentionRate || 0,
            dataPoints: retentionData.length
          }
        })
      }

      default:
        return NextResponse.json(
          { error: `Unknown analysis type: ${analysisType}. Valid types: engagement, seasonal, cohort, retention` },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Error in analytics/trends:', error)
    return NextResponse.json(
      { error: 'Failed to perform trend analysis', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

