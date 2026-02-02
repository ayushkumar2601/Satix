"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { toast } from "sonner"

const analysisSteps = [
  "Extracting utility payment patterns",
  "Analyzing UPI transaction stability",
  "Calculating location stability metrics",
  "Evaluating social trust signals",
  "Generating AI-powered Trust Score"
]

export default function AnalyzingPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)

    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    if (!user) return

    // Start the calculation process
    const startCalculation = async () => {
      if (calculating) return
      setCalculating(true)

      try {
        console.log('[Analyzing] Starting trust score calculation')
        
        // Call the API to calculate trust score
        const response = await fetch('/api/trust-score/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            seed_demo_data: true // Seed demo data if user has no data
          })
        })

        const data = await response.json()

        if (!response.ok || data.error) {
          throw new Error(data.error || 'Failed to calculate trust score')
        }

        console.log('[Analyzing] Trust score calculated:', data.trust_score)
        
        // Show success toast
        toast.success('Trust Score Calculated!', {
          description: `Your score is ${data.trust_score}`
        })
        
        // Wait for animation to complete before redirecting
        setTimeout(() => {
          router.push('/score')
        }, 1000)

      } catch (err) {
        console.error('[Analyzing] Error:', err)
        const errorMsg = err instanceof Error ? err.message : 'Failed to calculate trust score'
        setError(errorMsg)
        
        // Show error toast
        toast.error('Calculation Error', {
          description: 'Using fallback scoring method'
        })
        
        // Still redirect after error (fallback will be used)
        setTimeout(() => {
          router.push('/score')
        }, 2000)
      }
    }

    // Animate steps
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < analysisSteps.length - 1) {
          return prev + 1
        }
        return prev
      })
    }, 1500)

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev < 95) {
          return prev + 1
        }
        return prev
      })
    }, 80)

    // Start calculation after a short delay
    const calcTimeout = setTimeout(() => {
      startCalculation()
    }, 1000)

    return () => {
      clearInterval(stepInterval)
      clearInterval(progressInterval)
      clearTimeout(calcTimeout)
    }
  }, [router, user, authLoading, calculating])

  return (
    <main className="min-h-screen flex flex-col bg-[var(--cream)]">
      <header className={`px-6 py-4 ${mounted ? "animate-fade-in" : "opacity-0"}`}>
        <Link href="/" className="text-xl font-bold uppercase tracking-tight">
          Satix
        </Link>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl text-center">
          <h1 
            className={`text-4xl sm:text-5xl md:text-6xl font-bold uppercase tracking-tight mb-8 leading-[0.9] ${
              mounted ? "animate-fade-up" : "opacity-0"
            }`}
          >
            Analyzing Your
            <br />
            <span className="text-[var(--red)]">Financial Trust</span>
          </h1>

          {/* Animated Loader with enhanced animation */}
          <div className={`relative w-40 h-40 mx-auto mb-12 ${mounted ? "animate-scale-in stagger-1" : "opacity-0"}`}>
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="6"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${progress * 2.83} 283`}
                className="transition-all duration-150 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span 
                className="text-3xl font-bold transition-all duration-200"
                style={{ 
                  transform: `scale(${1 + (progress % 10 === 0 ? 0.05 : 0)})` 
                }}
              >
                {progress}%
              </span>
            </div>
          </div>

          {/* Steps with enhanced transitions */}
          <div className={`space-y-4 ${mounted ? "animate-fade-up stagger-2" : "opacity-0"}`}>
            {analysisSteps.map((step, index) => (
              <div 
                key={index}
                className={`flex items-center justify-center gap-3 transition-all duration-500 ease-out ${
                  index === currentStep 
                    ? "opacity-100 scale-100" 
                    : index < currentStep 
                      ? "opacity-50 scale-95" 
                      : "opacity-20 scale-95"
                }`}
              >
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                    index < currentStep 
                      ? "bg-foreground text-background" 
                      : index === currentStep
                        ? "bg-foreground/20 border-2 border-foreground"
                        : "bg-muted"
                  }`}
                >
                  {index < currentStep && <Check className="w-3 h-3" />}
                  {index === currentStep && (
                    <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-sm uppercase tracking-wider">
                  {step}
                </span>
              </div>
            ))}
          </div>

          {error && (
            <p className="text-orange-600 text-sm mt-8 animate-fade-in">
              {error} - Using fallback scoring...
            </p>
          )}
          
          <p className={`text-muted-foreground text-sm mt-12 ${mounted ? "animate-fade-in stagger-3" : "opacity-0"}`}>
            Analyzing your financial behavior patterns...
          </p>
        </div>
      </div>
    </main>
  )
}
