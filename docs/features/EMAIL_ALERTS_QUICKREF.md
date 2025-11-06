# Email & Alerts System - Quick Reference

## 🚀 Quick Start

### Test Locally
```bash
# 1. Install dependencies (already done)
npm install

# 2. Set up .env file
RESEND_API_KEY="re_your_key_here"
EMAIL_FROM="Tutor Success <noreply@tutorquality.com>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 3. Start dev server
npm run dev

# 4. Preview email templates
# Visit: http://localhost:3000/api/email-preview?template=engagement

# 5. Generate alerts
npm run generate-alerts

# 6. Send emails (test mode)
npm run send-emails
```

## 📧 Email Templates

| Template | URL | Use Case |
|----------|-----|----------|
| Engagement | `?template=engagement` | No login/sessions |
| Quality | `?template=quality` | Low ratings/scores |
| Technical | `?template=technical` | Connection issues |
| First Session | `?template=first-session` | Upcoming first session |
| Re-engagement | `?template=re-engagement` | Long-term inactive |

## 🚨 Alert Rules Priority

| Priority | Rule | Threshold |
|----------|------|-----------|
| 100 | High Churn Risk | churn_risk = 'High' |
| 95 | No Sessions 14d | days_since_session >= 14 |
| 90 | No Login 7d | days_since_login >= 7 |
| 85 | Poor First Session | first_session_rating < 4.0 |
| 80 | Declining Engagement | engagement dropping & < 6.0 |
| 75 | Low Rating 7d | avg_rating_7d < 4.0 |
| 65 | Technical Issues | issue_rate > 12% |
| 60 | High Reschedule | reschedule_rate > 15% |
| 55 | Low Engagement | engagement < 5.5 |
| 50 | Low Empathy | empathy < 5.0 |
| 50 | Low Clarity | clarity < 5.5 |

## 🔧 NPM Scripts

```bash
npm run dev              # Start development server
npm run generate-alerts  # Generate alerts for all tutors
npm run send-emails      # Send pending intervention emails
```

## 🌐 API Endpoints

### Alerts
```bash
# Get alerts
GET /api/alerts?severity=critical&category=churn

# Create alert
POST /api/alerts
Body: { tutorId, severity, category, title, message }

# Acknowledge alert
PATCH /api/alerts
Body: { alertId, action: "acknowledge", acknowledgedBy }

# Resolve alert
PATCH /api/alerts
Body: { alertId, action: "resolve" }

# Get statistics
GET /api/alerts/stats
```

### Email
```bash
# Preview templates
GET /api/email-preview?template=<name>

# Cron jobs (production only)
GET /api/cron/generate-alerts  # Hourly
GET /api/cron/send-emails      # Every 6 hours
```

## 📊 Database Queries

```sql
-- Unresolved alerts by category
SELECT category, COUNT(*) FROM alerts 
WHERE is_resolved = false 
GROUP BY category;

-- Pending interventions
SELECT * FROM interventions 
WHERE status = 'pending';

-- Email engagement metrics
SELECT 
  COUNT(*) as sent,
  COUNT(opened_at) as opened,
  COUNT(clicked_at) as clicked
FROM interventions 
WHERE sent_at IS NOT NULL;
```

## 🎯 Production Checklist

- [ ] Set `RESEND_API_KEY` in Vercel
- [ ] Set `EMAIL_FROM` in Vercel
- [ ] Set `NEXT_PUBLIC_APP_URL` in Vercel
- [ ] Set `CRON_SECRET` in Vercel
- [ ] Verify domain in Resend
- [ ] Test cron endpoints manually
- [ ] Monitor Vercel logs
- [ ] Check Resend dashboard for delivery rates

## 📁 File Structure

```
lib/
  email/
    sender.ts              # Core email functions
    scheduler.ts           # Email delivery logic
    templates/
      base-layout.tsx      # Email wrapper
      engagement-alert-email.tsx
      first-session-reminder-email.tsx
      quality-alert-email.tsx
      technical-issues-email.tsx
      re-engagement-email.tsx
  alerts/
    rules.ts              # Alert rule definitions
    generator.ts          # Alert generation logic

app/api/
  alerts/
    route.ts              # Alert CRUD
    stats/route.ts        # Alert statistics
  email-preview/
    route.ts              # Template preview
  cron/
    generate-alerts/
      route.ts            # Hourly alert generation
    send-emails/
      route.ts            # 6-hour email delivery

scripts/
  run-alert-generation.ts # Manual alert script
  send-emails.ts          # Manual email script

vercel.json               # Cron configuration
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Emails not sending | Check `RESEND_API_KEY`, verify domain |
| No alerts generated | Ensure tutors have `aggregates` data |
| Duplicate alerts | Deduplication runs automatically (24h) |
| Cron not running | Check Vercel dashboard > Cron Jobs |
| Template not rendering | Check `/api/email-preview?template=<name>` |

## 📞 Support Resources

- **Resend Docs:** https://resend.com/docs
- **React Email:** https://react.email
- **Vercel Cron:** https://vercel.com/docs/cron-jobs
- **Project README:** `/EMAIL_ALERTS_README.md`
- **Implementation Summary:** `/EMAIL_ALERTS_IMPLEMENTATION_SUMMARY.md`

## 🎓 Common Tasks

### Add New Alert Rule
1. Edit `lib/alerts/rules.ts`
2. Add rule to `ALERT_RULES` array
3. Test with `npm run generate-alerts`

### Create New Email Template
1. Create file in `lib/email/templates/`
2. Use `BaseEmailLayout` wrapper
3. Add to `app/api/email-preview/route.ts`
4. Add to `lib/email/scheduler.ts` template mapping

### Test Alert for Specific Tutor
```typescript
import { evaluateAlertRules } from '@/lib/alerts/rules';

const { triggeredRules } = await evaluateAlertRules('T0001');
console.log(triggeredRules);
```

### Send Test Email
```typescript
import { sendEmail } from '@/lib/email/sender';
import EngagementAlertEmail from '@/lib/email/templates/engagement-alert-email';

await sendEmail({
  to: 'test@example.com',
  subject: 'Test',
  template: EngagementAlertEmail({
    tutorName: 'Test',
    issueType: 'no_login',
    daysSinceLastLogin: 7,
    actionUrl: 'http://localhost:3000/dashboard',
  }),
});
```

---

**Version:** 1.0  
**Last Updated:** November 2024  
**Status:** Production Ready ✅

