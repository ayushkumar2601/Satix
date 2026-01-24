/**
 * Alternative Credit Scoring Model
 * 
 * This model assesses creditworthiness using non-traditional data:
 * - Utility bill payments
 * - UPI transaction velocity
 * - Geolocation stability
 * - Social graph analysis
 * 
 * Output: Trust Score (300-900) for micro-lending decisions
 */

import { ExtractedFeatures } from '../services/feature-extraction'

export interface TrustScoreOutput {
  trust_score: number
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  component_scores: {
    utility_score: number
    upi_velocity_score: number
    location_stability_score: number
    social_graph_score: number
  }
  weighted_scores: {
    utility_weighted: number
    upi_weighted: number
    location_weighted: number
    social_weighted: number
  }
  explanations: {
    utility: string
    upi: string
    location: string
    social: string
  }
  loan_eligibility: {
    min_amount: number
    max_amount: number
    interest_rate: number
    recommended_tenure_months: number
  }
  confidence_level: number
}

/**
 * Model Weights - Based on credit risk research
 * Total = 100%
 */
const MODEL_WEIGHTS = {
  UTILITY_PAYMENT: 0.35,      // 35% - Most reliable indicator
  UPI_VELOCITY: 0.30,         // 30% - Transaction behavior
  LOCATION_STABILITY: 0.20,   // 20% - Residential stability
  SOCIAL_GRAPH: 0.15          // 15% - Network trust
}

/**
 * Score Thresholds
 */
const SCORE_THRESHOLDS = {
  EXCELLENT: 750,
  GOOD: 650,
  FAIR: 550,
  POOR: 450
}

/**
 * Main Credit Scoring Model
 */
export class AlternativeCreditScoringModel {
  
  /**
   * Calculate Trust Score from extracted features
   */
  static calculateTrustScore(features: ExtractedFeatures): TrustScoreOutput {
    // 1. Calculate component scores (0-100 scale)
    const utilityScore = this.calculateUtilityScore(features.utility)
    const upiVelocityScore = this.calculateUPIVelocityScore(features.upi)
    const locationScore = this.calculateLocationStabilityScore(features.location)
    const socialScore = this.calculateSocialGraphScore(features.social)

    // 2. Apply weights
    const weightedScores = {
      utility_weighted: utilityScore * MODEL_WEIGHTS.UTILITY_PAYMENT,
      upi_weighted: upiVelocityScore * MODEL_WEIGHTS.UPI_VELOCITY,
      location_weighted: locationScore * MODEL_WEIGHTS.LOCATION_STABILITY,
      social_weighted: socialScore * MODEL_WEIGHTS.SOCIAL_GRAPH
    }

    // 3. Calculate composite score (0-100)
    const compositeScore = 
      weightedScores.utility_weighted +
      weightedScores.upi_weighted +
      weightedScores.location_weighted +
      weightedScores.social_weighted

    // 4. Transform to Trust Score (300-900 range)
    const trustScore = Math.round(300 + (compositeScore / 100) * 600)

    // 5. Determine risk category
    const riskCategory = this.determineRiskCategory(trustScore)

    // 6. Calculate confidence level
    const confidenceLevel = this.calculateConfidenceLevel(features)

    // 7. Calculate loan eligibility
    const loanEligibility = this.calculateLoanEligibility(trustScore, confidenceLevel)

    // 8. Generate explanations
    const explanations = {
      utility: this.generateUtilityExplanation(features.utility, utilityScore),
      upi: this.generateUPIExplanation(features.upi, upiVelocityScore),
      location: this.generateLocationExplanation(features.location, locationScore),
      social: this.generateSocialExplanation(features.social, socialScore)
    }

    return {
      trust_score: trustScore,
      risk_category: riskCategory,
      component_scores: {
        utility_score: Math.round(utilityScore),
        upi_velocity_score: Math.round(upiVelocityScore),
        location_stability_score: Math.round(locationScore),
        social_graph_score: Math.round(socialScore)
      },
      weighted_scores: {
        utility_weighted: Math.round(weightedScores.utility_weighted * 100) / 100,
        upi_weighted: Math.round(weightedScores.upi_weighted * 100) / 100,
        location_weighted: Math.round(weightedScores.location_weighted * 100) / 100,
        social_weighted: Math.round(weightedScores.social_weighted * 100) / 100
      },
      explanations,
      loan_eligibility: loanEligibility,
      confidence_level: Math.round(confidenceLevel * 100)
    }
  }

