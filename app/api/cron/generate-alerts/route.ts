import { NextRequest, NextResponse } from 'next/server'
import { generateAlerts } from '@/lib/alerts/generator'

export const runtime = 'nodejs'

// This endpoint is designed to be called by Vercel Cron or external scheduler
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret if provided
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting alert generation cron job...')
    const startTime = Date.now()

    const result = await generateAlerts()

    const duration = Date.now() - startTime

    console.log(`Alert generation completed in ${duration}ms`)

    return NextResponse.json({
      success: true,
      result,
      duration,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error in generate-alerts cron:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Alert generation failed',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}

// Allow manual triggering via POST
export async function POST(request: NextRequest) {
  return GET(request)
}
