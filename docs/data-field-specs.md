# Tutor Quality Data - Field Specifications & Realistic Values

## 1. Tutor Profiles (`tutor_profiles.csv`)

### Identity & Experience
| Field | Type | Range | Distribution | Notes |
|-------|------|-------|--------------|-------|
| `tutor_id` | String | T0001-T9999 | Sequential | Unique identifier |
| `months_experience` | Integer | 1-120 | Gamma(2, 12) | Most tutors 6-36 months, few veterans 5+ years |
| `total_sessions_completed` | Integer | 8-3000 | Correlated w/ experience | `months * uniform(8,25)` sessions |
| `certification_level` | Enum | Basic/Advanced/Expert | 50%/35%/15% | Higher = better retention |

### Performance Metrics
| Field | Type | Range | Distribution | Notes |
|-------|------|-------|--------------|-------|
| `avg_historical_rating` | Float | 2.0-5.0 | Beta(8,2) shifted | Mean ~4.2, skewed high. Correlates with experience +0.15 max |
| `reliability_score` | Float | 0.0-1.0 | Beta(8,2) | Internal metric, not shown to tutors. 0.7+ is good |
| `reschedule_rate` | Float | 0.0-0.35 | Inverse reliability | **98.2% of reschedules tutor-initiated (PRD)** |
| `no_show_count` | Integer | 0-10 | Poisson(3) if flagged | **16% of tutors have no-show issues (PRD)** |

### Subject Coverage
| Field | Type | Example | Distribution | Notes |
|-------|------|---------|--------------|-------|
| `subjects_taught` | String (CSV) | "Math,Science" | 1-3 subjects | 40% teach 1, 40% teach 2, 20% teach 3 |
| `primary_subject` | Enum | Math, Science, English, History, Test Prep, Programming | Uniform | Most sessions in this subject |
| `active_status` | Boolean | True/False | 92% True | Inactive tutors don't get scheduled |

---

## 2. Session Data (`sessions.csv`)

### Session Metadata
| Field | Type | Range | Distribution | Notes |
|-------|------|-------|--------------|-------|
| `session_id` | String | S000001-S999999 | Sequential | Unique per session |
| `tutor_id` | String | T0001-T9999 | Foreign key | Links to tutor profile |
| `session_datetime` | Datetime | Last 30 days | Weighted by hour | Peak 3-9pm, less on weekends |
| `scheduled_duration_min` | Integer | 30, 60, 90 | 15%/75%/10% | Most are 60-min sessions |
| `actual_duration_min` | Integer | 25-105 | ±15% of scheduled | Slight variance from scheduled |

### Session Context
| Field | Type | Options | Distribution | Notes |
|-------|------|---------|--------------|-------|
| `subject` | Enum | Math, Science, English, History, Test Prep, Programming | Matches tutor's subjects | - |
| `grade_level` | Enum | Elementary, Middle School, High School, College, Adult | Uniform | Affects complexity |
| `is_first_session` | Boolean | True/False | 15% True | **24% of churners fail here (PRD)** - CRITICAL |
| `session_completed` | Boolean | True/False | 97% True | 3% no-shows total |

### Completion Status
| Field | Type | Range | Distribution | Notes |
|-------|------|-------|--------------|-------|
| `student_showed` | Boolean | True/False | 97% True | Rare student no-shows |
| `tutor_showed` | Boolean | True/False | 95-99% True | Based on tutor's no_show_count |
| `connection_quality` | Enum | Excellent/Good/Fair/Poor | 60%/30%/8%/2% | Affects ratings -0.6 for Poor |
| `had_technical_issues` | Boolean | True/False | 8% True | Audio/video problems |

---

## 3. Video Engagement Metrics (`sessions.csv` - derived features)

