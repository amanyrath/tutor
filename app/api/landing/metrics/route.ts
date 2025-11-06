import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [
      totalTutors,
      highRiskCount,
      avgEngagement,
      poorFirstSessionCount,
      avgReliability,
      criticalAlerts,
      pendingInterventions,
      activationMetrics,
      interventionStats,
    ] = await Promise.all([
      // Total Active Tutors
      prisma.tutor.count({ where: { activeStatus: true } }),
      
      // High Churn Risk
      prisma.tutorAggregate.count({
        where: { churnRiskLevel: 'High' },
      }),
      
      // Average Engagement Score
      prisma.tutorAggregate.aggregate({
        _avg: { avgEngagementScore: true },
      }),
      
      // Poor First Session Count
      prisma.tutorAggregate.count({
        where: { poorFirstSessionFlag: true },
      }),
      
      // Average Reliability Score
      prisma.tutor.aggregate({
        _avg: { reliabilityScore: true },
        where: { activeStatus: true },
      }),
      
      // Critical Alerts (unresolved with HIGH severity)
      prisma.alert.count({
        where: {
          OR: [
            { severity: 'HIGH' },
            { severity: 'critical' },
          ],
          isAcknowledged: false,
          isResolved: false,
        },
      }).catch(() => 0), // Graceful fallback if alerts table doesn't exist yet
      
      // Pending Interventions (not yet sent)
      prisma.intervention.count({
        where: { sentAt: null },
      }).catch(() => 0),
      
      // Activation Rate (percentage of tutors with 10+ sessions in 30 days)
      prisma.tutorAggregate.count({
        where: { totalSessions30d: { gte: 10 } }
      }).then(async (activeCount) => {
        const total = await prisma.tutorAggregate.count()
        return total > 0 ? (activeCount / total) * 100 : 0
      }).catch(() => 0),

      // Intervention Success Stats
      prisma.intervention.findMany({
        select: {
          sentAt: true,
          clickedAt: true,
          respondedAt: true,
        },
      }).then((interventions: any) => {
        const sent = interventions.filter((i: any) => i.sentAt).length
        const successful = interventions.filter((i: any) => i.clickedAt || i.respondedAt).length
        return {
          sent,
          successful,
          successRate: sent > 0 ? (successful / sent) * 100 : 0,
        }
      }).catch(() => ({ sent: 0, successful: 0, successRate: 0 })),
    ])

    // Calculate Student Experience Score (0-100)
    // Based on: engagement (40%), reliability (40%), and low churn risk (20%)
    const engagementScore = (avgEngagement._avg.avgEngagementScore ?? 0) * 10 // Convert to 0-100
    const reliabilityScore = (avgReliability._avg.reliabilityScore ?? 0) * 100
    const totalTutorsCount = totalTutors > 0 ? totalTutors : 1
    const churnRiskScore = ((totalTutorsCount - highRiskCount) / totalTutorsCount) * 100
    const studentExperienceScore = (
      engagementScore * 0.4 +
      reliabilityScore * 0.4 +
      churnRiskScore * 0.2
    )

    // Calculate Tutor Retention Rate (inverse of churn risk)
    const tutorRetentionRate = ((totalTutorsCount - highRiskCount) / totalTutorsCount) * 100

    return NextResponse.json({
      totalTutors,
      highRiskCount,
      avgEngagement: avgEngagement._avg.avgEngagementScore ?? 0,
      poorFirstSessionCount,
      avgReliability: (avgReliability._avg.reliabilityScore ?? 0) * 100,
      criticalAlerts,
      pendingInterventions,
      activationRate: activationMetrics,
      // New student-focused metrics
      studentExperienceScore: Math.round(studentExperienceScore * 10) / 10,
      tutorRetentionRate: Math.round(tutorRetentionRate * 10) / 10,
      interventionSuccessRate: Math.round(interventionStats.successRate * 10) / 10,
    })
  } catch (error) {
    console.error('Error fetching landing metrics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch landing metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

