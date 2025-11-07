#!/usr/bin/env tsx

/**
 * Pattern Discovery Script
 * 
 * Analyzes tutor engagement data from the past week using AI
 * to discover patterns that lead to engagement changes.
 * 
 * Usage:
 *   npx tsx scripts/discover-patterns.ts
 */

import { prisma } from '../lib/db'
import { analyzePatterns } from '../lib/ai/pattern-analyzer'
import { generateFirstSessionInsights } from '../lib/analytics/first-session-insight-generator'

interface WeekMetrics {
  avgEngagement: number
  avgRating: number
  totalSessions: number
  activeTutors: number
  avgSessionsPerTutor: number
  churnRate: number
}

async function getWeekMetrics(startDate: Date, endDate: Date): Promise<WeekMetrics> {
  const sessions = await prisma.session.findMany({
    where: {
      sessionDatetime: {
        gte: startDate,
        lt: endDate
      },
      sessionCompleted: true
    },
    include: {
      tutor: {
        include: {
          aggregates: true
        }
      }
    }
  })

  const uniqueTutors = new Set(sessions.map(s => s.tutorId))
  const engagementScores = sessions.filter(s => s.engagementScore).map(s => s.engagementScore!)
  const ratings = sessions.filter(s => s.studentRating).map(s => s.studentRating!)

  const tutorsWithHighChurn = sessions
    .filter(s => s.tutor.aggregates && s.tutor.aggregates.churnRiskLevel === 'High')
    .map(s => s.tutorId)

  return {
    avgEngagement: engagementScores.reduce((sum, s) => sum + s, 0) / engagementScores.length,
    avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
    totalSessions: sessions.length,
    activeTutors: uniqueTutors.size,
    avgSessionsPerTutor: sessions.length / uniqueTutors.size,
    churnRate: new Set(tutorsWithHighChurn).size / uniqueTutors.size
  }
}

async function getTopPerformers(startDate: Date, endDate: Date, limit: number = 10) {
  const tutorsWithMetrics = await prisma.tutor.findMany({
    where: {
      activeStatus: true,
      sessions: {
        some: {
          sessionDatetime: {
            gte: startDate,
            lt: endDate
          },
          sessionCompleted: true
        }
      }
    },
    include: {
      aggregates: true,
      sessions: {
        where: {
          sessionDatetime: {
            gte: startDate,
            lt: endDate
          },
          sessionCompleted: true
        }
      }
    }
  })

  // Calculate weekly performance score
  const tutorScores = tutorsWithMetrics.map(tutor => {
    const sessions = tutor.sessions
    const avgEngagement = sessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / sessions.length
    const avgRating = sessions.reduce((sum, s) => sum + (s.studentRating || 0), 0) / sessions.length

    return {
      tutorId: tutor.tutorId,
      weeklyScore: avgEngagement * 0.5 + avgRating * 2 * 0.5, // Normalize rating to 0-10 scale
      sessionsCompleted: sessions.length,
      avgEngagement,
      avgRating,
      monthsExperience: tutor.monthsExperience,
      primarySubject: tutor.primarySubject
    }
  })

  return tutorScores
    .sort((a, b) => b.weeklyScore - a.weeklyScore)
    .slice(0, limit)
}

