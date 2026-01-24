'use server'

import { ExtractedFeatures } from './feature-extraction'

export interface TrustScoreResult {
  trust_score: number
  utility_score: number
  upi_score: number
  location_score: number
  social_score: number
  explanations: {
    utility: string
    upi: string
    location: string
    social: string
  }
}

/**
 * Generate Trust Score using AI (Gemini or Grok)
 */
export async function generateTrustScoreWithGemini(
  features: ExtractedFeatures
): Promise<{ result: TrustScoreResult; gemini_used: boolean; fallback_used: boolean }> {
  const demoMode = process.env.DEMO_MODE === 'true'
  const aiProvider = process.env.AI_PROVIDER || 'gemini'
  
  // Check if we should use AI
  if (demoMode) {
    console.log('[AI] Demo mode enabled, using fallback scoring')
    return {
      result: generateFallbackScore(features),
      gemini_used: false,
      fallback_used: true
    }
  }

  // Try AI provider
  if (aiProvider === 'grok') {
    return await generateWithGrok(features)
  } else {
    return await generateWithGemini(features)
  }
}

/**
 * Generate score using Gemini AI
 */
async function generateWithGemini(
  features: ExtractedFeatures
): Promise<{ result: TrustScoreResult; gemini_used: boolean; fallback_used: boolean }> {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    console.log('[Gemini] API key not configured, using fallback scoring')
    return {
      result: generateFallbackScore(features),
      gemini_used: false,
      fallback_used: true
    }
  }

  try {
    console.log('[Gemini] Calling Gemini API for trust score generation')

    const prompt = buildAIPrompt(features)
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini')
    }

    const geminiText = data.candidates[0].content.parts[0].text
    console.log('[Gemini] Raw response:', geminiText)

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = geminiText.match(/```json\n?([\s\S]*?)\n?```/) || 
                     geminiText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Gemini response')
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const result = JSON.parse(jsonText) as TrustScoreResult

    // Validate the result
    if (!validateTrustScoreResult(result)) {
      throw new Error('Invalid trust score result from Gemini')
    }

    console.log('[Gemini] Successfully generated trust score:', result.trust_score)

    return {
      result,
      gemini_used: true,
      fallback_used: false
    }

  } catch (error) {
    console.error('[Gemini] Error calling Gemini API:', error)
    console.log('[Gemini] Falling back to deterministic scoring')
    
    return {
      result: generateFallbackScore(features),
      gemini_used: false,
      fallback_used: true
    }
  }
}

/**
 * Generate score using Grok AI
 */
async function generateWithGrok(
  features: ExtractedFeatures
): Promise<{ result: TrustScoreResult; gemini_used: boolean; fallback_used: boolean }> {
  const apiKey = process.env.GROK_API_KEY

  if (!apiKey || apiKey === 'your-grok-api-key-here') {
    console.log('[Grok] API key not configured, using fallback scoring')
    return {
      result: generateFallbackScore(features),
      gemini_used: false,
      fallback_used: true
    }
  }

  try {
    console.log('[Grok] Calling Grok API for trust score generation')

    const prompt = buildAIPrompt(features)
    
    const response = await fetch(
      'https://api.x.ai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a financial risk assessment engine. Respond only with valid JSON.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          model: 'grok-beta',
          temperature: 0.4,
          max_tokens: 1024
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Invalid response format from Grok')
    }

    const grokText = data.choices[0].message.content
    console.log('[Grok] Raw response:', grokText)

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = grokText.match(/```json\n?([\s\S]*?)\n?```/) || 
                     grokText.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from Grok response')
    }

    const jsonText = jsonMatch[1] || jsonMatch[0]
    const result = JSON.parse(jsonText) as TrustScoreResult

    // Validate the result
    if (!validateTrustScoreResult(result)) {
      throw new Error('Invalid trust score result from Grok')
    }

    console.log('[Grok] Successfully generated trust score:', result.trust_score)

    return {
      result,
      gemini_used: true, // Using same flag for consistency
      fallback_used: false
    }

  } catch (error) {
    console.error('[Grok] Error calling Grok API:', error)
    console.log('[Grok] Falling back to deterministic scoring')
    
    return {
      result: generateFallbackScore(features),
      gemini_used: false,
      fallback_used: true
    }
  }
}

/**
 * Build the prompt for AI (works for both Gemini and Grok)
 */
function buildAIPrompt(features: ExtractedFeatures): string {
  return `You are a financial risk assessment engine for a micro-lending platform in India.

Given the following behavioral financial signals, evaluate the user's creditworthiness conservatively.

TASKS:
1. Generate a Trust Score between 300 and 900
2. Generate sub-scores (0.00 to 1.00) for:
   - utility_score: Utility bill payment discipline
   - upi_score: UPI transaction stability
   - location_score: Residential stability
   - social_score: Social trust network
3. Provide 1 short explanation sentence per category (max 15 words each)

RULES:
- Be conservative in scoring
- Penalize volatility and inconsistency
- Reward consistency and stability
- Do NOT hallucinate data
- Base scores ONLY on the provided data
- Lower scores for missing or insufficient data

INPUT DATA:
${JSON.stringify(features, null, 2)}

SCORING GUIDELINES:
- Utility: High on_time_ratio (>0.8) = good score, missed payments = penalty
- UPI: Low variance + high income consistency = good score
- Location: Higher months_at_location and stability_score = better
- Social: Higher network_strength and connections = better

Return output STRICTLY in this JSON format (no markdown, no extra text):
{
  "trust_score": 742,
  "utility_score": 0.88,
  "upi_score": 0.72,
  "location_score": 0.90,
  "social_score": 0.79,
  "explanations": {
    "utility": "Consistent on-time utility bill payments",
    "upi": "Stable transaction activity with moderate variance",
    "location": "Strong residential stability over time",
    "social": "Connected to a long-standing trusted network"
  }
}`
}

