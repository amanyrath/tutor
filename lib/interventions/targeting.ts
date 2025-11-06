/**
 * Intervention Targeting System
 * 
 * Selects tutors based on criteria for interventions
 */

import { prisma } from '@/lib/db'

export interface TargetingCriteria {
  // Demographics
  monthsExperienceMin?: number
  monthsExperienceMax?: number
  certificationLevel?: string[]
  primarySubject?: string[]
  
  // Performance
  avgEngagementMin?: number
  avgEngagementMax?: number
  avgRatingMin?: number
  avgRatingMax?: number
  churnRiskLevel?: ('Low' | 'Medium' | 'High')[]
  
  // Behavior
  daysSinceLoginMin?: number
  daysSinceLoginMax?: number
  totalSessions7dMin?: number
  totalSessions7dMax?: number
  poorFirstSession?: boolean
  
  // Technical
  technicalIssueRateMin?: number
  technicalIssueRateMax?: number
  rescheduleRateMin?: number
  rescheduleRateMax?: number
  
  // Status
  activeStatus?: boolean
  
  // Limit
  limit?: number
}

export interface TargetingResult {
  tutors: Array<{
    tutorId: string
    matchedCriteria: string[]
    score: number
  }>
  totalMatches: number
  criteria: TargetingCriteria
}

/**
 * Find tutors matching targeting criteria
 */
export async function findTargetTutors(
  criteria: TargetingCriteria
): Promise<TargetingResult> {
  // Build where clause
  const whereClause: any = {
    activeStatus: criteria.activeStatus !== undefined ? criteria.activeStatus : true
  }

  // Demographics
  if (criteria.monthsExperienceMin !== undefined || criteria.monthsExperienceMax !== undefined) {
    whereClause.monthsExperience = {}
    if (criteria.monthsExperienceMin !== undefined) {
      whereClause.monthsExperience.gte = criteria.monthsExperienceMin
    }
    if (criteria.monthsExperienceMax !== undefined) {
      whereClause.monthsExperience.lte = criteria.monthsExperienceMax
    }
  }

  if (criteria.certificationLevel && criteria.certificationLevel.length > 0) {
    whereClause.certificationLevel = { in: criteria.certificationLevel }
  }

  if (criteria.primarySubject && criteria.primarySubject.length > 0) {
    whereClause.primarySubject = { in: criteria.primarySubject }
  }

  // Technical metrics
  if (criteria.rescheduleRateMin !== undefined || criteria.rescheduleRateMax !== undefined) {
    whereClause.rescheduleRate = {}
    if (criteria.rescheduleRateMin !== undefined) {
      whereClause.rescheduleRate.gte = criteria.rescheduleRateMin
    }
    if (criteria.rescheduleRateMax !== undefined) {
      whereClause.rescheduleRate.lte = criteria.rescheduleRateMax
    }
  }

  // Last login
  if (criteria.daysSinceLoginMin !== undefined) {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - criteria.daysSinceLoginMin)
    whereClause.lastLogin = { lte: threshold }
  }

  // Fetch tutors with aggregates
  const tutors = await prisma.tutor.findMany({
    where: whereClause,
    include: {
      aggregates: true
    },
    take: criteria.limit || 1000
  })

  // Filter by aggregate criteria (not directly available in Prisma where)
  const filteredTutors = tutors.filter(tutor => {
    if (!tutor.aggregates) return false

    const agg = tutor.aggregates

    // Performance filters
    if (criteria.avgEngagementMin !== undefined && agg.avgEngagementScore < criteria.avgEngagementMin) {
      return false
    }
    if (criteria.avgEngagementMax !== undefined && agg.avgEngagementScore > criteria.avgEngagementMax) {
      return false
    }
    if (criteria.avgRatingMin !== undefined && agg.avgRating30d < criteria.avgRatingMin) {
      return false
    }
    if (criteria.avgRatingMax !== undefined && agg.avgRating30d > criteria.avgRatingMax) {
      return false
    }

    // Churn risk
    if (criteria.churnRiskLevel && !criteria.churnRiskLevel.includes(agg.churnRiskLevel as any)) {
      return false
    }

    // Behavioral
    if (criteria.totalSessions7dMin !== undefined && agg.totalSessions7d < criteria.totalSessions7dMin) {
      return false
    }
    if (criteria.totalSessions7dMax !== undefined && agg.totalSessions7d > criteria.totalSessions7dMax) {
      return false
    }
    if (criteria.poorFirstSession !== undefined && agg.poorFirstSessionFlag !== criteria.poorFirstSession) {
      return false
    }

    // Technical
    if (criteria.technicalIssueRateMin !== undefined && agg.technicalIssueRate < criteria.technicalIssueRateMin) {
      return false
    }
    if (criteria.technicalIssueRateMax !== undefined && agg.technicalIssueRate > criteria.technicalIssueRateMax) {
      return false
    }

    return true
  })

  // Calculate match score and matched criteria for each tutor
  const results = filteredTutors.map(tutor => {
    const matchedCriteria: string[] = []
    let score = 0

    if (criteria.avgEngagementMin !== undefined || criteria.avgEngagementMax !== undefined) {
      matchedCriteria.push('Engagement Score')
      score += 10
    }
    if (criteria.churnRiskLevel && criteria.churnRiskLevel.length > 0) {
      matchedCriteria.push('Churn Risk')
      score += 15
    }
    if (criteria.daysSinceLoginMin !== undefined) {
      matchedCriteria.push('Login Activity')
      score += 10
    }
    if (criteria.poorFirstSession) {
      matchedCriteria.push('First Session Performance')
      score += 12
    }
    if (criteria.technicalIssueRateMin !== undefined) {
      matchedCriteria.push('Technical Issues')
      score += 8
    }
    if (criteria.rescheduleRateMin !== undefined) {
      matchedCriteria.push('Reliability')
      score += 8
    }

    return {
      tutorId: tutor.tutorId,
      matchedCriteria,
      score
    }
  })

  // Sort by score (highest first)
  results.sort((a, b) => b.score - a.score)

  return {
    tutors: results,
    totalMatches: results.length,
    criteria
  }
}

