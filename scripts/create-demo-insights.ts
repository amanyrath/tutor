#!/usr/bin/env tsx

/**
 * Create Demo Insights
 * 
 * Creates sample pattern insights for testing the insights dashboard
 */

import { prisma } from '../lib/db'

async function main() {
  console.log('Creating demo insights...\n')

  try {
    // Get some tutor IDs to use
    const tutors = await prisma.tutor.findMany({
      take: 20,
      select: { tutorId: true }
    })

    const tutorIds = tutors.map(t => t.tutorId)

    // Create demo insights
    const insights = [
      {
        patternType: 'engagement_increase',
        title: 'Morning Sessions Drive Higher Engagement',
        description: 'Tutors who conduct sessions between 8-11 AM show 25% higher engagement scores compared to afternoon sessions. This pattern is particularly strong for Math and Science subjects.',
        affectedTutorIds: tutorIds.slice(0, 8),
        affectedTutorCount: 8,
        correlations: {
          session_time: 0.78,
          subject_difficulty: 0.45,
          tutor_experience: 0.32
        },
        statisticalSignificance: 0.95,
        confidenceScore: 0.87,
        aiGeneratedRecommendation: 'Encourage tutors with flexible schedules to prioritize morning sessions. Consider implementing an incentive program for tutors who consistently deliver high-engagement morning sessions, especially in STEM subjects.',
        aiModel: 'claude-3-5-sonnet-20241022',
        analyzedPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date(),
        status: 'active'
      },
      {
        patternType: 'churn_risk',
        title: 'High Reschedule Rate Predicts Tutor Attrition',
        description: 'Tutors with reschedule rates above 20% are 3x more likely to become inactive within 30 days. This pattern affects approximately 12 tutors currently.',
        affectedTutorIds: tutorIds.slice(8, 20),
        affectedTutorCount: 12,
        correlations: {
          reschedule_rate: 0.89,
          no_show_count: 0.67,
          technical_issue_rate: 0.54,
          avg_rating: -0.42
        },
        statisticalSignificance: 0.92,
        confidenceScore: 0.91,
        aiGeneratedRecommendation: 'Implement proactive outreach for tutors with reschedule rates >15%. Schedule one-on-one support calls to understand root causes (technical issues, personal challenges, or student behavior). Consider offering scheduling flexibility or technical support.',
        aiModel: 'claude-3-5-sonnet-20241022',
        analyzedPeriodStart: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date(),
        status: 'active'
      },
      {
        patternType: 'quality_improvement',
        title: 'First Session Success Correlates with Long-Term Performance',
        description: 'Tutors who receive 4+ star ratings on first sessions maintain 23% higher average ratings over the next 90 days. Early success appears to build confidence and establish effective teaching patterns.',
        affectedTutorIds: tutorIds.slice(0, 15),
        affectedTutorCount: 15,
        correlations: {
          first_session_rating: 0.82,
          empathy_score: 0.71,
          student_satisfaction: 0.68,
          session_preparation: 0.59
        },
        statisticalSignificance: 0.88,
        confidenceScore: 0.85,
        aiGeneratedRecommendation: 'Create a specialized onboarding program focused on first session excellence. Include role-playing exercises, student engagement techniques, and rapport-building strategies. Assign mentors to new tutors for their first 5 sessions.',
        aiModel: 'claude-3-5-sonnet-20241022',
        analyzedPeriodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date(),
        status: 'active'
      },
      {
        patternType: 'engagement_decrease',
        title: 'Technical Issues Lead to Engagement Drop',
        description: 'Tutors experiencing 2+ technical issues per week show a 35% decline in engagement scores within 10 days. The effect is cumulative and accelerates with repeated issues.',
        affectedTutorIds: tutorIds.slice(5, 12),
        affectedTutorCount: 7,
        correlations: {
          technical_issue_rate: -0.79,
          connection_quality: -0.65,
          session_completion_rate: -0.58
        },
        statisticalSignificance: 0.91,
        confidenceScore: 0.88,
        aiGeneratedRecommendation: 'Implement rapid technical support response team for tutors experiencing issues. Provide equipment upgrades or internet stipends where needed. Create technical troubleshooting guides and pre-session check protocols.',
        aiModel: 'claude-3-5-sonnet-20241022',
        analyzedPeriodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date(),
        status: 'active'
      },
      {
        patternType: 'quality_improvement',
        title: 'Screen Sharing Increases Student Satisfaction',
        description: 'Sessions with 50%+ screen share time show 18% higher student satisfaction scores. Visual collaboration appears critical for complex subject matter, particularly in Math, Science, and Programming.',
        affectedTutorIds: tutorIds.slice(0, 10),
        affectedTutorCount: 10,
        correlations: {
          screen_share_pct: 0.73,
          clarity_score: 0.69,
          student_satisfaction: 0.64,
          subject_complexity: 0.51
        },
        statisticalSignificance: 0.86,
        confidenceScore: 0.79,
        aiGeneratedRecommendation: 'Train tutors on effective screen sharing techniques. Provide digital whiteboard tools and collaborative document templates. Set screen share usage targets (>40% for STEM subjects) and track adoption in tutor scorecards.',
        aiModel: 'claude-3-5-sonnet-20241022',
        analyzedPeriodStart: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        analyzedPeriodEnd: new Date(),
        status: 'implemented',
        actionTaken: 'Rolled out mandatory screen sharing training for all STEM tutors. Provided access to digital whiteboard tools.',
        actionTakenAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    ]

    // Create each insight
    for (const insight of insights) {
      await prisma.patternInsight.create({
        data: insight
      })
      console.log(`✓ Created: ${insight.title}`)
    }

    console.log(`\n✅ Successfully created ${insights.length} demo insights`)
    process.exit(0)

  } catch (error) {
    console.error('\n❌ Error creating demo insights:', error)
    process.exit(1)
  }
}

main()

