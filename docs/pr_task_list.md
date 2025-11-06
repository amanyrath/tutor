# Tutor Engagement Platform - Pull Request Task List

## Workstream A: Data & Infrastructure

### PR-001: Database Schema Extensions
**Priority: P0 (Foundational)**
- [ ] Add Interventions model to `prisma/schema.prisma`
- [ ] Add EngagementEvents model to `prisma/schema.prisma`
- [ ] Add Experiments model to `prisma/schema.prisma`
- [ ] Add ExperimentAssignments model to `prisma/schema.prisma`
- [ ] Add PatternInsights model to `prisma/schema.prisma`
- [ ] Run `npx prisma db push` and verify migrations
- [ ] Add seed data for testing
- [ ] Update README with new schema documentation

**Dependencies:** None  
**Estimate:** 2-3 hours

---

### PR-002: Engagement Event Tracking API
**Priority: P0 (Foundational)**
- [ ] Create `app/api/engagement/track/route.ts` (POST endpoint)
- [ ] Create `app/api/engagement/tutors/[tutorId]/timeline/route.ts` (GET endpoint)
- [ ] Create `app/api/engagement/metrics/route.ts` (GET endpoint)
- [ ] Add validation schemas with Zod
- [ ] Add error handling and logging
- [ ] Write API tests
- [ ] Document API endpoints

**Dependencies:** PR-001  
**Estimate:** 3-4 hours

---

### PR-003: Time Series Analytics Library
**Priority: P1**
- [ ] Create `lib/analytics/time-series.ts`
- [ ] Implement weekly engagement trends calculation (query-time, no pre-aggregation)
- [ ] Implement moving averages (7-day, 30-day)
- [ ] Implement seasonal pattern detection
- [ ] Implement anomaly detection logic
- [ ] Optimize queries with indexed session_datetime
- [ ] Create `app/api/analytics/trends/route.ts`
- [ ] Add caching for frequently-accessed date ranges
- [ ] Add unit tests for analytics functions

**Dependencies:** PR-001, PR-002  
**Estimate:** 4-5 hours

**Note:** Uses query-time aggregation from sessions table - no pre-computed aggregates needed for scalability.

---

## Workstream B: AI & Insights

### PR-004: AI Pattern Discovery Foundation
**Priority: P1**
- [ ] Install `@anthropic-ai/sdk` or `openai`
- [ ] Create `lib/ai/prompts.ts` with pattern analysis prompts
- [ ] Create `lib/ai/pattern-analyzer.ts` with LLM integration
- [ ] Add error handling and retry logic
- [ ] Add response parsing and validation
- [ ] Create `.env.example` with AI API key placeholder
- [ ] Add unit tests with mocked LLM responses

**Dependencies:** PR-001  
**Estimate:** 3-4 hours

---

### PR-005: Pattern Discovery Script & Scheduler
**Priority: P1**
- [ ] Create `scripts/discover-patterns.ts`
- [ ] Implement data aggregation from last 7 days
- [ ] Integrate with AI pattern analyzer
- [ ] Store insights in PatternInsights table
- [ ] Create `app/api/cron/discover-patterns/route.ts` for Vercel Cron
- [ ] Add logging and monitoring
- [ ] Configure cron schedule in `vercel.json`

**Dependencies:** PR-004  
**Estimate:** 3-4 hours

---

### PR-006: Insights Dashboard
**Priority: P1**
- [ ] Create `app/dashboard/insights/page.tsx`
- [ ] Create `components/dashboard/insight-card.tsx`
- [ ] Create `app/api/insights/route.ts` (GET/POST/DELETE)
- [ ] Display recent discoveries with confidence scores
- [ ] Add filtering by date, pattern type, confidence
- [ ] Add "affected tutors" drill-down
- [ ] Add "try this recommendation" action buttons
- [ ] Style with Tailwind

**Dependencies:** PR-005  
**Estimate:** 4-5 hours

---

## Workstream C: Alerts & Email

### PR-007: Email Infrastructure Setup
**Priority: P0**
- [ ] Install `resend` or `@sendgrid/mail`
- [ ] Install `react-email` and `@react-email/components`
- [ ] Create `lib/email/sender.ts` with email delivery logic
- [ ] Add email tracking (open/click pixels)
- [ ] Add unsubscribe management
- [ ] Create email template components in `lib/email/templates/`
- [ ] Add `.env` variables for email API keys
- [ ] Test email delivery in development

**Dependencies:** None  
**Estimate:** 3-4 hours

---

