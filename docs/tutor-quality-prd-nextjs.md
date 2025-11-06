# Tutor Quality Scoring Dashboard - Product Requirements Document

## Executive Summary

A **Next.js 14 dashboard application** that visualizes tutor performance metrics, identifies at-risk tutors, and recommends data-driven interventions. Built with pre-generated synthetic data and deployed on Vercel for rapid demonstration and iteration.

**Timeline:** 48-hour development sprint  
**Tech Stack:** Next.js 14 (App Router), Vercel Postgres, Prisma ORM, shadcn/ui  
**Deployment:** Vercel (production-ready from day one)  
**Data Scope:** 150 tutors, 90,000 sessions over 30 days, pre-scored metrics

---

## 1. Product Vision

### Problem Statement
Nerdy's tutoring operations currently lack **real-time visibility** into tutor quality and churn risk. Manual QA processes are reactive, inconsistent, and cannot scale to 3,000+ daily sessions. This results in:
- Preventable tutor churn (especially high-performers)
- Poor first-session experiences leading to student churn
- Missed coaching opportunities
- No early warning system for reliability issues

### Solution
A **dashboard-first analytics platform** that:
1. Surfaces tutor quality scores and churn predictions instantly
2. Prioritizes high-risk tutors for immediate intervention
3. Provides actionable coaching recommendations
4. Tracks key metrics tied directly to business outcomes

### Success Criteria
- ✅ Deploy working dashboard within 48 hours
- ✅ Visualize all 90K sessions with <2 second load times
- ✅ Identify top 10 at-risk tutors with 80%+ accuracy
- ✅ Generate specific intervention recommendations for each risk category
- ✅ Demonstrate clear ROI path ($500K+ annual savings)

---

## 2. User Personas

### Primary User: Operations Manager (Sarah)
**Role:** Oversees 50+ tutors, responsible for quality and retention  
**Goals:**
- Identify struggling tutors before they churn or cause student issues
- Prioritize coaching resources effectively
- Track improvement after interventions

**Pain Points:**
- Overwhelmed by manual review of session feedback
- Discovers problems too late (tutor already quit or student churned)
- No systematic way to spot patterns across tutors

**Key Features:**
- Churn risk dashboard (sorted by urgency)
- First-session performance alerts
- Intervention tracking and ROI measurement

---

### Secondary User: Tutor Success Coach (Marcus)
**Role:** Provides 1-on-1 coaching to tutors  
**Goals:**
- Understand specific improvement areas for each tutor
- Track progress over time
- Tailor coaching to individual needs

**Pain Points:**
- Generic feedback doesn't help tutors improve
- No objective data to guide coaching conversations
- Can't prove coaching impact

**Key Features:**
- Individual tutor detail pages with score breakdowns
- Trend analysis (7-day vs 30-day performance)
- Specific coaching recommendations by weakness area

---

### Tertiary User: Tutor (Alex)
**Role:** Delivers tutoring sessions  
**Goals:**
- Understand performance expectations
- See personal improvement over time
- Know what to improve

**Pain Points:**
- Unclear why they received certain ratings
- No actionable feedback
- Surprised by negative reviews

**Key Features (Future):**
- Self-service performance view
- Transparent scoring methodology
- Improvement tips and training resources

---

## 3. Core Features & Requirements

### 3.1 Dashboard Overview (Home Page)

**Route:** `/dashboard`

#### Top-Level Metrics Cards
Display 4 KPI cards with real-time calculations:

| Metric | Calculation | Alert Threshold | Visual Treatment |
|--------|-------------|-----------------|------------------|
| **Total Active Tutors** | Count where `active_status = true` | <100 (staffing issue) | Red if below threshold |
| **High Churn Risk** | Count where `churn_risk_level = 'High'` | >15 (16% baseline) | Red with pulse animation |
| **Avg Engagement Score** | Mean `avg_engagement_score` across all tutors | <6.0 | Yellow if concerning |
| **First Session Issues** | Count where `poor_first_session_flag = true` | >20 (critical issue) | Red with warning icon |

**Data Source:** `tutor_aggregates` table

**Acceptance Criteria:**
- [ ] Metrics update on page load (server-side fetch)
- [ ] Cards use color coding (green/yellow/red) based on thresholds
- [ ] Clicking card filters main table below
- [ ] Load time <1 second for all metrics

---

#### Churn Risk Priority Table

**Purpose:** Surface tutors requiring immediate intervention, ranked by urgency

**Columns:**
1. **Tutor ID** - Clickable link to detail page
2. **Name** - Display name (mock data: "Tutor T0042")
3. **Churn Probability** - Badge colored by risk level
4. **Risk Level** - High/Medium/Low
5. **Primary Signal** - Most critical churn indicator
6. **Sessions (7d)** - Recent activity level
7. **Avg Rating (7d)** - Recent performance trend
8. **Action** - Quick action button

**Sorting:** Default by `churn_probability DESC`

**Filtering:**
- Risk level dropdown (All, High, Medium, Low)
- Subject filter
- Search by tutor ID

**Row Actions:**
- "View Details" → Navigate to `/dashboard/tutors/[id]`
- "Schedule Coaching" → Open intervention modal
- "Mark as Addressed" → Update status (future)

**Data Query:**
```sql
SELECT 
  t.tutor_id,
  ta.churn_probability,
  ta.churn_risk_level,
  ta.churn_signals_detected,
  ta.total_sessions_7d,
  ta.avg_rating_7d,
  t.subjects_taught
FROM tutor_aggregates ta
JOIN tutors t ON t.tutor_id = ta.tutor_id
WHERE t.active_status = true
ORDER BY ta.churn_probability DESC
LIMIT 50
```

**Acceptance Criteria:**
- [ ] Table loads with top 50 at-risk tutors
- [ ] Pagination for viewing more (50 per page)
- [ ] Filters apply instantly (client-side)
- [ ] Clicking row highlights and shows quick actions
- [ ] Export to CSV functionality

---

#### Engagement Trends Chart

**Purpose:** Visualize system-wide quality trends over time

**Chart Type:** Multi-line time series (Recharts)

**Lines:**
1. Average Engagement Score (blue)
2. Average Student Rating (green)
3. First Session Rating (orange, dashed)

**X-Axis:** Date (last 30 days, daily aggregates)  
**Y-Axis:** Score (1-10 scale for engagement, 1-5 for ratings normalized)

**Data Aggregation:**
```sql
SELECT 
  DATE(session_datetime) as date,
  AVG(engagement_score) as avg_engagement,
  AVG(student_rating) * 2 as avg_rating_normalized,
  AVG(CASE WHEN is_first_session THEN student_rating * 2 END) as first_session_avg
FROM sessions
WHERE session_completed = true
  AND session_datetime >= NOW() - INTERVAL '30 days'
GROUP BY DATE(session_datetime)
ORDER BY date
```

**Interactions:**
- Hover to see exact values
- Click date to filter tables below
- Toggle lines on/off
- Zoom to date range

