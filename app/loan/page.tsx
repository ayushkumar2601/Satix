"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Info } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useSessionData } from "@/hooks/use-session-data"
import { createLoan } from "@/lib/auth/actions"

export default function LoanPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { data: sessionData, updateData } = useSessionData()
  const [amount, setAmount] = useState([sessionData.selectedLoan?.amount || 25000])
  const [tenure, setTenure] = useState([sessionData.selectedLoan?.tenure || 6])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const minAmount = 10000
  const maxAmount = 50000
  const interestRate = 12 // Annual rate

  // Calculate EMI
  const calculateEMI = (principal: number, months: number, rate: number) => {
    const monthlyRate = rate / 12 / 100
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                (Math.pow(1 + monthlyRate, months) - 1)
    return Math.round(emi)
  }

  const emi = calculateEMI(amount[0], tenure[0], interestRate)
  const totalPayment = emi * tenure[0]
  const totalInterest = totalPayment - amount[0]

  const handleApply = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    setIsLoading(true)
    try {
      // Save loan to session
      updateData({
        selectedLoan: {
          amount: amount[0],
          tenure: tenure[0],
          emi,
        },
      })

      // Create loan in Supabase
      const result = await createLoan(user.id, amount[0], tenure[0], emi)
      
      if (result.success) {
        console.log('[v0] Loan created:', result.data)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1000)
      } else {
        console.error('[v0] Failed to create loan:', result.error)
        setIsLoading(false)
      }
    } catch (error) {
      console.error('[v0] Loan application error:', error)
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-[var(--cream)]">
      {/* Header - Mobile Sticky */}
      <header className="sticky top-0 z-40 bg-[var(--cream)]/95 backdrop-blur-sm px-4 md:px-6 py-4 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="text-lg md:text-xl font-bold uppercase tracking-tight">
          Satix
        </Link>
        <Link href="/score" className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 md:px-6 py-8">
        {/* Heading */}
        <div className="text-center mb-8 animate-fade-up">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-balance mb-3 md:mb-4 leading-tight">
            Choose Your Loan
          </h1>
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
            Slide to select amount and tenure. See your EMI in real-time.
          </p>
        </div>

        {/* Loan Calculator Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl border border-border card-hover stagger-1 animate-fade-up mb-8 flex-1">
          {/* Loan Amount Slider */}
          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs md:text-sm uppercase tracking-wider font-medium text-muted-foreground">
                Loan Amount
              </label>
              <span className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-300">
                ₹{amount[0].toLocaleString()}
              </span>
            </div>
            <Slider
              value={amount}
              onValueChange={setAmount}
              min={minAmount}
              max={maxAmount}
              step={1000}
              className="py-3 md:py-4 transition-all duration-200"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-3">
              <span>₹{minAmount.toLocaleString()}</span>
              <span>₹{maxAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Tenure Slider */}
          <div className="mb-8 md:mb-10">
            <div className="flex items-center justify-between mb-4">
              <label className="text-xs md:text-sm uppercase tracking-wider font-medium text-muted-foreground">
                Repayment Tenure
              </label>
              <span className="text-2xl md:text-3xl font-bold text-foreground transition-all duration-300">
                {tenure[0]} <span className="text-base md:text-lg">months</span>
              </span>
            </div>
            <Slider
              value={tenure}
              onValueChange={setTenure}
              min={3}
              max={12}
              step={1}
              className="py-3 md:py-4 transition-all duration-200"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-3">
              <span>3 months</span>
              <span>12 months</span>
            </div>
          </div>

          {/* EMI Breakdown */}
          <div className="border-t border-border pt-6 md:pt-8">
            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="bg-gradient-to-br from-red-50 to-red-25 p-4 md:p-5 rounded-xl border border-red-200/50 transition-all duration-200">
                <p className="text-xs uppercase tracking-wider text-red-700 font-medium mb-2">
                  Monthly EMI
                </p>
                <p className="text-2xl md:text-3xl font-bold text-red-600 transition-all duration-300">
                  ₹{emi.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-4 md:p-5 rounded-xl border border-blue-200/50 transition-all duration-200">
                <p className="text-xs uppercase tracking-wider text-blue-700 font-medium mb-2">
                  Interest Rate
                </p>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">
                  {interestRate}% <span className="text-base md:text-lg font-normal">p.a.</span>
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-2 md:space-y-3 text-sm md:text-base">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Principal Amount</span>
                <span className="font-medium">₹{amount[0].toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Interest</span>
                <span className="font-medium text-red-600">₹{totalInterest.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border text-base md:text-lg">
                <span className="font-semibold">Total Payment</span>
                <span className="font-bold">₹{totalPayment.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Transparency Note */}
          <div className="flex items-start gap-3 p-4 md:p-5 bg-blue-50 border border-blue-200/50 rounded-xl card-hover stagger-2 animate-fade-up mb-6 md:mb-8 transition-all duration-200">
            <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600" />
            <div className="text-sm md:text-base">
              <p className="font-semibold mb-1 text-blue-900">100% Transparent Pricing</p>
              <p className="text-blue-700 leading-relaxed">
                No hidden fees. No processing charges. What you see is what you pay.
              </p>
            </div>
          </div>

          {/* Apply Button */}
          <div className="space-y-3 md:space-y-4">
            <Button
              onClick={handleApply}
              disabled={isLoading}
              className="w-full bg-foreground text-white hover:bg-foreground/90 disabled:bg-gray-300 py-4 md:py-6 rounded-xl md:rounded-full uppercase tracking-wider font-semibold text-base md:text-lg btn-hover group transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <span className="inline-block animate-spin mr-2">⟳</span>
                  Processing...
                </>
              ) : (
                <>
                  Apply for This Loan
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <p className="text-center text-xs md:text-sm text-muted-foreground leading-relaxed">
              By applying, you agree to our{" "}
              <Link href="/terms" className="text-[var(--red)] hover:underline font-medium">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-[var(--red)] hover:underline font-medium">Privacy Policy</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