### PR-008: Email Templates Library
**Priority: P1**
- [ ] Create base email layout component
- [ ] Create engagement alert email template
- [ ] Create first session reminder template
- [ ] Create quality alert email template
- [ ] Create technical issues alert template
- [ ] Create re-engagement email template
- [ ] Add preview route: `app/api/email-preview/route.ts`
- [ ] Test all templates in multiple email clients

**Dependencies:** PR-007  
**Estimate:** 4-5 hours

---

### PR-009: Alert Rules Engine
**Priority: P1**
- [ ] Create `lib/alerts/rules.ts` with alert conditions
- [ ] Implement "No login in 7 days" rule
- [ ] Implement "No sessions in 14 days" rule
- [ ] Implement "Declining engagement trend" rule
- [ ] Implement "First session scheduled" rule
- [ ] Implement "Low rating" rule
- [ ] Implement "Technical issues spike" rule
- [ ] Add priority scoring algorithm
- [ ] Add deduplication logic
- [ ] Add unit tests for each rule

**Dependencies:** PR-001, PR-002  
**Estimate:** 4-5 hours

---

### PR-010: Alert Generation Engine
**Priority: P1**
- [ ] Create `lib/alerts/generator.ts`
- [ ] Implement scheduled scanning logic
- [ ] Integrate with alert rules engine
- [ ] Store generated alerts in Interventions table
- [ ] Create `scripts/generate-alerts.ts`
- [ ] Create `app/api/cron/generate-alerts/route.ts`
- [ ] Create `app/api/alerts/route.ts` (CRUD operations)
- [ ] Add logging and error monitoring
- [ ] Configure hourly cron job

**Dependencies:** PR-009  
**Estimate:** 4-5 hours

---

### PR-011: Email Delivery Scheduler
**Priority: P1**
- [ ] Create `scripts/send-emails.ts`
- [ ] Query pending interventions from database
- [ ] Integrate with email sender
- [ ] Update intervention tracking (sent_at)
- [ ] Handle email delivery failures
- [ ] Create `app/api/cron/send-emails/route.ts`
- [ ] Add rate limiting
- [ ] Configure 6-hour cron job

**Dependencies:** PR-007, PR-010  
**Estimate:** 3-4 hours

---

## Workstream D: Experiments

### PR-012: GrowthBook Integration ✅
**Priority: P1**
- [x] Install `@growthbook/growthbook`
- [x] Create `lib/experiments/growthbook.ts` with SDK setup
- [x] Create `app/providers/experiment-provider.tsx`
- [x] Add tutor attributes context (subject, experience, risk_level)
- [x] Create custom `useFeature` hook
- [x] Add GrowthBook environment variables
- [x] Test feature flag functionality
- [x] Document GrowthBook setup process

**Dependencies:** None  
**Estimate:** 3-4 hours  
**Status:** ✅ COMPLETED

---

### PR-013: Experiment Assignment System
**Priority: P1**
- [ ] Create experiment assignment logic in `lib/experiments/growthbook.ts`
- [ ] Store assignments in ExperimentAssignments table
- [ ] Implement variant exposure tracking
- [ ] Add experiment context to intervention system
- [ ] Create API endpoint for manual assignment
- [ ] Add assignment audit logging

**Dependencies:** PR-012, PR-001  
**Estimate:** 3-4 hours

---

### PR-014: Experiments Dashboard
**Priority: P2**
- [ ] Create `app/dashboard/experiments/page.tsx`
- [ ] Create `components/dashboard/experiment-card.tsx`
- [ ] Display active experiments list
- [ ] Show experiment status and metadata
- [ ] Add sample size calculator component
- [ ] Add experiment creation form
- [ ] Link to GrowthBook for detailed config

**Dependencies:** PR-012  
**Estimate:** 4-5 hours

---

### PR-015: Experiment Results Analysis
**Priority: P2**
- [ ] Create `app/dashboard/experiments/[experimentId]/page.tsx`
- [ ] Create `components/dashboard/experiment-results.tsx`
- [ ] Calculate conversion metrics (open rate, response rate)
- [ ] Implement statistical significance testing
- [ ] Display engagement lift metrics
- [ ] Add results visualization (charts)
- [ ] Add CSV export functionality
- [ ] Document interpretation guidelines

**Dependencies:** PR-014  
**Estimate:** 4-5 hours

---

## Workstream E: Analytics

### PR-016: Engagement Tracking Components
**Priority: P1**
- [ ] Create `components/dashboard/activation-timeline.tsx`
- [ ] Create `components/dashboard/engagement-heatmap.tsx`
- [ ] Create `components/dashboard/activation-metric-card.tsx`
- [ ] Integrate with engagement API endpoints
- [ ] Add loading and error states
- [ ] Make responsive for mobile
- [ ] Add tooltips and interaction details