**Acceptance Criteria:**
- [ ] Chart renders smoothly with 30 data points
- [ ] Tooltip shows all 3 values on hover
- [ ] Responsive (adjusts to screen width)
- [ ] Annotations for notable events (optional)

---

### 3.2 Tutor Detail Page

**Route:** `/dashboard/tutors/[tutorId]`

**Purpose:** Deep-dive into individual tutor performance with actionable insights

---

#### Header Section

**Layout:** Full-width banner with key info

**Left Side:**
- Tutor ID (large, bold)
- Primary subject badge
- Experience duration ("18 months experience")
- Status indicator (Active/Inactive)

**Right Side:**
- Overall Quality Score (composite, 1-10)
- Churn Risk Badge (visual prominence if High)
- Quick action buttons:
  - "Schedule Coaching Session"
  - "View All Sessions"
  - "Export Report"

**Data Source:** `tutors` joined with `tutor_aggregates`

---

#### Score Breakdown Cards (Grid Layout)

Display 6 metric cards in 2×3 grid:

1. **Empathy Score**
   - Value: `avg_empathy_score` (1-10)
   - Visual: Progress bar with color gradient
   - Benchmark: "Top 25%" or "Below average"
   - Trend: ↑ +0.3 vs last week

2. **Clarity Score**
   - Value: `avg_clarity_score` (1-10)
   - Context: "Explanations are clear and well-structured"
   - Recommendation: "Consider using more examples"

3. **Engagement Score**
   - Value: `avg_engagement_score` (1-10)
   - Components: 40% attention, 30% speak balance, 30% sentiment
   - Alert: Red flag if <5.5

4. **Student Satisfaction**
   - Value: `avg_student_satisfaction` (1-10)
   - NPS-style gauge visualization
   - Would-recommend rate: `recommendation_rate * 100`%

5. **Reliability Score**
   - Value: `reliability_score` (0-1, display as %)
   - Sub-metrics: Reschedule rate, no-show count
   - Industry benchmark comparison

6. **First Session Performance**
   - Value: `first_session_avg_rating` (1-5 stars)
   - **Critical Alert:** If `poor_first_session_flag = true`, show red banner
   - Impact: "24% churn risk for poor first sessions"
   - Count: "Based on X first sessions delivered"

**Acceptance Criteria:**
- [ ] Each card has context, not just raw numbers
- [ ] Visual indicators (colors, icons) for good/bad
- [ ] Hover for detailed calculation methodology
- [ ] Cards link to relevant training resources

---

#### Session History Table

**Purpose:** Show recent session performance with drill-down capability

**Columns:**
1. Date/Time
2. Subject
3. Duration
4. Student Rating (stars)
5. Engagement Score
6. Key Flags (first session, technical issues, etc.)
7. Actions (view transcript summary)

**Sorting:** Default by date DESC  
**Pagination:** 20 sessions per page  
**Filtering:** Subject, date range, rating threshold

**Row Expansion:**
- Click row to expand inline details:
  - Sentiment scores breakdown
  - Video engagement metrics (attention %, speak ratio)
  - Student feedback comments (if available)

**Data Query:**
```sql
SELECT 
  session_id,
  session_datetime,
  subject,
  actual_duration_min,
  student_rating,
  engagement_score,
  empathy_score,
  clarity_score,
  is_first_session,
  had_technical_issues,
  student_satisfaction
FROM sessions
WHERE tutor_id = $1
  AND session_completed = true
ORDER BY session_datetime DESC
LIMIT 20 OFFSET $2
```

**Acceptance Criteria:**
- [ ] Table loads quickly even with 1000+ sessions
- [ ] Expandable rows work smoothly
- [ ] Export selected sessions to CSV
- [ ] Filter persists in URL params

---

#### Intervention Recommendations Panel

**Purpose:** AI-generated coaching suggestions based on detected patterns

**Logic:** Rule-based recommendations triggered by churn signals

**Recommendation Categories:**

1. **First Session Training** (HIGH PRIORITY)
   - **Trigger:** `poor_first_session_flag = true`
   - **Message:** "Tutor struggles with first sessions - 24% churn risk"
   - **Action:** "Assign 'First Session Excellence' training module"
   - **Resources:** Link to onboarding checklist, video examples

2. **Scheduling Reliability** (MEDIUM PRIORITY)
   - **Trigger:** `reschedule_rate > 0.15`
   - **Message:** "22% reschedule rate (target: <10%)"
   - **Action:** "Review scheduling practices with manager"
   - **Resources:** Time management guide

3. **Engagement Coaching** (MEDIUM PRIORITY)
   - **Trigger:** `avg_engagement_score < 5.5`
   - **Message:** "Students show low attention during sessions"
   - **Action:** "Focus on interactive teaching techniques"
   - **Specific Issues:**
     - If `tutor_speak_ratio > 0.65`: "Tutor talks too much - encourage student participation"
     - If `screen_share_pct < 30%`: "Use more visual aids"

4. **Technical Support** (LOW PRIORITY)
   - **Trigger:** `technical_issue_rate > 0.12` (from sessions)
   - **Message:** "Frequent connection quality issues"
   - **Action:** "IT support for equipment upgrade"

5. **Empathy Development** (MEDIUM PRIORITY)
   - **Trigger:** `avg_empathy_score < 5.0`
   - **Message:** "Students report feeling unheard"
   - **Action:** "Active listening workshop"

6. **Positive Reinforcement** (ALWAYS SHOW)
   - **Trigger:** Top performer metrics
   - **Message:** "High performer - consider mentor role"
   - **Action:** "Nominate for Tutor of the Month"

**UI Treatment:**
- Cards ordered by priority (HIGH → LOW)
- Color-coded borders (red/yellow/green)
- Checkboxes to mark as "Addressed"
- Track completion and outcomes (future)

**Acceptance Criteria:**
- [ ] Show 3-5 most relevant recommendations
- [ ] Each recommendation has clear next action
- [ ] Resources linked directly (training videos, guides)
- [ ] Track which recommendations were acted on
- [ ] Show estimated impact ("Expected 15% improvement")

---

#### Performance Trend Charts

**Purpose:** Visualize tutor improvement/decline over time

**Chart 1: Rating Trend (30 days)**
- Line chart: Daily average student rating
- Moving average (7-day)
- Annotations for coaching sessions or interventions

**Chart 2: Score Components Radar**
- Radar chart: Empathy, Clarity, Engagement, Satisfaction, Reliability
- Compare current (solid) vs 30 days ago (dashed)

**Chart 3: Session Volume**
- Bar chart: Sessions per week
- Flag weeks with concerning drops

**Acceptance Criteria:**
- [ ] Charts update based on date range selector
- [ ] Responsive on mobile
- [ ] Export chart as image

---

### 3.3 Alerts & Notifications Page

**Route:** `/dashboard/alerts`

**Purpose:** Centralized view of all system alerts requiring action

---

#### Alert Types

