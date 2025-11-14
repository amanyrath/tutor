/**
 * Insights API Endpoint
 * 
 * GET: Fetch pattern insights with optional filters
 * POST: Create new manual insight
 * DELETE: Archive insight
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/insights
 * Fetch pattern insights with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    
    // Parse query parameters
    const patternType = searchParams.get('patternType')
    const status = searchParams.get('status') || 'active'
    const minConfidence = searchParams.get('minConfidence') 
      ? parseFloat(searchParams.get('minConfidence')!) 
      : 0
    const startDate = searchParams.get('startDate') 
      ? new Date(searchParams.get('startDate')!) 
      : undefined
    const endDate = searchParams.get('endDate') 
      ? new Date(searchParams.get('endDate')!) 
      : undefined
    const limit = searchParams.get('limit') 
      ? parseInt(searchParams.get('limit')!) 
      : 50

    // Build filter conditions
    const where: any = {
      status: status,
      confidenceScore: {
        gte: minConfidence
      }
    }

    if (patternType) {
      where.patternType = patternType
    }

    if (startDate || endDate) {
      where.discoveredAt = {}
      if (startDate) {
        where.discoveredAt.gte = startDate
      }
      if (endDate) {
        where.discoveredAt.lte = endDate
      }
    }

    // Fetch insights
    const insights = await prisma.patternInsight.findMany({
      where,
      orderBy: [
        { confidenceScore: 'desc' },
        { discoveredAt: 'desc' }
      ],
      take: limit
    })

    // Get summary statistics
    const stats = {
      total: insights.length,
      byType: {} as Record<string, number>,
      avgConfidence: 0,
      totalAffectedTutors: 0
    }

    insights.forEach((insight: typeof insights[number]) => {
      stats.byType[insight.patternType] = (stats.byType[insight.patternType] || 0) + 1
      stats.avgConfidence += insight.confidenceScore
      stats.totalAffectedTutors += insight.affectedTutorCount
    })

    if (insights.length > 0) {
      stats.avgConfidence = stats.avgConfidence / insights.length
    }

    return NextResponse.json({
      insights,
      stats
    })

  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/insights
 * Create new manual insight or update existing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      id,
      patternType,
      title,
      description,
      affectedTutorIds = [],
      correlations,
      statisticalSignificance,
      confidenceScore,
      aiGeneratedRecommendation,
      analyzedPeriodStart,
      analyzedPeriodEnd,
      status = 'active',
      actionTaken,
      actionTakenAt
    } = body

    // Validate required fields
    if (!title || !description || !patternType) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, patternType' },
        { status: 400 }
      )
    }

    // If ID provided, update existing insight
    if (id) {
      const updated = await prisma.patternInsight.update({
        where: { id },
        data: {
          status,
          actionTaken,
          actionTakenAt: actionTakenAt ? new Date(actionTakenAt) : null
        }
      })

      return NextResponse.json({
        insight: updated,
        message: 'Insight updated successfully'
      })
    }

    // Create new insight
    const insight = await prisma.patternInsight.create({
      data: {
        patternType,
        title,
        description,
        affectedTutorIds,
        affectedTutorCount: affectedTutorIds.length,
        correlations: correlations || {},
        statisticalSignificance: statisticalSignificance || 0.5,
        confidenceScore: confidenceScore || 0.5,
        aiGeneratedRecommendation,
        aiModel: 'manual',
        analyzedPeriodStart: analyzedPeriodStart ? new Date(analyzedPeriodStart) : new Date(),
        analyzedPeriodEnd: analyzedPeriodEnd ? new Date(analyzedPeriodEnd) : new Date(),
        status
      }
    })

    return NextResponse.json({
      insight,
      message: 'Insight created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating insight:', error)
    return NextResponse.json(
      { error: 'Failed to create insight' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/insights
 * Archive insight by ID
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing insight ID' },
        { status: 400 }
      )
    }

    // Archive (soft delete) instead of hard delete
    const insight = await prisma.patternInsight.update({
      where: { id },
      data: {
        status: 'archived'
      }
    })

    return NextResponse.json({
      insight,
      message: 'Insight archived successfully'
    })

  } catch (error) {
    console.error('Error deleting insight:', error)
    return NextResponse.json(
      { error: 'Failed to delete insight' },
      { status: 500 }
    )
  }
}


