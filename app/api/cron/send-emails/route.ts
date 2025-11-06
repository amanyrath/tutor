import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendInterventionEmail } from '@/lib/email/sender'
import {
  renderEngagementAlertEmail,
  renderQualityAlertEmail,
  renderTechnicalIssuesEmail,
  renderFirstSessionReminderEmail,
  renderReengagementEmail
} from '@/lib/email/templates'

export const runtime = 'nodejs'

interface EmailJob {
  interventionId: string
  tutorId: string
  tutorEmail: string
  type: string
  subject: string
  html: string
}

// This endpoint is designed to be called by Vercel Cron or external scheduler
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if provided
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting email sending cron job...')
    const startTime = Date.now()

    // Get pending interventions that need to be sent
    const pendingInterventions = await prisma.intervention.findMany({
      where: {
        status: 'pending',
        sentAt: null
      },
      include: {
        tutor: true
      },
      take: 50 // Limit batch size
    })

    console.log(`Found ${pendingInterventions.length} pending interventions`)

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    }

    // Process each intervention
    for (const intervention of pendingInterventions) {
      try {
        // Generate email content based on intervention type
        let html: string
        let subject: string = intervention.subject || 'Message from Tutor Platform'

        // For now, use the stored content
        // In production, you'd render templates based on intervention type
        html = intervention.content

        // Send email
        const result = await sendInterventionEmail(
          intervention.id,
          intervention.tutorId,
          `${intervention.tutorId}@example.com`, // Replace with actual tutor email lookup
          intervention.interventionType,
          subject,
          html
        )

        if (result.success) {
          // Update intervention status
          await prisma.intervention.update({
            where: { id: intervention.id },
            data: {
              status: 'sent',
              sentAt: new Date()
            }
          })
          results.sent++
        } else {
          // Mark as failed
          await prisma.intervention.update({
            where: { id: intervention.id },
            data: {
              status: 'failed',
              errorMessage: result.error || 'Unknown error'
            }
          })
          results.failed++
          if (result.error) {
            results.errors.push(result.error)
          }
        }

      } catch (error) {
        console.error(`Error sending intervention ${intervention.id}:`, error)
        results.failed++
        results.errors.push(error instanceof Error ? error.message : String(error))

        // Update intervention with error
        await prisma.intervention.update({
          where: { id: intervention.id },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : String(error)
          }
        })
      }

      // Small delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const duration = Date.now() - startTime

    console.log(`Email sending completed in ${duration}ms: ${results.sent} sent, ${results.failed} failed`)

    return NextResponse.json({
      success: true,
      results,
      duration,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in send-emails cron:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Email sending failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// Allow manual triggering via POST
export async function POST(request: NextRequest) {
  return GET(request)
}
