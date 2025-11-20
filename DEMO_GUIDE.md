# 5-Minute Demo Guide: Tutor Quality Dashboard

## Pre-Demo Setup
- Have the application running at localhost:3000
- Start on the landing page (`/dashboard`)
- Have `/dashboard/tutors` ready in another tab
- Optional: Have one tutor detail page pre-loaded (e.g., a high churn risk tutor)

---

## Demo Script & Flow

### **[0:00 - 0:45] Opening: The Problem & My Approach** *(45 seconds)*

**WHAT TO SAY:**

> "Hi, I'm [Your Name]. My background is as a data scientist, and when I was given this problem, it was intentionally vague: 'Tutor.com has retention issues with their gig economy tutors.' That's it.
>
> Now, some people approached this as a data science project—build a churn model, run some correlations, make some charts. And yes, I could have done that in a few hours. But that's not what this is about.
>
> I saw this as an opportunity to showcase something more valuable: **my ability to take an ambiguous, complex business problem and break it down into something actionable**. So I asked myself: *If I were the operations manager at Tutor.com waking up tomorrow, what would I actually need to see? What decisions would I need to make? What actions would I take?*
>
> And that question led me to build what I'm about to show you—a full operational platform, not just a data analysis."

**WHAT TO SHOW:**
- *Stay on the landing page as you talk*
- Gesture to the dashboard overview briefly

---

### **[0:45 - 2:00] The Core Insight: Operationalizing Data** *(1 min 15 sec)*

**WHAT TO SAY:**

> "Let me walk you through how I thought about this. The business problem is that tutors are leaving. But *why* are they leaving, and *what* can we do about it?
>
> So I broke it down into three layers:"

**Navigate to `/dashboard/tutors`** *(Tutor Directory)*

> "**First: Who needs help right now?** This is my tutor directory, ranked by churn risk. You can see we have 150 tutors, and they're color-coded by risk level. This isn't just a list—it's a priority queue for the operations team."

**Click on a HIGH RISK tutor** *(Tutor Detail Page)*

> "**Second: Why are they at risk?** When I open a tutor, I see their full story. Here's their 30-day performance trend—look at this engagement score dropping. Here are their last 50 sessions with quality metrics. And critically, here at the top, the system has identified specific churn signals: low engagement, declining quality, inactivity patterns.
>
> But here's the key: I didn't just show the data. I asked, 'What would the ops manager *do* with this information?'"

**Scroll to the AI Recommendations section**

> "**Third: What should we do about it?** The system generates AI-powered intervention recommendations. In this case, it's suggesting we send a targeted re-engagement email because this tutor shows disengagement patterns. This is where data becomes action."

---

### **[2:00 - 3:30] The System That Runs Itself** *(1 min 30 sec)*

**Navigate to `/dashboard/alerts`**

**WHAT TO SAY:**

> "Now here's where it gets interesting. I built this to be proactive, not reactive. This is the alerts system—it runs automatically every hour via cron jobs and flags issues before they become problems.
>
> You can see alerts organized by severity. Critical alerts might be a high-performing tutor suddenly showing churn signals. Medium alerts might be quality dips. The system is constantly watching and surfacing what needs attention."

**Navigate to `/dashboard/interventions`**

> "And this is where the magic happens—the intervention campaign builder. Once we identify at-risk tutors, we don't just hope someone remembers to reach out. The system automates targeted interventions.
>
> I built 8 pre-defined tutor segments—things like 'High Churn Risk,' 'Disengaged,' 'Poor First Sessions.' And I created 8 email templates that the team can deploy with one click.
>
> But here's the best part—"

**Point to the A/B testing section**

> "—every intervention is an experiment. We track opens, clicks, responses, and most importantly, we measure impact: Did their engagement go up after the email? Did they come back? This means the system *learns* what works and what doesn't."

**Navigate to `/dashboard/insights`** *(if time allows)*

> "And this AI insights dashboard? This is where I went a step further. Every week, the system runs pattern discovery across all the data and surfaces insights the team might never have found manually. Things like 'Tutors who teach math have 23% higher churn when they have poor first sessions' or 'Weekend tutors show disengagement 5 days after signup.'
>
> These aren't just correlations—they're actionable patterns with recommendations attached."

---

### **[3:30 - 4:30] The Bigger Picture: Customer-Centric Problem Solving** *(1 min)*

**Navigate back to `/dashboard` (Landing Page)**

**WHAT TO SAY:**

> "So let me bring this full circle. When I started this project, I didn't think, 'What's the coolest machine learning model I can build?' I thought, '**If I were the customer—the operations manager or the head of tutor success—what would actually help me do my job better?**'
>
> And that led me to build seven specialized dashboards"

