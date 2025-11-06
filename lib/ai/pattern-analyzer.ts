/**
 * AI Pattern Analyzer
 * 
 * Uses Claude/GPT to analyze tutor data and discover patterns
 * Supports OpenAI, Anthropic, and OpenRouter
 */

// Load environment variables first
import { config } from 'dotenv'
config()

import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { 
  PATTERN_ANALYSIS_SYSTEM_PROMPT, 
  generatePatternAnalysisPrompt,
  NOSHOW_PREDICTION_PROMPT,
  generateNoShowPredictionPrompt,
  INTERVENTION_RECOMMENDATION_PROMPT,
  generateInterventionPrompt
} from './prompts'

// Determine which AI provider to use
const openaiKey = process.env.OPENAI_API_KEY
const openrouterKey = process.env.OPENROUTER_API_KEY
const anthropicKey = process.env.ANTHROPIC_API_KEY

const aiProvider = openaiKey ? 'openai' : openrouterKey ? 'openrouter' : anthropicKey ? 'anthropic' : null

// Initialize OpenAI client
const openai = openaiKey
  ? new OpenAI({ apiKey: openaiKey })
  : null

// Initialize Anthropic client (for OpenRouter and direct Anthropic)
const anthropic = (openrouterKey || anthropicKey)
  ? new Anthropic({ 
      apiKey: openrouterKey || anthropicKey,
      baseURL: openrouterKey ? 'https://openrouter.ai/api/v1' : undefined,
      defaultHeaders: openrouterKey ? {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Tutor Quality Platform'
      } : undefined
    })
  : null

// Get correct model name based on provider
const getModelName = () => {
  if (aiProvider === 'openai') return 'gpt-4o'
  if (aiProvider === 'openrouter') return 'anthropic/claude-3.5-sonnet'
  return 'claude-3-5-sonnet-20241022'
}

export interface PatternAnalysisResult {
  patterns: Array<{
    type: 'engagement_increase' | 'engagement_decrease' | 'quality_improvement' | 'churn_risk'
    title: string
    description: string
    affected_tutors: string[]
    confidence: number
    statistical_significance: number
    correlations: Record<string, number>
    recommendation: string
    expected_impact: string
  }>
  summary: string
  priority_actions: string[]
}

export interface NoShowPrediction {
  risk_factors: Array<{
    factor: string
    weight: number
    explanation: string
  }>
  high_risk_sessions: Array<{
    session_id: string
    risk_score: number
    primary_risks: string[]
    mitigation: string
  }>
  recommendations: string[]
}

export interface InterventionRecommendations {
  interventions: Array<{
    type: 'engagement' | 'quality' | 'technical' | 'training'
    priority: 'critical' | 'high' | 'medium' | 'low'
    title: string
    description: string
    expected_outcome: string
    success_metrics: string[]
    timeline: string
  }>
}

/**
 * Analyze patterns using AI (OpenAI or Claude)
 */
