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
      Promise.resolve(0), // TODO: Implement after Prisma client regeneration
      
      // Activation Rate (percentage of tutors with 10+ sessions in 30 days)
      prisma.tutorAggregate.count({
        where: { totalSessions30d: { gte: 10 } }
      }).then(async (activeCount) => {
        const total = await prisma.tutorAggregate.count()
        return total > 0 ? (activeCount / total) * 100 : 0
      }).catch(() => 0),
    ])

    return NextResponse.json({
      totalTutors,
      highRiskCount,
      avgEngagement: avgEngagement._avg.avgEngagementScore ?? 0,
      poorFirstSessionCount,
      avgReliability: (avgReliability._avg.reliabilityScore ?? 0) * 100, // Convert to percentage
      criticalAlerts,
      pendingInterventions,
      activationRate: activationMetrics,
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

