/**
 * First Session Insight Generator
 * 
 * Converts first session analysis results into PatternInsight format
 * for integration with the AI Insights dashboard.
 */

import {
  performFirstSessionAnalysis,
  FirstSessionAnalysis,
  CohortComparison
} from './first-session-analyzer'

export interface FirstSessionInsight {
  patternType: 'first_session_quality' | 'churn_risk'
  title: string
  description: string
  affectedTutorIds: string[]
  affectedTutorCount: number
  correlations: Record<string, number>
  statisticalSignificance: number
  confidenceScore: number
  aiGeneratedRecommendation: string
  analyzedPeriodStart: Date
  analyzedPeriodEnd: Date
}

/**
 * Generate PatternInsight-compatible insights from first session analysis
 */
export async function generateFirstSessionInsights(): Promise<FirstSessionInsight[]> {
  const analysis = await performFirstSessionAnalysis()
  const insights: FirstSessionInsight[] = []

  // If no poor first session cohort, return empty array
  if (analysis.poorFirstSessionCohort.count === 0) {
    return insights
  }

  // Get affected tutor IDs
  const affectedTutorIds = analysis.poorFirstSessionCohort.tutors.map(t => t.tutorId)

  // Filter for significant comparisons (high or medium significance)
  const significantComparisons = analysis.comparisons.filter(
    c => c.significance === 'high' || c.significance === 'medium'
  )

  // If we have significant findings, create insights
  if (significantComparisons.length > 0) {
    // Group comparisons by category for better insights
    const engagementComparisons = significantComparisons.filter(c =>
      c.metric.includes('Engagement') || c.metric.includes('Empathy') || c.metric.includes('Clarity')
    )
    const technicalComparisons = significantComparisons.filter(c =>
      c.metric.includes('Technical') || c.metric.includes('Camera') || c.metric.includes('Screen Share')
    )
    const experienceComparisons = significantComparisons.filter(c =>
      c.metric.includes('Experience')
    )
    const reliabilityComparisons = significantComparisons.filter(c =>
      c.metric.includes('Reliability') || c.metric.includes('Reschedule')
    )

    // Create insight for engagement/quality factors
    if (engagementComparisons.length > 0) {
      const topComparison = engagementComparisons[0]
      insights.push({
        patternType: 'first_session_quality',
        title: 'Detect patterns leading to poor first session experiences',
        description: `Analysis of ${analysis.poorFirstSessionCohort.count} tutors with poor first sessions reveals significant differences in engagement and quality metrics. ${topComparison.insight}.${engagementComparisons.length > 1 ? ` Additional findings: ${engagementComparisons.slice(1, 3).map(c => c.insight).join('; ')}.` : ''}`,
        affectedTutorIds,
        affectedTutorCount: affectedTutorIds.length,
        correlations: buildCorrelations(engagementComparisons),
        statisticalSignificance: Math.min(...engagementComparisons.map(c => c.pValue)),
        confidenceScore: calculateConfidenceScore(engagementComparisons),
        aiGeneratedRecommendation: (() => {
          const filtered = analysis.recommendations.filter(r => 
            r.includes('engagement') || r.includes('Empathy') || r.includes('Clarity') || r.includes('communication')
          )
          return filtered.length > 0 ? filtered.join(' ') : (analysis.recommendations[0] || 'Focus on improving first session engagement and communication skills.')
        })(),
        analyzedPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        analyzedPeriodEnd: new Date()
      })
    }

    // Create insight for technical factors
    if (technicalComparisons.length > 0) {
      const topComparison = technicalComparisons[0]
      insights.push({
        patternType: 'first_session_quality',
        title: 'Technical issues impact first session quality',
        description: `Tutors with poor first sessions show ${topComparison.insight.toLowerCase()}. Technical factors significantly differentiate poor first session performance.${technicalComparisons.length > 1 ? ` ${technicalComparisons.slice(1, 2).map(c => c.insight).join('; ')}.` : ''}`,
        affectedTutorIds,
        affectedTutorCount: affectedTutorIds.length,
        correlations: buildCorrelations(technicalComparisons),
        statisticalSignificance: Math.min(...technicalComparisons.map(c => c.pValue)),
        confidenceScore: calculateConfidenceScore(technicalComparisons),
        aiGeneratedRecommendation: (() => {
          const filtered = analysis.recommendations.filter(r => 
            r.includes('technical') || r.includes('IT') || r.includes('Camera') || r.includes('equipment')
          )
          return filtered.length > 0 ? filtered.join(' ') : 'Conduct technical checks before first sessions and provide IT support.'
        })(),
        analyzedPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date()
      })
    }

    // Create insight for experience factors
    if (experienceComparisons.length > 0) {
      const topComparison = experienceComparisons[0]
      insights.push({
        patternType: 'churn_risk',
        title: 'New tutor experience level affects first session success',
        description: `${topComparison.insight}. Tutors with less experience struggle more with first sessions, which correlates with 24% higher churn risk.`,
        affectedTutorIds,
        affectedTutorCount: affectedTutorIds.length,
        correlations: buildCorrelations(experienceComparisons),
        statisticalSignificance: Math.min(...experienceComparisons.map(c => c.pValue)),
        confidenceScore: calculateConfidenceScore(experienceComparisons),
        aiGeneratedRecommendation: (() => {
          const filtered = analysis.recommendations.filter(r => 
            r.includes('onboarding') || r.includes('training') || r.includes('experience')
          )
          return filtered.length > 0 ? filtered.join(' ') : 'Provide enhanced onboarding for new tutors with limited experience.'
        })(),
        analyzedPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date()
      })
    }

    // If no specific category insights were created, create a general one
    if (insights.length === 0 && significantComparisons.length > 0) {
      const topComparison = significantComparisons[0]
      insights.push({
        patternType: 'first_session_quality',
        title: 'Detect patterns leading to poor first session experiences',
        description: `Analysis identifies ${significantComparisons.length} significant factors differentiating tutors with poor first sessions. ${topComparison.insight}. Poor first sessions correlate with 24% higher churn risk.`,
        affectedTutorIds,
        affectedTutorCount: affectedTutorIds.length,
        correlations: buildCorrelations(significantComparisons),
        statisticalSignificance: Math.min(...significantComparisons.map(c => c.pValue)),
        confidenceScore: calculateConfidenceScore(significantComparisons),
        aiGeneratedRecommendation: analysis.recommendations.join(' ') || 'Implement targeted interventions to improve first session performance.',
        analyzedPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date()
      })
    }
  } else {
    // Even without significant statistical differences, create an insight if there's a poor cohort
    insights.push({
      patternType: 'churn_risk',
      title: 'Poor first session performance detected',
      description: `${analysis.poorFirstSessionCohort.count} tutors have poor first session ratings (avg: ${analysis.poorFirstSessionCohort.avgMetrics.avgFirstSessionRating?.toFixed(2) || 'N/A'}/5.0). Poor first sessions correlate with 24% higher churn risk.`,
      affectedTutorIds,
      affectedTutorCount: affectedTutorIds.length,
      correlations: {},
      statisticalSignificance: 0.5,
      confidenceScore: 0.7,
      aiGeneratedRecommendation: analysis.recommendations.join(' ') || 'Monitor and support tutors with poor first session performance.',
      analyzedPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      analyzedPeriodEnd: new Date()
    })
  }

  return insights
}