### Attention & Presence
| Field | Type | Range | Realistic Values | How It's Measured |
|-------|------|-------|------------------|-------------------|
| `student_attention_pct` | Float | 10-100% | Mean: 72%, SD: 15% | Face detection + gaze tracking. Correlates with tutor quality |
| `tutor_camera_on_pct` | Float | 70-100% | Mean: 92%, SD: 8% | Most tutors keep camera on. Beta(9,1) distribution |
| `tutor_speak_ratio` | Float | 0.20-0.80 | Ideal: 0.50, SD: 0.12 | **Speaking time / total time. Should be balanced 40-60%** |
| `screen_share_pct` | Float | 10-95% | Mean: 65%, SD: 20% | Screen share usage for materials |

**Key Insights:**
- Student attention <50% = red flag (poor engagement)
- Tutor speak ratio >0.70 = tutor dominating (bad)
- Tutor speak ratio <0.30 = tutor not engaged (bad)
- Low camera usage correlates with lower ratings

---

## 4. Sentiment Analysis Features (`sessions.csv` - from transcripts)

### Sentiment Scores
| Field | Type | Range | Realistic Values | Interpretation |
|-------|------|-------|------------------|----------------|
| `overall_sentiment` | Float | -0.5 to 0.95 | Mean: 0.45, SD: 0.20 | Compound sentiment from entire transcript. Positive = good session |
| `student_sentiment` | Float | -0.5 to 0.95 | Mean: 0.50, SD: 0.18 | Student's speech only. Slightly higher than overall |
| `tutor_sentiment` | Float | -0.2 to 0.95 | Mean: 0.55, SD: 0.15 | Tutor's speech. Should be consistently positive |

### Quality Scores (NLP-derived)
| Field | Type | Range | Realistic Values | What It Measures |
|-------|------|-------|------------------|------------------|
| `empathy_score` | Float | 1-10 | Mean: 6.5, SD: 1.5 | "I understand...", "That's frustrating...", acknowledgment phrases |
| `clarity_score` | Float | 1-10 | Mean: 6.8, SD: 1.3 | Explanation quality, jargon usage, examples given |
| `engagement_score` | Float | 1-10 | Mean: 6.3, SD: 1.6 | **Composite: 40% attention + 30% speak balance + 15% sentiment** |

**Scoring Logic:**
```python
empathy_score = 5 + (reliability * 3) + (experience/60 * 1.5) + noise
clarity_score = 5 + (reliability * 3) + noise
engagement_score = (attention*0.4 + speak_balance*30 + (sentiment+1)*15) / 10
```

---

## 5. Student Feedback (`sessions.csv` - post-session survey)

### Direct Feedback
| Field | Type | Range | Realistic Values | Business Impact |
|-------|------|-------|------------------|-----------------|
| `student_rating` | Float | 1.0-5.0 | Mean: 4.1, SD: 0.6 | **Star rating. <3.5 on first session = 24% churn risk** |
| `student_satisfaction` | Float | 1.0-10.0 | Mean: 8.2, SD: 1.2 | Correlates with rating (rating * 2) |
| `would_recommend` | Boolean | True/False | 78% True | True if satisfaction ≥7.0 |

**Rating Calculation:**
```python
base_rating = 2.0 + (quality_factor * 2.8)
adjustments = {
    'first_session': -0.3,
    'connection_excellent': 0,
    'connection_good': -0.1,
    'connection_fair': -0.3,
    'connection_poor': -0.6
}
final_rating = clip(base_rating + adjustments + noise, 1, 5)
```

---

## 6. Tutor Aggregates (`tutor_aggregates.csv` - rolling metrics)

### Activity Metrics
| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `total_sessions_30d` | Integer | 0-300 | Sessions in last 30 days |
| `total_sessions_7d` | Integer | 0-70 | Recent activity level |
| `avg_rating_30d` | Float | 2.0-5.0 | Trailing 30-day average |
| `avg_rating_7d` | Float | 2.0-5.0 | **Declining trend = churn signal** |