1. **Critical Alerts** (Require immediate action)
   - New high-risk tutor (churn probability >70%)
   - Sudden rating drop (>0.5 decline in 7 days)
   - Multiple no-shows in 7 days
   - Poor first session with new student

2. **Warning Alerts** (Monitor closely)
   - Approaching high churn risk (40-60%)
   - Declining engagement trend
   - Increasing reschedule rate

3. **Informational Alerts**
   - Tutor reached milestone (100 sessions)
   - Exceptional performance (5.0 rating streak)
   - Training completed

**Alert Table Columns:**
- Priority indicator (red dot for critical)
- Alert type
- Tutor ID
- Message
- Triggered date
- Status (New/Acknowledged/Resolved)
- Actions

**Filtering:**
- By priority level
- By alert type
- By status
- By tutor

**Acceptance Criteria:**
- [ ] Alerts ordered by priority and recency
- [ ] Mark multiple alerts as acknowledged (bulk action)
- [ ] Alert details expand inline
- [ ] Link directly to tutor detail page
- [ ] Badge on main nav shows unacknowledged count

---

### 3.4 Search & Filtering (Global)

**Location:** Top navigation bar

**Search Input:**
- Placeholder: "Search tutors by ID, name, or subject..."
- Autocomplete suggestions
- Search results show tutor card with quick stats
- Press Enter to navigate to tutor detail

**Global Filters (Persistent):**
- Date range selector (Last 7 days, 30 days, Custom)
- Subject filter (multi-select)
- Risk level filter
- Active status toggle

**Acceptance Criteria:**
- [ ] Search works across all pages
- [ ] Filters persist in URL params
- [ ] Results update instantly (<200ms)
- [ ] Clear all filters button
- [ ] Show active filter count badge

---

## 4. Data Model & Schema

### 4.1 Database Tables (Prisma Schema)

```prisma
model Tutor {
  id                    String   @id @default(cuid())
  tutorId               String   @unique @map("tutor_id")
  monthsExperience      Int      @map("months_experience")
  totalSessions         Int      @map("total_sessions_completed")
  avgHistoricalRating   Float    @map("avg_historical_rating")
  subjectsTaught        String   @map("subjects_taught")
  primarySubject        String   @map("primary_subject")
  rescheduleRate        Float    @map("reschedule_rate")
  noShowCount           Int      @map("no_show_count")
  reliabilityScore      Float    @map("reliability_score")
  certificationLevel    String   @map("certification_level")
  activeStatus          Boolean  @map("active_status")
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  sessions              Session[]
  aggregates            TutorAggregate?
  
  @@map("tutors")
  @@index([activeStatus])
  @@index([primarySubject])
}

model Session {
  id                    String    @id @default(cuid())
  sessionId             String    @unique @map("session_id")
  tutorId               String    @map("tutor_id")
  sessionDatetime       DateTime  @map("session_datetime")
  scheduledDuration     Int       @map("scheduled_duration_min")
  actualDuration        Int       @map("actual_duration_min")
  subject               String
  gradeLevel            String    @map("grade_level")
  isFirstSession        Boolean   @map("is_first_session")
  sessionCompleted      Boolean   @map("session_completed")
  studentShowed         Boolean   @map("student_showed")
  tutorShowed           Boolean   @map("tutor_showed")
  connectionQuality     String    @map("connection_quality")
  hadTechnicalIssues    Boolean   @map("had_technical_issues")
  
  // Video engagement metrics (nullable if session incomplete)
  studentAttentionPct   Float?    @map("student_attention_pct")
  tutorCameraOnPct      Float?    @map("tutor_camera_on_pct")
  tutorSpeakRatio       Float?    @map("tutor_speak_ratio")
  screenSharePct        Float?    @map("screen_share_pct")
  
  // Sentiment scores (nullable)
  overallSentiment      Float?    @map("overall_sentiment")
  studentSentiment      Float?    @map("student_sentiment")
  tutorSentiment        Float?    @map("tutor_sentiment")
  
  // Quality scores (nullable)
  empathyScore          Float?    @map("empathy_score")
  clarityScore          Float?    @map("clarity_score")
  engagementScore       Float?    @map("engagement_score")
  
  // Student feedback (nullable)
  studentRating         Float?    @map("student_rating")
  studentSatisfaction   Float?    @map("student_satisfaction")
  wouldRecommend        Boolean?  @map("would_recommend")
  
  tutor                 Tutor     @relation(fields: [tutorId], references: [tutorId])
  
  @@map("sessions")
  @@index([tutorId])
  @@index([sessionDatetime])
  @@index([isFirstSession])
  @@index([sessionCompleted])
}

model TutorAggregate {
  id                      String   @id @default(cuid())
  tutorId                 String   @unique @map("tutor_id")
  totalSessions30d        Int      @map("total_sessions_30d")
  totalSessions7d         Int      @map("total_sessions_7d")
  avgRating30d            Float    @map("avg_rating_30d")
  avgRating7d             Float?   @map("avg_rating_7d")
  avgEngagementScore      Float    @map("avg_engagement_score")
  avgEmpathyScore         Float    @map("avg_empathy_score")
  avgClarityScore         Float    @map("avg_clarity_score")
  avgStudentSatisfaction  Float    @map("avg_student_satisfaction")
  firstSessionCount       Int      @map("first_session_count")
  firstSessionAvgRating   Float?   @map("first_session_avg_rating")
  poorFirstSessionFlag    Boolean  @map("poor_first_session_flag")
  recommendationRate      Float    @map("recommendation_rate")
  technicalIssueRate      Float    @map("technical_issue_rate")
  sentimentTrend7d        Float?   @map("sentiment_trend_7d")
  churnProbability        Float    @map("churn_probability")
  churnRiskLevel          String   @map("churn_risk_level")
  churnSignalsDetected    Int      @map("churn_signals_detected")
  lastCalculated          DateTime @default(now()) @map("last_calculated")
  
  tutor                   Tutor    @relation(fields: [tutorId], references: [tutorId])
  
  @@map("tutor_aggregates")
  @@index([churnRiskLevel])
  @@index([churnProbability])
  @@index([poorFirstSessionFlag])
}
```

### 4.2 Key Indexes for Performance

```sql
-- Tutor lookups
CREATE INDEX idx_tutors_active_status ON tutors(active_status);
CREATE INDEX idx_tutors_primary_subject ON tutors(primary_subject);

-- Session queries (most frequent)
CREATE INDEX idx_sessions_tutor_datetime ON sessions(tutor_id, session_datetime DESC);
CREATE INDEX idx_sessions_completed_datetime ON sessions(session_completed, session_datetime DESC);
CREATE INDEX idx_sessions_first_session ON sessions(is_first_session) WHERE is_first_session = true;

-- Aggregate filtering
CREATE INDEX idx_aggregates_churn_risk ON tutor_aggregates(churn_risk_level, churn_probability DESC);
CREATE INDEX idx_aggregates_poor_first ON tutor_aggregates(poor_first_session_flag) WHERE poor_first_session_flag = true;
```

---

