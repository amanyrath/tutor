# 3-Minute Code Walkthrough Guide

## Overview
This guide highlights the key files and code sections to demonstrate during a 3-minute code walkthrough of the Tutor Quality Dashboard.

---

## 🎯 Walkthrough Structure (3 minutes)

### **Minute 1: Architecture & Data Model** (30-40 seconds)

#### 1. Project Overview
**File**: `README.md`
- **Lines 1-25**: Project description, features, tech stack
- **Lines 83-132**: Project structure showing organization

**Highlights**:
- Next.js 16 with App Router
- AI-powered insights using OpenAI/Claude
- Automated alerts and interventions
- A/B testing with GrowthBook

#### 2. Database Schema
**File**: `prisma/schema.prisma`
- **Lines 11-39**: `Tutor` model - core entity
- **Lines 41-85**: `Session` model - detailed session metrics
- **Lines 87-115**: `TutorAggregate` model - pre-calculated metrics & churn prediction
- **Lines 117-143**: `Alert` model - automated alert system
- **Lines 145-188**: `Intervention` model - campaign tracking
- **Lines 265-302**: `PatternInsight` model - AI discoveries

**Key Points**:
- Rich data model with 82K+ sessions
- Pre-calculated aggregates for performance
- Churn probability built into schema
- AI-generated insights stored

---

### **Minute 2: Core Features - AI & Automation** (60-70 seconds)

#### 3. AI Pattern Analyzer
**File**: `lib/ai/pattern-analyzer.ts`
- **Lines 23-52**: Multi-provider AI support (OpenAI, Anthropic, OpenRouter)
- **Lines 54-95**: TypeScript interfaces for AI responses
- **Lines 100-150**: Main `analyzePatterns()` function (show how it processes data)

**Key Points**:
- Supports multiple AI providers
- Analyzes tutor data to discover patterns
- Returns structured insights with confidence scores

#### 4. Alert Generation Engine
**File**: `lib/alerts/generator.ts`
- **Lines 40-80**: Main `generateAlerts()` function
- **Lines 64**: `evaluateAlertRules()` - rule engine
- **Lines 74-85**: Deduplication logic (cooldown periods)

**Key Points**:
- Automated scanning of all tutors
- Rule-based alert generation
- Deduplication prevents spam

#### 5. API Endpoint Example
**File**: `app/api/dashboard/metrics/route.ts`
- **Lines 6-22**: Parallel database queries using `Promise.all()`
- **Lines 12-21**: Efficient aggregation queries

**Key Points**:
- Server-side data fetching
- Optimized parallel queries
- Clean error handling

---

### **Minute 3: User Interface & Integration** (50-60 seconds)

#### 6. Dashboard Main Page
**File**: `app/dashboard/page.tsx`
- **Lines 12-75**: Dashboard grid configuration
- **Lines 31-37**: AI Insights card (key feature)
- **Lines 122-170**: Quick stats display

**Key Points**:
- Modular dashboard structure
- Navigation to specialized views
- Real-time metrics display

#### 7. Data-Driven Component Logic
**File**: `components/dashboard/intervention-recommendations.tsx`
- **Lines 56-66**: Critical churn risk detection
- **Lines 85-95**: Low engagement detection
- **Lines 53-54**: Recommendation generation logic

**Key Points**:
- Conditional logic based on tutor metrics
- Priority-based recommendations
- Actionable interventions

#### 8. Package Dependencies
**File**: `package.json`
- **Lines 19-50**: Key dependencies showing integration points
  - `@anthropic-ai/sdk`, `openai` - AI providers
  - `@growthbook/growthbook` - A/B testing
  - `@prisma/client` - Database ORM
  - `resend`, `@react-email/components` - Email system
  - `recharts` - Data visualization

**Key Points**:
- Modern tech stack
- Multiple integrations (AI, email, experiments)
- Type-safe with TypeScript

---

## 📋 Recommended File Opening Order

1. **README.md** (overview)
2. **prisma/schema.prisma** (data model)
3. **lib/ai/pattern-analyzer.ts** (AI integration)
4. **lib/alerts/generator.ts** (automation)
5. **app/api/dashboard/metrics/route.ts** (API example)
6. **components/dashboard/intervention-recommendations.tsx** (smart component logic)
7. **app/dashboard/page.tsx** (UI)
8. **package.json** (tech stack)

---

## 🎤 Talking Points for Each Section

### Architecture (Minute 1)
- "Built on Next.js 16 with TypeScript for type safety"
- "PostgreSQL database with Prisma ORM - schema-first design"
- "Rich data model tracking tutors, sessions, churn predictions"
- "Pre-calculated aggregates for performance optimization"

