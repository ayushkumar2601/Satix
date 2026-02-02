"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Clock, AlertCircle } from "lucide-react"
import { ScoreBreakdown } from "@/components/score/breakdown"
import { ImproveScore } from "@/components/score/improve"
import { ExportPDFButton } from "@/components/score/export-pdf-button"
import { useAuth } from "@/hooks/use-auth"
import { useCounter } from "@/hooks/use-counter"

interface TrustScoreData {
  trust_score: number
  score_breakdown: {
    utility_score: number
    upi_score: number
    location_score: number
    social_score: number
  }
  loan_eligibility_min: number
  loan_eligibility_max: number
  interest_rate: number
  explanations?: {
    utility: string
    upi: string
    location: string
    social: string
  }
  gemini_used?: boolean
  fallback_used?: boolean
}

export default function ScorePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showContent, setShowContent] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [circleProgress, setCircleProgress] = useState(0)
  const [scoreData, setScoreData] = useState<TrustScoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Animated counter for the score
  const animatedScore = useCounter(scoreData?.trust_score || 0, 2000)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!user) return

    // Fetch trust score data
    const fetchScoreData = async () => {
      try {
        const response = await fetch('/api/trust-score/get')
        const data = await response.json()

        if (!response.ok || data.error) {
          // If profile not found, redirect to upload to calculate score
          if (data.error === 'Profile not found' || response.status === 404) {
            console.log('[Score Page] No profile found, redirecting to upload')
            router.push('/upload')
            return
          }
          throw new Error(data.error || 'Failed to fetch trust score')
        }

        setScoreData(data)
        setLoading(false)

      } catch (err) {
        console.error('[Score Page] Error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load trust score')
        setLoading(false)
      }
    }

    fetchScoreData()
  }, [user, authLoading, router])

  useEffect(() => {
    if (!scoreData || loading) return

    const targetScore = scoreData.trust_score

    // Start circle animation
    const circleTimer = setTimeout(() => {
      const circleInterval = setInterval(() => {
        setCircleProgress(prev => {
          if (prev >= (targetScore / 1000) * 100) {
            clearInterval(circleInterval)
            return (targetScore / 1000) * 100
          }
          return prev + 1
        })
      }, 20)
    }, 500)

    // Show content after animation starts
    const contentTimer = setTimeout(() => setShowContent(true), 2000)
    const statsTimer = setTimeout(() => setShowStats(true), 2400)

    return () => {
      clearTimeout(circleTimer)
      clearTimeout(contentTimer)
      clearTimeout(statsTimer)
    }
  }, [scoreData, loading])

  const getRiskCategory = (score: number) => {
    if (score >= 750) return { label: "Excellent", color: "text-green-600" }
    if (score >= 650) return { label: "Good", color: "text-[var(--red)]" }
    if (score >= 550) return { label: "Fair", color: "text-orange-500" }
    return { label: "Building", color: "text-muted-foreground" }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-[var(--cream)]">
        <header className="px-6 py-4 animate-fade-in">
          <Link href="/" className="text-xl font-bold uppercase tracking-tight">
            Satix
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-foreground border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your trust score...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error || !scoreData) {
    return (
      <main className="min-h-screen flex flex-col bg-[var(--cream)]">
        <header className="px-6 py-4 animate-fade-in">
          <Link href="/" className="text-xl font-bold uppercase tracking-tight">
            Satix
          </Link>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Unable to Load Score</h2>
            <p className="text-muted-foreground mb-6">{error || 'Please try again'}</p>
            <Button onClick={() => router.push('/upload')} className="btn-hover">
              Upload Data Again
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const risk = getRiskCategory(scoreData.trust_score)
  const loanRange = {
    min: scoreData.loan_eligibility_min || 0,
    max: scoreData.loan_eligibility_max || 0
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--cream)]">
      <header className="px-6 py-4 animate-fade-in">
        <Link href="/" className="text-xl font-bold uppercase tracking-tight">
          Satix
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground mb-4 animate-fade-up">
              Your Trust Score
            </p>

            {/* Score Circle with enhanced animation */}
            <div className="relative w-64 h-64 mx-auto mb-8 animate-scale-in">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--muted)"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="var(--foreground)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${circleProgress * 2.83} 283`}
                  className="transition-all duration-100 ease-out"
                  style={{ filter: "drop-shadow(0 0 8px rgba(0,0,0,0.1))" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className="text-6xl font-bold tracking-tight transition-all duration-200"
                  style={{ 
                    transform: animatedScore > 0 ? "scale(1)" : "scale(0.9)",
                    opacity: animatedScore > 0 ? 1 : 0.5
                  }}
                >
                  {animatedScore}
                </span>
                <span className="text-sm text-muted-foreground uppercase tracking-wider">out of 1000</span>
              </div>
            </div>

            {/* Risk Category with reveal animation */}
            <div 
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background border border-border transition-all duration-500 ${risk.color} ${
                showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <Shield className="w-5 h-5" />
              <span className="font-bold uppercase tracking-wider">{risk.label} Trust</span>
            </div>

            {/* Gemini/Fallback indicator */}
            {scoreData.fallback_used && (
              <p className="text-xs text-muted-foreground mt-2">
                Score calculated using deterministic model
              </p>
            )}
            {scoreData.gemini_used && (
              <p className="text-xs text-green-600 mt-2">
                ✓ AI-powered scoring active
              </p>
            )}
          </div>

          {/* Loan Eligibility with reveal animation */}
          <div 
            className={`bg-background p-8 rounded-lg border border-border mb-8 card-hover transition-all duration-500 delay-100 ${
              showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h3 className="text-lg font-bold uppercase tracking-tight mb-6 text-center">
              Micro-Loan Eligibility
            </h3>
            
            {loanRange.max > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-[var(--red)]">
                    ₹{loanRange.min.toLocaleString()}
                  </span>
                  <div className="flex-1 h-2 mx-4 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foreground transition-all duration-1000 ease-out"
                      style={{ width: showContent ? "75%" : "0%" }}
                    />
                  </div>
                  <span className="text-3xl font-bold">
                    ₹{loanRange.max.toLocaleString()}
                  </span>
                </div>
                
                <p className="text-center text-muted-foreground text-sm">
                  Based on your Trust Score, you qualify for loans in this range
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-2xl font-bold mb-2">₹0</p>
                <p className="text-muted-foreground text-sm">
                  Upload your financial data to see loan eligibility
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats with staggered reveal */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: TrendingUp, label: "Score Trend", value: "+12%" },
              { icon: Shield, label: "Risk Level", value: "Low" },
              { icon: Clock, label: "Approval", value: "Instant" }
            ].map((stat, index) => (
              <div 
                key={stat.label}
                className={`bg-background p-4 rounded-lg border border-border text-center card-hover transition-all duration-500 ${
                  showStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <stat.icon className="w-5 h-5 mx-auto mb-2 text-[var(--red)]" />
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                <p className="font-bold">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Export PDF Button */}
          {loanRange.max > 0 && (
            <div 
              className={`mb-6 transition-all duration-500 delay-200 ${
                showStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <ExportPDFButton 
                scoreData={{
                  trust_score: scoreData.trust_score,
                  score_breakdown: scoreData.score_breakdown,
                  explanations: scoreData.explanations || {
                    utility: 'No explanation available',
                    upi: 'No explanation available',
                    location: 'No explanation available',
                    social: 'No explanation available'
                  },
                  eligibility: {
                    min_loan: loanRange.min,
                    max_loan: loanRange.max,
                    interest_rate: scoreData.interest_rate || 15
                  }
                }}
                className="w-full py-6 rounded-full uppercase tracking-wider font-semibold"
                size="lg"
              />
            </div>
          )}

          {/* CTA with reveal animation */}
          <div 
            className={`transition-all duration-500 delay-300 ${
              showStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {loanRange.max > 0 ? (
              <>
                <Button
                  onClick={() => router.push("/loan")}
                  className="w-full bg-[var(--red)] hover:bg-[var(--red)]/90 text-primary-foreground py-6 rounded-full uppercase tracking-wider font-semibold text-base group btn-hover"
                >
                  Select Your Loan Amount
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full mt-4 py-4 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Go to Dashboard Instead
                </button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => router.push("/upload")}
                  className="w-full bg-[var(--red)] hover:bg-[var(--red)]/90 text-primary-foreground py-6 rounded-full uppercase tracking-wider font-semibold text-base group btn-hover"
                >
                  Upload Data to Get Score
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="w-full mt-4 py-4 text-sm uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  Go to Dashboard
                </button>
              </>
            )}
          </div>

          {/* Score Breakdown Section */}
          <ScoreBreakdown 
            scores={scoreData.score_breakdown}
            explanations={scoreData.explanations}
          />

          {/* Improve Score Section */}
          <ImproveScore />
        </div>
      </div>
    </main>
  )
}