## 5. API Routes & Data Fetching

### 5.1 API Endpoints (Next.js App Router)

**Pattern:** Server Components for initial data, API routes for dynamic updates

#### GET `/api/tutors`
```typescript
// app/api/tutors/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const riskLevel = searchParams.get('risk_level')
  const subject = searchParams.get('subject')
  const limit = parseInt(searchParams.get('limit') || '50')
  
  const tutors = await prisma.tutor.findMany({
    where: {
      activeStatus: true,
      ...(subject && { primarySubject: subject }),
      aggregates: {
        ...(riskLevel && { churnRiskLevel: riskLevel })
      }
    },
    include: {
      aggregates: true
    },
    orderBy: {
      aggregates: {
        churnProbability: 'desc'
      }
    },
    take: limit
  })
  
  return Response.json(tutors)
}
```

#### GET `/api/tutors/[tutorId]`
```typescript
// app/api/tutors/[tutorId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { tutorId: string } }
) {
  const tutor = await prisma.tutor.findUnique({
    where: { tutorId: params.tutorId },
    include: {
      aggregates: true,
      sessions: {
        where: { sessionCompleted: true },
        orderBy: { sessionDatetime: 'desc' },
        take: 20
      }
    }
  })
  
  if (!tutor) {
    return Response.json({ error: 'Tutor not found' }, { status: 404 })
  }
  
  return Response.json(tutor)
}
```

#### GET `/api/dashboard/metrics`
```typescript
// app/api/dashboard/metrics/route.ts
export async function GET() {
  const [
    totalTutors,
    highRiskCount,
    avgEngagement,
    poorFirstSessionCount
  ] = await Promise.all([
    prisma.tutor.count({ where: { activeStatus: true } }),
    prisma.tutorAggregate.count({ where: { churnRiskLevel: 'High' } }),
    prisma.tutorAggregate.aggregate({
      _avg: { avgEngagementScore: true }
    }),
    prisma.tutorAggregate.count({ where: { poorFirstSessionFlag: true } })
  ])
  
  return Response.json({
    totalTutors,
    highRiskCount,
    avgEngagement: avgEngagement._avg.avgEngagementScore,
    poorFirstSessionCount
  })
}
```

#### GET `/api/sessions/trends`
```typescript
// app/api/sessions/trends/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')
  
  const trends = await prisma.$queryRaw`
    SELECT 
      DATE(session_datetime) as date,
      AVG(engagement_score) as avg_engagement,
      AVG(student_rating) * 2 as avg_rating_normalized,
      AVG(CASE WHEN is_first_session THEN student_rating * 2 END) as first_session_avg
    FROM sessions
    WHERE session_completed = true
      AND session_datetime >= NOW() - INTERVAL '${days} days'
    GROUP BY DATE(session_datetime)
    ORDER BY date
  `
  
  return Response.json(trends)
}
```

### 5.2 Server Component Data Fetching

```typescript
// app/dashboard/page.tsx
import { prisma } from '@/lib/db'

export default async function DashboardPage() {
  // Fetch data server-side (no client-side loading state needed)
  const metrics = await getDashboardMetrics()
  const highRiskTutors = await getHighRiskTutors(10)
  const trendsData = await getEngagementTrends(30)
  
  return (
    <div>
      <MetricsGrid metrics={metrics} />
      <ChurnRiskTable tutors={highRiskTutors} />
      <EngagementTrends data={trendsData} />
    </div>
  )
}

async function getDashboardMetrics() {
  // Implementation matches /api/dashboard/metrics
  // But called directly, no HTTP overhead
}
```

---

## 6. UI/UX Design Specifications

### 6.1 Design System

**Framework:** shadcn/ui (built on Radix UI + Tailwind CSS)

**Color Palette:**
```css
/* Primary (Nerdy brand colors - adapt to actual brand) */
--primary: 220 90% 56%        /* Blue */
--primary-foreground: 0 0% 100%

/* Status Colors */
--success: 142 71% 45%        /* Green - good performance */
--warning: 38 92% 50%         /* Yellow - needs attention */
--destructive: 0 84% 60%      /* Red - critical issue */

/* Neutral */
--background: 0 0% 100%
--foreground: 222 47% 11%
--muted: 210 40% 96%
--border: 214 32% 91%
```

**Typography:**
- Headings: Inter (system font fallback)
- Body: Inter
- Monospace: JetBrains Mono (for IDs, metrics)

**Spacing:** 4px base unit (Tailwind default)

---

### 6.2 Component Library

**Reusable Components:**

1. **MetricCard**
   - Props: `title`, `value`, `change`, `trend`, `status`
   - Variants: `default`, `success`, `warning`, `danger`
   - Example:
   ```tsx
   <MetricCard
     title="High Churn Risk"
     value={23}
     change="+3 from yesterday"
     trend="up"
     status="danger"
   />
   ```

2. **TutorScoreBadge**
   - Props: `score`, `label`, `max`
   - Visual: Circular progress or linear bar
   - Color-coded by score range

3. **ChurnRiskBadge**
   - Props: `probability`, `riskLevel`
   - Visual: Pill badge with color and pulse animation for high risk
   - Example: 🔴 72% HIGH RISK

4. **InterventionCard**
   - Props: `priority`, `title`, `description`, `action`, `resources`
   - Visual: Card with left border matching priority color
   - Checkbox to mark as addressed

5. **SessionRow**
   - Props: `session` object
   - Expandable: Shows detailed metrics on click
   - Flags: Icons for first session, technical issues

**shadcn/ui Components Used:**
- `Button`, `Badge`, `Card`, `Table`, `Dialog`, `Select`, `Input`
- `Tooltip`, `Popover`, `Tabs`, `Separator`, `Progress`
- `Alert`, `DropdownMenu`, `ScrollArea`, `Skeleton`

---

### 6.3 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  Top Nav: Logo | Dashboard | Alerts (badge) | Search    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  [Main Content Area - Server Rendered]                   │
│                                                           │
│  Page-specific content based on route                    │
│                                                           │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

**Responsive Breakpoints:**
- Mobile: <640px (single column, collapsible tables)
- Tablet: 640-1024px (2-column grids)
- Desktop: >1024px (3-column grids, full tables)

**Loading States:**
- Skeleton loaders for server components during navigation
- Suspense boundaries for async components
- Optimistic UI updates for actions (mark as addressed, etc.)

---

### 6.4 Accessibility (WCAG 2.1 AA)

**Requirements:**
- [ ] All interactive elements keyboard accessible (Tab, Enter, Esc)
- [ ] Color contrast ratio ≥4.5:1 for text, ≥3:1 for large text
- [ ] ARIA labels on all icon-only buttons
- [ ] Screen reader announcements for dynamic content
- [ ] Focus visible on all interactive elements
- [ ] Skip to main content link
- [ ] Semantic HTML (proper heading hierarchy)

---

## 7. Performance Requirements

### 7.1 Load Time Targets

