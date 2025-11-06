import { prisma } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test query
    const tutorCount = await prisma.tutor.count()
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected!',
      tutorCount 
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}