### Quality Aggregates
| Field | Type | Range | Business Logic |
|-------|------|-------|----------------|
| `avg_engagement_score` | Float | 1-10 | Mean engagement across all sessions |
| `avg_empathy_score` | Float | 1-10 | Teaching style indicator |
| `avg_clarity_score` | Float | 1-10 | Explanation effectiveness |
| `avg_student_satisfaction` | Float | 1-10 | Overall student happiness |

### First Session Performance (CRITICAL)
| Field | Type | Range | Why It Matters |
|-------|------|-------|----------------|
| `first_session_count` | Integer | 0-50 | How many first sessions delivered |
| `first_session_avg_rating` | Float | 2.0-5.0 | **<3.5 = HIGH CHURN RISK (24% fail here)** |
| `poor_first_session_flag` | Boolean | True/False | Alert trigger for intervention |

### Behavioral Indicators
| Field | Type | Range | Interpretation |
|-------|------|-------|----------------|
| `recommendation_rate` | Float | 0.0-1.0 | % of students who'd recommend. Target: >0.75 |
| `technical_issue_rate` | Float | 0.0-1.0 | Frequency of tech problems. >0.15 = issue |
| `sentiment_trend_7d` | Float | -0.5 to 0.95 | Recent sentiment. Declining = problem |

---

## 7. Churn Prediction Features (`tutor_aggregates.csv`)

### Churn Signals
| Signal | Weight | Detection Logic |
|--------|--------|-----------------|
| Declining ratings | 1x | `rating_7d < rating_30d - 0.3` |
| Low engagement | 1x | `avg_engagement < 5.5` |
| High reschedule rate | 1x | `reschedule_rate > 0.15` |
| Poor first sessions | **2x** | `first_session_avg < 3.5` (PRD emphasis) |
| No-shows | 1x | `no_show_count > 2` |
| Declining activity | 1x | `sessions_7d < sessions_30d / 4` |

### Churn Probability Calculation
```python
churn_signals = sum(signals_detected)
churn_probability = min(churn_signals * 0.12, 0.85) + random_noise(0, 0.1)

risk_level = {
    'High': churn_probability >= 0.5,
    'Medium': 0.3 <= churn_probability < 0.5,
    'Low': churn_probability < 0.3
}
```

| Field | Type | Range | Action Threshold |
|-------|------|-------|------------------|
| `churn_probability` | Float | 0.0-1.0 | >0.5 = immediate intervention |
| `churn_risk_level` | Enum | Low/Medium/High | High = coaching session required |
| `churn_signals_detected` | Integer | 0-8 | Number of red flags |

---

## 8. Data Correlations & Realism

### Key Correlations (matching real tutoring dynamics)
```
experience → reliability (r=0.35)
reliability → avg_rating (r=0.58)
empathy_score → student_satisfaction (r=0.72)
speak_ratio_balance → engagement (r=0.45)
connection_quality → rating (strong negative for Poor)
is_first_session → rating (negative penalty -0.3)
no_show_count → churn_probability (r=0.68)
```

### Edge Cases to Include
1. **High-performing new tutors**: 5% have <6 months exp but 4.8+ ratings
2. **Burned out veterans**: 3% have >36 months but declining 7-day metrics
3. **First session failures**: 24% of first sessions rated <3.5 (PRD requirement)
4. **Chronic reschedulers**: 15% have >20% reschedule rate
5. **Technical issue victims**: 5% have >15% technical issue rate despite good teaching
6. **Weekend warriors**: 10% only teach weekends (different activity patterns)

---

## 9. Data Validation Rules

### Must-Have Constraints
```python
# Logical consistency
assert (session_completed == False) implies (rating is None)
assert (tutor_showed == False) implies (session_completed == False)
assert 0.20 <= tutor_speak_ratio <= 0.80  # Humans can't speak 0% or 100%

# Business rules
assert avg_rating_7d is None or (sessions_7d >= 3)  # Need 3+ sessions
assert poor_first_session_flag requires (first_session_count >= 1)
assert churn_probability <= 0.85  # Never 100% certain

# Realism
assert empathy_score correlates_with months_experience (r > 0.3)
assert rating_trend_down implies churn_probability_up
```

