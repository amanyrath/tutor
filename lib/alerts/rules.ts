/**
 * Alert Rules Engine
 * 
 * Defines all alert conditions and priority scoring logic for identifying
 * tutors who need intervention.
 */

import { prisma } from '@/lib/db'

type Tutor = NonNullable<Awaited<ReturnType<typeof prisma.tutor.findUnique>>>
type TutorAggregate = NonNullable<Awaited<ReturnType<typeof prisma.tutorAggregate.findUnique>>>

export type AlertType = 
  | 'no_login_7d'
  | 'no_sessions_14d'
  | 'declining_engagement'
  | 'low_engagement'
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
 * ALERT RULES EXPLANATION
 * 
 * Alert rules are evaluated for each tutor to identify issues that need intervention.
 * Each rule has:
 * - condition: Function that returns true if the alert should trigger
 * - messageTemplate: Template string with placeholders for dynamic values
 * - priorityScore: Higher scores indicate more urgent alerts (0-100)
 * - cooldownHours: Minimum time between alerts of same type for same tutor
 * 
 * ALERT LOGIC TYPES:
 * 1. ABSOLUTE THRESHOLDS: Trigger when a metric exceeds a fixed threshold
 *    Example: "Low Rating" triggers when rating < 3.5
 * 
 * 2. TREND DETECTION: Trigger when a metric shows a declining trend, even if
 *    absolute value is still acceptable. This catches issues early.
 *    Example: "Declining Engagement" can trigger on negative sentiment trend
 *    even if current engagement score is good (e.g., 7.6/10)
 * 
 * 3. BEHAVIORAL PATTERNS: Trigger based on activity patterns
 *    Example: "No Login 7+ Days" triggers when lastLogin is > 7 days ago
 * 
 * 4. COMPOSITE CONDITIONS: Trigger when multiple factors combine
 *    Example: "Churn Risk High" requires both High risk level AND >60% probability
 */
