/**
 * Email Sender
 * 
 * Handles email delivery using Resend with tracking capabilities
 */

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
  tags?: Array<{ name: string; value: string }>
}

export interface EmailTrackingData {
  interventionId?: string
  tutorId: string
  emailType: string
}

export interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Send an email using Resend
 */
export async function sendEmail(
  options: EmailOptions,
  tracking?: EmailTrackingData
): Promise<SendEmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, email not sent (development mode)')
      return {
        success: false,
        error: 'RESEND_API_KEY not configured'
      }
    }

    const from = options.from || process.env.EMAIL_FROM || 'Tutor Platform <noreply@tutorplatform.com>'
    const replyTo = options.replyTo || process.env.EMAIL_REPLY_TO

    // Add tracking tags
    const tags = options.tags || []
    if (tracking) {
      if (tracking.interventionId) {
        tags.push({ name: 'intervention_id', value: tracking.interventionId })
      }
      tags.push({ name: 'tutor_id', value: tracking.tutorId })
      tags.push({ name: 'email_type', value: tracking.emailType })
    }

    const result = await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo,
      tags
    })

    if (result.error) {
      console.error('Resend API error:', result.error)
      return {
        success: false,
        error: result.error.message
      }
    }

    return {
      success: true,
      messageId: result.data?.id
    }

  } catch (error) {
    console.error('Error sending email:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

/**
 * Send email with intervention tracking
 */
export async function sendInterventionEmail(
  interventionId: string,
  tutorId: string,
  tutorEmail: string,
  emailType: string,
  subject: string,
  html: string
): Promise<SendEmailResult> {
  return sendEmail(
    {
      to: tutorEmail,
      subject,
      html
    },
    {
      interventionId,
      tutorId,
      emailType
    }
  )
}

/**
 * Send bulk emails (with rate limiting)
 */
export async function sendBulkEmails(
  emails: Array<{
    to: string
    subject: string
    html: string
    tracking?: EmailTrackingData
  }>,
  options?: {
    batchSize?: number
    delayMs?: number
  }
): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const { batchSize = 10, delayMs = 1000 } = options || {}
  const results = {
    sent: 0,
    failed: 0,
    errors: [] as string[]
  }

  // Process in batches to avoid rate limits
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    
    const promises = batch.map(email => 
      sendEmail(
        {
          to: email.to,
          subject: email.subject,
          html: email.html
        },
        email.tracking
      )
    )

    const batchResults = await Promise.all(promises)

    for (const result of batchResults) {
      if (result.success) {
        results.sent++
      } else {
        results.failed++
        if (result.error) {
          results.errors.push(result.error)
        }
      }
    }

    // Delay between batches
    if (i + batchSize < emails.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  return results
}

/**
 * Get email delivery status (webhook handler would update database)
 */
export async function updateEmailStatus(
  interventionId: string,
  status: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained',
  timestamp: Date
): Promise<void> {
  // This would be called by Resend webhook
  // Update the intervention record in the database
  const { prisma } = await import('@/lib/db')

  const updateData: any = {}

  switch (status) {
    case 'delivered':
      updateData.deliveredAt = timestamp
      updateData.status = 'delivered'
      break
    case 'opened':
      updateData.openedAt = timestamp
      updateData.status = 'opened'
      break
    case 'clicked':
      updateData.clickedAt = timestamp
      updateData.status = 'clicked'
      break
    case 'bounced':
    case 'complained':
      updateData.status = 'failed'
      updateData.errorMessage = `Email ${status}`
      break
  }

  await prisma.intervention.update({
    where: { id: interventionId },
    data: updateData
  })
}

/**
 * Check if a tutor has unsubscribed from emails
 */
export async function isUnsubscribed(tutorId: string): Promise<boolean> {
  // TODO: Implement unsubscribe tracking in database
  // For now, return false (no one is unsubscribed)
  // Future: Check a TutorPreferences or Unsubscribe table
  return false
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(
  testEmail: string
): Promise<SendEmailResult> {
  return sendEmail({
    to: testEmail,
    subject: 'Tutor Platform Email Test',
    html: `
      <h1>Email Configuration Test</h1>
      <p>If you're reading this, your email configuration is working correctly!</p>
      <p>Timestamp: ${new Date().toISOString()}</p>
    `
  })
}

