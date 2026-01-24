'use server'

import { createClient } from '@/lib/supabase/server'
import { MLCreditScoringModel, LoanOutcome } from '../models/ml-credit-model'

/**
 * Record loan outcome for ML training
 */
export async function recordLoanOutcome(
  userId: string,
  loanId: string,
  repaid: boolean,
  repaymentRate?: number
) {
  console.log('[ML Training] Recording loan outcome for user:', userId)

  try {
    const supabase = await createClient()

    // Get the trust score calculation that was used for this loan
    const { data: calculation } = await supabase
      .from('trust_score_calculations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!calculation) {
      return { error: 'No trust score calculation found' }
    }

    // Get loan details
    const { data: loan } = await supabase
      .from('loans')
      .select('*')
      .eq('id', loanId)
      .single()

    if (!loan) {
      return { error: 'Loan not found' }
    }

    // Create loan outcome record
    const outcome: LoanOutcome = {
      user_id: userId,
      trust_score: calculation.trust_score,
      component_scores: {
        utility: calculation.utility_score * 100,
        upi: calculation.upi_score * 100,
        location: calculation.location_score * 100,
        social: calculation.social_score * 100
      },
      loan_amount: loan.amount,
      repaid: repaid,
      default: !repaid,
      repayment_rate: repaymentRate,
      created_at: new Date().toISOString()
    }

    // Save to database
    const { error: saveError } = await supabase
      .from('loan_outcomes')
      .insert({
        user_id: userId,
        loan_id: loanId,
        trust_score: outcome.trust_score,
        component_scores: outcome.component_scores,
        loan_amount: outcome.loan_amount,
        repaid: outcome.repaid,
        default_occurred: outcome.default,
        repayment_rate: outcome.repayment_rate
      })

    if (saveError) {
      console.error('[ML Training] Error saving outcome:', saveError)
      return { error: saveError.message }
    }

    // Train ML model with this outcome
    await MLCreditScoringModel.learnFromOutcome(outcome)

    console.log('[ML Training] Successfully recorded and learned from outcome')

    return {
      success: true,
      message: 'Loan outcome recorded and model updated'
    }

  } catch (error) {
    console.error('[ML Training] Error:', error)
    return { error: 'Failed to record loan outcome' }
  }
}

/**
 * Batch train model from historical loan outcomes
 */
export async function trainModelFromHistory() {
  console.log('[ML Training] Starting batch training from historical data')

  try {
    const supabase = await createClient()

    // Get all historical loan outcomes
    const { data: outcomes, error } = await supabase
      .from('loan_outcomes')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('[ML Training] Error fetching outcomes:', error)
      return { error: error.message }
    }

    if (!outcomes || outcomes.length === 0) {
      return { 
        success: true, 
        message: 'No historical data available for training',
        samples_trained: 0
      }
    }

    // Convert to LoanOutcome format
    const loanOutcomes: LoanOutcome[] = outcomes.map(o => ({
      user_id: o.user_id,
      trust_score: o.trust_score,
      component_scores: o.component_scores,
      loan_amount: o.loan_amount,
      repaid: o.repaid,
      default: o.default_occurred,
      repayment_rate: o.repayment_rate,
      created_at: o.created_at
    }))

    // Train model
    await MLCreditScoringModel.trainFromHistory(loanOutcomes)

    // Save model stats
    const stats = MLCreditScoringModel.getModelStats()
    await supabase
      .from('ml_model_stats')
      .insert({
        weights: stats.weights,
        coefficients: stats.coefficients,
        training_samples: stats.training_samples,
        model_version: stats.model_version,
        learning_rate: stats.learning_rate
      })

    console.log('[ML Training] Batch training complete')

    return {
      success: true,
      message: 'Model trained successfully',
      samples_trained: loanOutcomes.length,
      learned_weights: stats.weights,
      training_samples: stats.training_samples
    }

  } catch (error) {
    console.error('[ML Training] Error:', error)
    return { error: 'Failed to train model' }
  }
}

/**
 * Get ML model statistics
 */
export async function getMLModelStats() {
  const stats = MLCreditScoringModel.getModelStats()
  
  return {
    success: true,
    stats: {
      current_weights: stats.weights,
      coefficients: stats.coefficients,
      training_samples: stats.training_samples,
      model_version: stats.model_version,
      learning_rate: stats.learning_rate,
      confidence: Math.min(stats.training_samples / 1000, 1.0) * 100
    }
  }
}

/**
 * Simulate loan outcomes for demo/testing
 */
export async function simulateLoanOutcomes(count: number = 100) {
  console.log('[ML Training] Simulating', count, 'loan outcomes for demo')

  const outcomes: LoanOutcome[] = []

  for (let i = 0; i < count; i++) {
    // Generate random but realistic outcomes
    const trustScore = 300 + Math.random() * 600
    
    // Higher trust score = higher repayment probability
    const repaymentProb = (trustScore - 300) / 600
    const repaid = Math.random() < repaymentProb

    const outcome: LoanOutcome = {
      user_id: `demo_user_${i}`,
      trust_score: Math.round(trustScore),
      component_scores: {
        utility: Math.random() * 100,
        upi: Math.random() * 100,
        location: Math.random() * 100,
        social: Math.random() * 100
      },
      loan_amount: 5000 + Math.random() * 20000,
      repaid: repaid,
      default: !repaid,
      repayment_rate: repaid ? 0.9 + Math.random() * 0.1 : Math.random() * 0.5,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    }

    outcomes.push(outcome)
  }

  // Train model with simulated data
  await MLCreditScoringModel.trainFromHistory(outcomes)

  const stats = MLCreditScoringModel.getModelStats()

  return {
    success: true,
    message: `Simulated ${count} loan outcomes and trained model`,
    samples_trained: count,
    learned_weights: stats.weights,
    training_samples: stats.training_samples
  }
}
