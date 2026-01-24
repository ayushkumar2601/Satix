/**
 * Pre-defined Training Dataset
 * 
 * This dataset contains 200 realistic loan outcomes for training the ML model.
 * The model will be pre-trained with this data on startup.
 */

import { LoanOutcome } from '../models/ml-credit-model'

/**
 * Generate realistic training dataset
 * Based on real-world credit scoring patterns
 */
export function generateTrainingDataset(): LoanOutcome[] {
  const dataset: LoanOutcome[] = []
  
  // Pattern 1: High Trust Score (750+) - 90% repayment rate
  for (let i = 0; i < 50; i++) {
    const trustScore = 750 + Math.random() * 150 // 750-900
    const repaid = Math.random() < 0.90 // 90% repay
    
    dataset.push({
      user_id: `train_user_high_${i}`,
      trust_score: Math.round(trustScore),
      component_scores: {
        utility: 80 + Math.random() * 20,  // 80-100
        upi: 75 + Math.random() * 25,      // 75-100
        location: 70 + Math.random() * 30, // 70-100
        social: 60 + Math.random() * 40    // 60-100
      },
      loan_amount: 20000 + Math.random() * 30000,
      repaid: repaid,
      default: !repaid,
      repayment_rate: repaid ? 0.95 + Math.random() * 0.05 : Math.random() * 0.6,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // Pattern 2: Good Trust Score (650-749) - 75% repayment rate
  for (let i = 0; i < 60; i++) {
    const trustScore = 650 + Math.random() * 100 // 650-750
    const repaid = Math.random() < 0.75 // 75% repay
    
    dataset.push({
      user_id: `train_user_good_${i}`,
      trust_score: Math.round(trustScore),
      component_scores: {
        utility: 60 + Math.random() * 30,  // 60-90
        upi: 55 + Math.random() * 35,      // 55-90
        location: 50 + Math.random() * 40, // 50-90
        social: 40 + Math.random() * 50    // 40-90
      },
      loan_amount: 10000 + Math.random() * 20000,
      repaid: repaid,
      default: !repaid,
      repayment_rate: repaid ? 0.85 + Math.random() * 0.15 : Math.random() * 0.7,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // Pattern 3: Fair Trust Score (550-649) - 55% repayment rate
  for (let i = 0; i < 50; i++) {
    const trustScore = 550 + Math.random() * 100 // 550-650
    const repaid = Math.random() < 0.55 // 55% repay
    
    dataset.push({
      user_id: `train_user_fair_${i}`,
      trust_score: Math.round(trustScore),
      component_scores: {
        utility: 40 + Math.random() * 40,  // 40-80
        upi: 35 + Math.random() * 45,      // 35-80
        location: 30 + Math.random() * 50, // 30-80
        social: 20 + Math.random() * 60    // 20-80
      },
      loan_amount: 5000 + Math.random() * 15000,
      repaid: repaid,
      default: !repaid,
      repayment_rate: repaid ? 0.75 + Math.random() * 0.25 : Math.random() * 0.8,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // Pattern 4: Poor Trust Score (300-549) - 30% repayment rate
  for (let i = 0; i < 40; i++) {
    const trustScore = 300 + Math.random() * 250 // 300-550
    const repaid = Math.random() < 0.30 // 30% repay
    
    dataset.push({
      user_id: `train_user_poor_${i}`,
      trust_score: Math.round(trustScore),
      component_scores: {
        utility: 10 + Math.random() * 50,  // 10-60
        upi: 10 + Math.random() * 50,      // 10-60
        location: 10 + Math.random() * 50, // 10-60
        social: 5 + Math.random() * 45     // 5-50
      },
      loan_amount: 2000 + Math.random() * 8000,
      repaid: repaid,
      default: !repaid,
      repayment_rate: repaid ? 0.60 + Math.random() * 0.40 : Math.random() * 0.9,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    })
  }
  
  // Shuffle dataset for better training
  return dataset.sort(() => Math.random() - 0.5)
}

/**
 * Get dataset statistics
 */
export function getDatasetStats() {
  const dataset = generateTrainingDataset()
  
  const totalLoans = dataset.length
  const repaidLoans = dataset.filter(d => d.repaid).length
  const defaultedLoans = dataset.filter(d => d.default).length
  const avgTrustScore = dataset.reduce((sum, d) => sum + d.trust_score, 0) / totalLoans
  const avgLoanAmount = dataset.reduce((sum, d) => sum + d.loan_amount, 0) / totalLoans
  
  return {
    total_loans: totalLoans,
    repaid_loans: repaidLoans,
    defaulted_loans: defaultedLoans,
    repayment_rate: (repaidLoans / totalLoans * 100).toFixed(1) + '%',
    avg_trust_score: Math.round(avgTrustScore),
    avg_loan_amount: Math.round(avgLoanAmount)
  }
}

/**
 * Dataset breakdown by trust score range
 */
export function getDatasetBreakdown() {
  const dataset = generateTrainingDataset()
  
  const ranges = {
    excellent: { min: 750, max: 900, loans: 0, repaid: 0 },
    good: { min: 650, max: 749, loans: 0, repaid: 0 },
    fair: { min: 550, max: 649, loans: 0, repaid: 0 },
    poor: { min: 300, max: 549, loans: 0, repaid: 0 }
  }
  
  dataset.forEach(loan => {
    if (loan.trust_score >= 750) {
      ranges.excellent.loans++
      if (loan.repaid) ranges.excellent.repaid++
    } else if (loan.trust_score >= 650) {
      ranges.good.loans++
      if (loan.repaid) ranges.good.repaid++
    } else if (loan.trust_score >= 550) {
      ranges.fair.loans++
      if (loan.repaid) ranges.fair.repaid++
    } else {
      ranges.poor.loans++
      if (loan.repaid) ranges.poor.repaid++
    }
  })
  
  return {
    excellent: {
      ...ranges.excellent,
      repayment_rate: ((ranges.excellent.repaid / ranges.excellent.loans) * 100).toFixed(1) + '%'
    },
    good: {
      ...ranges.good,
      repayment_rate: ((ranges.good.repaid / ranges.good.loans) * 100).toFixed(1) + '%'
    },
    fair: {
      ...ranges.fair,
      repayment_rate: ((ranges.fair.repaid / ranges.fair.loans) * 100).toFixed(1) + '%'
    },
    poor: {
      ...ranges.poor,
      repayment_rate: ((ranges.poor.repaid / ranges.poor.loans) * 100).toFixed(1) + '%'
    }
  }
}