### Core Features (Minute 2)
- "AI-powered pattern discovery - analyzes tutor data to find insights"
- "Multi-provider AI support - works with OpenAI, Claude, or OpenRouter"
- "Automated alert system - scans all tutors and generates alerts based on rules"
- "Server-side API routes with optimized database queries"

### UI & Integration (Minute 3)
- "Dashboard-first architecture with specialized views"
- "shadcn/ui components for consistent design"
- "Integrated with GrowthBook for A/B testing"
- "Email system using Resend for automated interventions"

---

## ⚡ Key Code Lines to Highlight

### Data Model
```prisma
// prisma/schema.prisma
model TutorAggregate {
  churnProbability Float @map("churn_probability")
  churnRiskLevel String @map("churn_risk_level")
  // ... aggregates for performance
}
```

### AI Integration
```typescript
// lib/ai/pattern-analyzer.ts
const aiProvider = openaiKey ? 'openai' : openrouterKey ? 'openrouter' : anthropicKey ? 'anthropic' : null
// Multi-provider support
```

### Alert Generation
```typescript
// lib/alerts/generator.ts
const triggeredAlerts = evaluateAlertRules(tutor)
// Automated rule evaluation
```

### API Optimization
```typescript
// app/api/dashboard/metrics/route.ts
const [totalTutors, highRiskCount, avgEngagement, poorFirstSessionCount] = await Promise.all([...])
// Parallel queries for performance
```

---

## 📊 Summary Statistics to Mention

- **150 tutors** tracked
- **82,800+ sessions** analyzed
- **AI-powered insights** for pattern discovery
- **Automated alerts** with rule-based engine
- **A/B testing** integration ready
- **Email interventions** automated

---

## 🎯 Closing Points

1. **Scalable Architecture**: Built to handle large datasets
2. **AI-Powered**: Leverages modern AI for insights
3. **Production-Ready**: Error handling, optimization, type safety
4. **Extensible**: Easy to add new features and integrations

---

## ⚡ Quick Reference: Exact Lines to Highlight

### File 1: README.md
- **Lines 1-4**: Project title and description
- **Lines 14-24**: Tech stack summary
- **Lines 83-132**: Project structure

### File 2: prisma/schema.prisma
- **Lines 11-39**: Tutor model (core entity)
- **Lines 87-104**: TutorAggregate model (churn prediction fields)
- **Lines 117-143**: Alert model (automation system)

### File 3: lib/ai/pattern-analyzer.ts
- **Lines 23-52**: Multi-provider AI setup
- **Lines 54-95**: TypeScript interfaces
- **Lines 100-150**: Main analyzePatterns function

### File 4: lib/alerts/generator.ts
- **Lines 40-80**: Main generateAlerts function
- **Lines 64**: Rule evaluation call
- **Lines 74-85**: Deduplication logic

### File 5: app/api/dashboard/metrics/route.ts
- **Lines 6-22**: Parallel Promise.all queries
- **Lines 12-21**: Database aggregation examples

### File 6: components/dashboard/intervention-recommendations.tsx
- **Lines 56-66**: Critical churn risk detection
- **Lines 85-95**: Low engagement detection
- **Lines 53-54**: Recommendation generation entry point

### File 7: app/dashboard/page.tsx
- **Lines 12-75**: Dashboard configuration array
- **Lines 31-37**: AI Insights card
- **Lines 122-170**: Quick stats section

### File 8: package.json
- **Lines 19-50**: Dependencies section
- Highlight: AI SDKs, Prisma, GrowthBook, Resend

---

## 💡 Pro Tips

1. **Start broad, then narrow**: Begin with README overview, then dive into specific code
2. **Show the flow**: Data model → API → AI Processing → UI
3. **Highlight integrations**: Emphasize AI, email, and A/B testing connections
4. **Point out optimizations**: Parallel queries, pre-calculated aggregates
5. **Emphasize type safety**: TypeScript interfaces throughout

---

## 🎬 Presentation Flow Summary

```
[0:00-0:40] Architecture & Data Model
├── README.md overview
└── prisma/schema.prisma (data structure)

[0:40-1:50] Core Features
├── lib/ai/pattern-analyzer.ts (AI integration)
├── lib/alerts/generator.ts (automation)
└── app/api/dashboard/metrics/route.ts (API example)

[1:50-2:50] UI & Integration
├── components/dashboard/intervention-recommendations.tsx (smart logic)
├── app/dashboard/page.tsx (UI)
└── package.json (tech stack)

[2:50-3:00] Closing summary
```

