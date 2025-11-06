import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [
      totalTutors,
      highRiskCount,
      avgEngagement,
      poorFirstSessionCount,
    ] = await Promise.all([
      prisma.tutor.count({ where: { activeStatus: true } }),
      prisma.tutorAggregate.count({
        where: { churnRiskLevel: 'High' },
      }),
      prisma.tutorAggregate.aggregate({
        _avg: { avgEngagementScore: true },
      }),
      prisma.tutorAggregate.count({
        where: { poorFirstSessionFlag: true },
      }),
    ])

    return NextResponse.json({
      totalTutors,
      highRiskCount,
      avgEngagement: avgEngagement._avg.avgEngagementScore ?? 0,
      poorFirstSessionCount,
    })
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard metrics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

