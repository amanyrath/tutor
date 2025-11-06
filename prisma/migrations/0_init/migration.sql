-- CreateTable
CREATE TABLE "tutors" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "months_experience" INTEGER NOT NULL,
    "total_sessions_completed" INTEGER NOT NULL,
    "avg_historical_rating" DOUBLE PRECISION NOT NULL,
    "subjects_taught" TEXT NOT NULL,
    "primary_subject" TEXT NOT NULL,
    "reschedule_rate" DOUBLE PRECISION NOT NULL,
    "no_show_count" INTEGER NOT NULL,
    "reliability_score" DOUBLE PRECISION NOT NULL,
    "certification_level" TEXT NOT NULL,
    "active_status" BOOLEAN NOT NULL,
    "last_login" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "session_datetime" TIMESTAMP(3) NOT NULL,
    "scheduled_duration_min" INTEGER NOT NULL,
    "actual_duration_min" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "grade_level" TEXT NOT NULL,
    "is_first_session" BOOLEAN,
    "session_completed" BOOLEAN NOT NULL,
    "student_showed" BOOLEAN NOT NULL,
    "tutor_showed" BOOLEAN NOT NULL,
    "connection_quality" TEXT NOT NULL,
    "had_technical_issues" BOOLEAN,
    "student_attention_pct" DOUBLE PRECISION,
    "tutor_camera_on_pct" DOUBLE PRECISION,
    "tutor_speak_ratio" DOUBLE PRECISION,
    "screen_share_pct" DOUBLE PRECISION,
    "overall_sentiment" DOUBLE PRECISION,
    "student_sentiment" DOUBLE PRECISION,
    "tutor_sentiment" DOUBLE PRECISION,
    "empathy_score" DOUBLE PRECISION,
    "clarity_score" DOUBLE PRECISION,
    "engagement_score" DOUBLE PRECISION,
    "student_rating" DOUBLE PRECISION,
    "student_satisfaction" DOUBLE PRECISION,
    "would_recommend" BOOLEAN,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_aggregates" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "total_sessions_30d" INTEGER NOT NULL,
    "total_sessions_7d" INTEGER NOT NULL,
    "avg_rating_30d" DOUBLE PRECISION NOT NULL,
    "avg_rating_7d" DOUBLE PRECISION,
    "avg_engagement_score" DOUBLE PRECISION NOT NULL,
    "avg_empathy_score" DOUBLE PRECISION NOT NULL,
    "avg_clarity_score" DOUBLE PRECISION NOT NULL,
    "avg_student_satisfaction" DOUBLE PRECISION NOT NULL,
    "first_session_count" INTEGER NOT NULL,
    "first_session_avg_rating" DOUBLE PRECISION,
    "poor_first_session_flag" BOOLEAN NOT NULL,
    "recommendation_rate" DOUBLE PRECISION NOT NULL,
    "technical_issue_rate" DOUBLE PRECISION NOT NULL,
    "sentiment_trend_7d" DOUBLE PRECISION,
    "churn_probability" DOUBLE PRECISION NOT NULL,
    "churn_risk_level" TEXT NOT NULL,
    "churn_signals_detected" INTEGER NOT NULL,
    "last_calculated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_aggregates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "metric" TEXT,
    "metric_value" DOUBLE PRECISION,
    "threshold" DOUBLE PRECISION,
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "acknowledged_at" TIMESTAMP(3),
    "acknowledged_by" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interventions" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "intervention_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'email',
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "template_id" TEXT,
    "experiment_id" TEXT,
    "experiment_variant" TEXT,
    "sent_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "response_type" TEXT,
    "response_notes" TEXT,
    "engagement_before" DOUBLE PRECISION,
    "engagement_after" DOUBLE PRECISION,
    "sessions_before_count" INTEGER,
    "sessions_after_count" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interventions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "engagement_events" (
    "id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "engagement_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hypothesis" TEXT NOT NULL,
    "description" TEXT,
    "variants" JSONB NOT NULL,
    "target_segment" JSONB,
    "primary_metric" TEXT NOT NULL,
    "secondary_metrics" JSONB,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sample_size" INTEGER,
    "significance" DOUBLE PRECISION,
    "winner" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_assignments" (
    "id" TEXT NOT NULL,
    "experiment_id" TEXT NOT NULL,
    "tutor_id" TEXT NOT NULL,
    "variant" TEXT NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exposed_at" TIMESTAMP(3),
    "converted_at" TIMESTAMP(3),
    "conversion_value" DOUBLE PRECISION,

    CONSTRAINT "experiment_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pattern_insights" (
    "id" TEXT NOT NULL,
    "pattern_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "affected_tutor_ids" JSONB NOT NULL,
    "affected_tutor_count" INTEGER NOT NULL,
    "correlations" JSONB,
    "statistical_significance" DOUBLE PRECISION,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "ai_generated_recommendation" TEXT NOT NULL,
    "ai_model" TEXT,
    "ai_prompt" TEXT,
    "analyzed_period_start" TIMESTAMP(3) NOT NULL,
    "analyzed_period_end" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "action_taken" TEXT,
    "action_taken_at" TIMESTAMP(3),
    "discovered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pattern_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tutors_tutor_id_key" ON "tutors"("tutor_id");

-- CreateIndex
CREATE INDEX "tutors_active_status_idx" ON "tutors"("active_status");

-- CreateIndex
CREATE INDEX "tutors_primary_subject_idx" ON "tutors"("primary_subject");

-- CreateIndex
CREATE INDEX "tutors_last_login_idx" ON "tutors"("last_login");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_id_key" ON "sessions"("session_id");

-- CreateIndex
CREATE INDEX "sessions_tutor_id_idx" ON "sessions"("tutor_id");

-- CreateIndex
CREATE INDEX "sessions_session_datetime_idx" ON "sessions"("session_datetime");

-- CreateIndex
CREATE INDEX "sessions_is_first_session_idx" ON "sessions"("is_first_session");

-- CreateIndex
CREATE INDEX "sessions_session_completed_idx" ON "sessions"("session_completed");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_aggregates_tutor_id_key" ON "tutor_aggregates"("tutor_id");

-- CreateIndex
CREATE INDEX "tutor_aggregates_churn_risk_level_idx" ON "tutor_aggregates"("churn_risk_level");

-- CreateIndex
CREATE INDEX "tutor_aggregates_churn_probability_idx" ON "tutor_aggregates"("churn_probability");

-- CreateIndex
CREATE INDEX "tutor_aggregates_poor_first_session_flag_idx" ON "tutor_aggregates"("poor_first_session_flag");

-- CreateIndex
CREATE INDEX "alerts_tutor_id_idx" ON "alerts"("tutor_id");

-- CreateIndex
CREATE INDEX "alerts_severity_idx" ON "alerts"("severity");

-- CreateIndex
CREATE INDEX "alerts_category_idx" ON "alerts"("category");

-- CreateIndex
CREATE INDEX "alerts_is_acknowledged_idx" ON "alerts"("is_acknowledged");

-- CreateIndex
CREATE INDEX "alerts_is_resolved_idx" ON "alerts"("is_resolved");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX "interventions_tutor_id_idx" ON "interventions"("tutor_id");

-- CreateIndex
CREATE INDEX "interventions_intervention_type_idx" ON "interventions"("intervention_type");

-- CreateIndex
CREATE INDEX "interventions_status_idx" ON "interventions"("status");

-- CreateIndex
CREATE INDEX "interventions_sent_at_idx" ON "interventions"("sent_at");

-- CreateIndex
CREATE INDEX "interventions_experiment_id_idx" ON "interventions"("experiment_id");

-- CreateIndex
CREATE INDEX "interventions_created_at_idx" ON "interventions"("created_at");

-- CreateIndex
CREATE INDEX "engagement_events_tutor_id_idx" ON "engagement_events"("tutor_id");

-- CreateIndex
CREATE INDEX "engagement_events_event_type_idx" ON "engagement_events"("event_type");

-- CreateIndex
CREATE INDEX "engagement_events_timestamp_idx" ON "engagement_events"("timestamp");

-- CreateIndex
CREATE INDEX "engagement_events_tutor_id_timestamp_idx" ON "engagement_events"("tutor_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "experiments_name_key" ON "experiments"("name");

-- CreateIndex
CREATE INDEX "experiments_status_idx" ON "experiments"("status");

-- CreateIndex
CREATE INDEX "experiments_start_date_idx" ON "experiments"("start_date");

-- CreateIndex
CREATE INDEX "experiments_end_date_idx" ON "experiments"("end_date");

-- CreateIndex
CREATE INDEX "experiment_assignments_experiment_id_idx" ON "experiment_assignments"("experiment_id");

-- CreateIndex
CREATE INDEX "experiment_assignments_tutor_id_idx" ON "experiment_assignments"("tutor_id");

-- CreateIndex
CREATE INDEX "experiment_assignments_variant_idx" ON "experiment_assignments"("variant");

-- CreateIndex
CREATE INDEX "experiment_assignments_assigned_at_idx" ON "experiment_assignments"("assigned_at");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_assignments_experiment_id_tutor_id_key" ON "experiment_assignments"("experiment_id", "tutor_id");

-- CreateIndex
CREATE INDEX "pattern_insights_pattern_type_idx" ON "pattern_insights"("pattern_type");

-- CreateIndex
CREATE INDEX "pattern_insights_confidence_score_idx" ON "pattern_insights"("confidence_score");

-- CreateIndex
CREATE INDEX "pattern_insights_status_idx" ON "pattern_insights"("status");

-- CreateIndex
CREATE INDEX "pattern_insights_discovered_at_idx" ON "pattern_insights"("discovered_at");

-- CreateIndex
CREATE INDEX "pattern_insights_analyzed_period_start_analyzed_period_end_idx" ON "pattern_insights"("analyzed_period_start", "analyzed_period_end");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("tutor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_aggregates" ADD CONSTRAINT "tutor_aggregates_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("tutor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("tutor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interventions" ADD CONSTRAINT "interventions_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("tutor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "engagement_events" ADD CONSTRAINT "engagement_events_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("tutor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_assignments" ADD CONSTRAINT "experiment_assignments_experiment_id_fkey" FOREIGN KEY ("experiment_id") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_assignments" ADD CONSTRAINT "experiment_assignments_tutor_id_fkey" FOREIGN KEY ("tutor_id") REFERENCES "tutors"("tutor_id") ON DELETE RESTRICT ON UPDATE CASCADE;

