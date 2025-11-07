# 🚀 AI Workflow Case Study: Mission Control & Engagement Pipeline

## Overview

This project was an experiment in using AI as a **collaborative system builder** — structuring prompts and model interactions to produce everything from docs to data, UX, and strategy.  

My general workflow followed an iterative pattern where each AI system built on the previous one’s reasoning.

---

## 🧠 Phase 1: Kickoff — Synthetic Data, Docs, and Scoping

The goal here was to quickly get a working foundation: structured documentation, mock data, and an initial architectural frame.

### My Early Prompts

> Need to use synthetic data Identify what kind of synthetic data we need to mock up this project  
> we need to make realistic synthetic data for all of these and readme description for the datatypes and motivations.

ChatGPT generated a **data generation script**, then I asked it to formalize the project by making a **PRD and Mermaid diagram**.

> make this into a prd + mermaid with no time estimates or requirements etc

After that, I ran the same flow with **Claude** — I wanted to compare how each handled reasoning and structure.  
Then I passed both outputs into **Cursor**, asking it to **synthesize a unified approach** and execute from there.  

I manually handled some package setup, but otherwise let it run.  
Once it was working end-to-end, the next major focus became **UX design**.

---

## 🎨 Phase 2: UX Direction and Design Thinking

At this point, I wanted to move beyond function — I wanted the experience to *feel* like something powerful and immersive.

### Prompt to ChatGPT

> You are a UX designer. I'm trying to make a cool experience that is impressive, showcases the technical aspects of this project, and the user is supposed to feel like, one, they're in control of the situation, it's difficult, two, they can handle lots of data, so a little bit more data dense, three, it's kind of mission critical, this is a mission control dashboard and we want to reflect like the importance of it and there's kind of like You are a UX designer. I'm trying to make a cool experience that is impressive, showcases the technical aspects of this project, and the user is supposed to feel like, one, they're in control of the situation, it's difficult, two, they can handle lots of data, so a little bit more data dense, three, it's kind of mission critical, this is a mission control dashboard and we want to reflect the importance of it. And there's kind of like some more interactive elements and the ability to like filter, drill down, build in analytics. So we just want UX updates for that.

I then asked:

> clean this up to feed into cursor

---

### ChatGPT Output (Refined for Cursor)

**Role:** UX Designer  
**Goal:** Design a mission control dashboard experience that feels impressive, technically sophisticated, and data-dense, while keeping users feeling in control and capable.

#### Key Design Goals

- Make users feel like they’re managing something complex and high-stakes — *mission critical.*  
- Showcase technical depth and data-handling power through layout, motion, and interactivity.  
- Support filtering, drill-down exploration, and embedded analytics for deeper insights.  
- Maintain a clean, modern, and responsive UX despite high data density.  
- Include interactive elements that communicate control, precision, and importance.  

**Deliverable:**  
UX updates or design recommendations that enhance the mission control feel while showcasing technical sophistication and user empowerment.

---

The visuals at this point were strong — the dashboard *looked* cool — but something deeper was missing.  
I wanted to ground the experience in purpose and behavior, not just aesthetics.

---

## 🧩 Phase 3: Adding Context and Product Thinking

I shifted into a **Product Owner mindset**, using my background managing gig workers to think about activation, engagement, and outcomes.

### My Context Prompt

> You're a product owner  
>
> So, when I was a program manager of gig workers, that's highly relevant to this, I was able to determine some ways to keep people engaged. So, could we serve some automated engagements? We want a way to serve automatic messages and engagements to make sure that people are ready. We want to make an automated alert and delivery system that keeps people engaged and activated. Activation is also going to be one of our core metrics. In our data, we're going to need last login, things like that. We're also going to see our star performance and assess how we can differentiate between them and be able to cut that by different things. So we need to look at all the different metrics of the tutors and determine what separates our star performance from the people who are lagging behind, and then construct targeted interventions for them.  
>
> Do automatically discovery of patterns in the last week that have led to increases in engagement. We want to be able to run experiments and you want to be able to run experiments and see what works and what doesn't with regards to interventions. So for example, sending an email to somebody who is not engaged. Can we use AI to generate new insights and interventions and understand the differences between what works and what doesn't? We're trying to iterate fast. We're trying to see the results of our experiments and we're trying to do cuts across different user groups, different time zones, and different subjects.  
>
> So we do want to do the main requirements of detecting patterns leading to poor first session experiences. So maybe have a separate highlighted drill down into just first sessions. We're going to identify all the differences between the group that had bad first sessions and compared to the overall population - what are some ways they differ? We're also going to flag tutors with high rescheduling rates. So, yeah, maybe some correlations between rescheduling rates and metrics around them. And for no-shows, we are also going to do predictions between historically those who have no-showed and the overall population.  
>
> Remember that this is going to happen at scale, and so we need data that happens fast, like time series analysis based off historical data—what succeeds and what doesn't.