**Gesture to the dashboard cards**

> "—Activation & Engagement, Star Performers, Reliability tracking, AI Insights, Experiments, Interventions, and Alerts. Each one answers a specific business question.
>
> This isn't just a data project. It's an operational platform. It's something that could ship to production tomorrow because it was designed *from the customer's perspective* from day one.
>
> And honestly, that's the skill I'm most proud of showcasing here: **the ability to sit with ambiguity, break down a complex problem, and build something that creates real business value.**"

---

### **[4:30 - 5:00] Closing: The Technical Depth** *(30 seconds)*

**WHAT TO SAY:**

> "And just to give you a sense of scope—this is a full-stack TypeScript application. Next.js 16, React 19, PostgreSQL with Prisma ORM. I generated 90,000 synthetic sessions with realistic distributions using Python and scikit-learn. The AI integrations support OpenAI, Anthropic, and OpenRouter. Automated cron jobs, email delivery via Resend, A/B testing with GrowthBook.
>
> When you talk to me, you're not just getting a data scientist who can run regressions. You're getting someone who can take a business problem end-to-end, from vague requirements to a production-ready product.
>
> Happy to dive deeper into any part of this or answer questions."

---

## Key Talking Points to Emphasize

### 1. **Problem Decomposition**
   - "I broke down the vague problem into three layers: Who, Why, and What to do"
   - "Not just showing data—operationalizing it"

### 2. **Customer Empathy**
   - "I asked myself: What would I need if I were the ops manager?"
   - "Built from the customer's perspective from day one"

### 3. **Proactive, Not Reactive**
   - "Automated alerts that surface issues before they become problems"
   - "Interventions that run themselves"

### 4. **Learning System**
   - "Every intervention is an experiment—the system learns what works"
   - "AI pattern discovery finds insights humans might miss"

### 5. **Production-Ready**
   - "This could ship tomorrow"
   - "Full-stack, scalable, integrated with enterprise tools"

### 6. **Business Value**
   - "Not just analysis—actionable intelligence"
   - "Turns data into decisions and decisions into actions"

---

## Backup Slides/Talking Points (If Asked)

### "How did you approach the technical implementation?"
- "Started with user stories: 'As an ops manager, I need to see...'"
- "Built the data model around business entities: tutors, sessions, alerts, interventions"
- "Chose technologies for production readiness, not just prototyping"

### "What would you do next?"
- "Integrate with real Tutor.com data via API"
- "Add predictive maintenance for server/technical issues"
- "Build mobile app for tutor self-service"
- "Expand A/B testing to in-app interventions, not just email"

### "What was the hardest part?"
- "Balancing simplicity with depth—making it intuitive while still powerful"
- "Generating realistic synthetic data that actually tells a story"
- "Designing the intervention workflow to be both automated and human-in-the-loop"

### "How did you validate your approach?"
- "Talked to imaginary stakeholders in my head (ops, tutors, data team)"
- "Asked: Would this change someone's decision or action? If no, cut it"
- "Focused on actionability—every feature had to answer 'so what?'"

---

## Demo Tips

### Timing
- **Practice with a timer** - 5 minutes goes FAST
- Aim for 4:30 to leave buffer for transitions
- If running over, skip the AI Insights dashboard

### Energy & Delivery
- Start strong with the problem framing—it sets you apart
- Use "I asked myself..." to show your thought process
- Pause after key insights to let them land
- End confidently—you solved an ambiguous problem end-to-end

### Technical Demo Tips
- Keep transitions smooth (have tabs pre-loaded)
- Don't get lost in details—big picture first
- If something doesn't load, narrate what they'd see
- Use the tutor detail page as your "wow" moment—it has the most depth

### Anticipate Questions
- Be ready to talk about data quality (it's synthetic but realistic)
- Be ready to talk about scalability (Next.js, Vercel, Postgres scales)
- Be ready to talk about cost (most APIs have free tiers, production would need budget planning)

---

## What Makes This Demo Compelling

1. **You reframe the conversation** - It's not "look at my model," it's "look at how I think about problems"
2. **You show empathy** - Customer-centric design is rare and valuable
3. **You demonstrate breadth** - Data science + engineering + product thinking
4. **You prove proactivity** - You didn't just answer the question—you expanded it
5. **You deliver value** - This is something a company could actually use

---

## Final Thought

The goal of this demo isn't just to show **what** you built—it's to show **how you think**. And how you think is:
- Start with the customer problem
- Break it down into layers
- Build for action, not just analysis
- Automate what should be automated
- Measure everything
- Iterate and learn

That's the story. That's why they should hire you.

Good luck! 🎯
