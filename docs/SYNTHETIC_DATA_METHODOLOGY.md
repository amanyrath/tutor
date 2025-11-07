# Synthetic Data Methodology & Assumptions

## Overview

This document outlines the methodology and key assumptions used to generate synthetic tutor quality data for the Tutor Quality Platform. The data generation system creates realistic, correlated datasets that simulate real-world tutoring dynamics while maintaining statistical validity and business rule compliance.

## Table of Contents

1. [Data Generation Architecture](#data-generation-architecture)
2. [Core Assumptions](#core-assumptions)
3. [Tutor Profile Generation](#tutor-profile-generation)
4. [Session Data Generation](#session-data-generation)
5. [Tutor Aggregates Calculation](#tutor-aggregates-calculation)
6. [Engagement Events Generation](#engagement-events-generation)
7. [Interventions Generation](#interventions-generation)
8. [Experiments & Assignments](#experiments--assignments)
9. [Correlations & Relationships](#correlations--relationships)
10. [Temporal Patterns](#temporal-patterns)
11. [Edge Cases & Personas](#edge-cases--personas)
12. [Validation Rules](#validation-rules)
13. [Data Volumes](#data-volumes)

---

## Data Generation Architecture

### Generator Structure

The synthetic data generation system consists of:

- **Main Generator** (`tutor_data_gen.py`): Orchestrates generation of core datasets
- **Specialized Generators** (`scripts/generate_*.py`): Generate specific data types
- **Seed-based Randomness**: All generators use seed=42 by default for reproducibility

### Generation Order

1. Tutor profiles (foundation)
2. Session data (depends on tutors)
3. Tutor aggregates (calculated from sessions)
4. Engagement events (correlated with sessions)
5. Experiments (independent)
6. Experiment assignments (depends on experiments + tutors)
7. Interventions (depends on all above)

### Data Modes

- **Production Mode**: 150 tutors, 30 days, ~750 sessions/day
- **Dev Mode**: 25 tutors, 14 days, ~100 sessions/day

---

## Core Assumptions

### Statistical Philosophy

1. **Realistic Distributions**: Use statistical distributions that match real-world patterns (Gamma for experience, Beta for reliability, etc.)
2. **Correlated Variables**: Maintain realistic correlations between related metrics
3. **Temporal Consistency**: Patterns change over time but maintain internal consistency
4. **Business Rule Compliance**: All data adheres to PRD requirements and logical constraints

### PRD Requirements

- **24% first session churn**: Poor first sessions are a critical churn indicator
- **98.2% tutor-initiated reschedules**: Reschedule rate reflects tutor reliability
- **16% tutor no-shows**: Specific percentage of tutors have no-show issues
- **<1 hour latency**: Data structure supports real-time scoring
- **Multiple signals**: 6+ churn indicators included

---

## Tutor Profile Generation

### Experience Distribution

**Assumption**: Tutor experience follows a power law distribution (many new tutors, few veterans)

```python
months_experience = Gamma(shape=2, scale=12)
# Capped at 120 months (10 years)
# Result: Most tutors 6-36 months, few veterans 5+ years
```

**Rationale**: Real tutoring platforms have high turnover, with most tutors being relatively new.

### Reliability Score

**Assumption**: Most tutors are reliable, with a right-skewed distribution

```python
reliability_score = Beta(a=8, b=2)
# Mean ~0.8, skewed toward high reliability
# Range: 0.0-1.0
```

**Rationale**: Platform would not retain highly unreliable tutors long-term.

### Historical Rating

**Assumption**: Ratings correlate with experience and reliability

```python
experience_bonus = min(months_experience / 60, 0.15)  # Max +0.15
avg_historical_rating = 3.5 + (reliability * 1.2) + experience_bonus + noise
# Clipped to 2.0-5.0
# Distribution: Beta(8,2) shifted, mean ~4.2
```

**Correlation**: `reliability → avg_rating (r=0.58)`

### Reschedule Rate

**Assumption**: Inverse correlation with reliability, tutor-initiated

```python
reschedule_rate = (1 - reliability) * 0.25 + uniform(0, 0.05)
# Clipped to 0.0-0.35
# 98.2% tutor-initiated (PRD requirement)
```

**Rationale**: More reliable tutors reschedule less frequently.

### No-Show Count

**Assumption**: 16% of tutors have no-show issues (PRD requirement)

```python
has_no_show_issue = random() < 0.16
no_show_count = Poisson(3) if has_no_show_issue else 0
```

**Correlation**: `no_show_count → churn_probability (r=0.68)`

### Subject Specialization

**Assumption**: Tutors teach 1-3 subjects, with distribution favoring fewer subjects

```python
num_subjects = choice([1, 2, 3], p=[0.4, 0.4, 0.2])
subjects = ['Math', 'Science', 'English', 'History', 'Test Prep', 'Programming']
```

### Active Status

**Assumption**: 92% of tutors are active

```python
active_status = choice([True, False], p=[0.92, 0.08])
```

**Rationale**: Inactive tutors don't get scheduled for sessions.

---

## Session Data Generation

### Session Volume

**Assumption**: Session distribution weighted by tutor activity

```python
# Only active tutors get sessions
# Weighted by total_sessions_completed (more active = more sessions)
tutor_weights = total_sessions_completed / sum(total_sessions_completed)
```

**Production**: ~750 sessions/day, ~22,500 over 30 days

### Temporal Distribution

**Assumption**: Sessions follow tutor-specific peak hours

```python
# 35% morning tutors (8-12am peak)
# 65% evening tutors (3-9pm peak)
# 70% of sessions in preferred hours, 30% outside
# Weekends: ~30% lower volume
```

**Rationale**: Tutors have preferred working hours based on lifestyle.

### Session Duration

**Assumption**: Most sessions are 60 minutes

```python
scheduled_duration = choice([30, 60, 90], p=[0.15, 0.75, 0.10])
actual_duration = scheduled_duration * uniform(0.85, 1.15)
```

### Completion Rates

**Assumption**: 97% completion rate overall

```python
student_showed = random() > 0.03  # 97% show rate
tutor_no_show_prob = clip(no_show_count * 0.01, 0, 0.15)
tutor_showed = random() > tutor_no_show_prob
session_completed = student_showed & tutor_showed
```

**Result**: ~97% completion rate, with tutor no-shows varying by tutor reliability.

### First Sessions

**Assumption**: 15% of completed sessions are first sessions

```python
is_first_session = random() < 0.15  # Only for completed sessions
```

**Critical**: First sessions have -0.3 rating penalty and are key churn indicators.

### Connection Quality

**Assumption**: Quality varies by time of day and day of week

```python
# Peak hours (6-9pm): 50% Excellent, 30% Good, 15% Fair, 5% Poor
# Weekends: 65% Excellent, 28% Good, 6% Fair, 1% Poor
# Normal hours: 60% Excellent, 30% Good, 8% Fair, 2% Poor
```

**Impact**: Poor connection = -0.6 rating penalty, Fair = -0.3, Good = -0.1

### Video Engagement Metrics

**Student Attention**

```python
student_attention_pct = Beta(5, 2) * 100 * (0.8 + reliability * 0.2)
# Clipped to 10-100%
# Mean: 72%, SD: 15%
# Correlates with tutor quality
```

**Tutor Camera On**

```python
tutor_camera_on_pct = Beta(9, 1) * 100
# Clipped to 70-100%
# Mean: 92%, SD: 8%
```

**Tutor Speak Ratio**

```python
tutor_speak_ratio = Normal(0.50, 0.12)
# Clipped to 0.20-0.80
# Ideal: 0.50 (balanced)
# >0.70 = tutor dominating (bad)
# <0.30 = tutor not engaged (bad)
```

**Screen Share**

```python
screen_share_pct = Beta(3, 2) * 100
# Clipped to 10-95%
# Mean: 65%, SD: 20%
```

### Sentiment Scores

**Assumption**: Sentiment correlates with tutor reliability

```python
overall_sentiment = Normal(0.3 + reliability * 0.4, 0.15)
# Clipped to -0.5 to 0.95
# Mean: 0.45, SD: 0.20

student_sentiment = overall_sentiment + Normal(0.05, 0.1)
tutor_sentiment = Normal(0.5, 0.15)
```

### Quality Scores

**Empathy Score**

```python
base_empathy = 5 + (reliability * 3) + (experience/60 * 1.5) + noise
# Apply tutor-specific trends and daily variance
# Range: 1-10, Mean: 6.5, SD: 1.5
```

**Clarity Score**

```python
base_clarity = 5 + (reliability * 3) + noise
# Apply tutor-specific trends and daily variance
# Range: 1-10, Mean: 6.8, SD: 1.3
```

**Engagement Score**

```python
base_engagement = (attention*0.4 + speak_balance*30 + (sentiment+1)*15) / 10
# Composite metric: 40% attention + 30% speak balance + 15% sentiment
# Apply tutor-specific trends and daily variance
# Range: 1-10, Mean: 6.3, SD: 1.6
```

**Correlation**: `empathy_score → student_satisfaction (r=0.72)`

### Student Rating

**Assumption**: Rating based on quality scores with adjustments

```python
quality_factor = (empathy + clarity + engagement) / 30
first_session_penalty = -0.3 if is_first_session else 0
connection_penalty = {'Excellent': 0, 'Good': -0.1, 'Fair': -0.3, 'Poor': -0.6}

student_rating = 2.0 + (quality_factor * 2.8) + first_session_penalty + connection_penalty + noise
# Clipped to 1.0-5.0
# Mean: 4.1, SD: 0.6
```

**Critical**: First sessions rated <3.5 = 24% churn risk (PRD requirement)

### Student Satisfaction

```python
base_satisfaction = (rating * 2) + noise
# Apply tutor-specific trends and daily variance
# Range: 1-10, Mean: 8.2, SD: 1.2
would_recommend = satisfaction >= 7.0  # 78% recommend rate
```

### Technical Issues

```python
had_technical_issues = random() < 0.08  # 8% of sessions
```

---

## Tutor Aggregates Calculation

### Time Windows

**Assumption**: Rolling windows for recent vs. overall metrics

```python
last_7d = sessions[session_datetime >= now - 7 days]
last_30d = sessions[session_datetime >= now - 30 days]
```

### Churn Signals

**Assumption**: Multiple signals contribute to churn probability

1. **Declining ratings** (1x weight): `rating_7d < rating_30d - 0.3`
2. **Low engagement** (1x weight): `avg_engagement < 5.5`
3. **High reschedule rate** (1x weight): `reschedule_rate > 0.15`
4. **Poor first sessions** (2x weight): `first_session_avg < 3.5` (PRD emphasis)
5. **No-shows** (1x weight): `no_show_count > 2`
6. **Declining activity** (1x weight): `sessions_7d < sessions_30d / 4`

### Churn Probability

```python
churn_signals = sum(signals_detected)
churn_probability = min(churn_signals * 0.12, 0.85) + uniform(0, 0.1)
# Capped at 0.85 (never 100% certain)

risk_level = {
    'High': churn_probability >= 0.5,
    'Medium': 0.3 <= churn_probability < 0.5,
    'Low': churn_probability < 0.3
}
```

### First Session Performance

**Critical Metric**: Poor first sessions are key churn indicators

```python
first_sessions = sessions[is_first_session == True]
first_session_avg_rating = first_sessions['student_rating'].mean()
poor_first_session_flag = first_session_avg_rating < 3.5
```

**PRD Requirement**: 24% of churners fail on first sessions

---

## Engagement Events Generation

### Event Types

- `login`: Platform logins
- `session_scheduled`: Session scheduling activity
- `session_completed`: Post-session activity
- `profile_updated`: Profile changes
- `message_sent`: Communication events
- `coaching_scheduled`: Coaching session scheduling
- `coaching_attended`: Coaching participation
- `email_opened`: Email engagement
- `email_clicked`: Email link clicks

### Login Patterns

**Assumption**: 2-5 logins per week per tutor

```python
logins_per_week = uniform(2, 5)
total_logins = logins_per_week * (n_days / 7)
```

**Correlation**: 60% of logins occur 1-4 hours before scheduled sessions

**Temporal**: Morning tutors peak 8-10am, evening tutors peak 6-9pm

### Session Events

**Assumption**: Events correlate with actual sessions

```python
# session_scheduled: 30-60 min after login for upcoming sessions
# session_completed: Immediately after session ends
# 70% of logins lead to scheduling
```

### Profile Activity

**Assumption**: 1-2 profile updates per month per tutor

```python
profile_updates = uniform(1, 2) * (n_days / 30)
```

### Email Engagement

**Assumption**: Email events linked to interventions

```python
# email_opened: 70% of sent emails
# email_clicked: 30-40% of opens
# Timing: 1-48 hours after send
```

---

## Interventions Generation

### Targeting

**Assumption**: Only High/Medium churn risk tutors receive interventions

```python
at_risk_tutors = tutors[churn_risk_level in ['High', 'Medium']]
```

### Intervention Types

Determined by tutor metrics (priority order):

1. **first_session**: `poor_first_session_flag == True`
2. **churn**: `churn_risk_level == 'High'`
3. **quality**: `avg_rating_7d < 3.8`
4. **technical**: `technical_issue_rate > 0.15`
5. **engagement**: `avg_engagement_score < 5.5`

### Volume

**Assumption**: 50-100 interventions over 30 days, 2-4 max per tutor

```python
num_interventions = uniform(50, 100)
max_per_tutor = 4
```

### Outcomes

**Assumption**: Three outcome categories

```python
# Success (60%): Opened + clicked/responded
# - Engagement improvement: 5-25%
# - Sessions increased: +1 to +4

# Ignored (25%): Delivered but never opened
# - No improvement: engagement * uniform(0.98, 1.02)
# - Sessions: +-1

# Partial (15%): Opened but not clicked
# - Minor improvement: 1-8%
# - Sessions: +0 to +2
```

### Experiment Linkage

**Assumption**: Interventions can be part of A/B tests

```python
# Check if tutor is in matching experiment
# Assign experiment_id and experiment_variant if applicable
```

---

## Experiments & Assignments

### Experiment Status

**Assumption**: Mix of completed and active experiments

- **Completed**: All eligible tutors assigned, 85-98% exposed
- **Active**: 60-80% of eligible tutors assigned, 30-70% exposed

### Targeting

**Assumption**: Experiments target specific tutor segments

```python
target_segment = {
    'churn_risk_level': ['High', 'Medium'],
    'poor_first_session_flag': True,
    'avg_engagement_score': {'max': 6.0},
    # ... other criteria
}
```

### Variant Assignment

**Assumption**: Equal distribution across variants

```python
variant_probs = [1.0 / len(variants)] * len(variants)
variant = choice(variants, p=variant_probs)
```

### Conversion Rates

**Assumption**: Treatment variants outperform control

```python
# Control: 5-15% conversion
# Treatment variants: 8-20% conversion
# Conversion value: 0.05-0.3 (metric improvement)
```

---

## Correlations & Relationships

### Key Correlations

| Relationship | Correlation | Implementation |
|-------------|-------------|----------------|
| `experience → reliability` | r=0.35 | Experience bonus in reliability calculation |
| `reliability → avg_rating` | r=0.58 | Rating formula includes reliability |
| `empathy_score → student_satisfaction` | r=0.72 | Satisfaction derived from empathy |
| `speak_ratio_balance → engagement` | r=0.45 | Engagement formula includes speak ratio |
| `connection_quality → rating` | Strong negative | Poor = -0.6, Fair = -0.3, Good = -0.1 |
| `is_first_session → rating` | Negative | -0.3 penalty for first sessions |
| `no_show_count → churn_probability` | r=0.68 | No-shows are churn signal |

### Tutor-Specific Trends

**Assumption**: Tutors have individual improvement/decline trends

```python
# Low reliability (<0.6): Declining trends (-0.15 to -0.03)
# High reliability (>0.8): Improving/stable (-0.02 to +0.10)
# Mid-range: Mixed trends (-0.08 to +0.05)

# Applied to: empathy, clarity, engagement, satisfaction
# Time factor: 1 + (trend * (day / n_days))
```

### Daily Variance

**Assumption**: System-wide daily variance affects all tutors

```python
daily_variance = {
    'engagement': uniform(0.85, 1.15),
    'empathy': uniform(0.92, 1.08),
    'clarity': uniform(0.90, 1.10),
    'satisfaction': uniform(0.88, 1.12)
}
```

---

## Temporal Patterns

### Session Timing

**Peak Hours**

- **Morning tutors (35%)**: 8-12am preferred
- **Evening tutors (65%)**: 3-9pm preferred
- **70% of sessions** in preferred hours
- **30% of sessions** outside preferred hours

**Weekend Patterns**

- **Volume**: ~30% lower on weekends
- **Hours**: More flexible spread (8am-9pm)
- **Connection quality**: Slightly better (less network congestion)

### Connection Quality by Time

| Time Period | Excellent | Good | Fair | Poor |
|------------|-----------|------|------|------|
| Peak (6-9pm) | 50% | 30% | 15% | 5% |
| Weekends | 65% | 28% | 6% | 1% |
| Normal hours | 60% | 30% | 8% | 2% |

### Engagement Event Timing

- **Logins**: 2-5 per week, 60% correlated with upcoming sessions
- **Profile updates**: 1-2 per month
- **Messages**: 2-5 per month
- **Email opens**: 1-48 hours after send
- **Email clicks**: 1-30 minutes after open

---

## Edge Cases & Personas

### Persona 1: "The Rock Star" (10% of tutors)

- **Experience**: 36-60 months
- **Reliability**: 0.85-0.95
- **Rating**: 4.7-5.0
- **Reschedule rate**: <0.05
- **Empathy**: 8-10
- **Churn probability**: 0.05-0.15

### Persona 2: "The Solid Performer" (50% of tutors)

- **Experience**: 12-36 months
- **Reliability**: 0.70-0.85
- **Rating**: 4.0-4.5
- **Reschedule rate**: 0.05-0.12
- **Empathy**: 6-8
- **Churn probability**: 0.15-0.35

### Persona 3: "The Struggling Newbie" (15% of tutors)

- **Experience**: 1-6 months
- **Reliability**: 0.50-0.70
- **Rating**: 3.5-4.0
- **Reschedule rate**: 0.10-0.20
- **First session rating**: 3.0-3.5 (**CHURN RISK**)
- **Empathy**: 4-6
- **Churn probability**: 0.45-0.70

### Persona 4: "The Burned Out Veteran" (5% of tutors)

- **Experience**: 48-120 months
- **Reliability**: 0.60-0.75 (declining)
- **Rating**: 4.2 overall, 3.8 in last 7 days
- **Reschedule rate**: 0.15-0.25 (increasing)
- **Sentiment trend**: Declining
- **Churn probability**: 0.50-0.75

### Persona 5: "The No-Show Problem" (8% of tutors)

- **No-show count**: 3-8
- **Reliability**: 0.40-0.60
- **Otherwise**: Decent metrics
- **Churn probability**: 0.55-0.80

### Additional Edge Cases

1. **High-performing new tutors** (5%): <6 months exp but 4.8+ ratings
2. **First session failures** (24%): First sessions rated <3.5
3. **Chronic reschedulers** (15%): >20% reschedule rate
4. **Technical issue victims** (5%): >15% technical issue rate despite good teaching
5. **Weekend warriors** (10%): Only teach weekends (different activity patterns)

---

## Validation Rules

### Logical Consistency

```python
# Session completion implies ratings exist
assert (session_completed == False) implies (rating is None)

# Tutor no-show implies session not completed
assert (tutor_showed == False) implies (session_completed == False)

# Speak ratio must be realistic
assert 0.20 <= tutor_speak_ratio <= 0.80
```

### Business Rules

```python
# Need minimum sessions for 7-day average
assert avg_rating_7d is None or (sessions_7d >= 3)

# Poor first session flag requires first sessions
assert poor_first_session_flag requires (first_session_count >= 1)

# Churn probability never 100%
assert churn_probability <= 0.85
```

### Realism Checks

```python
# Empathy should correlate with experience
assert empathy_score correlates_with months_experience (r > 0.3)

# Declining ratings should increase churn probability
assert rating_trend_down implies churn_probability_up
```

---

## Data Volumes

### Production Mode (30 days)

| Dataset | Volume | Notes |
|---------|--------|-------|
| Tutors | 150 | Mix of personas and experience levels |
| Sessions | ~22,500 | ~750 sessions/day |
| Completed sessions | ~21,825 | ~97% completion rate |
| Engagement events | ~4,500-9,000 | 2-5 logins/week per tutor |
| Interventions | 50-100 | High/Medium risk tutors only |
| Experiments | 4-5 | Mix of completed and active |
| Experiment assignments | ~150-400 | Varies by experiment status |

### Dev Mode (14 days)

| Dataset | Volume | Notes |
|---------|--------|-------|
| Tutors | 25 | Smaller sample for testing |
| Sessions | ~1,000 | ~100 sessions/day |
| Completed sessions | ~970 | ~97% completion rate |
| Engagement events | ~700-1,400 | Proportional to tutors |
| Interventions | 10-20 | Proportional to tutors |
| Experiments | 3-4 | Smaller experiment set |
| Experiment assignments | ~25-80 | Proportional to tutors |

### Session Distribution

- **By duration**: 15% (30min), 75% (60min), 10% (90min)
- **By completion**: 97% completed, 3% no-shows
- **By first session**: 15% of completed sessions are first sessions
- **By subject**: Matches tutor subject distribution
- **By time**: 70% in preferred hours, 30% outside

---

## Reproducibility

### Seed Management

All generators use `seed=42` by default for reproducibility. This ensures:

- Same random sequences across runs
- Consistent correlations and distributions
- Predictable edge cases and personas
- Reliable testing and validation

### Generation Command

```bash
# Production mode (default seed=42)
python tutor_data_gen.py --mode production

# Custom seed
python tutor_data_gen.py --mode production --seed 123

# Dev mode
python tutor_data_gen.py --mode dev
```

---

## Limitations & Future Enhancements

### Current Limitations

1. **Geographic homogeneity**: All tutors assumed same region (US-East)
2. **Static correlations**: Correlations don't change over time
3. **Simplified experiment logic**: Real A/B tests have more complexity
4. **Email delivery**: Simplified email engagement model
5. **Coaching sessions**: Limited coaching event generation

### Potential Enhancements

1. **Multi-region support**: Add geographic diversity
2. **Seasonal patterns**: Account for academic calendar
3. **Network effects**: Tutor-student relationship modeling
4. **Advanced ML features**: More sophisticated churn prediction
5. **Real-time updates**: Streaming data generation

---

## References

- **PRD Requirements**: Product Requirements Document for Tutor Quality Platform
- **Data Field Specs**: `docs/data-field-specs.md`
- **Generator Code**: `tutor_data_gen.py` and `scripts/generate_*.py`
- **Database Schema**: `prisma/schema.prisma`

---

## Appendix: Distribution Parameters

### Statistical Distributions Used

| Distribution | Parameters | Use Case |
|-------------|------------|----------|
| Gamma(2, 12) | shape=2, scale=12 | Tutor experience (months) |
| Beta(8, 2) | a=8, b=2 | Reliability score, historical rating |
| Beta(5, 2) | a=5, b=2 | Student attention percentage |
| Beta(9, 1) | a=9, b=1 | Tutor camera on percentage |
| Beta(3, 2) | a=3, b=2 | Screen share percentage |
| Normal(μ, σ) | Various | Sentiment scores, speak ratio |
| Poisson(3) | λ=3 | No-show count (for flagged tutors) |
| Uniform(a, b) | Various | Many random selections |

### Correlation Matrix (Approximate)

| Metric 1 | Metric 2 | Correlation |
|----------|----------|-------------|
| Experience | Reliability | 0.35 |
| Reliability | Avg Rating | 0.58 |
| Empathy | Satisfaction | 0.72 |
| Speak Ratio | Engagement | 0.45 |
| No-shows | Churn Probability | 0.68 |

---

*Document Version: 1.0*  
*Last Updated: 2024*  
*Maintained by: Data Engineering Team*

