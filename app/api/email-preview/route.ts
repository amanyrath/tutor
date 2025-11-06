import { NextResponse } from 'next/server';
import EngagementAlertEmail from '@/lib/email/templates/engagement-alert-email';
import FirstSessionReminderEmail from '@/lib/email/templates/first-session-reminder-email';
import QualityAlertEmail from '@/lib/email/templates/quality-alert-email';
import TechnicalIssuesEmail from '@/lib/email/templates/technical-issues-email';
import ReEngagementEmail from '@/lib/email/templates/re-engagement-email';
import { render } from '@react-email/render';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template') || 'engagement';

  let emailHtml: string;

  try {
    switch (template) {
      case 'engagement':
        emailHtml = await render(
          EngagementAlertEmail({
            tutorName: 'Sarah Johnson',
            issueType: 'no_login',
            daysSinceLastLogin: 7,
            actionUrl: 'https://tutorquality.com/dashboard',
          })
        );
        break;

      case 'first-session':
        emailHtml = await render(
          FirstSessionReminderEmail({
            tutorName: 'Michael Chen',
            sessionDate: 'Monday, November 10, 2024',
            sessionTime: '3:00 PM EST',
            subject: 'Algebra II',
            gradeLevel: '10th Grade',
            actionUrl: 'https://tutorquality.com/sessions/12345',
          })
        );
        break;

      case 'quality':
        emailHtml = await render(
          QualityAlertEmail({
            tutorName: 'Emily Rodriguez',
            alertType: 'low_rating',
            metricValue: 3.8,
            benchmark: 4.5,
            recentSessionCount: 10,
            actionUrl: 'https://tutorquality.com/dashboard',
          })
        );
        break;

      case 'technical':
        emailHtml = await render(
          TechnicalIssuesEmail({
            tutorName: 'David Kim',
            issueRate: 0.15,
            recentSessionsWithIssues: 3,
            totalRecentSessions: 20,
            actionUrl: 'https://tutorquality.com/support',
          })
        );
        break;

      case 're-engagement':
        emailHtml = await render(
          ReEngagementEmail({
            tutorName: 'Lisa Martinez',
            daysSinceLastActivity: 21,
            totalSessionsCompleted: 47,
            averageRating: 4.7,
            actionUrl: 'https://tutorquality.com/dashboard',
          })
        );
        break;

      default:
        return NextResponse.json(
          {
            error: 'Invalid template',
            availableTemplates: [
              'engagement',
              'first-session',
              'quality',
              'technical',
              're-engagement',
            ],
          },
          { status: 400 }
        );
    }

    return new NextResponse(emailHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('Error rendering email template:', error);
    return NextResponse.json(
      { error: 'Failed to render template' },
      { status: 500 }
    );
  }
}


