# AI Insights Dashboard - Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    🚀 MISSION CONTROL                           │
│  Dashboard  Alerts  Performers  First Sessions  💡 AI Insights │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AI Pattern Insights                                            │
│  Discover patterns and trends identified by AI analysis         │
└─────────────────────────────────────────────────────────────────┘

┌────────────┬────────────┬────────────┬────────────┐
│ 💡 Total   │ 📈 Avg     │ 👥 Affected│ ✨ Pattern │
│  Insights  │ Confidence │   Tutors   │   Types    │
│     5      │    85%     │     45     │     3      │
└────────────┴────────────┴────────────┴────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Pattern Distribution                                           │
│  [engagement_increase: 2] [churn_risk: 1] [quality: 2]         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🔍 Filters                                     [🔄 Refresh]    │
│  ┌─────────────┬─────────────┬────────────┬──────────────┐    │
│  │Pattern Type │   Status    │ Confidence │   Search     │    │
│  │ All Types ▼ │  Active  ▼  │ ●────── 0% │ 🔍 Search... │    │
│  └─────────────┴─────────────┴────────────┴──────────────┘    │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  📊 Morning Sessions Drive Higher Engagement                    │
│  [ENGAGEMENT_INCREASE] [HIGH CONFIDENCE]                        │
│                                                                 │
│  Tutors who conduct sessions between 8-11 AM show 25% higher   │
│  engagement scores compared to afternoon sessions.              │
│                                                                 │
│  👥 8 affected tutors  📊 87% confidence  📈 95% significance   │
│  📅 Oct 23 - Nov 6, 2024                                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 💡 AI Recommendation [claude-3-5-sonnet]                 │ │
│  │ Encourage tutors with flexible schedules to prioritize   │ │
│  │ morning sessions. Consider implementing incentive program │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [▼ Show Correlations]                                         │
│                                                                 │
│  [✓ Mark as Implemented] [→ Create Intervention] [📁 Archive] │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ High Reschedule Rate Predicts Tutor Attrition             │
│  [CHURN_RISK] [HIGH CONFIDENCE]                                │
│                                                                 │
│  Tutors with reschedule rates above 20% are 3x more likely    │
│  to become inactive within 30 days.                            │
│                                                                 │
│  👥 12 affected tutors  📊 91% confidence  📈 92% significance  │
│  📅 Oct 16 - Nov 6, 2024                                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 💡 AI Recommendation [claude-3-5-sonnet]                 │ │
│  │ Implement proactive outreach for tutors with reschedule  │ │
│  │ rates >15%. Schedule support calls to understand causes. │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
│  [▼ Show Correlations]                                         │
│                                                                 │
│  [✓ Mark as Implemented] [→ Create Intervention] [📁 Archive] │
└─────────────────────────────────────────────────────────────────┘

[More insights...]

```

## Component Hierarchy

```
InsightsPage (page.tsx)
├── Stats Overview
│   ├── MetricCard (Total Insights)
│   ├── MetricCard (Avg Confidence)
│   ├── MetricCard (Affected Tutors)
│   └── MetricCard (Pattern Types)
├── Pattern Distribution
│   └── Badge List
├── Filters Card
│   ├── Pattern Type Select
│   ├── Status Select
│   ├── Confidence Slider
│   ├── Search Input
│   └── Refresh Button
└── Insights List
    └── InsightCard (for each insight)
        ├── Header
        │   ├── Pattern Icon
        │   ├── Title
        │   ├── Pattern Badge
        │   └── Confidence Badge
        ├── Description
        ├── Metrics Row
        │   ├── Affected Tutors
        │   ├── Confidence %
        │   ├── Significance %
        │   └── Date Range
        ├── AI Recommendation
        │   ├── Model Badge
        │   └── Recommendation Text
        ├── Expandable Sections
        │   ├── Correlations Grid
        │   └── Affected Tutors List
        └── Action Buttons
            ├── Mark Implemented
            ├── Create Intervention
            └── Archive
```

## Data Flow

```
┌──────────────┐
│  Database    │
│ (PostgreSQL) │
└──────┬───────┘
       │
       ▼
┌──────────────────┐      ┌────────────────┐
│ Pattern Discovery│ ───► │ PatternInsight │
│    (AI Script)   │      │     Table      │
└──────────────────┘      └────────┬───────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ GET /api/insights│
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ InsightsPage    │
                          │   (Filters)     │
                          └────────┬─────────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │  InsightCard    │
                          │   (Display)     │
                          └────────┬─────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼              ▼
            [Mark Implemented] [Create      [Archive]
                              Intervention]
                    │              │              │
                    ▼              ▼              ▼
              POST /api/    Link to         DELETE /api/
              insights      /interventions  insights
```

## Color Scheme

```
Pattern Types:
├── 📈 engagement_increase → Green (success)
├── 📉 engagement_decrease → Red (danger)
├── ⚠️  churn_risk         → Red (danger)
└── ⭐ quality_improvement → Yellow (warning)

Confidence Levels:
├── 80%+ → Green (High)
├── 60-79% → Yellow (Medium)
└── <60% → Orange (Low)

UI Theme:
├── Background: Dark (#0f1419, #1a1f2e)
├── Primary: Cyan (#06b6d4)
├── Text: Gray-200 (#e5e7eb)
└── Borders: Cyan-500/30
```

## User Flow

```
1. User navigates to Dashboard → AI Insights
   │
   ▼
2. View stats overview (total insights, avg confidence, etc.)
   │
   ▼
3. Apply filters (type, status, confidence, search)
   │
   ▼
4. Browse insights list (sorted by confidence)
   │
   ▼
5. Click to expand insight details
   │  ├─ View correlations
   │  └─ See all affected tutors
   │
   ▼
6. Take action on insight
   │  ├─ Mark as Implemented → Updates status
   │  ├─ Create Intervention → Navigate to intervention builder
   │  └─ Archive → Removes from active view
   │
   ▼
7. Click tutor ID → View tutor profile
```

## API Integration

```javascript
// Fetch insights with filters
GET /api/insights?patternType=engagement_increase&minConfidence=0.8

// Response
{
  "insights": [...],
  "stats": {
    "total": 5,
    "byType": { "engagement_increase": 2 },
    "avgConfidence": 0.85,
    "totalAffectedTutors": 45
  }
}

// Mark as implemented
POST /api/insights
{
  "id": "insight-123",
  "status": "implemented",
  "actionTaken": "Rolled out training program"
}

// Archive insight
DELETE /api/insights?id=insight-123
```

## Feature Highlights

1. **Smart Filtering** - Multiple filters work together
2. **Expandable Details** - Show/hide correlations and tutors
3. **Confidence Indicators** - Visual badges for trust levels
4. **Direct Actions** - One-click to implement or create interventions
5. **Deep Links** - Navigate to tutors and interventions
6. **AI Attribution** - Show which model generated insights
7. **Status Tracking** - Know what's been acted upon
8. **Search** - Find insights by keywords
9. **Stats Dashboard** - Overview of all insights
10. **Pattern Distribution** - See breakdown by type

---

Built with Next.js, React, TypeScript, Tailwind CSS, and Prisma

