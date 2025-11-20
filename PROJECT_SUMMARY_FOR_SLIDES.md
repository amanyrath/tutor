# Tutor Quality Dashboard - Project Summary for Slide Generation

## Project Context

**Role:** Data Scientist
**Problem Given:** "Tutor.com has retention issues with their gig economy tutors" (intentionally vague)
**Timeframe:** Independent project
**What Others Did:** Approached it as a data science project - built churn models, ran correlations, created some charts
**What I Did:** Treated it as an opportunity to showcase end-to-end problem-solving and customer-centric product thinking

---

## My Approach: The Key Differentiator

### The Question I Asked Myself
"If I were the operations manager at Tutor.com waking up tomorrow, what would I actually need to see? What decisions would I need to make? What actions would I take?"

### The Framework I Used
Instead of just analyzing data, I broke the problem into three operational layers:

1. **WHO needs help right now?** → Priority identification
2. **WHY are they at risk?** → Root cause diagnosis
3. **WHAT should we do about it?** → Actionable interventions

This customer-centric approach transformed a data exercise into a production-ready operational platform.

---

## What I Built

### Core Platform: Tutor Quality Dashboard
A full-stack AI-powered analytics and intervention platform for managing gig economy tutors

### 7 Specialized Dashboards

1. **Tutor Directory**
   - 150 tutors ranked by churn risk
   - Color-coded priority queue (Critical, High, Medium, Low)
   - Searchable and filterable interface

2. **Tutor Detail Pages**
   - 9 performance metric cards (ratings, engagement, sessions, quality scores)
   - 30-day performance trend visualization
   - Last 50 sessions with full quality metrics
   - AI-identified churn signals (low engagement, declining quality, inactivity patterns)
   - AI-generated intervention recommendations

3. **Alerts System**
   - Automated hourly monitoring via cron jobs
   - 4 severity levels (Critical, High, Medium, Low)
   - 4 alert categories (churn, quality, technical, engagement)
   - Alert rules: high churn risk, low engagement, technical issues, no-shows, inactivity
   - Acknowledgment and resolution workflow

4. **Intervention Campaigns**
   - 8 pre-defined tutor segments (High Churn Risk, Disengaged, Low Engagement, etc.)
   - 8 customizable email templates with variable substitution
   - One-click campaign deployment
   - Automated delivery via Resend API
   - A/B testing integration with GrowthBook
   - Performance tracking: sent, opened, clicked, responded
   - Impact measurement: engagement before/after intervention

5. **AI Insights Dashboard**
   - Weekly automated pattern discovery across all tutor data
   - Surfaces insights humans might miss
   - Examples: "Math tutors have 23% higher churn after poor first sessions"
   - Confidence scoring and statistical significance
   - Actionable recommendations attached to each insight
   - Supports OpenAI, Anthropic Claude, and OpenRouter

6. **Experiments Dashboard**
   - A/B test configuration and management
   - Variant assignment tracking
   - Statistical significance analysis
   - Integration with GrowthBook feature flags

7. **Specialized Analytics**
   - **Activation & Engagement**: Login frequency, activity heatmaps
   - **Star Performers**: Best practices analysis
   - **Reliability**: Reschedule rates, no-show tracking
   - **First Sessions**: Poor first impression detection

---

## Technical Implementation

### Technology Stack

**Frontend**
- Next.js 16 (App Router) with TypeScript
- React 19
- Tailwind CSS 4
- shadcn/ui component library
- Recharts for data visualization

**Backend**
- Node.js 18+
- PostgreSQL database
- Prisma ORM v6
- Next.js API Routes

**AI & Automation**
- OpenAI GPT-4o
- Anthropic Claude 3.5 Sonnet
- OpenRouter (multi-provider AI)
- Resend (email delivery)
- GrowthBook (A/B testing)

**Data Generation**
- Python 3.8+ with pandas, scikit-learn, numpy
- Generated 90,000 realistic synthetic sessions
- 150 tutor profiles with realistic distributions
- Logistic regression for churn prediction modeling

**DevOps**
- Vercel deployment
- Vercel Cron jobs (hourly alerts, 6-hour email batches, weekly AI insights)

### Data Model (8 Core Entities)

1. **Tutor** - Profile, experience, status, reliability metrics
2. **Session** - 90K records with video engagement, sentiment, quality scores, student feedback
3. **TutorAggregate** - Pre-calculated 7-day and 30-day metrics, churn probability
4. **Alert** - System-generated warnings with severity and acknowledgment workflow
5. **Intervention** - Campaign tracking with delivery and impact metrics
6. **PatternInsight** - AI-discovered patterns with confidence scores
7. **Campaign** - Campaign management with approval workflow
8. **Experiment** - A/B test configuration and results

### Key Metrics Tracked

- **Churn Probability**: ML-predicted likelihood (0-1 scale)
- **Engagement Score**: Student attention level (0-10)
- **Quality Scores**: Empathy, Clarity, Engagement (0-10 each)
- **Reliability Score**: Based on reschedules and no-shows (0-1)
- **Student Rating**: 1-5 star system
- **First Session Flag**: Boolean for poor first impressions

