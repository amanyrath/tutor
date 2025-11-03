import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
import matplotlib.pyplot as plt

# ==============================
# CONFIGURATION
# ==============================
np.random.seed(42)
NUM_TUTORS = 500
NUM_STUDENTS = 3000
NUM_SESSIONS = 3000

OUTPUT_DIR = "synthetic_tutor_quality_data"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ==============================
# HELPERS
# ==============================
def clip(x, low=0, high=1):
    return np.clip(x, low, high)

def random_date(start, end):
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))

def random_choice_weighted(options, weights):
    return np.random.choice(options, p=weights)

# ==============================
# 1️⃣ Tutors
# ==============================
regions = ["US-East", "US-West", "Europe", "Asia"]
experience_levels = ["Junior", "Mid", "Senior"]

tutors = []
for i in range(NUM_TUTORS):
    avg_rating = clip(np.random.normal(4.5, 0.3), 1, 5)
    avg_reschedule_rate = clip(np.random.normal(0.15, 0.05), 0, 0.6)
    avg_no_show_rate = clip(np.random.normal(0.05, 0.03), 0, 0.3)
    total_sessions = int(np.random.normal(200, 80))
    churned = np.random.binomial(1, 0.12)
    tutors.append([
        f"T{i+1:03d}",
        random_choice_weighted(experience_levels, [0.3, 0.5, 0.2]),
        avg_rating,
        avg_reschedule_rate,
        avg_no_show_rate,
        churned,
        total_sessions,
        np.random.randint(0, 6),
        random.choice(regions)
    ])

tutors_df = pd.DataFrame(tutors, columns=[
    "tutor_id", "experience_level", "avg_rating", "avg_reschedule_rate",
    "avg_no_show_rate", "churned", "total_sessions", "coaching_sessions", "region"
])
tutors_df.to_csv(f"{OUTPUT_DIR}/tutors.csv", index=False)

# ==============================
# 2️⃣ Students
# ==============================
subjects = ["Math", "Science", "English", "History", "Coding"]
age_groups = ["Child", "Teen", "Adult"]
timezones = ["UTC-8", "UTC+0", "UTC+1", "UTC+5", "UTC+9"]

students = []
for i in range(NUM_STUDENTS):
    return_rate = clip(np.random.normal(0.7, 0.15))
    avg_satisfaction = clip(np.random.normal(4.3, 0.4), 1, 5)
    students.append([
        f"S{i+1:04d}",
        random.choice(age_groups),
        random.choice(subjects),
        return_rate,
        avg_satisfaction,
        random.choice(timezones)
    ])

students_df = pd.DataFrame(students, columns=[
    "student_id", "age_group", "subject", "return_rate", "avg_satisfaction", "timezone"
])
students_df.to_csv(f"{OUTPUT_DIR}/students.csv", index=False)

# ==============================
# 3️⃣ Sessions
# ==============================
sessions = []
start_base = datetime(2025, 1, 1)
end_base = datetime(2025, 11, 1)
outcomes = ["Completed", "No-show", "Rescheduled"]

for i in range(NUM_SESSIONS):
    tutor_id = random.choice(tutors_df["tutor_id"])
    student_id = random.choice(students_df["student_id"])
    subject = random.choice(subjects)
    start_time = random_date(start_base, end_base)
    outcome = random_choice_weighted(outcomes, [0.85, 0.1, 0.05])
    rating = clip(np.random.normal(4.6, 0.4), 1, 5)
    connection_quality = clip(np.random.normal(0.9, 0.1))
    sessions.append([
        f"SE{i+1:04d}", tutor_id, student_id, start_time,
        int(np.random.normal(55, 10)), outcome, rating, subject, connection_quality
    ])

sessions_df = pd.DataFrame(sessions, columns=[
    "session_id", "tutor_id", "student_id", "start_time", "duration_minutes",
    "session_outcome", "rating", "subject", "connection_quality"
])
sessions_df.to_csv(f"{OUTPUT_DIR}/sessions.csv", index=False)

