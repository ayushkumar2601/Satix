import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUserTrustScore } from '@/lib/services/trust-score-service'

export async function GET() {
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

    // Try to get profile
    let profile = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it
    if (profile.error && profile.error.code === 'PGRST116') {
      console.log('[API] Profile not found, creating new profile for user:', user.id)
      
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString()
        })

      if (insertError) {
        console.error('[API] Error creating profile:', insertError)
        return NextResponse.json(
          { error: 'Failed to create profile' },
          { status: 500 }
        )
      }

      // Fetch the newly created profile
      profile = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
    }

    if (profile.error || !profile.data) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get latest calculation details
    const { data: calculation } = await supabase
      .from('trust_score_calculations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      success: true,
      trust_score: profile.data.trust_score,
      score_breakdown: profile.data.score_breakdown,
      score_last_updated: profile.data.score_last_updated,
      loan_eligibility_min: profile.data.loan_eligibility_min,
      loan_eligibility_max: profile.data.loan_eligibility_max,
      interest_rate: profile.data.interest_rate,
      explanations: calculation?.explanations,
      gemini_used: calculation?.gemini_used,
      fallback_used: calculation?.fallback_used
    })

  } catch (error) {
    console.error('[API] Error getting trust score:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