/**
 * Fallback deterministic scoring (when Gemini fails or is unavailable)
 */
function generateFallbackScore(features: ExtractedFeatures): TrustScoreResult {
  console.log('[Fallback] Generating deterministic trust score')

  // Calculate utility score (0-1)
  let utilityScore = 0
  if (features.utility.months_tracked > 0) {
    utilityScore = features.utility.on_time_ratio * 0.7
    const missedPenalty = Math.min(features.utility.missed_payments * 0.1, 0.3)
    utilityScore = Math.max(0, utilityScore - missedPenalty)
    
    // Bonus for tracking history
    if (features.utility.months_tracked >= 6) utilityScore += 0.2
    else if (features.utility.months_tracked >= 3) utilityScore += 0.1
  }
  utilityScore = Math.min(1, utilityScore)

  // Calculate UPI score (0-1)
  let upiScore = 0
  if (features.upi.avg_transactions_per_day > 0) {
    // Base score from transaction activity
    const activityScore = Math.min(features.upi.avg_transactions_per_day / 10, 0.4)
    
    // Income consistency bonus
    const consistencyBonus = 
      features.upi.income_consistency === 'high' ? 0.3 :
      features.upi.income_consistency === 'medium' ? 0.2 : 0.1
    
    // Variance penalty
    const variancePenalty = 
      features.upi.transaction_variance === 'high' ? 0.2 :
      features.upi.transaction_variance === 'medium' ? 0.1 : 0
    
    upiScore = activityScore + consistencyBonus - variancePenalty
    
    // Bonus for positive cash flow
    if (features.upi.avg_monthly_income > features.upi.avg_monthly_expense) {
      upiScore += 0.1
    }
  }
  upiScore = Math.max(0, Math.min(1, upiScore))

  // Calculate location score (0-1)
  let locationScore = features.location.stability_score
  if (features.location.months_at_location >= 12) locationScore += 0.1
  else if (features.location.months_at_location >= 6) locationScore += 0.05
  locationScore = Math.min(1, locationScore)

  // Calculate social score (0-1)
  let socialScore = 
    features.social.network_strength === 'high' ? 0.6 :
    features.social.network_strength === 'medium' ? 0.4 : 0.2
  
  socialScore += Math.min(features.social.referrals_count * 0.05, 0.2)
  socialScore += Math.min(features.social.trust_connections * 0.02, 0.2)
  socialScore = Math.min(1, socialScore)

  // Calculate overall trust score (300-900)
  const weightedScore = 
    utilityScore * 0.35 +
    upiScore * 0.35 +
    locationScore * 0.20 +
    socialScore * 0.10

  const trustScore = Math.round(300 + (weightedScore * 600))

  // Generate explanations
  const explanations = {
    utility: generateUtilityExplanation(features.utility, utilityScore),
    upi: generateUPIExplanation(features.upi, upiScore),
    location: generateLocationExplanation(features.location, locationScore),
    social: generateSocialExplanation(features.social, socialScore)
  }

  return {
    trust_score: trustScore,
    utility_score: Number(utilityScore.toFixed(2)),
    upi_score: Number(upiScore.toFixed(2)),
    location_score: Number(locationScore.toFixed(2)),
    social_score: Number(socialScore.toFixed(2)),
    explanations
  }
}

/**
 * Validate trust score result
 */
function validateTrustScoreResult(result: any): result is TrustScoreResult {
  return (
    typeof result === 'object' &&
    typeof result.trust_score === 'number' &&
    result.trust_score >= 300 &&
    result.trust_score <= 900 &&
    typeof result.utility_score === 'number' &&
    typeof result.upi_score === 'number' &&
    typeof result.location_score === 'number' &&
    typeof result.social_score === 'number' &&
    typeof result.explanations === 'object' &&
    typeof result.explanations.utility === 'string' &&
    typeof result.explanations.upi === 'string' &&
    typeof result.explanations.location === 'string' &&
    typeof result.explanations.social === 'string'
  )
}

/**
 * Generate explanation text helpers
 */
function generateUtilityExplanation(utility: any, score: number): string {
  if (utility.months_tracked === 0) return 'No utility payment history available'
  if (score >= 0.8) return 'Excellent utility payment discipline with consistent on-time payments'
  if (score >= 0.6) return 'Good payment history with occasional delays'
  if (score >= 0.4) return 'Moderate payment consistency with some missed payments'
  return 'Limited payment history or frequent delays detected'
}

function generateUPIExplanation(upi: any, score: number): string {
  if (upi.avg_transactions_per_day === 0) return 'No UPI transaction history available'
  if (score >= 0.8) return 'Highly stable transaction patterns with consistent income'
  if (score >= 0.6) return 'Stable transaction activity with moderate income consistency'
  if (score >= 0.4) return 'Moderate transaction activity with some variance'
  return 'Limited transaction history or high income volatility'
}

function generateLocationExplanation(location: any, score: number): string {
  if (location.months_at_location === 0) return 'No location stability data available'
  if (score >= 0.8) return 'Strong residential stability over extended period'
  if (score >= 0.6) return 'Good location stability with established residence'
  if (score >= 0.4) return 'Moderate residential stability'
  return 'Limited location history or recent relocation'
}

function generateSocialExplanation(social: any, score: number): string {
  if (score >= 0.8) return 'Strong trusted network with multiple verified connections'
  if (score >= 0.6) return 'Good social trust network with some connections'
  if (score >= 0.4) return 'Moderate social network presence'
  return 'Limited social trust network or new user'
}
