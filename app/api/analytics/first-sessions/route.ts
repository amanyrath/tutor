import { NextResponse } from 'next/server'
import { performFirstSessionAnalysis } from '@/lib/analytics/first-session-analyzer'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const subjectFilter = searchParams.get('subject')

    // Perform the analysis
    const analysis = await performFirstSessionAnalysis()

    // Apply subject filter if specified
    if (subjectFilter && subjectFilter !== 'all') {
      const filterBySubject = (tutors: any[]) => 
        tutors.filter(t => t.primarySubject === subjectFilter)

      // Filter both cohorts
      analysis.poorFirstSessionCohort.tutors = filterBySubject(
        analysis.poorFirstSessionCohort.tutors
      )
      analysis.overallPopulation.tutors = filterBySubject(
        analysis.overallPopulation.tutors
      )

      // Update counts
      analysis.poorFirstSessionCohort.count = analysis.poorFirstSessionCohort.tutors.length
      analysis.overallPopulation.count = analysis.overallPopulation.tutors.length

      // Recalculate average metrics for filtered cohorts
      const calculateAvgMetrics = (tutors: any[]): Record<string, number> => {
        if (tutors.length === 0) return {}

        return {
          avgExperience: tutors.reduce((sum, t) => sum + t.monthsExperience, 0) / tutors.length,
          avgEngagement: tutors.reduce((sum, t) => sum + t.avgEngagement, 0) / tutors.length,
          avgEmpathy: tutors.reduce((sum, t) => sum + t.avgEmpathy, 0) / tutors.length,
          avgClarity: tutors.reduce((sum, t) => sum + t.avgClarity, 0) / tutors.length,
          avgSatisfaction: tutors.reduce((sum, t) => sum + t.avgSatisfaction, 0) / tutors.length,
          avgTechnicalIssueRate: tutors.reduce((sum, t) => sum + t.technicalIssueRate, 0) / tutors.length,
          avgFirstSessionRating: tutors.reduce((sum, t) => sum + (t.firstSessionAvgRating || 0), 0) / tutors.length
        }
      }

      analysis.poorFirstSessionCohort.avgMetrics = calculateAvgMetrics(
        analysis.poorFirstSessionCohort.tutors
      )
      analysis.overallPopulation.avgMetrics = calculateAvgMetrics(
        analysis.overallPopulation.tutors
      )

      // Recalculate comparisons if we have data
      if (analysis.poorFirstSessionCohort.count > 0 && analysis.overallPopulation.count > 0) {
        const { compareFirstSessionCohorts, generateFirstSessionRecommendations } = 
          await import('@/lib/analytics/first-session-analyzer')
        
        analysis.comparisons = compareFirstSessionCohorts(
          analysis.poorFirstSessionCohort.tutors,
          analysis.overallPopulation.tutors
        )
        analysis.recommendations = generateFirstSessionRecommendations(analysis.comparisons)
      }
    }

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error performing first session analysis:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform first session analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Enable for cron jobs if needed
export const dynamic = 'force-dynamic'
export const revalidate = 0
