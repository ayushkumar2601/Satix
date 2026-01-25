"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  CreditCard, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { signOut } from "@/lib/auth/actions"
import { ExportPDFButton } from "@/components/score/export-pdf-button"

interface DashboardData {
  profile: {
    trust_score: number
    loan_eligibility_min: number
    loan_eligibility_max: number
    interest_rate: number
  }
  score_history: Array<{
    score: number
    created_at: string
  }>
  loans: Array<{
    id: string
    principal_amount: number
    tenure_months: number
    emi_amount: number
    status: string
    created_at: string
  }>
  transactions: Array<{
    id: string
    transaction_type: string
    amount: number
    category: string
    transaction_date: string
    description: string
  }>
  bills: Array<{
    id: string
    bill_type: string
    amount: number
    due_date: string
    paid_date: string
    status: string
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!user) return

    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard/data')
        const result = await response.json()

        if (!response.ok || result.error) {
          throw new Error(result.error || 'Failed to fetch dashboard data')
        }

        setData(result)
        setLoading(false)

      } catch (err) {
        console.error('[Dashboard] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
        setLoading(false)
      }
    }

    fetchData()
  }, [user, authLoading, router])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </main>
    )
  }

  // If there's an error or no data, create empty data structure to show dashboard with zeros
  const safeData = (error || !data) ? {
    profile: {
      trust_score: 0,
      loan_eligibility_min: 0,
      loan_eligibility_max: 0,
      interest_rate: 0
    },
    score_history: [],
    loans: [],
    transactions: [],
    bills: []
  } : data

  // If no trust score yet, show default dashboard with zeros
  const hasScore = safeData.profile?.trust_score && safeData.profile.trust_score > 0

  // Use default values when no score
  const displayProfile = {
    trust_score: hasScore ? safeData.profile.trust_score : 0,
    loan_eligibility_min: hasScore ? safeData.profile.loan_eligibility_min : 0,
    loan_eligibility_max: hasScore ? safeData.profile.loan_eligibility_max : 0,
    interest_rate: hasScore ? safeData.profile.interest_rate : 0
  }

  // Calculate score history display
  const scoreHistory = hasScore && safeData.score_history.length > 0 
    ? safeData.score_history.slice(-7).map(h => h.score)
    : [0]

  const months = hasScore && safeData.score_history.length > 0
    ? safeData.score_history.slice(-7).map(h => {
        const date = new Date(h.created_at)
        return date.toLocaleDateString('en-US', { month: 'short' })
      })
    : ['Now']

  const currentScore = displayProfile.trust_score
  const maxScore = Math.max(...scoreHistory, 1)
  const minScore = Math.min(...scoreHistory.filter(s => s > 0), 0)
  const range = maxScore - minScore || 1

  // Calculate score trend
  const scoreTrend = hasScore && scoreHistory.length > 1
    ? ((scoreHistory[scoreHistory.length - 1] - scoreHistory[0]) / scoreHistory[0] * 100).toFixed(0)
    : '0'

  // Get active loan
  const activeLoan = safeData.loans.length > 0 ? safeData.loans[0] : null

  // Calculate loan progress
  const loanProgress = activeLoan ? {
    amount: activeLoan.principal_amount,
    remaining: activeLoan.principal_amount * 0.75, // Mock remaining
    emi: activeLoan.emi_amount,
    nextDue: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    tenure: activeLoan.tenure_months,
    paidMonths: Math.floor(activeLoan.tenure_months * 0.25)
  } : null

  return (
    <main className="min-h-screen bg-[var(--cream)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--cream)]/95 backdrop-blur-sm border-b border-border/40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg md:text-xl font-bold uppercase tracking-tight">
            Satix
          </Link>
          
          <nav className="flex items-center gap-2 md:gap-4">
            <button type="button" className="p-2 hover:bg-muted rounded-full transition-colors duration-200 btn-hover">
              <Bell className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 hover:bg-muted rounded-full transition-colors duration-200 btn-hover">
              <Settings className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSignOut}
              className="p-2 hover:bg-muted rounded-full transition-colors duration-200 text-muted-foreground hover:text-foreground btn-hover"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Welcome Section */}
        <div className="mb-8 md:mb-10 animate-fade-up">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-balance mb-2 leading-tight">
            Welcome Back
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Your financial dashboard at a glance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Trust Score Card */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-border card-hover stagger-1 animate-fade-up">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-base md:text-lg font-bold uppercase tracking-tight">Trust Score Trend</h2>
              <div className="flex items-center gap-2 md:gap-3">
                {hasScore && (
                  <ExportPDFButton 
                    scoreData={{
                      trust_score: displayProfile.trust_score,
                      score_breakdown: {
                        utility_score: 0.85,
                        upi_score: 0.78,
                        location_score: 0.92,
                        social_score: 0.65
                      },
                      explanations: {
                        utility: 'Strong payment history with consistent on-time payments',
                        upi: 'Regular transaction activity with stable income patterns',
                        location: 'Long-term residence stability',
                        social: 'Growing trust network'
                      },
                      eligibility: {
                        min_loan: displayProfile.loan_eligibility_min,
                        max_loan: displayProfile.loan_eligibility_max,
                        interest_rate: displayProfile.interest_rate
                      },
                      profile: {
                        full_name: user?.email?.split('@')[0] || 'User',
                        email: user?.email
                      }
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                  />
                )}
                <div className="flex items-center gap-2 text-xs md:text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>{hasScore && scoreTrend !== '0' ? `${scoreTrend > 0 ? '+' : ''}${scoreTrend}%` : '0%'} {scoreHistory.length > 1 ? 'overall' : ''}</span>
                </div>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-8 md:mb-10">
              <div>
                <p className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
                  {displayProfile.trust_score}
                </p>
                <p className="text-muted-foreground text-xs md:text-sm uppercase tracking-wider mt-2">
                  Current Score
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xl md:text-2xl font-bold text-red-600">
                  {displayProfile.trust_score >= 750 ? 'Excellent' : 
                   displayProfile.trust_score >= 650 ? 'Good' : 
                   displayProfile.trust_score >= 550 ? 'Fair' : 
                   displayProfile.trust_score > 0 ? 'Building' : 'Not Rated'} Trust
                </p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  {displayProfile.trust_score >= 750 ? 'Top 10%' : 
                   displayProfile.trust_score >= 650 ? 'Top 35%' : 
                   displayProfile.trust_score >= 550 ? 'Top 60%' : 
                   displayProfile.trust_score > 0 ? 'Growing' : 'Upload data to get rated'} {displayProfile.trust_score > 0 ? 'of users' : ''}
                </p>
              </div>
            </div>

            {/* Simple Chart */}
            <div className="h-32 md:h-40 flex items-end gap-1.5 md:gap-2">
              {scoreHistory.map((score, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      index === scoreHistory.length - 1 
                        ? "bg-red-600" 
                        : "bg-gray-200 group-hover:bg-gray-300"
                    }`}
                    style={{ 
                      height: `${((score - minScore) / range) * 100 + 20}%` 
                    }}
                  />
                  <span className="text-xs text-muted-foreground font-medium">{months[index]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-3 md:space-y-4">
            {/* Active Loan Card */}
            {loanProgress ? (
              <div className="bg-foreground text-white p-5 md:p-6 rounded-2xl card-hover stagger-2 animate-fade-up">
                <h3 className="text-base md:text-lg font-bold uppercase tracking-tight mb-4">
                  Active Loan
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold">₹{loanProgress.remaining.toLocaleString()}</p>
                    <p className="text-white/60 text-xs md:text-sm">Remaining of ₹{loanProgress.amount.toLocaleString()}</p>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-400 transition-all duration-300"
                      style={{ width: `${((loanProgress.amount - loanProgress.remaining) / loanProgress.amount) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span className="text-white/60">{loanProgress.paidMonths} of {loanProgress.tenure} EMIs</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-foreground text-white p-5 md:p-6 rounded-2xl card-hover stagger-2 animate-fade-up">
                <h3 className="text-base md:text-lg font-bold uppercase tracking-tight mb-4">
                  Loan Eligibility
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold">
                      ₹{displayProfile.loan_eligibility_max.toLocaleString()}
                    </p>
                    <p className="text-white/60 text-xs md:text-sm">
                      {hasScore ? 'Maximum eligible amount' : 'Upload data to see eligibility'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push(hasScore ? '/loan' : '/upload')}
                    className="w-full bg-white text-foreground hover:bg-white/90 rounded-lg md:rounded-full text-sm md:text-base btn-hover py-2 md:py-3"
                  >
                    {hasScore ? 'Apply for Loan' : 'Get Started'}
                  </Button>
                </div>
              </div>
            )}

            {/* Next Payment Card */}
            {loanProgress ? (
              <div className="bg-pink-100 border border-pink-200 p-5 md:p-6 rounded-2xl card-hover stagger-3 animate-fade-up">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-pink-700" />
                  <h3 className="font-bold uppercase tracking-tight text-pink-900">Next Payment</h3>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-pink-700 mb-1">₹{loanProgress.emi.toLocaleString()}</p>
                <p className="text-xs md:text-sm text-pink-600 mb-3">Due on {loanProgress.nextDue}</p>
                <Button className="w-full bg-pink-700 text-white hover:bg-pink-800 rounded-lg md:rounded-full text-sm md:text-base btn-hover py-2 md:py-3">
                  Pay Now
                </Button>
              </div>
            ) : (
              <div className="bg-pink-100 border border-pink-200 p-5 md:p-6 rounded-2xl card-hover stagger-3 animate-fade-up">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-pink-700" />
                  <h3 className="font-bold uppercase tracking-tight text-pink-900">Interest Rate</h3>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-pink-700 mb-1">
                  {displayProfile.interest_rate > 0 ? `${displayProfile.interest_rate}%` : '0%'}
                </p>
                <p className="text-xs md:text-sm text-pink-600">
                  {hasScore ? 'Annual interest rate for your score' : 'Upload data to see rate'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Repayment Timeline / Empty State */}
        {loanProgress ? (
          <div className="mt-8 md:mt-10 bg-white p-6 md:p-8 rounded-2xl border border-border card-hover stagger-4 animate-fade-up">
            <h2 className="text-base md:text-lg font-bold uppercase tracking-tight mb-6 md:mb-8">
              Repayment Timeline
            </h2>

            <div className="space-y-2 md:space-y-3">
              {/* Mock payment history */}
              {[...Array(loanProgress.paidMonths)].map((_, index) => {
                const date = new Date()
                date.setMonth(date.getMonth() - (loanProgress.paidMonths - index))
                return (
                  <div key={index} className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-green-50 border border-green-200 rounded-xl transition-all duration-200 hover:shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm md:text-base text-green-900">
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs md:text-sm text-green-700">EMI Payment</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm md:text-base text-green-900">₹{loanProgress.emi.toLocaleString()}</p>
                      <p className="text-xs text-green-700 uppercase tracking-wider font-medium">Paid</p>
                    </div>
                  </div>
                )
              })}

              {/* Upcoming payments */}
              {[...Array(Math.min(4, loanProgress.tenure - loanProgress.paidMonths))].map((_, index) => {
                const date = new Date()
                date.setMonth(date.getMonth() + index + 1)
                return (
                  <div key={index} className={`flex items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl transition-all duration-200 ${
                    index === 0 
                      ? "bg-red-50 border border-red-200 hover:shadow-sm" 
                      : "bg-gray-50 border border-gray-200 hover:shadow-sm"
                  }`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      index === 0 ? "bg-red-100" : "bg-gray-200"
                    }`}>
                      {index === 0 ? (
                        <CreditCard className="w-5 h-5 text-red-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm md:text-base ${index === 0 ? "text-red-900" : "text-gray-900"}`}>
                        {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className={`text-xs md:text-sm ${index === 0 ? "text-red-700" : "text-gray-600"}`}>
                        {index === 0 ? "Next EMI Due" : "Scheduled EMI"}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-sm md:text-base ${index === 0 ? "text-red-900" : "text-gray-900"}`}>
                        ₹{loanProgress.emi.toLocaleString()}
                      </p>
                      <p className={`text-xs uppercase tracking-wider font-medium ${
                        index === 0 ? "text-red-700" : "text-gray-600"
                      }`}>
                        {index === 0 ? "Upcoming" : "Scheduled"}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="mt-8 md:mt-10 bg-white p-6 md:p-8 rounded-2xl border border-border card-hover stagger-4 animate-fade-up">
            <h2 className="text-base md:text-lg font-bold uppercase tracking-tight mb-6 md:mb-8">
              Recent Activity
            </h2>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold mb-2">No Activity Yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                Upload your transaction screenshots and utility bills to see your financial activity
              </p>
              <Button onClick={() => router.push('/upload')} className="btn-hover">
                Upload Documents
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <Link 
            href="/loan"
            className="flex items-center justify-between p-6 bg-background rounded-lg border border-border hover:border-foreground/30 transition-colors group"
          >
            <div>
              <h3 className="font-bold uppercase tracking-tight mb-1">
                {hasScore ? 'Apply for New Loan' : 'Get Your Trust Score'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {hasScore 
                  ? `You qualify for up to ₹${displayProfile.loan_eligibility_max.toLocaleString()}`
                  : 'Upload your data to see loan eligibility'}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>

          <Link 
            href="/upload"
            className="flex items-center justify-between p-6 bg-background rounded-lg border border-border hover:border-foreground/30 transition-colors group"
          >
            <div>
              <h3 className="font-bold uppercase tracking-tight mb-1">Improve Your Score</h3>
              <p className="text-sm text-muted-foreground">Add more data to boost eligibility</p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        </div>
      </div>
    </main>
  )
}
