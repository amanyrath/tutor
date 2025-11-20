/**
 * Intervention Builder
 * 
 * Creates and manages intervention campaigns
 */

import { prisma } from '@/lib/db'
import { findTargetTutors, type TargetingCriteria } from './targeting'
import { getTemplate, renderTemplate, type InterventionTemplate } from './templates'

export interface InterventionCampaign {
  name: string
  description?: string
  templateId: string
  targetingCriteria: TargetingCriteria
  experimentId?: string
  experimentVariant?: string
  scheduledFor?: Date
  variables?: Record<string, any>
}

export interface CampaignResult {
  campaignId: string
  interventionsCreated: number
  targetedTutors: string[]
  estimatedSendDate: Date
}

/**
 * Create an intervention campaign
 */
export async function createCampaign(
  campaign: InterventionCampaign
): Promise<CampaignResult> {
  // Get template
  const template = getTemplate(campaign.templateId)
  if (!template) {
    throw new Error(`Template ${campaign.templateId} not found`)
  }

  // Find target tutors
  const targeting = await findTargetTutors(campaign.targetingCriteria)
  
  if (targeting.totalMatches === 0) {
    throw new Error('No tutors match the targeting criteria')
  }

  // Create interventions for each tutor
  const interventions = []
  const campaignId = `campaign_${Date.now()}`

  for (const target of targeting.tutors) {
    // Render template with tutor-specific variables
    const tutorData = await prisma.tutor.findUnique({
      where: { tutorId: target.tutorId },
      include: { aggregates: true }
    })

    if (!tutorData) continue

    // Prepare variables
    const variables: Record<string, any> = {
      tutorName: `Tutor ${tutorData.tutorId}`,
      ...campaign.variables,
      // Add tutor-specific data
      tutorId: tutorData.tutorId,
      monthsExperience: tutorData.monthsExperience,
      primarySubject: tutorData.primarySubject
    }

    // Add engagement/performance data if available
    if (tutorData.aggregates) {
      variables.currentEngagement = tutorData.aggregates.avgEngagementScore.toFixed(1)
      variables.currentRating = tutorData.aggregates.avgRating30d.toFixed(1)
      variables.sessionsCompleted = tutorData.aggregates.totalSessions30d
    }

    // Add login data
    if (tutorData.lastLogin) {
      const daysSince = Math.floor((Date.now() - tutorData.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
      variables.daysSinceLogin = daysSince
    }

    // Add URLs
    variables.loginUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    variables.dashboardUrl = `${variables.loginUrl}/dashboard`
    variables.resourcesUrl = `${variables.loginUrl}/resources`
    variables.supportUrl = `${variables.loginUrl}/support`
    variables.prepGuideUrl = `${variables.loginUrl}/guides/first-session`
    variables.trainingUrl = `${variables.loginUrl}/training`

    // Render template
    const rendered = renderTemplate(template, variables)

    // Create intervention
    const intervention = await prisma.intervention.create({
      data: {
        tutorId: target.tutorId,
        interventionType: template.category,
        channel: 'email',
        subject: rendered.subject,
        content: rendered.content,
        templateId: campaign.templateId,
        experimentId: campaign.experimentId,
        experimentVariant: campaign.experimentVariant,
        status: campaign.scheduledFor ? 'pending' : 'pending'
      }
    })

    interventions.push(intervention)
  }

  return {
    campaignId,
    interventionsCreated: interventions.length,
    targetedTutors: targeting.tutors.map(t => t.tutorId),
    estimatedSendDate: campaign.scheduledFor || new Date()
  }
}

/**
 * Create intervention for a single tutor
 */
export async function createSingleIntervention(
  tutorId: string,
  templateId: string,
  variables?: Record<string, any>
): Promise<string> {
  const template = getTemplate(templateId)
  if (!template) {
    throw new Error(`Template ${templateId} not found`)
  }

  const tutor = await prisma.tutor.findUnique({
    where: { tutorId },
    include: { aggregates: true }
  })

  if (!tutor) {
    throw new Error(`Tutor ${tutorId} not found`)
  }

  // Prepare variables
  const tutorVariables = {
    tutorName: `Tutor ${tutor.tutorId}`,
    ...variables,
    tutorId: tutor.tutorId,
    loginUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  // Render template
  const rendered = renderTemplate(template, tutorVariables)

  // Create intervention
  const intervention = await prisma.intervention.create({
    data: {
      tutorId,
      interventionType: template.category,
      channel: 'email',
      subject: rendered.subject,
      content: rendered.content,
      templateId,
      status: 'pending'
    }
  })

  return intervention.id
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId?: string): Promise<{
  totalCampaigns: number
  totalInterventions: number
  sentCount: number
  openedCount: number
  clickedCount: number
  respondedCount: number
  avgOpenRate: number
  avgClickRate: number
  avgResponseRate: number
}> {
  const whereClause = campaignId ? { experimentId: campaignId } : {}

  const interventions = await prisma.intervention.findMany({
    where: whereClause
  })

  const totalInterventions = interventions.length
  const sentCount = interventions.filter((i: typeof interventions[number]) => i.sentAt).length
  const openedCount = interventions.filter((i: typeof interventions[number]) => i.openedAt).length
  const clickedCount = interventions.filter((i: typeof interventions[number]) => i.clickedAt).length
  const respondedCount = interventions.filter((i: typeof interventions[number]) => i.respondedAt).length

  return {
    totalCampaigns: campaignId ? 1 : 0, // Would need to track campaigns separately
    totalInterventions,
    sentCount,
    openedCount,
    clickedCount,
    respondedCount,
    avgOpenRate: sentCount > 0 ? (openedCount / sentCount) * 100 : 0,
    avgClickRate: sentCount > 0 ? (clickedCount / sentCount) * 100 : 0,
    avgResponseRate: sentCount > 0 ? (respondedCount / sentCount) * 100 : 0
  }
}

/**
 * Measure intervention effectiveness
 */
export async function measureInterventionEffectiveness(
  interventionId: string
): Promise<{
  interventionId: string
  sent: boolean
  opened: boolean
  clicked: boolean
  responded: boolean
  engagementChange?: number
  sessionsChange?: number
  timeToResponse?: number
}> {
  const intervention = await prisma.intervention.findUnique({
    where: { id: interventionId },
    include: {
      tutor: {
        include: {
          aggregates: true
        }
      }
    }
  })

  if (!intervention) {
    throw new Error(`Intervention ${interventionId} not found`)
  }

  const result: any = {
    interventionId,
    sent: !!intervention.sentAt,
    opened: !!intervention.openedAt,
    clicked: !!intervention.clickedAt,
    responded: !!intervention.respondedAt
  }

  // Calculate engagement change if we have before/after data
  if (intervention.engagementBefore !== null && intervention.engagementAfter !== null) {
    result.engagementChange = intervention.engagementAfter - intervention.engagementBefore
  }

  // Calculate sessions change
  if (intervention.sessionsBeforeCount !== null && intervention.sessionsAfterCount !== null) {
    result.sessionsChange = intervention.sessionsAfterCount - intervention.sessionsBeforeCount
  }

  // Calculate time to response
  if (intervention.sentAt && intervention.respondedAt) {
    result.timeToResponse = (intervention.respondedAt.getTime() - intervention.sentAt.getTime()) / (1000 * 60 * 60) // hours
  }

  return result
}

/**
 * Get recommended campaigns based on current data
 */
export async function getRecommendedCampaigns(): Promise<Array<{
  name: string
  description: string
  templateId: string
  estimatedAudience: number
  priority: 'high' | 'medium' | 'low'
  reasoning: string
}>> {
  const recommendations = []

  // Check for high churn risk tutors
  const highChurn = await prisma.tutorAggregate.count({
    where: { churnRiskLevel: 'High' }
  })

  if (highChurn > 0) {
    recommendations.push({
      name: 'Critical Churn Prevention',
      description: 'Reach out to tutors at high risk of churning',
      templateId: 'engagement_no_login_7d',
      estimatedAudience: highChurn,
      priority: 'high' as const,
      reasoning: `${highChurn} tutors have high churn risk. Immediate intervention needed.`
    })
  }

  // Check for inactive tutors
  const inactive = await prisma.tutor.count({
    where: {
      activeStatus: true,
      lastLogin: {
        lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }
  })

  if (inactive > 5) {
    recommendations.push({
      name: 'Re-engagement Campaign',
      description: 'Bring back inactive tutors',
      templateId: 'reengagement_14d',
      estimatedAudience: inactive,
      priority: 'high' as const,
      reasoning: `${inactive} tutors haven't logged in for 7+ days.`
    })
  }

  // Check for poor first sessions
  const poorFirstSession = await prisma.tutorAggregate.count({
    where: { poorFirstSessionFlag: true }
  })

  if (poorFirstSession > 0) {
    recommendations.push({
      name: 'First Session Training',
      description: 'Help tutors improve first impressions',
      templateId: 'quality_poor_first_session',
      estimatedAudience: poorFirstSession,
      priority: 'medium' as const,
      reasoning: `${poorFirstSession} tutors struggling with first sessions (24% higher churn risk).`
    })
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return recommendations
}