| Page | Target (P95) | Strategy |
|------|--------------|----------|
| Dashboard Home | <1.5s | Server-side rendering, aggressive caching |
| Tutor Detail | <2.0s | Parallel data fetching, incremental rendering |
| Search Results | <500ms | Client-side filtering with debounce |
| Alerts Page | <1.0s | Indexed queries, pagination |
| Chart Rendering | <300ms | Data pre-aggregated, lazy load on scroll |

### 7.2 Database Optimization

**Query Performance Goals:**
- Dashboard metrics: <100ms
- Tutor list (50 records): <150ms
- Tutor detail with sessions: <200ms
- Trend aggregations: <300ms

**Optimization Strategies:**
```typescript
// Connection pooling
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL, // Uses connection pooling
    },
  },
})

// Query optimization examples
// 1. Use select to reduce payload
const tutors = await prisma.tutor.findMany({
  select: {
    tutorId: true,
    primarySubject: true,
    aggregates: {
      select: {
        churnProbability: true,
        churnRiskLevel: true,
        totalSessions7d: true
      }
    }
  }
})

// 2. Batch operations with Promise.all
const [metrics, alerts, trends] = await Promise.all([
  getMetrics(),
  getAlerts(),
  getTrends()
])

// 3. Use raw SQL for complex aggregations
const trends = await prisma.$queryRaw`...`
```

**Caching Strategy:**
```typescript
// Next.js Cache Configuration
export const revalidate = 60 // Revalidate every 60 seconds

// Or per-fetch caching
fetch(url, { next: { revalidate: 3600 } }) // 1 hour cache

// Use React cache() for deduplication
import { cache } from 'react'

export const getTutorById = cache(async (id: string) => {
  return await prisma.tutor.findUnique({ where: { tutorId: id } })
})
```

### 7.3 Frontend Performance

**Bundle Size Limits:**
- First Load JS: <200KB (gzipped)
- Page JS: <100KB per route
- Total blocking time: <300ms

**Optimization Techniques:**
```typescript
// 1. Dynamic imports for heavy components
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false // Client-side only if needed
})

// 2. Image optimization
import Image from 'next/image'
<Image src="/tutor.jpg" width={400} height={300} alt="Tutor" />

// 3. Font optimization (automatic with Next.js)
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

// 4. Streaming with Suspense
<Suspense fallback={<TableSkeleton />}>
  <TutorTable />
</Suspense>
```

---

## 8. Data Import & Seeding

### 8.1 CSV Import Process

**Location:** `scripts/import-data.ts`

**Steps:**
1. Read CSV files from `/data` directory
2. Parse with `csv-parse` library
3. Transform data types (strings → numbers, booleans)
4. Bulk insert using Prisma `createMany`
5. Verify data integrity