---

## 10. Sample Tutor Personas (for testing)

### Persona 1: "The Rock Star" (10% of tutors)
- months_experience: 36-60
- reliability_score: 0.85-0.95
- avg_rating: 4.7-5.0
- reschedule_rate: <0.05
- empathy_score: 8-10
- churn_probability: 0.05-0.15

### Persona 2: "The Solid Performer" (50% of tutors)
- months_experience: 12-36
- reliability_score: 0.70-0.85
- avg_rating: 4.0-4.5
- reschedule_rate: 0.05-0.12
- empathy_score: 6-8
- churn_probability: 0.15-0.35

### Persona 3: "The Struggling Newbie" (15% of tutors)
- months_experience: 1-6
- reliability_score: 0.50-0.70
- avg_rating: 3.5-4.0
- reschedule_rate: 0.10-0.20
- first_session_avg_rating: 3.0-3.5 (**CHURN RISK**)
- empathy_score: 4-6
- churn_probability: 0.45-0.70

### Persona 4: "The Burned Out Veteran" (5% of tutors)
- months_experience: 48-120
- reliability_score: 0.60-0.75 (declining)
- avg_rating: 4.2 overall, but 3.8 in last 7 days
- reschedule_rate: 0.15-0.25 (increasing)
- sentiment_trend_7d: declining
- churn_probability: 0.50-0.75

### Persona 5: "The No-Show Problem" (8% of tutors)
- no_show_count: 3-8
- reliability_score: 0.40-0.60
- Otherwise decent metrics
- churn_probability: 0.55-0.80 (**16% cause issues - PRD**)

---

## 11. PRD Requirements Checklist

✅ **24% first session churn**: `poor_first_session_flag` identifies these  
✅ **98.2% tutor-initiated reschedules**: `reschedule_rate` in tutor_profiles  
✅ **16% tutor no-shows**: `no_show_count` distribution reflects this  
✅ **750 daily sessions**: Generate 30 days * 750 = 22,500 sessions (minimum viable for patterns)    
✅ **<1 hour latency**: Data structure supports real-time scoring  
✅ **Multiple signals**: 6+ churn indicators included  
✅ **Actionable insights**: Flags, scores, and recommendations built in

---

## 12. Engagement Events (`engagement_events.csv`)

### Event Tracking
| Field | Type | Range | Event Types | Notes |
|-------|------|-------|-------------|-------|
| `event_id` | String | EV000001-EV999999 | Sequential | Unique identifier |
| `tutor_id` | String | T0001-T9999 | Foreign key | Links to tutor |
| `event_type` | Enum | login, session_scheduled, session_completed, profile_updated, message_sent, coaching_attended, coaching_scheduled, email_opened, email_clicked | - | Type of engagement event |
| `event_data` | JSON | Varied | - | Additional context (IP address, device, session_id, etc.) |
| `timestamp` | Datetime | Last 30 days | - | When event occurred |

### Event Patterns
- **Login events**: 2-5 per week per tutor
  - 60% correlation: logins 1-4 hours before scheduled sessions
  - Morning tutors: 8-10am peak
  - Evening tutors: 6-9pm peak
  - Weekend activity ~30% lower
- **Session events**: Correlated with actual sessions
  - `session_scheduled`: 30-60 min after login for upcoming sessions
  - `session_completed`: Immediately after session ends
- **Profile activity**: 1-2 updates per month per tutor
- **Email engagement**: Links to interventions
  - `email_opened`: 70% of sent emails
  - `email_clicked`: 30-40% of opens

---

## 13. Interventions (`interventions.csv`)