async function getDecliningTutors(currentWeekStart: Date, previousWeekStart: Date, limit: number = 10) {
  const currentWeekEnd = new Date(currentWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
  const previousWeekEnd = new Date(previousWeekStart.getTime() + 7 * 24 * 60 * 60 * 1000)

  const tutors = await prisma.tutor.findMany({
    where: {
      activeStatus: true
    },
    include: {
      aggregates: true,
      sessions: {
        where: {
          sessionCompleted: true,
          sessionDatetime: {
            gte: previousWeekStart,
            lt: currentWeekEnd
          }
        }
      }
    }
  })

  const declines = tutors.map(tutor => {
    const currentWeekSessions = tutor.sessions.filter(
      s => s.sessionDatetime >= currentWeekStart && s.sessionDatetime < currentWeekEnd
    )
    const previousWeekSessions = tutor.sessions.filter(
      s => s.sessionDatetime >= previousWeekStart && s.sessionDatetime < previousWeekEnd
    )

    if (previousWeekSessions.length === 0) return null

    const currentAvgEng = currentWeekSessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / (currentWeekSessions.length || 1)
    const previousAvgEng = previousWeekSessions.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / previousWeekSessions.length

    const decline = previousAvgEng - currentAvgEng

    return {
      tutorId: tutor.tutorId,
      decline,
      currentEngagement: currentAvgEng,
      previousEngagement: previousAvgEng,
      sessionCountChange: currentWeekSessions.length - previousWeekSessions.length,
      churnRisk: tutor.aggregates?.churnRiskLevel || 'Unknown'
    }
  })

  return declines
    .filter(d => d !== null && d.decline > 0.5) // Significant decline
    .sort((a, b) => b!.decline - a!.decline)
    .slice(0, limit)
}

function calculateCorrelationMatrix(tutors: any[]): Record<string, Record<string, number>> {
  // Simplified correlation calculation
  const metrics = [
    'avgEngagement',
    'avgRating',
    'sessionsCompleted',
    'monthsExperience',
    'rescheduleRate',
    'technicalIssueRate'
  ]

  const matrix: Record<string, Record<string, number>> = {}

  for (const metric1 of metrics) {
    matrix[metric1] = {}
    for (const metric2 of metrics) {
      if (metric1 === metric2) {
        matrix[metric1][metric2] = 1.0
      } else {
        // Simple correlation calculation (Pearson's r)
        const values1 = tutors.map(t => t[metric1] || 0)
        const values2 = tutors.map(t => t[metric2] || 0)

        const mean1 = values1.reduce((sum, v) => sum + v, 0) / values1.length
        const mean2 = values2.reduce((sum, v) => sum + v, 0) / values2.length

        let numerator = 0
        let denom1 = 0
        let denom2 = 0

        for (let i = 0; i < values1.length; i++) {
          const diff1 = values1[i] - mean1
          const diff2 = values2[i] - mean2
          numerator += diff1 * diff2
          denom1 += diff1 * diff1
          denom2 += diff2 * diff2
        }

        const correlation = numerator / (Math.sqrt(denom1) * Math.sqrt(denom2))
        matrix[metric1][metric2] = isNaN(correlation) ? 0 : correlation
      }
    }
  }

  return matrix
}

async function main() {
  console.log('=== Pattern Discovery Script ===')
  console.log(`Started at: ${new Date().toISOString()}\n`)

  try {
    // Define time periods
    const currentWeekStart = new Date()
    currentWeekStart.setDate(currentWeekStart.getDate() - 7)
    currentWeekStart.setHours(0, 0, 0, 0)

    const previousWeekStart = new Date(currentWeekStart)
    previousWeekStart.setDate(previousWeekStart.getDate() - 7)

    const currentWeekEnd = new Date(currentWeekStart)
    currentWeekEnd.setDate(currentWeekEnd.getDate() + 7)

    const previousWeekEnd = new Date(previousWeekStart)
    previousWeekEnd.setDate(previousWeekEnd.getDate() + 7)

    console.log('Collecting data...')
    console.log(`Current week: ${currentWeekStart.toISOString()} to ${currentWeekEnd.toISOString()}`)
    console.log(`Previous week: ${previousWeekStart.toISOString()} to ${previousWeekEnd.toISOString()}\n`)

    // Gather data
    const [currentWeekMetrics, previousWeekMetrics, topPerformers, decliningTutors] = await Promise.all([
      getWeekMetrics(currentWeekStart, currentWeekEnd),
      getWeekMetrics(previousWeekStart, previousWeekEnd),
      getTopPerformers(currentWeekStart, currentWeekEnd),
      getDecliningTutors(currentWeekStart, previousWeekStart)
    ])

    // Calculate changes
    const changes = {
      engagement: currentWeekMetrics.avgEngagement - previousWeekMetrics.avgEngagement,
      rating: currentWeekMetrics.avgRating - previousWeekMetrics.avgRating,
      sessions: currentWeekMetrics.totalSessions - previousWeekMetrics.totalSessions,
      activeTutors: currentWeekMetrics.activeTutors - previousWeekMetrics.activeTutors,
      churnRate: currentWeekMetrics.churnRate - previousWeekMetrics.churnRate
    }

    console.log('Week-over-Week Changes:')
    console.log(`  Engagement: ${changes.engagement > 0 ? '+' : ''}${changes.engagement.toFixed(2)}`)
    console.log(`  Rating: ${changes.rating > 0 ? '+' : ''}${changes.rating.toFixed(2)}`)
    console.log(`  Sessions: ${changes.sessions > 0 ? '+' : ''}${changes.sessions}`)
    console.log(`  Active Tutors: ${changes.activeTutors > 0 ? '+' : ''}${changes.activeTutors}`)
    console.log(`  Churn Rate: ${changes.churnRate > 0 ? '+' : ''}${(changes.churnRate * 100).toFixed(1)}%\n`)

    // Calculate correlation matrix
    const allTutors = await prisma.tutor.findMany({
      where: { activeStatus: true },
      include: { aggregates: true }
    })

    const tutorData = allTutors.filter(t => t.aggregates).map(t => ({
      tutorId: t.tutorId,
      avgEngagement: t.aggregates!.avgEngagementScore,
      avgRating: t.aggregates!.avgRating30d,
      sessionsCompleted: t.aggregates!.totalSessions30d,
      monthsExperience: t.monthsExperience,
      rescheduleRate: t.rescheduleRate,
      technicalIssueRate: t.aggregates!.technicalIssueRate
    }))

    const correlationMatrix = calculateCorrelationMatrix(tutorData)

    console.log('Running AI pattern analysis...')

    // Call AI for analysis
    const analysis = await analyzePatterns({
      weekOverWeekComparison: {
        currentWeek: currentWeekMetrics,
        previousWeek: previousWeekMetrics,
        changes
      },
      topPerformers,
      decliningTutors: decliningTutors.filter(d => d !== null),
      correlationMatrix
    })

    console.log('\n=== AI Analysis Results ===\n')
    console.log(`Summary: ${analysis.summary}\n`)

    console.log('Discovered Patterns:')
    for (const pattern of analysis.patterns) {
      console.log(`\n📊 ${pattern.title} (${pattern.type})`)
      console.log(`   Confidence: ${(pattern.confidence * 100).toFixed(0)}%`)
      console.log(`   Significance: ${(pattern.statistical_significance * 100).toFixed(0)}%`)
      console.log(`   Description: ${pattern.description}`)
      console.log(`   Affected Tutors: ${pattern.affected_tutors.length}`)
      console.log(`   Recommendation: ${pattern.recommendation}`)
      console.log(`   Expected Impact: ${pattern.expected_impact}`)
    }

    console.log('\n🎯 Priority Actions:')
    analysis.priority_actions.forEach((action, index) => {
      console.log(`   ${index + 1}. ${action}`)
    })

    // Store insights in database
    console.log('\n💾 Storing insights in database...')

    for (const pattern of analysis.patterns) {
      await prisma.patternInsight.create({
        data: {
          patternType: pattern.type,
          title: pattern.title,
          description: pattern.description,
          affectedTutorIds: pattern.affected_tutors,
          affectedTutorCount: pattern.affected_tutors.length,
          correlations: pattern.correlations,
          statisticalSignificance: pattern.statistical_significance,
          confidenceScore: pattern.confidence,
          aiGeneratedRecommendation: pattern.recommendation,
          aiModel: 'claude-3-5-sonnet-20241022',
          analyzedPeriodStart: currentWeekStart,
          analyzedPeriodEnd: currentWeekEnd,
          status: 'active'
        }
      })
    }

    console.log(`\n✅ Stored ${analysis.patterns.length} AI-generated insights`)

    // Generate and store first session insights
    console.log('\n🔍 Generating first session pattern insights...')
    try {
      const firstSessionInsights = await generateFirstSessionInsights()
      
      if (firstSessionInsights.length > 0) {
        for (const insight of firstSessionInsights) {
          await prisma.patternInsight.create({
            data: {
              patternType: insight.patternType,
              title: insight.title,
              description: insight.description,
              affectedTutorIds: insight.affectedTutorIds,
              affectedTutorCount: insight.affectedTutorCount,
              correlations: insight.correlations,
              statisticalSignificance: insight.statisticalSignificance,
              confidenceScore: insight.confidenceScore,
              aiGeneratedRecommendation: insight.aiGeneratedRecommendation,
              aiModel: 'first-session-analyzer',
              analyzedPeriodStart: insight.analyzedPeriodStart,
              analyzedPeriodEnd: insight.analyzedPeriodEnd,
              status: 'active'
            }
          })
        }
        console.log(`✅ Stored ${firstSessionInsights.length} first session insights`)
      } else {
        console.log('ℹ️  No first session insights generated (no poor first session cohort found)')
      }
    } catch (error) {
      console.error('⚠️  Error generating first session insights:', error)
      // Don't fail the entire script if first session insights fail
    }

    console.log('\n=== Pattern Discovery Complete ===')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error during pattern discovery:', error)
    process.exit(1)
  }
}

// Export for use in API routes
export default main

// Run directly if called as a script
if (require.main === module) {
  main()
}