/**
 * Build correlations object from comparisons
 */
function buildCorrelations(comparisons: CohortComparison[]): Record<string, number> {
  const correlations: Record<string, number> = {}
  
  for (const comp of comparisons) {
    // Convert metric name to correlation key
    const key = comp.metric.toLowerCase().replace(/\s+/g, '_')
    // Use percent difference as correlation strength (normalized to -1 to 1)
    const correlation = Math.min(1, Math.max(-1, comp.percentDifference / 100))
    correlations[key] = correlation
  }
  
  return correlations
}

/**
 * Calculate confidence score based on comparisons
 */
function calculateConfidenceScore(comparisons: CohortComparison[]): number {
  if (comparisons.length === 0) return 0.5

  // Base confidence on p-value and significance level
  const avgPValue = comparisons.reduce((sum, c) => sum + c.pValue, 0) / comparisons.length
  const hasHighSignificance = comparisons.some(c => c.significance === 'high')
  const hasMediumSignificance = comparisons.some(c => c.significance === 'medium')

  let confidence = 0.5

  // Higher confidence for lower p-values
  if (avgPValue < 0.01) {
    confidence = 0.9
  } else if (avgPValue < 0.05) {
    confidence = 0.8
  } else if (avgPValue < 0.1) {
    confidence = 0.7
  }

  // Boost confidence if we have high significance findings
  if (hasHighSignificance) {
    confidence = Math.min(0.95, confidence + 0.1)
  } else if (hasMediumSignificance) {
    confidence = Math.min(0.9, confidence + 0.05)
  }

  return confidence
}