---

## The System's Intelligence: How It Works

### 1. Continuous Monitoring
- Hourly cron jobs scan all tutor data
- Automated alert generation based on predefined rules
- Real-time churn risk calculation

### 2. Proactive Interventions
- System identifies at-risk tutors automatically
- Triggers targeted email campaigns from templates
- Tracks every interaction (open, click, response)
- Measures impact: Did engagement improve? Did they return?

### 3. Learning Loop
- Every intervention is an A/B test
- System learns what works and what doesn't
- AI pattern discovery surfaces unexpected insights weekly
- Recommendations feed back into intervention strategy

### 4. Operational Workflow
```
Data Collection → Alert Generation → Campaign Trigger →
Email Delivery → Engagement Tracking → Impact Measurement →
Pattern Learning → Strategy Refinement
```

---

## Business Value & Outcomes

### What This Platform Enables

1. **Early Warning System**
   - Identify at-risk tutors before they churn
   - Reduce reactive firefighting

2. **Scalable Interventions**
   - Automate outreach to hundreds of tutors
   - Personalized messaging without manual effort

3. **Data-Driven Decision Making**
   - Every action is measured
   - Clear ROI on intervention campaigns

4. **Continuous Improvement**
   - A/B testing built into every campaign
   - AI discovers patterns humans would miss

5. **Production-Ready**
   - Could deploy to Tutor.com tomorrow
   - Handles real-time data, automation, and scale

---

## What Makes This Project Unique

### 1. Customer-Centric Design
- Built from the operations manager's perspective
- Every feature answers a specific business question
- Not just "show me data" but "tell me what to do"

### 2. End-to-End Solution
- Not just analysis, but action
- Not just insights, but automation
- Not just dashboards, but workflows

### 3. Operational Intelligence
- Combines traditional analytics with AI
- Proactive, not reactive
- Self-learning system

### 4. Production Mindset
- Enterprise-grade tech stack
- Scalable architecture
- Integrated with real tools (Resend, GrowthBook, OpenAI)

### 5. Problem-Solving Approach
- Started with ambiguity
- Broke down complex problem
- Delivered business value, not just technical solution

---

## The Story Arc (For Presentation)

### Act 1: The Problem
- Vague assignment: "Tutor retention issues"
- Others built churn models and made charts
- I saw an opportunity to showcase deeper skills

### Act 2: The Insight
- Asked: "What would the customer actually need?"
- Reframed from data project to operational platform
- Designed from user's perspective

### Act 3: The Solution
- Built 7 integrated dashboards
- Automated the entire intervention workflow
- Created a self-learning system

### Act 4: The Impact
- Production-ready platform
- Demonstrates end-to-end thinking
- Showcases data science + engineering + product skills

---

## Key Talking Points

### What I Want to Emphasize

1. **"I didn't just answer the question—I expanded it"**
   - Showed initiative and product thinking
   - Went beyond the minimum viable solution

2. **"I built from the customer's perspective"**
   - Empathy-driven design
   - Every feature serves a real user need

3. **"This is production-ready, not just a prototype"**
   - Real tech stack
   - Real integrations
   - Real scalability

4. **"I operationalized data, not just analyzed it"**
   - Data → Insights → Actions → Outcomes
   - Complete value chain

5. **"The system learns and improves"**
   - Not static dashboards
   - Living, breathing platform

---

## Potential Slide Titles

- "The Problem: Ambiguity as Opportunity"
- "My Approach: Customer-Centric Problem Solving"
- "The Question: What Would I Need as the Ops Manager?"
- "The Framework: Who, Why, What"
- "The Platform: 7 Dashboards, One Mission"
- "How It Works: From Data to Action"
- "The Intelligence Loop: Learning What Works"
- "Technical Depth: Production-Ready Architecture"
- "Business Value: Real Impact, Not Just Analysis"
- "What Makes This Different: End-to-End Thinking"
- "The Takeaway: More Than a Data Scientist"

---

## Statistics to Highlight

- **150 tutors** monitored in real-time
- **90,000 synthetic sessions** generated with realistic distributions
- **7 specialized dashboards** covering the full operational lifecycle
- **8 intervention segments** and **8 email templates** ready for deployment
- **Hourly automated alerts**, **6-hour email batches**, **weekly AI insights**
- **4 severity levels**, **4 alert categories**, **9 performance metrics per tutor**
- **Full-stack TypeScript** with **Next.js 16**, **React 19**, **PostgreSQL**, **Prisma ORM**
- **Multi-AI integration**: OpenAI, Anthropic, OpenRouter
- **Enterprise integrations**: Resend, GrowthBook, Vercel Cron

---

## The Bottom Line

**This isn't a data science project. It's an operational platform built by a data scientist who thinks like a product manager, codes like an engineer, and designs like a customer advocate.**

**When you hire me, you don't just get someone who can build models. You get someone who can take ambiguity, break it down, and deliver production-ready value.**