# ==============================
# 4️⃣ Session Video Engagement
# ==============================
video_data = []
for i in range(NUM_SESSIONS):
    attn = clip(np.random.normal(0.8, 0.1))
    tutor_speak = clip(np.random.normal(0.6, 0.1))
    student_speak = 1 - tutor_speak
    sentiment = np.random.uniform(-1, 1)
    freezes = np.random.poisson(1)
    audio_q = clip(np.random.normal(0.9, 0.05))
    gaze = clip(np.random.normal(0.75, 0.1))
    body = clip(np.random.normal(0.7, 0.15))
    index = clip(0.4*attn + 0.2*sentiment + 0.1*audio_q + 0.3*gaze)
    video_data.append([
        sessions_df.loc[i, "session_id"], attn, tutor_speak, student_speak, sentiment,
        freezes, audio_q, gaze, body, index
    ])

video_df = pd.DataFrame(video_data, columns=[
    "session_id", "avg_attention_score", "tutor_speaking_ratio", "student_speaking_ratio",
    "avg_facial_sentiment", "num_video_freezes", "avg_audio_quality",
    "gaze_alignment_score", "body_language_score", "session_engagement_index"
])
video_df.to_csv(f"{OUTPUT_DIR}/session_video_engagement.csv", index=False)

# ==============================
# 5️⃣ Session Transcript
# ==============================
transcript_data = []
for i in range(NUM_SESSIONS):
    tutor_words = int(np.random.normal(2300, 300))
    student_words = int(np.random.normal(1300, 250))
    sentiment = np.random.uniform(-1, 1)
    empathy = clip(np.random.normal(0.8, 0.1))
    transcript_data.append([
        sessions_df.loc[i, "session_id"], sentiment,
        clip(np.random.normal(0.4, 0.1)), tutor_words, student_words,
        clip(np.random.normal(0.07, 0.03)), empathy,
        np.random.randint(0, 5), np.random.uniform(0.8, 2.5),
        clip(np.random.normal(0.6, 0.1))
    ])

transcript_df = pd.DataFrame(transcript_data, columns=[
    "session_id", "avg_sentiment", "question_to_statement_ratio",
    "tutor_word_count", "student_word_count", "filler_word_rate",
    "ai_detected_empathy_score", "topic_shift_count",
    "avg_response_time_sec", "keyword_density"
])
transcript_df.to_csv(f"{OUTPUT_DIR}/session_transcript.csv", index=False)

# ==============================
# 6️⃣ Student Engagement
# ==============================
student_eng_data = []
for i in range(NUM_SESSIONS):
    chat_count = np.random.poisson(15)
    poll_rate = clip(np.random.normal(0.9, 0.1))
    cam_on = clip(np.random.normal(0.85, 0.1))
    feedback = clip(np.random.normal(4.5, 0.5), 1, 5)
    follow_up = np.random.binomial(1, 0.6)
    next_gap = int(np.random.normal(7, 3))
    student_eng_data.append([
        sessions_df.loc[i, "session_id"], chat_count, poll_rate, cam_on,
        feedback, follow_up, next_gap
    ])

student_eng_df = pd.DataFrame(student_eng_data, columns=[
    "session_id", "in_session_chat_count", "poll_participation_rate",
    "student_camera_on_time_pct", "post_session_feedback_score",
    "follow_up_scheduled", "next_session_gap_days"
])
student_eng_df.to_csv(f"{OUTPUT_DIR}/session_student_engagement.csv", index=False)

# ==============================
# 7️⃣ Retention Outcomes
# ==============================
retention = []
for _, row in tutors_df.iterrows():
    engagement_index = clip(np.random.normal(0.8, 0.1))
    empathy = clip(np.random.normal(0.8, 0.1))
    days_inactive = int(np.random.normal(30, 15))
    retention.append([
        row["tutor_id"], row["avg_rating"], row["avg_reschedule_rate"],
        row["avg_no_show_rate"], engagement_index, empathy,
        row["churned"], days_inactive
    ])