/**
 * Get pre-defined targeting segments
 */
export function getPredefinedSegments(): Record<string, TargetingCriteria> {
  return {
    'high_churn_risk': {
      churnRiskLevel: ['High'],
      activeStatus: true
    },
    
    'disengaged_tutors': {
      daysSinceLoginMin: 7,
      activeStatus: true
    },
    
    'low_engagement': {
      avgEngagementMax: 6.0,
      activeStatus: true
    },
    
    'poor_first_sessions': {
      poorFirstSession: true,
      activeStatus: true
    },
    
    'technical_issues': {
      technicalIssueRateMin: 0.15,
      activeStatus: true
    },
    
    'high_reschedule_rate': {
      rescheduleRateMin: 0.15,
      activeStatus: true
    },
    
    'new_tutors': {
      monthsExperienceMax: 3,
      activeStatus: true
    },
    
    'star_performers': {
      avgEngagementMin: 8.0,
      avgRatingMin: 4.5,
      churnRiskLevel: ['Low'],
      activeStatus: true
    },
    
    'at_risk_quality': {
      avgEngagementMax: 6.5,
      avgRatingMax: 4.0,
      activeStatus: true
    },
    
    'inactive_14d': {
      daysSinceLoginMin: 14,
      activeStatus: true
    }
  }
}

/**
 * Preview targeting results (sample)
 */
export async function previewTargeting(
  criteria: TargetingCriteria,
  sampleSize: number = 10
): Promise<TargetingResult> {
  const result = await findTargetTutors({
    ...criteria,
    limit: sampleSize
  })

  return result
}

/**
 * Estimate audience size without fetching all data
 */
export async function estimateAudienceSize(
  criteria: TargetingCriteria
): Promise<number> {
  const result = await findTargetTutors(criteria)
  return result.totalMatches
}

