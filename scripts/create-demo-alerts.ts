import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDemoAlerts() {
  console.log('🚨 Creating demo alerts...\n')

  // Get some tutors
  const tutors = await prisma.tutor.findMany({
    take: 15,
    include: { aggregates: true },
  })

  if (tutors.length === 0) {
    console.log('❌ No tutors found. Import data first.')
    return
  }

  console.log(`Found ${tutors.length} tutors\n`)

  const demoAlerts = [
    // Critical alerts
    {
      tutorId: tutors[0].tutorId,
      severity: 'critical',
      category: 'churn',
      title: 'Critical Churn Risk',
      message: `Tutor ${tutors[0].tutorId} has a 72% probability of churning with 5 warning signals detected. Immediate intervention required.`,
      metric: 'churn_probability',
      metricValue: 0.72,
      threshold: 0.6,
    },
    // High alerts
    {
      tutorId: tutors[1].tutorId,
      severity: 'high',
      category: 'engagement',
      title: 'Below Target Engagement Score',
      message: `Engagement score of 6.2/10 is below target. Students may not be participating as actively as desired.`,
      metric: 'avg_engagement_score',
      metricValue: 6.2,
      threshold: 7.0,
    },
    {
      tutorId: tutors[2].tutorId,
      severity: 'high',
      category: 'quality',
      title: 'Poor First Session Performance',
      message: `8 first sessions with average rating of 3.2. First impressions need improvement.`,
      metric: 'first_session_avg_rating',
      metricValue: 3.2,
      threshold: 3.5,
    },
    {
      tutorId: tutors[3].tutorId,
      severity: 'high',
      category: 'quality',
      title: 'Very Low Student Ratings',
      message: `30-day average rating of 2.8/5.0 is critically low. Immediate quality improvement needed.`,
      metric: 'avg_rating_30d',
      metricValue: 2.8,
      threshold: 3.0,
    },
    // Medium alerts
    {
      tutorId: tutors[4].tutorId,
      severity: 'medium',
      category: 'churn',
      title: 'Medium Churn Risk',
      message: `Tutor ${tutors[4].tutorId} has a 42% churn probability. Monitor closely and consider preventive measures.`,
      metric: 'churn_probability',
      metricValue: 0.42,
      threshold: 0.3,
    },
    {
      tutorId: tutors[5].tutorId,
      severity: 'medium',
      category: 'engagement',
      title: 'Room for Engagement Improvement',
      message: `Engagement score of 7.2/10 could be higher. Consider sharing engagement strategies.`,
      metric: 'avg_engagement_score',
      metricValue: 7.2,
      threshold: 7.5,
    },
    {
      tutorId: tutors[6].tutorId,
      severity: 'medium',
      category: 'technical',
      title: 'Frequent Technical Issues',
      message: `28% of sessions have technical problems. Equipment or connection issues need attention.`,
      metric: 'technical_issue_rate',
      metricValue: 0.28,
      threshold: 0.2,
    },
    {
      tutorId: tutors[7].tutorId,
      severity: 'medium',
      category: 'quality',
      title: 'Significant Rating Decline',
      message: `7-day rating (3.5) is significantly lower than 30-day average (4.2). Recent performance decline detected.`,
      metric: 'avg_rating_7d',
      metricValue: 3.5,
      threshold: 3.7,
    },
    // Low alerts
    {
      tutorId: tutors[8].tutorId,
      severity: 'low',
      category: 'quality',
      title: 'Quality Scores Could Improve',
      message: `Some quality metrics have room for improvement: empathy (7.1), clarity (6.9). Consider additional training or coaching.`,
      metric: 'quality_scores',
      metricValue: 6.9,
      threshold: 7.5,
    },
    {
      tutorId: tutors[9].tutorId,
      severity: 'low',
      category: 'quality',
      title: 'Declining Sentiment',
      message: `Session sentiment has decreased by 0.18 over the past week. Monitor for continued decline.`,
      metric: 'sentiment_trend_7d',
      metricValue: -0.18,
      threshold: -0.15,
    },
    {
      tutorId: tutors[10].tutorId,
      severity: 'low',
      category: 'engagement',
      title: 'Engagement Score Trending Down',
      message: `Engagement has dropped from 8.1 to 7.6 in the past week. Monitor trend.`,
      metric: 'engagement_trend',
      metricValue: 7.6,
      threshold: 8.0,
    },
    {
      tutorId: tutors[11].tutorId,
      severity: 'low',
      category: 'quality',
      title: 'Low Recommendation Rate',
      message: `Only 68% of students would recommend this tutor. Target is 80%+.`,
      metric: 'recommendation_rate',
      metricValue: 0.68,
      threshold: 0.8,
    },
  ]

  // Clear existing alerts
  const deleted = await prisma.alert.deleteMany({})
  console.log(`🗑️  Cleared ${deleted.count} existing alerts\n`)

  // Create demo alerts
  const created = await prisma.alert.createMany({
    data: demoAlerts,
  })

  console.log(`✅ Created ${created.count} demo alerts\n`)

  // Show breakdown
  const bySeverity = demoAlerts.reduce((acc, alert) => {
    acc[alert.severity] = (acc[alert.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('📊 Alert Breakdown:')
  console.log(`   Critical: ${bySeverity.critical || 0}`)
  console.log(`   High: ${bySeverity.high || 0}`)
  console.log(`   Medium: ${bySeverity.medium || 0}`)
  console.log(`   Low: ${bySeverity.low || 0}\n`)

  console.log('✅ Demo alerts created successfully!')
}

createDemoAlerts()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