**Dependencies:** PR-002  
**Estimate:** 4-5 hours

---

### PR-017: Star Performer Analysis Engine
**Priority: P1**
- [ ] Create `lib/analytics/star-performer.ts`
- [ ] Define star performer criteria (top 10%)
- [ ] Calculate composite performance score
- [ ] Implement differentiating factors analysis
- [ ] Add statistical significance testing (t-tests)
- [ ] Calculate effect sizes
- [ ] Add unit tests
- [ ] Document metrics and methodology

**Dependencies:** PR-002, PR-003  
**Estimate:** 4-5 hours

---

### PR-018: Star Performer Dashboard
**Priority: P2**
- [ ] Create `app/dashboard/performers/page.tsx`
- [ ] Create `components/dashboard/performer-comparison.tsx`
- [ ] Create `components/dashboard/differentiator-chart.tsx`
- [ ] Display star performer leaderboard
- [ ] Show comparison table (stars vs average vs lagging)
- [ ] Add radar chart for key differentiators
- [ ] Add filters (subject, experience, time period)
- [ ] Create `app/api/cron/calculate-performers/route.ts` for weekly calculation

**Dependencies:** PR-017  
**Estimate:** 5-6 hours

---

### PR-019: First Session Analysis Engine
**Priority: P1**
- [ ] Create `lib/analytics/first-session-analyzer.ts`
- [ ] Implement cohort comparison logic
- [ ] Calculate demographic differences
- [ ] Calculate behavioral metric differences
- [ ] Calculate technical metric differences
- [ ] Add statistical significance testing
- [ ] Rank "what differs most"
- [ ] Add unit tests

**Dependencies:** PR-002  
**Estimate:** 4-5 hours

---

### PR-020: First Sessions Dashboard
**Priority: P2**
- [ ] Create `app/dashboard/first-sessions/page.tsx`
- [ ] Create `components/dashboard/cohort-comparison.tsx`
- [ ] Create `components/dashboard/distribution-chart.tsx`
- [ ] Add date range and subject filters
- [ ] Display side-by-side metric cards
- [ ] Add distribution histograms
- [ ] Add statistical significance badges
- [ ] Show "what differs most" ranking

**Dependencies:** PR-019  
**Estimate:** 5-6 hours

---

### PR-021: Reliability Analysis Engine
**Priority: P2**
- [ ] Create `lib/analytics/reschedule-analyzer.ts`
- [ ] Calculate reschedule rates by tutor
- [ ] Find correlations with other metrics
- [ ] Analyze time-of-day patterns
- [ ] Create `lib/analytics/noshow-predictor.ts`
- [ ] Implement no-show risk scoring
- [ ] Add feature engineering from historical data
- [ ] Add unit tests

**Dependencies:** PR-002  
**Estimate:** 4-5 hours

---

### PR-022: Reliability Dashboard
**Priority: P2**
- [ ] Create `app/dashboard/reliability/page.tsx`
- [ ] Create `components/dashboard/reliability-heatmap.tsx`
- [ ] Create `components/dashboard/noshow-risk-card.tsx`
- [ ] Display tutors with high reschedule rates (>15%)
- [ ] Show correlation heatmaps
- [ ] Display time-of-day patterns
- [ ] Add proactive alerts for high-risk sessions
- [ ] Add filters and drill-down capabilities

**Dependencies:** PR-021  
**Estimate:** 4-5 hours

---

### PR-023: Time Series Visualization
**Priority: P2**
- [ ] Create `components/dashboard/time-series-chart.tsx`
- [ ] Integrate with time series analytics library
- [ ] Add moving average overlays
- [ ] Add anomaly highlighting
- [ ] Add cohort comparison view
- [ ] Add date range selector
- [ ] Add chart export functionality
- [ ] Make responsive

**Dependencies:** PR-003  
**Estimate:** 3-4 hours

---

## Workstream F: Intervention System

### PR-024: Intervention Templates Library
**Priority: P1**
- [ ] Create `lib/interventions/templates.ts`
- [ ] Define template structure with variables
- [ ] Create 5-10 intervention templates
- [ ] Add template categories (engagement, quality, support)
- [ ] Add template personalization logic
- [ ] Add template preview functionality
- [ ] Document available variables

**Dependencies:** PR-008  
**Estimate:** 3-4 hours

---

### PR-025: Intervention Targeting System
**Priority: P1**
- [ ] Create `lib/interventions/targeting.ts`
- [ ] Implement rule-based targeting filters
- [ ] Add segment builder (by metrics, behavior, demographics)
- [ ] Calculate target audience size
- [ ] Add segment preview functionality
- [ ] Validate targeting criteria
- [ ] Add unit tests

