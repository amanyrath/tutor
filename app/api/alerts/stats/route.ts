import { NextResponse } from 'next/server';
import { getAlertStatistics } from '@/lib/alerts/generator';

/**
 * GET /api/alerts/stats
 * Get alert statistics
 */
export async function GET() {
  try {
    const stats = await getAlertStatistics();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching alert statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert statistics' },
      { status: 500 }
    );
  }
}