**Implementation:**
```typescript
// scripts/import-data.ts
import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function importTutors() {
  console.log('📥 Importing tutors...')
  
  const csvPath = path.join(process.cwd(), 'data', 'tutor_profiles.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    cast: true, // Auto-convert types
    cast_date: true
  })
  
  // Transform field names to match Prisma schema
  const tutors = records.map((r: any) => ({
    tutorId: r.tutor_id,
    monthsExperience: parseInt(r.months_experience),
    totalSessions: parseInt(r.total_sessions_completed),
    avgHistoricalRating: parseFloat(r.avg_historical_rating),
    subjectsTaught: r.subjects_taught,
    primarySubject: r.primary_subject,
    rescheduleRate: parseFloat(r.reschedule_rate),
    noShowCount: parseInt(r.no_show_count),
    reliabilityScore: parseFloat(r.reliability_score),
    certificationLevel: r.certification_level,
    activeStatus: r.active_status === 'True' || r.active_status === 'true'
  }))
  
  await prisma.tutor.createMany({
    data: tutors,
    skipDuplicates: true
  })
  
  console.log(`✅ Imported ${tutors.length} tutors`)
}

async function importSessions() {
  console.log('📥 Importing sessions...')
  
  const csvPath = path.join(process.cwd(), 'data', 'sessions.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  })
  
  // Process in batches of 1000 for performance
  const batchSize = 1000
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize).map((r: any) => ({
      sessionId: r.session_id,
      tutorId: r.tutor_id,
      sessionDatetime: new Date(r.session_datetime),
      scheduledDuration: parseInt(r.scheduled_duration_min),
      actualDuration: parseInt(r.actual_duration_min),
      subject: r.subject,
      gradeLevel: r.grade_level,
      isFirstSession: r.is_first_session === 'True',
      sessionCompleted: r.session_completed === 'True',
      studentShowed: r.student_showed === 'True',
      tutorShowed: r.tutor_showed === 'True',
      connectionQuality: r.connection_quality,
      hadTechnicalIssues: r.had_technical_issues === 'True',
      
      // Nullable numeric fields
      studentAttentionPct: r.student_attention_pct ? parseFloat(r.student_attention_pct) : null,
      tutorCameraOnPct: r.tutor_camera_on_pct ? parseFloat(r.tutor_camera_on_pct) : null,
      tutorSpeakRatio: r.tutor_speak_ratio ? parseFloat(r.tutor_speak_ratio) : null,
      screenSharePct: r.screen_share_pct ? parseFloat(r.screen_share_pct) : null,
      overallSentiment: r.overall_sentiment ? parseFloat(r.overall_sentiment) : null,
      studentSentiment: r.student_sentiment ? parseFloat(r.student_sentiment) : null,
      tutorSentiment: r.tutor_sentiment ? parseFloat(r.tutor_sentiment) : null,
      empathyScore: r.empathy_score ? parseFloat(r.empathy_score) : null,
      clarityScore: r.clarity_score ? parseFloat(r.clarity_score) : null,
      engagementScore: r.engagement_score ? parseFloat(r.engagement_score) : null,
      studentRating: r.student_rating ? parseFloat(r.student_rating) : null,
      studentSatisfaction: r.student_satisfaction ? parseFloat(r.student_satisfaction) : null,
      wouldRecommend: r.would_recommend === 'True' ? true : r.would_recommend === 'False' ? false : null
    }))
    
    await prisma.session.createMany({
      data: batch,
      skipDuplicates: true
    })
    
    console.log(`   Imported ${Math.min(i + batchSize, records.length)} / ${records.length} sessions`)
  }
  
  console.log(`✅ Imported ${records.length} sessions`)
}

async function importAggregates() {
  console.log('📥 Importing tutor aggregates...')
  
  const csvPath = path.join(process.cwd(), 'data', 'tutor_aggregates.csv')
  const csvContent = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true
  })
  
  const aggregates = records.map((r: any) => ({
    tutorId: r.tutor_id,
    totalSessions30d: parseInt(r.total_sessions_30d),
    totalSessions7d: parseInt(r.total_sessions_7d),
    avgRating30d: parseFloat(r.avg_rating_30d),
    avgRating7d: r.avg_rating_7d ? parseFloat(r.avg_rating_7d) : null,
    avgEngagementScore: parseFloat(r.avg_engagement_score),
    avgEmpathyScore: parseFloat(r.avg_empathy_score),
    avgClarityScore: parseFloat(r.avg_clarity_score),
    avgStudentSatisfaction: parseFloat(r.avg_student_satisfaction),
    firstSessionCount: parseInt(r.first_session_count),
    firstSessionAvgRating: r.first_session_avg_rating ? parseFloat(r.first_session_avg_rating) : null,
    poorFirstSessionFlag: r.poor_first_session_flag === 'True',
    recommendationRate: parseFloat(r.recommendation_rate),
    technicalIssueRate: parseFloat(r.technical_issue_rate),
    sentimentTrend7d: r.sentiment_trend_7d ? parseFloat(r.sentiment_trend_7d) : null,
    churnProbability: parseFloat(r.churn_probability),
    churnRiskLevel: r.churn_risk_level,
    churnSignalsDetected: parseInt(r.churn_signals_detected)
  }))
  
  await prisma.tutorAggregate.createMany({
    data: aggregates,
    skipDuplicates: true
  })
  
  console.log(`✅ Imported ${aggregates.length} tutor aggregates`)
}

async function main() {
  console.log('🚀 Starting data import...\n')
  
  try {
    await importTutors()
    await importSessions()
    await importAggregates()
    
    console.log('\n✨ All data imported successfully!')
    
    // Print summary statistics
    const stats = await prisma.$transaction([
      prisma.tutor.count(),
      prisma.session.count(),
      prisma.tutorAggregate.count()
    ])
    
    console.log('\n📊 Database Statistics:')
    console.log(`   Tutors: ${stats[0]}`)
    console.log(`   Sessions: ${stats[1]}`)
    console.log(`   Aggregates: ${stats[2]}`)
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

**Run Command:**
```bash
npx tsx scripts/import-data.ts
```

### 8.2 Data Validation

**Post-Import Checks:**
```typescript
// scripts/validate-data.ts
async function validateData() {
  // 1. Check referential integrity
  const orphanedSessions = await prisma.session.count({
    where: {
      tutor: null
    }
  })
  
  if (orphanedSessions > 0) {
    throw new Error(`Found ${orphanedSessions} sessions without valid tutor`)
  }
  
  // 2. Check value ranges
  const invalidScores = await prisma.session.count({
    where: {
      OR: [
        { empathyScore: { lt: 1, not: null } },
        { empathyScore: { gt: 10 } },
        { studentRating: { lt: 1, not: null } },
        { studentRating: { gt: 5 } }
      ]
    }
  })
  
  if (invalidScores > 0) {
    throw new Error(`Found ${invalidScores} sessions with out-of-range scores`)
  }
  
  // 3. Check churn calculations
  const highRiskCount = await prisma.tutorAggregate.count({
    where: { churnRiskLevel: 'High' }
  })
  
  console.log(`✅ Validation passed`)
  console.log(`   High risk tutors: ${highRiskCount} (expected ~16%)`)
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests (Vitest)

**Coverage Targets:**
- Utility functions: 100%
- Data transformation: 90%
- Component logic: 80%

**Example Tests:**
```typescript
// lib/__tests__/churn-calculator.test.ts
import { describe, it, expect } from 'vitest'
import { calculateChurnProbability } from '../churn-calculator'

describe('calculateChurnProbability', () => {
  it('should return high risk for poor first sessions', () => {
    const tutor = {
      firstSessionAvgRating: 3.2,
      rescheduleRate: 0.10,
      avgEngagementScore: 6.0
    }
    
    const result = calculateChurnProbability(tutor)
    
    expect(result.probability).toBeGreaterThan(0.5)
    expect(result.riskLevel).toBe('High')
    expect(result.signals).toContain('poor_first_session')
  })
  
  it('should return low risk for top performers', () => {
    const tutor = {
      firstSessionAvgRating: 4.8,
      rescheduleRate: 0.03,
      avgEngagementScore: 8.5
    }
    
    const result = calculateChurnProbability(tutor)
    
    expect(result.probability).toBeLessThan(0.3)
    expect(result.riskLevel).toBe('Low')
  })
})
```

### 9.2 Integration Tests (Playwright)

**Critical User Flows:**

1. **Dashboard Load & Navigation**
```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test('should load dashboard with metrics', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Check metric cards render
  await expect(page.getByText('Total Active Tutors')).toBeVisible()
  await expect(page.getByText('High Churn Risk')).toBeVisible()
  
  // Check table loads
  const table = page.getByRole('table')
  await expect(table).toBeVisible()
  
  // Click tutor row
  await page.getByText('T0001').click()
  await expect(page).toHaveURL(/\/dashboard\/tutors\/T0001/)
})
```

2. **Filtering & Search**
```typescript
test('should filter tutors by risk level', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Open filter dropdown
  await page.getByRole('button', { name: 'Risk Level' }).click()
  await page.getByText('High').click()
  
  // Verify filtered results
  const rows = await page.getByRole('row').count()
  expect(rows).toBeLessThan(50) // Should filter down
  
  // Check all visible tutors have High risk
  const badges = await page.getByText('High').all()
  expect(badges.length).toBeGreaterThan(0)
})
```

3. **Intervention Recommendations**
```typescript
test('should show intervention recommendations', async ({ page }) => {
  await page.goto('/dashboard/tutors/T0042') // Known high-risk tutor
  
  // Check recommendations panel exists
  await expect(page.getByText('Intervention Recommendations')).toBeVisible()
  
  // Verify priority ordering
  const highPriorityCard = page.locator('[data-priority="HIGH"]').first()
  await expect(highPriorityCard).toBeVisible()
  
  // Check action button works
  await page.getByRole('button', { name: 'Schedule Coaching' }).click()
  await expect(page.getByText('Coaching session scheduled')).toBeVisible()
})
```

### 9.3 Performance Tests

**Lighthouse CI Configuration:**
```javascript
// lighthouse.config.js
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/dashboard',
        'http://localhost:3000/dashboard/tutors/T0001'
      ],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'interactive': ['error', { maxNumericValue: 3500 }]
      }
    }
  }
}
```

---

## 10. Deployment & Infrastructure

### 10.1 Vercel Deployment

**Project Configuration:**
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install",
  "regions": ["iad1"], // US East for low latency
  "env": {
    "POSTGRES_PRISMA_URL": "@postgres-prisma-url",
    "POSTGRES_URL_NON_POOLING": "@postgres-url-non-pooling"
  }
}
```

**Environment Variables (Vercel Dashboard):**
```bash
# Database
POSTGRES_PRISMA_URL=         # Connection pooling URL
POSTGRES_URL_NON_POOLING=    # Direct connection for migrations
DATABASE_URL=                # Fallback

# Next.js
NEXT_PUBLIC_APP_URL=         # https://tutor-quality.vercel.app
NODE_ENV=production

# Optional
NEXTAUTH_SECRET=             # If adding auth
NEXTAUTH_URL=                # Auth callback URL
```

**Deployment Workflow:**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment
vercel inspect tutor-quality-dashboard.vercel.app
```

