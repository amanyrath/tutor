import { NextRequest, NextResponse } from 'next/server'
import {
  createCampaign,
  createSingleIntervention,
  getCampaignStats,
  getRecommendedCampaigns
} from '@/lib/interventions/builder'
import { findTargetTutors, getPredefinedSegments } from '@/lib/interventions/targeting'
import { INTERVENTION_TEMPLATES } from '@/lib/interventions/templates'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const action = searchParams.get('action')
    
    // Get available templates
    if (action === 'templates') {
      return NextResponse.json({
        templates: INTERVENTION_TEMPLATES
      })
    }
    
    // Get predefined segments
    if (action === 'segments') {
      return NextResponse.json({
        segments: getPredefinedSegments()
      })
    }
    
    // Get campaign statistics
    if (action === 'stats') {
      const campaignId = searchParams.get('campaignId') || undefined
      const stats = await getCampaignStats(campaignId)
      return NextResponse.json({ stats })
    }
    
    // Get recommended campaigns
    if (action === 'recommendations') {
      const recommendations = await getRecommendedCampaigns()
      return NextResponse.json({ recommendations })
    }
    
    return NextResponse.json({
      error: 'Invalid action. Use: templates, segments, stats, or recommendations'
    }, { status: 400 })

  } catch (error) {
    console.error('Error in interventions API:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...data } = body
    
    // Create a campaign
    if (action === 'create_campaign') {
      const result = await createCampaign(data)
      return NextResponse.json({ success: true, result })
    }
    
    // Create single intervention
    if (action === 'create_single') {
      const { tutorId, templateId, variables } = data
      const interventionId = await createSingleIntervention(tutorId, templateId, variables)
      return NextResponse.json({ success: true, interventionId })
    }
    
    // Preview targeting
    if (action === 'preview_targeting') {
      const { criteria } = data
      const result = await findTargetTutors(criteria)
      return NextResponse.json({ result })
    }
    
    return NextResponse.json({
      error: 'Invalid action. Use: create_campaign, create_single, or preview_targeting'
    }, { status: 400 })

  } catch (error) {
    console.error('Error in interventions API:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

