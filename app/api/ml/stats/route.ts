import { NextResponse } from 'next/server'
import { getMLModelStats } from '@/lib/services/ml-training-service'

/**
 * GET /api/ml/stats
 * Get ML model statistics
 */
export async function GET() {
  try {
    const result = await getMLModelStats()
    return NextResponse.json(result)
  } catch (error) {
    console.error('[ML Stats API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get model stats' },
      { status: 500 }
    )
  }
}
