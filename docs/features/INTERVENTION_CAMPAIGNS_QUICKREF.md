# Intervention Campaign Builder - Quick Reference

## Quick Start Guide

### Creating Your First Campaign

1. **Navigate to Interventions**
   - Click "Interventions" in the main navbar
   - Click "New Campaign" button

2. **Choose Your Approach**
   - **Option A: Use AI Recommendations**
     - Review recommended campaigns at the top
     - Click "Use This" on any recommendation
     - System auto-fills template and targeting
   
   - **Option B: Build From Scratch**
     - Select a predefined segment or create custom targeting
     - Choose an email template
     - Customize as needed

3. **Configure Targeting**
   - Select from 8 predefined segments OR
   - Build custom criteria using filters
   - Click "Preview" to see audience size
   - Verify sample tutors match your intent

4. **Customize Email**
   - Select template from library
   - Override subject/content (optional)
   - Set custom variables (optional)
   - Preview how email will look

5. **Set Options**
   - Add experiment ID for A/B testing (optional)
   - Schedule for later or send immediately
   - Review final audience count

6. **Create Campaign**
   - Click "Create Campaign"
   - View interventions in pending state
   - Track engagement as emails are sent

## Predefined Segments

| Segment | Description | Use Case |
|---------|-------------|----------|
| **High Churn Risk** | Tutors flagged as high churn risk | Urgent retention efforts |
| **Disengaged Tutors** | No login in 7+ days | Re-activation campaign |
| **Low Engagement** | Engagement score below 6.0 | Quality improvement |
| **Poor First Sessions** | Struggling with first impressions | Training intervention |
| **Technical Issues** | High technical issue rate (>15%) | Support outreach |
| **New Tutors** | Less than 3 months experience | Onboarding assistance |
| **Star Performers** | Top 10% performers | Recognition & retention |
| **Inactive 14+ Days** | No login in 14+ days | Win-back campaign |

## Email Templates

### Engagement Templates
- **No Login - 7 Days**: Re-engage inactive tutors
- **Star Performer Recognition**: Celebrate top performers

### Quality Templates
- **Low Engagement Score**: Tips to boost engagement
- **Poor First Session**: First impression improvement
- **High Reschedule Rate**: Reliability check-in

### Technical Templates
- **Technical Issues Support**: Help with tech problems

### First Session Templates
- **First Session Preparation**: 24-hour prep reminder

### Re-engagement Templates
- **Re-engagement - 14 Days**: Win back inactive tutors

## Custom Targeting Options

### Demographics
- **Subject**: Math, Science, English, etc.
- **Certification Level**: Bronze, Silver, Gold, Platinum
- **Experience**: Min/max months

### Performance
- **Engagement Score**: Min/max range (0-10)
- **Rating**: Min/max rating (0-5)
- **Churn Risk**: Low, Medium, High

### Behavior
- **Days Since Login**: Minimum days inactive
- **Session Count**: Min/max sessions in period
- **First Session Flag**: Poor first session performers

### Technical
- **Technical Issue Rate**: Minimum percentage
- **Reschedule Rate**: Minimum percentage

### Advanced
- **Result Limit**: Max tutors to target
- **Active Status**: Include only active tutors

## Template Variables

Common variables available in all templates:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{tutorName}}` | Tutor's name | "John Smith" |
| `{{tutorId}}` | Tutor's ID | "TUT_001" |
| `{{daysSinceLogin}}` | Days since last login | "7" |
| `{{currentEngagement}}` | Current engagement score | "6.5" |
| `{{currentRating}}` | Current rating | "4.2" |
| `{{loginUrl}}` | Login page URL | Full URL |
| `{{dashboardUrl}}` | Dashboard URL | Full URL |
| `{{resourcesUrl}}` | Resources page URL | Full URL |

## Tracking Engagement

### Status Flow
```
Pending → Sent → Delivered → Opened → Clicked → Responded
```

### Metrics to Monitor
- **Open Rate**: % of sent emails opened
- **Click Rate**: % of sent emails with clicks
- **Response Rate**: % of sent emails with responses
- **Time to Open**: Hours between send and open
- **Time to Click**: Minutes between open and click
- **Time to Respond**: Hours between send and response

### Success Metrics
- **Engagement Change**: Before/after engagement score
- **Session Change**: Before/after session count
- **Behavioral Change**: Login activity, quality metrics

## A/B Testing

### Setting Up Experiments

1. Enter experiment ID (e.g., "first-session-prep-v2")
2. Select variant (control, treatment_a, treatment_b, treatment_c)
3. Create multiple campaigns with same experiment ID
4. Different variants get different content
5. Track performance by variant

### Best Practices
- Test one variable at a time (subject, content, timing)
- Ensure equal audience sizes across variants
- Run for minimum 100 recipients per variant
- Wait for statistical significance before concluding

## Scheduling Options

### Send Immediately
- Interventions created in "pending" state
- Processed by next cron job run (typically hourly)
- Good for urgent campaigns

### Schedule for Later
- Set specific date and time
- Useful for optimal send times
- Good for recurring campaigns
- Consider tutor time zones

### Best Send Times
- **Morning (9-11 AM)**: High open rates
- **Afternoon (2-4 PM)**: Good click rates
- **Evening (7-9 PM)**: Lower volume, more attention
- **Avoid weekends**: Lower engagement

## Campaign Best Practices

### Targeting
1. Start broad, then narrow based on results
2. Test different segments to find what works
3. Exclude recently contacted tutors
4. Consider tutor time zones and schedules

### Content
1. Keep subject lines under 50 characters
2. Personalize with tutor-specific data
3. Include clear call-to-action
4. Make it easy to take action (one-click links)
5. Use encouraging, positive tone

### Testing
1. Always preview targeting before creating
2. Review sample tutors to verify intent
3. Check email preview for variable substitution
4. Test templates with different tutor profiles
5. Monitor first 10-20 sends closely

### Optimization
1. Review engagement metrics weekly
2. A/B test subject lines first
3. Iterate on low-performing templates
4. Share successful approaches across team
5. Track long-term success metrics

## Troubleshooting

### No Tutors Match Criteria
- **Problem**: Targeting too narrow
- **Solution**: Relax some criteria, use broader segment

### Low Open Rates (<20%)
- **Problem**: Subject line not compelling
- **Solution**: A/B test different subject lines, check spam score

### Low Click Rates (<5%)
- **Problem**: Content not actionable
- **Solution**: Add clear CTAs, reduce content length

### No Responses
- **Problem**: Not asking for response
- **Solution**: Add direct question, make replying easy

### Failed Deliveries
- **Problem**: Email service issues or invalid addresses
- **Solution**: Check error messages, verify email service status

## API Endpoints

For custom integrations:

```typescript
// Get templates
GET /api/interventions?action=templates

// Get predefined segments
GET /api/interventions?action=segments

// Get AI recommendations
GET /api/interventions?action=recommendations

// Preview targeting
POST /api/interventions
{
  action: "preview_targeting",
  criteria: { ... }
}

// Create campaign
POST /api/interventions
{
  action: "create_campaign",
  templateId: "...",
  targetingCriteria: { ... },
  ...
}
```

## Support

For questions or issues:
1. Check intervention status in details view
2. Review error messages in failed interventions
3. Verify targeting criteria with preview
4. Check email service logs
5. Contact platform support if issues persist

