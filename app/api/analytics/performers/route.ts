import { NextResponse } from 'next/server'
import { performStarPerformerAnalysis } from '@/lib/analytics/star-performer'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectFilter = searchParams.get('subject')

    // Perform the analysis
    const analysis = await performStarPerformerAnalysis()

    // Apply subject filter if specified
    if (subjectFilter && subjectFilter !== 'all') {
      const filterBySubject = (tutors: any[]) => 
        tutors.filter(t => t.primarySubject === subjectFilter)

      analysis.segments.star.tutors = filterBySubject(analysis.segments.star.tutors)
      analysis.segments.average.tutors = filterBySubject(analysis.segments.average.tutors)
      analysis.segments.lagging.tutors = filterBySubject(analysis.segments.lagging.tutors)

      // Update counts
      analysis.segments.star.count = analysis.segments.star.tutors.length
      analysis.segments.average.count = analysis.segments.average.tutors.length
      analysis.segments.lagging.count = analysis.segments.lagging.tutors.length

      // Update summary
      analysis.summary.totalTutors = 
        analysis.segments.star.count + 
        analysis.segments.average.count + 
        analysis.segments.lagging.count
      analysis.summary.starPerformers = analysis.segments.star.count
      analysis.summary.avgPerformers = analysis.segments.average.count
      analysis.summary.laggingPerformers = analysis.segments.lagging.count

      // Recalculate average composite scores
      if (analysis.segments.star.tutors.length > 0) {
        analysis.segments.star.avgCompositeScore = 
          analysis.segments.star.tutors.reduce((sum, t) => sum + t.compositeScore, 0) / 
          analysis.segments.star.tutors.length
      }
      if (analysis.segments.average.tutors.length > 0) {
        analysis.segments.average.avgCompositeScore = 
          analysis.segments.average.tutors.reduce((sum, t) => sum + t.compositeScore, 0) / 
          analysis.segments.average.tutors.length
      }
      if (analysis.segments.lagging.tutors.length > 0) {
        analysis.segments.lagging.avgCompositeScore = 
          analysis.segments.lagging.tutors.reduce((sum, t) => sum + t.compositeScore, 0) / 
          analysis.segments.lagging.tutors.length
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error performing star performer analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform star performer analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Enable for cron jobs if needed
export const dynamic = 'force-dynamic'
export const revalidate = 0
