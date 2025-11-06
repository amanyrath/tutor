/**
 * Alert Generation Engine
 * 
 * Scans all tutors and generates alerts based on defined rules.
 * Handles deduplication and cooldown periods.
 */

import { prisma } from '@/lib/db'
import {
  evaluateAlertRules,
  formatAlertMessage,
  calculateTutorPriorityScore,
  isAlertInCooldown,
  ALERT_RULES
} from './rules'

export interface GeneratedAlert {
  tutorId: string
  severity: string
  category: string
  title: string
  message: string
  metric: string | null
  metricValue: number | null
  threshold: number | null
  priorityScore: number
}

export interface AlertGenerationResult {
  generated: number
  skipped: number
  errors: number
  alerts: GeneratedAlert[]
}

/**
 * Generate alerts for all active tutors
 */
export async function generateAlerts(): Promise<AlertGenerationResult> {
  const result: AlertGenerationResult = {
    generated: 0,
    skipped: 0,
    errors: 0,
    alerts: []
  }

  try {
    // Fetch all active tutors with their aggregates
    const tutors = await prisma.tutor.findMany({
      where: {
        activeStatus: true
      },
      include: {
        aggregates: true
      }
    })

    console.log(`Evaluating alerts for ${tutors.length} active tutors...`)

    for (const tutor of tutors) {
      try {
        // Evaluate all rules for this tutor
        const triggeredAlerts = evaluateAlertRules(tutor)

        if (triggeredAlerts.length === 0) {
          continue
        }

        // Calculate overall priority for this tutor
        const overallPriority = calculateTutorPriorityScore(triggeredAlerts)

        // Check existing alerts to avoid duplicates within cooldown period
        const existingAlerts = await prisma.alert.findMany({
          where: {
            tutorId: tutor.tutorId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })

        // Process each triggered alert
        for (const alert of triggeredAlerts) {
          // Check if this alert type is in cooldown
          const lastAlert = existingAlerts.find(a => 
            a.category === alert.category && 
            a.severity === alert.severity
          )

          if (lastAlert && isAlertInCooldown(
            tutor.tutorId,
            alert.type,
            lastAlert.createdAt,
            alert.cooldownHours
          )) {
            result.skipped++
            continue
          }

          // Format alert message
          const message = formatAlertMessage(alert, tutor, alert.details)

          // Create alert in database
          const createdAlert = await prisma.alert.create({
            data: {
              tutorId: tutor.tutorId,
              severity: alert.severity,
              category: alert.category,
              title: alert.title,
              message,
              metric: alert.details.metric || null,
              metricValue: alert.details.metricValue || null,
              threshold: alert.details.threshold || null,
              isAcknowledged: false,
              isResolved: false
            }
          })

          result.generated++
          result.alerts.push({
            tutorId: tutor.tutorId,
            severity: alert.severity,
            category: alert.category,
            title: alert.title,
            message,
            metric: alert.details.metric || null,
            metricValue: alert.details.metricValue || null,
            threshold: alert.details.threshold || null,
            priorityScore: overallPriority
          })
        }

      } catch (error) {
        console.error(`Error generating alerts for tutor ${tutor.tutorId}:`, error)
        result.errors++
      }
    }

    console.log(`Alert generation complete: ${result.generated} generated, ${result.skipped} skipped, ${result.errors} errors`)

  } catch (error) {
    console.error('Error in alert generation process:', error)
    throw error
  }

  return result
}

/**
 * Generate alerts for a specific tutor
 */
export async function generateAlertsForTutor(tutorId: string): Promise<GeneratedAlert[]> {
  const tutor = await prisma.tutor.findUnique({
    where: { tutorId },
    include: { aggregates: true }
  })

  if (!tutor) {
    throw new Error(`Tutor ${tutorId} not found`)
  }

  const triggeredAlerts = evaluateAlertRules(tutor)
  const generatedAlerts: GeneratedAlert[] = []

  for (const alert of triggeredAlerts) {
    const message = formatAlertMessage(alert, tutor, alert.details)
    const overallPriority = calculateTutorPriorityScore(triggeredAlerts)

    const createdAlert = await prisma.alert.create({
      data: {
        tutorId: tutor.tutorId,
        severity: alert.severity,
        category: alert.category,
        title: alert.title,
        message,
        metric: alert.details.metric || null,
        metricValue: alert.details.metricValue || null,
        threshold: alert.details.threshold || null,
        isAcknowledged: false,
        isResolved: false
      }
    })

    generatedAlerts.push({
      tutorId: tutor.tutorId,
      severity: alert.severity,
      category: alert.category,
      title: alert.title,
      message,
      metric: alert.details.metric || null,
      metricValue: alert.details.metricValue || null,
      threshold: alert.details.threshold || null,
      priorityScore: overallPriority
    })
  }

  return generatedAlerts
}

/**
 * Get alert statistics
 */
export async function getAlertStatistics(days: number = 7): Promise<{
  total: number
  bySeverity: Record<string, number>
  byCategory: Record<string, number>
  acknowledged: number
  resolved: number
  unacknowledged: number
}> {
  const dateThreshold = new Date()
  dateThreshold.setDate(dateThreshold.getDate() - days)

  const alerts = await prisma.alert.findMany({
    where: {
      createdAt: {
        gte: dateThreshold
      }
    }
  })

  const bySeverity: Record<string, number> = {}
  const byCategory: Record<string, number> = {}
  let acknowledged = 0
  let resolved = 0

  for (const alert of alerts) {
    bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1
    byCategory[alert.category] = (byCategory[alert.category] || 0) + 1
    if (alert.isAcknowledged) acknowledged++
    if (alert.isResolved) resolved++
  }

  return {
    total: alerts.length,
    bySeverity,
    byCategory,
    acknowledged,
    resolved,
    unacknowledged: alerts.length - acknowledged
  }
}

/**
 * Acknowledge an alert
 */
export async function acknowledgeAlert(
  alertId: string,
  acknowledgedBy: string
): Promise<void> {
  await prisma.alert.update({
    where: { id: alertId },
    data: {
      isAcknowledged: true,
      acknowledgedAt: new Date(),
      acknowledgedBy
    }
  })
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: string): Promise<void> {
  await prisma.alert.update({
    where: { id: alertId },
    data: {
      isResolved: true,
      resolvedAt: new Date()
    }
  })
}

/**
 * Update existing alerts with new message formats
 * This regenerates messages for existing alerts based on current rules
 */
export async function updateExistingAlertMessages(): Promise<{
  updated: number
  errors: number
}> {
  const result = { updated: 0, errors: 0 }

  try {
    // Get all unresolved alerts
    const alerts = await prisma.alert.findMany({
      where: {
        isResolved: false
      },
      include: {
        tutor: {
          include: {
            aggregates: true
          }
        }
      }
    })

    console.log(`Updating messages for ${alerts.length} existing alerts...`)

    for (const alert of alerts) {
      try {
        // Re-evaluate all rules for this tutor to see which alerts should exist
        const triggeredAlerts = evaluateAlertRules(alert.tutor)
        
        // Try to match alert by various criteria
        let matchingRule: typeof ALERT_RULES[0] | undefined
        let matchingAlert: ReturnType<typeof evaluateAlertRules>[0] | undefined

        // First, try exact title match
        matchingRule = ALERT_RULES.find(r => r.title === alert.title)
        if (matchingRule) {
          matchingAlert = triggeredAlerts.find(a => a.type === matchingRule!.type)
        }

        // If no exact match, try matching by category/severity and metric
        if (!matchingRule) {
          // Handle special case: "Below Target Engagement Score" -> "low_engagement"
          if (alert.title.includes('Below Target') && alert.category === 'engagement') {
            matchingRule = ALERT_RULES.find(r => r.type === 'low_engagement')
            matchingAlert = triggeredAlerts.find(a => a.type === 'low_engagement')
          }
          // Handle "Declining Engagement" -> "declining_engagement"
          else if (alert.title.includes('Declining') && alert.category === 'engagement') {
            matchingRule = ALERT_RULES.find(r => r.type === 'declining_engagement')
            matchingAlert = triggeredAlerts.find(a => a.type === 'declining_engagement')
          }
          // Try matching by category and severity
          else {
            matchingRule = ALERT_RULES.find(r => 
              r.category === alert.category && r.severity === alert.severity
            )
            if (matchingRule) {
              matchingAlert = triggeredAlerts.find(a => a.type === matchingRule!.type)
            }
          }
        }

        if (!matchingRule) {
          console.warn(`No matching rule found for alert ${alert.id} with title "${alert.title}"`)
          continue
        }

        if (!matchingAlert) {
          // Alert condition no longer matches - this is okay, skip updating
          console.log(`Alert ${alert.id} condition no longer matches, skipping update`)
          continue
        }

        // Generate new message using current format
        const newMessage = formatAlertMessage(matchingRule, alert.tutor, matchingAlert.details)

        // Update the alert with new message and details
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            message: newMessage,
            title: matchingRule.title, // Update title in case it changed
            metric: matchingAlert.details.metric || null,
            metricValue: matchingAlert.details.metricValue || null,
            threshold: matchingAlert.details.threshold || null
          }
        })

        result.updated++
      } catch (error) {
        console.error(`Error updating alert ${alert.id}:`, error)
        result.errors++
      }
    }

    console.log(`Alert message update complete: ${result.updated} updated, ${result.errors} errors`)
  } catch (error) {
    console.error('Error in alert message update process:', error)
    throw error
  }

  return result
}

/**
 * Get alerts for a specific tutor
 */
export async function getTutorAlerts(
  tutorId: string,
  options?: {
    includeResolved?: boolean
    limit?: number
  }
): Promise<any[]> {
  const { includeResolved = false, limit = 50 } = options || {}

  return await prisma.alert.findMany({
    where: {
      tutorId,
      ...(includeResolved ? {} : { isResolved: false })
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit
  })
}

/**
 * Get high priority alerts (unacknowledged critical/high severity)
 */
export async function getHighPriorityAlerts(limit: number = 20): Promise<any[]> {
  return await prisma.alert.findMany({
    where: {
      isAcknowledged: false,
      isResolved: false,
      severity: {
        in: ['critical', 'high']
      }
    },
    include: {
      tutor: {
        select: {
          tutorId: true,
          primarySubject: true,
          monthsExperience: true
        }
      }
    },
    orderBy: [
      { severity: 'asc' }, // critical comes first
      { createdAt: 'desc' }
    ],
    take: limit
  })
}
