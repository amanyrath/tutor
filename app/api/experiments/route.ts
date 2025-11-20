import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/experiments
 * Fetch experiments with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Build where clause
    const where: any = {}
    
    if (status) {
      where.status = status
    }
    
    if (startDate || endDate) {
      where.startDate = {}
      if (startDate) {
        where.startDate.gte = startDate
      }
      if (endDate) {
        where.startDate.lte = endDate
      }
    }
    
    // Fetch experiments with assignment counts
    const experiments = await prisma.experiment.findMany({
      where,
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      },
      orderBy: status === 'active' 
        ? { startDate: 'desc' }
        : { createdAt: 'desc' },
      take: limit
    })
    
    // Calculate statistics
    const stats = {
      total: experiments.length,
      byStatus: {} as Record<string, number>,
      totalAssignments: 0
    }
    
    experiments.forEach((exp: typeof experiments[number]) => {
      stats.byStatus[exp.status] = (stats.byStatus[exp.status] || 0) + 1
      stats.totalAssignments += exp._count.assignments
    })
    
    return NextResponse.json({
      experiments,
      stats
    })
  } catch (error) {
    console.error('Error fetching experiments:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch experiments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/experiments
 * Create a new experiment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      hypothesis,
      description,
      variants,
      primaryMetric,
      secondaryMetrics,
      startDate,
      endDate,
      targetSegment,
      sampleSize,
    } = body
    
    // Validate required fields
    if (!name || !hypothesis || !variants || !primaryMetric || !startDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, hypothesis, variants, primaryMetric, startDate' },
        { status: 400 }
      )
    }
    
    // Validate variants is an array
    if (!Array.isArray(variants) || variants.length < 2) {
      return NextResponse.json(
        { error: 'Variants must be an array with at least 2 items' },
        { status: 400 }
      )
    }
    
    // Check if experiment name already exists
    const existing = await prisma.experiment.findUnique({
      where: { name }
    })
    
    if (existing) {
      return NextResponse.json(
        { error: 'Experiment with this name already exists' },
        { status: 400 }
      )
    }
    
    // Create experiment
    const experiment = await prisma.experiment.create({
      data: {
        name,
        hypothesis,
        description: description || null,
        variants: variants,
        primaryMetric,
        secondaryMetrics: secondaryMetrics || null,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        targetSegment: targetSegment || null,
        sampleSize: sampleSize || null,
        status: 'draft',
      },
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      experiment
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating experiment:', error)
    return NextResponse.json(
      {
        error: 'Failed to create experiment',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


