# Email & Alerts System

Complete email infrastructure and automated alert system for the Tutor Quality Dashboard.

## Overview

This system consists of:
1. **Email Infrastructure** - Resend-based email delivery with tracking
2. **Email Templates** - React-based email templates for various intervention types
3. **Alert Rules Engine** - Configurable rules for detecting tutor issues
4. **Alert Generation** - Automated alert creation based on tutor metrics
5. **Email Scheduler** - Automated delivery of intervention emails

## Setup

### 1. Install Dependencies

```bash
npm install resend react-email @react-email/components @react-email/render
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="Tutor Success <noreply@tutorquality.com>"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Cron Secret (for production)
CRON_SECRET="your-secret-key-here"
```

### 3. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. Verify your domain (or use sandbox for testing)

## Email Templates

### Available Templates

1. **Engagement Alert** - No login or session activity
2. **First Session Reminder** - Upcoming first session preparation
3. **Quality Alert** - Low ratings, engagement, empathy, or clarity
4. **Technical Issues** - Connection or platform problems
5. **Re-engagement** - Long-term inactive tutors

### Preview Templates

View all email templates in your browser:

```bash
npm run dev

# Then visit:
http://localhost:3000/api/email-preview?template=engagement
http://localhost:3000/api/email-preview?template=first-session
http://localhost:3000/api/email-preview?template=quality
http://localhost:3000/api/email-preview?template=technical
http://localhost:3000/api/email-preview?template=re-engagement
```

### Creating New Templates

1. Create a new file in `lib/email/templates/`
2. Use the `BaseEmailLayout` component
3. Add to `email-preview/route.ts` for testing

```tsx
import BaseEmailLayout from './base-layout';

export default function MyNewEmail({ tutorName, ...props }) {
  return (
    <BaseEmailLayout
      preview="Your preview text"
      tutorName={tutorName}
    >
      <Text style={paragraph}>Your email content</Text>
    </BaseEmailLayout>
  );
}
```

## Alert Rules

### Current Alert Rules

The system includes 12 pre-configured alert rules:

#### Critical Priority
- **High Churn Risk** (Priority 100) - Tutor classified as high churn risk
- **No Sessions in 14 Days** (Priority 95) - No tutoring activity for 2 weeks
- **No Login in 7 Days** (Priority 90) - Account inactivity

#### High Priority
- **Poor First Session** (Priority 85) - First session ratings below 4.0
- **Declining Engagement Trend** (Priority 80) - Week-over-week decline
- **Low Student Rating** (Priority 75) - 7-day average below 4.0

#### Medium Priority
- **Technical Issues Spike** (Priority 65) - Issue rate above 12%
- **High Reschedule Rate** (Priority 60) - Reschedule rate above 15%
- **Low Engagement Score** (Priority 55) - Engagement below 5.5
- **Low Empathy Score** (Priority 50) - Empathy below 5.0
- **Low Clarity Score** (Priority 50) - Clarity below 5.5

#### Low Priority (Informational)
- **First Session Scheduled** (Priority 20) - Upcoming first session

### Adding Custom Rules

Edit `lib/alerts/rules.ts`:

```typescript
{
  id: 'my_custom_rule',
  name: 'My Custom Rule',
  description: 'Description of what triggers this rule',
  category: 'quality', // churn, quality, technical, engagement
  severity: 'high', // critical, high, medium, low
  priority: 70, // Higher = checked first
  condition: (context) => {
    // Return true when alert should be triggered
    return context.tutor.aggregates?.someMetric < threshold;
  },
  generateMessage: (context) => ({
    title: 'Alert Title',
    message: 'Detailed alert message',
    metric: 'metric_name',
    metricValue: context.tutor.aggregates?.someMetric,
    threshold: 5.0,
  }),
}
```

## Alert Generation

### Manual Alert Generation

Run the alert generation script manually:

```bash
npm run generate-alerts
```

This will:
1. Fetch all active tutors
2. Evaluate alert rules for each tutor
3. Create alerts in the database (with deduplication)
4. Auto-resolve alerts older than 30 days

### Automatic Alert Generation (Production)

Configure Vercel Cron jobs in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/generate-alerts",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs hourly in production.

### API Endpoints

#### Get Alerts

```bash
# Get all unresolved alerts
GET /api/alerts

# Filter by tutor
GET /api/alerts?tutorId=T0001

# Filter by severity
GET /api/alerts?severity=critical

# Filter by category
GET /api/alerts?category=churn

# Include resolved alerts
GET /api/alerts?includeResolved=true
```

#### Create Alert

```bash
POST /api/alerts
Content-Type: application/json

{
  "tutorId": "T0001",
  "severity": "high",
  "category": "quality",
  "title": "Custom Alert",
  "message": "Alert description",
  "metric": "custom_metric",
  "metricValue": 3.5,
  "threshold": 5.0
}
```

#### Acknowledge Alert

```bash
PATCH /api/alerts
Content-Type: application/json

{
  "alertId": "alert-id-here",
  "action": "acknowledge",
  "acknowledgedBy": "manager@example.com"
}
```

#### Resolve Alert

```bash
PATCH /api/alerts
Content-Type: application/json

{
  "alertId": "alert-id-here",
  "action": "resolve"
}
```

#### Get Alert Statistics