### Intervention Tracking
| Field | Type | Range | Business Logic |
|-------|------|-------|----------------|
| `intervention_id` | String | INT0001-INT9999 | Sequential |
| `tutor_id` | String | T0001-T9999 | Foreign key |
| `intervention_type` | Enum | engagement, first_session, quality, technical, churn | Determined by tutor metrics |
| `channel` | String | email (default) | Delivery method |
| `subject` | String | Varied | Email subject line |
| `content` | Text | Varied | Email body or message |
| `template_id` | String | template_{type}_001 | Template reference |
| `experiment_id` | String | EXP001-EXP999 | A/B test link |
| `experiment_variant` | String | control, treatment_a, etc. | Variant assignment |

### Delivery Tracking
| Field | Type | Interpretation |
|-------|------|----------------|
| `sent_at` | Datetime | When intervention was sent |
| `delivered_at` | Datetime | Email delivery confirmation |
| `opened_at` | Datetime | Email opened (if opened) |
| `clicked_at` | Datetime | Link clicked (if clicked) |
| `responded_at` | Datetime | Tutor responded (if responded) |
| `status` | Enum | pending, sent, delivered, opened, clicked, responded, failed |

### Success Metrics
| Field | Type | Success Indicators |
|-------|------|-------------------|
| `engagement_before` | Float | Engagement score at intervention time |
| `engagement_after` | Float | Engagement score after intervention |
| `sessions_before_count` | Integer | Sessions in 7 days before |
| `sessions_after_count` | Integer | Sessions in 7 days after |

### Intervention Outcomes
- **Success (60%)**: Opened + clicked/responded, engagement improved, sessions increased
- **Ignored (25%)**: Delivered but never opened, no improvement
- **Partial (15%)**: Opened but not clicked, minor improvement

---

## 14. Experiments (`experiments.csv`)

### Experiment Configuration
| Field | Type | Example | Notes |
|-------|------|---------|-------|
| `experiment_id` | String | EXP001 | Unique identifier |
| `name` | String | "First Session Coaching Email" | Human-readable name |
| `hypothesis` | Text | "Personalized emails improve first session quality" | Hypothesis being tested |
| `description` | Text | Optional | Detailed description |
| `variants` | JSON Array | ["control", "treatment_a", "treatment_b"] | Variant names |
| `target_segment` | JSON Object | {"churn_risk_level": ["High", "Medium"]} | Targeting criteria |
| `primary_metric` | String | engagement_lift | Main metric to track |
| `secondary_metrics` | JSON Object | {"first_session_rating": true} | Additional metrics |

### Timing & Status
| Field | Type | Completed | Active |
|-------|------|-----------|--------|
| `start_date` | Datetime | Past date | Recent date |
| `end_date` | Datetime | Past date | null |
| `status` | Enum | completed | active |
| `sample_size` | Integer | Actual count | Target count |
| `significance` | Float | p-value | null |
| `winner` | String | Variant name | null |

### Sample Experiments
1. **Completed**: "First Session Coaching Email" - treatment_a winner, 15% engagement lift
2. **Completed**: "Engagement Reminder Timing" - evening winner, 8% response increase
3. **Active**: "Quality Feedback Format" - collecting data
4. **Active**: "Intervention Frequency" - just started

---

## 15. Experiment Assignments (`experiment_assignments.csv`)

### Assignment Tracking
| Field | Type | Range | Notes |
|-------|------|-------|-------|
| `experiment_id` | String | EXP001-EXP999 | Foreign key |
| `tutor_id` | String | T0001-T9999 | Foreign key |
| `variant` | String | control, treatment_a, etc. | Randomly assigned |
| `assigned_at` | Datetime | Experiment start | When assigned |
| `exposed_at` | Datetime | 1-48h after assigned | When variant shown |
| `converted_at` | Datetime | After exposure | When action occurred |
| `conversion_value` | Float | 0.05-0.3 | Metric improvement |

### Conversion Rates
- **Control**: 5-15% conversion
- **Treatment variants**: 8-20% conversion
- **Exposure**: 85-98% for completed experiments, 30-70% for active

