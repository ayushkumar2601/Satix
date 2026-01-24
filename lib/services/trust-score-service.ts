'use server'

import { createClient } from '@/lib/supabase/server'
import { extractAllFeatures } from './feature-extraction'
import { AlternativeCreditScoringModel } from '../models/credit-scoring-model'
import { MLCreditScoringModel } from '../models/ml-credit-model'
import { initializeMLModel } from './ml-initialization'

export interface LoanEligibility {
  min_amount: number
  max_amount: number
  interest_rate: number
  recommended_tenure_months?: number
}

/**
 * Calculate and save trust score for a user
 * Uses ML model if trained, otherwise falls back to rule-based model
 * Auto-initializes ML model on first use
 */
export async function calculateAndSaveTrustScore(userId: string) {
  console.log('[Trust Score Service] Starting calculation for user:', userId)

  try {
    // Auto-initialize ML model if not already done
    await initializeMLModel()

    // Step 1: Extract deterministic features from user data
    const features = await extractAllFeatures(userId)
    console.log('[Trust Score Service] Features extracted:', features)

    // Step 2: Check if ML model is trained
    const mlStats = MLCreditScoringModel.getModelStats()
    const useMLModel = mlStats.training_samples >= 10 // Use ML if we have at least 10 training samples

    let trustScore: number
    let componentScores: any
    let explanations: any
    let loanEligibility: any
    let modelUsed: string
    let mlOutput: any = null

    if (useMLModel) {
      // Use ML Model
      console.log('[Trust Score Service] Using ML model with', mlStats.training_samples, 'training samples')
      mlOutput = await MLCreditScoringModel.calculateTrustScore(features)
      
      trustScore = mlOutput.trust_score
      componentScores = {
        utility_score: mlOutput.learned_weights.utility * 100,
        upi_velocity_score: mlOutput.learned_weights.upi * 100,
        location_stability_score: mlOutput.learned_weights.location * 100,
        social_graph_score: mlOutput.learned_weights.social * 100
      }
      
      // Use rule-based model for explanations and eligibility
      const ruleBasedOutput = AlternativeCreditScoringModel.calculateTrustScore(features)
      explanations = ruleBasedOutput.explanations
      loanEligibility = ruleBasedOutput.loan_eligibility
      modelUsed = `ML Model v${mlOutput.model_version} (${mlOutput.training_samples} samples)`
      
    } else {
      // Use Rule-Based Model
      console.log('[Trust Score Service] Using rule-based model (ML not trained yet)')
      const modelOutput = AlternativeCreditScoringModel.calculateTrustScore(features)
      
      trustScore = modelOutput.trust_score
      componentScores = modelOutput.component_scores
      explanations = modelOutput.explanations
      loanEligibility = modelOutput.loan_eligibility
      modelUsed = 'Rule-Based Model v1.0'
    }

    // Step 3: Save to database
    const supabase = await createClient()

    // Save to trust_score_calculations log
    const { error: calcError } = await supabase
      .from('trust_score_calculations')
      .insert({
        user_id: userId,
        trust_score: trustScore,
        utility_score: componentScores.utility_score / 100 || componentScores.utility_score,
        upi_score: componentScores.upi_velocity_score / 100 || componentScores.upi_velocity_score,
        location_score: componentScores.location_stability_score / 100 || componentScores.location_stability_score,
        social_score: componentScores.social_graph_score / 100 || componentScores.social_graph_score,
        explanations: explanations,
        features_used: features,
        gemini_used: false,
        fallback_used: !useMLModel
      })

    if (calcError) {
      console.error('[Trust Score Service] Error saving calculation:', calcError)
    }

    // Update profile with latest score
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        trust_score: trustScore,
        score_breakdown: {
          utility_score: componentScores.utility_score / 100 || componentScores.utility_score,
          upi_score: componentScores.upi_velocity_score / 100 || componentScores.upi_velocity_score,
          location_score: componentScores.location_stability_score / 100 || componentScores.location_stability_score,
          social_score: componentScores.social_graph_score / 100 || componentScores.social_graph_score
        },
        score_last_updated: new Date().toISOString(),
        loan_eligibility_min: loanEligibility.min_amount,
        loan_eligibility_max: loanEligibility.max_amount,
        interest_rate: loanEligibility.interest_rate
      })
      .eq('id', userId)

    if (profileError) {
      console.error('[Trust Score Service] Error updating profile:', profileError)
      return { error: profileError.message }
    }

    // Add to score history
    const { error: historyError } = await supabase
      .from('score_history')
      .insert({
        user_id: userId,
        score: trustScore,
        breakdown: {
          utility_score: componentScores.utility_score / 100 || componentScores.utility_score,
          upi_score: componentScores.upi_velocity_score / 100 || componentScores.upi_velocity_score,
          location_score: componentScores.location_stability_score / 100 || componentScores.location_stability_score,
          social_score: componentScores.social_graph_score / 100 || componentScores.social_graph_score
        }
      })

    if (historyError) {
      console.error('[Trust Score Service] Error saving history:', historyError)
    }

    console.log('[Trust Score Service] Successfully calculated and saved trust score:', trustScore)
    console.log('[Trust Score Service] Model used:', modelUsed)

    return {
      success: true,
      trust_score: trustScore,
      risk_category: mlOutput?.risk_category,
      confidence_level: mlOutput?.confidence,
      default_probability: mlOutput?.default_probability,
      sub_scores: {
        utility: componentScores.utility_score / 100 || componentScores.utility_score,
        upi: componentScores.upi_velocity_score / 100 || componentScores.upi_velocity_score,
        location: componentScores.location_stability_score / 100 || componentScores.location_stability_score,
        social: componentScores.social_graph_score / 100 || componentScores.social_graph_score
      },
      component_scores: componentScores,
      explanations: explanations,
      eligibility: loanEligibility,
      model_used: modelUsed,
      ml_enabled: useMLModel,
      training_samples: mlStats.training_samples
    }

  } catch (error) {
    console.error('[Trust Score Service] Error:', error)
    return { error: 'Failed to calculate trust score' }
  }
}

/**
 * Get user's current trust score and details
 */
export async function getUserTrustScore(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    return { error: 'Profile not found' }
  }

  // Get latest calculation details
  const { data: calculation } = await supabase
    .from('trust_score_calculations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return {
    success: true,
    trust_score: profile.trust_score,
    score_breakdown: profile.score_breakdown,
    score_last_updated: profile.score_last_updated,
    loan_eligibility_min: profile.loan_eligibility_min,
    loan_eligibility_max: profile.loan_eligibility_max,
    interest_rate: profile.interest_rate,
    explanations: calculation?.explanations,
    gemini_used: calculation?.gemini_used,
    fallback_used: calculation?.fallback_used
  }
}

/**
 * Get score history for a user
 */
export async function getScoreHistory(userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('score_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) {
    return { error: error.message }
  }

  return { success: true, history: data }
}
