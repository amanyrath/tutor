/**
 * Intervention Templates Library
 * 
 * Pre-defined intervention templates with variables for personalization
 */

export interface InterventionTemplate {
  id: string
  name: string
  category: 'engagement' | 'quality' | 'technical' | 'first_session' | 'reengagement'
  subject: string
  description: string
  variables: string[]
  contentTemplate: string
  recommendedTiming: string
  successMetrics: string[]
}

export const INTERVENTION_TEMPLATES: InterventionTemplate[] = [
  {
    id: 'engagement_no_login_7d',
    name: 'No Login - 7 Days',
    category: 'engagement',
    subject: 'We miss you, {{tutorName}}!',
    description: 'Sent when a tutor hasn\'t logged in for 7 days',
    variables: ['tutorName', 'daysSinceLogin', 'lastSessionDate', 'loginUrl'],
    contentTemplate: `Hi {{tutorName}},

It's been {{daysSinceLogin}} days since we last saw you on the platform. We wanted to check in and see if everything is okay.

{{#if lastSessionDate}}
Your last session was on {{lastSessionDate}}.
{{/if}}

Your students are waiting for you! Log in to check your upcoming sessions and update your availability.

[Log In to Dashboard]({{loginUrl}})

Need help? Reply to this email and we'll assist you.`,
    recommendedTiming: '7 days after last login',
    successMetrics: ['login_within_48h', 'session_completed_within_7d']
  },
  
  {
    id: 'quality_low_engagement',
    name: 'Low Engagement Score',
    category: 'quality',
    subject: 'Tips to boost student engagement',
    description: 'Sent when engagement scores drop below 6.0',
    variables: ['tutorName', 'currentEngagement', 'targetEngagement', 'resourcesUrl'],
    contentTemplate: `Hi {{tutorName}},

We've noticed your recent engagement scores ({{currentEngagement}}/10) could use a boost. Here are some quick tips:

1. Ask more interactive questions
2. Use visual aids and screen sharing
3. Encourage students to explain their thinking
4. Keep energy high and be encouraging

Target: {{targetEngagement}}/10

Check out our training resources for specific strategies:
[View Resources]({{resourcesUrl}})

Want personalized coaching? Reply to schedule a 1-on-1.`,
    recommendedTiming: 'When engagement < 6.0 for 3+ sessions',
    successMetrics: ['engagement_increase_0.5', 'resources_accessed']
  },

  {
    id: 'technical_issues_spike',
    name: 'Technical Issues Support',
    category: 'technical',
    subject: 'Let us help with your technical issues',
    description: 'Sent when technical issue rate exceeds 15%',
    variables: ['tutorName', 'issueRate', 'supportUrl'],
    contentTemplate: `Hi {{tutorName}},

We've noticed technical issues in {{issueRate}}% of your recent sessions. We want to help!

Common solutions:
- Check internet speed (10+ Mbps recommended)
- Close unnecessary apps
- Use wired connection if possible
- Update your browser

Get technical support:
[Contact Support]({{supportUrl}})

Run a system check from your dashboard to identify issues.`,
    recommendedTiming: 'When technical issue rate > 15%',
    successMetrics: ['technical_issues_decrease', 'support_ticket_resolved']
  },

  {
    id: 'first_session_prep',
    name: 'First Session Preparation',
    category: 'first_session',
    subject: 'Prepare for your first session with {{studentName}}',
    description: 'Sent 24 hours before a first session with a new student',
    variables: ['tutorName', 'studentName', 'sessionDate', 'sessionTime', 'subject', 'gradeLevel', 'prepGuideUrl'],
    contentTemplate: `Hi {{tutorName}}!

You have a first session with {{studentName}} tomorrow!

Session Details:
- Date & Time: {{sessionDate}} at {{sessionTime}}
- Subject: {{subject}}
- Grade: {{gradeLevel}}

First Session Checklist:
✓ Join 5 minutes early
✓ Start with introductions
✓ Set expectations
✓ Be encouraging and positive
✓ End with next steps

[View Full Prep Guide]({{prepGuideUrl}})

💡 Tutors with great first sessions have 40% better retention!`,
    recommendedTiming: '24 hours before first session',
    successMetrics: ['first_session_rating_4_plus', 'student_books_next_session']
  },

  {
    id: 'reengagement_14d',
    name: 'Re-engagement - 14 Days',
    category: 'reengagement',
    subject: 'Come back to tutoring!',
    description: 'Sent when tutor has been inactive for 14 days',
    variables: ['tutorName', 'daysSinceActive', 'totalSessions', 'totalStudents', 'dashboardUrl'],
    contentTemplate: `Hi {{tutorName}},

It's been {{daysSinceActive}} days - we hope everything is going well!

Your Impact:
✅ {{totalSessions}} sessions completed
👥 {{totalStudents}} students helped

Students need tutors like you! What's new:
- Enhanced scheduling tools
- New training resources
- Performance insights dashboard
- Flexible availability

[Return to Dashboard]({{dashboardUrl}})

Questions? Reply to this email.`,
    recommendedTiming: '14 days after last session',
    successMetrics: ['login_within_7d', 'session_scheduled_within_14d']
  },

  {
    id: 'quality_poor_first_session',
    name: 'First Session Improvement',
    category: 'quality',
    subject: 'Let\'s improve your first sessions',
    description: 'Sent when first session ratings are consistently low',
    variables: ['tutorName', 'firstSessionRating', 'trainingUrl'],
    contentTemplate: `Hi {{tutorName}},

We noticed your first session ratings ({{firstSessionRating}}/5) could be stronger. First impressions really matter!

Key improvements:
1. Build rapport in the first 5 minutes
2. Set clear expectations
3. Be extra encouraging
4. Summarize what you'll cover next time

First sessions set the tone for the entire relationship. Let's make them great!

[Access First Session Training]({{trainingUrl}})

Need 1-on-1 coaching? Reply to this email.`,
    recommendedTiming: 'After 3+ poor first sessions',
    successMetrics: ['first_session_rating_improvement', 'training_completed']
  },

  {
    id: 'reliability_high_reschedule',
    name: 'Reliability Check-in',
    category: 'quality',
    subject: 'Let\'s talk about your schedule',
    description: 'Sent when reschedule rate exceeds 15%',
    variables: ['tutorName', 'rescheduleRate', 'targetRate'],
    contentTemplate: `Hi {{tutorName}},

Your reschedule rate is {{rescheduleRate}}% (target: {{targetRate}}%). Let's work on this together.

Tips for better scheduling:
- Only mark times you're truly available
- Set calendar reminders
- Update availability weekly
- Block buffer time between sessions

Reliable tutors get more bookings and better ratings!

Need help managing your schedule? Reply and we'll assist.`,
    recommendedTiming: 'When reschedule rate > 15%',
    successMetrics: ['reschedule_rate_decrease', 'availability_updated']
  },

  {
    id: 'positive_recognition',
    name: 'Star Performer Recognition',
    category: 'engagement',
    subject: 'You\'re a star tutor! 🌟',
    description: 'Recognition for top performers',
    variables: ['tutorName', 'performanceScore', 'rank', 'specialRecognition'],
    contentTemplate: `Hi {{tutorName}},

Congratulations! You're in the top {{rank}}% of tutors!

Your Stats:
⭐ Performance Score: {{performanceScore}}/10
{{#if specialRecognition}}
🏆 {{specialRecognition}}
{{/if}}

Your students love working with you, and it shows. Keep up the amazing work!

Would you be interested in mentoring other tutors? Reply if you'd like to hear more.

Thank you for being exceptional!`,
    recommendedTiming: 'Monthly for top 10% performers',
    successMetrics: ['continued_high_performance', 'mentor_interest']
  }
]

