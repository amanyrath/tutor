import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email/sender';
import EngagementAlertEmail from '@/lib/email/templates/engagement-alert-email';
import QualityAlertEmail from '@/lib/email/templates/quality-alert-email';
import TechnicalIssuesEmail from '@/lib/email/templates/technical-issues-email';
import ReEngagementEmail from '@/lib/email/templates/re-engagement-email';
import { isUnsubscribed } from '@/lib/email/sender';
import { render } from '@react-email/render';

export interface EmailSendResult {
  sent: number;
  failed: number;
  skipped: number;
  errors: string[];
}

/**
 * Send pending interventions via email
 */
export async function sendPendingInterventionEmails(): Promise<EmailSendResult> {
  const result: EmailSendResult = {
    sent: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    // Get pending interventions that should be sent via email
    const pendingInterventions = await prisma.intervention.findMany({
      where: {
        status: 'pending',
        channel: 'email',
        // Only send interventions created more than 5 minutes ago
        // This gives time for manual cancellation if needed
        createdAt: {
          lt: new Date(Date.now() - 5 * 60 * 1000),
        },
      },
      include: {
        tutor: {
          include: {
            aggregates: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: 100, // Process in batches
    });

    console.log(`Found ${pendingInterventions.length} pending interventions to send`);

    for (const intervention of pendingInterventions) {
      try {
        // Check if tutor has unsubscribed
        if (await isUnsubscribed(intervention.tutorId)) {
          await prisma.intervention.update({
            where: { id: intervention.id },
            data: {
              status: 'failed',
              errorMessage: 'Tutor has unsubscribed from emails',
            },
          });
          result.skipped++;
          continue;
        }

        // Generate email template based on intervention type
        const emailTemplate = generateEmailTemplate(intervention);
        
        if (!emailTemplate) {
          result.skipped++;
          await prisma.intervention.update({
            where: { id: intervention.id },
            data: {
              status: 'failed',
              errorMessage: 'No email template found for intervention type',
            },
          });
          continue;
        }

        // Get tutor email (mock for now - in production, fetch from tutor profile)
        const tutorEmail = getTutorEmail(intervention.tutor);

        // Render email template
        const htmlContent = await render(emailTemplate);

        // Send email
        const sendResult = await sendEmail({
          to: tutorEmail,
          subject: intervention.subject || 'Message from Your Tutor Success Team',
          html: htmlContent,
        });

        if (sendResult.success) {
          result.sent++;
        } else {
          result.failed++;
          result.errors.push(
            `Failed to send email for intervention ${intervention.id}: ${sendResult.error}`
          );
        }

        // Add delay to avoid rate limiting (100ms between emails)
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        result.failed++;
        result.errors.push(
          `Error processing intervention ${intervention.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log(`Email sending complete. Sent: ${result.sent}, Failed: ${result.failed}, Skipped: ${result.skipped}`);

  } catch (error) {
    result.errors.push(
      `Fatal error in email sending: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }

  return result;
}

/**
 * Generate email template based on intervention type
 */
function generateEmailTemplate(intervention: any): React.ReactElement | null {
  const { tutor, interventionType, content } = intervention;
  const tutorName = `Tutor ${tutor.tutorId}`;
  const actionUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`;

  switch (interventionType) {
    case 'engagement':
    case 'no_login':
      return EngagementAlertEmail({
        tutorName,
        issueType: 'no_login',
        daysSinceLastLogin: calculateDaysSince(tutor.lastLogin),
        actionUrl,
      });

    case 'no_sessions':
      return EngagementAlertEmail({
        tutorName,
        issueType: 'no_sessions',
        daysSinceLastSession: 14, // Calculate from sessions
        actionUrl,
      });

    case 'quality':
    case 'low_rating':
      return QualityAlertEmail({
        tutorName,
        alertType: 'low_rating',
        metricValue: tutor.aggregates?.avgRating7d || 0,
        benchmark: 4.5,
        recentSessionCount: tutor.aggregates?.totalSessions7d || 0,
        actionUrl,
      });

    case 'low_engagement':
      return QualityAlertEmail({
        tutorName,
        alertType: 'poor_engagement',
        metricValue: tutor.aggregates?.avgEngagementScore || 0,
        benchmark: 6.0,
        recentSessionCount: tutor.aggregates?.totalSessions7d || 0,
        actionUrl,
      });

    case 'technical':
      return TechnicalIssuesEmail({
        tutorName,
        issueRate: tutor.aggregates?.technicalIssueRate || 0,
        recentSessionsWithIssues: Math.floor(
          (tutor.aggregates?.technicalIssueRate || 0) * (tutor.aggregates?.totalSessions30d || 0)
        ),
        totalRecentSessions: tutor.aggregates?.totalSessions30d || 0,
        actionUrl: `${actionUrl}/support`,
      });

    case 're_engagement':
      return ReEngagementEmail({
        tutorName,
        daysSinceLastActivity: calculateDaysSince(tutor.lastLogin),
        totalSessionsCompleted: tutor.totalSessions,
        averageRating: tutor.avgHistoricalRating,
        actionUrl,
      });

    default:
      console.warn(`Unknown intervention type: ${interventionType}`);
      return null;
  }
}

/**
 * Get tutor email (mock for now)
 */
function getTutorEmail(tutor: any): string {
  // In production, this would fetch from tutor profile
  // For now, generate a mock email
  return `tutor-${tutor.tutorId.toLowerCase()}@example.com`;
}

/**
 * Calculate days since a date
 */
function calculateDaysSince(date: Date | null): number {
  if (!date) return 999;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Create intervention from alert
 */
export async function createInterventionFromAlert(alertId: string): Promise<string> {
  const alert = await prisma.alert.findUnique({
    where: { id: alertId },
    include: {
      tutor: true,
    },
  });

  if (!alert) {
    throw new Error(`Alert ${alertId} not found`);
  }

  // Map alert category to intervention type
  const interventionTypeMap: Record<string, string> = {
    engagement: 'engagement',
    quality: 'quality',
    technical: 'technical',
    churn: 're_engagement',
  };

  const intervention = await prisma.intervention.create({
    data: {
      tutorId: alert.tutorId,
      interventionType: interventionTypeMap[alert.category] || 'engagement',
      channel: 'email',
      subject: alert.title,
      content: alert.message,
      status: 'pending',
    },
  });

  return intervention.id;
}