### 10.2 Database Setup (Vercel Postgres)

**Provisioning:**
```bash
# Create database via Vercel dashboard or CLI
vercel postgres create tutor-quality-db

# Connect to project
vercel link

# Environment variables auto-configured
```

**Migration Strategy:**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database (development)
npx prisma db push

# Create migration (production)
npx prisma migrate dev --name init

# Apply migration in production
npx prisma migrate deploy
```

**Backup Strategy:**
- Vercel Postgres automatic daily backups (retained 7 days)
- Export data weekly: `pg_dump > backup.sql`
- Store in S3 or GitHub repo

### 10.3 Monitoring & Observability

**Vercel Analytics (Built-in):**
- Real User Monitoring (RUM)
- Web Vitals tracking
- Page load performance
- API endpoint latency

**Custom Instrumentation:**
```typescript
// lib/analytics.ts
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    // Send to Vercel Analytics
    window.va?.track(name, properties)
  }
}

// Usage in components
trackEvent('tutor_detail_viewed', { tutorId: 'T0001' })
trackEvent('intervention_scheduled', { type: 'first_session_training' })
```

**Error Tracking (Sentry Integration):**
```typescript
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  environment: process.env.NODE_ENV
})
```

**Database Monitoring:**
```typescript
// Prisma query logging
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'warn', emit: 'stdout' },
    { level: 'error', emit: 'stdout' }
  ]
})

prisma.$on('query', (e) => {
  if (e.duration > 1000) {
    console.warn('Slow query detected:', {
      query: e.query,
      duration: e.duration
    })
  }
})
```

---

## 11. Security & Compliance

### 11.1 Authentication (Future Phase)

**Clerk Integration (Recommended):**
```typescript
// middleware.ts
import { authMiddleware } from "@clerk/nextjs"

