# AI Insights Dashboard - Quick Reference

## Quick Start

### 1. Create Demo Data
```bash
npm run demo-insights
```

### 2. Access Dashboard
Navigate to: http://localhost:3000/dashboard/insights

### 3. Run Pattern Discovery
```bash
npx tsx scripts/discover-patterns.ts
```

## Key Features

### Filtering
- **Pattern Type**: Filter by engagement, quality, churn risk
- **Status**: Active, Implemented, Archived
- **Confidence**: Minimum confidence threshold (0-100%)
- **Search**: Full-text search across insights

### Actions
- **Mark as Implemented**: Track completed recommendations
- **Create Intervention**: Link insight to intervention campaign
- **Archive**: Remove outdated insights from active view

### Details
- **Expand/Collapse**: View correlations and affected tutors
- **Click Tutor IDs**: Navigate to tutor profiles
- **Confidence Badges**: Visual confidence indicators
- **AI Recommendations**: Actionable next steps

## API Quick Reference

### Fetch Insights
```bash
GET /api/insights
GET /api/insights?patternType=engagement_increase
GET /api/insights?minConfidence=0.8
GET /api/insights?status=active
```

### Create Insight
```bash
POST /api/insights
Body: { patternType, title, description, ... }
```

### Update Insight
```bash
POST /api/insights
Body: { id, status: "implemented", actionTaken, ... }
```

### Archive Insight
```bash
DELETE /api/insights?id={insightId}
```

## Pattern Types

- `engagement_increase` - Positive engagement trends
- `engagement_decrease` - Declining engagement
- `quality_improvement` - Quality score improvements
- `churn_risk` - Potential tutor attrition

## Status Values

- `active` - New insights requiring action
- `implemented` - Recommendations executed
- `archived` - No longer relevant

## Components

### InsightCard
Location: `components/dashboard/insight-card.tsx`
- Displays single insight
- Expandable details
- Action buttons

### InsightsPage
Location: `app/dashboard/insights/page.tsx`
- Main dashboard
- Stats overview
- Filters and search
- Insights list

## Scripts

- `npm run demo-insights` - Create sample data
- `npx tsx scripts/discover-patterns.ts` - Run AI analysis
- Pattern discovery runs weekly via cron: `/api/cron/discover-patterns`

## Navigation

Dashboard → AI Insights (Lightbulb icon in navbar)

## Troubleshooting

**No data?** Run `npm run demo-insights`

**API errors?** Check `OPENROUTER_API_KEY` or `ANTHROPIC_API_KEY` in `.env` (see `docs/openrouter-setup.md`)

**Filters not working?** Clear cache and refresh

## Next Steps

1. Review active insights
2. Mark implemented insights
3. Create interventions from recommendations
4. Track affected tutors
5. Monitor pattern trends over time

For full documentation, see `docs/insights-dashboard.md`

