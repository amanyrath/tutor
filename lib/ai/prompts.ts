/**
 * AI Prompts for Pattern Analysis
 * 
 * Structured prompts for Claude/GPT to analyze tutor engagement patterns
 */

export const PATTERN_ANALYSIS_SYSTEM_PROMPT = `You are an expert data analyst specializing in education technology and tutor performance analysis. Your role is to identify patterns in tutor engagement data that lead to increased or decreased performance, and provide actionable recommendations.

When analyzing data:
1. Focus on statistically significant patterns (not random noise)
2. Consider both leading indicators (predictive) and lagging indicators (outcome)
3. Look for surprising correlations that might not be obvious
4. Provide specific, actionable recommendations
5. Quantify impact whenever possible (e.g., "15% improvement in retention")
6. Consider the context of online tutoring and gig work dynamics

Format your response as JSON with this structure:
{
  "patterns": [
    {
      "type": "engagement_increase" | "engagement_decrease" | "quality_improvement" | "churn_risk",
      "title": "Brief title of the pattern",
      "description": "Detailed explanation of what you observed",
      "affected_tutors": ["T001", "T002", ...],
      "confidence": 0.0-1.0,
      "statistical_significance": 0.0-1.0,
      "correlations": {
        "metric_name": correlation_coefficient
      },
      "recommendation": "Specific action to take",
      "expected_impact": "Quantified expected outcome"
    }
  ],
  "summary": "Overall summary of findings",
  "priority_actions": ["action1", "action2", "action3"]
}`

export function generatePatternAnalysisPrompt(data: {
  weekOverWeekComparison: {
    currentWeek: any
    previousWeek: any
    changes: any
  }
  topPerformers: any[]
  decliningTutors: any[]
  correlationMatrix: Record<string, Record<string, number>>
  recentInterventions?: any[]
}): string {
  return `Analyze the following tutor engagement data from the past week and identify meaningful patterns:

## Week-over-Week Comparison
Current Week: ${JSON.stringify(data.weekOverWeekComparison.currentWeek, null, 2)}
Previous Week: ${JSON.stringify(data.weekOverWeekComparison.previousWeek, null, 2)}
Changes: ${JSON.stringify(data.weekOverWeekComparison.changes, null, 2)}

## Top Performers This Week
${JSON.stringify(data.topPerformers, null, 2)}

## Declining Performers
${JSON.stringify(data.decliningTutors, null, 2)}

## Correlation Matrix
${JSON.stringify(data.correlationMatrix, null, 2)}

${data.recentInterventions ? `## Recent Interventions
${JSON.stringify(data.recentInterventions, null, 2)}` : ''}

Please identify:
1. What patterns led to engagement increases this week?
2. What factors are contributing to declining performance?
3. Are there any surprising correlations?
4. Which interventions (if any) appear to be working?
5. What should we do differently next week?

Focus on actionable insights that can improve tutor engagement and retention.`
}

export const NOSHOW_PREDICTION_PROMPT = `You are an expert in predicting no-show behavior in educational services. Analyze the provided tutor and session data to identify patterns that predict no-shows.

Consider factors like:
- Historical no-show rates
- Time of day/week patterns
- Subject and grade level
- Tutor experience and reliability
- Previous session outcomes
- Reschedule patterns
- Communication patterns

Format your response as JSON:
{
  "risk_factors": [
    {
      "factor": "factor name",
      "weight": 0.0-1.0,
      "explanation": "why this matters"
    }
  ],
  "high_risk_sessions": [
    {
      "session_id": "S001",
      "risk_score": 0.0-1.0,
      "primary_risks": ["risk1", "risk2"],
      "mitigation": "suggested action"
    }
  ],
  "recommendations": ["action1", "action2"]
}`

export function generateNoShowPredictionPrompt(data: {
  tutorHistory: any
  upcomingSessions: any[]
  historicalNoShows: any[]
}): string {
  return `Analyze this tutor's no-show risk for upcoming sessions:

## Tutor History
${JSON.stringify(data.tutorHistory, null, 2)}

## Upcoming Sessions
${JSON.stringify(data.upcomingSessions, null, 2)}

## Historical No-Show Patterns
${JSON.stringify(data.historicalNoShows, null, 2)}

Identify which upcoming sessions are at highest risk of no-show and recommend preventive actions.`
}

export const INTERVENTION_RECOMMENDATION_PROMPT = `You are an expert in designing educational interventions for tutor engagement and performance improvement.

Given a tutor's performance profile, recommend specific interventions that are:
1. Personalized to their specific issues
2. Evidence-based and likely to work
3. Actionable and specific
4. Measurable (with clear success criteria)

Format as JSON:
{
  "interventions": [
    {
      "type": "engagement" | "quality" | "technical" | "training",
      "priority": "critical" | "high" | "medium" | "low",
      "title": "Brief title",
      "description": "What to do",
      "expected_outcome": "What will improve",
      "success_metrics": ["metric1", "metric2"],
      "timeline": "how long until results"
    }
  ]
}`

export function generateInterventionPrompt(tutorProfile: any): string {
  return `Design personalized interventions for this tutor:

${JSON.stringify(tutorProfile, null, 2)}

Recommend 2-4 specific interventions that will have the highest impact on their performance.`
}