export default authMiddleware({
  publicRoutes: ["/"],
  ignoredRoutes: ["/api/public"]
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
}
```

**Authorization Rules:**
```typescript
// lib/permissions.ts
export function canViewTutorDetails(user: User, tutorId: string) {
  return user.role === 'admin' || 
         user.role === 'manager' || 
         user.tutorId === tutorId
}

export function canScheduleIntervention(user: User) {
  return user.role === 'admin' || user.role === 'manager'
}
```

### 11.2 Data Privacy

**PII Handling:**
- Synthetic data contains no real PII
- Production: Implement field-level encryption for sensitive data
- Audit logs for data access

**GDPR/CCPA Compliance:**
- Right to erasure: `DELETE FROM tutors WHERE tutor_id = ?`
- Data export: Provide CSV download of user data
- Consent tracking: Add `consent_given` boolean field

### 11.3 Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = Redis.fromEnv()

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 h"),
  analytics: true
})

// Usage in API routes
export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success, limit, remaining } = await ratelimit.limit(ip)
  
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }
  
  // ... handle request
}
```

---

## 12. Documentation & Handoff

### 12.1 Developer Documentation

**README.md Structure:**
```markdown
# Tutor Quality Dashboard

## Quick Start
npm install
npx prisma generate
npx prisma db push
npm run dev

## Data Import
npm run import-data

## Deployment
vercel --prod

## Architecture
- Next.js 14 App Router
- Vercel Postgres + Prisma
- shadcn/ui components

## Key Files
- `/app/dashboard` - Main dashboard pages
- `/lib/db.ts` - Database client
- `/components` - Reusable UI components
- `/scripts` - Data import scripts

## Environment Variables
See `.env.example` for required variables
```

### 12.2 User Documentation

**Manager Guide:**
1. **Dashboard Overview** - Understanding the metrics
2. **Identifying At-Risk Tutors** - How to use the churn risk table
3. **Intervention Best Practices** - When and how to coach
4. **Tracking Progress** - Monitoring improvement over time

**Tutor Guide (Future):**
1. **Understanding Your Scores** - What each metric means
2. **Improvement Tips** - How to boost engagement, empathy, clarity
3. **First Session Excellence** - Avoiding the 24% churn trap

### 12.3 Runbook

**Common Operations:**

1. **Data Refresh (Weekly)**
```bash
# Generate new synthetic data
python scripts/generate_data.py

# Import to production
npm run import-data

# Verify counts
npx prisma studio
```

2. **Performance Issues**
```bash
# Check slow queries
SELECT query, duration FROM query_log WHERE duration > 1000

# Analyze table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC

# Vacuum database
VACUUM ANALYZE
```

3. **Deployment Rollback**
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment-url]
```

---

## 13. 48-Hour Sprint Roadmap

### Phase 1: Foundation (Hours 0-12)

**Hour 0-2: Project Setup**
- [ ] Initialize Next.js 14 project with TypeScript
- [ ] Install dependencies (Prisma, shadcn/ui, Recharts)
- [ ] Set up Vercel Postgres database
- [ ] Configure Prisma schema

**Hour 2-4: Data Import**
- [ ] Create data import script
- [ ] Run data generation (Python script)
- [ ] Import tutors, sessions, aggregates to Postgres
- [ ] Verify data integrity

**Hour 4-8: Core UI Components**
- [ ] Install shadcn/ui base components
- [ ] Create MetricCard component
- [ ] Create ChurnRiskBadge component
- [ ] Create base layout with navigation

**Hour 8-12: Dashboard Page**
- [ ] Build metrics cards section
- [ ] Implement churn risk table
- [ ] Add basic filtering (risk level)
- [ ] Create engagement trends chart

---

### Phase 2: Core Features (Hours 12-24)

**Hour 12-16: Tutor Detail Page**
- [ ] Create tutor detail route `/dashboard/tutors/[id]`
- [ ] Build header section with key stats
- [ ] Implement score breakdown cards
- [ ] Add session history table

**Hour 16-20: Interventions**
- [ ] Build intervention recommendation logic
- [ ] Create InterventionCard component
- [ ] Add intervention panel to tutor detail
- [ ] Implement priority sorting

**Hour 20-24: Search & Filtering**
- [ ] Add global search in navigation
- [ ] Implement tutor autocomplete
- [ ] Add subject filter dropdown
- [ ] Add date range picker for trends

---

### Phase 3: Polish & Deploy (Hours 24-36)

**Hour 24-28: Alerts Page**
- [ ] Create alerts route `/dashboard/alerts`
- [ ] Implement alert generation logic
- [ ] Build alerts table with filtering
- [ ] Add notification badge to nav

**Hour 28-32: Performance Optimization**
- [ ] Add loading skeletons
- [ ] Implement suspense boundaries
- [ ] Optimize database queries
- [ ] Add caching headers

**Hour 32-36: Mobile Responsive**
- [ ] Test on mobile breakpoints
- [ ] Adjust table layouts for mobile
- [ ] Add collapsible sections
- [ ] Test touch interactions

---

### Phase 4: Production Hardening (Hours 36-48)

**Hour 36-40: Testing**
- [ ] Write critical unit tests
- [ ] Run Playwright E2E tests
- [ ] Test error states
- [ ] Load test with 90K sessions

**Hour 40-44: Deploy & Monitor**
- [ ] Deploy to Vercel production
- [ ] Set up Vercel Analytics
- [ ] Configure error tracking
- [ ] Test production URL

**Hour 44-48: Documentation**
- [ ] Write README with setup instructions
- [ ] Create user guide (screenshots)
- [ ] Document API endpoints
- [ ] Prepare demo walkthrough

---

## 14. Success Metrics & KPIs

### 14.1 Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Dashboard Load Time** | <1.5s | Vercel Analytics P95 |
| **Tutor Detail Load Time** | <2.0s | Vercel Analytics P95 |
| **API Response Time** | <200ms | Average across all endpoints |
| **Lighthouse Performance Score** | >90 | Automated CI checks |
| **Bundle Size** | <200KB First Load | Next.js build output |
| **Database Query Time** | <150ms | Prisma query logging |

### 14.2 Business Metrics

| Metric | Current (Manual) | Target (Automated) | Impact |
|--------|------------------|-------------------|---------|
| **Time to Identify At-Risk Tutor** | 2-3 weeks | <1 hour | 95% faster |
| **Coaching Resource Efficiency** | Random assignment | Priority-based | 3x ROI |
| **First Session Issue Detection** | Reactive (after churn) | Proactive (same day) | Prevent 24% churn |
| **QA Coverage** | ~5% sessions | 100% sessions | 20x coverage |

### 14.3 User Adoption Metrics

**Week 1 Targets:**
- 80% of managers log in and explore dashboard
- 50% managers view at least 5 tutor detail pages
- 30% managers schedule interventions based on recommendations

**Week 4 Targets:**
- 90% of managers use dashboard weekly
- 60% of interventions come from system recommendations
- Average session time >10 minutes (engaged usage)

**Quarter 1 Targets:**
- Reduce tutor churn by 10% (from baseline)
- Improve first session NPS by 15 points
- Automate 80% of QA workload (save 1.6 FTE)

---

## 15. Future Enhancements (Post-Launch)

### Phase 2 Features (Weeks 3-8)

1. **Real-Time Scoring**
   - Webhook integration with Rails sessions table
   - Process new sessions within 1 hour
   - Push notifications for critical alerts

2. **A/B Testing Framework**
   - Test intervention strategies
   - Measure effectiveness of coaching types
   - Optimize recommendation algorithms

3. **Tutor Self-Service Portal**
   - Read-only access to personal scores
   - Improvement tracking dashboard
   - Training resource library

4. **Predictive Scheduling**
   - Recommend optimal tutor-student pairings
   - Predict session outcomes before scheduling
   - Prevent high-risk combinations

### Phase 3 Features (Months 3-6)

1. **Advanced Analytics**
   - Cohort analysis (by subject, experience, region)
   - Survival analysis for churn prediction
   - Attribution modeling for interventions

2. **ML Model Enhancements**
   - Real-time churn model training
   - Personalized intervention recommendations
   - Anomaly detection for data quality

3. **Integration Expansion**
   - Slack notifications for critical alerts
   - Calendar integration for coaching sessions
   - CRM sync for tutor lifecycle management

4. **Mobile App**
   - Native iOS/Android app for managers
   - Push notifications for high-priority alerts
   - Offline access to tutor profiles

---

## 16. ROI Analysis

### 16.1 Cost Breakdown

**Development (One-Time):**
- 48-hour sprint × $150/hour (contractor rate) = $7,200
- OR: Internal engineer @ 40% capacity for 1 week = $2,000

**Infrastructure (Monthly):**
- Vercel Pro: $20/mo
- Vercel Postgres: $32/mo
- Monitoring (Sentry): $26/mo
- **Total:** $78/mo or **$936/year**

**Maintenance (Annual):**
- Weekly data refreshes: 2 hours/mo × 12 = $3,600
- Feature enhancements: 1 week/quarter = $8,000
- **Total:** $11,600/year

**Total First-Year Cost: $19,736**

### 16.2 Value Creation

**Direct Savings:**
1. **QA Automation:** 2 FTE × $100K = **$200K/year**
2. **Tutor Retention:** 10% improvement × 20 churned tutors × $7,500 replacement cost = **$15K/year**
3. **Student Retention:** 5% improvement × 50 students × $500 LTV = **$12.5K/year**

**Indirect Benefits:**
4. **Manager Productivity:** 5 hours/week saved × 10 managers × $75/hour × 52 weeks = **$195K/year**
5. **Coaching Effectiveness:** 3x ROI on coaching time = **$50K/year** (estimated)
6. **First Session Quality:** 15-point NPS improvement = **$75K/year** (customer acquisition savings)

**Total Annual Value: $547.5K**

**ROI = ($547.5K - $19.7K) / $19.7K = 2,675% or 27x return**

### 16.3 Payback Period

- **Break-even:** Month 1 (operational savings exceed costs immediately)
- **Full cost recovery:** Week 2 (based on QA automation alone)

---

## 17. Risk Mitigation

### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Database performance degradation** | Medium | High | Indexed queries, connection pooling, caching |
| **Vercel service outage** | Low | Medium | Deploy status page, fallback to cached data |
| **Data import failures** | Medium | Medium | Validation scripts, error handling, rollback capability |
| **Chart rendering performance** | Low | Low | Data aggregation, lazy loading, virtualization |

### 17.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Low manager adoption** | Medium | High | Training sessions, onboarding flow, success stories |
| **Resistance to data-driven coaching** | Medium | Medium | Transparency, tutor feedback loop, gradual rollout |
| **False positive churn predictions** | Medium | Medium | Tunable thresholds, human oversight, A/B testing |
| **Privacy concerns** | Low | High | Anonymization, clear privacy policy, opt-out options |

---

## 18. Appendix

### 18.1 Glossary

**Churn Probability:** Likelihood (0-1) that a tutor will leave the platform within 30 days

**Churn Signal:** Behavioral indicator correlating with future churn (e.g., poor first sessions, high reschedule rate)

**Engagement Score:** Composite metric (1-10) combining student attention, speaking balance, and sentiment

**First Session Flag:** Boolean indicator that tutor has poor performance specifically on first sessions with new students

**Intervention:** Proactive coaching action recommended by the system to prevent churn

**Risk Level:** Categorical classification of churn probability (Low: <30%, Medium: 30-50%, High: >50%)

### 18.2 Data Dictionary

See Section 4 (Data Model & Schema) for complete field definitions

### 18.3 References

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)
- [shadcn/ui Components](https://ui.shadcn.com)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Recharts Documentation](https://recharts.org)

---

## Document Control

**Version:** 1.0  
**Last Updated:** 2024  
**Author:** Product Team  
**Status:** Ready for Development  
**Approvals Required:** Engineering Lead, Product Manager, Operations Manager

**Change Log:**
- v1.0 (Initial): Complete PRD for 48-hour sprint with Next.js stack