export async function analyzePatterns(data: {
  weekOverWeekComparison: any
  topPerformers: any[]
  decliningTutors: any[]
  correlationMatrix: Record<string, Record<string, number>>
  recentInterventions?: any[]
}): Promise<PatternAnalysisResult> {
  // Check if AI is disabled (for free tier demos)
  if (process.env.DISABLE_AI === 'true') {
    console.log('AI features disabled. Returning mock pattern analysis.')
    return getMockPatternAnalysis(data)
  }

  if (!aiProvider) {
    throw new Error('AI API key not configured. Set OPENAI_API_KEY, OPENROUTER_API_KEY, or ANTHROPIC_API_KEY in your .env file')
  }

  const prompt = generatePatternAnalysisPrompt(data)

  try {
    if (aiProvider === 'openai') {
      // Use OpenAI API
      const completion = await openai!.chat.completions.create({
        model: getModelName(),
        max_tokens: 4000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: PATTERN_ANALYSIS_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = completion.choices[0].message.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const result = JSON.parse(content) as PatternAnalysisResult
      return result

    } else {
      // Use Anthropic (direct or via OpenRouter)
      const message = await anthropic!.messages.create({
        model: getModelName(),
        max_tokens: 4000,
        system: PATTERN_ANALYSIS_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response')
      }

      const result = JSON.parse(jsonMatch[0]) as PatternAnalysisResult
      return result
    }

  } catch (error) {
    console.error('Error analyzing patterns with AI:', error)
    throw error
  }
}

/**
 * Predict no-show risk using AI
 */
export async function predictNoShowRisk(data: {
  tutorHistory: any
  upcomingSessions: any[]
  historicalNoShows: any[]
}): Promise<NoShowPrediction> {
  // Check if AI is disabled (for free tier demos)
  if (process.env.DISABLE_AI === 'true') {
    console.log('AI features disabled. Returning mock no-show prediction.')
    return {
      risk_factors: [
        { factor: 'Historical no-show rate', weight: 0.4, explanation: 'Tutors with higher historical no-show rates are at greater risk' },
        { factor: 'Recent session frequency', weight: 0.3, explanation: 'Decreased session frequency correlates with no-show risk' }
      ],
      high_risk_sessions: data.upcomingSessions.slice(0, 3).map((s: any) => ({
        session_id: s.sessionId || s.id,
        risk_score: 0.65 + Math.random() * 0.2,
        primary_risks: ['Historical pattern', 'Low engagement'],
        mitigation: 'Send reminder email 24 hours before session'
      })),
      recommendations: [
        'Send proactive reminders to high-risk sessions',
        'Offer rescheduling options for at-risk tutors',
        'Monitor engagement metrics closely'
      ]
    }
  }

  if (!aiProvider) {
    throw new Error('AI API key not configured. Set OPENAI_API_KEY, OPENROUTER_API_KEY, or ANTHROPIC_API_KEY in your .env file')
  }

  const prompt = generateNoShowPredictionPrompt(data)

  try {
    if (aiProvider === 'openai') {
      // Use OpenAI API
      const completion = await openai!.chat.completions.create({
        model: getModelName(),
        max_tokens: 2000,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: NOSHOW_PREDICTION_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = completion.choices[0].message.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const result = JSON.parse(content) as NoShowPrediction
      return result

    } else {
      // Use Anthropic (direct or via OpenRouter)
      const message = await anthropic!.messages.create({
        model: getModelName(),
        max_tokens: 2000,
        system: NOSHOW_PREDICTION_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response')
      }

      const result = JSON.parse(jsonMatch[0]) as NoShowPrediction
      return result
    }

  } catch (error) {
    console.error('Error predicting no-shows with AI:', error)
    throw error
  }
}

/**
 * Generate intervention recommendations using AI
 */
export async function generateInterventionRecommendations(
  tutorProfile: any
): Promise<InterventionRecommendations> {
  // Check if AI is disabled (for free tier demos)
  if (process.env.DISABLE_AI === 'true') {
    console.log('AI features disabled. Returning mock intervention recommendations.')
    return {
      interventions: [
        {
          type: 'engagement',
          priority: 'high',
          title: 'Re-engagement Campaign',
          description: 'Targeted outreach to increase session frequency and engagement.',
          expected_outcome: '15-20% increase in session frequency within 30 days',
          success_metrics: ['Session count increase', 'Login frequency', 'Engagement score'],
          timeline: '2-4 weeks'
        }
      ]
    }
  }

  if (!aiProvider) {
    throw new Error('AI API key not configured. Set OPENAI_API_KEY, OPENROUTER_API_KEY, or ANTHROPIC_API_KEY in your .env file')
  }

  const prompt = generateInterventionPrompt(tutorProfile)

  try {
    if (aiProvider === 'openai') {
      // Use OpenAI API
      const completion = await openai!.chat.completions.create({
        model: getModelName(),
        max_tokens: 1500,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: INTERVENTION_RECOMMENDATION_PROMPT
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = completion.choices[0].message.content
      if (!content) {
        throw new Error('No content in OpenAI response')
      }

      const result = JSON.parse(content) as InterventionRecommendations
      return result

    } else {
      // Use Anthropic (direct or via OpenRouter)
      const message = await anthropic!.messages.create({
        model: getModelName(),
        max_tokens: 1500,
        system: INTERVENTION_RECOMMENDATION_PROMPT,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })

      const content = message.content[0]
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude')
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('Could not extract JSON from Claude response')
      }

      const result = JSON.parse(jsonMatch[0]) as InterventionRecommendations
      return result
    }

  } catch (error) {
    console.error('Error generating interventions with AI:', error)
    throw error
  }
}

/**
 * Test AI configuration
 */
export async function testAIConfiguration(): Promise<boolean> {
  if (!aiProvider) {
    console.error('AI API key not configured. Set OPENAI_API_KEY, OPENROUTER_API_KEY, or ANTHROPIC_API_KEY in your .env file')
    return false
  }

  try {
    if (aiProvider === 'openai') {
      // Test OpenAI
      const completion = await openai!.chat.completions.create({
        model: getModelName(),
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Respond with "OK" if you can read this message.'
          }
        ]
      })

      const content = completion.choices[0].message.content
      return !!content && content.includes('OK')

    } else {
      // Test Anthropic (direct or via OpenRouter)
      const message = await anthropic!.messages.create({
        model: getModelName(),
        max_tokens: 100,
        messages: [
          {
            role: 'user',
            content: 'Respond with "OK" if you can read this message.'
          }
        ]
      })

      const content = message.content[0]
      return content.type === 'text' && content.text.includes('OK')
    }

  } catch (error) {
    console.error('AI configuration test failed:', error)
    return false
  }
}

/**
 * Return mock pattern analysis when AI is disabled (for free tier demos)
 */
function getMockPatternAnalysis(data: {
  weekOverWeekComparison: any
  topPerformers: any[]
  decliningTutors: any[]
  correlationMatrix: Record<string, Record<string, number>>
  recentInterventions?: any[]
}): PatternAnalysisResult {
  return {
    patterns: [
      {
        type: 'engagement_increase',
        title: 'Top Performers Show Consistent Engagement',
        description: `Analysis of ${data.topPerformers.length} top-performing tutors reveals consistent engagement patterns.`,
        affected_tutors: data.topPerformers.slice(0, 5).map((t: any) => t.tutorId || t.id),
        confidence: 0.85,
        statistical_significance: 0.92,
        correlations: { engagement_score: 0.78, session_frequency: 0.65 },
        recommendation: 'Consider replicating successful engagement strategies from top performers.',
        expected_impact: 'Potential 15-20% engagement increase for similar tutors.'
      },
      {
        type: 'churn_risk',
        title: 'Declining Engagement Detected',
        description: `${data.decliningTutors.length} tutors showing declining engagement metrics.`,
        affected_tutors: data.decliningTutors.slice(0, 5).map((t: any) => t.tutorId || t.id),
        confidence: 0.75,
        statistical_significance: 0.68,
        correlations: { engagement_score: -0.45, days_since_login: 0.52 },
        recommendation: 'Implement targeted re-engagement campaigns for at-risk tutors.',
        expected_impact: 'Could reduce churn by 25-30% with timely intervention.'
      }
    ],
    summary: 'Pattern analysis completed. Key insights: Top performers maintain high engagement through consistent session frequency, while declining tutors show correlation with reduced login activity.',
    priority_actions: [
      'Replicate top performer strategies',
      'Launch re-engagement campaign for declining tutors',
      'Monitor engagement trends weekly'
    ]
  }
}


