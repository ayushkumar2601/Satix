'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Seed demo data for a user (for testing and demos)
 */
export async function seedDemoData(userId: string) {
  console.log('[Data Seeding] Seeding demo data for user:', userId)
  
  const supabase = await createClient()

  try {
    // Seed utility bills (6 months of data)
    const utilityBills = generateDemoUtilityBills(userId)
    const { error: billsError } = await supabase
      .from('utility_bills')
      .insert(utilityBills)

    if (billsError) {
      console.error('[Data Seeding] Error seeding utility bills:', billsError)
    } else {
      console.log('[Data Seeding] Seeded', utilityBills.length, 'utility bills')
    }

    // Seed UPI transactions (3 months of data)
    const upiTransactions = generateDemoUPITransactions(userId)
    const { error: transError } = await supabase
      .from('upi_transactions')
      .insert(upiTransactions)

    if (transError) {
      console.error('[Data Seeding] Error seeding UPI transactions:', transError)
    } else {
      console.log('[Data Seeding] Seeded', upiTransactions.length, 'UPI transactions')
    }

    // Seed location data
    const { error: locationError } = await supabase
      .from('location_data')
      .insert({
        user_id: userId,
        city: 'Mumbai',
        state: 'Maharashtra',
        months_at_location: 18,
        stability_score: 0.87
      })

    if (locationError) {
      console.error('[Data Seeding] Error seeding location data:', locationError)
    } else {
      console.log('[Data Seeding] Seeded location data')
    }

    // Seed social trust data
    const { error: socialError } = await supabase
      .from('social_trust')
      .insert({
        user_id: userId,
        network_strength: 'high',
        referrals_count: 3,
        trust_connections: 12
      })

    if (socialError) {
      console.error('[Data Seeding] Error seeding social trust:', socialError)
    } else {
      console.log('[Data Seeding] Seeded social trust data')
    }

    return { success: true, message: 'Demo data seeded successfully' }

  } catch (error) {
    console.error('[Data Seeding] Error:', error)
    return { error: 'Failed to seed demo data' }
  }
}

/**
 * Generate demo utility bills
 */
function generateDemoUtilityBills(userId: string) {
  const bills = []
  const billTypes = ['electricity', 'water', 'gas']
  const now = new Date()

  for (let i = 0; i < 6; i++) {
    const dueDate = new Date(now.getFullYear(), now.getMonth() - i, 15)
    const paidDate = new Date(dueDate)
    
    // 90% on-time payment rate
    const isOnTime = Math.random() > 0.1
    if (isOnTime) {
      paidDate.setDate(paidDate.getDate() - Math.floor(Math.random() * 5))
    } else {
      paidDate.setDate(paidDate.getDate() + Math.floor(Math.random() * 10) + 1)
    }

    for (const billType of billTypes) {
      const amount = billType === 'electricity' 
        ? 800 + Math.random() * 400
        : billType === 'water'
        ? 200 + Math.random() * 100
        : 400 + Math.random() * 200

      bills.push({
        user_id: userId,
        bill_type: billType,
        amount: Number(amount.toFixed(2)),
        due_date: dueDate.toISOString().split('T')[0],
        paid_date: paidDate.toISOString().split('T')[0],
        status: 'paid'
      })
    }
  }

  return bills
}

/**
 * Generate demo UPI transactions
 */
function generateDemoUPITransactions(userId: string) {
  const transactions = []
  const now = new Date()
  const categories = ['food', 'transport', 'bills', 'shopping', 'transfer', 'entertainment']

  // Generate 3 months of transactions
  for (let month = 0; month < 3; month++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1)
    
    // Monthly income (2-3 transactions)
    const incomeCount = 2 + Math.floor(Math.random() * 2)
    for (let i = 0; i < incomeCount; i++) {
      const day = 1 + Math.floor(Math.random() * 28)
      const transDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
      
      transactions.push({
        user_id: userId,
        transaction_type: 'credit',
        amount: 15000 + Math.random() * 10000,
        category: 'salary',
        transaction_date: transDate.toISOString(),
        description: 'Salary credit'
      })
    }

    // Daily expenses (5-10 transactions per day for random days)
    const activeDays = 20 + Math.floor(Math.random() * 8)
    for (let day = 0; day < activeDays; day++) {
      const dayNum = 1 + Math.floor(Math.random() * 28)
      const transDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNum)
      
      const dailyTransactions = 3 + Math.floor(Math.random() * 5)
      for (let t = 0; t < dailyTransactions; t++) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        const amount = category === 'bills' 
          ? 500 + Math.random() * 2000
          : category === 'shopping'
          ? 200 + Math.random() * 1500
          : 50 + Math.random() * 500

        transactions.push({
          user_id: userId,
          transaction_type: 'debit',
          amount: Number(amount.toFixed(2)),
          category,
          transaction_date: new Date(transDate.getTime() + t * 3600000).toISOString(),
          description: `${category} payment`
        })
      }
    }
  }

  return transactions
}

/**
 * Check if user has any data
 */
export async function checkUserHasData(userId: string) {
  const supabase = await createClient()

  const [bills, transactions, location, social] = await Promise.all([
    supabase.from('utility_bills').select('id').eq('user_id', userId).limit(1),
    supabase.from('upi_transactions').select('id').eq('user_id', userId).limit(1),
    supabase.from('location_data').select('id').eq('user_id', userId).limit(1),
    supabase.from('social_trust').select('id').eq('user_id', userId).limit(1)
  ])

  return {
    has_bills: (bills.data?.length || 0) > 0,
    has_transactions: (transactions.data?.length || 0) > 0,
    has_location: (location.data?.length || 0) > 0,
    has_social: (social.data?.length || 0) > 0,
    has_any_data: 
      (bills.data?.length || 0) > 0 ||
      (transactions.data?.length || 0) > 0 ||
      (location.data?.length || 0) > 0 ||
      (social.data?.length || 0) > 0
  }
}
