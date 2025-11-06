#!/usr/bin/env tsx

/**
 * Generate Alerts Script
 * 
 * Standalone script to generate alerts for all tutors.
 * Can be run manually or scheduled via cron.
 * 
 * Usage:
 *   npx tsx scripts/generate-alerts.ts
 */

import { generateAlerts, getAlertStatistics } from '../lib/alerts/generator'

async function main() {
  console.log('=== Alert Generation Script ===')
  console.log(`Started at: ${new Date().toISOString()}\n`)

  try {
    // Generate alerts
    const result = await generateAlerts()

    console.log('\n=== Results ===')
    console.log(`Alerts generated: ${result.generated}`)
    console.log(`Alerts skipped (cooldown): ${result.skipped}`)
    console.log(`Errors: ${result.errors}`)

    if (result.generated > 0) {
      console.log('\n=== Generated Alerts ===')
      
      // Group by severity
      const bySeverity: Record<string, number> = {}
      const byCategory: Record<string, number> = {}
      
      for (const alert of result.alerts) {
        bySeverity[alert.severity] = (bySeverity[alert.severity] || 0) + 1
        byCategory[alert.category] = (byCategory[alert.category] || 0) + 1
      }

      console.log('\nBy Severity:')
      Object.entries(bySeverity).forEach(([severity, count]) => {
        console.log(`  ${severity}: ${count}`)
      })

      console.log('\nBy Category:')
      Object.entries(byCategory).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}`)
      })

      // Show top 5 highest priority alerts
      const topAlerts = result.alerts
        .sort((a, b) => b.priorityScore - a.priorityScore)
        .slice(0, 5)

      console.log('\nTop 5 Priority Alerts:')
      topAlerts.forEach((alert, index) => {
        console.log(`  ${index + 1}. [${alert.severity.toUpperCase()}] ${alert.title}`)
        console.log(`     Tutor: ${alert.tutorId}`)
        console.log(`     Priority: ${alert.priorityScore}`)
      })
    }

    // Get overall statistics
    console.log('\n=== Overall Statistics (Last 7 Days) ===')
    const stats = await getAlertStatistics(7)
    console.log(`Total alerts: ${stats.total}`)
    console.log(`Acknowledged: ${stats.acknowledged}`)
    console.log(`Resolved: ${stats.resolved}`)
    console.log(`Unacknowledged: ${stats.unacknowledged}`)

    console.log('\n=== Completed Successfully ===')
    process.exit(0)

  } catch (error) {
    console.error('\n=== Error ===')
    console.error(error)
    process.exit(1)
  }
}

main()
