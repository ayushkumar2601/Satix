import { NextRequest, NextResponse } from 'next/server'
import { recordLoanOutcome } from '@/lib/services/ml-training-service'

/**
 * POST /api/ml/record-outcome
 * Record loan outcome for ML training
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, loanId, repaid, repaymentRate } = body

    if (!userId || !loanId || repaid === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, loanId, repaid' },
        { status: 400 }
      )
    }

    const result = await recordLoanOutcome(userId, loanId, repaid, repaymentRate)
    
    return NextResponse.json(result)

  } catch (error) {
    console.error('[ML Record Outcome API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to record loan outcome' },
      { status: 500 }
    )
  }
}
