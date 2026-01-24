import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { calculateAndSaveTrustScore } from '@/lib/services/trust-score-service'
import { checkUserHasData, seedDemoData } from '@/lib/services/data-seeding'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { seed_demo_data } = body

    // Check if user has data
    const dataCheck = await checkUserHasData(user.id)

    // If no data and seed_demo_data is true, seed demo data
    if (!dataCheck.has_any_data && seed_demo_data) {
      console.log('[API] Seeding demo data for user:', user.id)
      await seedDemoData(user.id)
    }

    // Calculate trust score
    const result = await calculateAndSaveTrustScore(user.id)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('[API] Error calculating trust score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