```bash
GET /api/alerts/stats
```

Returns:
```json
{
  "totalAlerts": 45,
  "unacknowledged": 23,
  "byCategory": [
    { "category": "churn", "count": 12 },
    { "category": "quality", "count": 20 },
    { "category": "technical", "count": 8 },
    { "category": "engagement", "count": 5 }
  ],
  "bySeverity": [
    { "severity": "critical", "count": 5 },
    { "severity": "high", "count": 15 },
    { "severity": "medium", "count": 20 },
    { "severity": "low", "count": 5 }
  ]
}
```

## Email Delivery

### Manual Email Sending

Send pending intervention emails manually:

```bash
npm run send-emails
```

This will:
1. Fetch pending interventions (status = 'pending')
2. Check for unsubscribes
3. Generate appropriate email templates
4. Send emails via Resend
5. Update intervention status
6. Rate limit to 10 emails/second

### Automatic Email Delivery (Production)

Configure Vercel Cron jobs in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This runs every 6 hours in production.

### Creating Interventions

Interventions can be created from alerts or manually:

```typescript
// From an alert
import { createInterventionFromAlert } from '@/lib/email/scheduler';

const interventionId = await createInterventionFromAlert(alertId);

// Manual creation
await prisma.intervention.create({
  data: {
    tutorId: 'T0001',
    interventionType: 'engagement',
    channel: 'email',
    subject: 'We Miss You!',
    content: 'Email content here',
    status: 'pending',
  },
});
```

### Tracking Email Engagement

The system automatically tracks:
- **Sent** - Email delivered successfully
- **Opened** - Recipient opened the email (via tracking pixel)
- **Clicked** - Recipient clicked a link (via tracked URLs)
- **Responded** - Tutor took action (manual update)

Track metrics in the `interventions` table:
- `sentAt` - When email was sent
- `openedAt` - When email was opened
- `clickedAt` - When link was clicked
- `respondedAt` - When tutor responded

## Testing

### Test Email Sending (Development)

```typescript
// In a test script
import { sendEmail } from '@/lib/email/sender';
import EngagementAlertEmail from '@/lib/email/templates/engagement-alert-email';

await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  template: EngagementAlertEmail({
    tutorName: 'Test Tutor',
    issueType: 'no_login',
    daysSinceLastLogin: 7,
    actionUrl: 'http://localhost:3000/dashboard',
  }),
});
```

### Test Alert Rules

```typescript
import { evaluateAlertRules } from '@/lib/alerts/rules';

const { triggeredRules, context } = await evaluateAlertRules('T0001');

console.log(`Triggered ${triggeredRules.length} alerts:`);
triggeredRules.forEach(rule => {
  console.log(`- ${rule.message.title}: ${rule.message.message}`);
});
```

## Monitoring & Logging

### Email Delivery Monitoring

Check Resend dashboard for:
- Delivery rates
- Open rates
- Click rates
- Bounce rates
- Spam complaints

### Alert Generation Monitoring

Monitor cron job logs in Vercel:
```bash
vercel logs --follow
```

### Database Queries

```sql
-- Check alert distribution
SELECT category, severity, COUNT(*) as count
FROM alerts
WHERE is_resolved = false
GROUP BY category, severity
ORDER BY severity DESC, category;

-- Check intervention status
SELECT status, COUNT(*) as count
FROM interventions
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY status;

-- Top tutors with most alerts
SELECT tutor_id, COUNT(*) as alert_count
FROM alerts
WHERE is_resolved = false
GROUP BY tutor_id
ORDER BY alert_count DESC
LIMIT 10;
```

## Production Deployment

### Vercel Configuration

1. **Environment Variables** - Set in Vercel dashboard
2. **Cron Jobs** - Auto-configured via `vercel.json`
3. **Domain Verification** - Verify email domain in Resend

### Security

- Cron endpoints protected with `CRON_SECRET`
- Email tracking uses secure tokens
- Unsubscribe links use encrypted tutor IDs

### Rate Limiting

- Email sending: 10 emails/second (configurable)
- Alert generation: Batch processing (20 tutors at a time)
- API endpoints: Consider adding Upstash rate limiting

## Troubleshooting

### Emails Not Sending

1. Check Resend API key is set
2. Verify domain in Resend dashboard
3. Check intervention status in database
4. Review Vercel logs for errors

### Alerts Not Generating

1. Ensure tutors have aggregates data
2. Check alert rules are triggering
3. Verify deduplication isn't blocking
4. Review tutor metrics vs thresholds

### Cron Jobs Not Running

1. Verify `vercel.json` is deployed
2. Check Vercel dashboard > Cron Jobs
3. Ensure `CRON_SECRET` is set
4. Review Vercel function logs

## Future Enhancements

- [ ] SMS notifications via Twilio
- [ ] In-app notifications
- [ ] Email A/B testing
- [ ] Advanced segmentation
- [ ] Machine learning alert scoring
- [ ] Webhook integrations
- [ ] Analytics dashboard
- [ ] Custom email builder UI

## API Reference

See inline documentation in:
- `lib/email/sender.ts` - Email sending functions
- `lib/email/scheduler.ts` - Email scheduling functions
- `lib/alerts/rules.ts` - Alert rule definitions
- `lib/alerts/generator.ts` - Alert generation functions