**Dependencies:** PR-001, PR-002  
**Estimate:** 4-5 hours

---

### PR-026: Intervention Builder
**Priority: P1**
- [ ] Create `lib/interventions/builder.ts`
- [ ] Implement campaign creation logic
- [ ] Integrate targeting system
- [ ] Integrate template library
- [ ] Add A/B test assignment
- [ ] Add scheduling (immediate, delayed, recurring)
- [ ] Store campaigns in Interventions table
- [ ] Add validation and error handling

**Dependencies:** PR-024, PR-025, PR-013  
**Estimate:** 4-5 hours

---

### PR-027: Intervention Campaign UI ✅
**Priority: P2**
- [x] Create `app/dashboard/interventions/page.tsx` (list view)
- [x] Create `app/dashboard/interventions/new/page.tsx` (create)
- [x] Create `app/dashboard/interventions/[id]/page.tsx` (details)
- [x] Create `components/dashboard/intervention-builder.tsx`
- [x] Create `components/dashboard/targeting-selector.tsx`
- [x] Add campaign status management
- [x] Add preview before sending
- [x] Add campaign analytics view

**Dependencies:** PR-026  
**Estimate:** 6-7 hours  
**Status:** ✅ COMPLETED

---

### PR-028: Intervention Success Tracking
**Priority: P2**
- [ ] Add success metrics calculation to intervention builder
- [ ] Implement before/after engagement comparison
- [ ] Track session count changes
- [ ] Track quality metric improvements
- [ ] Calculate time-to-response
- [ ] Add success dashboard component
- [ ] Generate intervention effectiveness reports
- [ ] Add automated success notifications

**Dependencies:** PR-027  
**Estimate:** 4-5 hours

---

## Polish & Deployment

### PR-029: Environment Configuration & Documentation
**Priority: P0**
- [ ] Create comprehensive `.env.example`
- [ ] Document all environment variables
- [ ] Create deployment guide
- [ ] Document cron job setup for Vercel
- [ ] Create API documentation
- [ ] Add architecture diagrams
- [ ] Create user guides for each dashboard section
- [ ] Add troubleshooting guide

**Dependencies:** All previous PRs  
**Estimate:** 3-4 hours

---

### PR-030: Testing & Quality Assurance
**Priority: P0**
- [ ] Add integration tests for critical paths
- [ ] Add E2E tests for key user flows
- [ ] Test all cron jobs locally
- [ ] Verify database indexes and query performance
- [ ] Load test email delivery system
- [ ] Audit security (API authentication, data access)
- [ ] Test error handling and edge cases
- [ ] Cross-browser testing

**Dependencies:** All previous PRs  
**Estimate:** 6-8 hours

---

### PR-031: Production Deployment & Monitoring
**Priority: P0**
- [ ] Deploy to production environment
- [ ] Configure production environment variables
- [ ] Set up Vercel cron jobs
- [ ] Import historical engagement events
- [ ] Configure monitoring and alerting
- [ ] Set up error tracking (Sentry/similar)
- [ ] Configure analytics tracking
- [ ] Verify all integrations (GrowthBook, email, AI)
- [ ] Run smoke tests
- [ ] Create rollback plan

**Dependencies:** PR-029, PR-030  
**Estimate:** 4-5 hours

---

## Summary

**Total PRs:** 31  
**Estimated Total Time:** 120-140 hours

### Priority Breakdown
- **P0 (Foundational - Must Have):** 6 PRs (~20 hours)
- **P1 (Core Features):** 17 PRs (~65 hours)
- **P2 (Enhanced Features):** 8 PRs (~40 hours)

### Recommended Implementation Order
1. **Week 1:** PR-001 → PR-002 → PR-007 → PR-012 (Foundation)
2. **Week 2:** PR-003 → PR-004 → PR-005 → PR-009 → PR-010 (Core Analytics & Alerts)
3. **Week 3:** PR-008 → PR-011 → PR-016 → PR-017 → PR-024 → PR-025 (Engagement & Interventions)
4. **Week 4:** PR-006 → PR-013 → PR-014 → PR-019 → PR-026 (Insights & Experiments)
5. **Week 5:** PR-018 → PR-020 → PR-021 → PR-027 (Advanced Dashboards)
6. **Week 6:** PR-015 → PR-022 → PR-023 → PR-028 (Analytics Polish)
7. **Week 7:** PR-029 → PR-030 → PR-031 (Testing & Deployment)

### Parallel Work Opportunities
- PRs in different workstreams (A-F) can often be developed simultaneously by different team members
- Foundation work (PR-001, PR-002) should be completed before most other work
- UI components can be built alongside backend logic when APIs are defined