/**
 * Get template by ID
 */
export function getTemplate(templateId: string): InterventionTemplate | undefined {
  return INTERVENTION_TEMPLATES.find(t => t.id === templateId)
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: InterventionTemplate['category']
): InterventionTemplate[] {
  return INTERVENTION_TEMPLATES.filter(t => t.category === category)
}

/**
 * Render template with variables
 */
export function renderTemplate(
  template: InterventionTemplate,
  variables: Record<string, any>
): { subject: string; content: string } {
  let subject = template.subject
  let content = template.contentTemplate

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, String(value))
    content = content.replace(regex, String(value))
  }

  // Handle conditionals (simple implementation)
  content = content.replace(/{{#if\s+(\w+)}}([\s\S]*?){{\/if}}/g, (match, varName, ifContent) => {
    return variables[varName] ? ifContent : ''
  })

  return { subject, content }
}

/**
 * Recommend template based on tutor profile
 */
export function recommendTemplate(tutorProfile: {
  daysSinceLogin?: number
  avgEngagementScore?: number
  technicalIssueRate?: number
  firstSessionAvgRating?: number
  rescheduleRate?: number
  isTopPerformer?: boolean
}): InterventionTemplate | null {
  // No login
  if (tutorProfile.daysSinceLogin && tutorProfile.daysSinceLogin >= 7) {
    return getTemplate('engagement_no_login_7d')!
  }

  // No login for extended period
  if (tutorProfile.daysSinceLogin && tutorProfile.daysSinceLogin >= 14) {
    return getTemplate('reengagement_14d')!
  }

  // Low engagement
  if (tutorProfile.avgEngagementScore && tutorProfile.avgEngagementScore < 6.0) {
    return getTemplate('quality_low_engagement')!
  }

  // Technical issues
  if (tutorProfile.technicalIssueRate && tutorProfile.technicalIssueRate > 0.15) {
    return getTemplate('technical_issues_spike')!
  }

  // Poor first sessions
  if (tutorProfile.firstSessionAvgRating && tutorProfile.firstSessionAvgRating < 3.5) {
    return getTemplate('quality_poor_first_session')!
  }

  // High reschedule rate
  if (tutorProfile.rescheduleRate && tutorProfile.rescheduleRate > 0.15) {
    return getTemplate('reliability_high_reschedule')!
  }

  // Top performer
  if (tutorProfile.isTopPerformer) {
    return getTemplate('positive_recognition')!
  }

  return null
}

