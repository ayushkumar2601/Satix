/**
 * Machine Learning Credit Scoring Model
 * 
 * This model learns from historical loan outcomes to:
 * - Optimize component weights dynamically
 * - Identify risk patterns
 * - Improve accuracy over time
 * - Predict default probability
 */

import { ExtractedFeatures } from '../services/feature-extraction'

export interface MLModelOutput {
  trust_score: number
  default_probability: number
  risk_category: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH'
  confidence: number
  learned_weights: {
    utility: number
    upi: number
    location: number
    social: number
  }
  model_version: string
  training_samples: number
}

export interface LoanOutcome {
  user_id: string
  trust_score: number
  component_scores: {
    utility: number
    upi: number
    location: number
    social: number
  }
  loan_amount: number
  repaid: boolean
  default: boolean
  days_to_default?: number
  repayment_rate?: number
  created_at: string
}

/**
 * Machine Learning Credit Scoring Model
 * Uses Logistic Regression with online learning
 */
export class MLCreditScoringModel {
  private static weights = {
    utility: 0.35,
    upi: 0.30,
    location: 0.20,
    social: 0.15
  }

  private static learningRate = 0.01
  private static trainingSamples = 0
  private static modelVersion = '1.0-ML'

  // Logistic regression coefficients (learned from data)
  private static coefficients = {
    intercept: 0,
    utility: 0.35,
    upi: 0.30,
    location: 0.20,
    social: 0.15
  }

  /**
   * Calculate Trust Score with ML enhancements
   */
  static async calculateTrustScore(features: ExtractedFeatures): Promise<MLModelOutput> {
    // Calculate component scores (0-100)
    const utilityScore = this.calculateUtilityScore(features.utility)
    const upiScore = this.calculateUPIScore(features.upi)
    const locationScore = this.calculateLocationScore(features.location)
    const socialScore = this.calculateSocialScore(features.social)

    // Normalize to 0-1 for ML model
    const normalizedScores = {
      utility: utilityScore / 100,
      upi: upiScore / 100,
      location: locationScore / 100,
      social: socialScore / 100
    }

    // Load latest learned weights from database
    await this.loadLearnedWeights()

    // Calculate weighted score using learned weights
    const weightedScore = 
      normalizedScores.utility * this.weights.utility +
      normalizedScores.upi * this.weights.upi +
      normalizedScores.location * this.weights.location +
      normalizedScores.social * this.weights.social

    // Transform to Trust Score (300-900)
    const trustScore = Math.round(300 + (weightedScore * 600))

    // Calculate default probability using logistic regression
    const defaultProbability = this.predictDefaultProbability(normalizedScores)

    // Determine risk category
    const riskCategory = this.determineRiskCategory(trustScore, defaultProbability)

    // Calculate confidence based on training samples
    const confidence = this.calculateConfidence()

    return {
      trust_score: trustScore,
      default_probability: Math.round(defaultProbability * 100) / 100,
      risk_category: riskCategory,
      confidence: Math.round(confidence * 100),
      learned_weights: { ...this.weights },
      model_version: this.modelVersion,
      training_samples: this.trainingSamples
    }
  }

  /**
   * Learn from loan outcome (Online Learning)
   */
  static async learnFromOutcome(outcome: LoanOutcome): Promise<void> {
    console.log('[ML Model] Learning from loan outcome:', outcome.user_id)

    // Normalize component scores
    const features = {
      utility: outcome.component_scores.utility / 100,
      upi: outcome.component_scores.upi / 100,
      location: outcome.component_scores.location / 100,
      social: outcome.component_scores.social / 100
    }

    // Actual outcome (0 = default, 1 = repaid)
    const actualOutcome = outcome.repaid ? 1 : 0

    // Predicted probability
    const predictedProb = this.predictDefaultProbability(features)
    const prediction = predictedProb < 0.5 ? 1 : 0

    // Calculate error
    const error = actualOutcome - prediction

    // Update weights using gradient descent
    this.weights.utility += this.learningRate * error * features.utility
    this.weights.upi += this.learningRate * error * features.upi
    this.weights.location += this.learningRate * error * features.location
    this.weights.social += this.learningRate * error * features.social

    // Normalize weights to sum to 1
    const totalWeight = 
      this.weights.utility + 
      this.weights.upi + 
      this.weights.location + 
      this.weights.social

    this.weights.utility /= totalWeight
    this.weights.upi /= totalWeight
    this.weights.location /= totalWeight
    this.weights.social /= totalWeight

    // Update coefficients for logistic regression
    this.coefficients.utility += this.learningRate * error * features.utility
    this.coefficients.upi += this.learningRate * error * features.upi
    this.coefficients.location += this.learningRate * error * features.location
    this.coefficients.social += this.learningRate * error * features.social
    this.coefficients.intercept += this.learningRate * error

    // Increment training samples
    this.trainingSamples++

    // Save learned weights to database
    await this.saveLearnedWeights()

    console.log('[ML Model] Updated weights:', this.weights)
    console.log('[ML Model] Training samples:', this.trainingSamples)
  }

  /**
   * Batch training from historical data
   */
  static async trainFromHistory(outcomes: LoanOutcome[]): Promise<void> {
    console.log('[ML Model] Starting batch training with', outcomes.length, 'samples')

    for (const outcome of outcomes) {
      await this.learnFromOutcome(outcome)
    }

    console.log('[ML Model] Batch training complete')
    console.log('[ML Model] Final weights:', this.weights)
    console.log('[ML Model] Total training samples:', this.trainingSamples)
  }

