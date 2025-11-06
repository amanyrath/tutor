import { render } from '@react-email/render'
import EngagementAlertEmail from './engagement-alert-email'
import QualityAlertEmail from './quality-alert-email'
import TechnicalIssuesEmail from './technical-issues-email'
import FirstSessionReminderEmail from './first-session-reminder-email'
import ReengagementEmail from './re-engagement-email'

export async function renderEngagementAlertEmail(props: {
  tutorName: string
  issueType: 'no_login' | 'no_sessions' | 'declining_engagement'
  daysSinceLastLogin?: number
  daysSinceLastSession?: number
  engagementTrend?: 'declining' | 'stable' | 'improving'
  actionUrl: string
}): Promise<string> {
  return await render(EngagementAlertEmail(props))
}

export async function renderQualityAlertEmail(props: {
  tutorName: string
  alertType: 'low_rating' | 'poor_engagement' | 'low_empathy' | 'clarity_issues'
  metricValue: number
  benchmark: number
  recentSessionCount: number
  actionUrl: string
}): Promise<string> {
  return await render(QualityAlertEmail(props))
}

export async function renderTechnicalIssuesEmail(props: {
  tutorName: string
  issueRate: number
  recentSessionsWithIssues: number
  totalRecentSessions: number
  actionUrl: string
}): Promise<string> {
  return await render(TechnicalIssuesEmail(props))
}

export async function renderFirstSessionReminderEmail(props: {
  tutorName: string
  sessionDate: string
  sessionTime: string
  subject: string
  gradeLevel: string
  actionUrl: string
}): Promise<string> {
  return await render(FirstSessionReminderEmail(props))
}

export async function renderReengagementEmail(props: {
  tutorName: string
  daysSinceLastActivity: number
  totalSessionsCompleted: number
  averageRating: number
  actionUrl: string
}): Promise<string> {
  return await render(ReengagementEmail(props))
}

