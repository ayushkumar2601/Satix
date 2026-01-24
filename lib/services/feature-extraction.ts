'use server'

import { createClient } from '@/lib/supabase/server'

export interface UtilityFeatures {
  on_time_ratio: number
  missed_payments: number
  months_tracked: number
  avg_payment_amount: number
}

export interface UPIFeatures {
  avg_transactions_per_day: number
  transaction_variance: 'low' | 'medium' | 'high'
  income_consistency: 'low' | 'medium' | 'high'
  avg_monthly_income: number
  avg_monthly_expense: number
}

export interface LocationFeatures {
  stability_score: number
  months_at_location: number
}

export interface SocialFeatures {
  network_strength: 'low' | 'medium' | 'high'
  referrals_count: number
  trust_connections: number
}

export interface ExtractedFeatures {
  utility: UtilityFeatures
  upi: UPIFeatures
  location: LocationFeatures
  social: SocialFeatures
}

/**
 * Extract deterministic features from utility bills
 */
export async function extractUtilityFeatures(userId: string): Promise<UtilityFeatures> {
  const supabase = await createClient()
  
  const { data: bills, error } = await supabase
    .from('utility_bills')
    .select('*')
    .eq('user_id', userId)
    .order('due_date', { ascending: false })

  if (error || !bills || bills.length === 0) {
    console.log('[Feature Extraction] No utility bills found, using defaults')
    return {
      on_time_ratio: 0,
      missed_payments: 0,
      months_tracked: 0,
      avg_payment_amount: 0
    }
  }

  const totalBills = bills.length
  const paidOnTime = bills.filter(bill => {
    if (bill.status === 'paid' && bill.paid_date && bill.due_date) {
      return new Date(bill.paid_date) <= new Date(bill.due_date)
    }
    return false
  }).length

  const missedPayments = bills.filter(bill => bill.status === 'missed').length
  const avgAmount = bills.reduce((sum, bill) => sum + Number(bill.amount), 0) / totalBills

  // Calculate months tracked (unique months)
  const uniqueMonths = new Set(
    bills.map(bill => new Date(bill.due_date).toISOString().slice(0, 7))
  ).size

  return {
    on_time_ratio: totalBills > 0 ? paidOnTime / totalBills : 0,
    missed_payments: missedPayments,
    months_tracked: uniqueMonths,
    avg_payment_amount: avgAmount
  }
}

/**
 * Extract deterministic features from UPI transactions
 */
export async function extractUPIFeatures(userId: string): Promise<UPIFeatures> {
  const supabase = await createClient()
  
  const { data: transactions, error } = await supabase
    .from('upi_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false })

  if (error || !transactions || transactions.length === 0) {
    console.log('[Feature Extraction] No UPI transactions found, using defaults')
    return {
      avg_transactions_per_day: 0,
      transaction_variance: 'low',
      income_consistency: 'low',
      avg_monthly_income: 0,
      avg_monthly_expense: 0
    }
  }

  // Calculate date range
  const dates = transactions.map(t => new Date(t.transaction_date))
  const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
  const daysDiff = Math.max(1, (maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))

  const avgTransactionsPerDay = transactions.length / daysDiff

  // Calculate income and expense
  const credits = transactions.filter(t => t.transaction_type === 'credit')
  const debits = transactions.filter(t => t.transaction_type === 'debit')

  const totalIncome = credits.reduce((sum, t) => sum + Number(t.amount), 0)
  const totalExpense = debits.reduce((sum, t) => sum + Number(t.amount), 0)

  // Group by month for consistency calculation
  const monthlyIncome: Record<string, number> = {}
  credits.forEach(t => {
    const month = new Date(t.transaction_date).toISOString().slice(0, 7)
    monthlyIncome[month] = (monthlyIncome[month] || 0) + Number(t.amount)
  })

  const incomeValues = Object.values(monthlyIncome)
  const avgMonthlyIncome = incomeValues.length > 0 
    ? incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length 
    : 0

  const monthlyExpense: Record<string, number> = {}
  debits.forEach(t => {
    const month = new Date(t.transaction_date).toISOString().slice(0, 7)
    monthlyExpense[month] = (monthlyExpense[month] || 0) + Number(t.amount)
  })

  const expenseValues = Object.values(monthlyExpense)
  const avgMonthlyExpense = expenseValues.length > 0
    ? expenseValues.reduce((a, b) => a + b, 0) / expenseValues.length
    : 0

  // Calculate variance
  const incomeStdDev = calculateStdDev(incomeValues)
  const incomeVariance = avgMonthlyIncome > 0 ? incomeStdDev / avgMonthlyIncome : 0

  const transactionVariance: 'low' | 'medium' | 'high' = 
    incomeVariance < 0.2 ? 'low' : incomeVariance < 0.5 ? 'medium' : 'high'

  const incomeConsistency: 'low' | 'medium' | 'high' = 
    incomeVariance < 0.2 ? 'high' : incomeVariance < 0.5 ? 'medium' : 'low'

  return {
    avg_transactions_per_day: avgTransactionsPerDay,
    transaction_variance: transactionVariance,
    income_consistency: incomeConsistency,
    avg_monthly_income: avgMonthlyIncome,
    avg_monthly_expense: avgMonthlyExpense
  }
}

/**
 * Extract location stability features
 */
export async function extractLocationFeatures(userId: string): Promise<LocationFeatures> {
  const supabase = await createClient()
  
  const { data: location, error } = await supabase
    .from('location_data')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !location) {
    console.log('[Feature Extraction] No location data found, using defaults')
    return {
      stability_score: 0,
      months_at_location: 0
    }
  }

  return {
    stability_score: Number(location.stability_score) || 0,
    months_at_location: location.months_at_location || 0
  }
}

/**
 * Extract social trust features
 */
export async function extractSocialFeatures(userId: string): Promise<SocialFeatures> {
  const supabase = await createClient()
  
  const { data: social, error } = await supabase
    .from('social_trust')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !social) {
    console.log('[Feature Extraction] No social data found, using defaults')
    return {
      network_strength: 'low',
      referrals_count: 0,
      trust_connections: 0
    }
  }

  return {
    network_strength: social.network_strength as 'low' | 'medium' | 'high',
    referrals_count: social.referrals_count || 0,
    trust_connections: social.trust_connections || 0
  }
}

/**
 * Extract all features for a user
 */
export async function extractAllFeatures(userId: string): Promise<ExtractedFeatures> {
  console.log('[Feature Extraction] Starting feature extraction for user:', userId)

  const [utility, upi, location, social] = await Promise.all([
    extractUtilityFeatures(userId),
    extractUPIFeatures(userId),
    extractLocationFeatures(userId),
    extractSocialFeatures(userId)
  ])

  const features = { utility, upi, location, social }
  console.log('[Feature Extraction] Extracted features:', JSON.stringify(features, null, 2))

  return features
}

/**
 * Helper function to calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0
  
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const squareDiffs = values.map(value => Math.pow(value - avg, 2))
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / values.length
  
  return Math.sqrt(avgSquareDiff)
}
