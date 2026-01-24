import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    let profileResult = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If profile doesn't exist, create it
    if (profileResult.error && profileResult.error.code === 'PGRST116') {
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
      } else {
        // Fetch the newly created profile
        profileResult = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
      }
    }

    // Get score history
    const { data: scoreHistory } = await supabase
      .from('score_history')
      .select('score, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(12)

    // Get active loans
    const { data: loans } = await supabase
      .from('loans')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    // Get recent transactions
    const { data: transactions } = await supabase
      .from('upi_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(10)

    // Get utility bills
    const { data: bills } = await supabase
      .from('utility_bills')
      .select('*')
      .eq('user_id', user.id)
      .order('due_date', { ascending: false })
      .limit(10)

    return NextResponse.json({
      success: true,
      profile: profileResult.data || {
        trust_score: 0,
        loan_eligibility_min: 0,
        loan_eligibility_max: 0,
        interest_rate: 0
      },
      score_history: scoreHistory || [],
      loans: loans || [],
      transactions: transactions || [],
      bills: bills || []
    })

  } catch (error) {
    console.error('[API] Error getting dashboard data:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
