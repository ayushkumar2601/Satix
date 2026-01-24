import { NextRequest, NextResponse } from 'next/server'
import { trainModelFromHistory, simulateLoanOutcomes } from '@/lib/services/ml-training-service'

/**
 * POST /api/ml/train
 * Train ML model from historical data or simulate training data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode, samples } = body

    if (mode === 'simulate') {
      // Simulate loan outcomes for demo/testing
      const sampleCount = samples || 100
      const result = await simulateLoanOutcomes(sampleCount)
      
      return NextResponse.json(result)
    } else {
      // Train from actual historical data
      const result = await trainModelFromHistory()
      
      return NextResponse.json(result)
    }

  } catch (error) {
    console.error('[ML Train API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to train model' },
      { status: 500 }
    )
  }
}