### Assignment Logic
- Completed experiments: All eligible tutors assigned
- Active experiments: 60-80% of eligible tutors assigned
- Variants: Equal distribution among variants

---

## 16. Data Generation Commands

### Basic Generation
```bash
# Production mode (default)
python tutor_data_gen.py --mode production

# Dev mode (smaller dataset)
python tutor_data_gen.py --mode dev

# Custom parameters
python tutor_data_gen.py --tutors 100 --days 14 --sessions-per-day 500
```

### New Data Types
```bash
# Include all new data types (default)
python tutor_data_gen.py --mode production

# Skip specific types
python tutor_data_gen.py --mode production --no-engagement-events
python tutor_data_gen.py --mode production --no-interventions
python tutor_data_gen.py --mode production --no-experiments

# Skip ML model training
python tutor_data_gen.py --mode production --no-model
```

### Standalone Generators
```bash
# Generate engagement events only
python scripts/generate_engagement_events.py \
  --tutors-csv data/tutor_profiles.csv \
  --sessions-csv data/sessions.csv \
  --output data/engagement_events.csv

# Generate experiments
python scripts/generate_experiments.py --output data/experiments.csv

# Generate experiment assignments
python scripts/generate_experiment_assignments.py \
  --experiments-csv data/experiments.csv \
  --tutors-csv data/tutor_profiles.csv \
  --aggregates-csv data/tutor_aggregates.csv

# Generate interventions
python scripts/generate_interventions.py \
  --tutors-csv data/tutor_profiles.csv \
  --aggregates-csv data/tutor_aggregates.csv \
  --sessions-csv data/sessions.csv \
  --experiments-csv data/experiments.csv \
  --assignments-csv data/experiment_assignments.csv
```

### Data Import
```bash
# Import all data (including new types)
npm run import-data:clear

# Import specific directory
npm run import-data data/

# Append mode (don't clear existing)
npm run import-data
```

---

## 17. Updated Data Volumes

### Production Mode (30 days)
- **Tutors**: 150
- **Sessions**: ~22,500 (~750 sessions/day)
- **Engagement Events**: ~4,500-9,000
- **Interventions**: 50-100
- **Experiments**: 4-5
- **Experiment Assignments**: ~150-400

### Dev Mode (14 days)
- **Tutors**: 25
- **Sessions**: ~1,000
- **Engagement Events**: ~700-1,400
- **Interventions**: 10-20
- **Experiments**: 3-4
- **Experiment Assignments**: ~25-80

---

## 18. Enhanced Session Patterns

### Tutor-Specific Patterns
- **Peak hours**: 35% morning (8-12am), 65% evening (3-9pm)
- **Session distribution**: 70% in preferred hours, 30% outside
- **Struggling tutors**: More likely to take odd hours (6-7am, 10-11pm)

### Connection Quality Patterns
- **Peak hours (6-9pm)**: 50% Excellent, 30% Good, 15% Fair, 5% Poor
- **Weekends**: 65% Excellent, 28% Good, 6% Fair, 1% Poor
- **Normal hours**: 60% Excellent, 30% Good, 8% Fair, 2% Poor

### Weekend Patterns
- **Session volume**: ~30% lower on weekends
- **Hours**: More flexible spread (8am-9pm)
- **Connection quality**: Slightly better (less network congestion)

---

## Usage Notes

1. **Generate data once, reuse**: Run generator with fixed seed for reproducibility
2. **Test ML models**: Use tutor_aggregates.csv for churn prediction training
3. **Dashboard mockups**: Use sessions.csv for real-time scoring UI
4. **A/B testing**: Generate multiple datasets with different parameters
5. **Edge case testing**: Filter for high_risk tutors, poor_first_sessions, etc.
6. **Analytics features**: All new data types support engagement tracking, intervention analysis, and experiment evaluation