export const ALERT_RULES: AlertRule[] = [
  {
    type: 'churn_risk_high',
    severity: 'critical',
    category: 'churn',
    title: 'Critical Churn Risk Detected',
    messageTemplate: 'Tutor {tutorId} has {churnProbability}% churn probability with {signals} risk signals detected. Immediate intervention required.',
    condition: (tutor) => {
      /**
       * LOGIC: Composite condition - requires BOTH high risk level AND high probability
       * This prevents false positives from tutors who might have one risk factor
       * but not a comprehensive high-risk profile.
       */
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
      /**
       * LOGIC: Behavioral pattern detection
       * Triggers when tutor hasn't logged in for 7+ days, indicating disengagement.
       * Tutors with no lastLogin record are treated as never logged in (999 days).
       */
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
      /**
       * LOGIC: Activity pattern detection
       * Triggers when active tutor has zero sessions in last 7 days (indicates 14+ day gap).
       * Only checks active tutors to avoid alerting on intentionally inactive accounts.
       */
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
    title: 'Declining Engagement Trend Detected',
    messageTemplate: 'Tutor {tutorId} shows a declining engagement trend. Current score: {currentScore}/10. {trendExplanation}',
    condition: (tutor) => {
      if (!tutor.aggregates) return false
      const agg = tutor.aggregates
      
      /**
       * LOGIC EXPLANATION:
       * This alert detects DECLINING TRENDS in engagement, not just low absolute scores.
       * 
       * Two conditions can trigger this alert:
       * 1. Negative sentiment trend: If sentimentTrend7d < -0.5, this indicates a 
       *    significant decline in student sentiment over the past 7 days, even if 
       *    the overall engagement score is still good. This is a leading indicator.
       * 
       * 2. Low absolute score: If avgEngagementScore < 5.5, this indicates the 
       *    current engagement level is below acceptable threshold.
       * 
       * IMPORTANT: A tutor with a good engagement score (e.g., 7.6/10) can still 
       * trigger this alert if they show a negative sentiment trend, because this 
       * indicates they may be heading toward lower engagement. This is intentional 
       * to catch issues early before they become critical.
       */
      
      // Condition 1: Detect significant negative sentiment trend (leading indicator)
      // This catches declining trends even when absolute score is still acceptable
      if (agg.sentimentTrend7d !== null && agg.sentimentTrend7d < -0.5) {
        return true
      }
      
      // Condition 2: Detect low absolute engagement score (current state)
      // This catches tutors who already have low engagement
      return agg.avgEngagementScore < 5.5
    },
    getDetails: (tutor) => ({
      metric: 'engagement_score',
      metricValue: tutor.aggregates?.avgEngagementScore || 0,
      threshold: 5.5,
      sentimentTrend: tutor.aggregates?.sentimentTrend7d || null
    }),
    priorityScore: 70,
    cooldownHours: 120
  },
  
  {
    type: 'low_engagement',
    severity: 'high',
    category: 'engagement',
    title: 'Below Target Engagement Score',
    messageTemplate: 'Tutor {tutorId} has an engagement score of {currentScore}/10, which is below the target threshold of 6.0/10. {explanation}',
    condition: (tutor) => {
      if (!tutor.aggregates) return false
      const agg = tutor.aggregates
      
      /**
       * LOGIC: Absolute threshold detection
       * Triggers when engagement score is below 6.0/10 (target threshold).
       * 
       * This is different from "declining_engagement" which detects trends.
       * This alert focuses on the current absolute score being below target,
       * regardless of whether it's trending up or down.
       * 
       * Threshold of 6.0/10 aligns with intervention recommendations and represents
       * the minimum acceptable engagement level for active tutors.
       */
      
      return agg.avgEngagementScore < 6.0
    },
    getDetails: (tutor) => ({
      metric: 'engagement_score',
      metricValue: tutor.aggregates?.avgEngagementScore || 0,
      threshold: 6.0
    }),
    priorityScore: 75,
    cooldownHours: 120
  },
  
  {
    type: 'low_rating_trend',
    severity: 'high',
    category: 'quality',
    title: 'Low Rating in Recent Sessions',
    messageTemplate: 'Tutor {tutorId} received low ratings in last 7 days: {rating}/5.0. Quality concerns detected.',
    condition: (tutor) => {
      /**
       * LOGIC: Trend-based threshold detection
       * Triggers when 7-day average rating falls below 3.5/5.0.
       * Uses recent 7-day average rather than overall average to catch recent quality issues.
       */
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
      /**
       * LOGIC: Absolute threshold detection
       * Triggers when technical issue rate exceeds 15% of sessions.
       * This indicates equipment or connectivity problems affecting student experience.
       */
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
      /**
       * LOGIC: Flag-based detection
       * Triggers when poorFirstSessionFlag is true (set when avg first session rating < 3.5).
       * First impressions are critical - poor first sessions correlate with 24% higher churn.
       */
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
      /**
       * LOGIC: Absolute threshold detection
       * Triggers when reschedule rate exceeds 15% (target is <10%).
       * High reschedule rates indicate reliability issues that impact student trust.
       */
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
      /**
       * LOGIC: Proactive support detection
       * Triggers for tutors with <3 first sessions completed.
       * In production, this would check actual scheduled sessions, but for now
       * we proactively offer support to new tutors who may have upcoming first sessions.
       */
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
 * 
 * This function replaces placeholders in alert message templates with actual
 * tutor data values. Each alert rule defines its own message template with
 * placeholders like {tutorId}, {rating}, {rate}, etc.
 */
export function formatAlertMessage(
  rule: AlertRule,
  tutor: Tutor & { aggregates: TutorAggregate | null },
  details: ReturnType<AlertRule['getDetails']>
): string {
  let message = rule.messageTemplate

  // Replace tutor ID placeholder
  message = message.replace('{tutorId}', tutor.tutorId)

  // Format and replace metric values (rates/probabilities as percentages, others as decimals)
  if (details.metricValue !== undefined) {
    const formattedValue = details.metric?.includes('rate') || details.metric?.includes('probability')
      ? (details.metricValue * 100).toFixed(1)
      : details.metricValue.toFixed(2)
    
    message = message.replace('{rate}', formattedValue)
    message = message.replace('{rating}', formattedValue)
    message = message.replace('{churnProbability}', formattedValue)
  }

  // Replace churn signals count
  if (tutor.aggregates?.churnSignalsDetected) {
    message = message.replace('{signals}', tutor.aggregates.churnSignalsDetected.toString())
  }

  // Calculate and replace days since login
  if (message.includes('{daysSinceLogin}') && tutor.lastLogin) {
    const days = Math.floor((Date.now() - tutor.lastLogin.getTime()) / (1000 * 60 * 60 * 24))
    message = message.replace('{daysSinceLogin}', days.toString())
  }

  // Handle declining engagement alert - explain the trend
  if (rule.type === 'declining_engagement' && tutor.aggregates) {
    const currentScore = tutor.aggregates.avgEngagementScore.toFixed(1)
    message = message.replace('{currentScore}', currentScore)
    
    // Explain why the alert triggered
    let trendExplanation = ''
    const sentimentTrend = tutor.aggregates.sentimentTrend7d
    
    if (sentimentTrend !== null && sentimentTrend < -0.5) {
      // Alert triggered by negative sentiment trend
      trendExplanation = `Sentiment trend over past 7 days is ${sentimentTrend.toFixed(3)} (negative trend detected). `
      if (tutor.aggregates.avgEngagementScore >= 6.0) {
        trendExplanation += `While current engagement score (${currentScore}/10) is still good, the declining trend suggests potential issues ahead.`
      } else {
        trendExplanation += `Combined with current engagement score below threshold, intervention recommended.`
      }
    } else {
      // Alert triggered by low absolute score
      trendExplanation = `Current engagement score (${currentScore}/10) is below the acceptable threshold of 5.5/10.`
    }
    
    message = message.replace('{trendExplanation}', trendExplanation)
  }

  // Handle low engagement alert - explain threshold
  if (rule.type === 'low_engagement' && tutor.aggregates) {
    const currentScore = tutor.aggregates.avgEngagementScore.toFixed(1)
    message = message.replace('{currentScore}', currentScore)
    
    // Explain the threshold and what it means
    let explanation = ''
    if (tutor.aggregates.avgEngagementScore >= 5.5 && tutor.aggregates.avgEngagementScore < 6.0) {
      explanation = `This score is above the critical threshold (5.5) but below our target of 6.0/10. Students may not be participating as actively as desired.`
    } else {
      explanation = `This score is below our target threshold of 6.0/10. Students may not be participating as actively as desired, which can impact learning outcomes.`
    }
    
    message = message.replace('{explanation}', explanation)
  }

  // Legacy placeholders for backward compatibility
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
