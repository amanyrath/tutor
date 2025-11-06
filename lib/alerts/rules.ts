/**
 * Alert Rules Engine
 * 
 * Defines all alert conditions and priority scoring logic for identifying
 * tutors who need intervention.
 */

import { Tutor, TutorAggregate } from '@prisma/client'

export type AlertType = 
  | 'no_login_7d'
  | 'no_sessions_14d'
  | 'declining_engagement'
  | 'first_session_scheduled'
  | 'low_rating_trend'
  | 'technical_issues_spike'
  | 'high_reschedule_rate'
  | 'poor_first_session'
  | 'churn_risk_high'

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

export type AlertCategory = 'churn' | 'quality' | 'technical' | 'engagement' | 'reliability'

export interface AlertRule {
  type: AlertType
  severity: AlertSeverity
  category: AlertCategory
  title: string
  messageTemplate: string
  condition: (tutor: Tutor & { aggregates: TutorAggregate | null }) => boolean
  getDetails: (tutor: Tutor & { aggregates: TutorAggregate | null }) => {
    metric?: string
    metricValue?: number
    threshold?: number
  }
  priorityScore: number
  cooldownHours: number // Minimum hours between alerts of this type for same tutor
}

/**
 * Define all alert rules
 */
export const ALERT_RULES: AlertRule[] = [
  {
    type: 'churn_risk_high',
    severity: 'critical',
    category: 'churn',
    title: 'Critical Churn Risk Detected',
    messageTemplate: 'Tutor {tutorId} has {churnProbability}% churn probability with {signals} risk signals detected. Immediate intervention required.',
    condition: (tutor) => {
      return tutor.aggregates?.churnRiskLevel === 'High' && 
             tutor.aggregates.churnProbability > 0.6
    },
    getDetails: (tutor) => ({
      metric: 'churn_probability',
      metricValue: tutor.aggregates?.churnProbability || 0,
      threshold: 0.6
    }),
    priorityScore: 100,
    cooldownHours: 48
  },
  
  {
    type: 'no_login_7d',
    severity: 'high',
    category: 'engagement',
    title: 'No Login Activity (7+ Days)',
    messageTemplate: 'Tutor {tutorId} has not logged in for {daysSinceLogin} days. Risk of disengagement.',
    condition: (tutor) => {
      if (!tutor.lastLogin) return true
      const daysSince = (Date.now() - tutor.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
      return daysSince >= 7
    },
    getDetails: (tutor) => {
      const daysSince = tutor.lastLogin 
        ? (Date.now() - tutor.lastLogin.getTime()) / (1000 * 60 * 60 * 24)
        : 999
      return {
        metric: 'days_since_login',
        metricValue: Math.floor(daysSince),
        threshold: 7
      }
    },
    priorityScore: 80,
    cooldownHours: 72
  },
  
  {
    type: 'no_sessions_14d',
    severity: 'critical',
    category: 'engagement',
    title: 'No Sessions Completed (14+ Days)',
    messageTemplate: 'Tutor {tutorId} has not completed any sessions in the last 14 days. Critical activation issue.',
    condition: (tutor) => {
      return tutor.aggregates?.totalSessions7d === 0 && tutor.activeStatus === true
    },
    getDetails: (tutor) => ({
      metric: 'sessions_7d',
      metricValue: tutor.aggregates?.totalSessions7d || 0,
      threshold: 1
    }),
    priorityScore: 95,
    cooldownHours: 48
  },
  
  {
    type: 'declining_engagement',
    severity: 'high',
    category: 'engagement',
    title: 'Declining Engagement Trend',
    messageTemplate: 'Tutor {tutorId} shows declining engagement: 7-day avg ({recent}) vs 30-day avg ({historical}).',
    condition: (tutor) => {
      if (!tutor.aggregates) return false
      const agg = tutor.aggregates
      
      // Calculate 7-day average engagement from recent data
      // For this rule, we'll use sentimentTrend7d as a proxy
      // In production, calculate this from actual 7-day session data
      if (agg.sentimentTrend7d !== null && agg.sentimentTrend7d < -0.5) {
        return true
      }
      
      // Also check if current engagement is significantly lower than historical
      return agg.avgEngagementScore < 5.5
    },
    getDetails: (tutor) => ({
      metric: 'engagement_score',
      metricValue: tutor.aggregates?.avgEngagementScore || 0,
      threshold: 5.5
    }),
    priorityScore: 70,
    cooldownHours: 120
  },
  
  {
    type: 'low_rating_trend',
    severity: 'high',
    category: 'quality',
    title: 'Low Rating in Recent Sessions',
    messageTemplate: 'Tutor {tutorId} received low ratings in last 7 days: {rating}/5.0. Quality concerns detected.',
    condition: (tutor) => {
      if (!tutor.aggregates?.avgRating7d) return false
      return tutor.aggregates.avgRating7d < 3.5
    },
    getDetails: (tutor) => ({
      metric: 'avg_rating_7d',
      metricValue: tutor.aggregates?.avgRating7d || 0,
      threshold: 3.5
    }),
    priorityScore: 85,
    cooldownHours: 72
  },
  
  {
    type: 'technical_issues_spike',
    severity: 'medium',
    category: 'technical',
    title: 'High Technical Issue Rate',
    messageTemplate: 'Tutor {tutorId} experiencing technical issues in {rate}% of sessions. IT support may be needed.',
    condition: (tutor) => {
      return tutor.aggregates !== null && tutor.aggregates.technicalIssueRate > 0.15
    },
    getDetails: (tutor) => ({
      metric: 'technical_issue_rate',
      metricValue: tutor.aggregates?.technicalIssueRate || 0,
      threshold: 0.15
    }),
    priorityScore: 50,
    cooldownHours: 96
  },
  
  {
    type: 'poor_first_session',
    severity: 'high',
    category: 'quality',
    title: 'Poor First Session Performance',
    messageTemplate: 'Tutor {tutorId} has poor first session ratings (avg: {rating}/5.0). 24% higher churn risk.',
    condition: (tutor) => {
      return tutor.aggregates?.poorFirstSessionFlag === true
    },
    getDetails: (tutor) => ({
      metric: 'first_session_avg_rating',
      metricValue: tutor.aggregates?.firstSessionAvgRating || 0,
      threshold: 3.5
    }),
    priorityScore: 75,
    cooldownHours: 168 // 1 week
  },
  
  {
    type: 'high_reschedule_rate',
    severity: 'medium',
    category: 'reliability',
    title: 'High Reschedule Rate',
    messageTemplate: 'Tutor {tutorId} has {rate}% reschedule rate (target: <10%). Reliability concerns.',
    condition: (tutor) => {
      return tutor.rescheduleRate > 0.15
    },
    getDetails: (tutor) => ({
      metric: 'reschedule_rate',
      metricValue: tutor.rescheduleRate,
      threshold: 0.15
    }),
    priorityScore: 55,
    cooldownHours: 168
  },
  
  {
    type: 'first_session_scheduled',
    severity: 'low',
    category: 'engagement',
    title: 'First Session Preparation Reminder',
    messageTemplate: 'Tutor {tutorId} has an upcoming first session. Preparation support recommended.',
    condition: (tutor) => {
      // This would be triggered by actual session scheduling data
      // For now, we'll identify tutors with very few first sessions who might have one coming up
      return tutor.aggregates !== null && tutor.aggregates.firstSessionCount < 3
    },
    getDetails: (tutor) => ({
      metric: 'first_session_count',
      metricValue: tutor.aggregates?.firstSessionCount || 0,
      threshold: 3
    }),
    priorityScore: 30,
    cooldownHours: 72
  }
]

/**
 * Evaluate all rules for a tutor and return triggered alerts
 */
export function evaluateAlertRules(
  tutor: Tutor & { aggregates: TutorAggregate | null }
): Array<AlertRule & { details: ReturnType<AlertRule['getDetails']> }> {
  const triggeredAlerts: Array<AlertRule & { details: ReturnType<AlertRule['getDetails']> }> = []

  for (const rule of ALERT_RULES) {
    try {
      if (rule.condition(tutor)) {
        const details = rule.getDetails(tutor)
        triggeredAlerts.push({ ...rule, details })
      }
    } catch (error) {
      console.error(`Error evaluating rule ${rule.type} for tutor ${tutor.tutorId}:`, error)
    }
  }

  // Sort by priority score (highest first)
  triggeredAlerts.sort((a, b) => b.priorityScore - a.priorityScore)

  return triggeredAlerts
}

/**
 * Format alert message with tutor data
 */
export function formatAlertMessage(
  rule: AlertRule,
  tutor: Tutor & { aggregates: TutorAggregate | null },
  details: ReturnType<AlertRule['getDetails']>
): string {
  let message = rule.messageTemplate

  // Replace placeholders
  message = message.replace('{tutorId}', tutor.tutorId)

  if (details.metricValue !== undefined) {
    const formattedValue = details.metric?.includes('rate') || details.metric?.includes('probability')
      ? (details.metricValue * 100).toFixed(1)
      : details.metricValue.toFixed(2)
    
    message = message.replace('{rate}', formattedValue)
    message = message.replace('{rating}', formattedValue)
    message = message.replace('{churnProbability}', formattedValue)
  }

  if (tutor.aggregates?.churnSignalsDetected) {
    message = message.replace('{signals}', tutor.aggregates.churnSignalsDetected.toString())
  }

  // Calculate days since login if needed
  if (message.includes('{daysSinceLogin}') && tutor.lastLogin) {
    const days = Math.floor((Date.now() - tutor.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    message = message.replace('{daysSinceLogin}', days.toString())
  }

  // Add recent vs historical comparison if applicable
  if (message.includes('{recent}') && tutor.aggregates) {
    message = message.replace('{recent}', tutor.aggregates.avgEngagementScore.toFixed(2))
  }
  
  if (message.includes('{historical}') && tutor.aggregates) {
    message = message.replace('{historical}', tutor.aggregates.avgEngagementScore.toFixed(2))
  }

  return message
}

/**
 * Calculate overall priority score for a tutor based on all triggered alerts
 */
export function calculateTutorPriorityScore(
  triggeredAlerts: Array<AlertRule & { details: any }>
): number {
  if (triggeredAlerts.length === 0) return 0

  // Base score is the highest priority alert
  let score = triggeredAlerts[0].priorityScore

  // Add bonus points for multiple alerts (diminishing returns)
  for (let i = 1; i < Math.min(triggeredAlerts.length, 5); i++) {
    score += triggeredAlerts[i].priorityScore * 0.2
  }

  return Math.min(score, 100) // Cap at 100
}

/**
 * Check if alert should be suppressed due to cooldown period
 */
export function isAlertInCooldown(
  tutorId: string,
  alertType: AlertType,
  lastAlertTime: Date | null,
  cooldownHours: number
): boolean {
  if (!lastAlertTime) return false

  const hoursSinceLastAlert = (Date.now() - lastAlertTime.getTime()) / (1000 * 60 * 60)
  return hoursSinceLastAlert < cooldownHours
}

/**
 * Get alert rule by type
 */
export function getAlertRule(type: AlertType): AlertRule | undefined {
  return ALERT_RULES.find(rule => rule.type === type)
}

/**
 * Get all alert types by category
 */
export function getAlertTypesByCategory(category: AlertCategory): AlertType[] {
  return ALERT_RULES
    .filter(rule => rule.category === category)
    .map(rule => rule.type)
}

/**
 * Get all alert types by severity
 */
export function getAlertTypesBySeverity(severity: AlertSeverity): AlertType[] {
  return ALERT_RULES
    .filter(rule => rule.severity === severity)
    .map(rule => rule.type)
}