  /**
   * 1. UTILITY BILL PAYMENT SCORE (0-100)
   * Analyzes payment discipline and consistency
   */
  private static calculateUtilityScore(utility: any): number {
    if (utility.months_tracked === 0) return 0

    let score = 0

    // Base score from on-time payment ratio (0-50 points)
    score += utility.on_time_ratio * 50

    // Penalty for missed payments (up to -20 points)
    const missedPenalty = Math.min(utility.missed_payments * 5, 20)
    score -= missedPenalty

    // Bonus for payment history length (0-20 points)
    if (utility.months_tracked >= 12) score += 20
    else if (utility.months_tracked >= 6) score += 15
    else if (utility.months_tracked >= 3) score += 10
    else score += 5

    // Bonus for average payment amount consistency (0-10 points)
    if (utility.avg_payment_amount > 0) {
      score += 10
    }

    // Bonus for zero late payments (0-10 points)
    if (utility.missed_payments === 0 && utility.months_tracked >= 6) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 2. UPI TRANSACTION VELOCITY SCORE (0-100)
   * Analyzes transaction patterns and financial behavior
   */
  private static calculateUPIVelocityScore(upi: any): number {
    if (upi.avg_transactions_per_day === 0) return 0

    let score = 0

    // Transaction frequency score (0-25 points)
    const txnFrequency = Math.min(upi.avg_transactions_per_day / 10, 1)
    score += txnFrequency * 25

    // Income consistency score (0-30 points)
    const incomeScore = 
      upi.income_consistency === 'high' ? 30 :
      upi.income_consistency === 'medium' ? 20 : 10
    score += incomeScore

    // Transaction variance score (0-20 points)
    const varianceScore = 
      upi.transaction_variance === 'low' ? 20 :
      upi.transaction_variance === 'medium' ? 12 : 5
    score += varianceScore

    // Cash flow health (0-15 points)
    if (upi.avg_monthly_income > 0 && upi.avg_monthly_expense > 0) {
      const cashFlowRatio = upi.avg_monthly_income / upi.avg_monthly_expense
      if (cashFlowRatio >= 1.3) score += 15      // 30% surplus
      else if (cashFlowRatio >= 1.1) score += 10 // 10% surplus
      else if (cashFlowRatio >= 1.0) score += 5  // Break-even
    }

    // Regular income pattern bonus (0-10 points)
    if (upi.income_consistency === 'high' && upi.avg_monthly_income > 5000) {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 3. GEOLOCATION STABILITY SCORE (0-100)
   * Analyzes residential stability
   */
  private static calculateLocationStabilityScore(location: any): number {
    let score = 0

    // Base stability score (0-50 points)
    score += location.stability_score * 50

    // Duration at location (0-30 points)
    if (location.months_at_location >= 24) score += 30      // 2+ years
    else if (location.months_at_location >= 12) score += 20 // 1+ year
    else if (location.months_at_location >= 6) score += 10  // 6+ months
    else score += 5

    // Address verification bonus (0-20 points)
    if (location.months_at_location >= 6) {
      score += 20 // Verified stable address
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * 4. SOCIAL GRAPH ANALYSIS SCORE (0-100)
   * Analyzes trust network and social connections
   */
  private static calculateSocialGraphScore(social: any): number {
    let score = 0

    // Network strength (0-40 points)
    const networkScore = 
      social.network_strength === 'high' ? 40 :
      social.network_strength === 'medium' ? 25 : 10
    score += networkScore

    // Trust connections (0-30 points)
    const connectionsScore = Math.min(social.trust_connections * 3, 30)
    score += connectionsScore

    // Referrals (0-20 points)
    const referralScore = Math.min(social.referrals_count * 5, 20)
    score += referralScore

    // Network diversity bonus (0-10 points)
    if (social.trust_connections >= 5 && social.network_strength !== 'low') {
      score += 10
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Determine risk category based on trust score
   */
  private static determineRiskCategory(trustScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    if (trustScore >= SCORE_THRESHOLDS.EXCELLENT) return 'LOW'
    if (trustScore >= SCORE_THRESHOLDS.GOOD) return 'MEDIUM'
    if (trustScore >= SCORE_THRESHOLDS.FAIR) return 'HIGH'
    return 'VERY_HIGH'
  }

  /**
   * Calculate confidence level based on data completeness
   */
  private static calculateConfidenceLevel(features: ExtractedFeatures): number {
    let confidence = 0
    let maxConfidence = 0

    // Utility data confidence (0-0.35)
    maxConfidence += 0.35
    if (features.utility.months_tracked >= 6) confidence += 0.35
    else if (features.utility.months_tracked >= 3) confidence += 0.25
    else if (features.utility.months_tracked > 0) confidence += 0.15

    // UPI data confidence (0-0.30)
    maxConfidence += 0.30
    if (features.upi.avg_transactions_per_day >= 3) confidence += 0.30
    else if (features.upi.avg_transactions_per_day >= 1) confidence += 0.20
    else if (features.upi.avg_transactions_per_day > 0) confidence += 0.10

    // Location data confidence (0-0.20)
    maxConfidence += 0.20
    if (features.location.months_at_location >= 6) confidence += 0.20
    else if (features.location.months_at_location >= 3) confidence += 0.15
    else if (features.location.months_at_location > 0) confidence += 0.10

    // Social data confidence (0-0.15)
    maxConfidence += 0.15
    if (features.social.trust_connections >= 3) confidence += 0.15
    else if (features.social.trust_connections >= 1) confidence += 0.10
    else confidence += 0.05

    return confidence / maxConfidence
  }

  /**
   * Calculate loan eligibility based on trust score and confidence
   */
  private static calculateLoanEligibility(trustScore: number, confidence: number) {
    let minAmount = 0
    let maxAmount = 0
    let interestRate = 0
    let tenure = 0

    // Base eligibility on trust score
    if (trustScore >= 750) {
      minAmount = 10000
      maxAmount = 50000
      interestRate = 12
      tenure = 12
    } else if (trustScore >= 650) {
      minAmount = 5000
      maxAmount = 25000
      interestRate = 15
      tenure = 9
    } else if (trustScore >= 550) {
      minAmount = 2000
      maxAmount = 10000
      interestRate = 18
      tenure = 6
    } else if (trustScore >= 450) {
      minAmount = 1000
      maxAmount = 5000
      interestRate = 22
      tenure = 3
    } else {
      minAmount = 0
      maxAmount = 2000
      interestRate = 24
      tenure = 3
    }

    // Adjust based on confidence level
    maxAmount = Math.round(maxAmount * confidence)
    minAmount = Math.min(minAmount, maxAmount)

    return {
      min_amount: minAmount,
      max_amount: maxAmount,
      interest_rate: interestRate,
      recommended_tenure_months: tenure
    }
  }

  /**
   * Generate human-readable explanations
   */
  private static generateUtilityExplanation(utility: any, score: number): string {
    if (utility.months_tracked === 0) return 'No utility payment history available'
    if (score >= 80) return 'Excellent payment discipline with consistent on-time payments'
    if (score >= 60) return 'Good payment history with occasional delays'
    if (score >= 40) return 'Moderate payment consistency with some missed payments'
    return 'Limited payment history or frequent delays detected'
  }

  private static generateUPIExplanation(upi: any, score: number): string {
    if (upi.avg_transactions_per_day === 0) return 'No UPI transaction history available'
    if (score >= 80) return 'Highly stable transaction patterns with consistent income'
    if (score >= 60) return 'Stable transaction activity with moderate income consistency'
    if (score >= 40) return 'Moderate transaction activity with some variance'
    return 'Limited transaction history or high income volatility'
  }

  private static generateLocationExplanation(location: any, score: number): string {
    if (location.months_at_location === 0) return 'No location stability data available'
    if (score >= 80) return 'Strong residential stability over extended period'
    if (score >= 60) return 'Good location stability with established residence'
    if (score >= 40) return 'Moderate residential stability'
    return 'Limited location history or recent relocation'
  }

  private static generateSocialExplanation(social: any, score: number): string {
    if (score >= 80) return 'Strong trusted network with multiple verified connections'
    if (score >= 60) return 'Good social trust network with some connections'
    if (score >= 40) return 'Moderate social network presence'
    return 'Limited social trust network or new user'
  }
}