Then I cleaned that up for Cursor again.

> clean this up to feed into cursor

---

### ChatGPT Output (Refined for Cursor)

**Role:** Product Owner  
**Objective:**  
Build an automated engagement and alert system to keep gig workers (e.g., tutors) activated, engaged, and high-performing.  
The system should automatically analyze data, detect engagement patterns, and generate interventions to improve outcomes.

#### Core Goals

**Automate Engagement**
- Deliver personalized, automated messages or alerts to inactive or at-risk users.  
- Keep users “ready” and engaged through timely nudges and interventions.  
- Activation rate is a core success metric.

**Understand Performance Drivers**
- Identify what differentiates star performers from low performers.  
- Use metrics such as last login, engagement rate, session completion, and rescheduling rates.  
- Enable segmentation by user group, time zone, subject, and tenure.

**Automate Insights and Experimentation**
- Automatically discover patterns in engagement over the past week.  
- Use AI to generate insights and new intervention ideas (e.g., auto-generated messages or experiments).  
- Run rapid A/B experiments to test what works for different user segments.  
- Track outcomes and visualize what drives changes in engagement.

**Monitor and Improve First Sessions**
- Detect patterns leading to poor first session experiences.  
- Drill down into this subset to compare with overall population metrics.  
- Identify and flag tutors with high rescheduling rates or no-shows and analyze correlations.

**Scalable, Data-Driven Infrastructure**
- Support time-series analysis and real-time monitoring at scale.  
- Leverage historical and live data to predict engagement outcomes.

**Deliverable:**  
A product design or technical architecture proposal that enables:

- Automated engagement workflows  
- Real-time detection of engagement and performance patterns  
- Experimentation and insights generation  
- Scalable analytics and visualization for decision-making

---

## 🎯 Phase 4: Centering the Storyline

At this stage, I shifted from *building the system* to *telling the story*.  
The focus became: what are we actually demonstrating, and what do we want people to feel?

> So I want to focus on the critical demo path for this project, and what I want to highlight is the storyline. We are focused on delivering high-quality educational outcomes to our students, so we need to center that. We need to show that to do that, we need to make sure our tutors are performing consistently at a high quality and low turn rate, because that leads to worse educational outcomes. I want to show that we are creating an automated analytics and intervention pipeline that detects when these factors associated with low-quality educational outcomes are detected, and then the model generates an intervention and tracks the success or failure of those. So we need to center that in our homepage. Ask me questions.

This helped me anchor the whole experience around **purpose** — not just engagement, but improving real learning outcomes.

---

## 🛰️ Phase 5: Mission Control — Visualizing Educational Outcomes

Finally, I wanted the **Mission Control dashboard** to visually express that story.  
It wasn’t just a data tool anymore — it needed to feel like a living system monitoring and improving educational quality.

> So with Mission Control, let's restructure the Mission Control itself to lead with educational outcomes. For Interactivity, Damage With Intervention Pipeline, let's show an overview of our intervention pipeline that just looks cool and can click through to our actual interventions page. We don't need specific intervention examples on the homepage, just aggregate success metrics for interventions in a format that looks cool. Let's keep it front and center, but also center educational outcomes. The whole story should be shaped around educational outcomes, and we should be framing things in that way. So when we're talking about, for example, we need to show how our interventions are for improving the average student experience.

---

## 🧭 Reflection

The process wasn’t linear — it was a loop:  
**Think → Prompt → Synthesize → Refine → Align.**

Every step — from generating synthetic data to designing UX to shaping the narrative — fed into one core goal:  
turning AI outputs into a **cohesive, mission-driven product narrative** that actually means something.