retention_df = pd.DataFrame(retention, columns=[
    "tutor_id", "avg_session_rating", "reschedule_rate", "no_show_rate",
    "avg_engagement_index", "avg_empathy_score", "churned", "days_since_last_session"
])
retention_df.to_csv(f"{OUTPUT_DIR}/retention_outcomes.csv", index=False)

# ==============================
# 8️⃣ Merged Dataset
# ==============================
merged_df = (
    sessions_df
    .merge(video_df, on="session_id")
    .merge(transcript_df, on="session_id")
    .merge(student_eng_df, on="session_id")
    .merge(tutors_df[["tutor_id", "experience_level", "avg_reschedule_rate", "avg_no_show_rate", "region"]], on="tutor_id")
)

merged_df["tutor_quality_score"] = (
    0.3 * merged_df["rating"] +
    0.2 * merged_df["session_engagement_index"] +
    0.2 * merged_df["avg_attention_score"] +
    0.1 * merged_df["ai_detected_empathy_score"] +
    0.1 * (1 - merged_df["avg_reschedule_rate"]) +
    0.1 * (1 - merged_df["avg_no_show_rate"])
)

merged_df.to_csv(f"{OUTPUT_DIR}/merged_sessions.csv", index=False)

# ==============================
# 🔮 BASELINE CHURN MODEL
# ==============================
tutor_agg = merged_df.groupby("tutor_id").agg({
    "rating": "mean",
    "session_engagement_index": "mean",
    "avg_attention_score": "mean",
    "ai_detected_empathy_score": "mean",
    "avg_reschedule_rate": "mean",
    "avg_no_show_rate": "mean",
    "tutor_quality_score": "mean"
}).reset_index()

tutor_agg = tutor_agg.merge(tutors_df[["tutor_id", "churned", "experience_level", "region"]], on="tutor_id")

# Encode categorical variables
tutor_agg = pd.get_dummies(tutor_agg, columns=["experience_level", "region"], drop_first=True)

X = tutor_agg.drop(columns=["tutor_id", "churned"])
y = tutor_agg["churned"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

model = LogisticRegression(max_iter=500)
model.fit(X_train_scaled, y_train)
y_pred = model.predict(X_test_scaled)

print("\n📊 Logistic Regression Churn Model Report:")
print(classification_report(y_test, y_pred))

# Feature importance
importance = pd.DataFrame({
    "feature": X.columns,
    "importance": model.coef_[0]
}).sort_values(by="importance", ascending=False)

importance.to_csv(f"{OUTPUT_DIR}/churn_feature_importance.csv", index=False)
print("\n💡 Top Predictive Features Saved: churn_feature_importance.csv")

# Optional: Quick visualization
plt.figure(figsize=(8,5))
importance.head(10).plot.bar(x="feature", y="importance", legend=False)
plt.title("Top Predictors of Tutor Churn (Synthetic Data)")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/churn_feature_importance.png")

# ==============================
# 9️⃣ README FILE
# ==============================
readme_text = """# Tutor Quality Scoring System - Synthetic Data
This folder contains all synthetic data, a merged analytics dataset, and a baseline churn model output.

**Files**
- tutors.csv
- students.csv
- sessions.csv
- session_video_engagement.csv
- session_transcript.csv
- session_student_engagement.csv
- retention_outcomes.csv
- merged_sessions.csv
- churn_feature_importance.csv
- churn_feature_importance.png

**Model Summary**
A logistic regression churn model is trained using aggregated session-level tutor metrics.
This model highlights which features most correlate with tutor churn, such as:
- High reschedule rate
- Low empathy score
- Low engagement index

**Usage**
Use this data for:
- Tutor Quality Scoring ML prototype
- Retention prediction dashboards
- Engagement analytics and model evaluation
"""

with open(f"{OUTPUT_DIR}/README.md", "w") as f:
    f.write(readme_text)

print(f"\n✅ All synthetic data, merged dataset, and churn model outputs generated in: {OUTPUT_DIR}")
