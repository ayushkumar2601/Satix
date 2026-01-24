import { NextResponse } from 'next/server'
import { initializeMLModel, getMLInitStatus } from '@/lib/services/ml-initialization'
import { getDatasetStats, getDatasetBreakdown } from '@/lib/data/training-dataset'

/**
 * GET /api/ml/init
 * Get ML initialization status
 */
export async function GET() {
  try {
    const status = await getMLInitStatus()
    const datasetStats = getDatasetStats()
    const breakdown = getDatasetBreakdown()
    
    return NextResponse.json({
      success: true,
      status,
      dataset: {
        stats: datasetStats,
        breakdown
      }
    })
  } catch (error) {
    console.error('[ML Init API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to get init status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ml/init
 * Manually trigger ML initialization
 */
export async function POST() {
  try {
    const result = await initializeMLModel()
    return NextResponse.json(result)
  } catch (error) {
    console.error('[ML Init API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to initialize model' },
      { status: 500 }
    )
  }
}
