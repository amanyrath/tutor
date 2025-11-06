import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const riskLevel = searchParams.get('risk_level')
    const subject = searchParams.get('subject')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      activeStatus: true,
    }

    if (subject) {
      where.primarySubject = subject
    }

    if (riskLevel) {
      where.aggregates = {
        churnRiskLevel: riskLevel,
      }
    }

    const [tutors, total] = await Promise.all([
      prisma.tutor.findMany({
        where,
        include: {
          aggregates: true,
        },
        take: limit,
        skip: offset,
      }),
      prisma.tutor.count({ where }),
    ])

    // Sort by churn probability in memory
    tutors.sort((a, b) => {
      const probA = a.aggregates?.churnProbability ?? 0
      const probB = b.aggregates?.churnProbability ?? 0
      return probB - probA
    })

    return NextResponse.json({
      tutors,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching tutors:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch tutors',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