  /**
   * Predict default probability using logistic regression
   */
  private static predictDefaultProbability(features: {
    utility: number
    upi: number
    location: number
    social: number
  }): number {
    // Logistic regression: P(default) = 1 / (1 + e^(-z))
    // z = intercept + β1*x1 + β2*x2 + β3*x3 + β4*x4
    
    const z = 
      this.coefficients.intercept +
      this.coefficients.utility * features.utility +
      this.coefficients.upi * features.upi +
      this.coefficients.location * features.location +
      this.coefficients.social * features.social

    // Sigmoid function
    const probability = 1 / (1 + Math.exp(-z))

    // Return probability of default (inverse of repayment)
    return 1 - probability
  }

  /**
   * Determine risk category using both score and ML prediction
   */
  private static determineRiskCategory(
    trustScore: number, 
    defaultProb: number
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    // Combine rule-based and ML predictions
    if (trustScore >= 750 && defaultProb < 0.15) return 'LOW'
    if (trustScore >= 650 && defaultProb < 0.30) return 'MEDIUM'
    if (trustScore >= 550 && defaultProb < 0.50) return 'HIGH'
    return 'VERY_HIGH'
  }

  /**
   * Calculate model confidence based on training samples
   */
  private static calculateConfidence(): number {
    // Confidence increases with more training samples
    // Asymptotically approaches 1.0
    const maxSamples = 1000
    return Math.min(this.trainingSamples / maxSamples, 1.0)
  }

  /**
   * Load learned weights from database
   */
  private static async loadLearnedWeights(): Promise<void> {
    try {
      // In production, load from database
      // For now, use in-memory storage
      const stored = global.mlWeights as any
      if (stored) {
        this.weights = stored.weights
        this.coefficients = stored.coefficients
        this.trainingSamples = stored.trainingSamples
      }
    } catch (error) {
      console.error('[ML Model] Error loading weights:', error)
    }
  }

  /**
   * Save learned weights to database
   */
  private static async saveLearnedWeights(): Promise<void> {
    try {
      // In production, save to database
      // For now, use in-memory storage
      (global as any).mlWeights = {
        weights: this.weights,
        coefficients: this.coefficients,
        trainingSamples: this.trainingSamples,
        lastUpdated: new Date().toISOString()
      }
    } catch (error) {
      console.error('[ML Model] Error saving weights:', error)
    }
  }

  /**
   * Get model statistics
   */
  static getModelStats() {
    return {
      weights: this.weights,
      coefficients: this.coefficients,
      training_samples: this.trainingSamples,
      model_version: this.modelVersion,
      learning_rate: this.learningRate
    }
  }

  /**
   * Reset model to initial state
   */
  static resetModel(): void {
    this.weights = {
      utility: 0.35,
      upi: 0.30,
      location: 0.20,
      social: 0.15
    }
    this.coefficients = {
      intercept: 0,
      utility: 0.35,
      upi: 0.30,
      location: 0.20,
      social: 0.15
    }
    this.trainingSamples = 0
    console.log('[ML Model] Model reset to initial state')
  }

  // Component score calculations (same as rule-based model)
  private static calculateUtilityScore(utility: any): number {
    if (utility.months_tracked === 0) return 0
    let score = utility.on_time_ratio * 50
    score -= Math.min(utility.missed_payments * 5, 20)
    if (utility.months_tracked >= 12) score += 20
    else if (utility.months_tracked >= 6) score += 15
    else if (utility.months_tracked >= 3) score += 10
    else score += 5
    if (utility.avg_payment_amount > 0) score += 10
    if (utility.missed_payments === 0 && utility.months_tracked >= 6) score += 10
    return Math.max(0, Math.min(100, score))
  }

  private static calculateUPIScore(upi: any): number {
    if (upi.avg_transactions_per_day === 0) return 0
    let score = 0
    score += Math.min(upi.avg_transactions_per_day / 10, 1) * 25
    score += upi.income_consistency === 'high' ? 30 : upi.income_consistency === 'medium' ? 20 : 10
    score += upi.transaction_variance === 'low' ? 20 : upi.transaction_variance === 'medium' ? 12 : 5
    if (upi.avg_monthly_income > 0 && upi.avg_monthly_expense > 0) {
      const ratio = upi.avg_monthly_income / upi.avg_monthly_expense
      if (ratio >= 1.3) score += 15
      else if (ratio >= 1.1) score += 10
      else if (ratio >= 1.0) score += 5
    }
    if (upi.income_consistency === 'high' && upi.avg_monthly_income > 5000) score += 10
    return Math.max(0, Math.min(100, score))
  }

  private static calculateLocationScore(location: any): number {
    let score = location.stability_score * 50
    if (location.months_at_location >= 24) score += 30
    else if (location.months_at_location >= 12) score += 20
    else if (location.months_at_location >= 6) score += 10
    else score += 5
    if (location.months_at_location >= 6) score += 20
    return Math.max(0, Math.min(100, score))
  }

  private static calculateSocialScore(social: any): number {
    let score = 0
    score += social.network_strength === 'high' ? 40 : social.network_strength === 'medium' ? 25 : 10
    score += Math.min(social.trust_connections * 3, 30)
    score += Math.min(social.referrals_count * 5, 20)
    if (social.trust_connections >= 5 && social.network_strength !== 'low') score += 10
    return Math.max(0, Math.min(100, score))
  }
}
