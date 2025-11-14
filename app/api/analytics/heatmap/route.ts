import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tutorId = searchParams.get('tutorId')
    const days = parseInt(searchParams.get('days') || '30')
    const metricType = searchParams.get('metricType') || 'engagement'

    const dateThreshold = new Date()
    dateThreshold.setDate(dateThreshold.getDate() - days)

    // Query sessions grouped by day of week and hour
    // Validate and sanitize metricType to prevent SQL injection
    const validMetrics = ['engagement', 'quality', 'technical']
    const sanitizedMetric = validMetrics.includes(metricType) ? metricType : 'engagement'
    const metricColumn = `${sanitizedMetric}_score`

    // Build query with sanitized column name
    let query = `
      SELECT
        EXTRACT(DOW FROM session_datetime)::int as day_of_week,
        EXTRACT(HOUR FROM session_datetime)::int as hour_of_day,
        AVG(${metricColumn}) as avg_value,
        COUNT(*) as count
      FROM sessions
      WHERE session_completed = true
        AND session_datetime >= $1
        AND ${metricColumn} IS NOT NULL
    `

    const params: any[] = [dateThreshold]

    if (tutorId) {
      query += ` AND tutor_id = $2`
      params.push(tutorId)
    }

    query += `
      GROUP BY
        EXTRACT(DOW FROM session_datetime),
        EXTRACT(HOUR FROM session_datetime)
      ORDER BY day_of_week, hour_of_day
    `

    const results = await prisma.$queryRawUnsafe(query, ...params) as Array<{
      day_of_week: number
      hour_of_day: number
      avg_value: number
      count: bigint
    }>

    const heatmap = results.map(r => ({
      dayOfWeek: r.day_of_week,
      hourOfDay: r.hour_of_day,
      value: Number(r.avg_value),
      count: Number(r.count)
    }))

    return NextResponse.json({ heatmap })
  } catch (error) {
    console.error('Error fetching heatmap:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    )
  }
}

